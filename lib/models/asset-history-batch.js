'use strict'

import BaseModel from './base.js'
import { primaryIndexSchema, datetimeSchema, decimalSchema } from '../utils/json-schema.js'

export default class AssetHistoryBatch extends BaseModel {
	static tableName = 'asset_history_batches'

	static get jsonSchema() {
		return {
			type: 'object',
			required: [
				'total_usd_value',
				'captured_at',
			],
			properties: {
				id: primaryIndexSchema,
				total_usd_value: decimalSchema,
				captured_at: datetimeSchema,
			}
		}
	}
}