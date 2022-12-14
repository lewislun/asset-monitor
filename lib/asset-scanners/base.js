'use strict'

/**
 * @typedef {import('../rate-limiter').RateLimiterOpts} RateLimiterOpts
 */

import RateLimiter from '../rate-limiter.js'
import PriceAggregator from '../price-aggregator.js'
import * as types from '../types.js'
import * as enums from '../enums.js'

export default class BaseAssetScanner {

	/** @type {enums.Chain} */			static chain = undefined

	/** @type {RateLimiter} */			rateLimiter
	/** @type {PriceAggregator} */		priceAggregator

	/**
	 * @param {PriceAggregator} priceAggregator
	 * @param {RateLimiterOpts} [rateLimitOpts={}]
	 */
	constructor(priceAggregator, rateLimitOpts) {
		this.priceAggregator = priceAggregator
		this.rateLimiter = new RateLimiter(rateLimitOpts)
	}

	/**
	 * @abstract
	 * @param {types.AssetQuery} assetQuery
	 * @returns {Promise<types.AssetResult[]>}
	 */
	async query(assetQuery) {
		throw new Error('not implemented')
	}
}