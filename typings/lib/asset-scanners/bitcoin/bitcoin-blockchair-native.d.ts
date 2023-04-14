export default class BitcoinBlockchairNativeTokenScanner extends BaseAssetScanner {
    /** @type {number} */ static assetDecimals: number;
    /**
     * @protected
     * @param {string} addr
     * @param {number} [offset=0]
     * @returns {Promise<Decimal>}
     */
    protected getBalance(addr: string, offset?: number): Promise<Decimal>;
}
import BaseAssetScanner from "../base.js";
import Decimal from "decimal.js";
