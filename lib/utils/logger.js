import winston from 'winston'

/** @type {winston.Logger[]} */
const loggers = []

/**
 * @param {string} level
 */
export function setLogLevel(level) {
	loggers.forEach(logger => logger.level = level)
}

/**
 * @param {string} [moduleName=default]
 * @returns {winston.Logger}
 */
export function createLogger(moduleName = 'default') {
	const logger = winston.createLogger({
		transports: [
			new winston.transports.Console(),
		],
		format: winston.format.combine(
			winston.format.colorize(),
			winston.format.timestamp(),
			winston.format.printf(({ level, timestamp, message }) => `[${level}] ${timestamp} - ${moduleName}: ${message}`),
		),
	})
	loggers.push(logger)
	return logger
}

const logger = createLogger()
export default logger