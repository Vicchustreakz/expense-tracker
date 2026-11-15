import {useEffect,useRef,useState} from 'react';import {doc,onSnapshot,setDoc} from 'firebase/firestore';
import {configured,db} from './firebase';import {setCurrency} from './data';
export interface S{mode?:string;accent?:string;currency?:string;name?:string;photo?:string;gradient?:string}
export function useSettings(uid:string|null){
 const live=configured&&!!uid;const [s,setS]=useState<S>({});
 const latest=useRef<S>({}),pend=useRef<S>({}),t=useRef<any>();
 useEffect(()=>{if(!live){latest.current=JSON.parse(localStorage.settings||'{}');setS(latest.current);return;}
  return onSnapshot(doc(db,'users',uid!,'settings','app'),d=>{latest.current=(d.data()??{}) as S;setS(latest.current);});},[uid,live]);
 setCurrency(s.currency||'$'); // applied during render so every screen below sees it immediately
 const save=(p:S)=>{latest.current={...latest.current,...p};setS(latest.current);
  if(!live){localStorage.settings=JSON.stringify(latest.current);return;}
  Object.assign(pend.current,p);clearTimeout(t.current); // debounced to stay inside Firestore's free write quota
  t.current=setTimeout(()=>{setDoc(doc(db,'users',uid!,'settings','app'),pend.current,{merge:true});pend.current={};},600);};
 return {...s,save};}
