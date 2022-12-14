'use strict'

import RateLimiter from '../rate-limiter.js'
import * as types from '../types.js'
import * as enums from '../enums.js'

export default class BaseAssetScanner {

	/** @type {enums.Chain} */			static chain = undefined

	/** @type {string} */				endpoint
	/** @type {RateLimiter} */			rateLimiter

	/**
	 * @param {string} endpoint
	 * @param {number} [callPerSec=10]
	 * @param {number} [retryCount=5]
	 */
	constructor(endpoint, callPerSec = 10, retryCount = 5) {
		this.endpoint = endpoint

		this.rateLimiter = new RateLimiter(callPerSec, retryCount)
	}

	/**
	 * @abstract
	 * @param {types.AssetQuery} assetQuery
	 * @returns {Promise<types.AssetResult[]>}
	 */
	async query(assetQuery) {
		throw new Error('not implemented')
	}
}