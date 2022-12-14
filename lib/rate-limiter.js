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
 * @property {number} [retryCount]
 * @property {number} [retryBackoffMs]
 */

export default class RateLimiter {
	/** @type {RateLimitedJob[]} */		queue = []
	/** @type {number} */				callIntervalMs = 100
	/** @type {number} */				retryCount = 5
	/** @type {NodeJS.Timeout} */		jobLoop

	/**
	 * @param {RateLimiterOpts} [opts]
	 */
	constructor(opts = {}) {
		this.retryCount = opts.retryCount
		if (opts.callPerSec) {
			this.callIntervalMs = 1000 / opts.callPerSec
		}

		if (this.callIntervalMs) {
			this.jobLoop = setInterval(async () => {
				if (this.queue.length === 0) return
				let job = this.queue.shift()
				try {
					job.callback(await job.func())
				} catch (e) {
					if (job.retryCount >= this.retryCount) {
						logger.warn(`RateLimitJob execution failed with exception: ${e}, rejecting this job... (func: ${job.name}, retryCount: ${job.retryCount})`)
						job.errCallback(e)
						return
					}
					logger.warn(`RateLimitJob execution failed with exception: ${e}, pushing it back to queue to retry... (func: ${job.name}, retryCount: ${job.retryCount})`)
					job.retryCount++
					this.queue.push(job)
				}
			}, this.callIntervalMs)
		}
	}

	// TODO: clear interval

	/**
	 * Accepts both sync and async functions.
	 * 
	 * @public
	 * @template T
	 * @param {() => T} func
	 * @returns {Promise<T>}
	 */
	async exec(func) {
		if (this.jobLoop) {
			let callback, errCallback
			/** @type {Promise<T>} */
			let promise = new Promise((resolve, reject) => {
				callback = resolve
				errCallback = reject
			})
			this.queue.push({ func, callback, errCallback })
			return await promise

		// ignore queue if jobLoop is undefined (i.e. not rate limited)
		} else {
			return await func()
		}
	}
}