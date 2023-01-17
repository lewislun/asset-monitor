'use strict'

import BaseModel from './base.js'
import { primaryIndexSchema, assetCodeSchema, assetTypeSchema, assetStateSchema, chainSchema, decimalSchema, datetimeSchema } from '../utils/json-schema.js'

export default class AssetHistory extends BaseModel {
	static tableName = 'asset_histories'

	static get jsonSchema() {
		return {
			type: 'object',
			required: [
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
}