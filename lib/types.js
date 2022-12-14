'use strict'

import Decimal from 'decimal.js'

import * as enums from './enums.js'

/**
 * @typedef AssetQuery
 * @property {string} addr
 * @property {number} [timestamp]
 * 
 * 
 * @typedef AssetResult
 * @property {string} name display name
 * @property {string} symbol
 * @property {enums.Chain} chain
 * @property {enums.AssetType} type
 * @property {enums.AssetState} state
 * @property {Decimal} quantity
 * @property {number} usdValue
 * @property {number} usdValuePerQuantity
 * @property {number} timestamp
 */

export default {}