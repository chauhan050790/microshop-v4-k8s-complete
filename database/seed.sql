INSERT INTO "Product" ("id","name","description","price","stock") VALUES
('00000000-0000-0000-0000-000000000100','Laptop Pro','Developer laptop',89999,20),
('00000000-0000-0000-0000-000000000101','Wireless Headphones','Noise cancelling',4999,100),
('00000000-0000-0000-0000-000000000102','Mechanical Keyboard','Developer keyboard',6999,50)
ON CONFLICT ("id") DO NOTHING;

