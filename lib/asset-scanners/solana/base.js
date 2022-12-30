'use strict'

import * as solanaWeb3 from '@solana/web3.js'

import * as enums from '../../enums.js'
import BaseAssetScanner from '../base.js'

/**
 * @typedef {import('../../utils').RateLimiterOpts} RateLimiterOpts
 * @typedef {import('../base').AssetInfoMap} AssetInfoMap
 */

/**
 * @enum {string}
 */
export const Cluster = {
	MAINNET_BETA: 'mainnet-beta',
	DEVNET: 'devnet',
	TESTNET: 'testnet',
}

export const TOKEN_PROGRAM_ID = new solanaWeb3.PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')

/** @type {object.<string, Cluster>} */
const clusterByGenesisHash = {
	'5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d': Cluster.MAINNET_BETA,
	'EtWTRABZaYq6iMfeYKouRu166VU2xqa1wcaWoxPkrZBG': Cluster.DEVNET,
	'4uhcVJyU9pJkvQyS88uRDiswHXSCkY3zQawwpjk2NsNY': Cluster.TESTNET,
}

export default class BaseSolanaAssetScanner extends BaseAssetScanner {

	/** @type {enums.Chain} */							static chain = enums.Chain.SOLANA

	/** @type {solanaWeb3.Connection} */		connection
	/** @type {Cluster} */						cluster
	/** @type {Map<string, enums.AssetCode>} */	assetCodeByAddr = new Map()
	/** @type {Map<string, number>} */			decimalsByAddr = new Map()

	/**
	 * @param {PriceAggregator} priceAggregator
	 * @param {AssetInfoMap} assetInfoMap
	 * @param {object} params
	 * @param {string} params.endpoint
	 * @param {RateLimiterOpts} [rateLimiterOpts={}]
	 */
	constructor(priceAggregator, assetInfoMap, params, rateLimiterOpts = {}) {
		rateLimiterOpts.instanceKey = params.endpoint
		super(priceAggregator, assetInfoMap, params, rateLimiterOpts)
		assetInfoMap.forEach((val, key) => this.assetCodeByAddr.set(val, key))
		this.connection = new solanaWeb3.Connection(params.endpoint)
	}

	/**
	 * @protected
	 */
	async _init() {
		await super._init()
		this.cluster = await this.getCluster()
	}

	/**
	 * @protected
	 * @returns {Promise<Cluster>}
	 */
	async getCluster() {
		const hash = await this.rateLimiter.exec(() => this.connection.getGenesisHash())
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
		let timestamp = await this.rateLimiter.exec(() => this.connection.getBlockTime(context.slot))
		if (!timestamp) {
			throw new Error(`Block time estimation not possible - slot: ${context.slot}`)
		}
		return timestamp
	}

	/**
	 * Get SPL token decimals from cache. On miss, retrieve from chain by getTokenSupply().
	 * 
	 * @protected
	 * @param {solanaWeb3.PublicKey | string} mintOrAddr
	 * @returns {Promise<number>}
	 */
	async getSplTokenDecimals(mintOrAddr) {
		const addr = mintOrAddr instanceof solanaWeb3.PublicKey? mintOrAddr.toBase58() : mintOrAddr
		const mint = mintOrAddr instanceof solanaWeb3.PublicKey? mintOrAddr : new solanaWeb3.PublicKey(mintOrAddr)

		const cachedValue = this.decimalsByAddr.get(addr)
		if (cachedValue !== undefined) return cachedValue

		const result = await this.rateLimiter.exec(() => this.connection.getTokenSupply(mint))
		this.decimalsByAddr.set(addr, result.value.decimals)
		return result.value.decimals
	}
}