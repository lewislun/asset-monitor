export default class BaseAssetScanner extends BaseService {
    /** @protected @type {string[]} */ protected static requiredQueryKeys: string[];
    /** @protected @type {string} */ protected static nativeTokenAssetId: string;
    /**
     * @param {PriceAggregator} priceAggregator
     * @param {types.Chain} chain
     * @param {AssetInfoMap} [assetIdByCode]
     * @param {ServiceParamDict} [paramDict]
     * @param {RateLimiterOpts} [rateLimitOpts={}]
     */
    constructor(priceAggregator: PriceAggregator, chain: types.Chain, assetIdByCode?: AssetInfoMap, paramDict?: ServiceParamDict, rateLimitOpts?: RateLimiterOpts);
    /** @type {types.Chain} */ chain: types.Chain;
    /** @protected @type {BiMap<types.AssetCode, string>} */ protected assetIdByCode: BiMap<types.AssetCode, string>;
    /** @protected @type {PriceAggregator} */ protected priceAggregator: PriceAggregator;
    get nativeTokenCode(): string;
    /**
     * @public
     * @param {types.AssetQuery} assetQuery
     * @returns {Promise<types.AssetQueryResult[]>}
     */
    public query(assetQuery: types.AssetQuery): Promise<types.AssetQueryResult[]>;
    /**
     * @protected
     * @abstract
     * @param {types.AssetQuery} assetQuery
     * @returns {Promise<types.AssetQueryResult[]>}
     */
    protected _query(assetQuery: types.AssetQuery): Promise<types.AssetQueryResult[]>;
}
export type RateLimiterOpts = import('../utils').RateLimiterOpts;
export type ServiceParamDict = import('../utils').ServiceParamDict;
import { BaseService } from "../utils/index.js";
import * as types from "../types.js";
import { BiMap } from "mnemonist";
import PriceAggregator from "../price-aggregator.js";
