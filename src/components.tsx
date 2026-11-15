import {ReactNode} from 'react';import {Moon,Sun} from 'lucide-react';import {catOf,icons} from './data';
export const GlassCard=({className='',children}:{className?:string;children:ReactNode})=>
 <div className={`min-w-0 rounded-3xl border border-line bg-card/60 p-4 shadow-lg shadow-black/5 backdrop-blur-xl sm:p-5 ${className}`}>{children}</div>;
export function CategoryIcon({id,size=18}:{id:string;size?:number}){const c=catOf(id),I=icons[c.icon]??icons.Tag;
 return <span className="grid size-10 shrink-0 place-items-center rounded-xl" style={{background:c.color+'33',color:c.color}}><I size={size}/></span>;}
export function Segmented<T extends string>({options,value,onChange}:{options:[T,string][];value:T;onChange:(v:T)=>void}){
 return <div role="group" className="inline-flex rounded-xl bg-line/40 p-0.5 text-xs">{options.map(([v,l])=>
  <button key={v} aria-pressed={value===v} onClick={()=>onChange(v)} className={`rounded-[10px] px-3 py-1.5 transition ${value===v?'text-white shadow':'text-muted'}`} style={value===v?{background:'var(--grad)'}:undefined}>{l}</button>)}</div>;}
const Tip=({text}:{text:string})=><span className="pointer-events-none absolute left-full z-50 ml-2 hidden whitespace-nowrap rounded-md bg-fg px-2 py-1 text-xs text-bg md:group-hover:block">{text}</span>;
export function NavItem({label,icon:Icon,active=false,collapsed=false,onClick}:{label:string;icon:any;active?:boolean;collapsed?:boolean;onClick:()=>void}){
 return <button onClick={onClick} aria-current={active?'page':undefined} className={`group relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${active?'bg-accent/15 text-accent':'text-muted hover:bg-line/40'} ${collapsed?'md:justify-center':''}`}>
  <Icon size={18} className="shrink-0"/><span className={collapsed?'md:hidden':''}>{label}</span>{collapsed&&<Tip text={label}/>}</button>;}
export function ThemeToggle({mode,onChange,collapsed=false}:{mode:string;onChange:(v:string)=>void;collapsed?:boolean}){
 const dark=mode==='dark';
 return <button role="switch" aria-checked={dark} aria-label="Dark mode" onClick={()=>onChange(dark?'light':'dark')} className={`group relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted hover:bg-line/40 ${collapsed?'md:justify-center':''}`}>
  <span className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition ${dark?'bg-accent':'bg-line'}`}><span className={`grid size-5 place-items-center rounded-full bg-white text-slate-700 shadow transition ${dark?'translate-x-5':'translate-x-0.5'}`}>{dark?<Moon size={12}/>:<Sun size={12}/>}</span></span>
  <span className={collapsed?'md:hidden':''}>{dark?'Dark':'Light'} mode</span>{collapsed&&<Tip text={dark?'Dark mode':'Light mode'}/>}</button>;}
export const TabButton=({label,icon:I,active,onClick}:{label:string;icon:any;active:boolean;onClick:()=>void})=>
 <button onClick={onClick} aria-current={active?'page':undefined} className={`flex flex-1 flex-col items-center gap-0.5 text-[11px] ${active?'font-medium text-accent':'text-muted'}`}><I size={20}/>{label}</button>;
