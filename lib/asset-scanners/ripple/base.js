import xrpl from 'xrpl'

import BaseAssetScanner from '../base.js'

export default class BaseRippleAssetScanner extends BaseAssetScanner {

	/** @protected @type {string[]} */		static requiredParamKeys = [ 'endpoint' ]
	/** @type {xrpl.Client} */				client

	/**
	 * @protected
	 */
	async _init() {
		await super._init()
		this.client = new xrpl.Client(this.paramDict.endpoint)
		await this.client.connect()
	}

	/**
	 * @public
	 */
	async close() {
		await this.client.disconnect()
		return await super.close()
	}
}