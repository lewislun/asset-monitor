import * as enums from '../../enums.js'
import { parseDecimal } from '../../utils/index.js'
import BaseCosmosAssetScanner from './base.js'
import { AssetQuery, AssetSnapshot } from '../../models/index.js'

export default class CosmosSecondaryTokenScanner extends BaseCosmosAssetScanner {
	/**
	 * @protected
	 * @param {AssetQuery} assetQuery
	 * @returns {Promise<AssetSnapshot[]>}
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
			const balance = parseDecimal(balanceRes.balance, tokenInfo.decimals)
			results.push(AssetSnapshot.fromJson({
				name: tokenInfo.name,
				code,
				chain: this.chain,
				type: enums.AssetType.SECONDARY_TOKEN,
				state: enums.AssetState.LIQUID,
				quantity: balance,
				usd_value: balance.mul(price),
				usd_value_per_quantity: price,
				captured_at: new Date(block.header.time),
			}))
		}

		return results
	}
}