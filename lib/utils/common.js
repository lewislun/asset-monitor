'use strict'

import BN from 'bn.js'
import Decimal from 'decimal.js'
import { Model } from 'objection'

/**
 * @typedef {import('objection').Transaction} Transaction
 */

/**
 * @param {Decimal.Value | BN} int
 * @param {number} decimals
 * @returns {Decimal}
 */
export function parseDecimal(int, decimals) {
	if (int instanceof BN) {
		return new Decimal(int.toString(10)).div(10 ** decimals)
	}
	return new Decimal(int).div(10 ** decimals)
}

/**
 * @param {number} timeMs
 */
export async function sleep(timeMs) {
	await new Promise(resolve => setTimeout(resolve, timeMs))
}

/**
 * @param {enum} enumObj
 * @param {any} val
 * @returns {boolean}
 */
export function isEnumMember(enumObj, val) {
	return Object.values(enumObj).includes(val)
}

/**
 * @template T
 * @param {(trx: Transaction) => Promise<T>} func
 * @param {Transaction} [trx]
 * @returns {Promise<T>}
 */
export async function startOrInheritTransaction(func, trx = undefined) {
	const isOwnTrx = !trx
	trx = trx ?? await Model.startTransaction()
	let result
	try {
		result = await func(trx)
	} catch (e) {
		if (isOwnTrx) await trx.rollback()
		throw e
	}
	if (isOwnTrx) await trx.commit()
	return result
}

/**
 * @param {object} obj This object will be altered.
 * @returns {object}
 */
export function rmUndefinedInObj(obj) {
	Object.keys(obj).forEach((key) => typeof obj[key] === 'undefined' && delete obj[key])
	return obj
}