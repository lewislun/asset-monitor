'use strict'

import * as solanaWeb3 from '@solana/web3.js'
import Decimal from 'decimal.js'

import * as types from '../../types.js'
import * as enums from '../../enums.js'
import BaseSolanaAssetScanner from './base.js'

export default class SolanaNativeTokenScanner extends BaseSolanaAssetScanner {

	/** @type {string} */					static assetName = 'Solana Native Token'
	/** @type {enums.AssetType} */			static assetType = enums.AssetType.NATIVE_TOKEN
	/** @type {number} */					static assetDecimalCount = 9

	/**
	 * @protected
	 * @param {types.AssetQuery} assetQuery
	 * @returns {Promise<types.AssetResult[]>}
	 */
	async _query(assetQuery) {
		// TODO: staked SOL?

		// get SOL price
		const solPrice = await this.priceAggregator.getPrice(enums.AssetCode.SOL)

		// get SOL amount
		const pubkey = new solanaWeb3.PublicKey(assetQuery.addr)
		const { value, context } = await this.rateLimiter.exec(async () => await this.connection.getBalanceAndContext(pubkey))
		const timestamp = await this.rateLimiter.exec(async () => await this.getTimestampFromContext(context))
		const amount = new Decimal(value).div(10 ** SolanaNativeTokenScanner.assetDecimalCount)

		return [{
			name: SolanaNativeTokenScanner.assetName,
			code: enums.AssetCode.SOL,
			chain: SolanaNativeTokenScanner.chain,
			type: SolanaNativeTokenScanner.assetType,
			state: enums.AssetState.LIQUID,
			quantity: amount,
			usdValue: amount.mul(solPrice),
			usdValuePerQuantity: solPrice,
			timestamp: timestamp,
		}]
	}
}