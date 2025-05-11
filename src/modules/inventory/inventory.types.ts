import type { Request, Response } from "express";

export interface Product {
    sku: string;
    name: string;
    description: string;
    price: number;
    quantity: number;
}

export interface AddProductResponsePayload {
    success: boolean;
    data?: Product;
    errorMessage?: string;
}

export interface QuantityChangeRequest {
    change: number;
}

export type UpdateProductQuantityParams = Record<"id", string>;

export interface QuantityChangeResponse {
    success: boolean;
    data?: Product;
    error?: string;
}

export type AddProductRequest = Request<
    Record<string, never>,
    AddProductResponsePayload,
    Product
>;
export type AddProductResponse = Response<AddProductResponsePayload>;

export type UpdateProductQuantityRequest = Request<
    UpdateProductQuantityParams,
    QuantityChangeResponse,
    QuantityChangeRequest
>;
export type UpdateProductQuantityResponse = Response<QuantityChangeResponse>;
