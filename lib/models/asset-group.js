'use strict'

import { schema } from '../utils/index.js'
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
	 * @returns {Promise<number | undefined>}
	 */
	static async getGroupId(specifier, opts = {}) {
		if (specifier === undefined || typeof specifier === 'number') return specifier
		const group = await AssetGroup.query(opts?.trx).findOne({ name: specifier })
		return group?.id
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