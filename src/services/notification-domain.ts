import { notifications } from "../data/notifications";
import { Notification } from "../types/notification";
import { NotificationEventType } from "../types/events";

export function getOrderEventContent(eventType: NotificationEventType) {
  switch (eventType) {
    case "order_created":
      return {
        subject: "Your ShopLite order has been received",
        templateKey: "order-created-email",
        message: (customerName: string, orderId: string) =>
          `Hi ${customerName}, your order ${orderId} has been received and is awaiting confirmation.`
      };
    case "order_confirmed":
      return {
        subject: "Your ShopLite order has been confirmed",
        templateKey: "order-confirmed-email",
        message: (customerName: string, orderId: string) =>
          `Hi ${customerName}, your order ${orderId} has been confirmed and stock has been reserved.`
      };
    case "order_paid":
      return {
        subject: "Payment confirmed for your ShopLite order",
        templateKey: "order-paid-email",
        message: (customerName: string, orderId: string) =>
          `Hi ${customerName}, payment for order ${orderId} has been confirmed.`
      };
    case "order_fulfilled":
      return {
        subject: "Your ShopLite order is fulfilled",
        templateKey: "order-fulfilled-email",
        message: (customerName: string, orderId: string) =>
          `Hi ${customerName}, your order ${orderId} has been fulfilled and is ready for delivery.`
      };
    case "order_cancelled":
      return {
        subject: "Your ShopLite order was cancelled",
        templateKey: "order-cancelled-email",
        message: (customerName: string, orderId: string) =>
          `Hi ${customerName}, your order ${orderId} has been cancelled.`
      };
    case "inventory_reservation_failed":
      return {
        subject: "There is an issue with your ShopLite order",
        templateKey: "inventory-reservation-failed-email",
        message: (customerName: string, orderId: string) =>
          `Hi ${customerName}, we could not reserve stock for order ${orderId}. Our team will follow up shortly.`
      };
  }
}

export function queueOrderEventNotification(input: {
  id: string;
  orderId: string;
  eventType: NotificationEventType;
  customerId: string | null;
  customerName: string;
  address: string;
  channel: "email" | "sms" | "webhook";
  sourceService: "order-service" | "inventory-service";
}) {
  const duplicateNotification = notifications.find((item) => item.id === input.id);

  if (duplicateNotification) {
    return duplicateNotification;
  }

  const timestamp = new Date().toISOString();
  const eventContent = getOrderEventContent(input.eventType);
  const newNotification: Notification = {
    id: input.id,
    orderId: input.orderId,
    eventType: input.eventType,
    sourceService: input.sourceService,
    channel: input.channel,
    recipient: {
      customerId: input.customerId,
      name: input.customerName,
      address: input.address
    },
    subject: eventContent.subject,
    message: eventContent.message(input.customerName, input.orderId),
    templateKey: eventContent.templateKey,
    status: "queued",
    attempts: 0,
    audit: {
      dispatchedAt: null,
      failedAt: null,
      cancelledAt: null
    },
    createdAt: timestamp,
    updatedAt: timestamp
  };

  notifications.push(newNotification);
  return newNotification;
}
