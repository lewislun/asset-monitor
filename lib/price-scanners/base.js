'use strict'

import * as enums from '../enums.js'
import * as errors from '../errors.js'
import { logger, BaseService } from '../utils/index.js'

export default class BasePriceScanner extends BaseService {

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