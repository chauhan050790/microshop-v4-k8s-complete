CREATE EXTENSION IF NOT EXISTS pgcrypto;
-- Prisma owns the application schema in normal deployments. This bootstrap keeps
-- local Compose usable before the first `prisma db push`.
CREATE TABLE IF NOT EXISTS "User" (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 email TEXT NOT NULL UNIQUE,
 "passwordHash" TEXT NOT NULL,
 "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS "Product" (
 id UUID PRIMARY KEY,
 name TEXT NOT NULL,
 description TEXT,
 price NUMERIC(12,2) NOT NULL,
 stock INTEGER NOT NULL DEFAULT 0,
 "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS "Order" (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 "userId" UUID NOT NULL REFERENCES "User"(id),
 status TEXT NOT NULL,
 total NUMERIC(12,2) NOT NULL DEFAULT 0,
 "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS "OrderItem" (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 "orderId" UUID NOT NULL REFERENCES "Order"(id) ON DELETE CASCADE,
 "productId" UUID NOT NULL REFERENCES "Product"(id),
 quantity INTEGER NOT NULL,
 "unitPrice" NUMERIC(12,2) NOT NULL
);
CREATE TABLE IF NOT EXISTS "Payment" (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 "orderId" UUID NOT NULL UNIQUE REFERENCES "Order"(id),
 "idempotencyKey" TEXT NOT NULL UNIQUE,
 amount NUMERIC(12,2) NOT NULL,
 status TEXT NOT NULL,
 "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);
INSERT INTO "Product" (id,name,description,price,stock) VALUES
('00000000-0000-0000-0000-000000000100','Laptop Pro','Developer laptop',89999,20),
('00000000-0000-0000-0000-000000000101','Wireless Headphones','Noise cancelling',4999,100),
('00000000-0000-0000-0000-000000000102','Mechanical Keyboard','Developer keyboard',6999,50)
ON CONFLICT DO NOTHING;
