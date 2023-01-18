'use strict'

/**
 * @typedef {import('../rate-limiter').RateLimiterOpts} RateLimiterOpts
 */

import RateLimiter from './rate-limiter.js'
import { createLogger } from './logger.js'

const logger = createLogger('BaseService')

/**
 * @abstract
 */
export default class BaseService {

	/** @protected @type {RateLimiter} */		rateLimiter
	/** @protected @type {boolean} */			isInitialized = false
	/** @protected @type {boolean} */			isClosed = false
	/** @protected @type {Promise<void>} */		initPromise
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

	/**
	 * @public
	 */
	async close() {
		this.rateLimiter.stop()
		this.isClosed = true
		logger.debug(`Service closed - name: ${this.constructor.name}`)
	}
}