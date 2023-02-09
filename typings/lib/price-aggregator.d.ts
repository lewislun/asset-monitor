export default class PriceAggregator {
    /** @protected @type {Map<enums.PriceScannerType, BasePriceScanner>} */ protected scannerByType: Map<enums.PriceScannerType, BasePriceScanner>;
    /**
     * @param {enums.PriceScannerType} type
     * @returns {BasePriceScanner}
     */
    getScanner(type: enums.PriceScannerType): BasePriceScanner;
    /**
     * @public
     */
    public close(): Promise<void>;
    /**
     * @public
     * @param {enums.PriceScannerType} type
     * @param {BasePriceScanner} scanner
     */
    public addPriceScanner(type: enums.PriceScannerType, scanner: BasePriceScanner): void;
    /**
     * @public
     * @param {types.AssetCode} code
     * @returns {Promise<number>}
     */
    public getPrice(code: types.AssetCode): Promise<number>;
}
import * as enums from "./enums.js";
import { BasePriceScanner } from "./price-scanners/index.js";
