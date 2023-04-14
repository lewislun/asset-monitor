import { Address } from '@multiversx/sdk-core'

import * as enums from '../../enums.js'
import * as types from '../../types.js'
import { humanize, parseDecimal } from '../../utils/index.js'
import BaseMultiversxAssetScanner from './base.js'
import { AssetQuery } from '../../models/index.js'

export default class MultiversxNativeTokenScanner extends BaseMultiversxAssetScanner {

	/** @type {number} */					static assetDecimals = 18

	/**
	 * @protected
	 * @param {AssetQuery} assetQuery
	 * @returns {Promise<types.AssetQueryResult[]>}
	 */
	async _query(assetQuery) {
		const code = this.nativeTokenCode
		const addr = new Address(assetQuery.addr)
	
		const [ acc, delegations, price ] = await Promise.all([
			this.rateLimiter.exec(() => this.client.getAccount(addr)),
			this.rateLimiter.exec(() => this.client.doGetGeneric(`accounts/${addr.bech32()}/delegation`)),
			this.priceAggregator.getPrice(code),
		])
		const timestamp = Math.floor(new Date().getTime() / 1000)

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
				timestamp: timestamp,
			})
		}

		// Delegations
		for (const delegation of delegations) {
			// Active stakes
			const stakedAmount = parseDecimal(delegation.userActiveStake, MultiversxNativeTokenScanner.assetDecimals)
			if (stakedAmount.cmp(0) > 0) {
				results.push({
					name: `${humanize(this.chain)} Native Token`,
					code: code,
					chain: this.chain,
					type: enums.AssetType.NATIVE_TOKEN,
					state: enums.AssetState.LOCKED,
					quantity: stakedAmount,
					usdValue: stakedAmount.mul(price),
					usdValuePerQuantity: price,
					timestamp: timestamp,
				})
			}

			// Rewards
			const rewardAmount = parseDecimal(delegation.claimableRewards, MultiversxNativeTokenScanner.assetDecimals)
			if (rewardAmount.cmp(0) > 0) {
				results.push({
					name: `${humanize(this.chain)} Native Token`,
					code: code,
					chain: this.chain,
					type: enums.AssetType.NATIVE_TOKEN,
					state: enums.AssetState.CLAIMABLE,
					quantity: rewardAmount,
					usdValue: rewardAmount.mul(price),
					usdValuePerQuantity: price,
					timestamp: timestamp,
				})
			}
		}

		return results
	}
}