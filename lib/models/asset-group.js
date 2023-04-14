import { schema, startOrInheritTransaction } from '../utils/index.js'
import * as types from '../types.js'
import BaseModel from './base.js'

/**
 * @typedef {import('objection').Transaction} Transaction
 */

export default class AssetGroup extends BaseModel {
	static tableName = 'asset_groups'

	/** @type {import('objection').JSONSchema} */
	static get jsonSchema() {
		return {
			type: 'object',
			required: [
				'name',
			],
			properties: {
				id: schema.primaryIndex,
				name: { type: 'string', maxLength: 255 },
				created_at: schema.datetime,
			}
		}
	}

	/**
	 * @public
	 * @param {types.AssetGroupSpecifier} specifier
	 * @param {object} [opts={}]
	 * @param {Transaction} [opts.trx]
	 * @param {bool} [opts.create=false] Create the group if not exist and specifier is string.
	 * @returns {Promise<number | undefined>}
	 */
	static async getGroupId(specifier, opts = {}) {
		return await startOrInheritTransaction(async trx => {
			if (specifier === undefined || typeof specifier === 'number') return specifier
			let group = await AssetGroup.query(trx).findOne({ name: specifier })

			if (opts?.create && !group?.id && typeof specifier === 'string') {
				group = await AssetGroup.query(trx).insert({ name: specifier })
			}

			return group?.id
		}, opts?.trx)
	}

	/** @type {import('objection').RelationMappings} */
	static get relationMappings() {
		return {
			inFlows: {
				relation: BaseModel.HasManyRelation,
				modelClass: BaseModel.AssetFlow,
				join: {
					from: `${this.tableName}.id`,
					to: `${BaseModel.AssetFlow.tableName}.to_group_id`,
				},
			},
			outFlows: {
				relation: BaseModel.HasManyRelation,
				modelClass: BaseModel.AssetFlow,
				join: {
					from: `${this.tableName}.id`,
					to: `${BaseModel.AssetFlow.tableName}.from_group_id`,
				},
			},
		}
	}
}

BaseModel.AssetGroup = AssetGroup