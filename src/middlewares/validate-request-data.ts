import type { Request, Response, NextFunction } from "express";
import { ZodError, ZodType } from "zod";
import { BadRequestError } from "../errors/bad-request.ts";
import { logger } from "../core/logger.ts";

/**
 * Creates an Express middleware function that validates request body data against a Zod schema.
 * If validation fails, the middleware will throw a BadRequestError with formatted error messages.
 *
 * @template T - The type that the Zod schema validates to
 * @param {ZodType<T>} schema - The Zod schema to validate the request body against
 * @returns {(req: Request, res: Response, next: NextFunction) => Promise<void | Response>}
 *          An Express middleware function that performs validation on the request body
 *
 * @example
 * // Use the middleware in a route
 * router.post('/users', validateRequest(userSchema), createUserController);
 *
 * @throws {BadRequestError} When validation fails, throws a BadRequestError with formatted error messages
 */
export function validateRequest<T>(schema: ZodType<T>) {
    return async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void | Response> => {
        try {
            await schema.parseAsync(req.body);

            // If validation is successful, proceed to the next middleware
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                // Combine all validation error messages into a single string
                const errorMessage = error.errors
                    .map((error) => error.message)
                    .join("\n");

                const err = new BadRequestError(errorMessage);

                logger.error("Request data validation failed", err);

                // Throw the error to be caught by error handling middleware
                throw err;
            }

            // Handle any non-ZodError errors with a generic 500 response
            return res.status(500).json({ error: "Internal Server Error" });
        }
    };
}
