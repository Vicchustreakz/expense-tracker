import {initializeApp} from 'firebase/app';import {getAuth} from 'firebase/auth';
import {initializeFirestore,persistentLocalCache,persistentMultipleTabManager} from 'firebase/firestore';
const e=import.meta.env;
export const configured=!!e.VITE_FB_API_KEY;
const app=configured?initializeApp({apiKey:e.VITE_FB_API_KEY,authDomain:e.VITE_FB_AUTH_DOMAIN,projectId:e.VITE_FB_PROJECT_ID,appId:e.VITE_FB_APP_ID}):null;
export const auth=app?getAuth(app):(null as any);
export const db=app?initializeFirestore(app,{localCache:persistentLocalCache({tabManager:persistentMultipleTabManager()})}):(null as any);
