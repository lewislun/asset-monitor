import { schema } from '../utils/index.js'
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

}

BaseModel.AssetQuery = AssetQuery