'use strict'

import Decimal from 'decimal.js'

import BaseModel from './base.js'
import { primaryIndexSchema, datetimeSchema, decimalSchema } from '../utils/json-schema.js'

/**
 * @typedef {import('../types.js').AssetQueryResult} AssetQueryResult
 */

export default class AssetSnapshotBatch extends BaseModel {
	static tableName = 'asset_snapshot_batches'

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

	static get relationMappings() {
		return {
			histories: {
				relation: BaseModel.HasManyRelation,
				modelClass: BaseModel.AssetHistory,
				join: {
					from: `${this.tableName}.id`,
					to: `${BaseModel.AssetHistory.tableName}.batch_id`,
				},
			}
		}
	}

	/**
	 * @param {AssetQueryResult[]} assetQueryResults
	 * @returns {Promise<AssetSnapshotBatch>}
	 */
	static async storeResults(assetQueryResults = []) {
		if (!Array.isArray(assetQueryResults) || assetQueryResults.length == 0) {
			throw new Error('No query result to store.')
		}

		return await AssetSnapshotBatch.query().insertGraph({
			captured_at: new Date().toISOString(),
			total_usd_value: assetQueryResults.reduce((acc, cur) => acc.add(cur.usdValue), new Decimal(0)).toString(),
			histories: assetQueryResults.map(result => ({
				code: result.code,
				chain: result.chain,
				type: result.type,
				name: result.name,
				state: result.state,
				quantity: result.quantity.toString(),
				usd_value: result.usdValue.toString(),
				usd_value_per_quantity: result.usdValuePerQuantity,
				captured_at: new Date(result.timestamp * 1000).toISOString(),
			}))
		})
	}
}

BaseModel.AssetSnapshotBatch = AssetSnapshotBatch