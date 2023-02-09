/// <reference types="@orca-so/whirlpools-sdk/node_modules/@solana/web3.js" />
export default class SolanaNativeTokenScanner extends BaseSolanaAssetScanner {
    /** @type {enums.AssetType} */ static assetType: enums.AssetType;
    /** @type {number} */ static assetDecimals: number;
    /**
     * @param {solanaWeb3.PublicKey} pubkey
     * @returns {Promise<{ pubkey: solanaWeb3.PublicKey, account: solanaWeb3.AccountInfo<Buffer | solanaWeb3.ParsedAccountData> }[]>}
     */
    getStakeAccounts(pubkey: solanaWeb3.PublicKey): Promise<{
        pubkey: solanaWeb3.PublicKey;
        account: solanaWeb3.AccountInfo<Buffer | solanaWeb3.ParsedAccountData>;
    }[]>;
}
import BaseSolanaAssetScanner from "./base.js";
import * as solanaWeb3 from "@solana/web3.js";
import * as enums from "../../enums.js";
