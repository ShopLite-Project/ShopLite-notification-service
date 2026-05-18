import { Router } from "express";
import { z } from "zod";

import { notifications } from "../data/notifications";
import { Notification } from "../types/notification";

const createNotificationSchema = z.object({
  id: z.string().min(3),
  channel: z.enum(["email", "sms", "webhook"]),
  recipient: z.string().min(3),
  subject: z.string().min(3),
  message: z.string().min(5)
});

const dispatchNotificationSchema = z.object({
  id: z.string().min(3),
  channel: z.enum(["email", "sms", "webhook"]),
  recipient: z.string().min(3),
  subject: z.string().min(3),
  message: z.string().min(5),
  orderId: z.string().min(3)
});

export const notificationsRouter = Router();

notificationsRouter.get("/", (_request, response) => {
  response.status(200).json({
    count: notifications.length,
    items: notifications
  });
});

notificationsRouter.post("/", (request, response) => {
  const parsedPayload = createNotificationSchema.safeParse(request.body);

  if (!parsedPayload.success) {
    response.status(400).json({
      message: "Invalid notification payload",
      issues: parsedPayload.error.flatten()
    });
    return;
  }

  const newNotification: Notification = {
    ...parsedPayload.data,
    status: "queued",
    createdAt: new Date().toISOString()
  };

  notifications.push(newNotification);

  response.status(201).json(newNotification);
});

notificationsRouter.post("/dispatch", async (request, response) => {
  const parsedPayload = dispatchNotificationSchema.safeParse(request.body);

  if (!parsedPayload.success) {
    response.status(400).json({
      message: "Invalid dispatch payload",
      issues: parsedPayload.error.flatten()
    });
    return;
  }

  const dispatchedNotification: Notification = {
    ...parsedPayload.data,
    status: "sent",
    createdAt: new Date().toISOString()
  };

  notifications.push(dispatchedNotification);

  response.status(202).json(dispatchedNotification);
});
