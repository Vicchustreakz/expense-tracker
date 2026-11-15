import {Dumbbell,ShoppingCart,ShoppingBag,GraduationCap,Home,Wallet,Gamepad2,Bus,Utensils,Coffee,Car,Heart,Plane,Gift,Smartphone,Music,Shirt,Fuel,Baby,PawPrint,Briefcase,Stethoscope,Zap,Tag,Landmark,Banknote,CreditCard,PiggyBank} from 'lucide-react';
import type {Cat,Acc} from './types';
export const icons:Record<string,any>={Dumbbell,ShoppingCart,ShoppingBag,GraduationCap,Home,Wallet,Gamepad2,Bus,Utensils,Coffee,Car,Heart,Plane,Gift,Smartphone,Music,Shirt,Fuel,Baby,PawPrint,Briefcase,Stethoscope,Zap,Tag,Landmark,Banknote,CreditCard,PiggyBank};
export const defaultCategories:Cat[]=[
{id:'sport',name:'Sport',tag:'#gym',icon:'Dumbbell',color:'#ec4899',type:'expense'},
{id:'grocery',name:'Grocery',tag:'#supermarket',icon:'ShoppingCart',color:'#a855f7',type:'expense'},
{id:'shopping',name:'Shopping',tag:'#wishlist',icon:'ShoppingBag',color:'#10b981',type:'expense'},
{id:'education',name:'Education',tag:'#courses',icon:'GraduationCap',color:'#06b6d4',type:'expense'},
{id:'bills',name:'Home bills',tag:'#electricity',icon:'Home',color:'#f59e0b',type:'expense'},
{id:'salary',name:'Salary',tag:'#main_job',icon:'Wallet',color:'#34c58a',type:'income'},
{id:'fun',name:'Entertainment',tag:'#subscription',icon:'Gamepad2',color:'#eab308',type:'expense'},
{id:'transport',name:'Transport',tag:'#monthly_ticket',icon:'Bus',color:'#94a3b8',type:'expense'}];
// Live list shared by all screens; useCategories() replaces its contents and re-renders the app.
export const categories:Cat[]=[...defaultCategories];
export const setCategories=(l:Cat[])=>{categories.splice(0,categories.length,...l);};
export const catOf=(id:string):Cat=>categories.find(c=>c.id===id)??{id,name:'Uncategorized',tag:'',icon:'Tag',color:'#94a3b8',type:'expense'};
export const defaultAccounts:Acc[]=[
{id:'bnp',name:'BNP Bank',type:'bank',icon:'Landmark',color:'#6d5dfc',opening:0},
{id:'cash',name:'Cash',type:'cash',icon:'Banknote',color:'#34c58a',opening:0},
{id:'citi',name:'Citi Bank',type:'bank',icon:'Landmark',color:'#06b6d4',opening:0}];
export const accounts:Acc[]=[...defaultAccounts];
export const setAccounts=(l:Acc[])=>{accounts.splice(0,accounts.length,...l);};
export const accOf=(id:string):Acc=>accounts.find(a=>a.id===id)??{id,name:'Deleted account',type:'bank',icon:'Landmark',color:'#94a3b8',opening:0};
export const GRADS:Record<string,[string,string]>={ocean:['#6d5dfc','#06b6d4'],sunset:['#f59e0b','#ec4899'],forest:['#10b981','#06b6d4'],berry:['#a855f7','#ec4899']};
export const TS={background:'var(--card)',border:'1px solid var(--line)',borderRadius:10,color:'var(--text)'};
let currency='$';export const setCurrency=(c:string)=>{currency=c;};export const curr=()=>currency;
