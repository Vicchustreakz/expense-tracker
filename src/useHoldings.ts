import {useEffect,useState} from 'react';import {collection,onSnapshot,addDoc,setDoc,deleteDoc,doc} from 'firebase/firestore';
import {configured,db} from './firebase';
export interface Hold{id:string;symbol:string;name:string;qty:number;avg:number}
export function useHoldings(uid:string|null){
 const live=configured&&!!uid;const [list,setList]=useState<Hold[]>([]);
 useEffect(()=>{if(!live){setList(JSON.parse(localStorage.hold||'[]'));return;}
  return onSnapshot(collection(db,'users',uid!,'holdings'),s=>setList(s.docs.map(d=>({...d.data(),id:d.id} as Hold))));},[uid,live]);
 const local=(l:Hold[])=>{localStorage.hold=JSON.stringify(l);setList(l);};
 const save=async(h:Omit<Hold,'id'>&{id?:string})=>{const {id,...r}=h;
  if(live){id?await setDoc(doc(db,'users',uid!,'holdings',id),r):await addDoc(collection(db,'users',uid!,'holdings'),r);}
  else local(id?list.map(x=>x.id===id?{...r,id}:x):[...list,{...r,id:'h'+Date.now()}]);};
 const remove=async(id:string)=>{live?await deleteDoc(doc(db,'users',uid!,'holdings',id)):local(list.filter(x=>x.id!==id));};
 return {list,save,remove};}
