import fs from 'fs'
import path from 'path'

import { BiMap } from 'mnemonist'
import yaml from 'js-yaml'
import cron from 'node-cron'
import mustache from 'mustache'

import { BasePriceScanner, ScannerClassByType as PriceScannerClassByType } from './price-scanners/index.js'
import { BaseAssetScanner, ScannerClassByType as AsseteScannerClassByType } from './asset-scanners/index.js'
import * as enums from './enums.js'
import * as types from './types.js'
import * as errors from './errors.js'
import PriceAggregator from './price-aggregator.js'
import { createLogger, RateLimiter, isEnumMember } from './utils/index.js'
import Decimal from 'decimal.js'
import { AssetSnapshotBatch } from './models/index.js'

/**
 * @typedef AssetMonitorOpts
 * @property {string} [scannerConfigPath]
 * @property {string} [queryConfigPath]
 * @property {string} [secretsPath]
 */

const DEFAULT_SCANNERS_CONFIG_PATH = './scanners-config.yaml'
const DEFAULT_QUERY_CONFIG_PATH = './query-config.yaml'
const DEFAULT_SECRETS_PATH = './secrets.yaml'
const DEFAULT_SCANNER_NAME_SEPARATOR = '@'

const logger = createLogger('AssetMonitor')

export default class AssetMonitor {

	/** @type {Map<string, BaseAssetScanner>} */							assetScannerByName = new Map()
	/** @type {types.AssetQuery[]} */										queries = []
	/** @protected @type {Map<string, BiMap<string, types.AssetCode>>} */	assetIdByCodeByChain = new Map()
	/** @protected @type {PriceAggregator} */								priceAggregator = new PriceAggregator()

	/**
	 * @param {AssetMonitorOpts} [opts={}]
	 */
	constructor(opts = {}) {
		const scannersConfigPath = opts?.scannerConfigPath ?? DEFAULT_SCANNERS_CONFIG_PATH
		const queryConfigPath = opts?.queryConfigPath ?? DEFAULT_QUERY_CONFIG_PATH
		const secretsPath = opts?.secretsPath ?? DEFAULT_SECRETS_PATH

		// load secrets
		logger.info(`Loading secrets: ${path.resolve(secretsPath)}`)
		const secretObj = yaml.load(fs.readFileSync(secretsPath, 'utf8'))

		// load and process scanners config
		logger.info(`Setting up scanners with config: ${path.resolve(scannersConfigPath)}`)
		/** @type {types.ScannersConfig} */
		const scannersConfig = this.loadConfig(scannersConfigPath, secretObj)
		this.setupScanners(scannersConfig)

		// load and process query config
		logger.info(`Setting up scanners with query config: ${path.resolve(queryConfigPath)}`)
		/** @type {types.QueryConfig} */
		const monitorConfig = this.loadConfig(queryConfigPath, secretObj)
		this.setupQueries(monitorConfig)
	}

	/**
	 * @protected
	 * @param {string} path
	 * @param {object} [secretObj]
	 * @returns {types.ScannersConfig | types.QueryConfig}
	 */
	loadConfig(path, secretObj) {
		const rawConfig = yaml.load(fs.readFileSync(path, 'utf8'))
		if (!secretObj) return rawConfig
		const configJsonStr = JSON.stringify(rawConfig)
		return JSON.parse(mustache.render(configJsonStr, secretObj))
	}

	/**
	 * @public
	 * @returns {Promise<types.ScanResult>}
	 */
	async scan() {
		logger.info(`Start scanning assets - queryCount: ${this.queries.length}`)
		const startTime = new Date()
		const promises = this.queries.map(query => this.assetScannerByName.get(query.scannerName).query(query))
		const queryResults = (await Promise.all(promises)).flat()
		const endTime = new Date()

		/** @type {types.ScanResult} */
		const result = {
			queryResults,
			totalUSDValue: queryResults.reduce((acc, cur) => acc.add(cur.usdValue), new Decimal(0)),
			startTime,
			endTime,
			timeUsedMs: endTime.getTime() - startTime.getTime(),
		}
		logger.info(`Finished scanning assets - totalUSDValue: ${result.totalUSDValue}, timeUsedMs: ${result.timeUsedMs}, resultCount: ${queryResults.length}`)
		return result
	}

