'use strict'

import * as solanaWeb3 from '@solana/web3.js'
import * as splTokenRegistry from '@solana/spl-token-registry'
import Decimal from 'decimal.js'

import * as types from '../../types.js'
import * as enums from '../../enums.js'
import BaseSolanaAssetScanner, { TOKEN_PROGRAM_ID } from './base.js'

export default class SolanaSecondaryTokenScanner extends BaseSolanaAssetScanner {

	/** @type {enums.AssetType} */											static assetType = enums.AssetType.SECONDARY_TOKEN

	/** @protected @type {splTokenRegistry.TokenInfo[]} */					allTokenList
	/** @protected @type {Map.<string, splTokenRegistry.TokenInfo>} */		tokenInfoByAddr = new Map()

	/**
	 * @protected
	 */
	async _init() {
		await super._init()
		const tokenListProvider = await new splTokenRegistry.TokenListProvider().resolve()
		this.allTokenList = tokenListProvider.getList()
		this.allTokenList.forEach(tokenInfo => {
			if (!this.assetCodeByAddr.get(tokenInfo.address)) return
			this.tokenInfoByAddr.set(tokenInfo.address, tokenInfo)
		})
	}

	/**
	 * @protected
	 * @param {types.AssetQuery} assetQuery
	 * @returns {Promise<types.AssetQueryResult[]>}
	 */
	async _query(assetQuery) {
		const pubkey = new solanaWeb3.PublicKey(assetQuery.addr)
		const { context, value } = await this.rateLimiter.exec(() =>this.connection.getParsedTokenAccountsByOwner(pubkey, { programId: TOKEN_PROGRAM_ID }))
		const timestamp = await this.rateLimiter.exec(() =>this.getTimestampFromContext(context))

		/** @type {Map<enums.AssetCode, solanaWeb3.AccountInfo<solanaWeb3.ParsedAccountData>>} */
		const tokenAccByCode = new Map()
		value.forEach(rpcResult => {
			/** @type {string} */
			const tokenAddr = rpcResult.account?.data?.parsed?.info?.mint
			const code = this.assetCodeByAddr.get(tokenAddr)
			if (!code) return
			tokenAccByCode.set(code, rpcResult.account)
		})

		/** @type {types.AssetQueryResult[]} */
		const results = []
		for (const [addr, code] of this.assetCodeByAddr) {
			const tokenInfo = this.tokenInfoByAddr.get(addr)
			const tokenAcc = tokenAccByCode.get(code)

			// price
			const price = await this.priceAggregator.getPrice(code)

			// amount
			const amount = tokenAcc?.data?.parsed?.info?.tokenAmount?.amount ?? 0
			if (amount == 0) continue
			const decimals = tokenInfo?.decimals ?? await this.getSplTokenDecimals(addr)
			const amountWithDp = amount && decimals? new Decimal(amount).div(10 ** decimals) : new Decimal(0)

			/** @type {types.AssetQueryResult} */
			const result = {
				name: tokenInfo?.name ?? code,
				code: code,
				chain: this.chain,
				type: SolanaSecondaryTokenScanner.assetType,
				state: enums.AssetState.LIQUID,
				quantity: amountWithDp,
				usdValue: amountWithDp.mul(price),
				usdValuePerQuantity: price,
				timestamp: timestamp,
			}
			results.push(result)
		}

		return results
	}
}