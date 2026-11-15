import {TxHelper,Format} from './helpers';
import {curr} from './data';
import {useState} from 'react';import {Plus,Pencil,Trash2} from 'lucide-react';
import {icons} from './data';import type {Cat,Tx} from './types';
const SW=['#ec4899','#a855f7','#6d5dfc','#06b6d4','#10b981','#34c58a','#eab308','#f59e0b','#ef5b6b','#94a3b8'];
export default function Categories({cats,tx,save,remove}:{cats:Cat[];tx:Tx[];save:(c:Cat)=>Promise<void>;remove:(id:string)=>Promise<void>}){
 const [f,setF]=useState<Cat|null>(null);
 const spent=(id:string)=>TxHelper.sumAmounts(tx.filter(t=>t.categoryId===id&&t.type!=='transfer'));
 return <div>
  <div className="row end"><button className="btn" onClick={()=>setF({id:'',name:'',tag:'',icon:'Tag',color:SW[2],type:'expense'})}><Plus size={16}/> Add category</button></div>
  {(['expense','income'] as const).map(k=><div key={k}><h3 className="sub">{k==='expense'?'Expense':'Income'} categories</h3>
   <div className="catgrid">{cats.filter(c=>c.type===k).map(c=>{const I=icons[c.icon]??icons.Tag;return <div className="card cat" key={c.id}>
    <span className="ico" style={{background:c.color+'33',color:c.color}}><I size={18}/></span>
    <span className="name">{c.name}<small>{c.tag||'No tag'} · {spent(c.id).toFixed(2)}{curr()} this month</small></span>
    <button className="icon" aria-label={`Edit ${c.name}`} onClick={()=>setF(c)}><Pencil size={15}/></button>
    <button className="icon" aria-label={`Delete ${c.name}`} onClick={()=>remove(c.id)}><Trash2 size={15}/></button></div>;})}</div></div>)}
  {f&&<div className="modal" onClick={()=>setF(null)}><form className="card form" onClick={e=>e.stopPropagation()} onSubmit={async e=>{e.preventDefault();await save({...f,id:f.id||f.name.toLowerCase().replace(/\W+/g,'-')+Date.now().toString(36)});setF(null);}}>
   <h3>{f.id?'Edit category':'Add category'}</h3>
   <input required placeholder="Name" value={f.name} onChange={e=>setF({...f,name:e.target.value})}/>
   <input placeholder="Tag, e.g. #gym" value={f.tag} onChange={e=>setF({...f,tag:e.target.value})}/>
   <select value={f.type} onChange={e=>setF({...f,type:e.target.value as Cat['type']})}><option value="expense">Expense</option><option value="income">Income</option></select>
   <div className="picker">{Object.entries(icons).map(([n,I])=><button type="button" key={n} aria-label={n} aria-pressed={f.icon===n} className={f.icon===n?'on':''} onClick={()=>setF({...f,icon:n})}><I size={18}/></button>)}</div>
   <div className="sw">{SW.map(c=><button type="button" key={c} aria-label={c} className={f.color===c?'on':''} style={{background:c}} onClick={()=>setF({...f,color:c})}/>)}<input type="color" value={f.color} onChange={e=>setF({...f,color:e.target.value})} aria-label="Custom color"/></div>
   <div className="row"><button type="button" className="ghost" onClick={()=>setF(null)}>Cancel</button><button className="btn">Save category</button></div></form></div>}
 </div>;}
