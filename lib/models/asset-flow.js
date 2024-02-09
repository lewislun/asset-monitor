import Decimal from 'decimal.js'

import BaseModel from './base.js'
import { schema } from '../utils/index.js'

/**
 * @typedef {import('objection').Transaction} Transaction
 */

export default class AssetFlow extends BaseModel {
	static tableName = 'asset_flows'

	/** @type {import('objection').JSONSchema} */
	static get jsonSchema() {
		return {
			type: 'object',
			required: [
				'invested_usd_value',
				'actual_usd_value',
			],
			properties: {
				id: schema.primaryIndex,
				from_group_id: schema.refId,
				to_group_id: schema.refId,
				invested_usd_value: schema.decimal,
				actual_usd_value: schema.decimal,
				executed_at: schema.datetime,
			}
		}
	}

	/** @type {import('objection').RelationMappings} */
	static get relationMappings() {
		return {
			toGroup: {
				relation: BaseModel.BelongsToOneRelation,
				modelClass: BaseModel.AssetGroup,
				join: {
					from: `${this.tableName}.to_group_id`,
					to: `${BaseModel.AssetGroup.tableName}.id`,
				},
			},
			fromGroup: {
				relation: BaseModel.BelongsToOneRelation,
				modelClass: BaseModel.AssetGroup,
				join: {
					from: `${this.tableName}.from_group_id`,
					to: `${BaseModel.AssetGroup.tableName}.id`,
				},
			},
		}
	}

	/**
	 * @public
	 * @param {object} [opts={}]
	 * @param {Transaction} [opts.trx]
	 * @param {number[]} [opts.groupIds]
	 * @returns {Promise<Decimal>}
	 */
	static async getTotalInvestedValue(opts = {}) {
		const inflowQuery = this.query(opts?.trx).sum('invested_usd_value as inflowValue')
		if (opts?.groupIds && opts.groupIds?.length > 0) {
			inflowQuery.whereIn('to_group_id', opts.groupIds)
		}
		const { inflowValue } = await inflowQuery.first()

		const outflowQuery = this.query(opts?.trx).sum('invested_usd_value as outflowValue')
		if (opts?.groupIds && opts.groupIds?.length > 0) {
			outflowQuery.whereIn('from_group_id', opts.groupIds)
		}
		const { outflowValue } = await outflowQuery.first()

		return new Decimal(inflowValue ?? 0).sub(outflowValue ?? 0)
	}
}

BaseModel.AssetFlow = AssetFlow