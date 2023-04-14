import fs from 'fs'
import yaml from 'js-yaml'

import { schema, startOrInheritTransaction } from '../utils/index.js'
import BaseModel from './base.js'

/**
 * @typedef {import('objection').Transaction} Transaction
 */

export default class AssetQuery extends BaseModel {
	static tableName = 'asset_queries'

	/** @type {import('objection').JSONSchema} */
	static get jsonSchema() {
		return {
			type: 'object',
			required: [
				'scanner_type',
				'chain',
			],
			oneOf: [
				{ required: [ 'address' ] },
				{ required: [ 'api_secret' ]},
			],
			properties: {
				id: schema.primaryIndex,
				scanner_type: schema.assetScannerType,
				chain: schema.chain,
				address: { type: 'string', maxLength: 255 },
				group_id: schema.refId,
				api_key: { type: 'string', maxLength: 255 },
				api_secret: { type: 'string', maxLength: 255 },
				extra_tag_map: { type: 'object', default: {} },
				is_enabled: { type: 'boolean', default: true },
			}
		}
	}

	/** @type {import('objection').RelationMappings} */
	static get relationMappings() {
		return {
			group: {
				relation: BaseModel.BelongsToOneRelation,
				modelClass: BaseModel.AssetGroup,
				join: {
					from: `${this.tableName}.group_id`,
					to: `${BaseModel.AssetGroup.tableName}.id`,
				},
			},
		}
	}

	static get modifiers() {
		return {
			/**
			 * @param {import('objection').QueryBuilder} query
			 */
			isEnabled(query) {
				query.where('is_enabled', true)
			}
		}
	}

	/**
	 * @param {string} configPath
	 * @param {object} [opts={}]
	 * @param {Transaction} [opts.trx]
	 * @returns {Promise<AssetQuery[]>}
	 */
	static async importFromQueryConfig(configPath, opts = {}) {
		const configData = yaml.load(fs.readFileSync(configPath, 'utf8'))
		if (!configData || !Array.isArray(configData.queries)) {
			throw new Error('Invalid config file')
		}

		return await startOrInheritTransaction(async trx => {
			const payload = []
			for (const queryObj of configData.queries) {
				const [scannerType, chain] = queryObj.scannerName.split('@')
				payload.push({
					scanner_type: scannerType,
					chain,
					address: queryObj.addr,
					group_id: await BaseModel.AssetGroup.getGroupId(queryObj.groupSpecifier, { trx }),
					api_key: queryObj.apiKey,
					api_secret: queryObj.apiSecret,
					extra_tag_map: queryObj.extraTagMap ?? {},
				})
			}
			if (!payload.length) return []
			return await AssetQuery.query(trx).insertGraphAndFetch(payload)
		}, opts.trx)
	}
}

BaseModel.AssetQuery = AssetQuery