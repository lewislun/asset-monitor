import algosdk from 'algosdk'

import BaseAssetScanner from '../base.js'

export default class BaseAlgorandAssetScanner extends BaseAssetScanner {

	/** @protected @type {string[]} */		static requiredParamKeys = [ 'endpoint' ]
	/** @type {algosdk.Algodv2} */			client

	/**
	 * @protected
	 */
	async _init() {
		await super._init()
		this.client = new algosdk.Algodv2(this.paramDict.apiKey ?? '', this.paramDict.endpoint)
	}
}