export type NotificationEventType =
  | "order_created"
  | "order_confirmed"
  | "order_paid"
  | "order_fulfilled"
  | "order_cancelled"
  | "inventory_reservation_failed";

export interface OrderEvent {
  eventId: string;
  eventType:
    | "order_created"
    | "inventory_reservation_requested"
    | "order_confirmed"
    | "order_paid"
    | "order_fulfilled"
    | "order_cancelled";
  orderId: string;
  sourceService: "order-service";
  occurredAt: string;
  order: {
    id: string;
    customer: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
    };
  };
}

export interface InventoryEvent {
  eventId: string;
  eventType: "inventory_reserved" | "inventory_reservation_failed" | "inventory_released";
  orderId: string;
  sourceService: "inventory-service";
  occurredAt: string;
  reservationReference: string | null;
  message: string;
}
