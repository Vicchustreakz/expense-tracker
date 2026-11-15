import {useState} from 'react';import {categories,accounts} from './data';import type {Tx,TxType} from './types';
export default function Entry({init,onSave,onClose}:{init:Partial<Tx>;onSave:(t:any)=>void;onClose:()=>void}){
 const [f,setF]=useState<any>({type:'expense' as TxType,amount:'',date:new Date().toISOString().slice(0,10),categoryId:categories.find(c=>c.type==='expense')?.id??'',accountId:accounts[0]?.id??'',note:'',...init});
 const s=(k:string)=>(e:any)=>setF({...f,[k]:e.target.value});
 return <div className="modal" onClick={onClose}><form className="card form" onClick={e=>e.stopPropagation()} onSubmit={e=>{e.preventDefault();const r={...f,amount:Math.abs(+f.amount)};if(r.type==='transfer'){if(!r.toAccountId||r.toAccountId===r.accountId)r.toAccountId=accounts.find(a=>a.id!==r.accountId)?.id;}else delete r.toAccountId;if(r.toAccountId===undefined)delete r.toAccountId;onSave(r);}}>
 <h3>{f.id?'Edit entry':'Add entry'}</h3>
 <select value={f.type} onChange={e=>{const t=e.target.value;setF({...f,type:t,categoryId:categories.find(c=>t==='transfer'||c.type===t)?.id??f.categoryId});}}><option value="expense">Expense</option><option value="income">Income</option><option value="transfer">Transfer</option></select>
 <input type="number" step="0.01" min="0" required placeholder="Amount" value={f.amount} onChange={s('amount')}/>
 <input type="date" required value={f.date} onChange={s('date')}/>
 <select value={f.categoryId} onChange={s('categoryId')}>{categories.filter(c=>f.type==='transfer'||c.type===f.type).map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select>
 <select value={f.accountId} onChange={s('accountId')}>{accounts.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}</select>
 {f.type==='transfer'&&<select aria-label="Transfer to" value={f.toAccountId??''} onChange={s('toAccountId')}><option value="">Transfer to…</option>{accounts.filter(a=>a.id!==f.accountId).map(a=><option key={a.id} value={a.id}>{a.name}</option>)}</select>}<input placeholder="Note" value={f.note} onChange={s('note')}/>
 <div className="row"><button type="button" className="ghost" onClick={onClose}>Cancel</button><button className="btn">Save entry</button></div></form></div>;}
