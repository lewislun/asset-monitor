/**
 * @enum {string}
 */
export const AssetType = {
    CEX_TOKEN: 'cex-token',
    NATIVE_TOKEN: 'native-token',
    SECONDARY_TOKEN: 'secondary-token',
    NFT: 'nft',
    OTHERS: 'others',
}

/**
 * @enum {string}
 */
export const AssetState = {
    CLAIMABLE: 'claimable',
    LIQUID: 'liquid',
    LOCKED: 'locked',
}

/**
 * @enum {string}
 */
export const AssetScannerType = {
    ALGORAND_NATIVE: 'algorand-native',
    APTOS_NATIVE: 'aptos-native',
    BITCOIN_BLOCKCHAIR_NATIVE: 'bitcoin-blockchair-native',
    BYBIT_SPOT: 'bybit-spot',
    CARDANO_BLOCKFROST_NATIVE: 'cardano-blockfrost-native',
    COSMOS_NATIVE: 'cosmos-native',
    COSMOS_SECONDARY: 'cosmos-secondary',
    ETHEREUM_NATIVE: 'ethereum-native',
    ETHEREUM_SECONDARY: 'ethereum-secondary',
    MULTIVERSX_NATIVE: 'multiversx-native',
    RIPPLE_NATIVE: 'ripple-native',
    SOLANA_NATIVE: 'solana-native',
    SOLANA_SECONDARY: 'solana-secondary',
    ORCA_WHIRLPOOL: 'orca-whirlpool',
}

/**
 * @enum {string}
 */
export const DefaultAssetTagCategory = {
    DAPP: 'dapp',
    WALLET_TYPE: 'wallet-type',
}

/**
 * @enum {string}
 */
export const PriceScannerType = {
    COIN_GECKO: 'coin-gecko',
    LIVE_COIN_WATCH: 'live-coin-watch',
}

/**
 * @enum {string}
 */
export const UserRole = {
    OWNER: 'owner',
    OPERATOR: 'operator',
    VIEWER: 'viewer',
}