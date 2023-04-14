'use strict'

import * as types from '../types.js'
import BaseModel, { refreshMaterializedViews } from './base.js'
import { schema, startOrInheritTransaction, createLogger } from '../utils/index.js'

/**
 * @typedef {import('objection').Transaction} Transaction
 */

const logger = createLogger('AssetSnapshotBatch')

export default class AssetSnapshotBatch extends BaseModel {
	static tableName = 'asset_snapshot_batches'

	/** @type {import('objection').JSONSchema} */
	static get jsonSchema() {
		return {
			type: 'object',
			required: [
				'scan_started_at',
				'scan_finished_at',
			],
			properties: {
				id: schema.primaryIndex,
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
	 * @param {object} [opts={}]
	 * @param {Transaction} [opts.trx]
	 * @returns {Promise<AssetSnapshotBatch>}
	 */
	static async store(scanResult = [], opts = {}) {
		if (!Array.isArray(scanResult.snapshots) || scanResult.snapshots.length == 0) {
			throw new Error('No query result to store.')
		}

		return await startOrInheritTransaction(async (trx) => {
			// Create batch
			const batch = await AssetSnapshotBatch.query(trx).insertGraph({
				scan_started_at: scanResult.startTime.toISOString(),
				scan_finished_at: scanResult.endTime.toISOString(),
				snapshots: scanResult.snapshots,
			})

			// Refresh materialized view
			await refreshMaterializedViews(trx)

			return batch
		}, opts?.trx)
	}
}

BaseModel.AssetSnapshotBatch = AssetSnapshotBatch