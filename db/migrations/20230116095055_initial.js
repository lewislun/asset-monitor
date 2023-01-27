'use strict'

import { AssetSnapshot, AssetSnapshotBatch, AssetSnapshotTag } from '../../lib/index.js'

/**
 * @param {import('knex').Knex} knex
 * @returns {Promise<void>}
 */
export async function up(knex) {
	await knex.schema.createTable(AssetSnapshotBatch.tableName, t => {
		t.increments('id').primary()
		t.decimal('total_usd_value', 15, 6).notNullable()
		t.timestamp('scan_started_at').notNullable()
		t.timestamp('scan_finished_at').notNullable()
	})

	await knex.schema.createTable(AssetSnapshot.tableName, t => {
		t.increments('id').primary()
		t.integer('batch_id').notNullable().unsigned().index()
		t.string('code', 255).notNullable().index()
		t.string('chain', 255).notNullable().index()
		t.string('type', 255).notNullable().index()
		t.string('name', 255).notNullable().index()
		t.string('state', 255).notNullable().index()
		t.decimal('quantity', 36, 18).notNullable()
		t.decimal('usd_value', 15, 6).notNullable()
		t.decimal('usd_value_per_quantity', 15, 6).notNullable()
		t.timestamp('captured_at').notNullable()

		t.foreign('batch_id')
			.references('id')
			.inTable(AssetSnapshotBatch.tableName)
	})

	await knex.schema.createTable(AssetSnapshotTag.tableName, t => {
		t.increments('id').primary()
		t.integer('snapshot_id').notNullable().unsigned().index()
		t.string('category', 255).notNullable().index()
		t.string('name', 255).notNullable().index()

		t.unique(['snapshot_id', 'category'])
		t.foreign('snapshot_id')
			.references('id')
			.inTable(AssetSnapshot.tableName)
	})
}

/**
 * @param {import('knex').Knex} knex
 * @returns {Promise<void>}
 */
export async function down(knex) {
	await knex.schema.dropTableIfExists(AssetSnapshotTag.tableName)
	await knex.schema.dropTableIfExists(AssetSnapshot.tableName)
	await knex.schema.dropTableIfExists(AssetSnapshotBatch.tableName)
}
