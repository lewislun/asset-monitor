import { BiMap } from 'mnemonist'

import * as errors from '../errors.js'
import { createLogger, BaseService } from '../utils/index.js'

/**
 * @typedef {import('rate-limiter').RateLimiterOpts} RateLimiterOpts
 * @typedef {import('../utils').ServiceParamDict} ServiceParamDict
 */

const logger = createLogger('PriceScanner')

export default class BasePriceScanner extends BaseService {

	/** @protected @type {BiMap<types.AssetCode, string>} */	assetIdByCode

	/**
	 * @param {ServiceParamDict} paramDict
	 * @param {object.<types.AssetCode, string>} assetIdByCode
	 * @param {RateLimiterOpts} rateLimiterOpts
	 */
	constructor(paramDict = {}, assetIdByCode = {}, rateLimiterOpts = {}) {
		if (paramDict?.rateLimiterKey) {
			rateLimiterOpts.instanceKey = paramDict.rateLimiterKey
		}
		super(paramDict, rateLimiterOpts)
		this.assetIdByCode = BiMap.from(assetIdByCode)
	}

	/**
	 * @public
	 * @param {types.AssetCode} code
	 * @return {Promise<number>}
	 */
	async getPrice(code) {
		await this.initPromise

		if (!code) throw new errors.InvalidAssetCodeError(code)

		const price = await this._getPrice(code)
		if (price !== undefined) {
			logger.debug(`Price fetched - assetCode: ${code}, price: ${price}, scanner: ${this.constructor.name}`)
		} else {
			logger.debug(`price not available from this scanner - assetCode: ${code}, scanner: ${this.constructor.name}`)
		}
		return price
	}

	/**
	 * @protected
	 * @abstract
	 * @param {types.AssetCode} code
	 * @return {Promise<number>}
	 */
	async _getPrice(code) {
		throw new Error('not implemented')
	}
}