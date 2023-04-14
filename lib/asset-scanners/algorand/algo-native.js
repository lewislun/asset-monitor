import * as enums from '../../enums.js'
import * as types from '../../types.js'
import { parseDecimal, humanize } from '../../utils/index.js'
import BaseAlgorandAssetScanner from './base.js'
import { AssetQuery } from '../../models/index.js'

export default class AlgorandNativeTokenScanner extends BaseAlgorandAssetScanner {

	/** @type {number} */					static assetDecimals = 6

	/**
	 * @protected
	 * @param {AssetQuery} assetQuery
	 * @returns {Promise<types.AssetQueryResult[]>}
	 */
	async _query(assetQuery) {
		const code = this.nativeTokenCode
		const [ acc, price ] = await Promise.all([
			this.rateLimiter.exec(() => this.client.accountInformation(assetQuery.addr).do()),
			this.priceAggregator.getPrice(code),
		])

		/** @type {types.AssetQueryResult[]} */
		const results = []

		// Liquid amount
		const liquidAmount = parseDecimal(acc['amount-without-pending-rewards'], AlgorandNativeTokenScanner.assetDecimals)
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
				timestamp: Math.floor(new Date().getTime() / 1000),  // block() can trigger error, so we use current time instead
			})
		}

		// TODO: staked amount
		// TODO: staking reward

		return results
	}
}