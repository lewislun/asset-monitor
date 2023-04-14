export default class AssetSnapshot extends BaseModel {
    /** @type {import('objection').JSONSchema} */
    static get jsonSchema(): import("objection").JSONSchema;
    /** @type {import('objection').RelationMappings} */
    static get relationMappings(): import("objection").RelationMappings;
    $parseJson(json: any, opt: any): any;
}
import BaseModel from "./base.js";
