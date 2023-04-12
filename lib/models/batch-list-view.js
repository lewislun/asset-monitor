'use strict'

import { schema } from '../utils/index.js'
import BaseModel from './base.js'

/**
 * @typedef {import('objection').Transaction} Transaction
 */

export default class BatchListView extends BaseModel {
	static tableName = 'batch_list_view'

	/** @type {import('objection').JSONSchema} */
	static get jsonSchema() {
		return {
			type: 'object',
			properties: {
				batch_id: schema.refId,
				scan_started_at: schema.datetime,
				time_used_sec: { type: 'number' },
				usd_value: schema.decimal,
			}
		}
	}
}

BaseModel.BatchListView = BatchListView