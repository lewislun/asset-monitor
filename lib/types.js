import Decimal from 'decimal.js'

import * as enums from './enums.js'

/**
 * @typedef {string} AssetCode
 * @typedef {string} Chain
 * @typedef {string | number | undefined} AssetGroupSpecifier Can either be group name (string), group id (number), or undefined to specify outside source.
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
 * @typedef ScanResult
 * @property {import('./models').AssetSnapshot} snapshots
 * @property {Decimal} totalUSDValue
 * @property {Date} startTime
 * @property {Date} endTime
 * @property {number} timeUsedMs
 */

export default {}