'use strict'

/**
 * @typedef {import('../rate-limiter').RateLimiterOpts} RateLimiterOpts
 */

import RateLimiter from './rate-limiter.js'

/**
 * @abstract
 */
export default class BaseService {

	/** @protected @type {RateLimiter} */		rateLimiter
	/** @protected @type {boolean} */			isInitialized = false
	/** @private @type {Promise} */				initPromise
	/** @private @type {function} */			initPromiseResolve

	/**
	 * @param {RateLimiterOpts} rateLimiterOpts
	 */
	constructor(rateLimiterOpts) {
		this.rateLimiter = RateLimiter.getInstance(rateLimiterOpts)
		this.initPromise = new Promise(resolve => { this.initPromiseResolve = resolve })
		this.init()
	}

	/**
	 * @public
	 */
	async init() {
		if (this.isInitialized) return
		await this._init()
		this.isInitialized = true
		this.initPromiseResolve()
	}

	/**
	 * @protected
	 * @abstract
	 */
	async _init() {}
}