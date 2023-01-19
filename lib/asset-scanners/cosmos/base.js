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
 */

export default class BaseCosmosAssetScanner extends BaseAssetScanner {

	/** @type {string} */				endpoint
	/** @type {StargateClient} */		client
	/** @type {CosmWasmClient} */		cwClient
	/** @type {Tendermint34Client} */	tmClient

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
}