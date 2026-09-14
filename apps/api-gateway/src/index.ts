import express from "express";import helmet from "helmet";import cors from "cors";import jwt from "jsonwebtoken";import rateLimit from "express-rate-limit";import {createProxyMiddleware} from "http-proxy-middleware";import client from "prom-client";
const app=express(),port=Number(process.env.PORT||4000),secret=process.env.JWT_SECRET||"local-change-me";
app.use(helmet());app.use(cors({origin:process.env.CORS_ORIGIN?.split(",")||true}));app.use(express.json());app.use(rateLimit({windowMs:60000,limit:300,standardHeaders:true}));
const registry=new client.Registry();client.collectDefaultMetrics({register:registry});
app.get("/health",(_,r)=>r.json({status:"ok",service:"api-gateway"}));app.get("/metrics",async(_,r)=>{r.set("Content-Type",registry.contentType);r.end(await registry.metrics())});
const auth=(req:any,res:any,next:any)=>{const h=req.headers.authorization;if(!h?.startsWith("Bearer "))return res.status(401).json({error:"missing bearer token"});try{req.user=jwt.verify(h.slice(7),secret);next()}catch{return res.status(401).json({error:"invalid token"})}};
const proxy=(target:string)=>createProxyMiddleware({target,changeOrigin:true,pathRewrite:{"^/api":""},proxyTimeout:5000});
app.use("/api/auth",proxy(process.env.USER_SERVICE_URL||"http://user-service:4001"));
app.use("/api/users",auth,proxy(process.env.USER_SERVICE_URL||"http://user-service:4001"));
app.use("/api/products",proxy(process.env.PRODUCT_SERVICE_URL||"http://product-service:4002"));
app.use("/api/orders",auth,proxy(process.env.ORDER_SERVICE_URL||"http://order-service:4003"));
app.use("/api/payments",auth,proxy(process.env.PAYMENT_SERVICE_URL||"http://payment-service:4004"));
app.listen(port,"0.0.0.0",()=>console.log(`gateway listening ${port}`));

