import BaseModel from './base.js'
import { schema } from '../utils/index.js'

export default class AssetSnapshotTag extends BaseModel {
	static tableName = 'asset_snapshot_tags'

	/** @type {import('objection').JSONSchema} */
	static get jsonSchema() {
		return {
			type: 'object',
			required: [
				'snapshot_id',
				'category',
				'name',
			],
			properties: {
				id: schema.primaryIndex,
				snapshot_id: schema.refId,
				category: schema.assetTagCategory,
				name: { type: 'string', maxLength: 255 },
			}
		}
	}

	/** @type {import('objection').RelationMappings} */
	static get relationMappings() {
		return {
			snapshot: {
				relation: BaseModel.BelongsToOneRelation,
				modelClass: BaseModel.AssetSnapshot,
				join: {
					from: `${this.tableName}.snapshot_id`,
					to: `${BaseModel.AssetSnapshot.tableName}.id`,
				},
			}
		}
	}
}

BaseModel.AssetSnapshotTag = AssetSnapshotTag