/**
 * @typedef {import('objection').Transaction} Transaction
 */
export default class AssetGroup extends BaseModel {
    /** @type {import('objection').JSONSchema} */
    static get jsonSchema(): import("objection").JSONSchema;
    /**
     * @public
     * @param {types.AssetGroupSpecifier} specifier
     * @param {object} [opts={}]
     * @param {Transaction} [opts.trx]
     * @returns {Promise<number | undefined>}
     */
    public static getGroupId(specifier: types.AssetGroupSpecifier, opts?: {
        trx?: Transaction;
    }): Promise<number | undefined>;
    /** @type {import('objection').RelationMappings} */
    static get relationMappings(): import("objection").RelationMappings;
}
export type Transaction = import('objection').Transaction;
import BaseModel from "./base.js";
import * as types from "../types.js";
