'use strict'

import * as enums from '../../enums.js'
import * as types from '../../types.js'
import { parseDecimal } from '../../utils/common.js'
import BaseEthereumAssetScanner from './base.js'

/**
 * @type {object.<enums.Chain, enums.AssetCode>}
 */
const ASSET_CODE_BY_CHAIN = {
	[enums.Chain.ETHEREUM]: enums.AssetCode.ETH,
	[enums.Chain.AVALANCHE_C]: enums.AssetCode.AVAX,
}

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
		const block = await this.rateLimiter.exec(() => this.web3.eth.getBlock('latest', true))
		const code = ASSET_CODE_BY_CHAIN[this.chain]

		const [ price, balanceStr ] = await Promise.all([
			this.priceAggregator.getPrice(code),
			this.rateLimiter.exec(() => this.web3.eth.getBalance(assetQuery.addr, block.number)),
		])
		const balance = parseDecimal(balanceStr, EthereumNativeTokenScanner.assetDecimals)

		return [{
			name: EthereumNativeTokenScanner.assetName,
			code: code,
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