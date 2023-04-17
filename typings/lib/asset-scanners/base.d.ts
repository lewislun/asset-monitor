export default class BaseAssetScanner extends BaseService {
    /** @protected @type {string[]} */ protected static requiredQueryKeys: string[];
    /** @protected @type {string} */ protected static nativeTokenAssetId: string;
    /**
     * @param {PriceAggregator} priceAggregator
     * @param {types.Chain} chain
     * @param {BiMap} [assetInfoMap]
     * @param {ServiceParamDict} [paramDict]
     * @param {RateLimiterOpts} [rateLimitOpts={}]
     */
    constructor(priceAggregator: PriceAggregator, chain: types.Chain, assetInfoMap?: BiMap<any, any>, paramDict?: ServiceParamDict, rateLimitOpts?: any);
    /** @type {types.Chain} */ chain: types.Chain;
    /** @protected @type {BiMap<types.AssetCode, string>} */ protected assetIdByCode: BiMap<types.AssetCode, string>;
    /** @protected @type {PriceAggregator} */ protected priceAggregator: PriceAggregator;
    get nativeTokenCode(): string;
    /**
     * @public
     * @param {AssetQuery} query
     * @returns {Promise<AssetSnapshot[]>}
     */
    public query(query: AssetQuery): Promise<AssetSnapshot[]>;
    /**
     * @protected
     * @abstract
     * @param {AssetQuery} assetQuery
     * @returns {Promise<AssetSnapshot[]>}
     */
    protected _query(assetQuery: AssetQuery): Promise<AssetSnapshot[]>;
}
export type RateLimiterOpts = import('../utils').RateLimiterOpts;
export type ServiceParamDict = import('../utils').ServiceParamDict;
import { BaseService } from "../utils/index.js";
import * as types from "../types.js";
import { BiMap } from "mnemonist";
import PriceAggregator from "../price-aggregator.js";
import { AssetQuery } from "../models/index.js";
import { AssetSnapshot } from "../models/index.js";
