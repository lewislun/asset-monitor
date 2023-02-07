import { ProxyNetworkProvider } from "@multiversx/sdk-network-providers"

import BaseAssetScanner from '../base.js'

export default class BaseMultiversxAssetScanner extends BaseAssetScanner {

	/** @protected @type {string[]} */		static requiredParamKeys = [ 'endpoint' ]
	/** @type {ProxyNetworkProvider} */		client

	/**
	 * @protected
	 */
	async _init() {
		await super._init()
		this.client = new ProxyNetworkProvider(this.paramDict.endpoint)
	}
}