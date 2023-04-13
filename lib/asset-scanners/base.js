import { BiMap } from 'mnemonist'

import * as constants from '../constants.js'
import * as types from '../types.js'
import PriceAggregator from '../price-aggregator.js'
import { createLogger, BaseService } from '../utils/index.js'

/**
 * @typedef {import('../utils').RateLimiterOpts} RateLimiterOpts
 * @typedef {import('../utils').ServiceParamDict} ServiceParamDict
 */

const logger = createLogger('AssetScanner')

export default class BaseAssetScanner extends BaseService {

	/** @protected @type {string[]} */							static requiredQueryKeys = ['addr']
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
	 * @param {types.AssetQuery} assetQuery
	 * @returns {Promise<types.AssetQueryResult[]>}
	 */
	async query(assetQuery) {
		await this.initPromise

		// check if all required query keys are present
		if (!Array.isArray(this.constructor.requiredQueryKeys)) {
			logger.warn(`Missing requiredQueryKeys or requiredQueryKeys is not an array - scannerClass: ${this.constructor.name}`)
		} else {
			this.constructor.requiredQueryKeys.forEach(key => {
				if (assetQuery[key] === undefined) throw new Error(`Missing query field: ${key} - scannerClass: ${this.constructor.name}`)
			})
		}

		// Do query
		const startTime = new Date().getTime()
		logger.debug(`Start querying asset - scanner: ${this.constructor.name}, query: ${JSON.stringify(assetQuery, undefined, 2)}`)
		const checkStuckLogInterval = setInterval(() => {
			logger.info(`Still querying asset - scanner: ${this.constructor.name}, timeUsed: ${(new Date).getTime() - startTime}ms, query: ${JSON.stringify(assetQuery, undefined, 2)}`)
		}, 10000)
		const results = await this._query(assetQuery)

		// Patch results
		results.forEach(result => {
			// inject extra tags
			if (assetQuery.extraTagMap) result.tagMap = { ...assetQuery.extraTagMap, ...(result.tagMap ?? {}) }

			// patch chain
			if (!result.chain) result.chain = this.chain

			// patch accountId
			if (!result.accountId) {
				result.accountId = assetQuery.addr ?? assetQuery.apiKey ?? assetQuery.apiSecret
				// mask apiSecret
				if (result.accountId === assetQuery.apiSecret) {
					result.accountId = result.accountId.substring(0, 3) + '*'.repeat(result.accountId.length - 3)
				}
			}

			// patch groupSpecifier
			if (!result.groupSpecifier) result.groupSpecifier = assetQuery.groupSpecifier ?? constants.DEFAULT_ASSET_GROUP_NAME
		})

		clearInterval(checkStuckLogInterval)
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