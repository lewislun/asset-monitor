/**
 * @typedef {import('objection').Transaction} Transaction
 */
export default class BatchListView extends BaseModel {
    /** @type {import('objection').JSONSchema} */
    static get jsonSchema(): import("objection").JSONSchema;
}
export type Transaction = import('objection').Transaction;
import BaseModel from "./base.js";
