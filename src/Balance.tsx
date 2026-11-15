import {TxHelper,Format} from './helpers';
import {curr} from './data';
import {useEffect,useState} from 'react';import type {Tx} from './types';import type {useMonth} from './useMonth';
export default function Balance({tx,y,m,mo}:{tx:Tx[];y:number;m:number;mo:ReturnType<typeof useMonth>}){
 const [c,setC]=useState(''),[s,setS]=useState(''),[hint,setHint]=useState<number|null>(null),[ok,setOk]=useState(false);
 useEffect(()=>{setC(mo.carried?String(mo.carried):'');setS(mo.salary?String(mo.salary):'');},[mo.carried,mo.salary,y,m]);
 useEffect(()=>{let live=true;mo.prevClosing().then(v=>live&&setHint(v));return()=>{live=false;};},[y,m,mo.carried,mo.salary]);
 const inc=TxHelper.totalOf(tx,'income'),exp=TxHelper.totalOf(tx,'expense');
 const cur=mo.carried+mo.salary+inc-exp;
 const rows:[string,number][]=[['Last month balance',mo.carried],['Salary',mo.salary],['Other income',inc],['Expenses',-exp]];
 return <div className="bal">
  <div className="card"><h3>This month's setup</h3>
   <label>Last month balance<input type="number" step="0.01" value={c} onChange={e=>setC(e.target.value)}/></label>
   <label>Salary this month<input type="number" step="0.01" min="0" value={s} onChange={e=>setS(e.target.value)}/></label>
   {hint!==null&&<button className="ghost" onClick={()=>setC(hint.toFixed(2))}>Use last month's closing ({Format.amount(hint)})</button>}
   <button className="btn" onClick={async()=>{await mo.save({carried:+c||0,salary:+s||0});setOk(true);setTimeout(()=>setOk(false),1500);}}>{ok?'Saved':'Save balance'}</button></div>
  <div className="card"><h3>Statement</h3>
   {rows.map(([l,v])=><div className="stmt" key={l}><span>{l}</span><b className={v<0?'expense':v>0?'income':''}>{Format.amount(v)}</b></div>)}
   <div className="stmt total"><span>Current balance</span><b>{Format.amount(cur)}</b></div></div></div>;}
