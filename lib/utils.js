'use strict'

import BN from 'bn.js'
import Decimal from 'decimal.js'

/**
 * @param {number | BN} int
 * @param {number} decimals
 * @returns {Decimal}
 */
export function int2Decimal(int, decimals) {
	if (int instanceof BN) {
		return new Decimal(int.toString(10)).div(10 ** decimals)
	}
	return new Decimal(int).div(10 ** decimals)
}