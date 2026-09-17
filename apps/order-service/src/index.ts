import express from "express";
import helmet from "helmet";
import amqp, { ConfirmChannel, ChannelModel } from "amqplib";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { health } from "./health.js";
import { PrismaClient } from "@prisma/client";

export const app = express();
const port = Number(process.env.PORT || 4003);
const secret = process.env.JWT_SECRET;
if (!secret || secret.length < 32) throw new Error("JWT_SECRET must be set and at least 32 characters");
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL must be set");
if (!process.env.RABBITMQ_URL) throw new Error("RABBITMQ_URL must be set");
app.disable("x-powered-by");
app.use(helmet());
app.use(express.json({ limit: "1mb" }));
health(app, "order-service", port);

const prisma = new PrismaClient();
let connection: ChannelModel | undefined;
let channel: ConfirmChannel | undefined;
const schema = z.object({
  items: z.array(z.object({ productId: z.string().uuid(), quantity: z.number().int().positive() })).min(1),
});

async function publish(routingKey: string, payload: unknown) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      if (!connection || !channel) {
        connection = await amqp.connect(process.env.RABBITMQ_URL!);
        channel = await connection.createConfirmChannel();
        await channel.assertExchange("microshop.events", "topic", { durable: true });
        connection.on("close", () => { connection = undefined; channel = undefined; });
      }
      channel!.publish("microshop.events", routingKey, Buffer.from(JSON.stringify(payload)), {
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

const auth = (req: any, res: any, next: any) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return res.status(401).json({ error: "missing bearer token" });
  try {
    req.user = jwt.verify(header.slice(7), secret, { issuer: "microshop" });
    next();
  } catch {
    return res.status(401).json({ error: "invalid token" });
  }
};

app.post("/", (req, res) => auth(req, res, async () => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const userId = ((req as any).user as jwt.JwtPayload).sub;
  if (!userId) return res.status(401).json({ error: "invalid token" });
  try {
    const order = await prisma.$transaction(async (tx: any) => {
      const products = await tx.product.findMany({ where: { id: { in: parsed.data.items.map((item) => item.productId) } } });
      if (products.length !== parsed.data.items.length) throw new Error("product not found");
      const lines = parsed.data.items.map((item) => {
        const product = products.find((candidate: any) => candidate.id === item.productId)!;
        return { ...item, product, unitPrice: Number(product.price) };
      });
      for (const line of lines) {
        const updated = await tx.product.updateMany({
          where: { id: line.productId, stock: { gte: line.quantity } },
          data: { stock: { decrement: line.quantity } },
        });
        if (updated.count !== 1) throw new Error("insufficient stock");
      }
      const total = lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
      return tx.order.create({
        data: {
          userId, status: "PENDING", total,
          items: { create: lines.map((line) => ({ productId: line.productId, quantity: line.quantity, unitPrice: line.unitPrice })) },
        },
        include: { items: true },
      });
    });
    try {
      await publish("order.created", order);
    } catch (error) {
      console.error(error);
      return res.status(503).json({ error: "event broker unavailable", orderId: order.id });
    }
    return res.status(201).json(order);
  } catch (error: any) {
    if (error?.message === "product not found" || error?.message === "insufficient stock") {
      return res.status(409).json({ error: error.message });
    }
    console.error(error);
    return res.status(500).json({ error: "unable to create order" });
  }
}));

app.get("/", (req, res) => auth(req, res, async () => {
  const userId = ((req as any).user as jwt.JwtPayload).sub;
  res.json(await prisma.order.findMany({ where: { userId }, include: { items: true }, orderBy: { createdAt: "desc" } }));
}));

app.use((err: any, _req: any, res: any, _next: any) => {
  console.error("order-service error", err);
  res.status(500).json({ error: "internal server error" });
});

export function startServer() {
  const server = app.listen(port, "0.0.0.0", () => console.log(`order-service listening ${port}`));
  return server;
}

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  if (connection) await connection.close();
  process.exit(0);
});
if (process.env.NODE_ENV !== "test") startServer();
