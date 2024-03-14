/**
 * @typedef {import('objection').Transaction} Transaction
 */
export default class AssetFlow extends BaseModel {
    /** @type {import('objection').JSONSchema} */
    static get jsonSchema(): import("objection").JSONSchema;
    /** @type {import('objection').RelationMappings} */
    static get relationMappings(): import("objection").RelationMappings;
}
export type Transaction = import('objection').Transaction;
import BaseModel from "./base.js";
