'use strict'

/**
 * @typedef {import('../rate-limiter').RateLimiterOpts} RateLimiterOpts
 */

import CoinGecko from 'coingecko-api'

import BasePriceScanner from './base.js'
import * as enums from '../enums.js'
import logger from '../logger.js'

/**
 * @type {object.<enums.AssetCode, string>}
 */
export const CoinGeckoCoinIdByAssetCode = {
	[enums.AssetCode.BTC]: 'bitcoin',
	[enums.AssetCode.SOL]: 'solana',
}

export default class CoinGeckoPriceScanner extends BasePriceScanner {

	/** @type {CoinGecko} */ client

	/**
	 * @param {RateLimiterOpts} rateLimiterOpts
	 */
	constructor(rateLimiterOpts) {
		super(rateLimiterOpts)
		this.client = new CoinGecko()
	}

	/**
	 * @protected
	 * @param {enums.AssetCode} code
	 * @returns {Promise<number>}
	 */
	async _getPrice(code) {
		const vsCurrency = 'usd'
		const coinId = CoinGeckoCoinIdByAssetCode[code]
		if (!coinId) return undefined

		const result = await this.rateLimiter.exec(async () => await this.client.simple.price({
			ids: [coinId],
			vs_currencies: vsCurrency,
		}))

		return result.data?.[coinId]?.[vsCurrency]
	}
}