	/**
	 * @public
	 * @param {string} [cronSchedule='0 * * * *']
	 * @returns {Promise<void>}
	 */
	async monitor(cronSchedule = '0 * * * *') {
		logger.info(`Start monitoring assets with cron: '${cronSchedule}'...`)
		cron.schedule(cronSchedule, async () => {
			const scanResult = await this.scan()
			logger.info('Storing query results...')
			const batch = await AssetSnapshotBatch.storeScanResult(scanResult)
			logger.info(`Results stored - batchId: ${batch.id}`)
		})
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
	 * @param {types.AssetScannerConfig} config
	 */
	addAssetScanner(config) {
		logger.debug(`Adding Asset Scanner - ${JSON.stringify(config)}`)

		if (!isEnumMember(enums.AssetScannerType, config.type)) {
			throw new errors.InvalidAssetScannerTypeError(config.type)
		}

		// get scanner class
		/** @type {typeof BaseAssetScanner} */
		const scannerClass = AsseteScannerClassByType[config.type]
		if (!scannerClass) {
			throw new errors.NotImplementedError(`AssetScannerType: ${config.type}`)
		}

		// instantiate scanner
		const name = config?.name ?? config?.type + DEFAULT_SCANNER_NAME_SEPARATOR + config?.chain
		const assetInfoMap = this.assetIdByCodeByChain.get(config.chain)
		const scanner = new scannerClass(this.priceAggregator, config.chain, assetInfoMap, config.params)
		this.assetScannerByName.set(name, scanner)
		logger.debug(`AssetScanner added - name: ${name}, config: ${JSON.stringify(config)}`)
	}

	/**
	 * @public
	 * @param {types.PriceScannerConfig} config
	 */
	addPriceScanner(config) {
		logger.debug(`Adding Price Scanner - ${JSON.stringify(config)}`)

		if (!isEnumMember(enums.PriceScannerType, config.type)) {
			throw new errors.InvalidPriceScannerTypeError(config.type)
		}

		// get scanner class
		/** @type {typeof BasePriceScanner} */
		const scannerClass = PriceScannerClassByType[config.type]
		if (!scannerClass) {
			throw new errors.NotImplementedError(`PriceScannerType: ${config.type}`)
		}

		// instantiate scanner
		const scanner = new scannerClass(config.params, config.assetIdByCode)
		this.priceAggregator.addPriceScanner(config.type, scanner)
		logger.debug(`PriceScanner added - name: ${scannerClass.constructor.name}, config: ${JSON.stringify(config)}`)
	}

	/**
	 * @protected
	 * @param {types.QueryConfig} config
	 */
	setupQueries(config) {
		// Queries
		if (config.queries) {
			config.queries.forEach(query => this.addQuery(query))
		} else {
			logger.warn(`QueryConfig does not have queries.`)
		}
	}

	/**
	 * @protected
	 * @param {types.ScannersConfig} config
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
		if (config.assetIdByCodeByChain && typeof config.assetIdByCodeByChain == 'object') {
			logger.debug(`scannersConfig.assetIdByCodeByChain found. Storing them in memory...`)
			for (const chain in config.assetIdByCodeByChain) {
				const newMap = BiMap.from(config.assetIdByCodeByChain[chain] ?? {})
				this.assetIdByCodeByChain.set(chain, newMap)
			}
		} else {
			logger.debug(`Missing scannersConfig.assetIdByCodeByChain.`)
		}

		// price scanners
		if (config.priceScanners) {
			for (const scannerConfig of config.priceScanners) {
				this.addPriceScanner(scannerConfig)
			}
		} else {
			logger.warn(`ScannersConfig does not have priceScanners.`)
		}

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