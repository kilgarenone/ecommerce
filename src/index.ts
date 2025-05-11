/**
 * Main application entry point for E-commerce Express.js server
 *
 * This file initializes the Express application, registers routes and event listeners,
 * and starts the HTTP server.
 *
 */

import express, { type Application } from "express";
import { logger } from "./core/logger.ts";
import { customErrorHandler } from "./middlewares/custom-error-handler.ts";
import { registerInventoryListeners } from "./modules/inventory/inventory.listener.ts";
import { inventoryRouter } from "./modules/inventory/inventory.route.ts";
import { registerOrderListeners } from "./modules/order/order.listener.ts";
import { orderRouter } from "./modules/order/order.route.ts";

const app: Application = express();

const PORT = process.env.PORT;

app.use(express.json());

// Register route handlers
app.use("/api/products", inventoryRouter);
app.use("/api/orders", orderRouter);

// Register custom error handler as a middleware
app.use(customErrorHandler);

async function startApp(): Promise<void> {
    try {
        logger.info("🚀 Starting the E-commerce Application...");

        // Register event listeners
        registerInventoryListeners();
        registerOrderListeners();

        logger.info("Listeners registered successfully.");

        // Start HTTP server
        app.listen(PORT, (): void => {
            logger.info(`Server listening on port ${PORT}`);
        });
    } catch (error) {
        logger.error("Failed to initialize services or start server:", error);
        process.exit(1);
    }
}

startApp();
