import { Model } from 'objection'
import Knex from 'knex'

import knexfile from './knexfile.js'

// apply knex file
const knex = Knex(knexfile)
Model.knex(knex)

let dbReady = false

export { knex, knexfile }

export async function setupDb() {
	if (dbReady) return
	this.timeout(10000)
	// await dropAllTables(knex, knexfile)
	await knex.migrate.latest()
	dbReady = true
}

export async function revertDb() {
	if (!dbReady) return
	this.timeout(10000)
	await knex.migrate.rollback()
	dbReady = false
}