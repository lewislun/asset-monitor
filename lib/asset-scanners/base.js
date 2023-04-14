import { BiMap } from 'mnemonist'

import * as constants from '../constants.js'
import * as types from '../types.js'
import PriceAggregator from '../price-aggregator.js'
import { createLogger, BaseService } from '../utils/index.js'
import { AssetQuery } from '../models/index.js'

/**
 * @typedef {import('../utils').RateLimiterOpts} RateLimiterOpts
 * @typedef {import('../utils').ServiceParamDict} ServiceParamDict
 */

const logger = createLogger('AssetScanner')

export default class BaseAssetScanner extends BaseService {

	/** @protected @type {string[]} */							static requiredQueryKeys = [ 'addr' ]
	/** @protected @type {string} */							static nativeTokenAssetId = '__NATIVE__'
	/** @type {types.Chain} */									chain
	/** @protected @type {BiMap<types.AssetCode, string>} */	assetIdByCode = new BiMap()
	/** @protected @type {PriceAggregator} */					priceAggregator

	/**
	 * @param {PriceAggregator} priceAggregator
	 * @param {types.Chain} chain
	 * @param {BiMap} [assetInfoMap]
	 * @param {ServiceParamDict} [paramDict]
	 * @param {RateLimiterOpts} [rateLimitOpts={}]
	 */
	constructor(priceAggregator, chain, assetInfoMap, paramDict, rateLimitOpts = {}) {
		if (paramDict?.rateLimiterKey) {
			rateLimitOpts.instanceKey = paramDict.rateLimiterKey
		} else if (paramDict?.endpoint) {
			rateLimitOpts.instanceKey = paramDict.endpoint
		} else if (paramDict?.apiKey) {
			rateLimitOpts.instanceKey = paramDict.apiKey
		}
		super(paramDict, rateLimitOpts)
		this.chain = chain
		this.assetIdByCode = assetInfoMap ?? this.assetIdByCode
		this.priceAggregator = priceAggregator
	}

	get nativeTokenCode() {
		const code = this.assetIdByCode.inverse.get(BaseAssetScanner.nativeTokenAssetId)
		if (!code) throw new Error(`Missing native token asset code - chain: ${this.chain}`)
		return code
	}

	/**
	 * @public
	 * @param {AssetQuery} query
	 * @returns {Promise<types.AssetQueryResult[]>}
	 */
	async query(query) {
		await this.initPromise

		// check if all required query keys are present
		if (!Array.isArray(this.constructor.requiredQueryKeys)) {
			logger.warn(`Missing requiredQueryKeys or requiredQueryKeys is not an array - scannerClass: ${this.constructor.name}`)
		} else {
			this.constructor.requiredQueryKeys.forEach(key => {
				if (query[key] === undefined || query[key] === null) throw new Error(`Missing query field: ${key} - scannerClass: ${this.constructor.name}`)
			})
		}

		// Do query
		const startTime = new Date().getTime()
		logger.debug(`Start querying asset - scanner: ${this.constructor.name}, queryId: ${query.id}`)
		const checkStuckLogInterval = setInterval(() => {
			logger.info(`Still querying asset - scanner: ${this.constructor.name}, timeUsed: ${(new Date).getTime() - startTime}ms, queryId: ${query.id}`)
		}, 10000)
		const results = await this._query(query)

		// Patch results
		results.forEach(result => {
			// inject extra tags
			if (query.extra_tag_map) result.tagMap = { ...query.extra_tag_map, ...(result.tagMap ?? {}) }

			// patch chain
			if (!result.chain) result.chain = this.chain

			// patch accountId
			if (!result.accountId) {
				result.accountId = query.addr ?? query.apiKey ?? query.apiSecret
				// mask apiSecret
				if (result.accountId === query.api_secret) {
					result.accountId = result.accountId.substring(0, 3) + '*'.repeat(result.accountId.length - 3)
				}
			}

			// patch groupSpecifier
			if (!result.groupSpecifier) result.groupSpecifier = query.group_id ?? constants.DEFAULT_ASSET_GROUP_NAME
		})

		clearInterval(checkStuckLogInterval)
		logger.debug(`Finished querying asset - scanner: ${this.constructor.name}, timeUsed: ${(new Date).getTime() - startTime}ms, queryId: ${query.id}`)
		return results
	}

	/**
	 * @protected
	 * @abstract
	 * @param {AssetQuery} assetQuery
	 * @returns {Promise<types.AssetQueryResult[]>}
	 */
	async _query(assetQuery) {
		throw new Error('not implemented')
	}
}