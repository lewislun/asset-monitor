/**
 * @typedef {import('objection').Transaction} Transaction
 */
export default class SummaryView extends BaseModel {
    /** @type {import('objection').JSONSchema} */
    static get jsonSchema(): import("objection").JSONSchema;
}
export type Transaction = import('objection').Transaction;
import BaseModel from "./base.js";
