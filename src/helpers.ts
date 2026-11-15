import {curr} from './data';import type {Tx,TxType} from './types';
export interface TxCriteria{categoryId:string;from:string;to:string;maxAmount:number;types:Record<TxType,boolean>}
/** Every query/aggregate over a list of transactions lives here so screens never re-implement them. */
export class TxHelper{
 static readonly defaultCriteria:TxCriteria={categoryId:'',from:'',to:'',maxAmount:5000,types:{expense:true,income:true,transfer:true}};
 static pad(n:number){return String(n).padStart(2,'0');}
 static monthKey(y:number,m:number){return `${y}-${TxHelper.pad(m+1)}`;}
 static monthRange(y:number,m:number){const k=TxHelper.monthKey(y,m);return {from:`${k}-01`,to:`${k}-31`};}
 static daysIn(y:number,m:number){return new Date(y,m+1,0).getDate();}
 static dayOf(t:Tx){return +t.date.slice(8);}
 static sumAmounts(l:Tx[]){return l.reduce((s,t)=>s+t.amount,0);}
 static ofType(l:Tx[],type:TxType){return l.filter(t=>t.type===type);}
 static totalOf(l:Tx[],type:TxType){return TxHelper.sumAmounts(TxHelper.ofType(l,type));}
 static signed(t:Tx){return t.type==='income'?t.amount:t.type==='expense'?-t.amount:0;}
 static netChange(l:Tx[]){return l.reduce((s,t)=>s+TxHelper.signed(t),0);}
 static sortByDate(l:Tx[],ascending=false){return [...l].sort((a,b)=>ascending?a.date.localeCompare(b.date):b.date.localeCompare(a.date));}
 static latest(l:Tx[],n:number){return TxHelper.sortByDate(l).slice(0,n);}
 static groupByDay(l:Tx[]){const g:Record<number,Tx[]>={};l.forEach(t=>(g[TxHelper.dayOf(t)]??=[]).push(t));return g;}
 static groupByDate(l:Tx[]){const g:Record<string,Tx[]>={};l.forEach(t=>(g[t.date]??=[]).push(t));return Object.entries(g);}
 static dailyTotals(l:Tx[],fromDay:number,toDay:number){const g=TxHelper.groupByDay(l);
  return Array.from({length:Math.max(0,toDay-fromDay+1)},(_,i)=>{const day=fromDay+i,d=g[day]??[];return {day,expense:TxHelper.totalOf(d,'expense'),income:TxHelper.totalOf(d,'income')};});}
 static runningBalance(l:Tx[],start:number,days:number){let run=start;return TxHelper.dailyTotals(l,1,days).map(d=>({day:d.day,balance:(run+=d.income-d.expense)}));}
 static byCategory(l:Tx[]){const g:Record<string,number>={};l.forEach(t=>{g[t.categoryId]=(g[t.categoryId]??0)+t.amount;});return Object.entries(g).map(([id,total])=>({id,total})).sort((a,b)=>b.total-a.total);}
 static applyFilter(l:Tx[],c:TxCriteria){return l.filter(t=>(!c.categoryId||t.categoryId===c.categoryId)&&(!c.from||t.date>=c.from)&&(!c.to||t.date<=c.to)&&t.amount<=c.maxAmount&&c.types[t.type]);}
}
/** All number/date/label formatting. */
export class Format{
 static amount(n:number,symbol=curr()){return `${n<0?'-':''}${Math.abs(n).toFixed(2)}${symbol}`;}
 static signedAmount(t:Tx){return `${t.type==='income'?'+':t.type==='expense'?'-':''}${t.amount.toFixed(2)}${curr()}`;}
 static rupees(n:number){return '₹'+n.toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2});}
 static tone(n:number){return n>0?'income':n<0?'expense':'';}
 static toneOf(t:Tx){return t.type==='income'?'income':t.type==='expense'?'expense':'';}
 static longDate(d:string){return new Date(d+'T00:00').toLocaleDateString(undefined,{weekday:'long',day:'numeric',month:'long',year:'numeric'});}
 static percent(part:number,whole:number){return whole?Math.round(part/whole*100):0;}
 static greeting(date=new Date()){const h=date.getHours();return h<12?'Good morning':h<18?'Good afternoon':'Good evening';}
}
export const chartAxis={tick:{fill:'var(--muted)',fontSize:11},axisLine:false,tickLine:false} as const;
