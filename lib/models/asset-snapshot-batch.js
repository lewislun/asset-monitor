'use strict'

import * as types from '../types.js'
import BaseModel from './base.js'
import { schema } from '../utils/index.js'

/**
 * @typedef {import('../types.js').AssetQueryResult} AssetQueryResult
 */

export default class AssetSnapshotBatch extends BaseModel {
	static tableName = 'asset_snapshot_batches'

	/** @type {import('objection').JSONSchema} */
	static get jsonSchema() {
		return {
			type: 'object',
			required: [
				'total_usd_value',
				'scan_started_at',
				'scan_finished_at',
			],
			properties: {
				id: schema.primaryIndex,
				total_usd_value: schema.decimal,
				scan_started_at: schema.datetime,
				scan_finished_at: schema.datetime,
			}
		}
	}

	/** @type {import('objection').RelationMappings} */
	static get relationMappings() {
		return {
			snapshots: {
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
			snapshots: scanResult.queryResults.map(result => ({
				account_id: result.accountId,
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