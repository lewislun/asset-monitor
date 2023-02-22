import { Model } from 'objection'
import { User } from '../../lib/models/index.js'
import * as enums from '../../lib/enums.js'

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

	await knex.raw(`
		CREATE OR REPLACE FUNCTION on_update_timestamp()
		RETURNS trigger AS $$
		BEGIN
			NEW.updated_at = now();
			RETURN NEW;
		END;
		$$ language 'plpgsql';
	`)

	await knex.schema.createTable(User.tableName, t => {
		t.increments('id')
		t.string('name', 255).notNullable().unique()
		t.string('hashed_password', 128).notNullable()
		t.enum('role', Object.values(enums.UserRole)).notNullable().defaultTo(enums.UserRole.VIEWER)
		t.timestamp('created_at').notNullable().defaultTo(knex.raw('CURRENT_TIMESTAMP'))
		t.timestamp('updated_at').notNullable().defaultTo(knex.raw('CURRENT_TIMESTAMP'))
		t.timestamp('last_login_at').notNullable().defaultTo(knex.raw('CURRENT_TIMESTAMP'))
	})

	await knex.raw(getOnUpdateTrigger(User.tableName))
}

/**
 * @param {import('knex').Knex} knex
 * @returns {Promise<void>}
 */
export async function down(knex) {
	Model.knex(knex)

	await knex.schema.dropTableIfExists(User.tableName)
	await knex.raw(`DROP FUNCTION on_update_timestamp`)
}
