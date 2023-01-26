'use strict'

import * as enums from '../enums.js'
import * as errors from '../errors.js'
import { createLogger, BaseService } from '../utils/index.js'

/**
 * @typedef {import('../utils').RateLimiterOpts} RateLimiterOpts
 * 
 * @typedef Params
 * @property {string} [rateLimiterKey]
 * @property {string} [endpoint]
 * @property {string} [apiKey]
 */

const logger = createLogger('PriceScanner')

export default class BasePriceScanner extends BaseService {

	/** @protected @type {Params} */							params
	/** @protected @type {Map<enums.AssetCode, string>} */		assetIdByCode

	/**
	 * @param {Params} params
	 * @param {object.<enums.AssetCode, string>} coinIdByCode
	 * @param {RateLimiterOpts} rateLimiterOpts
	 */
	constructor(params = {}, coinIdByCode = {}, rateLimiterOpts = {}) {
		if (params?.rateLimiterKey) {
			rateLimiterOpts.instanceKey = params.rateLimiterKey
		}
		super(rateLimiterOpts)
		this.params = params
		this.assetIdByCode = new Map(Object.entries(coinIdByCode))
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
			logger.debug(`price not avaiable from this scanner - assetCode: ${code}, scanner: ${this.constructor.name}`)
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