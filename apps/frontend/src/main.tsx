import React,{useEffect,useState} from "react";import{createRoot}from"react-dom/client";import"./style.css";
const API="/api";
function App(){const[products,setProducts]=useState<any[]>([]);const[email,setEmail]=useState("");const[password,setPassword]=useState("");const[token,setToken]=useState("");
useEffect(()=>{fetch(API+"/products").then(r=>r.json()).then(setProducts)},[]);
async function login(){const r=await fetch(API+"/auth/login",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({email,password})});const x=await r.json();if(x.accessToken)setToken(x.accessToken);else alert(x.error||"login failed")}
async function order(id:string){if(!token)return alert("Login first");const r=await fetch(API+"/orders",{method:"POST",headers:{"content-type":"application/json",authorization:"Bearer "+token},body:JSON.stringify({items:[{productId:id,quantity:1}]})});alert(r.ok?"Order created":"Order failed")}
return <main><header><div><h1>MicroShop</h1><p>Production Microservices Demo</p></div><div className="login"><input placeholder="email" value={email} onChange={e=>setEmail(e.target.value)}/><input placeholder="password" type="password" value={password} onChange={e=>setPassword(e.target.value)}/><button onClick={login}>Login</button></div></header><section>{products.map(p=><article key={p.id}><h2>{p.name}</h2><p>{p.description}</p><strong>₹{p.price.toLocaleString("en-IN")}</strong><small>Stock {p.stock}</small><button onClick={()=>order(p.id)}>Buy</button></article>)}</section></main>}
createRoot(document.getElementById("root")!).render(<App/>);
