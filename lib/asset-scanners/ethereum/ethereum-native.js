import * as enums from '../../enums.js'
import { parseDecimal, humanize } from '../../utils/index.js'
import BaseEthereumAssetScanner from './base.js'
import { AssetQuery, AssetSnapshot } from '../../models/index.js'

export default class EthereumNativeTokenScanner extends BaseEthereumAssetScanner {

	/** @type {number} */					static assetDecimals = 18

	/**
	 * @protected
	 * @param {AssetQuery} assetQuery
	 * @returns {Promise<AssetSnapshot[]>}
	 */
	async _query(assetQuery) {
		const block = await this.rateLimiter.exec(() => this.web3.eth.getBlock('latest', true))
		const code = this.nativeTokenCode

		const [ price, balanceStr ] = await Promise.all([
			this.priceAggregator.getPrice(code),
			this.rateLimiter.exec(() => this.web3.eth.getBalance(assetQuery.addr, block.number)),
		])
		const balance = parseDecimal(balanceStr, EthereumNativeTokenScanner.assetDecimals)
		if (balance.cmp(0) <= 0) return []

		return [AssetSnapshot.fromJson({
			name: `${humanize(this.chain)} Native Token`,
			code,
			chain: this.chain,
			type: enums.AssetType.NATIVE_TOKEN,
			state: enums.AssetState.LIQUID,
			quantity: balance,
			usd_value: balance.mul(price),
			usd_value_per_quantity: price,
			captured_at: new Date(Number(block.timestamp) * 1000),
		})]
	}
}