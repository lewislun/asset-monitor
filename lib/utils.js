'use strict'

import BN from 'bn.js'
import Decimal from 'decimal.js'

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