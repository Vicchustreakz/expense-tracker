import {useEffect,useState} from 'react';
import {collection,onSnapshot,setDoc,deleteDoc,doc,writeBatch} from 'firebase/firestore';
import {configured,db} from './firebase';import {categories,defaultCategories,setCategories} from './data';import type {Cat} from './types';
export function useCategories(uid:string|null){
 const live=configured&&!!uid;const [,bump]=useState(0);
 const apply=(l:Cat[])=>{setCategories(l);bump(n=>n+1);};
 useEffect(()=>{
  if(!live){apply(JSON.parse(localStorage.cats||'null')??defaultCategories);return;}
  const col=collection(db,'users',uid!,'categories');
  return onSnapshot(col,s=>{
   if(s.empty){if(!s.metadata.fromCache){const b=writeBatch(db);defaultCategories.forEach(c=>b.set(doc(col,c.id),c));b.commit();}return;}
   apply(s.docs.map(d=>({...d.data(),id:d.id} as Cat)));});},[uid,live]);
 const save=async(c:Cat)=>{if(live)await setDoc(doc(db,'users',uid!,'categories',c.id),c);
  else{const l=categories.some(x=>x.id===c.id)?categories.map(x=>x.id===c.id?c:x):[...categories,c];localStorage.cats=JSON.stringify(l);apply(l);}};
 const remove=async(id:string)=>{if(live)await deleteDoc(doc(db,'users',uid!,'categories',id));
  else{const l=categories.filter(x=>x.id!==id);localStorage.cats=JSON.stringify(l);apply(l);}};
 return {cats:categories,save,remove};}
