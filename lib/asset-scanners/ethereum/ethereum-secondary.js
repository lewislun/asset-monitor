import * as enums from '../../enums.js'
import { parseDecimal } from '../../utils/common.js'
import BaseEthereumAssetScanner from './base.js'
import erc20Abi from './erc20-abi.json' assert { type: 'json' }
import { AssetQuery, AssetSnapshot } from '../../models/index.js'

export default class EthereumSecondaryTokenScanner extends BaseEthereumAssetScanner {

	/**
	 * @protected
	 * @param {AssetQuery} assetQuery
	 * @returns {Promise<AssetSnapshot[]>}
	 */
	async _query(assetQuery) {
		const block = await this.rateLimiter.exec(() => this.web3.eth.getBlock('latest', true))

		/** @type {AssetSnapshot[]} */
		const results = []
		for (const [code, addr] of this.assetIdByCode) {
			if (addr === BaseEthereumAssetScanner.nativeTokenAssetId) continue

			const contract = new this.web3.eth.Contract(erc20Abi, addr)
			const [ { name, decimals }, balanceRaw, price ] = await Promise.all([
				this.getErc20Info(addr),
				this.rateLimiter.exec(() => contract.methods.balanceOf(assetQuery.addr).call()),
				this.priceAggregator.getPrice(code)
			])
			const balance = parseDecimal(balanceRaw, decimals)
			if (balance.cmp(0) == 0) continue

			results.push(AssetSnapshot.fromJson({
				name,
				code,
				chain: this.chain,
				type: enums.AssetType.SECONDARY_TOKEN,
				state: enums.AssetState.LIQUID,
				quantity: balance,
				usd_value: balance.mul(price),
				usd_value_per_quantity: price,
				captured_at: new Date(Number(block.timestamp * 1000)),
			}))
		}

		return results
	}
}