export default class CoinGeckoPriceScanner extends BasePriceScanner {
    /** @type {string} */ vsCurrency: string;
    /** @protected @type {CoinGecko} */ protected client: CoinGecko;
    /** @protected @type {Cache<types.AssetCode, number>} */ protected priceCacheByCode: Cache<types.AssetCode, number>;
    /** @private @type {Promise<void>} */ private priceFetchPromise;
    /**
     * @protected
     */
    protected getAndCacheAllPrices(): Promise<void>;
    /**
     * @public
     * @param {types.AssetCode} code
     * @returns {Promise<string>}
     */
    public getAssetIdByCode(code: types.AssetCode): Promise<string>;
}
import BasePriceScanner from "./base.js";
import { Cache } from "../utils/index.js";
