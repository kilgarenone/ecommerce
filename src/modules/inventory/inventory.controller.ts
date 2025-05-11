import type {
    AddProductRequest,
    AddProductResponse,
    UpdateProductQuantityRequest,
    UpdateProductQuantityResponse,
} from "./inventory.types.ts";
import { addProductToInventory, updateQuantity } from "./inventory.service.ts";

/**
 * Adds a new product to the inventory
 *
 * @param {AddProductRequest} req - Express request object containing the product details
 * @param {AddProductResponse} res - Express response object
 * @returns {Promise<AddProductResponse>} A promise that resolves to the response with the created product
 * @throws {Error} Throws an error if product creation fails
 *
 */
export async function addProduct(
    req: AddProductRequest,
    res: AddProductResponse,
): Promise<AddProductResponse> {
    const newProduct = await addProductToInventory(req.body);

    return res.status(201).json({ success: true, data: newProduct });
}

/**
 * Updates the quantity of an existing product in the inventory
 *
 * @param {UpdateProductQuantityRequest} req - Express request object with product ID and quantity change
 * @param {UpdateProductQuantityResponse} res - Express response object
 * @returns {Promise<UpdateProductQuantityResponse>} A promise that resolves to the response with the updated product
 * @throws {Error} Throws an error if the product doesn't exist or update fails
 *
 */
export async function updateProductQuantity(
    req: UpdateProductQuantityRequest,
    res: UpdateProductQuantityResponse,
): Promise<UpdateProductQuantityResponse> {
    const updatedProduct = await updateQuantity(req.params.id, req.body.change);

    return res.status(200).json({ success: true, data: updatedProduct });
}
