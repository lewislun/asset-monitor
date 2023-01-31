import CoinGecko from 'coingecko-api'

import BasePriceScanner from './base.js'
import { Cache, createLogger } from '../utils/index.js'

const PRICE_CACHE_TTL_MS = 30000
const logger = createLogger('CoinGeckoPriceScanner')

export default class CoinGeckoPriceScanner extends BasePriceScanner {

	/** @type {string} */										vsCurrency = 'usd'
	/** @protected @type {CoinGecko} */							client
	/** @protected @type {Cache<types.AssetCode, number>} */	priceCacheByCode
	/** @private @type {Promise<void>} */						priceFetchPromise

	/**
	 * @protected
	 */
	async _init() {
		await super._init()
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
	 * @param {types.AssetCode} code
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

		for (const [code, assetId] of this.assetIdByCode) {
			this.priceCacheByCode.set(code, result.data[assetId][this.vsCurrency])
		}

		logger.debug(`Successfully retrieved prices.`)
		promiseResolve()
		this.priceFetchPromise = undefined
	}

	/**
	 * @public
	 * @param {types.AssetCode} code
	 * @returns {Promise<string>}
	 */
	async getAssetIdByCode(code) {
		await this.initPromise
		return this.assetIdByCode.get(code)
	}
}