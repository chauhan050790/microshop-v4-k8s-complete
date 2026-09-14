import express from "express";
import helmet from "helmet";
import {z} from "zod";
import {health} from "./health.js";
import Redis from "ioredis";

const app=express();const port=Number(process.env.PORT||4002);
app.use(helmet());app.use(express.json());health(app,"product-service",port);
const redis=new Redis(process.env.REDIS_URL||"redis://redis:6379");
const products=[
{id:"p100",name:"Laptop Pro",description:"14 inch developer laptop",price:89999,stock:20},
{id:"p101",name:"Wireless Headphones",description:"Noise cancelling",price:4999,stock:100},
{id:"p102",name:"Mechanical Keyboard",description:"RGB mechanical keyboard",price:6999,stock:50}
];
app.get("/",async(_,res)=>{
 const cached=await redis.get("products"); if(cached)return res.json(JSON.parse(cached));
 await redis.set("products",JSON.stringify(products),"EX",60);res.json(products);
});
app.get("/:id",(req,res)=>{const p=products.find(x=>x.id===req.params.id);p?res.json(p):res.status(404).json({error:"product not found"})});
app.post("/",(req,res)=>{
 const s=z.object({name:z.string().min(2),description:z.string().optional(),price:z.number().positive(),stock:z.number().int().nonnegative()}).safeParse(req.body);
 if(!s.success)return res.status(400).json({error:s.error.flatten()});
 const p={id:crypto.randomUUID(),...s.data};products.push(p);redis.del("products");res.status(201).json(p);
});
app.listen(port,"0.0.0.0",()=>console.log(`product-service listening ${port}`));

