'use strict'

/**
 * @typedef {import('../rate-limiter').RateLimiterOpts} RateLimiterOpts
 * @typedef {string} CoinGeckoCoinId
 */

import CoinGecko from 'coingecko-api'

import BasePriceScanner from './base.js'
import * as enums from '../enums.js'

/**
 * @type {object.<enums.AssetCode, CoinGeckoCoinId>}
 */
export const COIN_ID_BY_ASSET_CODE = {
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

	/** @type {string} */									vsCurrency = 'usd'
	/** @protected @type {CoinGecko} */						client
	/** @protected @type {Map<enums.AssetCode, number>} */	priceByCode = new Map()

	/**
	 * @param {RateLimiterOpts} rateLimiterOpts
	 */
	constructor(rateLimiterOpts) {
		super(rateLimiterOpts)
		this.client = new CoinGecko()
	}

	/**
	 * @protected
	 */
	async _init() {
		await super._init()
		await this.getAndCacheAllPrices()
		this.startLoop()
	}

	/**
	 * @protected
	 */
	async startLoop() {
		const intervalMs = this.rateLimiter.callIntervalMs
		while (true) {
			await this.getAndCacheAllPrices()
			await new Promise(resolve => setTimeout(resolve, intervalMs))
		}
	}

	/**
	 * @protected
	 * @param {enums.AssetCode} code
	 * @returns {Promise<number>}
	 */
	async _getPrice(code) {
		return this.priceByCode.get(code)
	}

	/**
	 * @protected
	 */
	async getAndCacheAllPrices() {
		const result = await this.rateLimiter.exec(() => this.client.simple.price({
			ids: Object.values(COIN_ID_BY_ASSET_CODE).join(','),
			vs_currencies: this.vsCurrency,
		}), 'coin-gecko-get-price')
		if (!result?.data) throw new Error('CoinGecko result does not contain data.')

		for (const code in COIN_ID_BY_ASSET_CODE) {
			const coinId = COIN_ID_BY_ASSET_CODE[code]
			this.priceByCode.set(code, result.data[coinId][this.vsCurrency])
		}
	}
}