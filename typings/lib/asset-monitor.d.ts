export default class AssetMonitor {
    /**
     * @param {AssetMonitorOpts} [opts={}]
     */
    constructor(opts?: AssetMonitorOpts);
    /** @type {Map<string, BaseAssetScanner>} */ assetScannerByName: Map<string, BaseAssetScanner>;
    /** @type {types.AssetQuery[]} */ queries: types.AssetQuery[];
    /** @protected @type {Map<string, BiMap<string, types.AssetCode>>} */ protected assetIdByCodeByChain: Map<string, BiMap<string, types.AssetCode>>;
    /** @protected @type {PriceAggregator} */ protected priceAggregator: PriceAggregator;
    /**
     * @protected
     * @param {string} path
     * @param {object} [secretObj]
     * @returns {types.ScannersConfig | types.QueryConfig}
     */
    protected loadConfig(path: string, secretObj?: object): types.ScannersConfig | types.QueryConfig;
    /**
     * @public
     * @returns {Promise<types.ScanResult>}
     */
    public scan(): Promise<types.ScanResult>;
    /**
     * @public
     * @param {string} [cronSchedule='0 * * * *']
     * @returns {Promise<void>}
     */
    public monitor(cronSchedule?: string): Promise<void>;
    /**
     * @public
     */
    public close(): Promise<void>;
    /**
     * @public
     * @param {types.AssetQuery} query
     */
    public addQuery(query: types.AssetQuery): void;
    /**
     * @public
     * @param {types.AssetScannerConfig} config
     */
    public addAssetScanner(config: types.AssetScannerConfig): void;
    /**
     * @public
     * @param {types.PriceScannerConfig} config
     */
    public addPriceScanner(config: types.PriceScannerConfig): void;
    /**
     * @protected
     * @param {types.QueryConfig} config
     */
    protected setupQueries(config: types.QueryConfig): void;
    /**
     * @protected
     * @param {types.ScannersConfig} config
     */
    protected setupScanners(config: types.ScannersConfig): void;
}
export type AssetMonitorOpts = {
    scannerConfigPath?: string;
    queryConfigPath?: string;
    secretsPath?: string;
};
import { BaseAssetScanner } from "./asset-scanners/index.js";
import * as types from "./types.js";
import { BiMap } from "mnemonist";
import PriceAggregator from "./price-aggregator.js";
