import Decimal from 'decimal.js'
import { raw } from 'objection'

import { AssetSnapshotTag, AssetSnapshot, AssetSnapshotBatch } from '../models/index.js'
import { startOrInheritTransaction, rmUndefinedInObj } from '../utils/index.js'
import * as types from '../types.js'
import * as errors from '../errors.js'

/**
 * @typedef {import('objection').Transaction} Transaction
 */

/**
 * @param {object} [opts={}]
 * @param {Transaction} [opts.trx]
 * @returns {Promise<AssetSnapshotBatch>}
 */
async function getLatestBatch(opts = {}) {
	const batch = await AssetSnapshotBatch.query(opts?.trx)
		.orderBy('scan_finished_at', 'desc')
		.first()
	if (!batch) throw new errors.NoDataError()
	return batch
}

/**
 * @param {object} [opts={}]
 * @param {Transaction} [opts.trx]
 * @param {'code'|'chain'|'group'|'tag'|'type'|'state'} [opts.groupBy]
 * @param {string} [opts.tagCategory] this is required of opts.groupBy === 'tag'
 */
export async function getTotalValue(opts = {}) {
	return await startOrInheritTransaction(async trx => {
		const batch = await getLatestBatch({ trx })
		const query = AssetSnapshot.query(opts.trx)
			.alias('s')
			.sum('s.usd_value as total_usd_value')
			.where('s.batch_id', batch.id)
		
		switch (opts.groupBy) {
			case 'chain':
			case 'code':
			case 'type':
			case 'state':
				query.select(opts.groupBy).groupBy(opts.groupBy)
				break
			case 'group':
				query
					.leftJoinRelated('group')
					.select('group.name as group_name')
					.groupBy('group.id')
				break
			case 'tag':
				if (!opts.tagCategory) throw new Error('Missing opts.tagCategory.')
				query
					.leftJoin(`${AssetSnapshotTag.tableName} as tags`, joinClause => joinClause
						.on('tags.category', raw(`'${opts.tagCategory}'`))
						.andOn('tags.snapshot_id', 's.id')
					)
					.select('tags.name as tag_name')
					.groupBy('tags.name')
				break
			case undefined:
				break
			default:
				throw new Error(`Unsupported groupBy: ${opts.groupBy}.`)
		}

		return (await query).map(row => rmUndefinedInObj({
			code: row.code,
			chain: row.chain,
			type: row.type,
			state: row.state,
			tagName: row.tag_name,
			groupName: row.group_name,
			usdValue: new Decimal(row.total_usd_value),
		}))
	}, opts?.trx)
}