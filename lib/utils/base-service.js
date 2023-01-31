/**
 * @typedef {import('../rate-limiter').RateLimiterOpts} RateLimiterOpts
 */

import RateLimiter from './rate-limiter.js'
import { createLogger } from './logger.js'

/**
 * @typedef ServiceParamDict
 * @property {string} [rateLimiterKey]
 * @property {string} [endpoint]
 * @property {string} [apiKey]
 */

const logger = createLogger('BaseService')

/**
 * @abstract
 */
export default class BaseService {

	/** @protected @type {string[]} */			static requiredParamKeys = []
	/** @protected @type {ServiceParamDict} */	paramDict = {}
	/** @protected @type {RateLimiter} */		rateLimiter
	/** @protected @type {boolean} */			isInitialized = false
	/** @protected @type {boolean} */			isClosed = false
	/** @protected @type {Promise<void>} */		initPromise
	/** @private @type {function} */			initPromiseResolve

	/**
	 * @param {ServiceParamDict} paramDict
	 * @param {RateLimiterOpts} rateLimiterOpts
	 */
	constructor(paramDict, rateLimiterOpts) {
		this.rateLimiter = RateLimiter.getInstance(rateLimiterOpts)
		this.paramDict = paramDict
		this.initPromise = new Promise(resolve => { this.initPromiseResolve = resolve })
		this.init()
	}

	/**
	 * @public
	 */
	async init() {
		if (this.isInitialized) return

		// check if all required params exist
		for (const requiredParamKey of this.constructor.requiredParamKeys) {
			if (this.paramDict[requiredParamKey] === undefined) {
				throw new errors.MissingParamError(this.constructor.name, requiredParamKey)
			}
		}

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