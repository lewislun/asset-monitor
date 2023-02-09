export default class SolanaSecondaryTokenScanner extends BaseSolanaAssetScanner {
    /** @type {enums.AssetType} */ static assetType: enums.AssetType;
    /** @protected @type {splTokenRegistry.TokenInfo[]} */ protected allTokenList: splTokenRegistry.TokenInfo[];
    /** @protected @type {Map.<string, splTokenRegistry.TokenInfo>} */ protected tokenInfoByAddr: Map<string, splTokenRegistry.TokenInfo>;
}
import BaseSolanaAssetScanner from "./base.js";
import * as splTokenRegistry from "@solana/spl-token-registry";
import * as enums from "../../enums.js";
