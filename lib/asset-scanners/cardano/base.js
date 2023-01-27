'use strict'

import { bech32 } from 'bech32'
import { BlockFrostAPI } from '@blockfrost/blockfrost-js'

import BaseAssetScanner from '../base.js'

export default class BaseCardanoAssetScanner extends BaseAssetScanner {

	/** @protected @type {string[]} */		static requiredParamKeys = [ 'apiKey' ]
	/** @type {BlockFrostAPI} */			client

	/**
	 * @protected
	 */
	async _init() {
		await super._init()
		this.client = new BlockFrostAPI({
			projectId: this.paramDict.apiKey,
		})
	}

	/**
	 * Convert a shelley address into a stake key.
	 * reference: https://cardano.stackexchange.com/questions/2003/extract-the-bech32-stake-address-from-a-shelly-address-in-javascript
	 * 
	 * @protected
	 * @param {string} shelleyAddr
	 * @returns {string}
	 */
	stakeKeyFromShelley(shelleyAddr) {
		const addrWords = bech32.fromWords(bech32.decode(shelleyAddr, 1000).words)
		const addrHex = Buffer.from(addrWords).toString('hex')
		const stakeKeyHex = 'e1' + addrHex.slice(-56)
		const stakeKeyWords = bech32.toWords(Uint8Array.from(Buffer.from(stakeKeyHex, 'hex')))
		return bech32.encode('stake', stakeKeyWords)
	}
}