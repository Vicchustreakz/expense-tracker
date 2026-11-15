export type TxType='expense'|'income'|'transfer';
export interface Tx{id:string;date:string;categoryId:string;accountId:string;type:TxType;amount:number;note?:string;toAccountId?:string}
export interface Cat{id:string;name:string;tag:string;icon:string;color:string;type:'expense'|'income'}
export interface Acc{id:string;name:string;type:'bank'|'cash'|'card'|'wallet'|'savings';icon:string;color:string;opening:number}
