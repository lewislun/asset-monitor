import { Command } from 'commander'
import readlineSync from 'readline-sync'

import * as lib from '../lib/index.js'

const cmd = new Command('user')
const logger = lib.createLogger('CLI')

cmd
	.addCommand(new Command('create')
		.argument('<username>', 'Username')
		.option('-r, --role <role>', 'User Role.', lib.UserRole.VIEWER)
		.action(async (username, { role }) => {
			while (true) {
				const password = readlineSync.question('Input password: ', { hideEchoBack: true })
				const confirmPassword = readlineSync.question('Confirm password: ', { hideEchoBack: true })
				if (password != confirmPassword) {
					logger.error('Password does not match.')
					continue
				}
				const user = await lib.User.create(username, password, { role })
				logger.info(`User created - userId: ${user.id}`)
				process.exit(0)
			}
		})
	)

export default cmd
