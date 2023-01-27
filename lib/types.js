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
 * 
 * @typedef AssetScannerConfig
 * @property {string} [name] If this is omitted, the name will be <type>@<chain>
 * @property {enums.AssetScannerType} type
 * @property {types.Chain} chain
 * @property {object} params
 * 
 * @typedef PriceScannerConfig
 * @property {enums.PriceScannerType} type
 * @property {object} [params]
 * @property {object.<types.AssetCode, string>} assetIdByCode
 * 
 * @typedef ScannersConfig
 * @property {object[]} [rateLimiters]
 * @property {string} rateLimiters.key
 * @property {number} rateLimiters.callPerSec
 * @property {Object.<string, Object.<string, string>>} [assetIdByCodeByChain]
 * @property {AssetScannerConfig[]} assetScanners
 * @property {PriceScannerConfig[]} priceScanners
 * 
 * @typedef QueryConfig
 * @property {string} [cron]
 * @property {types.AssetQuery[]} queries
 */

export default {}