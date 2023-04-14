/**
 * @typedef {import('objection').Transaction} Transaction
 */
export default class AssetQuery extends BaseModel {
    /** @type {import('objection').JSONSchema} */
    static get jsonSchema(): import("objection").JSONSchema;
    /** @type {import('objection').RelationMappings} */
    static get relationMappings(): import("objection").RelationMappings;
    static get modifiers(): {
        /**
         * @param {import('objection').QueryBuilder} query
         */
        isEnabled(query: import("objection").QueryBuilder<any, any[]>): void;
    };
    /**
     * @param {string} configPath
     * @param {object} [opts={}]
     * @param {Transaction} [opts.trx]
     * @returns {Promise<AssetQuery[]>}
     */
    static importFromQueryConfig(configPath: string, opts?: {
        trx?: Transaction;
    }): Promise<AssetQuery[]>;
    /** @returns {string} */
    get addr(): string;
    /** @returns {string} */
    get apiKey(): string;
    /** @returns {string} */
    get apiSecret(): string;
}
export type Transaction = import('objection').Transaction;
import BaseModel from "./base.js";
