'use strict'

import BaseModel from './base.js'
import { primaryIndexSchema, datetimeSchema } from '../utils/json-schema.js'

export default class AssetGroup extends BaseModel {
	static tableName = 'asset_groups'

	/** @type {import('objection').JSONSchema} */
	static get jsonSchema() {
		return {
			type: 'object',
			required: [
				'name',
			],
			properties: {
				id: primaryIndexSchema,
				name: { type: 'string', maxLength: 255 },
				created_at: datetimeSchema,
			}
		}
	}

	/** @type {import('objection').RelationMappings} */
	static get relationMappings() {
		return {
			inFlows: {
				relation: BaseModel.HasManyRelation,
				modelClass: BaseModel.AssetFlow,
				join: {
					from: `${this.tableName}.id`,
					to: `${BaseModel.AssetFlow.tableName}.to_group_id`,
				},
			},
			outFlows: {
				relation: BaseModel.HasManyRelation,
				modelClass: BaseModel.AssetFlow,
				join: {
					from: `${this.tableName}.id`,
					to: `${BaseModel.AssetFlow.tableName}.from_group_id`,
				},
			},
		}
	}
}

BaseModel.AssetGroup = AssetGroup