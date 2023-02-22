import { Model, AjvValidator } from 'objection'
import addAjvFormats from 'ajv-formats'

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
	/** @type {typeof import('./user').default} */
	static User

	static createValidator() {
		return new AjvValidator({
			onCreateAjv: ajv => addAjvFormats(ajv),
			options: {
				allowUnionTypes: true,
			},
		})
	}

	/**
	 * @protected
	 * @param {import('objection').JSONSchema} jsonSchema
	 * @param {import('objection').Pojo} json
	 * @param {import('objection').ModelOptions} opt
	 */
	$beforeValidate(jsonSchema, json, opt) {
		for (const key in json) {
			const val = json[key]
			if (val instanceof Date) json[key] = val.toISOString()
		}
		return super.$beforeValidate(jsonSchema, json, opt)
	}

}