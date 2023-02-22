export type AssetType = string;
export namespace AssetType {
    const CEX_TOKEN: string;
    const NATIVE_TOKEN: string;
    const SECONDARY_TOKEN: string;
    const NFT: string;
    const OTHERS: string;
}
export type AssetState = string;
export namespace AssetState {
    const CLAIMABLE: string;
    const LIQUID: string;
    const LOCKED: string;
}
export type AssetScannerType = string;
export namespace AssetScannerType {
    const ALGORAND_NATIVE: string;
    const BYBIT_SPOT: string;
    const CARDANO_NATIVE: string;
    const COSMOS_NATIVE: string;
    const COSMOS_SECONDARY: string;
    const ETHEREUM_NATIVE: string;
    const ETHEREUN_SECONDARY: string;
    const MULTIVERSX_NATIVE: string;
    const RIPPLE_NATIVE: string;
    const SOLANA_NATIVE: string;
    const SOLANA_SECONDARY: string;
    const ORCA_WHIRLPOOL: string;
}
export type DefaultAssetTagCategory = string;
export namespace DefaultAssetTagCategory {
    const DAPP: string;
    const WALLET_TYPE: string;
}
export type PriceScannerType = string;
export namespace PriceScannerType {
    const COIN_GECKO: string;
    const LIVE_COIN_WATCH: string;
}
export type UserRole = string;
export namespace UserRole {
    const OWNER: string;
    const OPERATOR: string;
    const VIEWER: string;
}
