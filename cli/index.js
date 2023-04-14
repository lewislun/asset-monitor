import { Command } from 'commander'
import { Model } from 'objection'

import * as lib from '../lib/index.js'
import { knex } from '../db/index.js'
import batchCmd from './batch.js'
import flowCmd from './flow.js'
import groupCmd from './group.js'
import monitorCmd from './monitor.js'
import queryCmd from './query.js'
import scanCmd from './scan.js'
import userCmd from './user.js'
import packageJson from '../package.json' assert { type: 'json' }

Model.knex(knex)
const program = new Command()
const cmds = [scanCmd, monitorCmd, flowCmd, groupCmd, userCmd, queryCmd, batchCmd]

program
	.description('Web3 Asset Monitor')
	.version(packageJson.version)
	.option('-d, --debug', 'Set log level to debug.', false)
	.on('option:debug', () => lib.setLogLevel('debug'))

cmds.forEach(cmd => {
	cmd.configureHelp({ showGlobalOptions: true })
	program.addCommand(cmd)
})

program.parse()