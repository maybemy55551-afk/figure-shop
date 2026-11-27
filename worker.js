// Cloudflare Worker: принимает заказ с сайта и шлёт его вам в Telegram.
// Переменные (Settings → Variables, тип Secret): BOT_TOKEN, CHAT_ID. Обычная: ALLOWED_ORIGIN (https://ваш-ник.github.io)
export default{async fetch(req,env){
const cors={"Access-Control-Allow-Origin":env.ALLOWED_ORIGIN,"Access-Control-Allow-Headers":"Content-Type"};
if(req.method==="OPTIONS")return new Response(null,{headers:cors});
if(req.method!=="POST"||req.headers.get("Origin")!==env.ALLOWED_ORIGIN)return new Response("no",{status:403,headers:cors});
let o;try{o=await req.json()}catch{return new Response("bad",{status:400,headers:cors})}
const s=v=>String(v||"").slice(0,200),items=(Array.isArray(o.items)?o.items:[]).slice(0,20);
if(!items.length||!o.fam||!o.phone)return new Response("bad",{status:400,headers:cors});
const sum=items.reduce((a,i)=>a+Number(i.price)*Number(i.q),0);
const text=`Новый заказ\n${items.map(i=>`• ${s(i.name)} × ${Number(i.q)} = ${Number(i.price)*Number(i.q)} ₽`).join("\n")}\nИтого: ${sum} ₽\n\nФамилия: ${s(o.fam)}\nИмя: ${s(o.name)}\nОтчество: ${s(o.otch)}\nТелефон: ${s(o.phone)}\nTelegram: ${s(o.tg)}\nEmail: ${s(o.email)}\nДоставка: ${s(o.delivery)}\nГород: ${s(o.city)}\nАдрес: ${s(o.point)}`;
const r=await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({chat_id:env.CHAT_ID,text})});
return new Response(r.ok?"ok":"fail",{status:r.ok?200:502,headers:cors})}}
