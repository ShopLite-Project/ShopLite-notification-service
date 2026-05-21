import { Router } from "express";
import { z } from "zod";

import { notifications } from "../data/notifications";
import { Notification } from "../types/notification";
import { getOrderEventContent, queueOrderEventNotification } from "../services/notification-domain";

const createNotificationSchema = z.object({
  id: z.string().min(3),
  orderId: z.string().min(3),
  eventType: z.enum([
    "order_created",
    "order_confirmed",
    "order_paid",
    "order_fulfilled",
    "order_cancelled",
    "inventory_reservation_failed"
  ]),
  sourceService: z.enum(["order-service", "inventory-service", "system"]),
  channel: z.enum(["email", "sms", "webhook"]),
  recipient: z.object({
    customerId: z.string().min(3).nullable(),
    name: z.string().min(2),
    address: z.string().min(3)
  }),
  subject: z.string().min(3),
  message: z.string().min(5),
  templateKey: z.string().min(3)
});

const queueOrderEventSchema = z.object({
  id: z.string().min(3),
  orderId: z.string().min(3)
  ,
  eventType: z.enum([
    "order_created",
    "order_confirmed",
    "order_paid",
    "order_fulfilled",
    "order_cancelled",
    "inventory_reservation_failed"
  ]),
  channel: z.enum(["email", "sms", "webhook"]).default("email"),
  customer: z.object({
    customerId: z.string().min(3).nullable(),
    name: z.string().min(2),
    email: z.string().email()
  })
});

export const notificationsRouter = Router();

notificationsRouter.get("/", (request, response) => {
  const channel = request.query.channel;
  const status = request.query.status;
  const orderId = request.query.orderId;
  const eventType = request.query.eventType;

  const filteredNotifications = notifications.filter((notification) => {
    if (typeof channel === "string" && notification.channel !== channel) {
      return false;
    }

    if (typeof status === "string" && notification.status !== status) {
      return false;
    }

    if (typeof orderId === "string" && notification.orderId !== orderId) {
      return false;
    }

    if (typeof eventType === "string" && notification.eventType !== eventType) {
      return false;
    }

    return true;
  });

  response.status(200).json({
    data: filteredNotifications,
    meta: {
      count: filteredNotifications.length
    }
  });
});

notificationsRouter.get("/:id", (request, response) => {
  const notification = notifications.find((item) => item.id === request.params.id);

  if (!notification) {
    response.status(404).json({
      error: "Notification not found"
    });
    return;
  }

  response.status(200).json({
    data: notification
  });
});

notificationsRouter.post("/", (request, response) => {
  const parsedPayload = createNotificationSchema.safeParse(request.body);

  if (!parsedPayload.success) {
    response.status(400).json({
      error: "Invalid notification payload",
      issues: parsedPayload.error.flatten()
    });
    return;
  }

  const duplicateNotification = notifications.find((item) => item.id === parsedPayload.data.id);

  if (duplicateNotification) {
    response.status(409).json({
      error: `Notification with id '${parsedPayload.data.id}' already exists`
    });
    return;
  }

  const timestamp = new Date().toISOString();
  const newNotification: Notification = {
    ...parsedPayload.data,
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

  response.status(201).json({
    data: newNotification
  });
});

notificationsRouter.post("/order-events", (request, response) => {
  const parsedPayload = queueOrderEventSchema.safeParse(request.body);

  if (!parsedPayload.success) {
    response.status(400).json({
      error: "Invalid order event payload",
      issues: parsedPayload.error.flatten()
    });
    return;
  }

  const duplicateNotification = notifications.find((item) => item.id === parsedPayload.data.id);

  if (duplicateNotification) {
    response.status(409).json({
      error: `Notification with id '${parsedPayload.data.id}' already exists`
    });
    return;
  }

  const newNotification = queueOrderEventNotification({
    id: parsedPayload.data.id,
    orderId: parsedPayload.data.orderId,
    eventType: parsedPayload.data.eventType,
    customerId: parsedPayload.data.customer.customerId,
    customerName: parsedPayload.data.customer.name,
    address: parsedPayload.data.customer.email,
    channel: parsedPayload.data.channel,
    sourceService: "order-service"
  });

  response.status(202).json({
    data: newNotification
  });
});

notificationsRouter.post("/:id/dispatch", (request, response) => {
  const notification = notifications.find((item) => item.id === request.params.id);

  if (!notification) {
    response.status(404).json({
      error: "Notification not found"
    });
    return;
  }

  if (notification.status === "cancelled") {
    response.status(409).json({
      error: "Cancelled notifications cannot be dispatched"
    });
    return;
  }

  const timestamp = new Date().toISOString();
  notification.status = "sent";
  notification.attempts += 1;
  notification.audit.dispatchedAt = timestamp;
  notification.updatedAt = timestamp;

  response.status(202).json({
    data: notification
  });
});
