/**
 * Schemas for validating request data for routes.
 * Used as an argument to the `validateRequestData` middleware.
 *
 * @example
 * router.post("/", validateRequest(addProductBodySchema), addProduct);
 *
 */

import { z } from "zod";
import type { Product, QuantityChangeRequest } from "./inventory.types.ts";

export const addProductBodySchema: z.ZodType<Product> = z.object({
    sku: z.string({ message: ` Product's SKU must be a string` }),
    name: z.string({ message: `Product's name must be a string` }),
    description: z.string({
        message: `Product's description must be a string`,
    }),
    price: z.number({ message: `Product's price must be a number` }),
    quantity: z.number({ message: `Product's quantity must be a number` }),
});

export const updateProductQuantityBodySchema: z.ZodType<QuantityChangeRequest> =
    z.object({
        change: z.number({
            message: "The value of quantity change must be a number",
        }),
    });
