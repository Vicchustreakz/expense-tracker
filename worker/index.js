// Cloudflare Worker: small CORS proxy for Yahoo Finance (unofficial, no key). NSE = .NS, BSE = .BO
const H={'access-control-allow-origin':'*','content-type':'application/json'},UA={'user-agent':'Mozilla/5.0'};
export default{async fetch(req){const u=new URL(req.url);
 if(u.pathname==='/search'){try{const r=await fetch(`https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(u.searchParams.get('q')||'')}&quotesCount=15&newsCount=0`,{headers:UA});const j=await r.json();
  return new Response(JSON.stringify((j.quotes||[]).filter(x=>/\.(NS|BO)$/.test(x.symbol||'')).map(x=>({symbol:x.symbol,name:x.shortname||x.longname||x.symbol,exchange:x.symbol.endsWith('.NS')?'NSE':'BSE'}))),{headers:H});}catch{return new Response('[]',{headers:H});}}
 if(u.pathname==='/quote'){const syms=(u.searchParams.get('symbols')||'').split(',').filter(Boolean).slice(0,40);
  const out=await Promise.all(syms.map(async s=>{try{const r=await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(s)}?interval=1d&range=1d`,{headers:UA});const m=(await r.json()).chart.result[0].meta;
   return {symbol:s,price:m.regularMarketPrice,prev:m.previousClose??m.chartPreviousClose,high:m.regularMarketDayHigh,low:m.regularMarketDayLow};}catch{return {symbol:s};}}));
  return new Response(JSON.stringify(out),{headers:H});}
 return new Response('ok',{headers:H});}};
