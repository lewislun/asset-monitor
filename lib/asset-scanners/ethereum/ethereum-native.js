'use strict'

import * as enums from '../../enums.js'
import * as types from '../../types.js'
import { parseDecimal, humanize } from '../../utils/index.js'
import BaseEthereumAssetScanner from './base.js'

export default class EthereumNativeTokenScanner extends BaseEthereumAssetScanner {

	/** @type {enums.AssetType} */			static assetType = enums.AssetType.NATIVE_TOKEN
	/** @type {number} */					static assetDecimals = 18

	/**
	 * @protected
	 * @param {types.AssetQuery} assetQuery
	 * @returns {Promise<types.AssetQueryResult[]>}
	 */
	async _query(assetQuery) {
		const block = await this.rateLimiter.exec(() => this.web3.eth.getBlock('latest', true))
		const code = this.nativeTokenCode

		const [ price, balanceStr ] = await Promise.all([
			this.priceAggregator.getPrice(code),
			this.rateLimiter.exec(() => this.web3.eth.getBalance(assetQuery.addr, block.number)),
		])
		const balance = parseDecimal(balanceStr, EthereumNativeTokenScanner.assetDecimals)
		if (balance.cmp(0) <= 0) return []

		return [{
			name: `${humanize(this.chain)} Native Token`,
			code,
			chain: this.chain,
			type: EthereumNativeTokenScanner.assetType,
			state: enums.AssetState.LIQUID,
			quantity: balance,
			usdValue: balance.mul(price),
			usdValuePerQuantity: price,
			timestamp: Number(block.timestamp),
		}]
	}
}