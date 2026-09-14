import express from "express";import helmet from "helmet";import amqp from "amqplib";import {z} from "zod";import {health} from "./health.js";
const app=express();const port=Number(process.env.PORT||4004);app.use(helmet());app.use(express.json());health(app,"payment-service",port);
app.post("/",async(req,res)=>{
 const p=z.object({orderId:z.string().min(1),amount:z.number().positive()}).safeParse(req.body);
 if(!p.success)return res.status(400).json({error:p.error.flatten()});
 const payment={id:crypto.randomUUID(),...p.data,status:"SUCCEEDED",createdAt:new Date().toISOString()};
 try{const c=await amqp.connect(process.env.RABBITMQ_URL||"amqp://microshop:localpassword@rabbitmq:5672");const ch=await c.createChannel();await ch.assertExchange("microshop.events","topic",{durable:true});ch.publish("microshop.events","payment.completed",Buffer.from(JSON.stringify(payment)),{persistent:true});setTimeout(()=>c.close(),200)}
 catch(e){console.error(e);return res.status(503).json({error:"event broker unavailable"})}
 res.status(201).json(payment);
});
app.listen(port,"0.0.0.0",()=>console.log(`payment-service listening ${port}`));

