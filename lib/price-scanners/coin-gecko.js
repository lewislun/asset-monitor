'use strict'

/**
 * @typedef {import('../utils').RateLimiterOpts} RateLimiterOpts
 * @typedef {string} CoinGeckoCoinId
 */

import CoinGecko from 'coingecko-api'

import BasePriceScanner from './base.js'
import * as enums from '../enums.js'

/**
 * @type {object.<enums.AssetCode, CoinGeckoCoinId>}
 */
export const COIN_ID_BY_ASSET_CODE = {
	[enums.AssetCode.ATOM]: 'cosmos',
	[enums.AssetCode.AVAX]: 'avalanche-2',
	[enums.AssetCode.BTC]: 'bitcoin',
	[enums.AssetCode.ETH]: 'ethereum',
	[enums.AssetCode.stETH]: 'staked-ether',
	[enums.AssetCode.EVMOS]: 'evmos',
	[enums.AssetCode.JUNO]: 'juno-network',
	[enums.AssetCode.KI]: 'genopet-ki',
	[enums.AssetCode.MNDE]: 'marinade',
	[enums.AssetCode.ORCA]: 'orca',
	[enums.AssetCode.RAY]: 'raydium',
	[enums.AssetCode.STARS]: 'stargaze',
	[enums.AssetCode.SOL]: 'solana',
	[enums.AssetCode.mSOL]: 'msol',
	[enums.AssetCode.wSOL]: 'wrapped-solana',
	[enums.AssetCode.USDC]: 'usd-coin',
	[enums.AssetCode.USDT]: 'tether',
}

const COIN_GECKO_RATE_LIMITER_KEY = 'coin-gecko'

export default class CoinGeckoPriceScanner extends BasePriceScanner {

	/** @type {string} */									vsCurrency = 'usd'
	/** @protected @type {CoinGecko} */						client
	/** @protected @type {Map<enums.AssetCode, number>} */	priceByCode = new Map()
	/** @protected @type {NodeJS.Timeout} */				nextIteration

	/**
	 * @param {RateLimiterOpts} rateLimiterOpts
	 */
	constructor(rateLimiterOpts) {
		rateLimiterOpts.instanceKey = COIN_GECKO_RATE_LIMITER_KEY
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
		const loop = async () => {
			await this.getAndCacheAllPrices()
			if (!this.isClosed) {
				this.nextIteration = setTimeout(() => loop, intervalMs)
			}
		}
		loop()
		// while (true) {
		// 	await new Promise(resolve => setTimeout(resolve, intervalMs))
		// }
	}

	/**
	 * @public
	 */
	async close() {
		await super.close()
		if (this.nextIteration) {
			clearTimeout(this.nextIteration)
			this.nextIteration = undefined
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
		const result = await this.rateLimiter.exec(async () => {
			const result = await this.client.simple.price({
				ids: Object.values(COIN_ID_BY_ASSET_CODE).join(','),
				vs_currencies: this.vsCurrency,
			})
			if (result.success === false)
				throw new Error(result.message)
			if (!result.data)
				throw new Error('CoinGecko result does not contain data.')
			return result
		}, 'coin-gecko-get-price')

		for (const code in COIN_ID_BY_ASSET_CODE) {
			const coinId = COIN_ID_BY_ASSET_CODE[code]
			this.priceByCode.set(code, result.data[coinId][this.vsCurrency])
		}
	}
}