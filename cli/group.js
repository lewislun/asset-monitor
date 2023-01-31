'use strict'

import { Command } from 'commander'

import * as lib from '../lib/index.js'

const cmd = new Command('group')
const logger = lib.createLogger('CLI')

cmd
	.description('Create an asset group.')
	.addCommand(new Command('create')
		.argument('<name>', 'Name of the asset group.')
		.action(async name => {
			logger.info(`Creating an AssetGroup with name: ${name}...`)
			const group = await lib.AssetGroup.query().insert({ name })
			logger.info(`AssetGroup created - id: ${group.id}`)
			process.exit(0)
		})
	)

export default cmd
