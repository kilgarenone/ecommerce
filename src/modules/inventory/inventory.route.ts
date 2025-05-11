import { Router } from "express";
import { validateRequest } from "../../middlewares/validate-request-data.ts";
import {
    addProductBodySchema,
    updateProductQuantityBodySchema,
} from "./inventory.schema.ts";
import { addProduct, updateProductQuantity } from "./inventory.controller.ts";

const router = Router();

/**
 * Adds a new product to the inventory.
 *
 */
router.post("/", validateRequest(addProductBodySchema), addProduct);

/**
 * Updates the quantity of an existing product.
 *
 */
router.patch(
    "/:id/quantity",
    validateRequest(updateProductQuantityBodySchema),
    updateProductQuantity,
);

export const inventoryRouter: Router = router;
