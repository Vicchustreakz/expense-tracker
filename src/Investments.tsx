import {TxHelper,Format} from './helpers';
import {useEffect,useState} from 'react';import {Plus,Pencil,Trash2,RefreshCw} from 'lucide-react';import type {Hold} from './useHoldings';
const API=import.meta.env.VITE_STOCK_API as string|undefined;
type Q={symbol:string;price?:number;prev?:number};
function Picker({onPick}:{onPick:(s:{symbol:string;name:string})=>void}){
 const [t,setT]=useState(''),[res,setRes]=useState<any[]>([]);
 useEffect(()=>{if(!API||t.length<2){setRes([]);return;}
  const id=setTimeout(async()=>{try{setRes(await(await fetch(`${API}/search?q=${encodeURIComponent(t)}`)).json());}catch{setRes([]);}},350);return()=>clearTimeout(id);},[t]);
 if(!API)return <><p className="muted">Live search needs the quote service (see VITE_STOCK_API). You can still enter a stock by hand.</p>
  <input placeholder="Symbol, e.g. RELIANCE.NS" value={t} onChange={e=>setT(e.target.value.toUpperCase())}/><button type="button" className="btn" disabled={!t} onClick={()=>onPick({symbol:t,name:t})}>Use this symbol</button></>;
 return <><input autoFocus placeholder="Search company or symbol, e.g. Reliance" value={t} onChange={e=>setT(e.target.value)}/>
  {t.length>=2&&res.length===0&&<p className="muted">No NSE/BSE matches yet.</p>}
  {res.map(r=><button type="button" key={r.symbol} className="ghost pick" onClick={()=>onPick(r)}><span>{r.name}</span><small className="muted">{r.symbol} · {r.exchange}</small></button>)}</>;}
export default function Investments({list,save,remove}:{list:Hold[];save:(h:any)=>Promise<void>;remove:(id:string)=>void}){
 const [q,setQ]=useState<Record<string,Q>>({}),[at,setAt]=useState<Date|null>(null),[err,setErr]=useState(''),[f,setF]=useState<any>(null);
 const key=list.map(h=>h.symbol).join(',');
 const load=async()=>{if(!API||!key)return;try{const j:Q[]=await(await fetch(`${API}/quote?symbols=${key}`)).json();setQ(Object.fromEntries(j.map(x=>[x.symbol,x])));setAt(new Date());setErr('');}catch{setErr('Could not reach the quote service. Showing the last known prices.');}};
 useEffect(()=>{load();const t=setInterval(load,60000);return()=>clearInterval(t);},[key]);
 const rows=list.map(h=>{const p=q[h.symbol]?.price,pv=q[h.symbol]?.prev,inv=h.qty*h.avg,val=h.qty*(p??h.avg);return {h,p,day:p!=null&&pv?(p-pv)/pv*100:undefined,dayAmt:p!=null&&pv?h.qty*(p-pv):0,inv,val,pl:val-inv};});
 const T=rows.reduce((s,r)=>({inv:s.inv+r.inv,val:s.val+r.val,day:s.day+r.dayAmt}),{inv:0,val:0,day:0}),pl=T.val-T.inv;
 return <div>
  <div className="stats3">
   <div className="card stat"><div><h3>Invested</h3><p>{Format.rupees(T.inv)}</p></div></div>
   <div className="card stat"><div><h3>Current value</h3><p>{Format.rupees(T.val)}</p><small className={Format.tone(T.day)}>Today {T.day>=0?'+':''}{Format.rupees(T.day)}</small></div></div>
   <div className="card stat"><div><h3>Total P&amp;L</h3><p className={Format.tone(pl)}>{pl>=0?'+':''}{Format.rupees(pl)}</p></div><span className={'badge '+Format.tone(pl)} style={{borderColor:'currentColor'}}>{T.inv?(pl/T.inv*100).toFixed(1):'0.0'}%</span></div></div>
  <div className="row between" style={{margin:'16px 0 8px'}}><small className="muted">{API?(at?`Updated ${at.toLocaleTimeString()}. Prices may be delayed.`:'Loading prices…'):'Live prices are off. Set VITE_STOCK_API to turn them on.'}</small>
   <span className="row"><button className="ghost" onClick={load} aria-label="Refresh prices"><RefreshCw size={14}/> Refresh</button><button className="btn" onClick={()=>setF({})}><Plus size={16}/> Add stock</button></span></div>
  {err&&<p className="expense" role="alert">{err}</p>}
  <div className="card tblwrap">{rows.length===0?<p className="muted">No holdings yet. Use Add stock to search and add one.</p>:
   <table className="tbl"><thead><tr><th>Stock</th><th>Qty</th><th>Avg</th><th>LTP</th><th>Day</th><th>Invested</th><th>Value</th><th>P&amp;L</th><th/></tr></thead><tbody>
   {rows.map(({h,p,day,inv,val,pl})=><tr key={h.id}><td><b>{h.name}</b><small className="muted" style={{display:'block'}}>{h.symbol}</small></td><td>{h.qty}</td><td>{Format.rupees(h.avg)}</td><td>{p!=null?Format.rupees(p):'—'}</td>
    <td className={Format.tone(day??0)}>{day!=null?`${day>=0?'+':''}${day.toFixed(2)}%`:'—'}</td><td>{Format.rupees(inv)}</td><td>{Format.rupees(val)}</td><td className={Format.tone(pl)}>{pl>=0?'+':''}{Format.rupees(pl)}<small style={{display:'block'}}>{inv?(pl/inv*100).toFixed(1):0}%</small></td>
    <td><button className="icon" aria-label={`Edit ${h.name}`} onClick={()=>setF({...h,qty:String(h.qty),avg:String(h.avg)})}><Pencil size={15}/></button><button className="icon" aria-label={`Delete ${h.name}`} onClick={()=>remove(h.id)}><Trash2 size={15}/></button></td></tr>)}</tbody></table>}</div>
  {f&&<div className="modal" onClick={()=>setF(null)}><form className="card form" onClick={e=>e.stopPropagation()} onSubmit={async e=>{e.preventDefault();await save({id:f.id,symbol:f.symbol,name:f.name,qty:+f.qty,avg:+f.avg});setF(null);}}>
   <h3>{f.id?'Edit holding':'Add stock'}</h3>
   {!f.symbol?<Picker onPick={s=>setF({...f,...s})}/>:<>
    <div><b>{f.name}</b><small className="muted" style={{display:'block'}}>{f.symbol}</small></div>
    <input type="number" required min="0" step="any" placeholder="Quantity" value={f.qty??''} onChange={e=>setF({...f,qty:e.target.value})}/>
    <input type="number" required min="0" step="any" placeholder="Average buy price (₹)" value={f.avg??''} onChange={e=>setF({...f,avg:e.target.value})}/>
    <div className="row"><button type="button" className="ghost" onClick={()=>setF(f.id?null:{})}>{f.id?'Cancel':'Back'}</button><button className="btn">Save holding</button></div></>}
   {!f.symbol&&<div className="row"><button type="button" className="ghost" onClick={()=>setF(null)}>Cancel</button></div>}</form></div>}</div>;}
