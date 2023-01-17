'use strict'

import * as solanaWeb3 from '@solana/web3.js'
import Decimal from 'decimal.js'

import * as types from '../../types.js'
import * as enums from '../../enums.js'
import { humanize } from '../../utils/index.js'
import BaseSolanaAssetScanner from './base.js'

export default class SolanaNativeTokenScanner extends BaseSolanaAssetScanner {

	/** @type {enums.AssetType} */			static assetType = enums.AssetType.NATIVE_TOKEN
	/** @type {number} */					static assetDecimals = 9

	/**
	 * @protected
	 * @param {types.AssetQuery} assetQuery
	 * @returns {Promise<types.AssetQueryResult[]>}
	 */
	async _query(assetQuery) {
		// TODO: staked SOL?

		// get SOL price
		const solPrice = await this.priceAggregator.getPrice(enums.AssetCode.SOL)

		// get SOL amount
		const pubkey = new solanaWeb3.PublicKey(assetQuery.addr)
		const { value, context } = await this.rateLimiter.exec(() => this.connection.getBalanceAndContext(pubkey))
		const timestamp = await this.rateLimiter.exec(() => this.getTimestampFromContext(context))
		const amount = new Decimal(value).div(10 ** SolanaNativeTokenScanner.assetDecimals)

		return [{
			name: `${humanize(this.chain)} Native Token`,
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