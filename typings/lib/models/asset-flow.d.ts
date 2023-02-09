/**
 * @typedef {import('objection').Transaction} Transaction
 */
export default class AssetFlow extends BaseModel {
    /** @type {import('objection').JSONSchema} */
    static get jsonSchema(): import("objection").JSONSchema;
    /** @type {import('objection').RelationMappings} */
    static get relationMappings(): import("objection").RelationMappings;
    /**
     * @public
     * @param {types.AssetGroupSpecifier} fromGroupSpecifier
     * @param {types.AssetGroupSpecifier} toGroupSpecifier
     * @param {Decimal.Value} usdValue
     * @param {object} [opts={}]
     * @param {Date} [opts.time]
     * @param {Transaction} [opts.trx]
     * @returns {Promise<AssetFlow>}
     */
    public static recordFlow(fromGroupSpecifier: types.AssetGroupSpecifier, toGroupSpecifier: types.AssetGroupSpecifier, usdValue: Decimal.Value, opts?: {
        time?: Date;
        trx?: Transaction;
    }): Promise<AssetFlow>;
}
export type Transaction = import('objection').Transaction;
import BaseModel from "./base.js";
import * as types from "../types.js";
import Decimal from "decimal.js";
