'use strict'

import fetch, { Headers } from 'node-fetch'

import BasePriceScanner from './base.js'
import * as enums from '../enums.js'
import { Cache, createLogger } from '../utils/index.js'

const PRICE_CACHE_TTL_MS = 30000
const logger = createLogger('LiveCoinWatchPriceScanner')

export default class LiveCoinWatchPriceScanner extends BasePriceScanner {

	/** @type {string} */										vsCurrency = 'USD'
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
		const priceByCode = await this.getPrices([...this.assetIdByCode.values()])
		for (const [code, price] of priceByCode) {
			this.priceCacheByCode.set(code, price)
		}

		logger.debug(`Successfully retrieved prices.`)
		promiseResolve()
		this.priceFetchPromise = undefined
	}

	/**
	 * @protected
	 * @param {string[]} coinIds
	 * @returns {Promise<Map<types.AssetCode, number>>}
	 */
	async getPrices(coinIds = []) {
		const res = await this.rateLimiter.exec(() => fetch(`${this.params.endpoint}/coins/map`, {
			method: 'POST',
			headers: new Headers({
				'content-type': 'application/json',
				'x-api-key': this.params.apiKey,
			}),
			body: JSON.stringify({
				codes: coinIds,
				currency: this.vsCurrency,
				meta: false,
			})
		}))

		/** @type {Map<string, number>} */
		const priceByCoinId = new Map()
		for (const priceInfo of await res.json()) {
			if (!priceInfo?.code || !priceInfo?.rate) throw new Error('Invalid API response')
			priceByCoinId.set(priceInfo.code, priceInfo.rate)
		}

		/** @type {Map<types.AssetCode, number>} */
		const priceByCode = new Map()
		for (const [code, coinId] of this.assetIdByCode) {
			const price = priceByCoinId.get(coinId)
			if (price === undefined) throw new Error(`Price not found from API response - code: ${code}, coinId: ${coinId}`)
			priceByCode.set(code, price)
		}
		return priceByCode
	}
}