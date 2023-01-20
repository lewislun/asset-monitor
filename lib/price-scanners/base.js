'use strict'

import * as enums from '../enums.js'
import * as errors from '../errors.js'
import { createLogger, BaseService, Cache } from '../utils/index.js'

/**
 * @typedef {import('../utils').RateLimiterOpts} RateLimiterOpts
 * 
 * @typedef Params
 * @property {string} [endpoint]
 * @property {string} [apiKey]
 */

const logger = createLogger('PriceScanner')

export default class BasePriceScanner extends BaseService {

	/** @protected @type {Params} */							params
	/** @protected @type {Map<enums.AssetCode, string>} */		coinIdByCode

	/**
	 * @param {Params} params
	 * @param {object.<enums.AssetCode, string>} coinIdByCode
	 * @param {RateLimiterOpts} rateLimiterOpts
	 */
	constructor(params = {}, coinIdByCode = {}, rateLimiterOpts = {}) {
		super(rateLimiterOpts)
		this.params = params
		this.coinIdByCode = new Map(Object.entries(coinIdByCode))
	}

	/**
	 * @public
	 * @param {enums.AssetCode} code
	 * @return {Promise<number>}
	 */
	async getPrice(code) {
		await this.initPromise

		if (!code) throw new errors.InvalidAssetCodeError(code)

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