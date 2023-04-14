import Decimal from 'decimal.js'

import * as enums from '../../enums.js'
import { humanize } from '../../utils/index.js'
import BaseRippleAssetScanner from './base.js'
import { AssetQuery, AssetSnapshot } from '../../models/index.js'

export default class RippleNativeTokenScanner extends BaseRippleAssetScanner {

	/** @type {number} */					static assetDecimals = 6

	/**
	 * @protected
	 * @param {AssetQuery} assetQuery
	 * @returns {Promise<AssetSnapshot[]>}
	 */
	async _query(assetQuery) {
		const code = this.nativeTokenCode
		const [ balanceStr, price ] = await Promise.all([
			this.rateLimiter.exec(() => this.client.getXrpBalance(assetQuery.addr)),
			this.priceAggregator.getPrice(code),
		])

		/** @type {AssetSnapshot[]} */
		const results = []

		// Liquid amount
		const liquidAmount = new Decimal(balanceStr)
		if (liquidAmount.cmp(0) > 0) {
			results.push(AssetSnapshot.fromJson({
				name: `${humanize(this.chain)} Native Token`,
				code: code,
				chain: this.chain,
				type: enums.AssetType.NATIVE_TOKEN,
				state: enums.AssetState.LIQUID,
				quantity: liquidAmount,
				usd_value: liquidAmount.mul(price),
				usd_value_per_quantity: price,
			}))
		}

		return results
	}
}