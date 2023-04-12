import { Model } from 'objection'
import { AssetSnapshotBatch, BatchListView, AssetFlow, SummaryView } from '../../lib/models/index.js'

/**
 * @param {import('knex').Knex} knex
 * @returns {Promise<void>}
 */
export async function up(knex) {
	Model.knex(knex)

	await knex.schema.createMaterializedView(BatchListView.tableName, v => {
		v.columns(['batch_id', 'scan_started_at', 'time_used_sec', 'usd_value'])
		v.as(
			AssetSnapshotBatch.query(knex)
				.alias('b')
				.leftJoinRelated('snapshots')
				.groupBy('b.id')
				.select(
					'b.id',
					'b.scan_started_at',
					knex.raw('round(extract(epoch from b.scan_finished_at) - extract(epoch from b.scan_started_at))'),
					knex.raw('sum(COALESCE(snapshots.usd_value, 0::numeric))')
				)
				.orderBy('b.scan_started_at', 'desc')
				.toKnexQuery()
		)
	})

	await knex.schema.createMaterializedView(SummaryView.tableName, v => {
		const currentUsdValueQuery = BatchListView.query(knex)
			.select('usd_value')
			.orderBy('scan_started_at', 'desc')
			.limit(1)
			.toKnexQuery()
	
		const lastScannedAtQuery = BatchListView.query(knex)
			.select('scan_started_at')
			.orderBy('scan_started_at', 'desc')
			.limit(1)
			.toKnexQuery()

		const totalInflowQuery = AssetFlow.query(knex)
			.sum('usd_value')
			.whereNull('from_group_id')
			.toKnexQuery()
		const totalOutflowQuery = AssetFlow.query(knex)
			.select(knex.raw('coalesce(sum(0 - usd_value), 0) as usd_value'))
			.whereNull('to_group_id')
			.toKnexQuery()

		v.columns(['last_scanned_at', 'current_usd_value', 'total_inflow', 'total_outflow', 'net_inflow', 'pnl_percent'])
		v.as(knex.raw(`
			select
				t.*,
				round((t.current_usd_value - t.net_inflow) / t.net_inflow * 100, 2) as pnl_percent
			from (
				select
					(${lastScannedAtQuery}) as last_scanned_at,
					(${currentUsdValueQuery}) as current_usd_value,
					(${totalInflowQuery}) as total_inflow,
					(${totalOutflowQuery}) as total_outflow,
					((${totalInflowQuery}) - (${totalOutflowQuery})) as net_inflow
			) as t
		`))
	})
}

/**
 * @param {import('knex').Knex} knex
 * @returns {Promise<void>}
 */
export async function down(knex) {
	Model.knex(knex)

	await knex.schema.dropMaterializedViewIfExists(SummaryView.tableName)
	await knex.schema.dropMaterializedViewIfExists(BatchListView.tableName)
}
