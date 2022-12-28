'use strict'

import logger from './logger.js'

/**
 * @typedef RateLimitedJob<T>
 * @property {string} name
 * @property {() => T} func
 * @property {(T) => void} callback
 * @property {(err: Error) => void} errCallback
 * @property {number} retryCount
 * 
 * @typedef RateLimiterOpts
 * @property {string} [instanceKey]
 * @property {number} [retryCount]
 * @property {number} [retryBackoffMs]
 * @property {number} [onErrPauseTimeMs]
 */

export default class RateLimiter {

	/** @type {Map<string, RateLimiter>} */		static instanceMap = new Map()

	/** @type {RateLimitedJob[]} */				queue = []
	/** @type {number} */						callIntervalMs = 100
	/** @type {number} */						retryCount = 5
	/** @type {number} */						onErrPauseTimeMs = 500
	/** @type {NodeJS.Timeout} */				jobLoop

	/**
	 * @param {RateLimiterOpts} [opts]
	 */
	constructor(opts = {}) {
		this.retryCount = opts.retryCount ?? this.retryCount
		this.onErrPauseTimeMs = opts.onErrPauseTimeMs ?? this.onErrPauseTimeMs
		if (opts.callPerSec) {
			this.callIntervalMs = 1000 / opts.callPerSec
		}

		if (this.callIntervalMs) {
			this.startLoop()
		}
	}

	/**
	 * @protected
	 */
	startLoop() {
		if (!this.callIntervalMs) {
			throw new Error('Cannot start jobLoop with callIntervalMs === 0 or undefined.')
		}
		if (this.jobLoop) {
			logger.warn('jobLoop is already running.')
			return
		}

		this.jobLoop = setInterval(async () => {
			if (this.queue.length === 0) return
			let job = this.queue.shift()
			try {
				job.callback(await job.func())
			} catch (e) {
				if (job.retryCount >= this.retryCount) {
					logger.warn(`RateLimitJob execution failed with exception: ${e}, rejecting this job... (name: ${job.name}, retryCount: ${job.retryCount})`)
					job.errCallback(e)
					return
				}
				logger.warn(`RateLimitJob execution failed with exception: ${e}, pushing it back to queue to retry... (name: ${job.name}, retryCount: ${job.retryCount})`)
				job.retryCount = job.retryCount? job.retryCount + 1 : 1
				this.queue.push(job)
				this.pauseLoop(this.onErrPauseTimeMs)
			}
		}, this.callIntervalMs)
	}

	/**
	 * @protected
	 */
	stopLoop() {
		if (!this.jobLoop) {
			throw new Error('JobLoop is not running.')
		}
		
		clearInterval(this.jobLoop)
		this.jobLoop = undefined
	}

	/**
	 * @protected
	 * @param {number} pauseTimeMs
	 */
	pauseLoop(pauseTimeMs) {
		this.stopLoop()
		setTimeout(() => this.startLoop(), pauseTimeMs)
	}

	/**
	 * Get an initizalized RateLimiter by opts.instanceKey. If it does not exist, create one. This is useful for sharing RateLimiter if the same endpoint is used.
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
	 * Accepts both sync and async functions.
	 * 
	 * @public
	 * @template T
	 * @param {() => T} func
	 * @returns {Promise<T>}
	 */
	async exec(func) {
		if (this.callIntervalMs) {
			let callback, errCallback
			/** @type {Promise<T>} */
			let promise = new Promise((resolve, reject) => {
				callback = resolve
				errCallback = reject
			})
			this.queue.push({ func, callback, errCallback })
			return await promise

		// ignore queue if callIntervalMs is undefined or 0 (i.e. not rate limited)
		} else {
			return await func()
		}
	}

	// TODO: clear interval
}