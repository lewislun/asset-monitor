import { Address } from '@multiversx/sdk-core'

import * as enums from '../../enums.js'
import * as types from '../../types.js'
import { humanize, parseDecimal } from '../../utils/index.js'
import BaseMultiversxAssetScanner from './base.js'

export default class MultiversxNativeTokenScanner extends BaseMultiversxAssetScanner {

	/** @type {number} */					static assetDecimals = 18

	/**
	 * @protected
	 * @param {types.AssetQuery} assetQuery
	 * @returns {Promise<types.AssetQueryResult[]>}
	 */
	async _query(assetQuery) {
		const code = this.nativeTokenCode
		const addr = new Address(assetQuery.addr)
	
		const [ acc, price ] = await Promise.all([
			this.rateLimiter.exec(() => this.client.getAccount(addr)),
			this.priceAggregator.getPrice(code),
		])

		/** @type {types.AssetQueryResult[]} */
		const results = []

		// Liquid amount
		const liquidAmount = parseDecimal(acc.balance.toString(), MultiversxNativeTokenScanner.assetDecimals)
		if (liquidAmount.cmp(0) > 0) {
			results.push({
				name: `${humanize(this.chain)} Native Token`,
				code: code,
				chain: this.chain,
				type: enums.AssetType.NATIVE_TOKEN,
				state: enums.AssetState.LIQUID,
				quantity: liquidAmount,
				usdValue: liquidAmount.mul(price),
				usdValuePerQuantity: price,
				timestamp: Math.floor(new Date().getTime() / 1000),
			})
		}

		// TODO: staked

		return results
	}
}