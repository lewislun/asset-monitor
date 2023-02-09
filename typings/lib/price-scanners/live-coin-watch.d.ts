export default class LiveCoinWatchPriceScanner extends BasePriceScanner {
    /** @type {string} */ vsCurrency: string;
    /** @protected @type {Cache<types.AssetCode, number>} */ protected priceCacheByCode: Cache<types.AssetCode, number>;
    /** @private @type {Promise<void>} */ private priceFetchPromise;
    /**
     * @protected
     */
    protected getAndCacheAllPrices(): Promise<void>;
    /**
     * @protected
     * @param {string[]} coinIds
     * @returns {Promise<Map<types.AssetCode, number>>}
     */
    protected getPrices(coinIds?: string[]): Promise<Map<types.AssetCode, number>>;
}
import BasePriceScanner from "./base.js";
import { Cache } from "../utils/index.js";
