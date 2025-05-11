import { readFile, writeFile } from "../../core/file-storage.ts";
import { logger } from "../../core/logger.ts";
import { eventBus } from "../../core/event-bus.ts";
import { EventNames, type EventPayloads } from "../../events.ts";

import type { Product } from "./inventory.types.ts";
import { normalizeError } from "../../utils/normalize-error.ts";
import { BadRequestError } from "../../errors/bad-request.ts";

const INVENTORY_FILE_NAME = process.env.INVENTORY_FILE_NAME;
const INVENTORY_LOCKS_FILE_NAME = process.env.INVENTORY_LOCKS_FILE_NAME;

/**
 * Loads the full inventory from storage.
 *
 * @returns {Promise<Product[]>} List of products.
 *
 */
export async function loadInventory(): Promise<Product[]> {
    try {
        const products = await readFile<Product[]>(INVENTORY_FILE_NAME);

        logger.info(
            `[Inventory] Inventory loaded successfully. ${products.length} products.`,
        );

        return products;
    } catch (error) {
        logger.error(
            `[Inventory] Failed to load inventory from ${INVENTORY_FILE_NAME}`,
            error,
        );

        throw error;
    }
}

/**
 * Adds a new product to the inventory
 *
 * @param {Product} productData - The product to add.
 * @returns {Promise<Product>} The added product.
 *
 */
export async function addProductToInventory(
    productData: Product,
): Promise<Product> {
    const products = await loadInventory();

    if (products.some((p) => p.sku === productData.sku)) {
        throw new BadRequestError(
            `Product with SKU ${productData.sku} already exists.`,
        );
    }

    products.push(productData);

    await writeFile(INVENTORY_FILE_NAME, products);

    logger.info(
        `[Inventory] Product added: ${productData.name} (ID: ${productData.sku})`,
    );

    eventBus.publish(EventNames.PRODUCT_ADDED, {
        product: productData,
    });

    return productData;
}

/**
 * Updates the quantity of a product by a given change amount.
 *
 * @param {string} sku - The SKU of the product.
 * @param {number} change - The quantity change (positive or negative).
 * @returns {Promise<Product>} The updated product.
 *
 */
export async function updateQuantity(
    sku: string,
    change: number,
): Promise<Product> {
    const products = await loadInventory();

    const product = products.find((p) => p.sku === sku);

    if (!product) {
        logger.warn(
            `[Inventory] Product not found for quantity update: ${sku}`,
        );

        throw new BadRequestError(
            `Product not found for quantity update: ${sku})`,
        );
    }

    const newQuantity = product.quantity + change;

    if (newQuantity < 0) {
        logger.error(
            `[Inventory] Insufficient stock for product ${sku}. Requested change: ${change}, Available: ${product.quantity}`,
        );

        throw new BadRequestError(
            `Insufficient stock for product ${product.name} (ID: ${sku})`,
        );
    }

    product.quantity = newQuantity;

    const productIndex = products.findIndex((p) => p.sku === sku);

    products[productIndex] = product;

    await writeFile(INVENTORY_FILE_NAME, products);

    logger.info(
        `[Inventory] Quantity updated for product ${sku}. New quantity: ${newQuantity}`,
    );

    eventBus.publish(EventNames.PRODUCT_UPDATED, {
        product,
    });

    return product;
}

/**
 * Gets a product by its SKU.
 *
 * @param {string} sku - The SKU of the product.
 * @returns {Promise<Product | undefined>} The matched product or undefined.
 *
 */
export async function getProductById(
    sku: string,
): Promise<Product | undefined> {
    const products = await loadInventory();

    return products.find((p) => p.sku === sku);
}

/**
 * Releases a quantity of inventory lock for a specific SKU.
 *
 * @param {string} sku - The SKU of the product.
 * @param {number} quantity - Quantity to release.
 * @returns {Promise<void>}
 *
 */
