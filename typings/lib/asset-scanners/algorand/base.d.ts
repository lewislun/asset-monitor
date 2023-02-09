export default class BaseAlgorandAssetScanner extends BaseAssetScanner {
    /** @type {algosdk.Algodv2} */ client: algosdk.Algodv2;
}
import BaseAssetScanner from "../base.js";
import algosdk from "algosdk";
