'use strict'

import * as types from '../types.js'
import * as enums from '../enums.js'
import PriceAggregator from '../price-aggregator.js'
import { createLogger, BaseService } from '../utils/index.js'

/**
 * @typedef {import('../utils').RateLimiterOpts} RateLimiterOpts
 * 
 * @typedef {Map<enums.AssetCode, any>} AssetInfoMap info content depends on chain nature
 * 
 * @typedef Params
 * @property {string} [endpoint]
 * @property {string} [apiKey]
 */

const logger = createLogger('AssetScanner')

export default class BaseAssetScanner extends BaseService {

	/** @type {enums.Chain} */								chain
	/** @protected @type {Params} */						params
	/** @protected @type {Map<enums.AssetCode, string>} */	assetInfoMap
	/** @protected @type {PriceAggregator} */				priceAggregator

	/**
	 * @param {PriceAggregator} priceAggregator
	 * @param {enums.Chain} chain
	 * @param {AssetInfoMap} [assetInfoMap] defined and consumed by child
	 * @param {Params} [params] defined and consumed by child
	 * @param {RateLimiterOpts} [rateLimitOpts={}]
	 */
	constructor(priceAggregator, chain, assetInfoMap, params, rateLimitOpts = {}) {
		if (params?.endpoint) {
			rateLimitOpts.instanceKey = params.endpoint
		} else if (params?.apiKey) {
			rateLimitOpts.instanceKey = params.apiKey
		}
		super(rateLimitOpts)
		this.chain = chain
		this.params = params
		this.assetInfoMap = assetInfoMap
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
		if (assetQuery.extraTagMap) {
			results.forEach(result => result.tagMap = { ...assetQuery.extraTagMap, ...(result.tagMap ?? {}) })
		}
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