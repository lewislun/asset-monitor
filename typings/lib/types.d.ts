declare const _default: {};
export default _default;
export type AssetCode = string;
export type Chain = string;
/**
 * Can either be group name (string), group id (number), or undefined to specify outside source.
 */
export type AssetGroupSpecifier = string | number | undefined;
export type AssetQuery = {
    scannerName: string;
    addr?: string;
    /**
     * This should be safe to be publicly seen. If not, use apiSecret.
     */
    apiKey?: string;
    apiSecret?: string;
    extraTagMap: object;
    groupSpecifier?: AssetGroupSpecifier;
};
export type AssetQueryResult = {
    code: types.AssetCode;
    /**
     * display name
     */
    name: string;
    /**
     * Auto patched by BaseAssetScanner.
     */
    chain: Chain;
    type: enums.AssetType;
    state: enums.AssetState;
    quantity?: Decimal;
    usdValue: Decimal;
    usdValuePerQuantity?: number;
    timestamp: Date | number;
    tagMap?: object<string, string>;
    /**
     * Auto patched by BaseAssetScanner. Value of this field in psuedo: query.addr ?? query.apiKey ?? query.apiSecret(censored) ?? undefined.
     */
    accountId?: string;
    /**
     * Auto patched by BaseAssetScanner. Value is copied from query.
     */
    groupSpecifier?: AssetGroupSpecifier;
};
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
export type QueryConfig = {
    cron?: string;
    queries: types.AssetQuery[];
};
export type ScanResult = {
    queryResults: AssetQueryResult[];
    totalUSDValue: Decimal;
    startTime: Date;
    endTime: Date;
    timeUsedMs: number;
};
import * as enums from "./enums.js";
import Decimal from "decimal.js";
