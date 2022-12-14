'use strict'

import * as enums from '../enums.js'

export default class BasePriceScanner {
	
	/** @type {string} */ endpoint = undefined

	/**
	 * @param {string} endpoint
	 */
	constructor(endpoint) {
		this.endpoint = endpoint
	}

	/**
	 * @public
	 * @abstract
	 * @param {enums.AssetCode} code
	 * @return {Promise<number>}
	 */
	async getPrice(code) {
		throw new Error('not implemented')
	}
}