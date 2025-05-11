import express, { type Application } from "express";
import fs from "fs/promises";
import assert from "node:assert/strict";
import { before, beforeEach, describe, it } from "node:test";
import path from "node:path";
import request from "supertest";
import { eventBus } from "../../../src/core/event-bus.ts";
import { readFile } from "../../../src/core/file-storage.ts";
import { EventNames, type EventPayloads } from "../../../src/events.ts";
import { registerInventoryListeners } from "../../../src/modules/inventory/inventory.listener.ts";
import type { Product } from "../../../src/modules/inventory/inventory.types.ts";
import { createOrder } from "../../../src/modules/order/order.controller.ts";
import { registerOrderListeners } from "../../../src/modules/order/order.listener.ts";
import {
    OrderStatus,
    type Order,
    type OrderPlaced,
} from "../../../src/modules/order/order.types.ts";

const app: Application = express();
app.use(express.json());
app.post("/orders", createOrder);

const DATA_DIR: string = path.join(
    process.cwd(),
    process.env.DATA_DIR || "data/test",
);
const ORDER_FILE_NAME = process.env.ORDERS_FILE_NAME || "orders.json";
const INVENTORY_FILE_NAME = process.env.INVENTORY_FILE_NAME || "inventory.json";

const initialInventory: Product[] = [
    {
        sku: "ITEM001",
        name: "Test Item 1",
        quantity: 10,
        price: 100,
        description: "Some item 1",
    },
    {
        sku: "ITEM002",
        name: "Test Item 2",
        quantity: 5,
        price: 50,
        description: "Some item 2",
    },
];

const ordersFilePath = path.join(DATA_DIR, ORDER_FILE_NAME);
const inventoryFilePath = path.join(DATA_DIR, INVENTORY_FILE_NAME);

async function initializeTestFiles() {
    await fs.mkdir(DATA_DIR, { recursive: true }); // Use the resolved data directory
    await fs.writeFile(ordersFilePath, JSON.stringify([]));
    await fs.writeFile(
        inventoryFilePath,
        JSON.stringify(initialInventory, null, 2),
    );
}

type EventName = (typeof EventNames)[keyof typeof EventNames];

function waitForEvent<E extends EventName>(
    eventName: E,
    timeout: number = 7000,
): Promise<EventPayloads[E]> {
    return new Promise<EventPayloads[E]>((resolve, reject) => {
        const timer = setTimeout(() => {
            eventBus.removeListener(eventName, listener);
            reject(
                new Error(
                    `Timeout waiting for event ${eventName} after ${timeout}ms`,
                ),
            );
        }, timeout);

        const listener = (payload: EventPayloads[E]) => {
            clearTimeout(timer);
            eventBus.removeListener(eventName, listener);
            resolve(payload);
        };

        eventBus.once(eventName, listener);
    });
}

describe("Placing Order", () => {
    before(() => {
        registerInventoryListeners();
        registerOrderListeners();
    });

    beforeEach(async () => {
        await initializeTestFiles();
    });

    it("should successfully create an order and process inventory for available items", async () => {
        const SKU_ITEM_1 = "ITEM001";
        const orderPayload: OrderPlaced = {
            customerId: "cust123",
            items: [
                { sku: SKU_ITEM_1, quantity: 2 },
                { sku: "ITEM002", quantity: 1 },
            ],
            paymentMethod: "VISA",
            paymentAmount: 250,
        };

        const [response, { order: processedOrder }] = await Promise.all([
            await request(app).post("/orders").send(orderPayload),
            waitForEvent(EventNames.ORDER_COMPLETED),
        ]);

        assert.strictEqual(
            response.statusCode,
            202,
            "HTTP status should be 202",
        );

        const orders = await readFile<Order[]>(ORDER_FILE_NAME);
        const orderInFile = orders.find((o) => o.id === response.body.data.id);

        assert.strictEqual(
            processedOrder.status,
            OrderStatus.PROCESSED,
            "Order status should be PROCESSED",
        );
        assert.ok(orderInFile, "Order should be in file");
        assert.strictEqual(
            orderInFile.status,
            OrderStatus.PROCESSED,
            "Order status in file incorrect",
        );

        const inventory = await readFile<Product[]>(INVENTORY_FILE_NAME);
        const item1After = inventory.find((p) => p.sku === SKU_ITEM_1);

        assert.strictEqual(
            item1After?.quantity,
            8,
            "ITEM001 quantity incorrect",
        );
    });
});
