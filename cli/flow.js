import { Command } from 'commander'

import * as lib from '../lib/index.js'

const cmd = new Command('flow')
const logger = lib.createLogger('CLI')

cmd
	.description('Store an asset flow.')
	.argument('amount', 'Amount of asset in USD.')
	.option('-f, --from-group <name-or-id>', 'Asset group to send the amount. It can either be the group\'s name or id. Omit to indicate an in-flow.', undefined)
	.option('-t, --to-group <name-or-id>', 'Asset group to receive the amount. It can either be the group\'s name or id. Omit to indicate an out-flow.', undefined)
	.option('-T, --time', 'Time of the flow.', undefined)
	.action(async (amount, { fromGroup, toGroup, time }) => {
		logger.info(`Storing asset flow...`)
		const assetMonitor = new lib.AssetMonitor({})
		const flow = await assetMonitor.recordFlow(fromGroup, toGroup, amount, { time })
		logger.info(`Asset flow stored - id: ${flow.id}, investedValue: ${flow.invested_usd_value}, actualValue: ${flow.actual_usd_value}`)
		process.exit(0)
	})

export default cmd
