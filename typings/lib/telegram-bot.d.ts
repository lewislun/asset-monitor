/**
 * @typedef {import('./asset-monitor').default} AssetMonitor
 */
export default class AssetMonitorTelegramBot extends TelegramCommander {
    /**
     * @param {AssetMonitor} assetMonitor
     */
    initAssetMonitorCommands(assetMonitor: AssetMonitor): Promise<void>;
}
export type AssetMonitor = import('./asset-monitor').default;
import { TelegramCommander } from "telegram-commander/typings/lib/index.js";
