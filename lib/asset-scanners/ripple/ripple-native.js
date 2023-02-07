import Decimal from 'decimal.js'

import * as enums from '../../enums.js'
import * as types from '../../types.js'
import { humanize } from '../../utils/index.js'
import BaseRippleAssetScanner from './base.js'

export default class RippleNativeTokenScanner extends BaseRippleAssetScanner {

	/** @type {number} */					static assetDecimals = 6

	/**
	 * @protected
	 * @param {types.AssetQuery} assetQuery
	 * @returns {Promise<types.AssetQueryResult[]>}
	 */
	async _query(assetQuery) {
		const code = this.nativeTokenCode
		const [ balanceStr, price ] = await Promise.all([
			this.rateLimiter.exec(() => this.client.getXrpBalance(assetQuery.addr)),
			this.priceAggregator.getPrice(code),
		])

		/** @type {types.AssetQueryResult[]} */
		const results = []

		// Liquid amount
		const liquidAmount = new Decimal(balanceStr)
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

		return results
	}
}