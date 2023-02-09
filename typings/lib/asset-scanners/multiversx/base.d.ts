export default class BaseMultiversxAssetScanner extends BaseAssetScanner {
    /** @type {ProxyNetworkProvider} */ client: ProxyNetworkProvider;
}
import BaseAssetScanner from "../base.js";
import { ProxyNetworkProvider } from "@multiversx/sdk-network-providers";
