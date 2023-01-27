'use strict'

import Decimal from 'decimal.js'

import * as types from '../types.js'
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
				'scan_started_at',
				'scan_finished_at',
			],
			properties: {
				id: primaryIndexSchema,
				total_usd_value: decimalSchema,
				scan_started_at: datetimeSchema,
				scan_finished_at: datetimeSchema,
			}
		}
	}

	static get relationMappings() {
		return {
			histories: {
				relation: BaseModel.HasManyRelation,
				modelClass: BaseModel.AssetSnapshot,
				join: {
					from: `${this.tableName}.id`,
					to: `${BaseModel.AssetSnapshot.tableName}.batch_id`,
				},
			}
		}
	}

	/**
	 * @param {types.ScanResult} scanResult
	 * @returns {Promise<AssetSnapshotBatch>}
	 */
	static async storeScanResult(scanResult = []) {
		if (!Array.isArray(scanResult.queryResults) || scanResult.queryResults.length == 0) {
			throw new Error('No query result to store.')
		}

		return await AssetSnapshotBatch.query().insertGraph({
			scan_started_at: scanResult.startTime.toISOString(),
			scan_finished_at: scanResult.endTime.toISOString(),
			total_usd_value: scanResult.totalUSDValue.toString(),
			histories: scanResult.queryResults.map(result => ({
				code: result.code,
				chain: result.chain,
				type: result.type,
				name: result.name,
				state: result.state,
				quantity: result.quantity.toString(),
				usd_value: result.usdValue.toString(),
				usd_value_per_quantity: result.usdValuePerQuantity,
				captured_at: new Date(result.timestamp * 1000).toISOString(),
				tags: result.tagMap? Object.entries(result.tagMap).map(([category, name]) => ({ category, name })) : [],
			}))
		})
	}
}

BaseModel.AssetSnapshotBatch = AssetSnapshotBatch