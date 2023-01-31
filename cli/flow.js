'use strict'

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
		const flow = await lib.AssetFlow.recordFlow(fromGroup, toGroup, amount, { time })
		logger.info(`Asset flow stored - id: ${flow.id}`)
		process.exit(0)
	})

export default cmd
