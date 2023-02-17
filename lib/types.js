import Decimal from 'decimal.js'

import * as enums from './enums.js'

/**
 * @typedef {string} AssetCode
 * @typedef {string} Chain
 * @typedef {string | number | undefined} AssetGroupSpecifier Can either be group name (string), group id (number), or undefined to specify outside source.
 * 
 * @typedef AssetQuery
 * @property {string} scannerName
 * @property {string} [addr]
 * @property {string} [apiKey] This should be safe to be publicly seen. If not, use apiSecret.
 * @property {string} [apiSecret]
 * @property {object} extraTagMap
 * @property {AssetGroupSpecifier} [groupSpecifier]
 * 
 * @typedef AssetQueryResult
 * @property {types.AssetCode} code
 * @property {string} name display name
 * @property {Chain} chain Auto patched by BaseAssetScanner.
 * @property {enums.AssetType} type
 * @property {enums.AssetState} state
 * @property {Decimal} [quantity]
 * @property {Decimal} usdValue
 * @property {number} [usdValuePerQuantity]
 * @property {Date | number} timestamp
 * @property {object.<string, string>} [tagMap]
 * @property {string} [accountId] Auto patched by BaseAssetScanner. Value of this field in psuedo: query.addr ?? query.apiKey ?? query.apiSecret(censored) ?? undefined.
 * @property {AssetGroupSpecifier} [groupSpecifier] Auto patched by BaseAssetScanner. Value is copied from query.
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
 * 
 * @typedef ScanResult
 * @property {AssetQueryResult[]} queryResults
 * @property {Decimal} totalUSDValue
 * @property {Date} startTime
 * @property {Date} endTime
 * @property {number} timeUsedMs
 */

export default {}