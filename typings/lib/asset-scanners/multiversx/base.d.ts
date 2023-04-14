export default class BaseMultiversxAssetScanner extends BaseAssetScanner {
    /** @type {ApiNetworkProvider} */ client: ApiNetworkProvider;
}
import BaseAssetScanner from "../base.js";
import { ApiNetworkProvider } from "@multiversx/sdk-network-providers";
