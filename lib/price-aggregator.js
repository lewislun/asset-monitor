'use strict'

/**
 * @typedef {import('./utils/cache').CacheOpts} CacheOpts
 */

import { BasePriceScanner } from './price-scanners/index.js'
import Cache from './utils/cache.js'
import * as enums from './enums.js'
import logger from './utils/logger.js'

export default class PriceAggregator {
	
	/** @private @type {BasePriceScanner[]} */					scanners = []
	/** @private @type {Cache<enums.AssetCode, number>} */		priceCache

	/**
	 * @param {CacheOpts} [cacheOpts={}]
	 */
	constructor(cacheOpts={}) {
		this.priceCache = new Cache(cacheOpts)
	}

	/**
	 * @public
	 * @param {BasePriceScanner} scanner
	 */
	addPriceScanner(scanner) {
		this.scanners.push(scanner)
	}

	/**
	 * @public
	 * @param {enums.AssetCode} code
	 * @returns {Promise<number>}
	 */
	async getPrice(code) {
		// retrieve from cache if possible
		const cachedPrice = this.priceCache.get(code)
		if (cachedPrice !== undefined) {
			logger.debug(`${code} price retrieved from cache: ${cachedPrice}`)
			return cachedPrice
		}

		if (this.scanners.length === 0) {
			throw new Error('No scanner.')
		}
		
		// get price from all scanners
		const promises = this.scanners.map(scanner => scanner.getPrice(code))
		const prices = (await Promise.all(promises)).filter(price => price !== undefined)
		if (prices.length === 0) {
			throw new Error('No valid prices.')
		}
		const avgPrice = prices.reduce((acc, cur) => acc + cur, 0) / prices.length
		logger.debug(`${code} price aggregated from ${prices.length} sources: ${avgPrice}`)
		
		// save price to cache
		this.priceCache.set(code, avgPrice)

		return avgPrice
	}
}