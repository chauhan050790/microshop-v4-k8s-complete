import express from "express";
import helmet from "helmet";
import jwt from "jsonwebtoken";
import {z} from "zod";
import {health} from "./health.js";
import { Redis } from "ioredis";
import {PrismaClient} from "@prisma/client";

const app=express();const port=Number(process.env.PORT||4002);
const secret=process.env.JWT_SECRET;
if(!secret||secret.length<32)throw new Error("JWT_SECRET must be set and at least 32 characters");
if(!process.env.DATABASE_URL)throw new Error("DATABASE_URL must be set");
app.use(helmet());app.use(express.json());health(app,"product-service",port);
const redis=new Redis(process.env.REDIS_URL||"redis://redis:6379");
const prisma=new PrismaClient();
app.get("/",async(_,res)=>{
 try {const cached=await redis.get("products"); if(cached)return res.json(JSON.parse(cached));} catch(e){console.warn("redis unavailable; reading database",e);}
 const products=await prisma.product.findMany({orderBy:{createdAt:"asc"}});
 try {await redis.set("products",JSON.stringify(products),"EX",60);} catch(e){console.warn("redis cache write failed",e);}
 res.json(products);
});
app.get("/:id",async(req,res)=>{const p=await prisma.product.findUnique({where:{id:req.params.id}});p?res.json(p):res.status(404).json({error:"product not found"})});
app.post("/",(req,res,next)=>{const header=req.headers.authorization;if(!header?.startsWith("Bearer "))return res.status(401).json({error:"missing bearer token"});try{jwt.verify(header.slice(7),secret,{issuer:"microshop"});next();}catch{return res.status(401).json({error:"invalid token"});}},async(req,res)=>{
 const s=z.object({name:z.string().min(2),description:z.string().optional(),price:z.number().positive(),stock:z.number().int().nonnegative()}).safeParse(req.body);
 if(!s.success)return res.status(400).json({error:s.error.flatten()});
 const p=await prisma.product.create({data:s.data});await redis.del("products").catch(()=>undefined);res.status(201).json(p);
});
process.on("SIGTERM",async()=>{await prisma.$disconnect();await redis.quit();process.exit(0)});
app.listen(port,"0.0.0.0",()=>console.log(`product-service listening ${port}`));
