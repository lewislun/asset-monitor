'use strict'

/**
 * @enum {string}
 */
export const Chain = {
    CEX: 'cex',
    ETHEREUM: 'ethereum',
    SOLANA: 'solana',
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
    BTC: 'BTC',
    ETH: 'ETH',
    stETH: 'stETH',
    SOL: 'SOL',
    mSOL: 'mSOL',
    wSOL: 'wSOL',
    MNDE: 'MNDE',
    ORCA: 'ORCA',
    RAY: 'RAY',
    USDC: 'USDC',
    USDT: 'USDT',
}