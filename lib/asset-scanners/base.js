'use strict'

/**
 * @typedef {import('../rate-limiter').RateLimiterOpts} RateLimiterOpts
 */

import RateLimiter from '../rate-limiter.js'
import PriceAggregator from '../price-aggregator.js'
import * as types from '../types.js'
import * as enums from '../enums.js'
import logger from '../logger.js'

export default class BaseAssetScanner {

	/** @type {enums.Chain} */				static chain = undefined

	/** @protected @type {RateLimiter} */		rateLimiter
	/** @protected @type {PriceAggregator} */	priceAggregator
	/** @protected @type {boolean} */			isInitialized = false
	/** @protected @type {Promise} */			initPromise
	/** @protected @type {function} */			initPromiseResolve

	/**
	 * @param {PriceAggregator} priceAggregator
	 * @param {RateLimiterOpts} [rateLimitOpts={}]
	 */
	constructor(priceAggregator, rateLimitOpts) {
		this.priceAggregator = priceAggregator
		this.rateLimiter = new RateLimiter(rateLimitOpts)
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
	 * @param {types.AssetQuery} assetQuery
	 * @returns {Promise<types.AssetResult[]>}
	 */
	async query(assetQuery) {
		await this.initPromise

		const startTime = new Date().getTime()
		logger.debug(`Start querying asset - scanner: ${this.constructor.name}, query: ${JSON.stringify(assetQuery, undefined, 2)}`)
		const results = await this._query(assetQuery)
		logger.debug(`Finished querying asset - scanner: ${this.constructor.name}, timeUsed: ${(new Date).getTime() - startTime}ms, query: ${JSON.stringify(assetQuery, undefined, 2)}`)
		return results
	}

	/**
	 * @protected
	 * @abstract
	 * @param {types.AssetQuery} assetQuery
	 * @returns {Promise<types.AssetResult[]>}
	 */
	async _query(assetQuery) {
		throw new Error('not implemented')
	}
}