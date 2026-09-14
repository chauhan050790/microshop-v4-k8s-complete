import express from "express";import helmet from "helmet";import amqp from "amqplib";import {health} from "./health.js";
const app=express();const port=Number(process.env.PORT||4005);app.use(helmet());app.use(express.json());health(app,"notification-service",port);
async function consume(){
 try{
  const c=await amqp.connect(process.env.RABBITMQ_URL||"amqp://microshop:localpassword@rabbitmq:5672"),ch=await c.createChannel();
  await ch.assertExchange("microshop.events","topic",{durable:true});
  const q=await ch.assertQueue("notification-service",{durable:true});
  for(const key of ["order.created","payment.completed"])await ch.bindQueue(q.queue,"microshop.events",key);
  await ch.consume(q.queue,msg=>{if(!msg)return;console.log(JSON.stringify({event:msg.fields.routingKey,payload:msg.content.toString()}));ch.ack(msg)});
 }catch(e){console.error("broker unavailable; retrying",e);setTimeout(consume,5000)}
}
consume();app.listen(port,"0.0.0.0",()=>console.log(`notification-service listening ${port}`));

