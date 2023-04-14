import * as enums from '../../enums.js'
import { parseDecimal, humanize } from '../../utils/index.js'
import BaseCardanoAssetScanner from './base.js'
import { AssetQuery, AssetSnapshot } from '../../models/index.js'

export default class CardanoBlockfrostNativeTokenScanner extends BaseCardanoAssetScanner {

	/** @type {number} */					static assetDecimals = 6

	/**
	 * @protected
	 * @param {AssetQuery} assetQuery
	 * @returns {Promise<AssetSnapshot[]>}
	 */
	async _query(assetQuery) {
		const stakeKey = this.stakeKeyFromShelley(assetQuery.addr)
		const code = this.nativeTokenCode
		const [ price, account, block ] = await Promise.all([
			this.priceAggregator.getPrice(code),
			this.rateLimiter.exec(() => this.client.accounts(stakeKey)),
			this.rateLimiter.exec(() => this.client.blocksLatest())
		])

		/** @type {AssetSnapshot[]} */
		const results = []

		// Liquid amount
		if (account.controlled_amount != '0') {
			const balance = parseDecimal(account.controlled_amount, CardanoBlockfrostNativeTokenScanner.assetDecimals)
			results.push(AssetSnapshot.fromJson({
				name: `${humanize(this.chain)} Native Token`,
				code: code,
				chain: this.chain,
				type: enums.AssetType.NATIVE_TOKEN,
				state: enums.AssetState.LIQUID,
				quantity: balance,
				usd_value: balance.mul(price),
				usd_value_per_quantity: price,
				captured_at: new Date(block.time * 1000),
			}))
		}

		// TODO: amount inside shelley address?
		// TODO: staked amount?
		// TODO: staking reward

		return results
	}
}