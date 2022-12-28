'use strict'

import Web3 from 'web3'

import * as enums from '../../enums.js'
import * as errors from '../../errors.js'
import BaseAssetScanner from '../base.js'

/**
 * @type {Object.<number, enums.Chain>}
 */
export const CHAIN_BY_CHAIN_ID = {
	1: enums.Chain.ETHEREUM,
}

export default class BaseEthereumAssetScanner extends BaseAssetScanner {

	/** @type {Web3} */			web3
	/** @type {enums.Chain} */	chain

	/**
	 * @param {PriceAggregator} priceAggregator
	 * @param {string} endpoint
	 * @param {RateLimiterOpts} [rateLimiterOpts={}]
	 */
	constructor(priceAggregator, endpoint, rateLimiterOpts = {}) {
		rateLimiterOpts.instanceKey = endpoint
		super(priceAggregator, rateLimiterOpts)
		this.web3 = new Web3(endpoint)
	}

	/**
	 * @protected
	 */
	async _init() {
		await super._init()

		// get chain
		const chainId = await this.rateLimiter.exec(() => this.web3.eth.getChainId())
		this.chain = CHAIN_BY_CHAIN_ID[chainId]
		if (!this.chain) throw new errors.InvalidEndpoint(`chain id ${chainId} does not exist in map.`)
	}
}