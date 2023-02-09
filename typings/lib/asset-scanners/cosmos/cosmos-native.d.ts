export default class CosmosNativeTokenScanner extends BaseCosmosAssetScanner {
    /** @type {string} */ denom: string;
    /** @type {number} */ decimals: number;
    /** @protected @type {CustomizedQueryClient} */ protected queryClient: CustomizedQueryClient;
    /**
     * Since the registry's assetList includes coingecko id, we can use the native asset code to find the coingecko id from CoinGeckoPriceScanner, than use the coingecko id to search for the denom in AssetList.
     * @param {typeof assetLists[0]} assetList
     * @param {types.AssetCode} code
     * @returns {Promise<string | undefined>}
     */
    getDenomThruCoinGeckoByCode(assetList: (typeof assetLists)[0], code: types.AssetCode): Promise<string | undefined>;
    /**
     * @protected
     * @param {typeof assetLists[0]} assetList
     * @param {string} denom
     * @returns {number | undefined}
     */
    protected getDecimalsByDenom(assetList: (typeof assetLists)[0], denom: string): number | undefined;
}
export type DistributionExtension = import('@cosmjs/stargate').DistributionExtension;
export type CustomizedQueryClient = QueryClient & DistributionExtension;
import BaseCosmosAssetScanner from "./base.js";
import { assets as assetLists } from "chain-registry";
import * as types from "../../types.js";
import { QueryClient } from "@cosmjs/stargate";
