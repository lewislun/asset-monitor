'use strict'

import Web3 from 'web3'

import * as enums from '../../enums.js'
import * as errors from '../../errors.js'
import BaseAssetScanner from '../base.js'
import erc20Abi from './erc20-abi.json' assert { type: 'json' }

/**
 * @typedef Erc20Info
 * @property {string} name
 * @property {number} decimals
 */

/**
 * @type {Object.<number, enums.Chain>}
 */
const CHAIN_BY_CHAIN_ID = {
	1: enums.Chain.ETHEREUM,
	43114: enums.Chain.AVALANCHE_C,
}

export default class BaseEthereumAssetScanner extends BaseAssetScanner {

	/** @type {Web3} */							web3
	/** @type {Map<string, Erc20Info>} */		erc20InfoByAddr = new Map()

	/**
	 * @protected
	 */
	async _init() {
		await super._init()
		this.web3 = new Web3(this.params.endpoint)
		await this.verifyChain()
	}

	async verifyChain() {
		const chainId = await this.rateLimiter.exec(() => this.web3.eth.getChainId())
		const expectedChain = CHAIN_BY_CHAIN_ID[chainId]
		if (this.chain !== expectedChain)
			throw new errors.ChainMismatchError(expectedChain, this.chain, this.web3.currentProvider.host)
	}

	/**
	 * @protected
	 * @param {string} addr
	 * @returns {Promise<Erc20Info>}
	 */
	async getErc20Info(addr) {
		const cachedValue = this.erc20InfoByAddr.get(addr)
		if (cachedValue) return cachedValue

		
		const contract = new this.web3.eth.Contract(erc20Abi, addr)
		const [ name, decimals ] = await Promise.all([
			this.rateLimiter.exec(() => contract.methods.name().call()),
			this.rateLimiter.exec(() => contract.methods.decimals().call()),
		])
		const erc20Info = { name, decimals }
		this.erc20InfoByAddr.set(addr, erc20Info)
		return erc20Info
	}
}