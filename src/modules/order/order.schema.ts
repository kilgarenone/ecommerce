/**
 * Schemas for validating request data for routes.
 * Used as an argument to the `validateRequestData` middleware.
 *
 * @example
 * router.post("/", validateRequest(orderPlacedBodySchema), createOrder);
 *
 */

import { z } from "zod";
import type { OrderPlaced } from "./order.types.ts";

export const orderPlacedBodySchema: z.ZodType<OrderPlaced> = z.object({
    customerId: z.string().min(1, "Customer ID is required"),
    items: z
        .array(
            z.object({
                sku: z.string().min(1, "SKU is required"),
                quantity: z
                    .number({ message: "Quantity value must be a number" })
                    .int()
                    .positive("Quantity must be more than zero"),
            }),
        )
        .min(1, "At least one item is required"),
    paymentMethod: z.enum(["VISA", "CASH"]),
    paymentAmount: z
        .number({ message: "Payment amount value must be a number" })
        .positive("Payment amount must be a positive number"),
});
