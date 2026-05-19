import request from "supertest";

import { app } from "../src/app";

describe("ShopLite notification service", () => {
  it("returns service health", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ok");
  });

  it("returns seeded notifications", async () => {
    const response = await request(app).get("/notifications");

    expect(response.status).toBe(200);
    expect(response.body.meta.count).toBeGreaterThanOrEqual(1);
  });

  it("queues an order event notification", async () => {
    const response = await request(app).post("/notifications/order-events").send({
      id: "ntf-002",
      orderId: "ord-1002",
      eventType: "order_created",
      channel: "email",
      customer: {
        customerId: "cus-1002",
        name: "Grace Hopper",
        email: "shopper@example.com"
      }
    });

    expect(response.status).toBe(202);
    expect(response.body.data.id).toBe("ntf-002");
    expect(response.body.data.status).toBe("queued");
    expect(response.body.data.sourceService).toBe("order-service");
  });

  it("dispatches a queued notification", async () => {
    const response = await request(app).post("/notifications/ntf-001/dispatch");

    expect(response.status).toBe(202);
    expect(response.body.data.id).toBe("ntf-001");
    expect(response.body.data.status).toBe("sent");
    expect(response.body.data.attempts).toBeGreaterThanOrEqual(1);
  });
});
