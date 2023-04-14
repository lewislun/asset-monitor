import { TypeTagParser } from 'aptos'

import * as enums from '../../enums.js'
import * as types from '../../types.js'
import { createLogger } from '../../utils/index.js'
import { parseDecimal, humanize } from '../../utils/index.js'
import BaseAptosAssetScanner from './base.js'
import { AssetQuery, AssetSnapshot } from '../../models/index.js'

const logger = createLogger('aptos-native')

export default class AptosNativeTokenScanner extends BaseAptosAssetScanner {
	/** @type {number} */					static assetDecimals = 8

	/**
	 * @protected
	 * @param {AssetQuery} assetQuery
	 * @returns {Promise<AssetSnapshot[]>}
	 */
	async _query(assetQuery) {
		const code = this.nativeTokenCode
		const [ accResources, price ] = await Promise.all([
			this.rateLimiter.exec(() => this.client.getAccountResources(assetQuery.addr)),
			this.priceAggregator.getPrice(code),
		])

		/** @type {AssetSnapshot[]} */
		const results = []

		for (const res of accResources) {
			console.log(res.type)
			const typeTag = new TypeTagParser(res.type).parseTypeTag()
			const typeName = typeTag?.value?.name?.value
			if (!typeName) {
				logger.warn(`Unknown type tag: ${res.type}`)
				continue
			}

			var state, amount
			switch (typeName) {
				case 'CoinStore':
					state = enums.AssetState.LIQUID
					amount = parseDecimal(res.data.coin.value, AptosNativeTokenScanner.assetDecimals)
					break
				case 'StakePool':
					state = enums.AssetState.LOCKED
					amount = parseDecimal(res.data.active.value, AptosNativeTokenScanner.assetDecimals)
					amount = amount.add(parseDecimal(res.data.inactive.value, AptosNativeTokenScanner.assetDecimals))
					break
				// REVIEW: is staking reward included in the active/inactive amount?
				default:
					continue
			}

			if (amount.cmp(0) <= 0) continue
			results.push(AssetSnapshot.fromJson({
				name: `${humanize(this.chain)} Native Token`,
				code: code,
				chain: this.chain,
				type: enums.AssetType.NATIVE_TOKEN,
				state: state,
				quantity: amount,
				usd_value: amount.mul(price),
				usd_value_per_quantity: price,
			}))
		}

		return results
	}
}