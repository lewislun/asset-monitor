import Decimal from 'decimal.js'

import { AssetSnapshotTag, AssetSnapshot, AssetSnapshotBatch, AssetFlow, AssetGroup } from '../models/index.js'
import { startOrInheritTransaction, rmUndefinedInObj } from '../utils/index.js'
import * as analyticsTypes from './types.js'

/**
 * @typedef {import('objection').Transaction} Transaction
 */

/**
 * @param {object} [opts={}]
 * @param {Transaction} [opts.trx]
 * @returns {Promise<analyticsTypes.NetFlowData[][]>}
 */
export async function getNetFlowOverTime(opts = {}) {
	return await startOrInheritTransaction(async trx => {
		// get cumulative flows
		const inFlowQuery = trx(AssetFlow.tableName)
			.select('to_group_id as group_id', 'usd_value', 'executed_at')
		const outFlowQuery = trx(AssetFlow.tableName)
			.select('from_group_id as group_id', trx.raw('(0 - usd_value) as usd_value'), 'executed_at')
		const query = trx.from(inFlowQuery.union(outFlowQuery).as('t'))
			.leftJoin(`${AssetGroup.tableName} as g`, { 't.group_id': 'g.id' })
			.select(trx.raw(`(SUM(t.usd_value) OVER (PARTITION BY t.group_id ORDER BY t.executed_at ASC)) AS acc_usd_value`))
			.select('t.group_id', 'g.name as group_name', 't.executed_at')
			.whereNotNull('t.group_id')
			.orderBy('t.executed_at', 'ASC')
		const netFlows = await query
		
		// group by asset group
		/** @type {Object.<number, NetFlowData[]>} */
		const resultsByGroupId = {}
		netFlows.forEach(flow => {
			if (!resultsByGroupId[flow.group_id]) {
				resultsByGroupId[flow.group_id] = []
			}
			resultsByGroupId[flow.group_id].push({
				groupId: flow.group_id,
				groupName: flow.group_name,
				time: flow.executed_at,
				usdValue: new Decimal(flow.acc_usd_value),
			})
		})

		return Object.values(resultsByGroupId)
	}, opts?.trx)
}

/**
 * @param {object} [opts={}]
 * @param {Transaction} [opts.trx]
 * @param {'code'|'chain'|'group'|'tag'|'type'|'state'} [opts.groupBy]
 * @param {string} [opts.tagCategory] this is required of opts.groupBy === 'tag'
 * @param {boolean} [opts.latestBatchOnly=false]
 * @returns {Promise<analyticsTypes.TotalValueData[][]>}
 */
export async function getTotalValueOverTime(opts = {}) {
	return await startOrInheritTransaction(async trx => {
		// Create batch query for cross join
		let batchQuery = trx(AssetSnapshotBatch.tableName)
		if (opts.latestBatchOnly) {
			batchQuery = trx(AssetSnapshotBatch.tableName)
				.where('scan_finished_at', batchQuery.max('scan_finished_at as scan_finished_at'))
		}

		// query to get distinct subjects (this is to ensure we can get 0 values correctly)
		let joinField, groupField, distinctQuery
		switch (opts.groupBy) {
			case 'chain':
			case 'code':
			case 'type':
			case 'state':
				joinField = groupField = opts.groupBy
				distinctQuery = trx.from(trx(AssetSnapshot.tableName).distinct(joinField).as('s'))
					.crossJoin(trx.from(batchQuery.as('b0')).select('id', 'scan_finished_at').as('b'))
					.select(`s.${joinField} as ${joinField}`, 'b.id as batch_id', 'b.scan_finished_at as time')
				break
			case 'group':
				groupField = 'group_name'
				joinField = 'group_id'
				distinctQuery = trx.from(trx(AssetGroup.tableName).select('id', 'name').as('g'))
					.crossJoin(trx.from(batchQuery.as('b0')).select('id', 'scan_finished_at').as('b'))
					.select(`g.id as ${joinField}`, `g.name as ${groupField}`, 'b.id as batch_id', 'b.scan_finished_at as time')
				break
			case 'tag':
				if (!opts.tagCategory) throw new Error('Missing opts.tagCategory.')
				groupField = 'tag_value'
				joinField = 'id'
				distinctQuery = trx(`${AssetSnapshot.tableName} as s`)
					.leftJoin(`${AssetSnapshotTag.tableName} as t`, joinClause => joinClause
						.on('t.snapshot_id', 's.id')
						.andOn('t.category', trx.raw(`'${opts.tagCategory}'`))
					)
					.crossJoin(trx.from(batchQuery.as('b0')).select('id', 'scan_finished_at').as('b'))
					.select(`s.id as ${joinField}`, `t.value as ${groupField}`, 'b.id as batch_id', 'b.scan_finished_at as time')
				break
			case undefined:
				joinField = groupField = 'batch_id'
				distinctQuery = trx.from(batchQuery.as('b0')).select(`id as ${joinField}`, 'scan_finished_at as time')
				break
			default:
				throw new Error(`Unsupported groupBy: ${opts.groupBy}.`)
		}

		const query = trx(`${AssetSnapshot.tableName} as s`)
			.rightOuterJoin(distinctQuery.as('d'), { 's.batch_id': 'd.batch_id', [`s.${joinField}`]: `d.${joinField}` })
			.select('d.time as time', trx.raw('COALESCE(SUM(s.usd_value), 0) as total_usd_value'))
			.groupBy('d.batch_id', 'd.time')
			.orderBy('d.time', 'asc')
		if (groupField !== 'batch_id') {
			query.select(`d.${groupField}`)
				.groupBy(`d.${groupField}`)
				.orderBy(`d.${groupField}`, 'asc')
		}
		const rows = await query

		// group the rows
		/** @type {Object.<number, NetFlowData[]>} */
		const rowsMap = {}
		rows.forEach(row => {
			if (!rowsMap[row[groupField]]) rowsMap[row[groupField]] = []
			rowsMap[row[groupField]].push(rmUndefinedInObj({
				chain: row.chain,
				code: row.code,
				state: row.state,
				type: row.type,
				tagValue: row.tag_value,
				groupName: row.group_name,
				time: row.time,
				usdValue: new Decimal(row.total_usd_value),
			}))
		})

		return Object.values(rowsMap)
	}, opts?.trx)
}