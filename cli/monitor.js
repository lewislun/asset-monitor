import { Command } from 'commander'

import * as lib from '../lib/index.js'

const cmd = new Command('monitor')
const logger = lib.createLogger('CLI')

cmd
	.description('Scan assets and store the snapshots periodically.')
	.argument('[cron]', 'cron schedule. Default as \'0 * * * *\'')
	.option('-S, --scanner-config <path>', 'path to the scanner config file')
	.option('-Q, --query-config <path>', 'path to the query config file')
	.option('-C, --secrets <path>', 'path to the secrets file')
	.action(async (cron, { queryConfig, scannerConfig, secrets }) => {
		const assetMonitor = new lib.AssetMonitor({ queryConfigPath: queryConfig, scannerConfigPath: scannerConfig, secretsPath: secrets })
		assetMonitor.monitor(cron)
	})

export default cmd
