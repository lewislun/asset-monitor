/**
 * @type {object.<AssetScannerType, typeof BaseAssetScanner>}
 */
export const ScannerClassByType: object<string, typeof BaseAssetScanner>;
export { default as BaseAssetScanner } from "./base.js";
export * from "./algorand/index.js";
export * from "./aptos/index.js";
export * from "./bybit/index.js";
export * from "./bitcoin/index.js";
export * from "./cardano/index.js";
export * from "./cosmos/index.js";
export * from "./ethereum/index.js";
export * from "./multiversx/index.js";
export * from "./ripple/index.js";
export * from "./solana/index.js";
export type AssetInfoMap = import('./base').AssetInfoMap;
import BaseAssetScanner from "./base.js";
