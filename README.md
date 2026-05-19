# ShopLite Notification Service

Notification orchestration microservice for the ShopLite demo platform.

This service accepts outbound notification requests and simulates dispatching order status updates across email, SMS, and webhook channels.

Its role in the platform is:
- receive order-related events from other services
- create customer-facing notifications from those events
- track whether a notification is queued or dispatched

Before Kafka is introduced, the intended integration is direct HTTP:
1. `order-service` creates or updates an order
2. `order-service` calls `notification-service` with an order event
3. `notification-service` creates a queued notification
4. a dispatch step marks the notification as sent

This keeps the service boundaries clear now, while staying easy to replace with Kafka consumers later.

## Endpoints

- `GET /health`
- `GET /notifications`
- `GET /notifications/:id`
- `POST /notifications`
- `POST /notifications/order-events`
- `POST /notifications/:id/dispatch`

## Local development

```bash
npm ci
npm run dev
```
