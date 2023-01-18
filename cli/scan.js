'use strict'

import { Command } from 'commander'
import Decimal from 'decimal.js'

import * as lib from '../lib/index.js'

const cmd = new Command('scan')
const logger = lib.createLogger('CLI')

cmd
	.description('Scan and print assets from all sources once.')
	.option('-s, --save', 'save results to database', false)
	.action(async ({ save }) => {
		const assetMonitor = new lib.AssetMonitor()
		const queryResults = await assetMonitor.scanOnce()
		let totalUSDValue = new Decimal(0)
		for (let assetResult of queryResults) {
			logger.info(JSON.stringify(assetResult, undefined, 2))
			totalUSDValue = totalUSDValue.add(assetResult.usdValue)
		}

		logger.info(`Total USD Value: $${totalUSDValue}`)

		if (save) {
			const batch = await lib.AssetHistoryBatch.storeResults(queryResults)
			logger.info(`Results stored to DB - batchId: ${batch.id}`)
		}

		logger.info("DONE")
		await assetMonitor.close()
		process.exit(0)
	})

export default cmd
