'use strict'

/**
 * @enum {string}
 */
export const Chain = {
    AVALANCHE_C: 'avalanche-c',
    CARDANO: 'cardano',
    COMDEX: 'comdex',
    COSMOS_HUB: 'cosmos-hub',
    ETHEREUM: 'ethereum',
    EVMOS: 'evmos',
    JUNO: 'juno',
    OSMOSIS: 'osmosis',
    REBUS: 'rebus',
    SECRET_NETWORK: 'secret-network',
    SIFCHAIN: 'sifchain',
    SOLANA: 'solana',
    SOLANA_DEVNET: 'solana-devnet',
    SOLANA_TESTNET: 'solana-testnet',
    STARGAZE: 'stargaze',
}

/**
 * @enum {string}
 */
export const AssetType = {
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
export const AssetCode = {
    ADA: 'ADA',
    ATOM: 'ATOM',
    AVAX: 'AVAX',
    BTC: 'BTC',
    CMDX: 'CMDX',
    ETH: 'ETH',
    stETH: 'stETH',
    EVMOS: 'EVMOS',
    GLTO: 'GLTO',
    JUNO: 'JUNO',
    KI: 'KI',
    MNDE: 'MNDE',
    OSMO: 'OSMO',
    ORCA: 'ORCA',
    RAY: 'RAY',
    REBUS: 'REBUS',
    ROWAN: 'ROWAN',
    SCRT: 'SCRT',
    SOL: 'SOL',
    mSOL: 'mSOL',
    wSOL: 'wSOL',
    STARS: 'STARS',
    USDC: 'USDC',
    USDT: 'USDT',
}

/**
 * @enum {string}
 */
export const AssetScannerType = {
    CARDANO_NATIVE: 'cardano-native',
    COSMOS_NATIVE: 'cosmos-native',
    COSMOS_SECONDARY: 'cosmos-secondary',
    ETHEREUM_NATIVE: 'ethereum-native',
    ETHEREUN_SECONDARY: 'ethereum-secondary',
    SOLANA_NATIVE: 'solana-native',
    SOLANA_SECONDARY: 'solana-secondary',
    ORCA_WHIRLPOOL: 'orca-whirlpool',
}

/**
 * @enum {string}
 */
export const AssetTagCategory = {
    DAPP: 'dapp',
    WALLET_TYPE: 'wallet-type',
    REMARKS: 'remarks',
}

/**
 * @enum {string}
 */
export const PriceScannerType = {
    COIN_GECKO: 'coin-gecko',
    LIVE_COIN_WATCH: 'live-coin-watch',
}