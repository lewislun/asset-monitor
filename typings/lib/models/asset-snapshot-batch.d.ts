/**
 * @typedef {import('objection').Transaction} Transaction
 */
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
    static store(scanResult?: types.ScanResult, opts?: {
        trx?: Transaction;
    }): Promise<AssetSnapshotBatch>;
    /**
     * @returns {Promise<AssetSnapshotBatch>}
     */
    static getLatestBatch(): Promise<AssetSnapshotBatch>;
    /**
     * @returns {Promise<Decimal>}
     */
    getTotalValue(): Promise<Decimal>;
}
export type Transaction = import('objection').Transaction;
import BaseModel from "./base.js";
import { Decimal } from "decimal.js";
import * as types from "../types.js";
