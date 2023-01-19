'use strict'

/**
 * @typedef {import('./base').AssetInfoMap} AssetInfoMap
 */

import { AssetScannerType } from '../enums.js'
import BaseAssetScanner from './base.js'
import * as cosmos from './cosmos/index.js'
import * as ethereum from './ethereum/index.js'
import * as solana from './solana/index.js'

/**
 * @type {object.<AssetScannerType, typeof BaseAssetScanner>}
 */
export const ScannerClassByType = {
	// Cosmos
	[AssetScannerType.COSMOS_NATIVE]: cosmos.CosmosNativeTokenScanner,
	// Ethereum
	[AssetScannerType.ETHEREUM_NATIVE]: ethereum.EthereumNativeTokenScanner,
	[AssetScannerType.ETHEREUN_SECONDARY]: ethereum.EthereumSecondaryTokenScanner,
	// Solana
	[AssetScannerType.SOLANA_NATIVE]: solana.SolanaNativeTokenScanner,
	[AssetScannerType.SOLANA_SECONDARY]: solana.SolanaSecondaryTokenScanner,
	[AssetScannerType.ORCA_WHIRLPOOL]: solana.OrcaWhirlpoolScanner,
}

export { default as BaseAssetScanner } from './base.js'
export * from './cosmos/index.js'
export * from './ethereum/index.js'
export * from './solana/index.js'
