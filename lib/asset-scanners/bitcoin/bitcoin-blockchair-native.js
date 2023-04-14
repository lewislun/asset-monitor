import fetch from 'node-fetch'
import Decimal from 'decimal.js'

import * as enums from '../../enums.js'
import BaseAssetScanner from '../base.js'
import { parseDecimal, humanize } from '../../utils/index.js'
import { AssetQuery, AssetSnapshot } from '../../models/index.js'

export default class BitcoinBlockchairNativeTokenScanner extends BaseAssetScanner {

	/** @protected @type {string[]} */		static requiredParamKeys = [ 'endpoint' ]
	/** @type {number} */					static assetDecimals = 8

	/**
	 * @protected
	 * @param {AssetQuery} assetQuery
	 * @returns {Promise<AssetSnapshot[]>}
	 */
	async _query(assetQuery) {
		const code = this.nativeTokenCode
		const [ balance, price ] = await Promise.all([
			this.rateLimiter.exec(() => this.getBalance(assetQuery.addr)),
			this.priceAggregator.getPrice(code),
		])
		if (balance.cmp(0) <= 0) return []

		return [AssetSnapshot.fromJson({
			name: `${humanize(this.chain)} Native Token`,
			code: code,
			chain: this.chain,
			type: enums.AssetType.NATIVE_TOKEN,
			state: enums.AssetState.LIQUID,
			quantity: balance,
			usd_value: balance.mul(price),
			usd_value_per_quantity: price,
		})]
	}

	/**
	 * @protected
	 * @param {string} addr
	 * @param {number} [offset=0]
	 * @returns {Promise<Decimal>}
	 */
	async getBalance(addr, offset=0) {
		const LIMIT = 100
		const result = await fetch(`${this.paramDict.endpoint}/outputs?q=recipient(${addr}),is_spent(false)&limit=${LIMIT}&offset=${offset}`)
		const json = await result.json()

		// is_spent filter is somewhat broken, so we need to filter out spent outputs manually
		const balance = json.data
			.filter((output) => output.recipient === addr && !output.is_spent)
			.reduce((acc, cur) => parseDecimal(cur.value, BitcoinBlockchairNativeTokenScanner.assetDecimals).add(acc), new Decimal(0))

		// if there are more outputs, recursively fetch them
		if (json.context.total_rows > offset + LIMIT) {
			return balance.add(await this.getBalance(addr, offset + LIMIT))
		}
		return balance
	}
}