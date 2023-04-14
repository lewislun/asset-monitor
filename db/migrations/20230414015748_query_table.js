import { Model } from 'objection'
import { AssetQuery, AssetGroup } from '../../lib/models/index.js'

const getOnUpdateTrigger = (tableName) => `
	CREATE TRIGGER ${tableName}_updated_at
	BEFORE UPDATE ON ${tableName}
	FOR EACH ROW
	EXECUTE PROCEDURE on_update_timestamp();
`

/**
 * @param {import('knex').Knex} knex
 * @returns {Promise<void>}
 */
export async function up(knex) {
	Model.knex(knex)

	await knex.schema.createTable(AssetQuery.tableName, t => {
		t.increments('id')
		t.string('scanner_type', 255).notNullable()
		t.string('chain', 255).notNullable()
		t.string('address', 255)
		t.integer('group_id').unsigned()
		t.string('api_key', 255)
		t.string('api_secret', 255)
		t.jsonb('extra_tag_map').defaultTo('{}').notNullable()
		t.boolean('is_enabled').defaultTo(true).notNullable()
		t.timestamps(true, true)

		t.foreign('group_id')
			.references('id')
			.inTable(AssetGroup.tableName)
			.onDelete('CASCADE')
	})
	await knex.raw(getOnUpdateTrigger(AssetQuery.tableName))
}

/**
 * @param {import('knex').Knex} knex
 * @returns {Promise<void>}
 */
export async function down(knex) {
	Model.knex(knex)

	await knex.schema.dropTable(AssetQuery.tableName)
}
