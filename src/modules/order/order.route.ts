import { Router } from "express";
import { validateRequest } from "../../middlewares/validate-request-data.ts";
import { orderPlacedBodySchema } from "./order.schema.ts";
import { createOrder } from "./order.controller.ts";

const router = Router();

/**
 * Creates a new order.
 *
 */
router.post("/", validateRequest(orderPlacedBodySchema), createOrder);

export const orderRouter: Router = router;
