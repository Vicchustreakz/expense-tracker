import {TxHelper,Format} from './helpers';
import {useEffect,useState} from 'react';
import {doc,onSnapshot,setDoc,getDoc,getDocs,collection,query,where} from 'firebase/firestore';
import {configured,db} from './firebase';import {sample} from './useTx';import type {Tx} from './types';
type M={carried:number;salary:number};
const demo=(y:number,m:number):M=>JSON.parse(localStorage['mo'+TxHelper.monthKey(y,m)]||'{"carried":0,"salary":0}');
export function useMonth(uid:string|null,y:number,m:number){
 const live=configured&&!!uid;const [mo,setMo]=useState<M>({carried:0,salary:0});
 useEffect(()=>{if(!live){setMo(demo(y,m));return;}
  return onSnapshot(doc(db,'users',uid!,'months',TxHelper.monthKey(y,m)),s=>setMo({carried:0,salary:0,...(s.data() as any)}));},[uid,y,m,live]);
 const save=async(v:M)=>{if(live)await setDoc(doc(db,'users',uid!,'months',TxHelper.monthKey(y,m)),v);else{localStorage['mo'+TxHelper.monthKey(y,m)]=JSON.stringify(v);setMo(v);}};
 const prevClosing=async()=>{const py=m?y:y-1,pm=m?m-1:11,k=TxHelper.monthKey(py,pm);let pv:M,tx:Tx[];
  if(live){pv={carried:0,salary:0,...((await getDoc(doc(db,'users',uid!,'months',k))).data() as any)};
   tx=(await getDocs(query(collection(db,'users',uid!,'transactions'),where('date','>=',k+'-01'),where('date','<=',k+'-31')))).docs.map(d=>d.data() as Tx);}
  else{pv=demo(py,pm);tx=sample(py,pm);}
  return pv.carried+pv.salary+TxHelper.netChange(tx);};
 return {...mo,save,prevClosing};}
