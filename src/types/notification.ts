export interface Notification {
  id: string;
  channel: "email" | "sms" | "webhook";
  recipient: string;
  subject: string;
  message: string;
  status: "queued" | "sent";
  createdAt: string;
}
