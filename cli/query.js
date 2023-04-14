import { Command } from 'commander'

import * as lib from '../lib/index.js'

const cmd = new Command('query')
const logger = lib.createLogger('CLI')

cmd
	.description('Commands for managing asset queries.')
	.addCommand(new Command('import')
		.argument('<configPath>', 'Query config file path.')
		.action(async (configPath) => {
			logger.info(`Importing query config from: ${configPath}...`)
			const queries = await lib.AssetQuery.importFromQueryConfig(configPath)
			logger.info(`Query config imported - count: ${queries.length}`)
			process.exit(0)
		})
	)

export default cmd
