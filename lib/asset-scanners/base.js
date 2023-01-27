'use strict'

import { BiMap } from 'mnemonist'

import * as types from '../types.js'
import * as enums from '../enums.js'
import PriceAggregator from '../price-aggregator.js'
import { createLogger, BaseService } from '../utils/index.js'

/**
 * @typedef {import('../utils').RateLimiterOpts} RateLimiterOpts
 * 
 * @typedef Params
 * @property {string} [rateLimiterKey]
 * @property {string} [endpoint]
 * @property {string} [apiKey]
 */

const logger = createLogger('AssetScanner')

export default class BaseAssetScanner extends BaseService {

	/** @static @prtected @type {string} */						static nativeTokenAssetId = '__NATIVE__'
	/** @static @type {string[]} */								static requiredParamkeys = []
	/** @type {types.Chain} */									chain
	/** @protected @type {Params} */							params
	/** @protected @type {BiMap<types.AssetCode, string>} */	assetIdByCode = new BiMap()
	/** @protected @type {PriceAggregator} */					priceAggregator

	/**
	 * @param {PriceAggregator} priceAggregator
	 * @param {types.Chain} chain
	 * @param {AssetInfoMap} [assetIdByCode]
	 * @param {Params} [params]
	 * @param {RateLimiterOpts} [rateLimitOpts={}]
	 */
	constructor(priceAggregator, chain, assetIdByCode, params, rateLimitOpts = {}) {
		if (params?.rateLimiterKey) {
			rateLimitOpts.instanceKey = params.rateLimiterKey
		} else if (params?.endpoint) {
			rateLimitOpts.instanceKey = params.endpoint
		} else if (params?.apiKey) {
			rateLimitOpts.instanceKey = params.apiKey
		}
		super(rateLimitOpts)
		this.chain = chain
		this.params = params
		this.assetIdByCode = assetIdByCode ?? this.assetIdByCode
		this.priceAggregator = priceAggregator
	}

	get nativeTokenCode() {
		const code = this.assetIdByCode.inverse.get(BaseAssetScanner.nativeTokenAssetId)
		if (!code) throw new Error(`Missing native token asset code - chain: ${this.chain}`)
		return code
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