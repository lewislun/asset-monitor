export default class AssetSnapshotBatch extends BaseModel {
    /** @type {import('objection').JSONSchema} */
    static get jsonSchema(): import("objection").JSONSchema;
    /** @type {import('objection').RelationMappings} */
    static get relationMappings(): import("objection").RelationMappings;
    /**
     * @param {types.ScanResult} scanResult
     * @param {object} [opts={}]
     * @param {Transaction} [opts.trx]
     * @returns {Promise<AssetSnapshotBatch>}
     */
    static storeScanResult(scanResult?: types.ScanResult, opts?: {
        trx?: Transaction;
    }): Promise<AssetSnapshotBatch>;
}
export type Transaction = import('objection').Transaction;
export type AssetQueryResult = import('../types.js').AssetQueryResult;
import BaseModel from "./base.js";
import * as types from "../types.js";
