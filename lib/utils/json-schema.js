import { AssetType, AssetState, AssetTagCategory } from '../enums.js'

/**
 * @typedef {import('objection').JSONSchema} JSONSchema
 */

export const schema = {
	primaryIndex: { type: 'integer' },
	assetCode: { type: 'string', maxLength: 255 },
	assetState: { type: 'string', enum: Object.values(AssetState) },
	assetType: { type: 'string', enum: Object.values(AssetType) },
	assetTagCategory: { type: 'string', enum: Object.values(AssetTagCategory) },
	chain: { type: 'string', maxLength: 255 },
	decimal: { type: ['string', 'number'] },
	datetime: { type: 'string', format: 'date-time' },
	refId: { type: 'number' },
}