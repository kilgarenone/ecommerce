import { EventEmitter } from "events";
import { type EventPayloads } from "../events.ts";

/**
 * EventBus is a centralized event bus that wraps Node.js EventEmitter
 * to provide publish/subscribe functionality for application events.
 *
 */
class EventBus extends EventEmitter {
    constructor() {
        super();
    }

    /**
     * Publishes an event with the specified payload.
     *
     * @template K - The event name type (key of EventPayloads)
     * @param {K} eventName - The name of the event to publish
     * @param {EventPayloads[K]} payload - The payload data for the event
     * @returns {boolean} - Returns true if the event had listeners, false otherwise
     */
    publish<K extends keyof EventPayloads>(
        eventName: K,
        payload: EventPayloads[K],
    ): boolean {
        return this.emit(eventName, payload);
    }

    /**
     * Subscribes to an event with a callback function that will be executed when the event is published.
     *
     * @template K - The event name type (key of EventPayloads)
     * @param {K} eventName - The name of the event to subscribe to
     * @param {(payload: EventPayloads[K]) => void} listener - The callback function that will receive the event payload
     * @returns {EventEmitter} - Returns this instance for method chaining
     */
    subscribe<K extends keyof EventPayloads>(
        eventName: K,
        listener: (payload: EventPayloads[K]) => void,
    ): EventEmitter {
        return this.on(eventName, listener);
    }
}

/**
 * Singleton instance of the EventBus class.
 * Use this exported instance throughout the application for consistent event handling.
 */
export const eventBus: EventBus = new EventBus();
