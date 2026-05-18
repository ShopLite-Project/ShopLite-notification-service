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
    expect(response.body.count).toBeGreaterThanOrEqual(1);
  });

  it("dispatches a notification and emits an event", async () => {
    const response = await request(app).post("/notifications/dispatch").send({
      id: "ntf-002",
      channel: "email",
      recipient: "shopper@example.com",
      subject: "Order received",
      message: "Your order has been received and is now being processed.",
      orderId: "ord-1002"
    });

    expect(response.status).toBe(202);
    expect(response.body.id).toBe("ntf-002");
    expect(response.body.status).toBe("sent");
  });
});
