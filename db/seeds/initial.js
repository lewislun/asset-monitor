import { Model } from 'objection'
import { AssetGroup, DEFAULT_ASSET_GROUP_NAME } from '../../lib/index.js'

/**
 * @param {import('knex').Knex} knex
 * @returns {Promise<void>}
 */
export async function seed(knex) {
	Model.knex(knex)
	await AssetGroup.query(knex).insert({ name: DEFAULT_ASSET_GROUP_NAME })
}
