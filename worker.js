const SEED={"items": [{"b": "shaan", "n": "مرطب شفاه فراولة 5 جم", "l": 90, "q": 50}, {"b": "shaan", "n": "سيكا كريم 60 مل", "l": 200, "q": 105}, {"b": "shaan", "n": "بدي ميلك ورد تيوليب 300 مل", "l": 200, "q": 34}, {"b": "shaan", "n": "كريم مرطب اليدين 60 جم", "l": 100, "q": 95}, {"b": "shaan", "n": "جل مرطب 200 جم", "l": 170, "q": 104}, {"b": "shaan", "n": "عناية أظافر 4 مل", "l": 160, "q": 75}, {"b": "shaan", "n": "بدي ميلك 300 مل", "l": 200, "q": 62}, {"b": "shaan", "n": "غسول وجه مضاد أكسدة 250 مل", "l": 175, "q": 101}, {"b": "shaan", "n": "كريم تجديد بشرة 120 جم", "l": 150, "q": 142}, {"b": "shaan", "n": "ميك اب ريموفر 200 مل", "l": 220, "q": 63}, {"b": "sero", "n": "بخاخ نمو شعر 200 مل", "l": 265, "q": 93}, {"b": "sero", "n": "بلسم شعر 300 مل", "l": 265, "q": 37}, {"b": "sero", "n": "شامبو طبي شعر 300 مل", "l": 265, "q": 42}, {"b": "sero", "n": "سيروم شعر 120 مل", "l": 295, "q": 35}, {"b": "sero", "n": "ماسك شعر", "l": 310, "q": 51}, {"b": "sero", "n": "ليف إن بلسم شعر 200 مل", "l": 295, "q": 66}, {"b": "sero", "n": "سيروم الرموش والحواجب", "l": 295, "q": 61}, {"b": "kids", "n": "كريم شعر 200 مل", "l": 120, "q": 30}, {"b": "kids", "n": "سبراي منعش للكيرلي 250 مل", "l": 110, "q": 22}, {"b": "kids", "n": "سبراي فك التشابك", "l": 120, "q": 60}, {"b": "kids", "n": "مناديل مبللة 72 منديل", "l": 80, "q": 40}, {"b": "kids", "n": "رول أون عطر", "l": 85, "q": 18}, {"b": "kids", "n": "صن سكرين لوشن 200 مل", "l": 275, "q": 17}, {"b": "kids", "n": "جومي فيتامينات متعددة", "l": 190, "q": 15}, {"b": "kids", "n": "جل شعر كيرلي 250 مل", "l": 120, "q": 14}, {"b": "kids", "n": "شامبو ميلك شيك فراولة", "l": 110, "q": 19}, {"b": "kids", "n": "شامبو تفاح أخضر 300 مل", "l": 125, "q": 14}, {"b": "kids", "n": "3 في 1 ميلك شيك فراولة 500 مل", "l": 200, "q": 70}, {"b": "kids", "n": "شامبو كيرلي 300 مل", "l": 140, "q": 12}], "disc": 40, "fees": [30, 50, 80], "wa": "201159117447"};
const CORS={"access-control-allow-origin":"*"};
const J=(o,s=200,x={})=>new Response(JSON.stringify(o),{status:s,headers:{"content-type":"application/json","cache-control":"no-store",...x}});
const rate=L=>L>=2000?.3:L>=1000?.25:.2;
const live=x=>x==="confirmed"||x==="delivered";
const cfg=async e=>(await e.DB.get("cfg","json"))||SEED;
const cost=(c,i)=>Math.round(c.items[i].l*(1-c.disc/100));
const put=(e,o)=>e.DB.put(o.k,JSON.stringify(o),{metadata:{t:o.t,s:o.status,n:o.name,tot:o.total,id:o.id,cost:o.cost||0}});
const S=(x,n=300)=>String(x||"").slice(0,n);
export default{async fetch(req,env){
const u=new URL(req.url),p=u.pathname,m=req.method;
if(!p.startsWith("/api/"))return env.ASSETS.fetch(req);
if(m==="OPTIONS")return new Response(null,{headers:{...CORS,"access-control-allow-headers":"content-type"}});
try{
if(p==="/api/config"){const c=await cfg(env);return J({stock:c.items.map(i=>i.q),price:c.items.map(i=>i.l),fees:c.fees,wa:c.wa},200,CORS)}
if(p==="/api/order"&&m==="POST"){
const b=JSON.parse(await req.text());
if(!b||!Array.isArray(b.items)||!b.items.length||b.items.length>40)return J({e:"bad"},400,CORS);
const c=await cfg(env);let L=0;const items=[];
for(const[i,q]of b.items){const k=+i,n=Math.floor(+q);if(!c.items[k]||!(n>0&&n<100))return J({e:"bad"},400,CORS);items.push([k,n,c.items[k].l]);L+=n*c.items[k].l}
const t=Date.now(),id=S(b.id,30);
const o={k:"o:"+String(t).padStart(14,"0")+":"+id,id,t,items,total:Math.round(L*(1-rate(L))),fee:Math.max(0,+b.fee||0),zone:S(b.zone,40),name:S(b.name,80),phone:S(b.phone,20),addr:S(b.addr),loc:S(b.loc,60),note:S(b.note),ref:S(b.ref,5),status:"new"};
await put(env,o);return J({ok:1},200,CORS)}
if(!p.startsWith("/api/admin/"))return J({e:"nf"},404);
if(!env.ADMIN_PASSWORD||req.headers.get("x-admin")!==env.ADMIN_PASSWORD)return J({e:"auth"},401);
if(p==="/api/admin/data"){const l=await env.DB.list({prefix:"o:",limit:1000});
return J({cfg:await cfg(env),orders:l.keys.map(k=>({k:k.name,...(k.metadata||{})}))})}
if(p==="/api/admin/order")return J(await env.DB.get(u.searchParams.get("k"),"json"));
if(p==="/api/admin/cfg"&&m==="POST"){const b=await req.json();
if(!Array.isArray(b.items)||b.items.length!==SEED.items.length)return J({e:"bad"},400);
const c={items:b.items.map((x,i)=>({b:SEED.items[i].b,n:SEED.items[i].n,l:Math.max(0,+x.l||0),q:Math.max(0,Math.floor(+x.q||0))})),disc:Math.min(90,Math.max(0,+b.disc||0)),fees:[0,1,2].map(i=>Math.max(0,+(b.fees||[])[i]||0)),wa:String(b.wa||"").replace(/\D/g,"")};
await env.DB.put("cfg",JSON.stringify(c));return J({ok:1})}
if(p==="/api/admin/status"&&m==="POST"){const b=await req.json();
const o=await env.DB.get(b.k,"json");if(!o||!["new","confirmed","delivered","cancelled"].includes(b.s))return J({e:"bad"},400);
const c=await cfg(env),was=o.status,to=b.s;
if(!live(was)&&live(to)){for(const[i,q]of o.items)if(c.items[i].q<q)return J({e:"stock",n:c.items[i].n},409);
o.items.forEach(([i,q])=>c.items[i].q-=q);o.cost=o.items.reduce((t,[i,q])=>t+q*cost(c,i),0);await env.DB.put("cfg",JSON.stringify(c))}
else if(live(was)&&!live(to)){o.items.forEach(([i,q])=>c.items[i].q+=q);delete o.cost;await env.DB.put("cfg",JSON.stringify(c))}
o.status=to;await put(env,o);return J({ok:1})}
return J({e:"nf"},404)}catch(e){return J({e:String(e)},500)}}}
