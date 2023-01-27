'use strict'

import Decimal from 'decimal.js'

import * as enums from './enums.js'

/**
 * @typedef {string} AssetCode
 * 
 * @typedef AssetQuery
 * @property {string} scannerName
 * @property {string} [addr]
 * @property {string} [apiKey]
 * @property {string} [apiSecret]
 * @property {object} extraTagMap
 * 
 * @typedef AssetQueryResult
 * @property {types.AssetCode} code
 * @property {string} name display name
 * @property {Chain} chain
 * @property {enums.AssetType} type
 * @property {enums.AssetState} state
 * @property {Decimal} quantity
 * @property {Decimal} usdValue
 * @property {number} usdValuePerQuantity
 * @property {number} timestamp
 * @property {object.<string, string>} tagMap
 * 
 * @typedef {string} Chain
 */

export default {}