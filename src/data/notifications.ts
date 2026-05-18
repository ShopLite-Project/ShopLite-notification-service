import { Notification } from "../types/notification";

export const notifications: Notification[] = [
  {
    id: "ntf-001",
    channel: "email",
    recipient: "ada@example.com",
    subject: "Order shipped",
    message: "Your ShopLite order is on the way.",
    status: "sent",
    createdAt: "2026-05-15T09:30:00.000Z"
  }
];
