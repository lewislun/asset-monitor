import { BasePriceScanner } from './price-scanners/index.js'
import * as enums from './enums.js'
import { createLogger } from './utils/index.js'

const logger = createLogger('PriceAggregator')

export default class PriceAggregator {
	
	/** @protected @type {Map<enums.PriceScannerType, BasePriceScanner>} */		scannerByType = new Map()

	/**
	 * @param {enums.PriceScannerType} type
	 * @returns {BasePriceScanner}
	 */
	getScanner(type) {
		return this.scannerByType.get(type)
	}

	/**
	 * @public
	 */
	async close() {
		const promises = [ ...this.scannerByType.values() ].map(scanner => scanner.close())
		await Promise.all(promises)
		logger.debug('closed.')
	}

	/**
	 * @public
	 * @param {enums.PriceScannerType} type
	 * @param {BasePriceScanner} scanner
	 */
	addPriceScanner(type, scanner) {
		if (this.scannerByType.has(type)) throw new Error('Cannot add price scanner of the same type twice.')
		this.scannerByType.set(type, scanner)
	}

	/**
	 * @public
	 * @param {types.AssetCode} code
	 * @returns {Promise<number>}
	 */
	async getPrice(code) {
		if (this.scannerByType.size === 0) {
			throw new Error('No scanner.')
		}
		
		// get price from all scanners
		const promises = [ ...this.scannerByType.values() ].map(scanner => scanner.getPrice(code))
		const prices = (await Promise.all(promises)).filter(price => price !== undefined)
		if (prices.length === 0) {
			throw new Error(`No valid prices - code: ${code}`)
		}
		const avgPrice = prices.reduce((acc, cur) => acc + cur, 0) / prices.length
		logger.debug(`${code} price aggregated from ${prices.length} sources: ${avgPrice}`)

		return avgPrice
	}
}