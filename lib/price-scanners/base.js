'use strict'

/**
 * @typedef {import('../rate-limiter').RateLimiterOpts} RateLimiterOpts
 */

import * as enums from '../enums.js'
import * as errors from '../errors.js'
import logger from '../logger.js'
import RateLimiter from '../rate-limiter.js'

export default class BasePriceScanner {

	/** @type {RateLimiter} */ rateLimiter

	/**
	 * @param {RateLimiterOpts} rateLimiterOpts
	 */
	constructor(rateLimiterOpts) {
		this.rateLimiter = RateLimiter.getInstance(rateLimiterOpts)
	}

	/**
	 * @public
	 * @param {enums.AssetCode} code
	 * @return {Promise<number>}
	 */
	async getPrice(code) {
		if (!code) throw new errors.InvalidAssetCodeError(code)

		// TODO: TTL cache?
		const price = await this._getPrice(code)
		if (price !== undefined) {
			logger.debug(`Price fetched - assetCode: ${code}, price: ${price}, scanner: ${this.constructor.name}`)
		} else {
			logger.debug(`Failed to fetch price - assetCode: ${code}, scanner: ${this.constructor.name}`)
		}
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