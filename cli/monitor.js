'use strict'

import { Command } from 'commander'

import * as lib from '../lib/index.js'

const cmd = new Command('monitor')
const logger = lib.createLogger('CLI')

cmd
	.description('Scan and print assets from all sources once.')
	.option('-d, --debug', 'log debug', false)
	.action(async ({ debug }) => {
		if (debug) lib.setLogLevel('debug')

		const assetMonitor = new lib.AssetMonitor()
		assetMonitor.monitor()
	})

export default cmd
