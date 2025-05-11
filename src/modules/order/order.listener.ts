import { eventBus } from "../../core/event-bus.ts";
import { EventNames } from "../../events.ts";
import {
    handleOrderProcessed,
    handleOrderProcessingFailed,
} from "./order.service.ts";

/**
 * Registers event listeners for order-related events.
 *
 */
export function registerOrderListeners(): void {
    eventBus.subscribe(EventNames.ORDER_PROCESSED, handleOrderProcessed);
    eventBus.subscribe(
        EventNames.ORDER_PROCESSING_FAILED,
        handleOrderProcessingFailed,
    );
}
