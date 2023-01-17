'use strict'

import { Command } from 'commander'

import scanCmd from './scan.js'
import packageJson from '../package.json' assert { type: 'json' }

const program = new Command()

program
	.name('Web3 Asset Monitor')
	.description('Application to keep track and analyze web3 assets.')
	.version(packageJson.version)
	.addCommand(scanCmd)
	.parse()