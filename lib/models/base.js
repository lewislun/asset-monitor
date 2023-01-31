import { Model, AjvValidator } from 'objection'
import addAjvFormats from 'ajv-formats'

import { knex } from '../../db/index.js'

Model.knex(knex)

export default class BaseModel extends Model {

	/** @type {typeof import('./asset-flow').default} */
	static AssetFlow
	/** @type {typeof import('./asset-group').default} */
	static AssetGroup
	/** @type {typeof import('./asset-snapshot').default} */
	static AssetSnapshot
	/** @type {typeof import('./asset-snapshot-batch').default} */
	static AssetSnapshotBatch
	/** @type {typeof import('./asset-snapshot-tag').default} */
	static AssetSnapshotTag

	static createValidator() {
		return new AjvValidator({
			onCreateAjv: ajv => addAjvFormats(ajv),
			options: {
				allowUnionTypes: true,
			},
		})
	}

}