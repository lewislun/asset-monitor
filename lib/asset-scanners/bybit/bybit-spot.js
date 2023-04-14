import { AccountAssetClient } from 'bybit-api'

import BaseAssetScanner from '../base.js'
import { humanize } from '../../utils/index.js'
import * as enums from '../../enums.js'
import Decimal from 'decimal.js'
import { AssetQuery, AssetSnapshot } from '../../models/index.js'

export default class BybitSpotAssetScanner extends BaseAssetScanner {

	/** @protected @type {string[]} */							static requiredQueryKeys = ['apiKey', 'apiSecret']

	/**
	 * Currently only SPOT account is supported.
	 * 
	 * @protected
	 * @param {AssetQuery} assetQuery
	 * @returns {Promise<AssetSnapshot[]>}
	 */
	async _query(assetQuery) {
		const client = new AccountAssetClient({
			key: assetQuery.apiKey,
			secret: assetQuery.apiSecret,
		})
		const assetInfoRes = await this.rateLimiter.exec(() => client.getAssetInformation())
		if (!assetInfoRes?.result?.spot?.assets) throw new Error('Result does not contain assets.')

		/** @type {Promise<AssetSnapshot>[]} */
		const promises = []
		for (const asset of assetInfoRes.result.spot.assets) {
			// skip if coin is not watched or amount is 0
			const code = this.assetIdByCode.inverse.get(asset.coin)
			if (!code || !asset?.free || asset?.free === '0') continue

			promises.push(new Promise(async resolve => {
				const price = await this.priceAggregator.getPrice(code)
				const amount = new Decimal(asset.free)
				resolve(AssetSnapshot.fromJson({
					name: `${humanize(this.chain)} ${humanize(code)} Token`,
					code,
					chain: this.chain,
					type: enums.AssetType.CEX_TOKEN,
					state: enums.AssetState.LIQUID,
					quantity: amount,
					usd_value: amount.mul(price),
					usd_value_per_quantity: price,
				}))
			}))
		}

		return await Promise.all(promises)
	}
}