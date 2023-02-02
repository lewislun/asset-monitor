import { Model } from 'objection'
import Knex from 'knex'

import knexfile from './knexfile.js'

// apply knex file
const knex = Knex(knexfile)
Model.knex(knex)

let dbReady = false

/**
 * @param {import('knex').Knex} knex
 * @param {object} knexfile
 */
async function dropAllTables(knex, knexfile) {
	await knex.transaction(async trx => {
		await trx.raw('SET session_replication_role = \'replica\'')
		const queryStrs = (
			await trx('information_schema.tables')
				.select(knex.raw('concat(\'DROP TABLE IF EXISTS `\', table_name, \'`;\') as queryStr'))
				.where('table_schema', knexfile.connection.database)
		).map(result => result.queryStr)
		const dropTableQueries = queryStrs.map(queryStr => trx.raw(queryStr))
		await Promise.all(dropTableQueries)
		await trx.raw('SET session_replication_role = \'origin\'')
	})
}

export { knex, knexfile }

export async function setupDb() {
	if (dbReady) return
	this.timeout(10000)
	await dropAllTables(knex, knexfile)
	await knex.migrate.latest()
	dbReady = true
}

export async function revertDb() {
	if (!dbReady) return
	this.timeout(10000)
	await knex.migrate.rollback()
	dbReady = false
}