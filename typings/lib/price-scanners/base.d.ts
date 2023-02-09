export default class BasePriceScanner extends BaseService {
    /**
     * @param {ServiceParamDict} paramDict
     * @param {object.<types.AssetCode, string>} assetIdByCode
     * @param {RateLimiterOpts} rateLimiterOpts
     */
    constructor(paramDict?: ServiceParamDict, assetIdByCode?: object<types.AssetCode, string>, rateLimiterOpts?: RateLimiterOpts);
    /** @protected @type {BiMap<types.AssetCode, string>} */ protected assetIdByCode: BiMap<types.AssetCode, string>;
    /**
     * @public
     * @param {types.AssetCode} code
     * @return {Promise<number>}
     */
    public getPrice(code: types.AssetCode): Promise<number>;
    /**
     * @protected
     * @abstract
     * @param {types.AssetCode} code
     * @return {Promise<number>}
     */
    protected _getPrice(code: types.AssetCode): Promise<number>;
}
export type RateLimiterOpts = import('../utils').RateLimiterOpts;
export type ServiceParamDict = import('../utils').ServiceParamDict;
import { BaseService } from "../utils/index.js";
import { BiMap } from "mnemonist";
