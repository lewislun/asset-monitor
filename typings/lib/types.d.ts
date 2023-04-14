declare const _default: {};
export default _default;
export type AssetCode = string;
export type Chain = string;
/**
 * Can either be group name (string), group id (number), or undefined to specify outside source.
 */
export type AssetGroupSpecifier = string | number | undefined;
export type AssetScannerConfig = {
    /**
     * If this is omitted, the name will be <type>@<chain>
     */
    name?: string;
    type: enums.AssetScannerType;
    chain: types.Chain;
    params: object;
};
export type PriceScannerConfig = {
    type: enums.PriceScannerType;
    params?: object;
    assetIdByCode: object<types.AssetCode, string>;
};
export type ScannersConfig = {
    rateLimiters?: {
        key: string;
        callPerSec: number;
    };
    assetIdByCodeByChain?: {
        [x: string]: {
            [x: string]: string;
        };
    };
    assetScanners: AssetScannerConfig[];
    priceScanners: PriceScannerConfig[];
};
export type ScanResult = {
    snapshots: import('./models').AssetSnapshot;
    totalUSDValue: Decimal;
    startTime: Date;
    endTime: Date;
    timeUsedMs: number;
};
import * as enums from "./enums.js";
import Decimal from "decimal.js";
