'use strict'

import { StargateClient } from '@cosmjs/stargate'
import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { Tendermint34Client, HttpClient } from '@cosmjs/tendermint-rpc'

import * as enums from '../../enums.js'
import BaseAssetScanner from '../base.js'

/**
 * @typedef TokenInfo
 * @property {string} name
 * @property {number} decimals
 */

export default class BaseCosmosAssetScanner extends BaseAssetScanner {

	/** @type {Map<enums.AssetCode, string>} */		tokenInfoByAddr = new Map()
	/** @protected @type {StargateClient} */		client
	/** @protected @type {CosmWasmClient} */		cwClient
	/** @protected @type {Tendermint34Client} */	tmClient

	/**
	 * @protected
	 */
	async _init() {
		await super._init()
		this.rpcClient = new HttpClient(this.params.endpoint)
		this.tmClient = await this.rateLimiter.exec(() => Tendermint34Client.connect(this.params.endpoint))
		this.client = await this.rateLimiter.exec(() => StargateClient.connect(this.params.endpoint))
		this.cwClient = await this.rateLimiter.exec(() => CosmWasmClient.connect(this.params.endpoint))
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