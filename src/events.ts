import type { Product } from "./modules/inventory/inventory.types.ts";
import type { Order } from "./modules/order/order.types.ts";

/**
 * Defines the set of event names used throughout the application's event system.
 *
 * @remarks
 * These event names follow a consistent naming pattern of `domain:action` to
 * maintain clear categorization and improve code readability.
 *
 */
export const EventNames = {
    /** Emitted when a new product is added to the inventory */
    PRODUCT_ADDED: "product:added",
    /** Emitted when an existing product's details are modified */
    PRODUCT_UPDATED: "product:updated",
    /** Emitted when a customer places a new order */
    ORDER_PLACED: "order:placed",
    /** Emitted when order processing encounters a failure or exception */
    ORDER_PROCESSING_FAILED: "order:processing_failed",
    /** Emitted when an order has been successfully processed */
    ORDER_PROCESSED: "order:processed",
    /** Emitted when an order has been fully fulfilled and completed */
    ORDER_COMPLETED: "order:completed",
} as const;

/**
 * Maps each event name to its corresponding payload structure.
 * Provides type safety for the event system by ensuring that event handlers
 * receive correctly typed payloads for each specific event.
 *
 */
export interface EventPayloads {
    [EventNames.PRODUCT_ADDED]: { product: Product };
    [EventNames.PRODUCT_UPDATED]: { product: Product };
    [EventNames.ORDER_PLACED]: { order: Order };
    [EventNames.ORDER_PROCESSED]: { order: Order };
    [EventNames.ORDER_COMPLETED]: { order: Order };
    [EventNames.ORDER_PROCESSING_FAILED]: {
        order: Order;
    };
}
