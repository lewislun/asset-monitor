export default class BaseAptosAssetScanner extends BaseAssetScanner {
    client: AptosClient;
}
import BaseAssetScanner from "../base.js";
import { AptosClient } from "aptos";
