import fetch from 'node-fetch'

import BasePriceScanner from './base.js'
import { Cache, createLogger } from '../utils/index.js'

const PRICE_CACHE_TTL_MS = 30000
const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3/simple/price'
const logger = createLogger('CoinGeckoPriceScanner')

export default class CoinGeckoPriceScanner extends BasePriceScanner {

	/** @type {string} */										vsCurrency = 'usd'
	/** @protected @type {Cache<types.AssetCode, number>} */	priceCacheByCode
	/** @private @type {Promise<void>} */						priceFetchPromise

	/**
	 * @protected
	 */
	async _init() {
		await super._init()
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
		if (!this.scannerAssetInfoByCode.has(code)) return undefined

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

		this.priceFetchPromise = new Promise(async (resolve, reject) => {
			logger.info(`Fetch new prices...`)
			try {
				const coinIds = [...this.scannerAssetInfoByCode.values()].map(info => info.scannerSpecificCode)
				const priceByCode = await this.getPricesFromAPI(coinIds)
				for (const [code, price] of priceByCode) {
					this.priceCacheByCode.set(code, price)
				}
		
				logger.info(`Successfully retrieved prices.`)
				this.priceFetchPromise = undefined
				resolve()
			} catch (err) {
				logger.error(`Failed to fetch prices: ${err}`)
				this.priceFetchPromise = undefined
				reject(err)
			}
		})
	}

	/**
	 * @public
	 * @param {types.AssetCode} code
	 * @returns {Promise<string>}
	 */
	async getScannerSpecificAssetCode(code) {
		await this.initPromise
		return this.scannerAssetInfoByCode.get(code)?.scannerSpecificCode
	}

	/**
	 * @protected
	 * @param {string[]} coinIds
	 * @returns {Promise<Map<types.AssetCode, number>>}
	 */
	async getPricesFromAPI(coinIds) {
		const data = await this.rateLimiter.exec(async () => {
			const url = new URL(COINGECKO_API_URL)
			url.searchParams.set('ids', coinIds.join(','))
			url.searchParams.set('vs_currencies', this.vsCurrency)

			const headers = {}
			if (this.config.apiKey) {
				headers['x-cg-demo-api-key'] = this.config.apiKey
			}

			const res = await fetch(url.toString(), { headers })
			if (!res.ok) {
				throw new Error(`CoinGecko API error: ${res.status} ${res.statusText}`)
			}
			return res.json()
		}, 'coin-gecko-get-price')

		const priceByCode = new Map()
		for (const [code, info] of this.scannerAssetInfoByCode) {
			if (!data?.[info.scannerSpecificCode]?.[this.vsCurrency]) {
				logger.warn(`Price not found in API response - code: ${code}, scannerSpecificCode: ${info.scannerSpecificCode}`)
				continue
			}
			priceByCode.set(code, data[info.scannerSpecificCode][this.vsCurrency])
		}
		return priceByCode
	}
}