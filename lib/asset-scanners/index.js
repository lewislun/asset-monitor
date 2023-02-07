/**
 * @typedef {import('./base').AssetInfoMap} AssetInfoMap
 */

import { AssetScannerType } from '../enums.js'
import BaseAssetScanner from './base.js'
import * as algorand from './algorand/index.js'
import * as cardano from './cardano/index.js'
import * as cosmos from './cosmos/index.js'
import * as ethereum from './ethereum/index.js'
import * as solana from './solana/index.js'
import BybitAssetScanner from './bybit.js'

/**
 * @type {object.<AssetScannerType, typeof BaseAssetScanner>}
 */
export const ScannerClassByType = {
	// Algorand
	[AssetScannerType.ALGORAND_NATIVE]: algorand.AlgorandNativeTokenScanner,
	// Bybit
	[AssetScannerType.BYBIT]: BybitAssetScanner,
	// Cardano
	[AssetScannerType.CARDANO_NATIVE]: cardano.CardanoNativeTokenScanner,
	// Cosmos
	[AssetScannerType.COSMOS_NATIVE]: cosmos.CosmosNativeTokenScanner,
	[AssetScannerType.COSMOS_SECONDARY]: cosmos.CosmosSecondaryTokenScanner,
	// Ethereum
	[AssetScannerType.ETHEREUM_NATIVE]: ethereum.EthereumNativeTokenScanner,
	[AssetScannerType.ETHEREUN_SECONDARY]: ethereum.EthereumSecondaryTokenScanner,
	// Solana
	[AssetScannerType.SOLANA_NATIVE]: solana.SolanaNativeTokenScanner,
	[AssetScannerType.SOLANA_SECONDARY]: solana.SolanaSecondaryTokenScanner,
	[AssetScannerType.ORCA_WHIRLPOOL]: solana.OrcaWhirlpoolScanner,
}

export { default as BaseAssetScanner } from './base.js'
export { default as BybitAssetScanner } from './bybit.js'
export * from './algorand/index.js'
export * from './cardano/index.js'
export * from './cosmos/index.js'
export * from './ethereum/index.js'
export * from './solana/index.js'
