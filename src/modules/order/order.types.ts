import type { Request, Response } from "express";

export interface OrderItem {
    sku: string;
    quantity: number;
}

export const PaymentMethod = {
    VISA: "VISA",
    CASH: "CASH",
} as const;

type IPaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

export const OrderStatus = {
    PENDING: "PENDING",
    PROCESSING: "PROCESSING",
    PROCESSED: "PROCESSED",
    FAILED: "FAILED",
    CANCELLED: "CANCELLED",
} as const;

export type IOrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

export interface Order {
    id: string;
    customerId: string;
    items: OrderItem[];
    status: IOrderStatus;
    paymentMethod: IPaymentMethod;
    paymentAmount: number;
    createdAt: string;
    updatedAt: string;
}

export interface OrderPlaced {
    customerId: string;
    items: OrderItem[];
    paymentMethod: IPaymentMethod;
    paymentAmount: number;
}

export interface OrderPlacedResponse {
    success: boolean;
    message?: string;
    data?: Order;
    error?: string;
}

export type CreateOrderRequest = Request<
    Record<string, never>,
    OrderPlacedResponse,
    OrderPlaced
>;
export type CreateOrderResponse = Response<OrderPlacedResponse>;
