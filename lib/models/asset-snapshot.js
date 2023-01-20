'use strict'

import BaseModel from './base.js'
import { primaryIndexSchema, assetCodeSchema, assetTypeSchema, assetStateSchema, chainSchema, decimalSchema, datetimeSchema, refIdSchema } from '../utils/json-schema.js'

export default class AssetSnapshot extends BaseModel {
	static tableName = 'asset_snapshots'

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
				code: assetCodeSchema,
				chain: chainSchema,
				type: assetTypeSchema,
				name: { type: 'string', maxLength: 255 },
				state: assetStateSchema,
				quantity: decimalSchema,
				usd_value: decimalSchema,
				usd_value_per_quantity: decimalSchema,
				captured_at: datetimeSchema,
			}
		}
	}

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
		}
	}
}

BaseModel.AssetSnapshot = AssetSnapshot