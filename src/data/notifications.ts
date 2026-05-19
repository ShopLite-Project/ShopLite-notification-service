import { Notification } from "../types/notification";

export const notifications: Notification[] = [
  {
    id: "ntf-001",
    orderId: "ord-1001",
    eventType: "order_paid",
    sourceService: "order-service",
    channel: "email",
    recipient: {
      customerId: "cus-1001",
      name: "Ada Lovelace",
      address: "ada@example.com"
    },
    subject: "Payment confirmed for your ShopLite order",
    message: "Your payment has been confirmed and your order is now being prepared.",
    templateKey: "order-paid-email",
    status: "sent",
    attempts: 1,
    audit: {
      dispatchedAt: "2026-05-15T09:32:00.000Z",
      failedAt: null,
      cancelledAt: null
    },
    createdAt: "2026-05-15T09:30:00.000Z",
    updatedAt: "2026-05-15T09:32:00.000Z"
  }
];
