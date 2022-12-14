'use strict'

import * as solanaWeb3 from '@solana/web3.js'

import * as enums from '../../enums.js'
import BaseAssetScanner from '../base.js'

export default class BaseSolanaAssetScanner extends BaseAssetScanner {

	/** @type {enums.Chain} */				static chain = enums.Chain.SOLANA

	/** @type {solanaWeb3.Connection} */	connection = undefined

	/**
	 * @param {string} endpoint
	 * @param {number} callPerSec
	 * @param {number} retryCount
	 */
	constructor(endpoint, callPerSec = 10, retryCount = 5) {
		super(endpoint, callPerSec, retryCount)
		this.connection = new solanaWeb3.Connection(this.endpoint)
	}

	/**
	 * @protected
	 * @param {solanaWeb3.Context} context
	 * @returns {Promise<number>}
	 */
	async getTimestampFromContext(context) {
		let timestamp = await this.connection.getBlockTime(context.slot)
		if (!timestamp) {
			throw new Error(`Block time estimation not possible - slot: ${context.slot}`)
		}
		return timestamp
	}
}