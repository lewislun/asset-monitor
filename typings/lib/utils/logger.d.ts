/**
 * @param {string} level
 */
export function setLogLevel(level: string): void;
/**
 * @param {string} [moduleName=default]
 * @returns {winston.Logger}
 */
export function createLogger(moduleName?: string): winston.Logger;
export default logger;
declare const logger: winston.Logger;
