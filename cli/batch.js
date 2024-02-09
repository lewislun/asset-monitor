import { Command } from 'commander'

import * as lib from '../lib/index.js'

const cmd = new Command('batch')
const logger = lib.createLogger('CLI')

cmd
	.description('Asset batch management.')
	.addCommand(new Command('remove')
		.argument('<id>', 'id of the batch')
		.action(async id => {
			logger.info(`Removing an AssetSnapshotBatch with id: ${id}...`)
			const affectedRowCount = await lib.AssetSnapshotBatch.query().findById(id).delete()
			if (affectedRowCount === 0) {
				logger.error(`AssetSnapshotBatch not found - id: ${id}`)
				process.exit(1)
			}

			logger.info(`AssetSnapshotBatch deleted - id: ${id}`)
			process.exit(0)
		})
	)

export default cmd
