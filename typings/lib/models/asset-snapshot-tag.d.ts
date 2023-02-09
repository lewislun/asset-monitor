export default class AssetSnapshotTag extends BaseModel {
    /** @type {import('objection').JSONSchema} */
    static get jsonSchema(): import("objection").JSONSchema;
    /** @type {import('objection').RelationMappings} */
    static get relationMappings(): import("objection").RelationMappings;
}
import BaseModel from "./base.js";
