CREATE EXTENSION IF NOT EXISTS pgcrypto;
-- Prisma owns the application schema in normal deployments.
-- This file creates the seed data table-compatible with the initial schema.
CREATE TABLE IF NOT EXISTS "Product" (
 id UUID PRIMARY KEY,
 name TEXT NOT NULL,
 description TEXT,
 price NUMERIC(12,2) NOT NULL,
 stock INTEGER NOT NULL DEFAULT 0,
 "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);
INSERT INTO "Product" (id,name,description,price,stock) VALUES
('00000000-0000-0000-0000-000000000100','Laptop Pro','Developer laptop',89999,20),
('00000000-0000-0000-0000-000000000101','Wireless Headphones','Noise cancelling',4999,100),
('00000000-0000-0000-0000-000000000102','Mechanical Keyboard','Developer keyboard',6999,50)
ON CONFLICT DO NOTHING;

