'use strict'

/**
 * @typedef {import('../../rate-limiter').RateLimiterOpts} RateLimiterOpts
 */

import * as solanaWeb3 from '@solana/web3.js'

import * as enums from '../../enums.js'
import BaseAssetScanner from '../base.js'

/**
 * @enum {string}
 */
export const Cluster = {
	MAINNET_BETA: 'mainnet-beta',
	DEVNET: 'devnet',
	TESTNET: 'testnet',
}

/** @type {object.<string, Cluster>} */
const clusterByGenesisHash = {
	'5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d': Cluster.MAINNET_BETA,
	'EtWTRABZaYq6iMfeYKouRu166VU2xqa1wcaWoxPkrZBG': Cluster.DEVNET,
	'4uhcVJyU9pJkvQyS88uRDiswHXSCkY3zQawwpjk2NsNY': Cluster.TESTNET,
}

export default class BaseSolanaAssetScanner extends BaseAssetScanner {

	/** @type {enums.Chain} */				static chain = enums.Chain.SOLANA

	/** @type {solanaWeb3.Connection} */	connection
	/** @type {Cluster} */					cluster

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
	 */
	async _init() {
		this.cluster = await this.getCluster()
	}

	/**
	 * @protected
	 * @returns {Promise<Cluster>}
	 */
	async getCluster() {
		// TESTCASE: for each cluster
		const hash = await this.rateLimiter.exec(async () => this.connection.getGenesisHash())
		/** @type {Cluster} */
		const cluster = clusterByGenesisHash[hash]
		if (cluster === undefined) {
			throw new Error('Cannot determine cluster.')
		}
		return cluster
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