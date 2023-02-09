export default class EthereumNativeTokenScanner extends BaseEthereumAssetScanner {
    /** @type {enums.AssetType} */ static assetType: enums.AssetType;
    /** @type {number} */ static assetDecimals: number;
}
import BaseEthereumAssetScanner from "./base.js";
import * as enums from "../../enums.js";
