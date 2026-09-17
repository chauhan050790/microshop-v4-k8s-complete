import express from "express";
import helmet from "helmet";
import amqp from "amqplib";
import { health } from "./health.js";

export const app = express();
const port = Number(process.env.PORT || 4005);
if (!process.env.RABBITMQ_URL) throw new Error("RABBITMQ_URL must be set");
app.disable("x-powered-by");
app.use(helmet());
app.use(express.json({ limit: "1mb" }));
health(app, "notification-service", port);

async function consume() {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL!);
    const channel = await connection.createChannel();
    await channel.assertExchange("microshop.events", "topic", { durable: true });
    const queue = await channel.assertQueue("notification-service", { durable: true });
    for (const key of ["order.created", "payment.completed"]) await channel.bindQueue(queue.queue, "microshop.events", key);
    await channel.consume(queue.queue, (message) => {
      if (!message) return;
      try {
        console.log(JSON.stringify({ event: message.fields.routingKey, payload: message.content.toString() }));
        channel.ack(message);
      } catch (error) {
        console.error("notification handling failed", error);
        channel.nack(message, false, true);
      }
    });
    connection.on("close", () => setTimeout(consume, 5000));
    connection.on("error", (error) => console.error("broker connection error", error));
  } catch (error) {
    console.error("broker unavailable; retrying", error);
    setTimeout(consume, 5000);
  }
}
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error("notification-service error", err);
  res.status(500).json({ error: "internal server error" });
});
export function startServer() {
  const server = app.listen(port, "0.0.0.0", () => console.log(`notification-service listening ${port}`));
  return server;
}
if (process.env.NODE_ENV !== "test") {
  consume();
  startServer();
}
