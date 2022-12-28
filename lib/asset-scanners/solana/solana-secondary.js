'use strict'

import * as solanaWeb3 from '@solana/web3.js'
import * as splTokenRegistry from '@solana/spl-token-registry'
import Decimal from 'decimal.js'

import * as types from '../../types.js'
import * as enums from '../../enums.js'
import BaseSolanaAssetScanner, { TOKEN_PROGRAM_ID, ASSET_CODE_BY_ADDR } from './base.js'

export default class SolanaSecondaryTokenScanner extends BaseSolanaAssetScanner {

	/** @type {enums.AssetType} */											static assetType = enums.AssetType.SECONDARY_TOKEN

	/** @protected @type {splTokenRegistry.TokenInfo[]} */					allTokenList
	/** @protected @type {Map.<string, splTokenRegistry.TokenInfo>} */		tokenInfoByAddr

	/**
	 * @protected
	 */
	async _init() {
		await super._init()
		const tokenListProvider = await new splTokenRegistry.TokenListProvider().resolve()
		this.allTokenList = tokenListProvider.getList()
		this.tokenInfoByAddr = new Map()
		this.allTokenList.forEach(tokenInfo => {
			if (!ASSET_CODE_BY_ADDR[tokenInfo.address]) return
			this.tokenInfoByAddr.set(tokenInfo.address, tokenInfo)
		})
	}

	/**
	 * @protected
	 * @param {types.AssetQuery} assetQuery
	 * @returns {Promise<types.AssetResult[]>}
	 */
	async _query(assetQuery) {
		const pubkey = new solanaWeb3.PublicKey(assetQuery.addr)
		const { context, value } = await this.rateLimiter.exec(async () => await this.connection.getParsedTokenAccountsByOwner(pubkey, { programId: TOKEN_PROGRAM_ID }))
		const timestamp = await this.rateLimiter.exec(async () => await this.getTimestampFromContext(context))

		/** @type {Map<enums.AssetCode, solanaWeb3.AccountInfo<solanaWeb3.ParsedAccountData>>} */
		const tokenAccByCode = new Map()
		value.forEach(rpcResult => {
			/** @type {string} */
			const tokenAddr = rpcResult.account?.data?.parsed?.info?.mint
			const code = ASSET_CODE_BY_ADDR[tokenAddr]
			if (!code) return
			tokenAccByCode.set(code, rpcResult.account)
		})

		/** @type {types.AssetResult[]} */
		const results = []
		for (let addr in ASSET_CODE_BY_ADDR) {
			const code = ASSET_CODE_BY_ADDR[addr]
			const tokenInfo = this.tokenInfoByAddr.get(addr)
			const tokenAcc = tokenAccByCode.get(code)

			// price
			const price = await this.priceAggregator.getPrice(code)

			// amount
			const amount = tokenAcc?.data?.parsed?.info?.tokenAmount?.amount ?? 0
			const decimals = tokenInfo?.decimals ?? 0
			const amountWithDp = amount && decimals? new Decimal(amount).div(10 ** decimals) : new Decimal(0)

			/** @type {types.AssetResult} */
			const result = {
				name: tokenInfo?.name ?? 'unknown',
				code: code,
				chain: SolanaSecondaryTokenScanner.chain,
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