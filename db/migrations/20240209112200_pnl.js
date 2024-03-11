import { Model } from 'objection'
import { AssetFlow, AssetSnapshotBatch } from '../../lib/models/index.js'

/**
 * @param {import('knex').Knex} knex
 * @returns {Promise<void>}
 */
export async function up(knex) {
	Model.knex(knex)

	// create asset query table
	await knex.schema.alterTable(AssetFlow.tableName, t => {
		t.decimal('invested_usd_value', 15, 6).notNullable().defaultTo(0)
		t.decimal('actual_usd_value', 15, 6).notNullable().defaultTo(0)
	})

	// assign usd_value to actual_usd_value and invested_usd_value
	await knex.raw(`
		UPDATE asset_flows
		SET actual_usd_value = usd_value, invested_usd_value = usd_value
	`)

	// drop views
	await knex.schema.dropMaterializedView('summary_view')
	await knex.schema.dropMaterializedView('batch_list_view')

	// drop usd_value column
	await knex.schema.alterTable(AssetFlow.tableName, t => {
		t.dropColumn('usd_value')
	})
}

/**
 * @param {import('knex').Knex} knex
 * @returns {Promise<void>}
 */
export async function down(knex) {
	Model.knex(knex)

	// create usd_value column
	await knex.schema.alterTable(AssetFlow.tableName, t => {
		t.decimal('usd_value', 15, 6).notNullable().defaultTo(0)
	})

	// assign actual_usd_value to usd_value
	await knex.raw(`
		UPDATE asset_flows
		SET usd_value = actual_usd_value
	`)

	// drop actual_usd_value and invested_usd_value column
	await knex.schema.alterTable(AssetFlow.tableName, t => {
		t.dropColumn('actual_usd_value')
		t.dropColumn('invested_usd_value')
	})

	// recreate BatchListView
	await knex.schema.createMaterializedView('batch_list_view', v => {
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

	// recreate SummaryView
	await knex.schema.createMaterializedView('summary_view', v => {
		// Query for current USD value
		const currentUsdValueQuery = knex('batch_list_view')
			.select('usd_value')
			.orderBy('scan_started_at', 'desc')
			.limit(1)

		// Query for USD value 1 day ago
		const oneDayAgoUsdValueQuery = knex('batch_list_view')
			.select('usd_value')
			.orderBy('scan_started_at', 'desc')
			.where('scan_started_at', '<', knex.raw('now() - interval \'1 day\''))
			.limit(1)

		// Query for USD value 7 days ago
		const sevenDayAgoUsdValueQuery = knex('batch_list_view')
			.select('usd_value')
			.orderBy('scan_started_at', 'desc')
			.where('scan_started_at', '<', knex.raw('now() - interval \'7 day\''))
			.limit(1)

		// Query for USD value 30 days ago
		const thirtyAgoUsdValueQuery = knex('batch_list_view')
			.select('usd_value')
			.orderBy('scan_started_at', 'desc')
			.where('scan_started_at', '<', knex.raw('now() - interval \'30 day\''))
			.limit(1)
	
		// Query for last scanned at
		const lastScannedAtQuery = knex('batch_list_view')
			.max('scan_started_at')

		// Query for 30-day high
		const thirtyDayHighQuery = knex('batch_list_view')
			.max('usd_value')
			.where('scan_started_at', '>', knex.raw('now() - interval \'30 day\''))
		
		// Query for 30-day low
		const thirtyDayLowQuery = knex('batch_list_view')
			.min('usd_value')
			.where('scan_started_at', '>', knex.raw('now() - interval \'30 day\''))

		// Query for total inflow, outflow, and net inflow
		const totalInflowQuery = AssetFlow.query(knex)
			.sum('usd_value')
			.whereNull('from_group_id')
			.toKnexQuery()
		const totalOutflowQuery = AssetFlow.query(knex)
			.select(knex.raw('coalesce(sum(0 - usd_value), 0) as usd_value'))
			.whereNull('to_group_id')
			.toKnexQuery()
		const netInflowQuery = knex.raw(`(${totalInflowQuery}) - (${totalOutflowQuery})`)

		const colInfos = [
			{ name: 'total_inflow', query: 'total_inflow' },
			{ name: 'total_outflow', query: 'total_outflow' },
			{ name: 'net_inflow', query: 'net_inflow' },
			{ name: 'last_scanned_at', query: 'last_scanned_at' },
			{ name: 'current_usd_value', query: 'current_usd_value' },
			{ name: 'one_day_ago_usd_value', query: 'one_day_ago_usd_value' },
			{ name: 'seven_day_ago_usd_value', query: 'seven_day_ago_usd_value' },
			{ name: 'thirty_day_ago_usd_value', query: 'thirty_day_ago_usd_value' },
			{ name: 'thirty_day_range', query: 'thirty_day_low || \' - \' || thirty_day_high' },
			{ name: 'pnl', query: 'round((current_usd_value - net_inflow) / net_inflow * 100, 2)' },
		]

		v.columns(colInfos.map(({ name }) => name))
		v.as(knex.raw(`
			select ${colInfos.map(({ name, query }) => `(${query}) as ${name}`).join(', ')}
			from (
				select
					(${totalInflowQuery}) as total_inflow,
					(${totalOutflowQuery}) as total_outflow,
					(${netInflowQuery}) as net_inflow,
					(${lastScannedAtQuery}) as last_scanned_at,
					(${currentUsdValueQuery}) as current_usd_value,
					(${oneDayAgoUsdValueQuery}) as one_day_ago_usd_value,
					(${sevenDayAgoUsdValueQuery}) as seven_day_ago_usd_value,
					(${thirtyAgoUsdValueQuery}) as thirty_day_ago_usd_value,
					(${thirtyDayHighQuery}) as thirty_day_high,
					(${thirtyDayLowQuery}) as thirty_day_low
			) as t
		`))
	})
}
