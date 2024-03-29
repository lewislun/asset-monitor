import * as solanaWeb3 from '@solana/web3.js'

import BaseAssetScanner from '../base.js'
import { createLogger } from '../../utils/index.js'

export const TOKEN_PROGRAM_ID = new solanaWeb3.PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')

const logger = createLogger('solana-base')

export default class BaseSolanaAssetScanner extends BaseAssetScanner {

	/** @protected @type {string[]} */			static requiredParamKeys = [ 'endpoint' ]
	/** @type {solanaWeb3.Connection} */		connection
	/** @type {Map<string, number>} */			decimalsByAddr = new Map()

	/**
	 * @protected
	 */
	async _init() {
		await super._init()
		this.connection = new solanaWeb3.Connection(this.paramDict.endpoint, {
			commitment: 'finalized',
			disableRetryOnRateLimit: true,
		})
	}

	/**
	 * @protected
	 * @param {solanaWeb3.Context} context
	 * @returns {Promise<Date>}
	 */
	async getDatetimeFromContext(context) {
		let timestamp = await this.rateLimiter.exec(() => this.connection.getBlockTime(context.slot), 'getTimestampFromContext()')
		if (!timestamp) {
			logger.warn(`Block time estimation not possible, using current time as timestamp... - slot: ${context.slot}`)
			return new Date()
		}
		return new Date(timestamp * 1000)
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