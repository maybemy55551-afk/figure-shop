const WORKER_URL=""; // вставьте адрес Cloudflare Worker после настройки
const $=s=>document.querySelector(s),R=n=>n.toLocaleString("ru-RU")+" ₽";
let P=[],cart=JSON.parse(localStorage.getItem("cart")||"[]");
const save=()=>{localStorage.setItem("cart",JSON.stringify(cart));draw()};
const prod=id=>P.find(p=>p.id===id);
function grid(c="all"){$("#grid").innerHTML=P.filter(p=>c==="all"||p.cat===c).map(p=>`<article class="card" data-id="${p.id}"><img src="${p.images[0]}" alt="${p.name}" loading="lazy"><div><h3>${p.name}</h3><span>${p.series}</span><b>${R(p.price)}</b></div></article>`).join("")}
function hero(){const h=P.find(p=>p.hero)||P[0];$("#hero").innerHTML=`<div><h1>${h.name}</h1><p>${h.series}. ${h.size}. ${h.desc}</p><div class="price">${R(h.price)}</div><button class="buy" data-add="${h.id}">В корзину</button></div><div class="mono" data-id="${h.id}"><img src="${h.images[0]}" alt="${h.name}"></div>`}
function open_(id){const p=prod(id);$("#ov").innerHTML=`<div class="pd"><button class="x" data-close>×</button><div><img id="big" src="${p.images[0]}" alt="${p.name}"><div class="th">${p.images.map((s,i)=>`<img src="${s}" class="${i?"":"on"}" alt="">`).join("")}</div></div><div><h2>${p.name}</h2><span>${p.series}</span><dl><dt>Размер</dt><dd>${p.size}</dd><dt>Комплектация</dt><dd>Без подарочной коробки</dd></dl><p>${p.desc}</p><div class="price">${R(p.price)}</div><button class="buy" data-add="${p.id}">В корзину</button></div></div>`;$("#ov").classList.add("on")}
function draw(){$("#cnt").textContent=cart.reduce((a,c)=>a+c.q,0);
$("#items").innerHTML=cart.length?cart.map(c=>{const p=prod(c.id);return `<div class="row"><img src="${p.images[0]}" alt=""><p>${p.name}<br>${R(p.price*c.q)}</p><button data-m="${c.id}">−</button>${c.q}<button data-p="${c.id}">+</button></div>`}).join("")+`<p><b>Итого: ${R(cart.reduce((a,c)=>a+prod(c.id).price*c.q,0))}</b></p>`:"<p>Корзина пуста. Выберите фигурку в каталоге.</p>";
$("#form").hidden=!cart.length}
document.addEventListener("click",e=>{const t=e.target,a=t.closest("[data-add]"),c=t.closest("[data-id]");
if(a){const i=cart.find(x=>x.id===a.dataset.add);i?i.q++:cart.push({id:a.dataset.add,q:1});save();$("#ov").classList.remove("on");$("#drawer").classList.add("on")}
else if(t.dataset.m||t.dataset.p){const i=cart.find(x=>x.id===(t.dataset.m||t.dataset.p));i.q+=t.dataset.p?1:-1;cart=cart.filter(x=>x.q>0);save()}
else if(t.dataset.c){document.querySelectorAll("#tabs button").forEach(b=>b.classList.toggle("on",b===t));grid(t.dataset.c)}
else if(t.closest(".th")&&t.tagName==="IMG"){$("#big").src=t.src;document.querySelectorAll(".th img").forEach(i=>i.classList.toggle("on",i===t))}
else if(t.hasAttribute("data-close")||t===$("#ov"))$("#ov").classList.remove("on");
else if(c)open_(c.dataset.id)});
$("#cartBtn").onclick=()=>$("#drawer").classList.add("on");$("#closeCart").onclick=()=>$("#drawer").classList.remove("on");
$("#form").onsubmit=async e=>{e.preventDefault();const f=Object.fromEntries(new FormData(e.target)),m=$("#msg");
if(f.site)return;if(!WORKER_URL){m.textContent="Приём заказов ещё не подключён.";return}
$("#send").disabled=true;m.textContent="Отправляем…";
try{const r=await fetch(WORKER_URL,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...f,items:cart.map(c=>({id:c.id,name:prod(c.id).name,q:c.q,price:prod(c.id).price}))})});
if(!r.ok)throw 0;cart=[];save();e.target.reset();m.textContent="Заказ принят. Мы напишем вам в Telegram и пришлём ссылку на оплату."}
catch{m.textContent="Не удалось отправить. Попробуйте ещё раз или напишите нам в Telegram."}$("#send").disabled=false};
fetch("data/products.json").then(r=>r.json()).then(d=>{P=d;hero();grid();draw()});
