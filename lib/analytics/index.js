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
		const distinctQuery = trx(`${AssetGroup.tableName} as g`)
			.crossJoin(trx(AssetFlow.tableName).distinct('executed_at').as('f'))
			.select('g.id as group_id', 'f.executed_at')
		const inFlowQuery = trx(AssetFlow.tableName)
			.select('to_group_id as group_id', 'usd_value', 'executed_at')
		const outFlowQuery = trx(AssetFlow.tableName)
			.select('from_group_id as group_id', trx.raw('(0 - usd_value) as usd_value'), 'executed_at')
		const query = trx.from(inFlowQuery.union(outFlowQuery).as('t'))
			.rightJoin(distinctQuery.as('d'), { 'd.group_id': 't.group_id', 'd.executed_at': 't.executed_at' })
			.leftJoin(`${AssetGroup.tableName} as g`, { 'd.group_id': 'g.id' })
			.select(trx.raw(`SUM(COALESCE(t.usd_value, 0)) OVER (PARTITION BY d.group_id ORDER BY d.executed_at ASC) AS acc_usd_value`))
			.select('d.group_id', 'g.name as group_name', 'd.executed_at')
			.orderBy('d.executed_at', 'ASC')
			.orderBy('d.group_id', 'ASC')
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

/**
 * @param {object} [opts={}]
 * @param {Transaction} [opts.trx]
 * @param {number[]} [opts.groupIds]
 * @returns {Promise<Decimal>}
 */
export async function getTotalInvestedValue(opts = {}) {
	const inflowQuery = AssetFlow.query(opts?.trx).sum('invested_usd_value as inflowValue')
	if (opts?.groupIds && opts.groupIds?.length > 0) {
		inflowQuery
			.whereIn('to_group_id', opts.groupIds)
			.whereNotIn('from_group_id', opts.groupIds)
	} else {
		inflowQuery.whereNull('from_group_id')
	}
	const { inflowValue } = await inflowQuery.first()

	const outflowQuery = AssetFlow.query(opts?.trx).sum('invested_usd_value as outflowValue')
	if (opts?.groupIds && opts.groupIds?.length > 0) {
		outflowQuery
			.whereIn('from_group_id', opts.groupIds)
			.whereNotIn('to_group_id', opts.groupIds)
	} else {
		outflowQuery.whereNull('to_group_id')
	}
	const { outflowValue } = await outflowQuery.first()

	return new Decimal(inflowValue ?? 0).sub(outflowValue ?? 0)
}

/**
 * @param {object} [opts={}]
 * @param {Transaction} [opts.trx]
 * @param {number} [opts.daysAgo] if not provided, will return the latest total value
 * @returns {Promise<Decimal>}
 */
export async function getLatestTotalValue(opts = {}) {
	const query = AssetSnapshotBatch.query(opts?.trx).orderBy('scan_started_at', 'desc').first()
	if (opts?.daysAgo) {
		query.where('scan_started_at', '>=', new Date(Date.now() - opts.daysAgo * 24 * 60 * 60 * 1000))
	}
	const latestBatch = await query
	if (!latestBatch) {
		return undefined
	}

	const totalValue = await latestBatch.$relatedQuery('snapshots').sum('usd_value as totalValue')
	return new Decimal(totalValue.first()?.totalValue ?? 0)
}

/**
 * @param {object} [opts={}]
 * @param {Transaction} [opts.trx]
 * @param {number} [opts.fromDaysAgo] if not provided, will get high/low of all time
 * @returns {Promise<{high: {time: Date, value: Decimal}, low: {time: Date, value: Decimal}}>}
 */
export async function getTotalValueHighLow(opts = {}) {
	const query = AssetSnapshotBatch.query(opts?.trx)
		.alias('b')
		.leftJoinRelated('snapshots')
		.sum('usd_value as totalValue')
		.groupBy('b.id')
	if (opts?.fromDaysAgo) {
		query.where('scan_started_at', '>=', new Date(Date.now() - opts.fromDaysAgo * 24 * 60 * 60 * 1000))
	}

	const batches = await query
	return batches.reduce((acc, batch) => {
		const value = new Decimal(batch.totalValue)
		if (!acc?.high || value.gt(acc.high.value)) {
			acc.high = { time: batch.scan_started_at, value }
		}
		if (!acc?.low || value.lt(acc.low.value)) {
			acc.low = { time: batch.scan_started_at, value }
		}
		return acc
	}, {})
}

/**
 * @param {object} [opts={}]
 * @param {Transaction} [opts.trx]
 * @param {number[]} [opts.groupIds]
 * @returns {Promise<Decimal>}
 */
export async function getTotalPnl(opts = {}) {
	const inflowQuery = AssetFlow.query(opts?.trx)
		.sum('invested_usd_value as investedValue')
		.sum('actual_usd_value as actualValue')
		.whereNull('to_group_id')
	const { investedValue, actualValue } = await inflowQuery.first()

	return new Decimal(actualValue ?? 0).sub(investedValue ?? 0)
}
