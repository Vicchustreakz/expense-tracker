import {useEffect,useState} from 'react';import {collection,query,orderBy,limit,onSnapshot,addDoc} from 'firebase/firestore';
import {configured,db} from './firebase';
export interface H{id:string;ts:number;action:string;kind:string;summary:string}
export function useHistory(uid:string|null){
 const live=configured&&!!uid;const [items,setItems]=useState<H[]>([]);
 useEffect(()=>{if(!live){setItems(JSON.parse(localStorage.hist||'[]'));return;}
  return onSnapshot(query(collection(db,'users',uid!,'history'),orderBy('ts','desc'),limit(100)),s=>setItems(s.docs.map(d=>({...d.data(),id:d.id} as H))));},[uid,live]);
 const log=async(action:string,kind:string,summary:string)=>{const h={ts:Date.now(),action,kind,summary};
  if(live)await addDoc(collection(db,'users',uid!,'history'),h);
  else{const l=[{...h,id:'h'+h.ts},...JSON.parse(localStorage.hist||'[]')].slice(0,100);localStorage.hist=JSON.stringify(l);setItems(l);}};
 return {items,log};}
