import express from "express";import helmet from "helmet";import amqp from "amqplib";import {z} from "zod";import {health} from "./health.js";
const app=express();const port=Number(process.env.PORT||4003);app.use(helmet());app.use(express.json());health(app,"order-service",port);
const schema=z.object({userId:z.string().min(1),items:z.array(z.object({productId:z.string(),quantity:z.number().int().positive()})).min(1)});
async function publish(routingKey:string,payload:any){
 const c=await amqp.connect(process.env.RABBITMQ_URL||"amqp://microshop:localpassword@rabbitmq:5672");
 const ch=await c.createChannel();await ch.assertExchange("microshop.events","topic",{durable:true});
 ch.publish("microshop.events",routingKey,Buffer.from(JSON.stringify(payload)),{persistent:true,contentType:"application/json"});
 setTimeout(()=>c.close(),200);
}
const orders:any[]=[];
app.post("/",async(req,res)=>{
 const p=schema.safeParse(req.body);if(!p.success)return res.status(400).json({error:p.error.flatten()});
 const o={id:crypto.randomUUID(),...p.data,status:"PENDING",createdAt:new Date().toISOString()};orders.push(o);
 try{await publish("order.created",o)}catch(e){console.error(e);return res.status(503).json({error:"event broker unavailable"})}
 res.status(201).json(o);
});
app.get("/",(_,res)=>res.json(orders));
app.listen(port,"0.0.0.0",()=>console.log(`order-service listening ${port}`));

