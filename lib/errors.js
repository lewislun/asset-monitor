'use strict'

import * as enums from './enums.js'

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

export class InvalidAssetScannerTypeError extends Error {
	/**
	 * @param {any} type
	 */
	constructor(type) {
		super(`Invalid asset scanner type - ${type}`)
	}
}

export class InvalidChainError extends Error {
	/**
	 * @param {any} chain
	 */
	constructor(chain) {
		super(`Invalid chain - ${chain}`)
	}
}

export class NotImplementedError extends Error {
	/**
	 * @param {string} extraMsg
	 */
	constructor(extraMsg) {
		super(`Feature not implemented - ${extraMsg}`)
	}
}

export class AssetScannerNotFoundError extends Error {
	/**
	 * @param {string} name
	 */
	constructor(name) {
		super(`Asset Scanner not found - name: ${name}`)
	}
}

export class ChainMismatchError extends Error {
	/**
	 * @param {enums.Chain} expectedChain
	 * @param {enums.Chain} actualChain
	 * @param {string} endpoint
	 */
	constructor(expectedChain, actualChain, endpoint) {
		super(`Chain Mismatch - expectedChain: ${expectedChain}, actualChain: ${actualChain}, endpoint: ${endpoint}`)
	}
}