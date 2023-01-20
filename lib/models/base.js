'use strict'

import { Model, AjvValidator } from 'objection'
import addAjvFormats from 'ajv-formats'

import { knex } from '../../db/index.js'

Model.knex(knex)

export default class BaseModel extends Model {

	/** @type {typeof import('./asset-history').default} */
	static AssetHistory
	/** @type {typeof import('./asset-history-batch').default} */
	static AssetHistoryBatch

	static createValidator() {
		return new AjvValidator({
			onCreateAjv: ajv => addAjvFormats(ajv),
			options: {
				allowUnionTypes: true,
			},
		})
	}

}