import {TxHelper,Format} from './helpers';
import {useEffect,useState} from 'react';
import {collection,query,where,orderBy,onSnapshot,addDoc,setDoc,deleteDoc,doc} from 'firebase/firestore';
import {configured,db} from './firebase';import type {Tx} from './types';
export const sample=(y:number,m:number):Tx[]=>{const cs=['sport','grocery','shopping','education','bills','transport'],as=['bnp','cash','citi'];
 return Array.from({length:14},(_,i)=>({id:'s'+i,date:`${y}-${TxHelper.pad(m+1)}-${TxHelper.pad(1+(i*2)%28)}`,categoryId:i===5?'salary':cs[i%cs.length],accountId:as[i%3],type:i===5?'income':'expense',amount:i===5?2180:5+(i*37)%90} as Tx));};
export function useTx(uid:string|null,y:number,m:number){
 const [tx,setTx]=useState<Tx[]>([]);const live=configured&&!!uid;
 useEffect(()=>{if(!live){setTx(sample(y,m));return;}
  const q=query(collection(db,'users',uid!,'transactions'),where('date','>=',`${y}-${TxHelper.pad(m+1)}-01`),where('date','<=',`${y}-${TxHelper.pad(m+1)}-31`),orderBy('date','desc'));
  return onSnapshot(q,s=>setTx(s.docs.map(d=>({...d.data(),id:d.id} as Tx))));},[uid,y,m,live]);
 const save=async(t:Omit<Tx,'id'>&{id?:string})=>{const {id,...r}=t;
  if(live){id?await setDoc(doc(db,'users',uid!,'transactions',id),r):await addDoc(collection(db,'users',uid!,'transactions'),r);}
  else setTx(l=>id?l.map(x=>x.id===id?{...r,id}:x):[{...r,id:'l'+Date.now()},...l]);};
 const remove=async(id:string)=>{live?await deleteDoc(doc(db,'users',uid!,'transactions',id)):setTx(l=>l.filter(x=>x.id!==id));};
 return {tx,save,remove};}
