'use strict'

import Decimal from 'decimal.js'

import * as lib from './lib/index.js'

const assetMonitor = new lib.AssetMonitor()
const queryResults = await assetMonitor.scanOnce()
const assetResults = queryResults.flat()
let totalUSDValue = new Decimal(0)
for (let assetResult of assetResults) {
	lib.logger.info(JSON.stringify(assetResult, undefined, 2))
	totalUSDValue = totalUSDValue.add(assetResult.usdValue)
}

lib.logger.info(`Total USD Value: $${totalUSDValue}`)
lib.logger.info("DONE")
process.exit(0)