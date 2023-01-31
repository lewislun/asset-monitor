import Web3 from 'web3'

import BaseAssetScanner from '../base.js'
import erc20Abi from './erc20-abi.json' assert { type: 'json' }

/**
 * @typedef Erc20Info
 * @property {string} name
 * @property {number} decimals
 */

export default class BaseEthereumAssetScanner extends BaseAssetScanner {

	/** @protected @type {string[]} */			static requiredParamKeys = [ 'endpoint' ]
	/** @type {Web3} */							web3
	/** @type {Map<string, Erc20Info>} */		erc20InfoByAddr = new Map()

	/**
	 * @protected
	 */
	async _init() {
		await super._init()
		this.web3 = new Web3(this.paramDict.endpoint)
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