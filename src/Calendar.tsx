import {useEffect,useMemo,useState} from 'react';import {Plus,Pencil} from 'lucide-react';
import {catOf,accOf} from './data';import {TxHelper,Format} from './helpers';import {CategoryIcon} from './components';import type {Tx} from './types';
const WD=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
export default function Calendar({tx,y,m,onAdd,onEdit}:{tx:Tx[];y:number;m:number;onAdd:(d:string)=>void;onEdit:(t:Tx)=>void}){
 const now=new Date(),isNow=now.getFullYear()===y&&now.getMonth()===m;
 const [sel,setSel]=useState(isNow?now.getDate():1);
 useEffect(()=>setSel(isNow?now.getDate():1),[y,m]);
 const days=TxHelper.daysIn(y,m),lead=new Date(y,m,1).getDay(),byDay=useMemo(()=>TxHelper.groupByDay(tx),[tx]);
 const list=byDay[sel]??[],date=`${TxHelper.monthKey(y,m)}-${TxHelper.pad(sel)}`;
 return <div className="cal">
  <div className="card"><div className="grid7">{WD.map(d=><div className="wd" key={d}>{d}</div>)}
   {Array.from({length:lead},(_,i)=><div className="cell empty" key={'e'+i}/>)}
   {Array.from({length:days},(_,i)=>{const d=i+1,l=byDay[d]??[],e=TxHelper.totalOf(l,'expense'),n=TxHelper.totalOf(l,'income');
    return <button key={d} className={'cell'+(d===sel?' sel':'')+(isNow&&d===now.getDate()?' today':'')} onClick={()=>setSel(d)} aria-label={`${d}, ${l.length} entries`}>
     <span className="d">{d}</span>{e>0&&<span className="expense">-{e.toFixed(0)}</span>}{n>0&&<span className="income">+{n.toFixed(0)}</span>}</button>;})}</div></div>
  <div className="card"><div className="row between"><h3>{Format.longDate(date)}</h3><b>{Format.amount(TxHelper.netChange(list))}</b></div>
   {list.length===0&&<p className="muted">Nothing recorded for this day.</p>}
   {list.map(t=><div className="tx cal2" key={t.id}><CategoryIcon id={t.categoryId}/><span className="name">{catOf(t.categoryId).name}<small>{accOf(t.accountId).name}</small></span>
    <b className={t.type}>{Format.signedAmount(t)}</b><button className="icon" aria-label="Edit" onClick={()=>onEdit(t)}><Pencil size={15}/></button></div>)}
   <button className="btn" style={{width:'100%',marginTop:12}} onClick={()=>onAdd(date)}><Plus size={16}/> Add entry for this day</button></div></div>;}
