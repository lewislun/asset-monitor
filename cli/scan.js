'use strict'

import { Command } from 'commander'

import * as lib from '../lib/index.js'

const cmd = new Command('scan')
const logger = lib.createLogger('CLI')

cmd
	.description('Scan and print assets from all sources once.')
	.option('-s, --save', 'save results to database', false)
	.option('-d, --debug', 'log debug', false)
	.option('-S, --scanner-config <path>', 'path to the scanner config')
	.option('-Q, --query-config <path>', 'path to the query config')
	.action(async ({ save, debug, queryConfig, scannerConfig }) => {
		if (debug) lib.setLogLevel('debug')

		const assetMonitor = new lib.AssetMonitor({ queryConfigPath: queryConfig, scannerConfigPath: scannerConfig })
		const { queryResults, totalUSDValue } = await assetMonitor.scan()
		queryResults.forEach(result => logger.info(JSON.stringify(result, undefined, 2)))
		logger.info(`Total USD Value: $${totalUSDValue}`)

		if (save) {
			logger.info(`Storeing results to DB - resultCount: ${queryResults.length}`)
			const batch = await lib.AssetSnapshotBatch.storeResults(queryResults)
			logger.info(`Results stored to DB - batchId: ${batch.id}`)
		}

		logger.info("DONE")
		await assetMonitor.close()
		process.exit(0)
	})

export default cmd
