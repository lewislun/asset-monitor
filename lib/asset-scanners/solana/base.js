'use strict'

/**
 * @typedef {import('../../rate-limiter').RateLimiterOpts} RateLimiterOpts
 */

import * as solanaWeb3 from '@solana/web3.js'

import * as enums from '../../enums.js'
import BaseAssetScanner from '../base.js'

export default class BaseSolanaAssetScanner extends BaseAssetScanner {

	/** @type {enums.Chain} */				static chain = enums.Chain.SOLANA

	/** @type {solanaWeb3.Connection} */	connection = undefined

	/**
	 * @param {PriceAggregator} priceAggregator
	 * @param {string} endpoint
	 * @param {RateLimiterOpts} rateLimiterOpts
	 */
	constructor(priceAggregator, endpoint, rateLimiterOpts) {
		super(priceAggregator, rateLimiterOpts)
		this.connection = new solanaWeb3.Connection(endpoint)
	}

	/**
	 * @protected
	 * @param {solanaWeb3.Context} context
	 * @returns {Promise<number>}
	 */
	async getTimestampFromContext(context) {
		let timestamp = await this.connection.getBlockTime(context.slot)
		if (!timestamp) {
			throw new Error(`Block time estimation not possible - slot: ${context.slot}`)
		}
		return timestamp
	}
}