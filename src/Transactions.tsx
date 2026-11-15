import {useMemo,useState} from 'react';
import {BarChart,Bar,AreaChart,Area,XAxis,YAxis,Tooltip,ResponsiveContainer} from 'recharts';
import {Filter,Pencil,Trash2,ArrowUpDown,CornerDownRight} from 'lucide-react';
import {categories,catOf,accOf,TS} from './data';import {TxHelper,Format,chartAxis,TxCriteria} from './helpers';import {GlassCard,Segmented,CategoryIcon} from './components';import type {Tx,TxType} from './types';
const field='rounded-xl border border-line bg-card/60 px-3 py-2 text-sm';
const TYPES:TxType[]=['expense','income','transfer'];
export default function Transactions({tx,y,m,onEdit,onDelete}:{tx:Tx[];y:number;m:number;onEdit:(t:Tx)=>void;onDelete:(id:string)=>void}){
 const [open,setOpen]=useState(false),[draft,setDraft]=useState<TxCriteria>(TxHelper.defaultCriteria),[applied,setApplied]=useState<TxCriteria>(TxHelper.defaultCriteria),[asc,setAsc]=useState(false),[view,setView]=useState<'bar'|'line'>('bar');
 const rows=useMemo(()=>TxHelper.sortByDate(TxHelper.applyFilter(tx,applied),asc),[tx,applied,asc]);
 const chart=useMemo(()=>TxHelper.dailyTotals(rows,1,TxHelper.daysIn(y,m)),[rows,y,m]);
 const groups=useMemo(()=>TxHelper.groupByDate(rows),[rows]);
 const reset=()=>{setDraft(TxHelper.defaultCriteria);setApplied(TxHelper.defaultCriteria);};
 return <section className="space-y-4">
  <GlassCard><div className="flex flex-wrap items-center justify-between gap-2"><span className="flex items-center gap-3 text-xs text-muted"><i className="inline-block size-2 rounded-full bg-down"/>Expense<i className="inline-block size-2 rounded-full bg-up"/>Income</span>
    <Segmented value={view} onChange={setView} options={[['bar','Bar graph'],['line','Line graph']]}/></div>
   <div className="mt-3 h-44 sm:h-56"><ResponsiveContainer width="100%" height="100%">{view==='line'?
    <AreaChart data={chart}><XAxis dataKey="day" {...chartAxis}/><YAxis {...chartAxis} width={36}/><Tooltip contentStyle={TS}/><Area dataKey="expense" stroke="var(--red)" fill="var(--red)" fillOpacity={.25}/><Area dataKey="income" stroke="var(--green)" fill="var(--green)" fillOpacity={.25}/></AreaChart>:
    <BarChart data={chart}><XAxis dataKey="day" {...chartAxis}/><YAxis {...chartAxis} width={36}/><Tooltip contentStyle={TS} cursor={{fill:'var(--line)'}}/><Bar dataKey="expense" fill="var(--red)" radius={[6,6,0,0]}/><Bar dataKey="income" fill="var(--green)" radius={[6,6,0,0]}/></BarChart>}</ResponsiveContainer></div></GlassCard>
  <div className="flex items-center justify-between"><h2 className="text-lg font-semibold">Transactions</h2><div className="flex gap-2">
   <button className={`${field} flex items-center gap-1.5`} onClick={()=>setAsc(!asc)}><ArrowUpDown size={14}/>{asc?'Oldest':'Latest'}</button>
   <button className={`${field} flex items-center gap-1.5`} aria-expanded={open} onClick={()=>setOpen(!open)}><Filter size={14}/>Filter</button></div></div>
  {open&&<GlassCard><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
   <select aria-label="Category" className={field} value={draft.categoryId} onChange={e=>setDraft({...draft,categoryId:e.target.value})}><option value="">All categories</option>{categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select>
   <input aria-label="From date" type="date" className={field} value={draft.from} onChange={e=>setDraft({...draft,from:e.target.value})}/><input aria-label="To date" type="date" className={field} value={draft.to} onChange={e=>setDraft({...draft,to:e.target.value})}/>
   <label className="flex flex-col gap-1 text-xs text-muted">Amount up to {draft.maxAmount}<input type="range" min={10} max={5000} value={draft.maxAmount} onChange={e=>setDraft({...draft,maxAmount:+e.target.value})}/></label></div>
   <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">{TYPES.map(k=><label key={k} className="flex items-center gap-1.5 capitalize"><input type="checkbox" checked={draft.types[k]} onChange={e=>setDraft({...draft,types:{...draft.types,[k]:e.target.checked}})}/>{k}</label>)}
    <span className="ml-auto flex gap-2"><button className={field} onClick={reset}>Reset</button><button className="rounded-xl px-4 py-2 text-sm text-white" style={{background:'var(--grad)'}} onClick={()=>setApplied(draft)}>Apply</button></span></div></GlassCard>}
  {groups.length===0&&<GlassCard><p className="text-sm text-muted">No entries match. Change the filters or add a new entry.</p></GlassCard>}
  {groups.map(([date,list])=><div key={date}>
   <div className="mb-2 flex items-center justify-between px-1 text-sm text-muted"><span>{Format.longDate(date)}</span><span>Total <b className="text-fg">{Format.amount(TxHelper.netChange(list))}</b></span></div>
   <div className="grid gap-2 md:grid-cols-2 md:gap-x-4">{list.map(t=>{const cat=catOf(t.categoryId);return <div key={t.id} role="button" tabIndex={0} aria-label={`Edit ${cat.name}`} onClick={()=>onEdit(t)} onKeyDown={e=>e.key==='Enter'&&onEdit(t)}
     className="flex cursor-pointer items-center gap-3 rounded-2xl border border-line bg-card/70 p-3 backdrop-blur transition hover:bg-card/90">
     <CategoryIcon id={t.categoryId}/>
     <div className="min-w-0 flex-1"><p className="truncate font-medium">{cat.name}</p>
      <p className="flex items-center gap-1 truncate text-xs text-muted">{t.toAccountId?<><CornerDownRight size={12}/>{accOf(t.accountId).name} → {accOf(t.toAccountId).name}</>:accOf(t.accountId).name}{t.note&&<> · {t.note}</>}</p></div>
     <div className="text-right"><p className={`font-semibold ${Format.toneOf(t)}`}>{Format.signedAmount(t)}</p><p className="text-xs capitalize text-muted">{t.type}</p></div>
     <button className="icon" aria-label="Edit entry" onClick={e=>{e.stopPropagation();onEdit(t);}}><Pencil size={15}/></button>
     <button className="icon" aria-label="Delete entry" onClick={e=>{e.stopPropagation();onDelete(t.id);}}><Trash2 size={15}/></button></div>;})}</div></div>)}
 </section>;}
