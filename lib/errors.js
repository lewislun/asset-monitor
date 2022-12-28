'use strict'

export class InvalidAssetCodeError extends Error {
	/**
	 * @param {any} code
	 */
	constructor(code) {
		super(`Invalid asset code - assetCode: ${code}`)
	}
}

export class InvalidSecondaryTokenAddressError extends Error {
	/**
	 * @param {string} addr
	 */
	constructor(addr) {
		super(`Invalid secondary token address - addr: ${addr}`)
	}
}