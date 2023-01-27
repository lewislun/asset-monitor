'use strict'

import * as enums from '../../enums.js'
import * as types from '../../types.js'
import { parseDecimal } from '../../utils/index.js'
import BaseCosmosAssetScanner from './base.js'

export default class CosmosSecondaryTokenScanner extends BaseCosmosAssetScanner {
	/**
	 * @protected
	 * @param {types.AssetQuery} assetQuery
	 * @returns {Promise<types.AssetQueryResult[]>}
	 */
	async _query(assetQuery) {
		const results = []
	
		for (const [code, contractAddr] of this.assetIdByCode) {
			if (contractAddr === BaseCosmosAssetScanner.nativeTokenAssetId) continue

			const contractQuery = { balance: { address: assetQuery.addr } }
			const [ balanceRes, price, tokenInfo, block ] = await Promise.all([
				this.rateLimiter.exec(() => this.cwClient.queryContractSmart(contractAddr, contractQuery)),
				this.priceAggregator.getPrice(code),
				this.getTokenInfo(contractAddr),
				this.rateLimiter.exec(() => this.client.getBlock()),
			])

			if (!balanceRes?.balance) continue
			const timestamp = Math.floor(new Date(block.header.time).getTime() / 1000)
			const balance = parseDecimal(balanceRes.balance, tokenInfo.decimals)
			results.push({
				name: tokenInfo.name,
				code,
				chain: this.chain,
				type: enums.AssetType.SECONDARY_TOKEN,
				state: enums.AssetState.LIQUID,
				quantity: balance,
				usdValue: balance.mul(price),
				usdValuePerQuantity: price,
				timestamp,
			})
		}

		return results
	}
}