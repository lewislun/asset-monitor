'use strict'

import * as types from '../types.js'
import BaseModel from './base.js'
import { schema, startOrInheritTransaction, createLogger } from '../utils/index.js'

/**
 * @typedef {import('objection').Transaction} Transaction
 * @typedef {import('../types.js').AssetQueryResult} AssetQueryResult
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
	static async storeScanResult(scanResult = [], opts = {}) {
		if (!Array.isArray(scanResult.queryResults) || scanResult.queryResults.length == 0) {
			throw new Error('No query result to store.')
		}

		return await startOrInheritTransaction(async (trx) => {
			// Create new groups for new group names
			const groupNames = scanResult.queryResults.map(result => result.groupSpecifier).filter(s => typeof s === 'string')
			const existingGroups = await BaseModel.AssetGroup.query(trx).whereIn('name', groupNames)
			const newGroupNameSet = new Set(groupNames)
			existingGroups.forEach(group => newGroupNameSet.delete(group.name))
			if (newGroupNameSet.size > 0) {
				logger.info(`New group name(s) encountered. Creating new asset groups... - newGroupNames: ${[...newGroupNameSet.values()].join(', ')}`)
				const insertPayload = [...newGroupNameSet.values()].map(name => ({ name }))
				await BaseModel.AssetGroup.query(trx).insert(insertPayload)
			}

			// convert groupSpecifier to group id
			await Promise.all(scanResult.queryResults.map(result => new Promise(async resolve => {
				result.groupSpecifier = await BaseModel.AssetGroup.getGroupId(result.groupSpecifier, { trx })
				resolve()
			})))

			return await AssetSnapshotBatch.query(trx).insertGraph({
				scan_started_at: scanResult.startTime.toISOString(),
				scan_finished_at: scanResult.endTime.toISOString(),
				snapshots: scanResult.queryResults.map(result => ({
					account_id: result.accountId,
					group_id: result.groupSpecifier,
					code: result.code,
					chain: result.chain,
					type: result.type,
					name: result.name,
					state: result.state,
					quantity: result.quantity.toString(),
					usd_value: result.usdValue.toString(),
					usd_value_per_quantity: result.usdValuePerQuantity,
					captured_at: new Date(result.timestamp * 1000).toISOString(),
					tags: result.tagMap? Object.entries(result.tagMap).map(([category, value]) => ({ category, value })) : [],
				}))
			})
		}, opts?.trx)
	}
}

BaseModel.AssetSnapshotBatch = AssetSnapshotBatch