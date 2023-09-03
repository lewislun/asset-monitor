import winston from 'winston'
import { TelegramTransport } from 'telegram-cli-bot'

/** @type {winston.Logger[]} */								const loggers = []
/** @type {import('telegram-cli-bot').TelegramCliBot} */	let telegramBot
/** @type {number[]} */										let telegramChatIds = []

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
	if (telegramBot) {
		logger.add(new TelegramTransport(telegramBot, telegramChatIds, { level: 'error' }))
	}
	loggers.push(logger)
	return logger
}

export function setLoggerTelegramBot(bot, chatIds) {
	telegramBot = bot
	telegramChatIds = chatIds
	loggers.forEach(logger => logger.add(new TelegramTransport(bot, chatIds, { transportOpts: { level: 'error' } })))
}

const logger = createLogger()
export default logger