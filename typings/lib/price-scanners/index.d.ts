/**
 * @type {object.<PriceScannerType, typeof BasePriceScanner>}
 */
export const ScannerClassByType: object<string, typeof BasePriceScanner>;
export { default as BasePriceScanner } from "./base.js";
export { default as CoinGeckoPriceScanner } from "./coin-gecko.js";
import BasePriceScanner from "./base.js";
