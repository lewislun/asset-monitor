'use strict'

/**
 * @enum {string}
 */
export const Chain = {
    AVALANCHE_C: 'avalanche-c',
    COSMOSHUB: 'cosmoshub',
    ETHEREUM: 'ethereum',
    EVMOS: 'evmos',
    JUNO: 'juno',
    STARGAZE: 'stargaze',
    SOLANA: 'solana',
    SOLANA_DEVNET: 'solana-devnet',
    SOLANA_TESTNET: 'solana-testnet',
}

/**
 * @enum {string}
 */
export const AssetType = {
    NATIVE_TOKEN: 'native-token',
    SECONDARY_TOKEN: 'secondary-token',
    LIQUIDITY: 'liquidity',
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
export const AssetCode = {
    ATOM: 'ATOM',
    AVAX: 'AVAX',
    BTC: 'BTC',
    ETH: 'ETH',
    stETH: 'stETH',
    EVMOS: 'EVMOS',
    JUNO: 'JUNO',
    KI: 'KI',
    MNDE: 'MNDE',
    STARS: 'STARS',
    SOL: 'SOL',
    mSOL: 'mSOL',
    wSOL: 'wSOL',
    ORCA: 'ORCA',
    RAY: 'RAY',
    USDC: 'USDC',
    USDT: 'USDT',
}

/**
 * @enum {string}
 */
export const AssetScannerType = {
    COSMOS_NATIVE: 'cosmos-native',
    ETHEREUM_NATIVE: 'ethereum-native',
    ETHEREUN_SECONDARY: 'ethereum-secondary',
    SOLANA_NATIVE: 'solana-native',
    SOLANA_SECONDARY: 'solana-secondary',
    ORCA_WHIRLPOOL: 'orca-whirlpool',
}