/**
 * @typedef {import('./base').AssetInfoMap} AssetInfoMap
 */

import { AssetScannerType } from '../enums.js'
import BaseAssetScanner from './base.js'
import * as algorand from './algorand/index.js'
import * as bybit from './bybit/index.js'
import * as cardano from './cardano/index.js'
import * as cosmos from './cosmos/index.js'
import * as ethereum from './ethereum/index.js'
import * as multiversx from './multiversx/index.js'
import * as ripple from './ripple/index.js'
import * as solana from './solana/index.js'

/**
 * @type {object.<AssetScannerType, typeof BaseAssetScanner>}
 */
export const ScannerClassByType = {
	// Algorand
	[AssetScannerType.ALGORAND_NATIVE]: algorand.AlgorandNativeTokenScanner,
	// Bybit
	[AssetScannerType.BYBIT_SPOT]: bybit.BybitSpotAssetScanner,
	// Cardano
	[AssetScannerType.CARDANO_NATIVE]: cardano.CardanoNativeTokenScanner,
	// Cosmos
	[AssetScannerType.COSMOS_NATIVE]: cosmos.CosmosNativeTokenScanner,
	[AssetScannerType.COSMOS_SECONDARY]: cosmos.CosmosSecondaryTokenScanner,
	// Ethereum
	[AssetScannerType.ETHEREUM_NATIVE]: ethereum.EthereumNativeTokenScanner,
	[AssetScannerType.ETHEREUN_SECONDARY]: ethereum.EthereumSecondaryTokenScanner,
	// Multiversx
	[AssetScannerType.MULTIVERSX_NATIVE]: multiversx.MultiversxNativeTokenScanner,
	// Ripple
	[AssetScannerType.RIPPLE_NATIVE]: ripple.RippleNativeTokenScanner,
	// Solana
	[AssetScannerType.SOLANA_NATIVE]: solana.SolanaNativeTokenScanner,
	[AssetScannerType.SOLANA_SECONDARY]: solana.SolanaSecondaryTokenScanner,
	[AssetScannerType.ORCA_WHIRLPOOL]: solana.OrcaWhirlpoolScanner,
}

export { default as BaseAssetScanner } from './base.js'
export * from './algorand/index.js'
export * from './bybit/index.js'
export * from './cardano/index.js'
export * from './cosmos/index.js'
export * from './ethereum/index.js'
export * from './multiversx/index.js'
export * from './ripple/index.js'
export * from './solana/index.js'
