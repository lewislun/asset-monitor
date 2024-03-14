import Decimal from 'decimal.js'
import * as types from '../types.js'
import * as enums from '../enums.js'

/**
 * @typedef NetFlowData
 * @property {number} groupId
 * @property {string} groupName
 * @property {Date} time
 * @property {Decimal} usdValue
 * 
 * @typedef TotalValueData
 * @property {types.AssetCode} [code]
 * @property {types.Chain} [chain]
 * @property {enums.AssetType} [type]
 * @property {enums.AssetState} [state]
 * @property {string} [tagValue]
 * @property {Decimal} usdValue
 * @property {Decimal} percentage
 */

export default {}