export async function releaseInventoryLock(
    sku: string,
    quantity: number,
): Promise<void> {
    const lockKey = `inventory_lock:${sku}`;

    try {
        const currentLockValue = await readFile<
            Record<string, { lockedQuantity: number }>
        >(INVENTORY_LOCKS_FILE_NAME);

        if (currentLockValue[lockKey]) {
            currentLockValue[lockKey].lockedQuantity -= quantity;
        }

        await writeFile(INVENTORY_LOCKS_FILE_NAME, currentLockValue);

        logger.info(`Released inventory lock for product ${sku}`);
    } catch (error) {
        logger.error(
            `Failed to release inventory lock for product ${sku}`,
            error,
        );

        throw error;
    }
}

/**
 * Attempts to lock a quantity of inventory for a specific SKU.
 *
 * @param {string} sku - The SKU of the product.
 * @param {number} quantity - Quantity to lock.
 * @returns {Promise<boolean>} True if lock succeeded, false otherwise.
 *
 */
export async function lockInventory(
    sku: string,
    quantity: number,
): Promise<boolean> {
    const lockKey = `inventory_lock:${sku}`;
    let lockedQuantity = 0;

    try {
        const product = await getProductById(sku);

        if (!product) {
            logger.warn(
                `[Inventory] Cannot lock inventory: Product not found: ${sku}`,
            );

            return false;
        }

        const currentLockValue = await readFile<
            Record<string, { lockedQuantity: number }>
        >(INVENTORY_LOCKS_FILE_NAME);

        if (currentLockValue[lockKey]) {
            lockedQuantity = currentLockValue[lockKey].lockedQuantity;
            currentLockValue[lockKey].lockedQuantity += quantity;
        } else {
            currentLockValue[lockKey] = { lockedQuantity: quantity };
        }

        const availableQuantity = product.quantity - lockedQuantity;

        if (availableQuantity < quantity) {
            logger.warn(
                `[Inventory] Insufficient available inventory for product ${sku}. Requested: ${quantity}, Available: ${availableQuantity}`,
            );

            return false;
        }

        await writeFile(INVENTORY_LOCKS_FILE_NAME, currentLockValue);

        logger.info(`Locked ${quantity} units of product ${sku}`);

        return true;
    } catch (error) {
        logger.error(
            `[Inventory] Failed to lock inventory for product ${sku}`,
            error,
        );

        throw error;
    }
}

/**
 *
 * Handles order placement by locking inventory, updating stock, and finally publishing order:processed event
 *
 * @param {EventPayloads[typeof EventNames.ORDER_PLACED]} payload - Event payload containing the order.
 * @returns {Promise<void>}
 *
 */
export async function handleOrderPlaced(
    payload: EventPayloads[typeof EventNames.ORDER_PLACED],
): Promise<void> {
    const { order } = payload;

    logger.info(
        `[Inventory] Received ${EventNames.ORDER_PLACED} event for Order ID: ${order.id}`,
    );

    const unavailableItems = [];
    const lockedItems = [];

    for (const item of order.items) {
        const locked = await lockInventory(item.sku, item.quantity);

        if (!locked) {
            unavailableItems.push(item);
        } else {
            lockedItems.push(item);
        }
    }

    if (unavailableItems.length > 0) {
        // Release all acquired locks
        await Promise.all(
            lockedItems.map((item) =>
                releaseInventoryLock(item.sku, item.quantity),
            ),
        );

        eventBus.publish(EventNames.ORDER_PROCESSING_FAILED, {
            order,
        });

        return;
    }

    try {
        for (const item of lockedItems) {
            await updateQuantity(item.sku, -item.quantity);
        }

        eventBus.publish(EventNames.ORDER_PROCESSED, {
            order,
        });

        logger.info(
            `[Inventory] Successfully processed inventory updates for Order ${order.id}`,
        );
    } catch (error) {
        const err = normalizeError(error);

        logger.error(`[Inventory] Failed to process order ${order.id}`, err);

        eventBus.publish(EventNames.ORDER_PROCESSING_FAILED, {
            order,
        });
    } finally {
        await Promise.all(
            lockedItems.map((item) =>
                releaseInventoryLock(item.sku, item.quantity),
            ),
        );
    }
}
