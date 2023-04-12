import { AptosClient } from 'aptos'
import BaseAssetScanner from '../base.js'

// This class is the base class for all Aptos scanners.
export default class BaseAptosAssetScanner extends BaseAssetScanner {

	/** @protected @type {string[]} */		static requiredParamKeys = [ 'endpoint' ]

	async _init() {
		await super._init()
		this.client = new AptosClient(this.paramDict.endpoint)
	}
}