import express from "express";
import helmet from "helmet";
import amqp, { ConfirmChannel, ChannelModel } from "amqplib";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { health } from "./health.js";
import { PrismaClient } from "@prisma/client";

const app = express();
const port = Number(process.env.PORT || 4004);
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL must be set");
if (!process.env.RABBITMQ_URL) throw new Error("RABBITMQ_URL must be set");
const secret = process.env.JWT_SECRET;
if (!secret || secret.length < 32) throw new Error("JWT_SECRET must be set and at least 32 characters");
app.use(helmet());
app.use(express.json());
health(app, "payment-service", port);

const prisma = new PrismaClient();
let connection: ChannelModel | undefined;
let channel: ConfirmChannel | undefined;
async function publish(payload: unknown) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      if (!connection || !channel) {
        connection = await amqp.connect(process.env.RABBITMQ_URL!);
        channel = await connection.createConfirmChannel();
        await channel.assertExchange("microshop.events", "topic", { durable: true });
        connection.on("close", () => { connection = undefined; channel = undefined; });
      }
      channel!.publish("microshop.events", "payment.completed", Buffer.from(JSON.stringify(payload)), {
        persistent: true, contentType: "application/json",
      });
      await channel!.waitForConfirms();
      return;
    } catch (error) {
      console.error(`broker publish attempt ${attempt + 1} failed`, error);
      channel = undefined;
      connection = undefined;
      await new Promise((resolve) => setTimeout(resolve, 250 * (attempt + 1)));
    }
  }
  throw new Error("event broker unavailable");
}

app.post("/", (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return res.status(401).json({ error: "missing bearer token" });
  try { jwt.verify(header.slice(7), secret, { issuer: "microshop" }); next(); }
  catch { return res.status(401).json({ error: "invalid token" }); }
}, async (req, res) => {
  const parsed = z.object({ orderId: z.string().uuid(), amount: z.number().positive() }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const idempotencyKey = req.header("Idempotency-Key");
  if (!idempotencyKey) return res.status(400).json({ error: "Idempotency-Key header is required" });
  try {
    const existing = await prisma.payment.findUnique({ where: { idempotencyKey } });
    if (existing) return res.status(200).json(existing);
    const payment = await prisma.payment.create({
      data: { orderId: parsed.data.orderId, amount: parsed.data.amount, status: "SUCCEEDED", idempotencyKey },
    });
    try {
      await publish(payment);
    } catch (error) {
      console.error(error);
      return res.status(503).json({ error: "event broker unavailable", paymentId: payment.id });
    }
    return res.status(201).json(payment);
  } catch (error: any) {
    if (error?.code === "P2002") {
      const existing = await prisma.payment.findUnique({ where: { idempotencyKey } });
      if (existing) return res.status(200).json(existing);
    }
    console.error(error);
    return res.status(500).json({ error: "unable to process payment" });
  }
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  if (connection) await connection.close();
  process.exit(0);
});
app.listen(port, "0.0.0.0", () => console.log(`payment-service listening ${port}`));
