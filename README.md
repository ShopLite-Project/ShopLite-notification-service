# ShopLite Notification Service

Notification orchestration microservice for the ShopLite demo platform.

This service accepts outbound notification requests and simulates dispatching order status updates across email, SMS, and webhook channels.

## Endpoints

- `GET /health`
- `GET /notifications`
- `POST /notifications`
- `POST /notifications/dispatch`

## Local development

```bash
npm ci
npm run dev
```
