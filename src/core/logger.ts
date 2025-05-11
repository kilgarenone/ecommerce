import { normalizeError } from "../utils/normalize-error.ts";

type LogLevel = "info" | "warn" | "error" | "debug";

interface LogEntry {
    timestamp: string;
    level: string;
    message: string;
}

/**
 * Core logging function that handles formatting and console output
 *
 * @param {LogLevel} level - The severity level of the log
 * @param {string} message - The message to be logged
 * @param {unknown} [error] - Optional error object to be included in the log
 * @returns {void} This function doesn't return anything
 * @private
 */
const logMessage = (
    level: LogLevel,
    message: string,
    error?: unknown,
): void => {
    const timestamp = new Date().toISOString();
    const logEntry: LogEntry = {
        timestamp,
        level: level.toUpperCase(),
        message,
    };

    // Format as JSON string with proper indentation for readability
    const formattedLog = JSON.stringify(logEntry, null, 2);

    const normalizedError = error ? normalizeError(error) : null;

    switch (level) {
        case "info":
            console.info(formattedLog);
            break;
        case "warn":
            console.warn(formattedLog);
            break;
        case "error":
            console.error(formattedLog, normalizedError || "");
            break;
        default:
            // Fallback to standard log for unexpected levels
            console.log(formattedLog);
    }
};

/**
 * Logger utility for consistent application logging
 *
 */
export const logger = {
    info: (message: string): void => logMessage("info", message),
    warn: (message: string): void => logMessage("warn", message),
    error: (message: string, error?: unknown): void =>
        logMessage("error", message, error),
};
