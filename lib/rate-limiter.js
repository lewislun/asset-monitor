'use strict'

import logger from './logger.js'

/**
 * @typedef RateLimitedJob<T>
 * @property {string} name
 * @property {() => T} func
 * @property {(T) => void} callback
 * @property {(err: Error) => void} errCallback
 * @property {number} retryCount
 */

export default class RateLimiter {
	
	/** @type {RateLimitedJob[]} */		queue = []
	/** @type {number} */				callIntervalMs
	/** @type {number} */				retryCount
	/** @type {NodeJS.Timeout} */		jobLoop

	/**
	 * @param {number} [retryCount=5]
	 * @param {number} [retryBackoffMs=500]
	 */
	constructor(callPerSec = 10, retryCount = 5) {
		this.callIntervalMs = 1000 / callPerSec
		this.retryCount = retryCount

		this.jobLoop = setInterval(async () => {
			if (this.queue.length === 0) return
			let job = this.queue.shift()
			try {
				job.callback(await job.func())
			} catch (e) {
				if (job.retryCount >= retryCount) {
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
		let callback, errCallback
		/** @type {Promise<T>} */
		let promise = new Promise((resolve, reject) => {
			callback = resolve
			errCallback = reject
		})
		this.queue.push({ func, callback, errCallback })
		return await promise
	}
}