import { Model } from 'objection'
import { AssetSnapshot, AssetSnapshotBatch, AssetSnapshotTag, AssetGroup, AssetFlow } from '../../lib/index.js'

/**
 * @param {import('knex').Knex} knex
 * @returns {Promise<void>}
 */
export async function up(knex) {
	Model.knex(knex)

	await knex.schema.createTable(AssetGroup.tableName, t => {
		t.increments('id').primary()
		t.string('name', 255).notNullable().unique()
		t.timestamp('created_at').notNullable().defaultTo(knex.raw('CURRENT_TIMESTAMP'))
	})

	await knex.schema.createTable(AssetSnapshotBatch.tableName, t => {
		t.increments('id').primary()
		t.decimal('total_usd_value', 15, 6).notNullable()
		t.timestamp('scan_started_at').notNullable()
		t.timestamp('scan_finished_at').notNullable().index()
	})

	await knex.schema.createTable(AssetSnapshot.tableName, t => {
		t.increments('id').primary()
		t.integer('batch_id').notNullable().unsigned().index()
		t.integer('group_id').nullable().unsigned().index()
		t.string('code', 255).notNullable().index()
		t.string('chain', 255).notNullable().index()
		t.string('type', 255).notNullable().index()
		t.string('name', 255).nullable().index()
		t.string('state', 255).notNullable().index()
		t.decimal('quantity', 36, 18).notNullable()
		t.decimal('usd_value', 15, 6).notNullable()
		t.decimal('usd_value_per_quantity', 15, 6).notNullable()
		t.string('account_id', 255).nullable()
		t.timestamp('captured_at').notNullable()

		t.foreign('batch_id')
			.references('id')
			.inTable(AssetSnapshotBatch.tableName)
		t.foreign('group_id')
			.references('id')
			.inTable(AssetGroup.tableName)
	})

	await knex.schema.createTable(AssetSnapshotTag.tableName, t => {
		t.increments('id').primary()
		t.integer('snapshot_id').notNullable().unsigned().index()
		t.string('category', 255).notNullable().index()
		t.string('value', 255).notNullable().index()

		t.unique(['snapshot_id', 'category'])
		t.foreign('snapshot_id')
			.references('id')
			.inTable(AssetSnapshot.tableName)
	})

	await knex.schema.createTable(AssetFlow.tableName, t => {
		t.increments('id').primary()
		t.integer('from_group_id').nullable().unsigned().index()
		t.integer('to_group_id').nullable().unsigned().index()
		t.decimal('usd_value', 15, 6).notNullable()
		t.timestamp('executed_at').notNullable().defaultTo(knex.raw('CURRENT_TIMESTAMP'))

		t.foreign('from_group_id')
			.references('id')
			.inTable(AssetGroup.tableName)
		t.foreign('to_group_id')
			.references('id')
			.inTable(AssetGroup.tableName)
	})
}

/**
 * @param {import('knex').Knex} knex
 * @returns {Promise<void>}
 */
export async function down(knex) {
	Model.knex(knex)
	await knex.schema.dropTableIfExists(AssetSnapshotTag.tableName)
	await knex.schema.dropTableIfExists(AssetSnapshot.tableName)
	await knex.schema.dropTableIfExists(AssetSnapshotBatch.tableName)
	await knex.schema.dropTableIfExists(AssetFlow.tableName)
	await knex.schema.dropTableIfExists(AssetGroup.tableName)
}
