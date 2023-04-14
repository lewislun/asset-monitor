import { Command } from 'commander'

import * as lib from '../lib/index.js'

const cmd = new Command('scan')
const logger = lib.createLogger('CLI')

cmd
	.description('Scan assets from all sources.')
	.option('-s, --save', 'save results to database', false)
	.option('-l, --list-all', 'list all query results in the terminal', false)
	.option('-S, --scanner-config <path>', 'path to the scanner config file')
	.option('-C, --secrets <path>', 'path to the secrets file')
	.action(async ({ save, listAll, scannerConfig, secrets }) => {
		const assetMonitor = new lib.AssetMonitor({ scannerConfigPath: scannerConfig, secretsPath: secrets })
		const scanResult = await assetMonitor.scan()
		if (listAll) {
			scanResult.snapshots.forEach(result => logger.info(JSON.stringify(result, undefined, 2)))
		}
		logger.info(`Total USD Value: $${scanResult.totalUSDValue}`)

		if (save) {
			logger.info(`Storing results to DB - resultCount: ${scanResult.snapshots.length}`)
			const batch = await lib.AssetSnapshotBatch.store(scanResult)
			logger.info(`Results stored to DB - batchId: ${batch.id}`)
		}

		logger.info("DONE")
		await assetMonitor.close()
		process.exit(0)
	})

export default cmd
