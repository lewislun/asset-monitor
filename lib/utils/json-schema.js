'use strict'

import { AssetCode, AssetType, AssetState, Chain } from '../enums.js'

/**
 * @typedef {import('objection').JSONSchema} JSONSchema
 */

/** @type {JSONSchema} */
export const primaryIndexSchema = { type: 'integer' }

/** @type {JSONSchema} */
export const assetCodeSchema = { type: 'string', enum: Object.values(AssetCode) }

/** @type {JSONSchema} */
export const assetTypeSchema = { type: 'string', enum: Object.values(AssetType) }

/** @type {JSONSchema} */
export const assetStateSchema = { type: 'string', enum: Object.values(AssetState) }

/** @type {JSONSchema} */
export const chainSchema = { type: 'string', enum: Object.values(Chain) }

/** @type {JSONSchema} */
export const decimalSchema = { type: ['string', 'number'] }

/** @type {JSONSchema} */
export const datetimeSchema = { type: 'string', format: 'date-time' }

/** @type {JSONSchema} */
export const refIdSchema = { type: 'number' }