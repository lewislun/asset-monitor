export default class BaseCardanoAssetScanner extends BaseAssetScanner {
    /** @type {BlockFrostAPI} */ client: BlockFrostAPI;
    /**
     * Convert a shelley address into a stake key.
     * reference: https://cardano.stackexchange.com/questions/2003/extract-the-bech32-stake-address-from-a-shelly-address-in-javascript
     *
     * @protected
     * @param {string} shelleyAddr
     * @returns {string}
     */
    protected stakeKeyFromShelley(shelleyAddr: string): string;
}
import BaseAssetScanner from "../base.js";
import { BlockFrostAPI } from "@blockfrost/blockfrost-js";
