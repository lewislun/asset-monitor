'use strict'

import { AssetHistory } from '../../lib/index.js'

/**
 * @param {import('knex').Knex} knex
 * @returns {Promise<void>}
 */
export async function up(knex) {
  await knex.schema.createTable(AssetHistory.tableName, t => {
	t.increments('id').primary()
	t.string('code', 255).notNullable().index()
	t.string('type', 255).notNullable().index()
	t.string('name', 255).notNullable().index()
	t.string('state', 255).notNullable().index()
	t.decimal('quantity', 36, 18).notNullable()
	t.decimal('usd_value', 15, 6).notNullable()
	t.decimal('usd_value_per_quantity', 15, 6).notNullable()
	t.timestamp('captured_at').notNullable()
  })
}

/**
 * @param {import('knex').Knex} knex
 * @returns {Promise<void>}
 */
export async function down(knex) {
  await knex.schema.dropTable(AssetHistory.tableName)
}
