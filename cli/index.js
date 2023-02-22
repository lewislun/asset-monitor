'use strict'

import { Command } from 'commander'
import { Model } from 'objection'

import * as lib from '../lib/index.js'
import { knex } from '../db/index.js'
import scanCmd from './scan.js'
import monitorCmd from './monitor.js'
import flowCmd from './flow.js'
import groupCmd from './group.js'
import userCmd from './user.js'
import packageJson from '../package.json' assert { type: 'json' }

Model.knex(knex)
const program = new Command()
const cmds = [scanCmd, monitorCmd, flowCmd, groupCmd, userCmd]

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