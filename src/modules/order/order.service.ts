import { v4 as uuidv4 } from "uuid";
import { eventBus } from "../../core/event-bus.ts";
import { readFile, writeFile } from "../../core/file-storage.ts";
import { logger } from "../../core/logger.ts";
import { EventNames, type EventPayloads } from "../../events.ts";
import {
    OrderStatus,
    type IOrderStatus,
    type Order,
    type OrderPlaced,
} from "./order.types.ts";

const ORDERS_FILE_NAME = process.env.ORDERS_FILE_NAME;

/**
 * Places a new order by generating an unique ID, saving it to file storage,
 * and publishing an {@link EventNames.ORDER_PLACED} event.
 *
 * @param {OrderPlaced} order - The incoming order data.
 * @returns {Promise<Order>} The saved order with unique ID.
 * @throws {Error} If the order could not be saved.
 *
 */
export async function placeOrder(order: OrderPlaced): Promise<Order> {
    try {
        const newOrder: Order = {
            id: uuidv4(),
            customerId: order.customerId,
            items: order.items,
            status: OrderStatus.PENDING,
            paymentMethod: order.paymentMethod,
            paymentAmount: order.paymentAmount,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        const orders = await readFile<Order[]>(ORDERS_FILE_NAME);

        orders.push(newOrder);

        await writeFile(ORDERS_FILE_NAME, orders);

        logger.info(`[Order] Order placed successfully: ${newOrder.id}`);

        eventBus.publish(EventNames.ORDER_PLACED, { order: newOrder });

        return newOrder;
    } catch (error) {
        logger.error(`[Order] Failed to place order.`, error);

        throw new Error("We failed to place your order. Please try again.");
    }
}

/**
 * Handles the {@link EventNames.ORDER_PROCESSED} event
 * by updating the order status to `PROCESSED`.
 *
 * @param {EventPayloads[typeof EventNames.ORDER_PROCESSED]} payload - The event payload containing the order.
 *
 */
export async function handleOrderProcessed(
    payload: EventPayloads[typeof EventNames.ORDER_PROCESSED],
): Promise<void> {
    const { order } = payload;

    logger.info(
        `[Order] Received ${EventNames.ORDER_PROCESSED} event for Order ID: ${order.id}`,
    );

    await updateOrderStatus(order.id, OrderStatus.PROCESSED);
}

/**
 * Handles the {@link EventNames.ORDER_PROCESSING_FAILED} event
 * by updating the order status to `FAILED`.
 *
 * @param {EventPayloads[typeof EventNames.ORDER_PROCESSING_FAILED]} payload - The event payload containing the order.
 *
 */
export async function handleOrderProcessingFailed(
    payload: EventPayloads[typeof EventNames.ORDER_PROCESSING_FAILED],
): Promise<void> {
    const { order } = payload;

    logger.warn(
        `[Order] Received ${EventNames.ORDER_PROCESSING_FAILED} event for Order ID: ${order.id}.`,
    );

    await updateOrderStatus(order.id, OrderStatus.FAILED);
}

/**
 * Updates the status of a specific order and publishes {@link EventNames.ORDER_COMPLETED}.
 *
 * @param {string} orderId - The ID of the order to update.
 * @param {IOrderStatus} status - The new status to set.
 * @returns {Promise<Order | null>} The updated order or null if not found.
 *
 */
async function updateOrderStatus(
    orderId: string,
    status: IOrderStatus,
): Promise<Order | null> {
    const orders = await readFile<Order[]>(ORDERS_FILE_NAME);

    const order = orders.find((o) => o.id === orderId);

    if (!order) {
        logger.warn(`[Order] Order not found for status update: ${orderId}`);

        return null;
    }

    order.status = status;
    order.updatedAt = new Date().toISOString();
    orders[orders.findIndex((o) => o.id === orderId)] = order;

    await writeFile(ORDERS_FILE_NAME, orders);

    logger.info(`[Order] Order ${orderId} status updated to ${status}`);

    eventBus.publish(EventNames.ORDER_COMPLETED, { order });

    return order;
}
