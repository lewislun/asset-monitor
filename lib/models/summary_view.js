'use strict'

import { schema } from '../utils/index.js'
import BaseModel from './base.js'

/**
 * @typedef {import('objection').Transaction} Transaction
 */

export default class SummaryView extends BaseModel {
	static tableName = 'summary_view'

	/** @type {import('objection').JSONSchema} */
	static get jsonSchema() {
		return {
			type: 'object',
			properties: {
				total_inflow: schema.decimal,
				total_outflow: schema.decimal,
				net_inflow: schema.decimal,
				last_scanned_at: schema.datetime,
				current_usd_value: schema.decimal,
				one_day_ago_usd_value: schema.decimal,
				seven_day_ago_usd_value: schema.decimal,
				thirty_day_ago_usd_value: schema.decimal,
				thirty_day_range: { type: 'string' },
				pnl_percent: { type: 'number' },
			}
		}
	}
}

BaseModel.SummaryView = SummaryView