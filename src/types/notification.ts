export type NotificationChannel = "email" | "sms" | "webhook";

export type NotificationStatus = "queued" | "sent" | "failed" | "cancelled";

export type NotificationEventType =
  | "order_created"
  | "order_confirmed"
  | "order_paid"
  | "order_fulfilled"
  | "order_cancelled"
  | "inventory_reservation_failed";

export type NotificationSourceService = "order-service" | "inventory-service" | "system";

export interface NotificationRecipient {
  customerId: string | null;
  name: string;
  address: string;
}

export interface NotificationAudit {
  dispatchedAt: string | null;
  failedAt: string | null;
  cancelledAt: string | null;
}

export interface Notification {
  id: string;
  orderId: string;
  eventType: NotificationEventType;
  sourceService: NotificationSourceService;
  channel: NotificationChannel;
  recipient: NotificationRecipient;
  subject: string;
  message: string;
  templateKey: string;
  status: NotificationStatus;
  attempts: number;
  audit: NotificationAudit;
  createdAt: string;
  updatedAt: string;
}
