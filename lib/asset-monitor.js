'use strict'

import fs from 'fs'
import path from 'path'

import yaml from 'js-yaml'

import * as priceScanners from './price-scanners/index.js'
import { BaseAssetScanner, ScannerClassByType} from './asset-scanners/index.js'
import * as enums from './enums.js'
import * as types from './types.js'
import * as errors from './errors.js'
import PriceAggregator from './price-aggregator.js'
import { createLogger, RateLimiter, isEnumMember } from './utils/index.js'

/**
 * @typedef {import('./asset-scanners').AssetInfoMap} AssetInfoMap
 * 
 * @typedef AssetMonitorOpts
 * @property {string} [scannerConfigPath]
 * @property {string} [monitorConfigPath]
 * 
 * @typedef AssetScannerConfig
 * @property {string} [name] If this is omitted, the name will be <type>@<chain>
 * @property {enums.AssetScannerType} type
 * @property {enums.Chain} chain
 * @property {object} params
 * 
 * @typedef ScannersConfig
 * @property {object[]} [rateLimiters]
 * @property {string} rateLimiters.key
 * @property {number} rateLimiters.callPerSec
 * @property {Object.<string, AssetInfoMap>} [assetInfoMapByChain]
 * @property {AssetScannerConfig[]} assetScanners
 * 
 * @typedef MonitorConfig
 * @property {types.AssetQuery[]} queries
 */

const DEFAULT_SCANNERS_CONFIG_PATH = './scanners-config.default.yaml'
const DEFAULT_MONITOR_CONFIG_PATH = './monitor-config.yaml'
const DEFAULT_SCANNER_NAME_SEPARATOR = '@'

const logger = createLogger('AssetMonitor')

export default class AssetMonitor {

	/** @type {Map<string, BaseAssetScanner>} */		assetScannerByName = new Map()
	/** @type {types.AssetQuery[]} */					queries = []
	/** @protected @type {Map<string, AssetInfoMap>} */	assetInfoMapByChain = new Map()
	/** @protected @type {PriceAggregator} */			priceAggregator = new PriceAggregator()

	/**
	 * @param {AssetMonitorOpts} [opts={}]
	 */
	constructor(opts = {}) {
		const scannersConfigPath = opts?.scannerConfigPath ?? DEFAULT_SCANNERS_CONFIG_PATH
		const monitorConfigPath = opts?.monitorConfigPath ?? DEFAULT_MONITOR_CONFIG_PATH

		// load and process scanners config
		logger.info(`Setting up scanners with config: ${path.resolve(scannersConfigPath)}`)
		/** @type {ScannersConfig} */
		const scannersConfig = yaml.load(fs.readFileSync(scannersConfigPath, 'utf8'))
		this.setupScanners(scannersConfig)

		// load and process monitor config
		logger.info(`Setting up scanners with config: ${path.resolve(monitorConfigPath)}`)
		/** @type {MonitorConfig} */
		const monitorConfig = yaml.load(fs.readFileSync(monitorConfigPath, 'utf8'))
		this.setupMonitor(monitorConfig)
	}

	/**
	 * @public
	 * @returns {Promise<types.AssetQueryResult[]>}
	 */
	async scanOnce() {
		const promises = this.queries.map(query => this.assetScannerByName.get(query.scannerName).query(query))
		return (await Promise.all(promises)).flat()
	}

	/**
	 * @public
	 */
	async close() {
		const promises = [
			this.priceAggregator.close()
		]
		for (let [_, scanner] of this.assetScannerByName) {
			promises.push(scanner.close())
		}
		await Promise.all(promises)
	}

	/**
	 * @public
	 * @param {types.AssetQuery} query
	 */
	addQuery(query) {
		logger.debug(`Adding Query - ${JSON.stringify(query)}`)
		if (!this.assetScannerByName.get(query.scannerName)) {
			throw new errors.AssetScannerNotFoundError(query.scannerName)
		}
		this.queries.push(query)
	}

	/**
	 * @public
	 * @param {AssetScannerConfig} config
	 */
	addAssetScanner(config) {
		logger.debug(`Adding Asset Scanner - ${JSON.stringify(config)}`)

		if (!isEnumMember(enums.AssetScannerType, config.type)) {
			throw new errors.InvalidAssetScannerTypeError(config.type)
		}
		if (!isEnumMember(enums.Chain, config.chain)) {
			throw new errors.InvalidChainError(config.chain)
		}

		// get scanner class
		/** @type {typeof BaseAssetScanner} */
		const scannerClass = ScannerClassByType[config.type]
		if (!scannerClass) {
			throw new errors.NotImplementedError(`AssetScannerType: ${config.type}`)
		}

		// instantiate scanner
		const name = config?.name ?? config?.type + DEFAULT_SCANNER_NAME_SEPARATOR + config?.chain
		const assetInfoMap = this.assetInfoMapByChain.get(config.chain)
		const scanner = new scannerClass(this.priceAggregator, config.chain, assetInfoMap, config.params)
		this.assetScannerByName.set(name, scanner)
		logger.info(`AssetScanner added - name: ${name}, config: ${JSON.stringify(config)}`)
	}

	/**
	 * @protected
	 * @param {MonitorConfig} config
	 */
	setupMonitor(config) {
		// Queries
		if (config.queries) {
			config.queries.forEach(query => this.addQuery(query))
		} else {
			logger.warn(`MonitorConfig does not have queries.`)
		}
	}

	/**
	 * @protected
	 * @param {ScannersConfig} config
	 */
	setupScanners(config) {
		// rate limiters
		if (config.rateLimiters) {
			for (const rateLimiterConfig of config.rateLimiters) {
				if (rateLimiterConfig.callPerSec === undefined) {
					logger.warn(`Defining rate limiter without specifying callPerSec does nothing.`)
				} else {
					RateLimiter.getInstance({ instanceKey: rateLimiterConfig.key, callPerSec: rateLimiterConfig.callPerSec })
				}
			}
		}

		// store assetInfoMaps
		if (config.assetInfoMapByChain && typeof config.assetInfoMapByChain == 'object') {
			logger.debug(`scannersConfig.assetInfoMapByChain found. Storing them in memory...`)
			for (const chain in config.assetInfoMapByChain) {
				if (!isEnumMember(enums.Chain, chain)) {
					throw new errors.InvalidChainError(chain)
				}
				const newMap = new Map(Object.entries(config.assetInfoMapByChain[chain]))
				this.assetInfoMapByChain.set(chain, newMap)
			}
		} else {
			logger.debug(`Missing scannersConfig.assetInfoMapByChain.`)
		}

		// price scanners
		this.priceAggregator.addPriceScanner(new priceScanners.CoinGeckoPriceScanner({ callPerSec: 10/60 }))

		// asset scanners
		if (config.assetScanners) {
			for (const scannerConfig of config.assetScanners) {
				this.addAssetScanner(scannerConfig)
			}
		} else {
			logger.warn(`ScannersConfig does not have assetScanners.`)
		}
	}
}