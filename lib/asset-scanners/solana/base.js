'use strict'

import * as solanaWeb3 from '@solana/web3.js'

import BaseAssetScanner from '../base.js'

export const TOKEN_PROGRAM_ID = new solanaWeb3.PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')

export default class BaseSolanaAssetScanner extends BaseAssetScanner {

	/** @protected @type {string[]} */			static requiredParamKeys = [ 'endpoint' ]
	/** @type {solanaWeb3.Connection} */		connection
	/** @type {Map<string, number>} */			decimalsByAddr = new Map()

	/**
	 * @protected
	 */
	async _init() {
		await super._init()
		this.connection = new solanaWeb3.Connection(this.paramDict.endpoint, 'finalized')
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