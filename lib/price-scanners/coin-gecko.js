'use strict'

/**
 * @typedef {import('../rate-limiter').RateLimiterOpts} RateLimiterOpts
 */

import CoinGecko from 'coingecko-api'

import BasePriceScanner from './base.js'
import * as enums from '../enums.js'

/**
 * @type {object.<enums.AssetCode, string>}
 */
export const CoinGeckoCoinIdByAssetCode = {
	[enums.AssetCode.BTC]: 'bitcoin',
	[enums.AssetCode.ETH]: 'ethereum',
	[enums.AssetCode.stETH]: 'staked-ether',
	[enums.AssetCode.MNDE]: 'marinade',
	[enums.AssetCode.ORCA]: 'orca',
	[enums.AssetCode.RAY]: 'raydium',
	[enums.AssetCode.SOL]: 'solana',
	[enums.AssetCode.mSOL]: 'msol',
	[enums.AssetCode.wSOL]: 'wrapped-solana',
	[enums.AssetCode.USDC]: 'usd-coin',
	[enums.AssetCode.USDT]: 'tether',
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

		// TODO: get multiple prices?
		const result = await this.rateLimiter.exec(() =>this.client.simple.price({
			ids: [coinId],
			vs_currencies: vsCurrency,
		}), 'coin-gecko-get-price')

		return result.data?.[coinId]?.[vsCurrency]
	}
}