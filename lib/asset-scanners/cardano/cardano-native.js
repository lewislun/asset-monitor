import * as enums from '../../enums.js'
import * as types from '../../types.js'
import { parseDecimal, humanize } from '../../utils/index.js'
import BaseEthereumAssetScanner from './base.js'

export default class CardanoNativeTokenScanner extends BaseEthereumAssetScanner {

	/** @type {number} */					static assetDecimals = 6

	/**
	 * @protected
	 * @param {types.AssetQuery} assetQuery
	 * @returns {Promise<types.AssetQueryResult[]>}
	 */
	async _query(assetQuery) {
		const stakeKey = this.stakeKeyFromShelley(assetQuery.addr)
		const code = this.nativeTokenCode
		const [ price, account, block ] = await Promise.all([
			this.priceAggregator.getPrice(code),
			this.rateLimiter.exec(() => this.client.accounts(stakeKey)),
			this.rateLimiter.exec(() => this.client.blocksLatest())
		])

		/** @type {types.AssetQueryResult[]} */
		const results = []

		// Liquid amount
		if (account.controlled_amount != '0') {
			const balance = parseDecimal(account.controlled_amount, CardanoNativeTokenScanner.assetDecimals)
			results.push({
				name: `${humanize(this.chain)} Native Token`,
				code: code,
				chain: this.chain,
				type: enums.AssetType.NATIVE_TOKEN,
				state: enums.AssetState.LIQUID,
				quantity: balance,
				usdValue: balance.mul(price),
				usdValuePerQuantity: price,
				timestamp: block.time,
			})
		}

		// TODO: amount inside shelley address?
		// TODO: staked amount?
		// TODO: staking reward

		return results
	}
}