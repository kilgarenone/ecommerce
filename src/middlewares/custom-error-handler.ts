import type { NextFunction, Request, Response } from "express";

/**
 * Interface extending the native Error object with an optional status code property.
 * This allows for custom HTTP status codes to be attached to error objects.
 *
 */
interface CustomError extends Error {
    status?: number;
}

/**
 * Interface defining the structure of the error response sent to clients.
 *
 */
interface CustomErrorHandlerResponse {
    success: boolean;
    errorMessage: string;
}

/**
 * Express middleware for centralized error handling across the application.
 * This middleware captures errors thrown in routes or other middleware functions
 * and returns a standardized error response to the client.
 *
 * @param {CustomError} error - The error object caught by Express
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function (required by Express even if unused)
 * @returns {Response<CustomErrorHandlerResponse>} JSON response with error details
 *
 */
export function customErrorHandler(
    error: CustomError,
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    next: NextFunction,
): Response<CustomErrorHandlerResponse> {
    return res.status(error.status || 500).json({
        success: false,
        errorMessage: error.message || "An unexpected error occurred.",
    });
}
