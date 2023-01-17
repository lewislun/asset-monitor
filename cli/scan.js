'use strict'

import { Command } from 'commander'
import Decimal from 'decimal.js'

import * as lib from '../lib/index.js'

const cmd = new Command('scan')

cmd
	.description('Scan and print assets from all sources once.')
	.option('-s, --save', 'save results to database', false)
	.action(async ({ save }) => {
		if (save) {
			// TODO:
			throw new Error('Save to DB is not implemented yet.')
		}

		const assetMonitor = new lib.AssetMonitor()
		const queryResults = await assetMonitor.scanOnce()
		let totalUSDValue = new Decimal(0)
		for (let assetResult of queryResults) {
			lib.logger.info(JSON.stringify(assetResult, undefined, 2))
			totalUSDValue = totalUSDValue.add(assetResult.usdValue)
		}

		lib.logger.info(`Total USD Value: $${totalUSDValue}`)
		lib.logger.info("DONE")
	})

export default cmd
