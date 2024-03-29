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
     * @param {bool} [opts.create=false] Create the group if not exist and specifier is string.
     * @returns {Promise<number | undefined>}
     */
    public static getGroupId(specifier: types.AssetGroupSpecifier, opts?: {
        trx?: Transaction;
        create?: bool;
    }): Promise<number | undefined>;
    /** @type {import('objection').RelationMappings} */
    static get relationMappings(): import("objection").RelationMappings;
    /**
     * Get default group
     * @param {object} [opts={}]
     * @param {Transaction} [opts.trx]
     * @returns {Promise<AssetGroup>}
     */
    static getDefault(opts?: {
        trx?: Transaction;
    }): Promise<AssetGroup>;
}
export type Transaction = import('objection').Transaction;
import BaseModel from "./base.js";
import * as types from "../types.js";
