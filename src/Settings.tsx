import {useEffect,useState} from 'react';import {Sun,Moon} from 'lucide-react';import type {User} from 'firebase/auth';import {GRADS} from './data';import {ThemeToggle} from './components';import type {S} from './useSettings';
const SW=['#6d5dfc','#06b6d4','#34c58a','#eab308','#f59e0b','#ef5b6b','#ec4899','#a855f7'];
const CUR=['$','€','£','₹','¥'];
export default function Settings({st,save,mode,accent,onMode,onAccent,user}:{st:S;save:(p:S)=>void;mode:string;accent:string;onMode:(v:string)=>void;onAccent:(v:string)=>void;user:User|null}){
 const [name,setName]=useState(st.name??'');useEffect(()=>setName(st.name??''),[st.name]);
 const c=st.currency||'$';
 const pick=(f:File)=>{const img=new Image();img.onload=()=>{const k=document.createElement('canvas');k.width=k.height=128;const s=Math.min(img.width,img.height);k.getContext('2d')!.drawImage(img,(img.width-s)/2,(img.height-s)/2,s,s,0,0,128,128);save({photo:k.toDataURL('image/jpeg',.8)});URL.revokeObjectURL(img.src);};img.src=URL.createObjectURL(f);};
 return <div className="bal">
  <div className="card"><h3>Appearance</h3><p className="muted">Saved to your account, so every device uses the same look.</p>
   <ThemeToggle mode={mode} onChange={onMode}/>
   <p className="muted">Accent color</p>
   <div className="sw">{SW.map(x=><button key={x} aria-label={x} className={accent===x?'on':''} style={{background:x}} onClick={()=>onAccent(x)}/>)}<input type="color" value={accent} onChange={e=>onAccent(e.target.value)} aria-label="Custom accent color"/></div></div>
  <div className="card"><h3>Gradient</h3><p className="muted">Adds a gradient to buttons, the sidebar and headings.</p><div className="sw"><button className={'ghost'+(!st.gradient?' on':'')} aria-pressed={!st.gradient} onClick={()=>save({gradient:''})}>None</button>{Object.entries(GRADS).map(([n,g])=><button key={n} aria-label={n+' gradient'} className={st.gradient===n?'on':''} style={{background:`linear-gradient(135deg,${g[0]},${g[1]})`,width:34,height:34}} onClick={()=>save({gradient:n})}/>)}</div></div>
  <div className="card"><h3>Currency</h3><p className="muted">Shown after every amount.</p>
   <div className="row">{CUR.map(x=><button key={x} className={'ghost'+(c===x?' on':'')} aria-pressed={c===x} onClick={()=>save({currency:x})}>{x}</button>)}
    <input style={{width:80}} maxLength={4} aria-label="Custom currency symbol" placeholder="Custom" value={CUR.includes(c)?'':c} onChange={e=>save({currency:e.target.value||'$'})}/></div></div>
  <div className="card"><h3>Profile</h3><div className="row"><span className="avp">{(st.photo||user?.photoURL)?<img src={st.photo||user?.photoURL||''} alt="" width={56} height={56}/>:(st.name||'D')[0]}</span><label className="ghost file">Upload photo<input hidden type="file" accept="image/*" onChange={e=>e.target.files?.[0]&&pick(e.target.files[0])}/></label>{st.photo&&<button className="ghost" onClick={()=>save({photo:''})}>Remove</button>}</div>
   <label>Display name<input value={name} placeholder={user?.displayName??'Your name'} onChange={e=>setName(e.target.value)} onBlur={()=>name!==(st.name??'')&&save({name})}/></label>
   <p className="muted">{user?.email?`Signed in with Google as ${user.email}.`:'Demo mode. Sign in with Google to sync these settings across devices.'}</p></div></div>;}
