import express from "express";
import helmet from "helmet";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {z} from "zod";
import {health} from "./health.js";

const app=express(); const port=Number(process.env.PORT||4001);
const secret=process.env.JWT_SECRET||"local-change-me";
app.use(helmet()); app.use(express.json()); health(app,"user-service",port);
type User={id:string;email:string;passwordHash:string};
const users=new Map<string,User>();

const schema=z.object({email:z.string().email(),password:z.string().min(8)});
app.post("/register",async(req,res)=>{
 const parsed=schema.safeParse(req.body); if(!parsed.success)return res.status(400).json({error:parsed.error.flatten()});
 if(users.has(parsed.data.email))return res.status(409).json({error:"user already exists"});
 const u={id:crypto.randomUUID(),email:parsed.data.email,passwordHash:await bcrypt.hash(parsed.data.password,12)};
 users.set(u.email,u); res.status(201).json({id:u.id,email:u.email});
});
app.post("/login",async(req,res)=>{
 const parsed=schema.safeParse(req.body); if(!parsed.success)return res.status(400).json({error:"invalid credentials"});
 const u=users.get(parsed.data.email);
 if(!u||!(await bcrypt.compare(parsed.data.password,u.passwordHash)))return res.status(401).json({error:"invalid credentials"});
 const accessToken=jwt.sign({sub:u.id,email:u.email},secret,{expiresIn:"1h",issuer:"microshop"});
 res.json({accessToken,tokenType:"Bearer",expiresIn:3600});
});
app.listen(port,"0.0.0.0",()=>console.log(`user-service listening ${port}`));

