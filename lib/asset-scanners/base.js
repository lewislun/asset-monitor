'use strict'

/**
 * @typedef {import('../utils').RateLimiterOpts} RateLimiterOpts
 */

import * as types from '../types.js'
import * as enums from '../enums.js'
import { logger, BaseService, PriceAggregator } from '../utils/index.js'

export default class BaseAssetScanner extends BaseService {

	/** @type {enums.Chain} */					static chain = undefined

	/** @protected @type {PriceAggregator} */	priceAggregator

	/**
	 * @param {PriceAggregator} priceAggregator
	 * @param {RateLimiterOpts} [rateLimitOpts={}]
	 */
	constructor(priceAggregator, rateLimitOpts = {}) {
		super(rateLimitOpts)
		this.priceAggregator = priceAggregator
	}

	/**
	 * @public
	 * @param {types.AssetQuery} assetQuery
	 * @returns {Promise<types.AssetQueryResult[]>}
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
	 * @returns {Promise<types.AssetQueryResult[]>}
	 */
	async _query(assetQuery) {
		throw new Error('not implemented')
	}
}