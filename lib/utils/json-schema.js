import { AssetType, AssetState } from '../enums.js'

/**
 * @typedef {import('objection').JSONSchema} JSONSchema
 */

export const schema = {
	/** @type {JSONSchema} */
	primaryIndex: { type: 'integer' },
	/** @type {JSONSchema} */
	assetCode: { type: 'string', maxLength: 255 },
	/** @type {JSONSchema} */
	assetState: { type: 'string', enum: Object.values(AssetState) },
	/** @type {JSONSchema} */
	assetType: { type: 'string', enum: Object.values(AssetType) },
	/** @type {JSONSchema} */
	assetTagCategory: { type: 'string' },
	/** @type {JSONSchema} */
	chain: { type: 'string', maxLength: 255 },
	/** @type {JSONSchema} */
	decimal: { type: ['string', 'number'] },
	/** @type {JSONSchema} */
	datetime: { type: 'string', format: 'date-time' },
	/** @type {JSONSchema} */
	refId: { type: 'number' },
}