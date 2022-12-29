'use strict'

/**
 * @typedef CacheOpts
 * @property {number} defaultTtlMs
 */

/**
 * @class
 * @template K, V
 */
export default class Cache {
	/** @type {Map<K, V>} */					dataMap
	/** @type {Map<K, NodeJS.Timeout>} */		timeoutMap
	/** @type {number} */						defaultTtlMs = 10000

	/**
	 * @param {CacheOpts} opts
	 */
	constructor(opts = {}) {
		this.dataMap = new Map()
		this.timeoutMap = new Map()
		this.defaultTtlMs = opts?.defaultTtlMs ?? this.defaultTtlMs
	}

	/**
	 * @public
	 * @param {K} key
	 * @param {V} value
	 * @param {number} [ttlMs]
	 */
	set(key, value, ttlMs = undefined) {
		this.dataMap.set(key, value)
		ttlMs = ttlMs ?? this.defaultTtlMs
		const timeout = setTimeout(() => this.dataMap.delete(key), ttlMs)
		this.timeoutMap.set(key, timeout)
	}

	/**
	 * @public
	 * @param {K} key
	 * @returns {V}
	 */
	get(key) {
		return this.dataMap.get(key)
	}

	/**
	 * @public
	 * @param {K} key
	 */
	delete(key) {
		this.dataMap.delete(key)
		const timeout = this.timeoutMap.get(key)
		if (timeout) {
			clearTimeout(timeout)
			this.timeoutMap.delete(key)
		}
	}
}