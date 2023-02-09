/**
 * @typedef Erc20Info
 * @property {string} name
 * @property {number} decimals
 */
export default class BaseEthereumAssetScanner extends BaseAssetScanner {
    /** @type {Web3} */ web3: Web3;
    /** @type {Map<string, Erc20Info>} */ erc20InfoByAddr: Map<string, Erc20Info>;
    /**
     * @protected
     * @param {string} addr
     * @returns {Promise<Erc20Info>}
     */
    protected getErc20Info(addr: string): Promise<Erc20Info>;
}
export type Erc20Info = {
    name: string;
    decimals: number;
};
import BaseAssetScanner from "../base.js";
import Web3 from "web3";
