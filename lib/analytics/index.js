import Decimal from 'decimal.js'
import { raw } from 'objection'

import { AssetSnapshotTag, AssetSnapshot, AssetSnapshotBatch, AssetFlow, AssetGroup } from '../models/index.js'
import { startOrInheritTransaction, rmUndefinedInObj } from '../utils/index.js'
import * as types from '../types.js'
import * as enums from '../enums.js'
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
 * @typedef NetFlowOverTimeData
 * @property {number} groupId
 * @property {string} groupName
 * @property {{ time: Date, usdValue: Decimal }[]} timeline
 *
 * @param {object} [opts={}]
 * @param {Transaction} [opts.trx]
 * @returns {Promise<NetFlowOverTimeData[]>}
 */
export async function getNetFlowOverTime(opts = {}) {
	return await startOrInheritTransaction(async trx => {
		// get cumulative flows
		const inFlowQuery = trx(`${AssetFlow.tableName}`)
			.select('to_group_id as group_id', 'usd_value', 'executed_at')
		const outFlowQuery = trx(`${AssetFlow.tableName}`)
			.select('from_group_id as group_id', trx.raw('(0 - usd_value) as usd_value'), 'executed_at')
		const query = trx.from(inFlowQuery.union(outFlowQuery).as('t'))
			.leftJoin(`${AssetGroup.tableName} as g`, { 't.group_id': 'g.id' })
			.select(trx.raw(`(SUM(t.usd_value) OVER (PARTITION BY t.group_id ORDER BY t.executed_at ASC)) AS acc_usd_value`))
			.select('t.group_id', 'g.name as group_name', 't.executed_at')
			.whereNotNull('t.group_id')
			.orderBy('t.executed_at', 'ASC')
		const netFlows = await query
		
		// group by asset group
		/** @type {Object.<number, NetFlowOverTimeData>} */
		const resultByGroupId = {}
		netFlows.forEach(flow => {
			if (!resultByGroupId[flow.group_id]) {
				resultByGroupId[flow.group_id] = { groupId: flow.group_id, groupName: flow.group_name, timeline: [] }
			}
			resultByGroupId[flow.group_id].timeline.push({
				time: flow.executed_at,
				usdValue: new Decimal(flow.acc_usd_value),
			})
		})

		return Object.values(resultByGroupId)
	}, opts?.trx)
}

/**
 * @typedef TotalValueAnalyticsData
 * @property {types.AssetCode} [code]
 * @property {types.Chain} [chain]
 * @property {enums.AssetType} [type]
 * @property {enums.AssetState} [state]
 * @property {string} [tagValue]
 * @property {Decimal} usdValue
 * 
 * @param {object} [opts={}]
 * @param {Transaction} [opts.trx]
 * @param {'code'|'chain'|'group'|'tag'|'type'|'state'} [opts.groupBy]
 * @param {string} [opts.tagCategory] this is required of opts.groupBy === 'tag'
 * @returns {Promise<TotalValueAnalyticsData[]>}
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
					.select('tags.value as tag_value')
					.groupBy('tags.value')
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
			tagValue: row.tag_value,
			groupName: row.group_name,
			usdValue: new Decimal(row.total_usd_value),
		}))
	}, opts?.trx)
}