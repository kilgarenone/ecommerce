import { eventBus } from "../../core/event-bus.ts";
import { EventNames } from "../../events.ts";
import { handleOrderPlaced } from "./inventory.service.ts";

/**
 * Registers event listeners for inventory-related events.
 *
 */
export function registerInventoryListeners(): void {
    eventBus.subscribe(EventNames.ORDER_PLACED, handleOrderPlaced);
}
