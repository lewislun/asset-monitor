'use strict'

import { StargateClient } from '@cosmjs/stargate'
import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { Tendermint34Client } from '@cosmjs/tendermint-rpc'

import * as enums from '../../enums.js'
import BaseAssetScanner from '../base.js'
import PriceAggregator from '../../price-aggregator.js'

/**
 * @typedef {import('../utils').RateLimiterOpts} RateLimiterOpts
 * @typedef {import('../base').AssetInfoMap} AssetInfoMap
 * 
 * @typedef TokenInfo
 * @property {string} name
 * @property {number} decimals
 */

export default class BaseCosmosAssetScanner extends BaseAssetScanner {

	/** @type {string} */							endpoint
	/** @type {Map<enums.AssetCode, string>} */		assetInfoMap = new Map()
	/** @type {Map<enums.AssetCode, string>} */		tokenInfoByAddr = new Map()
	/** @protected @type {StargateClient} */		client
	/** @protected @type {CosmWasmClient} */		cwClient
	/** @protected @type {Tendermint34Client} */	tmClient

	/**
	 * @param {PriceAggregator} priceAggregator
	 * @param {enums.Chain} chain
	 * @param {AssetInfoMap} assetInfoMap
	 * @param {object} params
	 * @param {string} params.endpoint
	 * @param {RateLimiterOpts} [rateLimiterOpts={}]
	 */
	constructor(priceAggregator, chain, assetInfoMap, params, rateLimiterOpts = {}) {
		rateLimiterOpts.instanceKey = params.endpoint
		super(priceAggregator, chain, assetInfoMap, params, rateLimiterOpts)
		this.assetInfoMap = assetInfoMap
		this.endpoint = params.endpoint
	}

	/**
	 * @protected
	 */
	async _init() {
		await super._init()
		this.tmClient = await Tendermint34Client.connect(this.endpoint)
		this.client = await StargateClient.connect(this.endpoint)
		this.cwClient = await CosmWasmClient.connect(this.endpoint)
	}

	/**
	 * @protected
	 * @param {string} addr
	 * @returns {Promise<TokenInfo>}
	 */
	async getTokenInfo(addr) {
		const cachedTokenInfo = this.tokenInfoByAddr.get(addr)
		if (cachedTokenInfo) return cachedTokenInfo

		const tokenInfoRes = await this.rateLimiter.exec(() => this.cwClient.queryContractSmart(addr, { token_info: {} }))
		if (!tokenInfoRes) throw new Error('Unable to retrieve CW20 info from chain.')
		const tokenInfo = { name: tokenInfoRes.name, decimals: tokenInfoRes.decimals }
		this.tokenInfoByAddr.set(addr, tokenInfo)
		return tokenInfo
	}
}