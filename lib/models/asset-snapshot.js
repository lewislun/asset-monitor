import BaseModel from './base.js'
import { schema } from '../utils/index.js'
import Decimal from 'decimal.js'

export default class AssetSnapshot extends BaseModel {
	static tableName = 'asset_snapshots'

	/** @type {import('objection').JSONSchema} */
	static get jsonSchema() {
		return {
			type: 'object',
			required: [
				'chain',
				'type',
				'state',
				'usd_value',
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

	$parseJson(json, opt) {
		json = super.$parseJson(json, opt)

		const decimalFields = [ 'quantity', 'usd_value' ]
		for (const field of decimalFields) {
			if (json[field] instanceof Decimal) {
				json[field] = json[field].toString()
			}
		}

		return json
	}
}

BaseModel.AssetSnapshot = AssetSnapshot