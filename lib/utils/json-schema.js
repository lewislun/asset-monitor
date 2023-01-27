'use strict'

import { AssetType, AssetState, AssetTagCategory } from '../enums.js'

/**
 * @typedef {import('objection').JSONSchema} JSONSchema
 */

/** @type {JSONSchema} */
export const primaryIndexSchema = { type: 'integer' }

/** @type {JSONSchema} */
export const assetCodeSchema = { type: 'string', maxLength: 255 }

/** @type {JSONSchema} */
export const assetStateSchema = { type: 'string', enum: Object.values(AssetState) }

/** @type {JSONSchema} */
export const assetTypeSchema = { type: 'string', enum: Object.values(AssetType) }

/** @type {JSONSchema} */
export const assetTagCategorySchema = { type: 'string', enum: Object.values(AssetTagCategory) }

/** @type {JSONSchema} */
export const chainSchema = { type: 'string', maxLength: 255 }

/** @type {JSONSchema} */
export const decimalSchema = { type: ['string', 'number'] }

/** @type {JSONSchema} */
export const datetimeSchema = { type: 'string', format: 'date-time' }

/** @type {JSONSchema} */
export const refIdSchema = { type: 'number' }