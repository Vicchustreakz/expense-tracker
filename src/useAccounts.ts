import {useEffect,useState} from 'react';
import {collection,onSnapshot,setDoc,deleteDoc,doc,writeBatch} from 'firebase/firestore';
import {configured,db} from './firebase';import {accounts,defaultAccounts,setAccounts} from './data';import type {Acc} from './types';
export function useAccounts(uid:string|null){
 const live=configured&&!!uid;const [,bump]=useState(0);
 const apply=(l:Acc[])=>{setAccounts(l);bump(n=>n+1);};
 useEffect(()=>{
  if(!live){apply(JSON.parse(localStorage.accs||'null')??defaultAccounts);return;}
  const col=collection(db,'users',uid!,'accounts');
  return onSnapshot(col,s=>{
   if(s.empty){if(!s.metadata.fromCache){const b=writeBatch(db);defaultAccounts.forEach(c=>b.set(doc(col,c.id),c));b.commit();}return;}
   apply(s.docs.map(d=>({...d.data(),id:d.id} as Acc)));});},[uid,live]);
 const save=async(c:Acc)=>{if(live)await setDoc(doc(db,'users',uid!,'accounts',c.id),c);
  else{const l=accounts.some(x=>x.id===c.id)?accounts.map(x=>x.id===c.id?c:x):[...accounts,c];localStorage.accs=JSON.stringify(l);apply(l);}};
 const remove=async(id:string)=>{if(live)await deleteDoc(doc(db,'users',uid!,'accounts',id));
  else{const l=accounts.filter(x=>x.id!==id);localStorage.accs=JSON.stringify(l);apply(l);}};
 return {accs:accounts,save,remove};}
