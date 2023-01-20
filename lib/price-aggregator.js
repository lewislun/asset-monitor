'use strict'

import { BasePriceScanner } from './price-scanners/index.js'
import * as enums from './enums.js'
import { createLogger } from './utils/index.js'

const logger = createLogger('PriceAggregator')

export default class PriceAggregator {
	
	/** @private @type {BasePriceScanner[]} */					scanners = []

	/**
	 * @public
	 */

	async close() {
		const promises = []
		for (const scanner of this.scanners) {
			promises.push(scanner.close())
		}
		await Promise.all(promises)
		logger.debug('closed.')
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

		return avgPrice
	}
}