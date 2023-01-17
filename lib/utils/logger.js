'use strict'

import winston from 'winston'

/**
 * @param {string} [moduleName=default]
 * @returns {winston.Logger}
 */
function createLogger(moduleName = 'default') {
	return winston.createLogger({
		level: 'debug',
		transports: [
			new winston.transports.Console(),
		],
		format: winston.format.combine(
			winston.format.colorize(),
			winston.format.timestamp(),
			winston.format.printf(({ level, timestamp, message }) => `[${level}] ${timestamp} - ${moduleName}: ${message}`),
		),
	})
}

const logger = createLogger()

export default logger
export { logger, createLogger }