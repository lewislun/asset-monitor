'use strict'

import * as solanaWeb3 from '@solana/web3.js'
import * as splTokenRegistry from '@solana/spl-token-registry'
import Decimal from 'decimal.js'

import * as types from '../../types.js'
import * as enums from '../../enums.js'
import BaseSolanaAssetScanner from './base.js'
import logger from '../../logger.js'

const TOKEN_PROGRAM_ID = new solanaWeb3.PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')

export default class SolanaSecondaryTokenScanner extends BaseSolanaAssetScanner {

	/** @type {enums.AssetType} */			static assetType = enums.AssetType.SECONDARY_TOKEN

	/**
	 * @public
	 * @param {types.AssetQuery} assetQuery
	 * @returns {Promise<types.AssetResult[]>}
	 */
	async query(assetQuery) {
		// TODO: usd value

		// TODO: query with timestamp
		if (!!assetQuery.timestamp) {
			throw new Error('Query with timestamp is not implemented')
		}

		const tokenListProvider = await new splTokenRegistry.TokenListProvider().resolve()
		const tokenList = tokenListProvider.filterByChainId(splTokenRegistry.ENV.MainnetBeta).getList()
		
		/** @type {Map.<string, splTokenRegistry.TokenInfo>} */
		const tokenInfoByAddr = new Map()
		tokenList.forEach(tokenInfo => tokenInfoByAddr.set(tokenInfo.address, tokenInfo))

		const pubkey = new solanaWeb3.PublicKey(assetQuery.addr)
		const { context, value } = await this.rateLimiter.exec(async () => await this.connection.getParsedTokenAccountsByOwner(pubkey, { programId: TOKEN_PROGRAM_ID }))
		const timestamp = await this.rateLimiter.exec(async () => await this.getTimestampFromContext(context))

		/** @type {types.AssetResult[]} */
		const results = value.map(rpcResult => {
			const tokenAddr = rpcResult.account?.data?.parsed?.info?.mint
			const tokenInfo = tokenInfoByAddr.get(tokenAddr)
			if (!tokenInfo) {
				logger.warn(`Unable to retrieve token info from address: ${tokenAddr}`)
			}
			const amount = rpcResult.account?.data?.parsed?.info?.tokenAmount?.amount
			const decimals = rpcResult.account?.data?.parsed?.info?.tokenAmount?.decimals
			const amountWithDp = amount && decimals? new Decimal(amount).div(10 ** decimals) : new Decimal(0)

			/** @type {types.AssetResult} */
			return {
				name: tokenInfo?.name ?? 'unknown',
				symbol: tokenInfo?.symbol ?? 'unknown',
				chain: SolanaSecondaryTokenScanner.chain,
				type: SolanaSecondaryTokenScanner.assetType,
				state: enums.AssetState.LIQUID,
				quantity: amountWithDp,
				usdValue: undefined,
				usdValuePerQuantity: undefined,
				timestamp: timestamp,
			}
		})

		return results
	}
}