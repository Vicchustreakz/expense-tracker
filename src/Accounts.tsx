import {TxHelper,Format} from './helpers';
import {curr} from './data';
import {useState} from 'react';import {Plus,Pencil,Trash2} from 'lucide-react';
import {icons} from './data';import type {Acc,Tx} from './types';
const SW=['#6d5dfc','#06b6d4','#34c58a','#10b981','#eab308','#f59e0b','#ef5b6b','#ec4899','#a855f7','#94a3b8'];
const IC=['Landmark','Banknote','CreditCard','Wallet','PiggyBank','Smartphone','Briefcase'];
export default function Accounts({accs,tx,save,remove,onOpen}:{accs:Acc[];tx:Tx[];save:(a:Acc)=>Promise<void>;remove:(id:string)=>Promise<void>;onOpen:(id:string)=>void}){
 const [f,setF]=useState<(Acc&{op:string})|null>(null);
 const stat=(id:string)=>{const mine=tx.filter(t=>t.accountId===id),inc=TxHelper.totalOf(mine,'income'),exp=TxHelper.totalOf(mine,'expense'),tr=TxHelper.totalOf(tx.filter(t=>t.toAccountId===id),'transfer')-TxHelper.totalOf(mine,'transfer');return {inc,exp,tr,net:inc-exp+tr};};
 return <div>
  <div className="row end"><button className="btn" onClick={()=>setF({id:'',name:'',type:'bank',icon:'Landmark',color:SW[0],opening:0,op:''})}><Plus size={16}/> Add account</button></div>
  <div className="catgrid acc">{accs.map(a=>{const I=icons[a.icon]??icons.Landmark,s=stat(a.id);return <div className="card" key={a.id}>
   <div className="row"><span className="ico" style={{background:a.color+'33',color:a.color}}><I size={18}/></span><span className="name grow">{a.name}<small className="muted" style={{textTransform:'capitalize'}}>{a.type}</small></span>
    <button className="icon" aria-label={`Edit ${a.name}`} onClick={()=>setF({...a,op:a.opening?String(a.opening):''})}><Pencil size={15}/></button>
    <button className="icon" aria-label={`Delete ${a.name}`} onClick={()=>remove(a.id)}><Trash2 size={15}/></button></div>
   <div className="stmt"><span>Opening balance</span><b>{Format.amount(a.opening)}</b></div>
   <div className="stmt"><span>Income / expense</span><span><b className="income">+{s.inc.toFixed(2)}</b> <b className="expense">-{s.exp.toFixed(2)}</b></span></div>
   <div className="stmt"><span>Transfers</span><b>{Format.amount(s.tr)}</b></div>
   <div className="stmt total"><span>This month</span><b className={s.net<0?'expense':'income'}>{Format.amount(s.net)}</b></div>
   <button className="ghost" style={{width:'100%',justifyContent:'center'}} onClick={()=>onOpen(a.id)}>View entries</button></div>;})}</div>
  {f&&<div className="modal" onClick={()=>setF(null)}><form className="card form" onClick={e=>e.stopPropagation()} onSubmit={async e=>{e.preventDefault();const {op,...a}=f;await save({...a,opening:+op||0,id:a.id||a.name.toLowerCase().replace(/\W+/g,'-')+Date.now().toString(36)});setF(null);}}>
   <h3>{f.id?'Edit account':'Add account'}</h3>
   <input required placeholder="Account name" value={f.name} onChange={e=>setF({...f,name:e.target.value})}/>
   <select value={f.type} onChange={e=>setF({...f,type:e.target.value as Acc['type']})}>{['bank','cash','card','wallet','savings'].map(t=><option key={t} value={t}>{t[0].toUpperCase()+t.slice(1)}</option>)}</select>
   <input type="number" step="0.01" placeholder="Opening balance" value={f.op} onChange={e=>setF({...f,op:e.target.value})}/>
   <div className="picker">{IC.map(n=>{const I=icons[n];return <button type="button" key={n} aria-label={n} aria-pressed={f.icon===n} className={f.icon===n?'on':''} onClick={()=>setF({...f,icon:n})}><I size={18}/></button>;})}</div>
   <div className="sw">{SW.map(c=><button type="button" key={c} aria-label={c} className={f.color===c?'on':''} style={{background:c}} onClick={()=>setF({...f,color:c})}/>)}<input type="color" value={f.color} onChange={e=>setF({...f,color:e.target.value})} aria-label="Custom color"/></div>
   <div className="row"><button type="button" className="ghost" onClick={()=>setF(null)}>Cancel</button><button className="btn">Save account</button></div></form></div>}
 </div>;}
