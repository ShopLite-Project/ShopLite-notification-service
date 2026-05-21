import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3003),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  SERVICE_NAME: z.string().default("shoplite-notification-service"),
  ENABLE_KAFKA: z.coerce.boolean().default(false),
  KAFKA_BROKERS: z
    .string()
    .default("localhost:9092")
    .transform((value) => value.split(",").map((entry) => entry.trim()).filter(Boolean)),
  KAFKA_CLIENT_ID: z.string().default("shoplite-notification-service"),
  KAFKA_ORDER_EVENTS_TOPIC: z.string().default("shoplite.order-events"),
  KAFKA_INVENTORY_EVENTS_TOPIC: z.string().default("shoplite.inventory-events"),
  KAFKA_ORDER_CONSUMER_GROUP: z.string().default("shoplite-notification-service-orders"),
  KAFKA_INVENTORY_CONSUMER_GROUP: z.string().default("shoplite-notification-service-inventory")
});

export const env = envSchema.parse(process.env);
