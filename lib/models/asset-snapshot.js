'use strict'

import BaseModel from './base.js'
import { primaryIndexSchema, assetCodeSchema, assetTypeSchema, assetStateSchema, chainSchema, decimalSchema, datetimeSchema, refIdSchema } from '../utils/json-schema.js'

export default class AssetSnapshot extends BaseModel {
	static tableName = 'asset_snapshots'

	/** @type {import('objection').JSONSchema} */
	static get jsonSchema() {
		return {
			type: 'object',
			required: [
				'batch_id',
				'code',
				'chain',
				'type',
				'name',
				'state',
				'quantity',
				'usd_value',
				'usd_value_per_quantity',
				'captured_at',
			],
			properties: {
				id: primaryIndexSchema,
				batch_id: refIdSchema,
				group_id: refIdSchema,
				code: assetCodeSchema,
				chain: chainSchema,
				type: assetTypeSchema,
				name: { type: 'string', maxLength: 255 },
				state: assetStateSchema,
				quantity: decimalSchema,
				usd_value: decimalSchema,
				usd_value_per_quantity: decimalSchema,
				account_id: { type: 'string', maxLength: 255 },
				captured_at: datetimeSchema,
			}
		}
	}

	/** @type {import('objection').RelationMappings} */
	static get relationMappings() {
		return {
			batch: {
				relation: BaseModel.BelongsToOneRelation,
				modelClass: BaseModel.AssetSnapshotBatch,
				join: {
					from: `${this.tableName}.batch_id`,
					to: `${BaseModel.AssetSnapshotBatch.tableName}.id`,
				},
			},
			tags: {
				relation: BaseModel.HasManyRelation,
				modelClass: BaseModel.AssetSnapshotTag,
				join: {
					from: `${this.tableName}.id`,
					to: `${BaseModel.AssetSnapshotTag.tableName}.snapshot_id`,
				},
			},
			group: {
				relation: BaseModel.BelongsToOneRelation,
				modelClass: BaseModel.AssetGroup,
				join: {
					from: `${this.tableName}.group_id`,
					to: `${BaseModel.AssetGroup.tableName}.id`,
				},
			},
		}
	}
}

BaseModel.AssetSnapshot = AssetSnapshot