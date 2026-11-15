import {useState} from 'react';import type {H} from './useHistory';
const KINDS=['all','entry','category','account','investment'];
export default function History({items}:{items:H[]}){
 const [k,setK]=useState('all');const l=items.filter(i=>k==='all'||i.kind===k);
 return <div className="card" style={{marginTop:16}}><div className="row between"><h3 style={{margin:0}}>Activity history</h3><select aria-label="Filter by type" value={k} onChange={e=>setK(e.target.value)}>{KINDS.map(x=><option key={x} value={x}>{x[0].toUpperCase()+x.slice(1)}</option>)}</select></div>
  {l.length===0&&<p className="muted">Nothing here yet. Adding, editing or deleting anything is recorded here.</p>}
  <div>{l.map(i=><div className="hrow" key={i.id}><span className={'pill '+i.action}>{i.action}</span><span className="grow"><b style={{textTransform:'capitalize'}}>{i.kind}</b> · {i.summary}</span><small className="muted">{new Date(i.ts).toLocaleString()}</small></div>)}</div></div>;}
