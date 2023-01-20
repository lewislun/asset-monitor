'use strict'

import { QueryClient, setupDistributionExtension } from '@cosmjs/stargate'
import Decimal from 'decimal.js'

import * as enums from '../../enums.js'
import * as types from '../../types.js'
import { parseDecimal, humanize } from '../../utils/index.js'
import BaseCosmosAssetScanner from './base.js'

/**
 * @typedef {import('@cosmjs/stargate').DistributionExtension} DistributionExtension
 */

const DENOM_INFO_BY_CHAIN = {
	[enums.Chain.COMDEX]: {
		code: enums.AssetCode.CMDX,
		decimals: 6,
		rewardDecimals: 24,
		denom: 'ucmdx',
	},
	[enums.Chain.COSMOS_HUB]: {
		code: enums.AssetCode.ATOM,
		decimals: 6,
		rewardDecimals: 24,
		denom: 'uatom',
	},
	[enums.Chain.EVMOS]: {
		code: enums.AssetCode.EVMOS,
		decimals: 18,
		rewardDecimals: 36,
		denom: 'aevmos',
	},
	[enums.Chain.JUNO]: {
		code: enums.AssetCode.JUNO,
		decimals: 6,
		rewardDecimals: 24,
		denom: 'ujuno',
	},
	[enums.Chain.OSMOSIS]: {
		code: enums.AssetCode.OSMO,
		decimals: 6,
		rewardDecimals: 24,
		denom: 'uosmo',
	},
	[enums.Chain.REBUS]: {
		code: enums.AssetCode.REBUS,
		decimals: 18,
		rewardDecimals: 36,
		denom: 'arebus',
	},
	[enums.Chain.SECRET_NETWORK]: {
		code: enums.AssetCode.SCRT,
		decimals: 6,
		rewardDecimals: 24,
		denom: 'uscrt',
	},
	[enums.Chain.SIFCHAIN]: {
		code: enums.AssetCode.ROWAN,
		decimals: 18,
		rewardDecimals: 36,
		denom: 'rowan',
	},
	[enums.Chain.STARGAZE]: {
		code: enums.AssetCode.STARS,
		decimals: 6,
		rewardDecimals: 24,
		denom: 'ustars',
	}
}

export default class CosmosNativeTokenScanner extends BaseCosmosAssetScanner {

	/** @protected @type {QueryClient & DistributionExtension} */	queryClient

	/**
	 * @protected
	 */
	async _init() {
		await super._init()
		this.queryClient = QueryClient.withExtensions(this.tmClient, setupDistributionExtension)
	}

	/**
	 * @protected
	 * @param {types.AssetQuery} query
	 * @returns {Promise<types.AssetQueryResult[]>}
	 */
	async _query(query) {
		const denomInfo = DENOM_INFO_BY_CHAIN[this.chain]
		const [ price, block, coin, stakedCoin, stakingRewardResult ] = await Promise.all([
			this.priceAggregator.getPrice(denomInfo.code),
			this.rateLimiter.exec(() => this.client.getBlock()),
			this.rateLimiter.exec(() => this.client.getBalance(query.addr, denomInfo.denom)),
			this.rateLimiter.exec(() => this.client.getBalanceStaked(query.addr)),
			this.rateLimiter.exec(() => this.queryClient.distribution.delegationTotalRewards(query.addr)),
		])

		/** @type {types.AssetQueryResult} */
		const timestamp = Math.floor(new Date(block.header.time).getTime() / 1000)
		const results = []

		// Liquid tokens
		const balance = parseDecimal(coin.amount, denomInfo.decimals)
		if (balance.cmp(0) != 0) {
			results.push({
				name: `${humanize(this.chain)} Native Token`,
				code: denomInfo.code,
				chain: this.chain,
				type: enums.AssetType.NATIVE_TOKEN,
				state: enums.AssetState.LIQUID,
				quantity: balance,
				usdValue: balance.mul(price),
				usdValuePerQuantity: price,
				timestamp: timestamp,
			})
		}

		// Staked tokens
		if (stakedCoin && stakedCoin.amount != '0') {
			const balance = parseDecimal(stakedCoin.amount, denomInfo.decimals)
			results.push({
				name: `Staked ${humanize(this.chain)} Native Token`,
				code: denomInfo.code,
				chain: this.chain,
				type: enums.AssetType.NATIVE_TOKEN,
				state: enums.AssetState.LOCKED,
				quantity: balance,
				usdValue: balance.mul(price),
				usdValuePerQuantity: price,
				timestamp: timestamp,
			})
		}

		// Staking rewards
		if (stakingRewardResult) {
			const coin = stakingRewardResult.total.find(c => c.denom === denomInfo.denom)
			if (coin && coin.amount !== '0') {
				const balance = parseDecimal(coin.amount, denomInfo.rewardDecimals)
				results.push({
					name: `${humanize(this.chain)} Staking Reward`,
					code: denomInfo.code,
					chain: this.chain,
					type: enums.AssetType.NATIVE_TOKEN,
					state: enums.AssetState.CLAIMABLE,
					quantity: balance,
					usdValue: balance.mul(price),
					usdValuePerQuantity: price,
					timestamp: timestamp,
				})
			}
		}

		return results
	}
}