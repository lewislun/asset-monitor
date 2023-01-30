'use strict'

import BaseModel from './base.js'
import { primaryIndexSchema, datetimeSchema, decimalSchema, refIdSchema } from '../utils/json-schema.js'

export default class AssetFlow extends BaseModel {
	static tableName = 'asset_flows'

	/** @type {import('objection').JSONSchema} */
	static get jsonSchema() {
		return {
			type: 'object',
			required: [
				'usd_value',
			],
			properties: {
				id: primaryIndexSchema,
				from_group_id: refIdSchema,
				to_group_id: refIdSchema,
				usd_value: decimalSchema,
				executed_at: datetimeSchema,
			}
		}
	}

	/** @type {import('objection').RelationMappings} */
	static get relationMappings() {
		return {
			toGroup: {
				relation: BaseModel.BelongsToOneRelation,
				modelClass: BaseModel.AssetGroup,
				join: {
					from: `${this.tableName}.to_group_id`,
					to: `${BaseModel.AssetGroup.tableName}.id`,
				},
			},
			fromGroup: {
				relation: BaseModel.BelongsToOneRelation,
				modelClass: BaseModel.AssetGroup,
				join: {
					from: `${this.tableName}.from_group_id`,
					to: `${BaseModel.AssetGroup.tableName}.id`,
				},
			},
		}
	}
}

BaseModel.AssetFlow = AssetFlow