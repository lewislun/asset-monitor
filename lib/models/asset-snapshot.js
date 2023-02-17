import BaseModel from './base.js'
import { schema } from '../utils/index.js'

export default class AssetSnapshot extends BaseModel {
	static tableName = 'asset_snapshots'

	/** @type {import('objection').JSONSchema} */
	static get jsonSchema() {
		return {
			type: 'object',
			required: [
				'batch_id',
				'group_id',
				'chain',
				'type',
				'state',
				'usd_value',
				'captured_at',
			],
			properties: {
				id: schema.primaryIndex,
				batch_id: schema.refId,
				group_id: schema.refId,
				code: schema.assetCode,
				chain: schema.chain,
				type: schema.assetType,
				name: { type: 'string', maxLength: 255 },
				state: schema.assetState,
				quantity: schema.decimal,
				usd_value: schema.decimal,
				usd_value_per_quantity: schema.decimal,
				account_id: { type: 'string', maxLength: 255 },
				captured_at: schema.datetime,
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