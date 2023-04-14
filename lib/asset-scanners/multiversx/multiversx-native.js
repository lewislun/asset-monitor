import { Address } from '@multiversx/sdk-core'

import * as enums from '../../enums.js'
import { humanize, parseDecimal } from '../../utils/index.js'
import BaseMultiversxAssetScanner from './base.js'
import { AssetQuery, AssetSnapshot } from '../../models/index.js'

export default class MultiversxNativeTokenScanner extends BaseMultiversxAssetScanner {

	/** @type {number} */					static assetDecimals = 18

	/**
	 * @protected
	 * @param {AssetQuery} assetQuery
	 * @returns {Promise<AssetSnapshot[]>}
	 */
	async _query(assetQuery) {
		const code = this.nativeTokenCode
		const addr = new Address(assetQuery.addr)
	
		const [ acc, delegations, price ] = await Promise.all([
			this.rateLimiter.exec(() => this.client.getAccount(addr)),
			this.rateLimiter.exec(() => this.client.doGetGeneric(`accounts/${addr.bech32()}/delegation`)),
			this.priceAggregator.getPrice(code),
		])

		/** @type {AssetSnapshot[]} */
		const results = []

		// Liquid amount
		const liquidAmount = parseDecimal(acc.balance.toString(), MultiversxNativeTokenScanner.assetDecimals)
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

		// Delegations
		for (const delegation of delegations) {
			// Active stakes
			const stakedAmount = parseDecimal(delegation.userActiveStake, MultiversxNativeTokenScanner.assetDecimals)
			if (stakedAmount.cmp(0) > 0) {
				results.push(AssetSnapshot.fromJson({
					name: `${humanize(this.chain)} Native Token`,
					code: code,
					chain: this.chain,
					type: enums.AssetType.NATIVE_TOKEN,
					state: enums.AssetState.LOCKED,
					quantity: stakedAmount,
					usd_value: stakedAmount.mul(price),
					usd_value_per_quantity: price,
				}))
			}

			// Rewards
			const rewardAmount = parseDecimal(delegation.claimableRewards, MultiversxNativeTokenScanner.assetDecimals)
			if (rewardAmount.cmp(0) > 0) {
				results.push(AssetSnapshot.fromJson({
					name: `${humanize(this.chain)} Native Token`,
					code: code,
					chain: this.chain,
					type: enums.AssetType.NATIVE_TOKEN,
					state: enums.AssetState.CLAIMABLE,
					quantity: rewardAmount,
					usd_value: rewardAmount.mul(price),
					usd_value_per_quantity: price,
				}))
			}
		}

		return results
	}
}