import express from "express";
import helmet from "helmet";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {z} from "zod";
import {health} from "./health.js";
import {PrismaClient} from "@prisma/client";

const app=express(); const port=Number(process.env.PORT||4001);
const secret=process.env.JWT_SECRET;
if(!secret||secret.length<32)throw new Error("JWT_SECRET must be set and at least 32 characters");
if(!process.env.DATABASE_URL)throw new Error("DATABASE_URL must be set");
app.use(helmet()); app.use(express.json()); health(app,"user-service",port);
const prisma=new PrismaClient();

const schema=z.object({email:z.string().email(),password:z.string().min(8)});
app.post("/register",async(req,res)=>{
 const parsed=schema.safeParse(req.body); if(!parsed.success)return res.status(400).json({error:parsed.error.flatten()});
 try {
  const u=await prisma.user.create({data:{email:parsed.data.email,passwordHash:await bcrypt.hash(parsed.data.password,12)}});
  res.status(201).json({id:u.id,email:u.email});
 } catch(e:any) {
  if(e?.code==="P2002")return res.status(409).json({error:"user already exists"});
  console.error(e);res.status(500).json({error:"unable to create user"});
 }
});
app.post("/login",async(req,res)=>{
 const parsed=schema.safeParse(req.body); if(!parsed.success)return res.status(400).json({error:"invalid credentials"});
 const u=await prisma.user.findUnique({where:{email:parsed.data.email}});
 if(!u||!(await bcrypt.compare(parsed.data.password,u.passwordHash)))return res.status(401).json({error:"invalid credentials"});
 const accessToken=jwt.sign({sub:u.id,email:u.email},secret,{expiresIn:"1h",issuer:"microshop"});
 res.json({accessToken,tokenType:"Bearer",expiresIn:3600});
});
process.on("SIGTERM",async()=>{await prisma.$disconnect();process.exit(0)});
app.listen(port,"0.0.0.0",()=>console.log(`user-service listening ${port}`));
