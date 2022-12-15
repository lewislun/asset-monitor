'use strict'

/**
 * @typedef {import('../rate-limiter').RateLimiterOpts} RateLimiterOpts
 */

import * as enums from '../enums.js'
import logger from '../logger.js'
import RateLimiter from '../rate-limiter.js'

export default class BasePriceScanner {

	/** @type {RateLimiter} */ rateLimiter

	/**
	 * @param {RateLimiterOpts} rateLimiterOpts
	 */
	constructor(rateLimiterOpts) {
		this.rateLimiter = new RateLimiter(rateLimiterOpts)
	}

	/**
	 * @public
	 * @param {enums.AssetCode} code
	 * @return {Promise<number>}
	 */
	async getPrice(code) {
		const price = await this._getPrice(code)
		logger.debug(`Price fetched - assetCode: ${code}, price: ${price}, scanner: ${this.constructor.name}`)
		return price
	}

	/**
	 * @protected
	 * @abstract
	 * @param {enums.AssetCode} code
	 * @return {Promise<number>}
	 */
	async _getPrice(code) {
		throw new Error('not implemented')
	}
}