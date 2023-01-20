'use strict'

import CoinGecko from 'coingecko-api'

import BasePriceScanner from './base.js'
import * as enums from '../enums.js'
import { Cache, createLogger } from '../utils/index.js'

/**
 * @typedef {import('../utils').RateLimiterOpts} RateLimiterOpts
 */

const RATE_LIMITER_KEY = 'coin-gecko'
const PRICE_CACHE_TTL_MS = 30000
const logger = createLogger('CoinGeckoPriceScanner')

export default class CoinGeckoPriceScanner extends BasePriceScanner {

	/** @type {string} */										vsCurrency = 'usd'
	/** @protected @type {CoinGecko} */							client
	/** @protected @type {Cache<enums.AssetCode, number>} */	priceCacheByCode
	/** @private @type {Promise<void>} */						priceFetchPromise

	/**
	 * @param {object} params
	 * @param {object.<enums.AssetCode, string>} assetIdByCode
	 * @param {RateLimiterOpts} rateLimiterOpts
	 */
	constructor(params, assetIdByCode, rateLimiterOpts = {}) {
		rateLimiterOpts.instanceKey = RATE_LIMITER_KEY
		super(params, assetIdByCode, rateLimiterOpts)
		this.client = new CoinGecko()
		this.priceCacheByCode = new Cache({ defaultTtlMs: PRICE_CACHE_TTL_MS })
	}

	/**
	 * @public
	 */
	async close() {
		await super.close()
		this.priceCacheByCode.close()
	}

	/**
	 * @protected
	 * @param {enums.AssetCode} code
	 * @returns {Promise<number>}
	 */
	async _getPrice(code) {
		if (!this.assetIdByCode.has(code)) return undefined

		const cachedPrice = this.priceCacheByCode.get(code)
		if (cachedPrice !== undefined) {
			logger.debug(`Price retrieved from cache - code: ${code}, price: ${cachedPrice}`)
			return cachedPrice
		}

		await this.getAndCacheAllPrices()
		return this.priceCacheByCode.get(code)
	}

	/**
	 * @protected
	 */
	async getAndCacheAllPrices() {
		if (this.priceFetchPromise) {
			logger.debug(`Already fetching prices, wait for promise to resolve...`)
			return await this.priceFetchPromise
		}

		let promiseResolve
		this.priceFetchPromise = new Promise(resolve => promiseResolve = resolve)

		logger.debug(`Fetch new prices...`)
		const result = await this.rateLimiter.exec(async () => {
			const result = await this.client.simple.price({
				ids: [...this.assetIdByCode.values()].join(','),
				vs_currencies: this.vsCurrency,
			})
			if (result.success === false)
				throw new Error(result.message)
			if (!result.data)
				throw new Error('CoinGecko result does not contain data.')
			return result
		}, 'coin-gecko-get-price')

		for (const [code, coinId] of this.assetIdByCode) {
			this.priceCacheByCode.set(code, result.data[coinId][this.vsCurrency])
		}

		logger.debug(`Successfully retrieved prices.`)
		promiseResolve()
		this.priceFetchPromise = undefined
	}
}