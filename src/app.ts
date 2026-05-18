import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import { healthRouter } from "./routes/health";
import { notificationsRouter } from "./routes/notifications";

export const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("combined"));

app.get("/", (_request, response) => {
  response.status(200).json({
    service: "shoplite-notification-service",
    message: "ShopLite notification service is running"
  });
});

app.use("/health", healthRouter);
app.use("/notifications", notificationsRouter);
