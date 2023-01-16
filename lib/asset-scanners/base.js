'use strict'

import * as types from '../types.js'
import * as enums from '../enums.js'
import PriceAggregator from '../price-aggregator.js'
import { logger, BaseService } from '../utils/index.js'

/**
 * @typedef {import('../utils').RateLimiterOpts} RateLimiterOpts
 * 
 * @typedef {Map<enums.AssetCode, any>} AssetInfoMap info content depends on chain nature
 */

export default class BaseAssetScanner extends BaseService {

	/** @protected @type {PriceAggregator} */	priceAggregator
	/** @type {enums.Chain} */					chain

	/**
	 * @param {PriceAggregator} priceAggregator
	 * @param {enums.Chain} chain
	 * @param {AssetInfoMap} [assetInfoMap] defined and consumed by child
	 * @param {object} [params] defined and consumed by child
	 * @param {RateLimiterOpts} [rateLimitOpts={}]
	 */
	constructor(priceAggregator, chain, assetInfoMap, params, rateLimitOpts = {}) {
		super(rateLimitOpts)
		this.chain = chain
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