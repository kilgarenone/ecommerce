import { normalizeError } from "../utils/normalize-error.ts";

/**
 * Represents an HTTP 400 Bad Request error.
 * This class is used when a client sends a request that cannot be processed
 * due to client-side errors (e.g., invalid parameters, malformed request).
 *
 */
export class BadRequestError extends Error {
    public readonly status = 400;

    constructor(error: unknown) {
        // Normalize the provided error to ensure consistent error handling
        const normalizedError = normalizeError(error);

        super(normalizedError.message);

        // Set the appropriate error name for identification
        this.name = "BadRequestError";

        // Preserve stack trace for debugging purposes
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, BadRequestError);
        }
    }
}
