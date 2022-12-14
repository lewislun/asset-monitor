'use strict'

import * as solanaWeb3 from '@solana/web3.js'
import Decimal from 'decimal.js'

import * as types from '../../types.js'
import * as enums from '../../enums.js'
import BaseSolanaAssetScanner from './base.js'

export default class SolanaNativeTokenScanner extends BaseSolanaAssetScanner {

	/** @type {string} */					static assetName = 'Solana Native Token'
	/** @type {string} */					static assetSymbol = 'SOL'
	/** @type {enums.AssetType} */			static assetType = enums.AssetType.NATIVE_TOKEN
	/** @type {number} */					static assetDecimalCount = 9

	/**
	 * @public
	 * @param {types.AssetQuery} assetQuery
	 * @returns {Promise<types.AssetResult[]>}
	 */
	async query(assetQuery) {
		// TODO: staked SOL
		// TODO: usd value

		// TODO: query with timestamp
		if (!!assetQuery.timestamp) {
			throw new Error('Query with timestamp is not implemented')
		}

		const pubkey = new solanaWeb3.PublicKey(assetQuery.addr)
		const { value, context } = await this.rateLimiter.exec(async () => await this.connection.getBalanceAndContext(pubkey))
		const timestamp = await this.rateLimiter.exec(async () => await this.getTimestampFromContext(context))
		const sol = new Decimal(value).div(10 ** SolanaNativeTokenScanner.assetDecimalCount)

		return [{
			name: SolanaNativeTokenScanner.assetName,
			symbol: SolanaNativeTokenScanner.assetSymbol,
			chain: SolanaNativeTokenScanner.chain,
			type: SolanaNativeTokenScanner.assetType,
			state: enums.AssetState.LIQUID,
			quantity: sol,
			usdValue: undefined,
			usdValuePerQuantity: undefined,
			timestamp: timestamp,
		}]
	}
}