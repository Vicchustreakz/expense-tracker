import {createContext,useContext,useState,ReactNode} from 'react';
const Ctx=createContext<any>(null);export const useUI=()=>useContext(Ctx);
export function UIProvider({children}:{children:ReactNode}){
 const [dlg,setDlg]=useState<{msg:string;res:(v:boolean)=>void}|null>(null),[n,setN]=useState(0);
 const confirm=(msg:string)=>new Promise<boolean>(res=>setDlg({msg,res}));
 // loader overlay while a DB write is in flight; gives up after 8s so being offline never traps the screen
 const run=async(f:()=>Promise<any>)=>{setN(x=>x+1);try{return await Promise.race([f(),new Promise(r=>setTimeout(r,8000))]);}finally{setN(x=>x-1);}};
 const close=(v:boolean)=>{dlg?.res(v);setDlg(null);};
 return <Ctx.Provider value={{confirm,run}}>{children}
  {dlg&&<div className="modal" role="alertdialog" aria-modal="true" aria-label="Confirm delete" onClick={()=>close(false)}><div className="card form" onClick={e=>e.stopPropagation()}><h3>Are you sure?</h3><p>{dlg.msg}</p><div className="row"><button className="ghost" autoFocus onClick={()=>close(false)}>Cancel</button><button className="btn danger" onClick={()=>close(true)}>Delete</button></div></div></div>}
  {n>0&&<div className="loader" role="status" aria-label="Saving"><span className="spin"/></div>}</Ctx.Provider>;}
