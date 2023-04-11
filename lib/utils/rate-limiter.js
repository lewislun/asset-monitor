import { createLogger } from './logger.js'
import { sleep } from './common.js'

/**
 * @typedef RateLimitedJob<T>
 * @property {string} name
 * @property {() => T} func
 * @property {(T) => void} callback
 * @property {(err: Error) => void} errCallback
 * @property {number} retryCount
 * 
 * @typedef RateLimiterOpts
 * @property {number} [callPerSec]
 * @property {string} [instanceKey]
 * @property {number} [retryCount]
 * @property {number} [onErrPauseTimeMs]
 */

const logger = createLogger('RateLimiter')

export default class RateLimiter {

	/** @type {Map<string, RateLimiter>} */		static instanceMap = new Map()

	/** @type {string} */						instanceKey
	/** @type {RateLimitedJob[]} */				queue = []
	/** @type {number} */						callIntervalMs = 200
	/** @type {number} */						retryCount = 4
	/** @type {number} */						onErrPauseTimeMs = 500
	/** @type {number} */						timeoutMs = 10000
	/** @type {boolean} */						isLoopRunning = false
	/** @protected @type {NodeJS.Timeout} */	nextIteration

	/**
	 * Get an initialized RateLimiter by opts.instanceKey. If it does not exist, create one. This is useful for sharing RateLimiter if the same endpoint is used.
	 * 
	 * @static
	 * @public
	 * @param {RateLimiterOpts} [opts={}]
	 * @returns {RateLimiter}
	 */
	static getInstance(opts = {}) {
		// create a new one if instanceKey is not set
		const instanceKey = opts?.instanceKey
		if (!instanceKey) {
			return new RateLimiter(opts)
		}

		const instance = this.instanceMap.get(instanceKey)
		if (instance) {
			return instance
		}

		const newInstance = new RateLimiter(opts)
		this.instanceMap.set(instanceKey, newInstance)
		return newInstance
	}

	/**
	 * @param {RateLimiterOpts} [opts]
	 */
	constructor(opts = {}) {
		this.instanceKey = opts.instanceKey
		this.retryCount = opts.retryCount ?? this.retryCount
		this.onErrPauseTimeMs = opts.onErrPauseTimeMs ?? this.onErrPauseTimeMs
		if (opts.callPerSec) {
			this.callIntervalMs = 1000 / opts.callPerSec
		}

		if (this.callIntervalMs) {
			this.start()
		}
	}

	/**
	 * @public
	 */
	start() {
		if (!this.callIntervalMs) {
			throw new Error('Cannot start jobLoop with callIntervalMs === 0 or undefined.')
		}
		if (this.isLoopRunning) {
			logger.warn('jobLoop is already running.')
			return
		}

		this.isLoopRunning = true
		this.loop()
	}

	/**
	 * @protected
	 */
	async loop() {
		while (this.queue.length === 0 && this.isLoopRunning) {
			await sleep(100)
		}
		if (this.queue.length > 0) {
			this.processJob(this.queue.shift())
		}
		if (this.isLoopRunning) {
			this.nextIteration = setTimeout(() => this.loop(), this.callIntervalMs)
		}
	}

	/**
	 * Stop the jobLoop. No-op if the loop is not running.
	 * 
	 * @public
	 */
	stop() {
		this.isLoopRunning = false
		if (this.nextIteration) {
			clearTimeout(this.nextIteration)
			this.nextIteration = undefined
		}
	}

	/**
	 * @public
	 * @param {number} pauseTimeMs
	 */
	pause(pauseTimeMs) {
		this.stop()
		this.nextIteration = setTimeout(() => this.start(), pauseTimeMs)
	}

	/**
	 * @protected
	 * @param {RateLimitedJob} job
	 */
	async processJob(job) {
		try {
			const result = await Promise.race([
				job.func(),
				new Promise((_, reject) => setTimeout(() => reject(new Error('RateLimitJob timed out.')), this.timeoutMs))
			])
			job.callback(result)
		} catch (e) {
			if (job.retryCount >= this.retryCount) {
				logger.warn(`RateLimitJob execution failed with exception: ${e}, rejecting this job... (instanceKey: ${this.instanceKey}, retryCount: ${job.retryCount})`)
				job.errCallback(e)
				return
			}
			const retryCount = job.retryCount ?? 0
			const pauseTimeMs = this.onErrPauseTimeMs * Math.pow(2, retryCount)
			logger.warn(`RateLimitJob execution failed with exception: ${e}, pushing it back to queue to retry... (instanceKey: ${this.instanceKey}, retryCount: ${retryCount}, pauseTimeMs: ${pauseTimeMs}, queueLength: ${this.queue.length})`)
			job.retryCount = job.retryCount? job.retryCount + 1 : 1
			this.queue.push(job)
			if (this.isLoopRunning) {
				this.pause(pauseTimeMs)
			}
		}
	}

	/**
	 * Accepts both sync and async functions.
	 * 
	 * @public
	 * @template T
	 * @param {() => Promise<T>} func
	 * @param {string} name
	 * @returns {Promise<T>}
	 */
	async exec(func, name = undefined) {
		if (this.callIntervalMs) {
			let callback, errCallback
			/** @type {Promise<T>} */
			let promise = new Promise((resolve, reject) => {
				callback = resolve
				errCallback = reject
			})
			this.queue.push({ func, callback, errCallback, name })
			return await promise

		// ignore queue if callIntervalMs is undefined or 0 (i.e. not rate limited)
		} else {
			return await func()
		}
	}
}