'use strict'

import { AccountAssetClient } from 'bybit-api'

import BaseAssetScanner from './base.js'
import { humanize } from '../utils/index.js'
import * as types from '../types.js'
import * as enums from '../enums.js'
import Decimal from 'decimal.js'

export default class BybitAssetScanner extends BaseAssetScanner {

	/** @protected @type {Map<string, types.AssetCode>} */ assetCodeByCoin = new Map()

	/**
	 * @protected
	 */
	async _init() {
		await super._init()
		this.assetIdByCode.forEach((val, key) => this.assetCodeByCoin.set(val, key))
	}

	/**
	 * Currently only SPOT account is supported.
	 * 
	 * @protected
	 * @param {types.AssetQuery} assetQuery
	 * @returns {Promise<types.AssetQueryResult[]>}
	 */
	async _query(assetQuery) {
		const client = new AccountAssetClient({
			key: assetQuery.apiKey,
			secret: assetQuery.apiSecret,
		})
		const assetInfoRes = await this.rateLimiter.exec(() => client.getAssetInformation())
		if (!assetInfoRes?.result?.spot?.assets) throw new Error('Result does not contain assets.')
		const timestamp = Math.floor(new Date().getTime() / 1000)

		/** @type {Promise<types.AssetQueryResult>[]} */
		const promises = []
		for (const asset of assetInfoRes.result.spot.assets) {
			// skip if coin is not watched or amount is 0
			const code = this.assetCodeByCoin.get(asset.coin)
			if (!code || !asset?.free || asset?.free === '0') continue

			promises.push(new Promise(async resolve => {
				const price = await this.priceAggregator.getPrice(code)
				const amount = new Decimal(asset.free)
				resolve({
					name: `${humanize(this.chain)} ${humanize(code)} Token`,
					code,
					chain: this.chain,
					type: enums.AssetType.CEX_TOKEN,
					state: enums.AssetState.LIQUID,
					quantity: amount,
					usdValue: amount.mul(price),
					usdValuePerQuantity: price,
					timestamp,
				})
			}))
		}

		return await Promise.all(promises)
	}
}