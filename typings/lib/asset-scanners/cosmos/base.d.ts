/**
 * @typedef TokenInfo
 * @property {string} name
 * @property {number} decimals
 */
export default class BaseCosmosAssetScanner extends BaseAssetScanner {
    /** @type {Map<types.AssetCode, string>} */ tokenInfoByAddr: Map<types.AssetCode, string>;
    /** @protected @type {StargateClient} */ protected client: StargateClient;
    /** @protected @type {CosmWasmClient} */ protected cwClient: CosmWasmClient;
    /** @protected @type {Tendermint34Client} */ protected tmClient: Tendermint34Client;
    rpcClient: HttpClient;
    /**
     * @protected
     * @param {string} addr
     * @returns {Promise<TokenInfo>}
     */
    protected getTokenInfo(addr: string): Promise<TokenInfo>;
}
export type TokenInfo = {
    name: string;
    decimals: number;
};
import BaseAssetScanner from "../base.js";
import { StargateClient } from "@cosmjs/stargate";
import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { Tendermint34Client } from "@cosmjs/tendermint-rpc";
import { HttpClient } from "@cosmjs/tendermint-rpc";
