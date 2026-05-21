import { Consumer, Kafka } from "kafkajs";

import { env } from "../config/env";
import { queueOrderEventNotification } from "./notification-domain";
import { InventoryEvent, OrderEvent } from "../types/events";

let kafka: Kafka | null = null;
let orderConsumer: Consumer | null = null;
let inventoryConsumer: Consumer | null = null;

function kafkaEnabled() {
  return env.ENABLE_KAFKA && env.NODE_ENV !== "test";
}

function getKafka() {
  if (!kafka) {
    kafka = new Kafka({
      clientId: env.KAFKA_CLIENT_ID,
      brokers: env.KAFKA_BROKERS
    });
  }

  return kafka;
}

export async function startKafkaConsumers() {
  if (!kafkaEnabled()) {
    return;
  }

  if (!orderConsumer) {
    orderConsumer = getKafka().consumer({
      groupId: env.KAFKA_ORDER_CONSUMER_GROUP
    });

    await orderConsumer.connect();
    await orderConsumer.subscribe({
      topic: env.KAFKA_ORDER_EVENTS_TOPIC,
      fromBeginning: false
    });

    await orderConsumer.run({
      eachMessage: async ({ message }) => {
        if (!message.value) {
          return;
        }

        const event = JSON.parse(message.value.toString()) as OrderEvent;

        if (event.eventType === "inventory_reservation_requested") {
          return;
        }

        queueOrderEventNotification({
          id: `kafka-${event.eventId}`,
          orderId: event.orderId,
          eventType: event.eventType,
          customerId: event.order.customer.id,
          customerName: `${event.order.customer.firstName} ${event.order.customer.lastName}`,
          address: event.order.customer.email,
          channel: "email",
          sourceService: "order-service"
        });
      }
    });
  }

  if (!inventoryConsumer) {
    inventoryConsumer = getKafka().consumer({
      groupId: env.KAFKA_INVENTORY_CONSUMER_GROUP
    });

    await inventoryConsumer.connect();
    await inventoryConsumer.subscribe({
      topic: env.KAFKA_INVENTORY_EVENTS_TOPIC,
      fromBeginning: false
    });

    await inventoryConsumer.run({
      eachMessage: async ({ message }) => {
        if (!message.value) {
          return;
        }

        const event = JSON.parse(message.value.toString()) as InventoryEvent;

        if (event.eventType !== "inventory_reservation_failed") {
          return;
        }

        queueOrderEventNotification({
          id: `kafka-${event.eventId}`,
          orderId: event.orderId,
          eventType: "inventory_reservation_failed",
          customerId: null,
          customerName: "ShopLite customer",
          address: "unknown@example.com",
          channel: "email",
          sourceService: "inventory-service"
        });
      }
    });
  }
}

export async function stopKafka() {
  await orderConsumer?.disconnect().catch(() => undefined);
  await inventoryConsumer?.disconnect().catch(() => undefined);
  orderConsumer = null;
  inventoryConsumer = null;
  kafka = null;
}
