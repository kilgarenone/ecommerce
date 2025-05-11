/**
 * Normalizes any error type into an Error object.
 *
 * @param {unknown} error - The value to normalize into an Error object
 * @returns {Error} A proper Error instance
 * @throws {Error} If JSON.stringify fails (rare), falls back to String(error)
 *
 */
export function normalizeError(error: unknown): Error {
    if (error instanceof Error) return error;

    try {
        return new Error(
            typeof error === "string"
                ? error
                : JSON.stringify(error, Object.getOwnPropertyNames(error)),
        );
    } catch {
        return new Error(String(error));
    }
}
