import type { CreateOrderRequest, CreateOrderResponse } from "./order.types.ts";
import { placeOrder } from "./order.service.ts";

/**
 * Handles order creation requests.
 *
 * @param {CreateOrderRequest} req - Express request object with order details in `req.body`.
 * @param {CreateOrderResponse} res - Express response object for sending the HTTP response.
 * @returns {Promise<CreateOrderResponse>} The HTTP response with status 202 and order confirmation.
 *
 */
export async function createOrder(
    req: CreateOrderRequest,
    res: CreateOrderResponse,
): Promise<CreateOrderResponse> {
    const newOrder = await placeOrder(req.body);

    // Respond with 202 Accepted because processing happens asynchronously via events
    return res.status(202).json({
        success: true,
        message: "Order received and is being processed.",
        data: newOrder,
    });
}
