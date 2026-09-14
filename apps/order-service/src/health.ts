import client from "prom-client";
export const registry = new client.Registry();
client.collectDefaultMetrics({register:registry});
export function health(app:any,name:string,port:number) {
  app.get("/health",(_:any,res:any)=>res.json({status:"ok",service:name}));
  app.get("/metrics",async(_:any,res:any)=>{res.set("Content-Type",registry.contentType);res.end(await registry.metrics())});
}

