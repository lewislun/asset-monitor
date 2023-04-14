import * as solanaWeb3 from '@solana/web3.js'
import Decimal from 'decimal.js'

import * as enums from '../../enums.js'
import { humanize, parseDecimal } from '../../utils/index.js'
import BaseSolanaAssetScanner from './base.js'
import { AssetQuery, AssetSnapshot } from '../../models/index.js'

export default class SolanaNativeTokenScanner extends BaseSolanaAssetScanner {

	/** @type {enums.AssetType} */			static assetType = enums.AssetType.NATIVE_TOKEN
	/** @type {number} */					static assetDecimals = 9

	/**
	 * @protected
	 * @param {AssetQuery} assetQuery
	 * @returns {Promise<AssetSnapshot[]>}
	 */
	async _query(assetQuery) {
		// get SOL price
		const code = this.nativeTokenCode
		const solPrice = await this.priceAggregator.getPrice(code)

		/** @type {AssetSnapshot[]} */
		const snapshots = []

		// get data from chain
		const pubkey = new solanaWeb3.PublicKey(assetQuery.addr)
		const [ balanceRes, stakeAccs ] = await Promise.all([
			this.rateLimiter.exec(() => this.connection.getBalanceAndContext(pubkey, 'finalized')),
			this.getStakeAccounts(pubkey),
		])

		// get SOL amount
		const capturedAt = await this.rateLimiter.exec(() => this.getDatetimeFromContext(balanceRes.context))
		const amount = new Decimal(balanceRes.value).div(10 ** SolanaNativeTokenScanner.assetDecimals)
		if (amount.cmp(0) > 0) {
			snapshots.push(AssetSnapshot.fromJson({
				name: `${humanize(this.chain)} Native Token`,
				code,
				chain: this.chain,
				type: SolanaNativeTokenScanner.assetType,
				state: enums.AssetState.LIQUID,
				quantity: amount,
				usd_value: amount.mul(solPrice),
				usd_value_per_quantity: solPrice,
				captured_at: capturedAt,
			}))
		}

		// get staked amount
		const stakedLamports = stakeAccs.reduce((acc, cur) => acc + cur.account.lamports, 0)
		if (stakedLamports > 0) {
			const amount = parseDecimal(stakedLamports, SolanaNativeTokenScanner.assetDecimals)
			snapshots.push(AssetSnapshot.fromJson({
				name: `Staked ${humanize(this.chain)} Native Token`,
				code,
				chain: this.chain,
				type: SolanaNativeTokenScanner.assetType,
				state: enums.AssetState.LOCKED,
				quantity: amount,
				usd_value: amount.mul(solPrice),
				usd_value_per_quantity: solPrice,
				captured_at: capturedAt,
			}))
		}

		return snapshots
	}

	/**
	 * @param {solanaWeb3.PublicKey} pubkey
	 * @returns {Promise<{ pubkey: solanaWeb3.PublicKey, account: solanaWeb3.AccountInfo<Buffer | solanaWeb3.ParsedAccountData> }[]>}
	 */
	async getStakeAccounts(pubkey) {
		return this.rateLimiter.exec(() => this.connection.getParsedProgramAccounts(
			solanaWeb3.StakeProgram.programId,
			{
				filters: [
					{ dataSize: 200 },
					{ memcmp: { offset: 44, bytes: pubkey.toBase58() } },
				]
			},
		))
	}
}