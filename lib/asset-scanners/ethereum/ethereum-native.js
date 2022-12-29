'use strict'

import * as enums from '../../enums.js'
import * as types from '../../types.js'
import { parseDecimal } from '../../utils/common.js'
import BaseEthereumAssetScanner from './base.js'

export default class EthereumNativeTokenScanner extends BaseEthereumAssetScanner {

	/** @type {string} */					static assetName = 'Ethereum Native Token'
	/** @type {enums.AssetType} */			static assetType = enums.AssetType.NATIVE_TOKEN
	/** @type {number} */					static assetDecimals = 18

	/**
	 * @protected
	 * @param {types.AssetQuery} assetQuery
	 * @returns {Promise<types.AssetQueryResult[]>}
	 */
	async _query(assetQuery) {
		// TODO: staked ETH?

		const block = await this.rateLimiter.exec(() => this.web3.eth.getBlock('latest', true))

		const [ price, balanceStr ] = await Promise.all([
			this.priceAggregator.getPrice(enums.AssetCode.ETH),
			this.rateLimiter.exec(() => this.web3.eth.getBalance(assetQuery.addr, block.number)),
		])
		const balance = parseDecimal(balanceStr, EthereumNativeTokenScanner.assetDecimals)

		return [{
			name: EthereumNativeTokenScanner.assetName,
			code: enums.AssetCode.ETH,
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