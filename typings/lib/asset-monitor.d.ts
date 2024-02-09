export default class AssetMonitor {
    /**
     * @param {AssetMonitorOpts} [opts={}]
     */
    constructor(opts?: AssetMonitorOpts);
    /** @type {Map<string, Map<string, BaseAssetScanner>>} */ assetScannerByChainByType: Map<string, Map<string, BaseAssetScanner>>;
    /** @protected @type {Map<string, BiMap<string, types.AssetCode>>} */ protected assetIdByCodeByChain: Map<string, BiMap<string, types.AssetCode>>;
    /** @protected @type {PriceAggregator} */ protected priceAggregator: PriceAggregator;
    /** @protected @type {AssetMonitorTelegramBot} */ protected telegramBot: AssetMonitorTelegramBot;
    /** @protected @type {number[]} */ protected telegramNotiChatIds: number[];
    /**
     * @protected
     * @param {string} path
     * @param {object} [secretObj]
     * @returns {types.ScannersConfig | types.QueryConfig}
     */
    protected loadConfig(path: string, secretObj?: object): types.ScannersConfig | types.QueryConfig;
    /**
     * @param {string|string[]} content
     */
    sendTelegramNoti(content: string | string[]): Promise<void>;
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
import { BiMap } from "mnemonist";
import * as types from "./types.js";
import PriceAggregator from "./price-aggregator.js";
import AssetMonitorTelegramBot from "./telegram-bot.js";
