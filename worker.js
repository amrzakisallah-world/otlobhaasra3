const SEED={"items": [{"b": "shaan", "n": "مرطب شفاه فراولة 5 جم", "l": 90, "q": 50}, {"b": "shaan", "n": "سيكا كريم 60 مل", "l": 200, "q": 105}, {"b": "shaan", "n": "بدي ميلك ورد تيوليب 300 مل", "l": 200, "q": 34}, {"b": "shaan", "n": "كريم مرطب اليدين 60 جم", "l": 100, "q": 95}, {"b": "shaan", "n": "جل مرطب 200 جم", "l": 170, "q": 104}, {"b": "shaan", "n": "عناية أظافر 4 مل", "l": 160, "q": 75}, {"b": "shaan", "n": "بدي ميلك 300 مل", "l": 200, "q": 62}, {"b": "shaan", "n": "غسول وجه مضاد أكسدة 250 مل", "l": 175, "q": 101}, {"b": "shaan", "n": "كريم تجديد بشرة 120 جم", "l": 150, "q": 142}, {"b": "shaan", "n": "ميك اب ريموفر 200 مل", "l": 220, "q": 63}, {"b": "sero", "n": "بخاخ نمو شعر 200 مل", "l": 265, "q": 93}, {"b": "sero", "n": "بلسم شعر 300 مل", "l": 265, "q": 37}, {"b": "sero", "n": "شامبو طبي شعر 300 مل", "l": 265, "q": 42}, {"b": "sero", "n": "سيروم شعر 120 مل", "l": 295, "q": 35}, {"b": "sero", "n": "ماسك شعر", "l": 310, "q": 51}, {"b": "sero", "n": "ليف إن بلسم شعر 200 مل", "l": 295, "q": 66}, {"b": "sero", "n": "سيروم الرموش والحواجب", "l": 295, "q": 61}, {"b": "kids", "n": "كريم شعر 200 مل", "l": 120, "q": 30}, {"b": "kids", "n": "سبراي منعش للكيرلي 250 مل", "l": 110, "q": 22}, {"b": "kids", "n": "سبراي فك التشابك", "l": 120, "q": 60}, {"b": "kids", "n": "مناديل مبللة 72 منديل", "l": 80, "q": 40}, {"b": "kids", "n": "رول أون عطر", "l": 85, "q": 18}, {"b": "kids", "n": "صن سكرين لوشن 200 مل", "l": 275, "q": 17}, {"b": "kids", "n": "جومي فيتامينات متعددة", "l": 190, "q": 15}, {"b": "kids", "n": "جل شعر كيرلي 250 مل", "l": 120, "q": 14}, {"b": "kids", "n": "شامبو ميلك شيك فراولة", "l": 110, "q": 19}, {"b": "kids", "n": "شامبو تفاح أخضر 300 مل", "l": 125, "q": 14}, {"b": "kids", "n": "3 في 1 ميلك شيك فراولة 500 مل", "l": 200, "q": 70}, {"b": "kids", "n": "شامبو كيرلي 300 مل", "l": 140, "q": 12}], "disc": 40, "fees": [30, 50, 80], "wa": "201159117447"};
const CORS={"access-control-allow-origin":"*"};
const J=(o,s=200,x={})=>new Response(JSON.stringify(o),{status:s,headers:{"content-type":"application/json","cache-control":"no-store",...x}});
const rate=L=>L>=2000?.3:L>=1000?.25:.2;
const live=x=>x==="confirmed"||x==="delivered";
const cfg=async e=>(await e.DB.get("cfg","json"))||SEED;
const cost=(c,i)=>Math.round(c.items[i].l*(1-c.disc/100));
const put=(e,o)=>e.DB.put(o.k,JSON.stringify(o),{metadata:{t:o.t,s:o.status,n:o.name,tot:o.total,id:o.id,cost:o.cost||0}});
const tot=o=>{const d=1-(o.disc||0)/100;return Math.round(o.items.reduce((t,[i,q,l])=>t+q*l,0)*d+(o.extra||[]).reduce((t,x)=>t+x.q*x.p*(x.nd?1:d),0))};
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
const o={k:"o:"+String(t).padStart(14,"0")+":"+id,id,t,items,disc:Math.round(rate(L)*100),total:Math.round(L*(1-rate(L))),fee:Math.max(0,+b.fee||0),zone:S(b.zone,40),name:S(b.name,80),phone:S(b.phone,20),addr:S(b.addr),loc:S(b.loc,60),note:S(b.note),ref:S(b.ref,5),status:"new"};
await put(env,o);return J({ok:1},200,CORS)}
if(!p.startsWith("/api/admin/"))return J({e:"nf"},404);
if(!env.ADMIN_PASSWORD||req.headers.get("x-admin")!==env.ADMIN_PASSWORD)return J({e:"auth"},401);
if(p==="/api/admin/data"){const l=await env.DB.list({prefix:"o:",limit:1000});
return J({cfg:await cfg(env),orders:l.keys.map(k=>({k:k.name,...(k.metadata||{})}))})}
if(p==="/api/admin/order")return J(await env.DB.get(u.searchParams.get("k"),"json"));
if(p==="/api/admin/cfg"&&m==="POST"){const b=await req.json();
if(!Array.isArray(b.items)||b.items.length!==SEED.items.length)return J({e:"bad"},400);
const c={items:b.items.map((x,i)=>({b:SEED.items[i].b,n:SEED.items[i].n,l:Math.max(0,+x.l||0),q:Math.max(0,Math.floor(+x.q||0))})),disc:Math.min(90,Math.max(0,+b.disc||0)),fees:[0,1,2].map(i=>Math.max(0,+(b.fees||[])[i]||0)),wa:String(b.wa||"").replace(/\D/g,""),shop:S(b.shop,60),hist:(await cfg(env)).hist||{rev:0,cost:0,n:0}};
await env.DB.put("cfg",JSON.stringify(c));return J({ok:1})}
if(p==="/api/admin/discount"&&m==="POST"){const b=await req.json(),o=await env.DB.get(b.k,"json"),d=+b.d;
if(!o||!(d>=0&&d<=90))return J({e:"bad"},400);
o.disc=d;o.total=tot(o);await put(env,o);return J({ok:1,total:o.total})}
if(p==="/api/admin/delete"&&m==="POST"){const b=await req.json(),ks=(b.ks||[]).filter(k=>String(k).startsWith("o:")).slice(0,20),c=await cfg(env);
c.hist=c.hist||{rev:0,cost:0,n:0};
for(const k of ks){const o=await env.DB.get(k,"json");if(!o)continue;if(live(o.status)){c.hist.rev+=o.total;c.hist.cost+=o.cost||0;c.hist.n++}await env.DB.delete(k)}
await env.DB.put("cfg",JSON.stringify(c));return J({ok:1})}
if(p==="/api/admin/add"&&m==="POST"){const b=await req.json(),o=await env.DB.get(b.k,"json"),q=Math.floor(+b.q);
if(!o||!(q>0&&q<1000))return J({e:"bad"},400);
if(o.disc==null){const L=o.items.reduce((t,[i,n,l])=>t+n*l,0),X=(o.extra||[]).reduce((t,x)=>t+x.q*x.p,0);o.disc=L?Math.round((1-(o.total-X)/L)*100):0}
if(b.i!=null&&b.i!==""){const c=await cfg(env),i=+b.i;if(!c.items[i])return J({e:"bad"},400);
if(live(o.status)){if(c.items[i].q<q)return J({e:"stock",n:c.items[i].n},409);c.items[i].q-=q;o.cost=(o.cost||0)+q*cost(c,i);await env.DB.put("cfg",JSON.stringify(c))}
const ex=o.items.find(x=>x[0]===i);if(ex)ex[1]+=q;else o.items.push([i,q,c.items[i].l])}
else{const n=S(b.n,80);if(!n)return J({e:"bad"},400);const pp=Math.max(0,+b.p||0),cc=Math.max(0,+b.c||0);
(o.extra=o.extra||[]).push({n,b:S(b.b,40),q,p:pp,c:cc,nd:!!b.nd});if(live(o.status))o.cost=(o.cost||0)+q*cc}
o.total=tot(o);await put(env,o);return J({ok:1,total:o.total})}
if(p==="/api/admin/rm"&&m==="POST"){const b=await req.json(),o=await env.DB.get(b.k,"json");
if(!o||o.items.length+(o.extra||[]).length<2)return J({e:"bad"},400);
if(b.t==="e"){const e=(o.extra||[])[b.x];if(!e)return J({e:"bad"},400);o.extra.splice(b.x,1);if(live(o.status))o.cost=Math.max(0,(o.cost||0)-e.q*(e.c||0))}
else{const l=o.items[b.x];if(!l)return J({e:"bad"},400);const c=await cfg(env);o.items.splice(b.x,1);
if(live(o.status)){c.items[l[0]].q+=l[1];o.cost=Math.max(0,(o.cost||0)-l[1]*cost(c,l[0]));await env.DB.put("cfg",JSON.stringify(c))}}
o.total=tot(o);await put(env,o);return J({ok:1})}
if(p==="/api/admin/status"&&m==="POST"){const b=await req.json();
const o=await env.DB.get(b.k,"json");if(!o||!["new","confirmed","delivered","cancelled"].includes(b.s))return J({e:"bad"},400);
const c=await cfg(env),was=o.status,to=b.s;
if(!live(was)&&live(to)){for(const[i,q]of o.items)if(c.items[i].q<q)return J({e:"stock",n:c.items[i].n},409);
o.items.forEach(([i,q])=>c.items[i].q-=q);o.cost=o.items.reduce((t,[i,q])=>t+q*cost(c,i),0)+(o.extra||[]).reduce((t,x)=>t+x.q*(x.c||0),0);await env.DB.put("cfg",JSON.stringify(c))}
else if(live(was)&&!live(to)){o.items.forEach(([i,q])=>c.items[i].q+=q);delete o.cost;await env.DB.put("cfg",JSON.stringify(c))}
o.status=to;await put(env,o);return J({ok:1})}
return J({e:"nf"},404)}catch(e){return J({e:String(e)},500)}}}
