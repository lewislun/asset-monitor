'use strict'

import BaseModel from './base.js'
import { primaryIndexSchema, refIdSchema } from '../utils/json-schema.js'

export default class AssetSnapshotTag extends BaseModel {
	static tableName = 'asset_snapshot_tags'

	static get jsonSchema() {
		return {
			type: 'object',
			required: [
				'snapshot_id',
				'category',
				'name',
			],
			properties: {
				id: primaryIndexSchema,
				snapshot_id: refIdSchema,
				category: { type: 'string', maxLength: 255 },
				name: { type: 'string', maxLength: 255 },
			}
		}
	}

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