
const $=(s,e=document)=>e.querySelector(s), $$=(s,e=document)=>[...e.querySelectorAll(s)];
const STORE="everest_v03", SESSION="everest_v03_session";
let state=JSON.parse(localStorage.getItem(STORE)||'{"users":{},"session":null}');
let view="everest", step=0;
const save=()=>localStorage.setItem(STORE,JSON.stringify(state));
const uid=()=>Math.random().toString(36).slice(2)+Date.now().toString(36);
const esc=(v="")=>String(v).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
const hash=s=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return(h>>>0).toString(16)};
const iso=()=>new Date().toISOString().slice(0,10);
const fmt=d=>d?new Date(d+"T00:00:00").toLocaleDateString("ru-RU",{day:"numeric",month:"short",year:"numeric"}):"—";
const initials=n=>(n||"U").trim().split(/\s+/).slice(0,2).map(x=>x[0]?.toUpperCase()).join("");
const me=()=>state.session?state.users[state.session]:null;
function toast(t){const x=$("#toast");x.textContent=t;x.classList.add("show");setTimeout(()=>x.classList.remove("show"),1800)}
function icon(){return `<svg viewBox="0 0 64 64" fill="none"><path d="M4 52 25 16l8 14 7-10 20 32H4Z" fill="#fff"/><path d="m20 25 5-9 8 14 7-10 8 13-9-6-6 8-8-7-5 8Z" fill="#171717"/></svg>`}
function season(){
 const m=new Date().getMonth()+1;
 if([12,1,2].includes(m))return["winter","Зима · снег"];
 if([3,4,5].includes(m))return["spring","Весна · облачно"];
 if([6,7,8].includes(m))return["summer","Лето · ясно"];
 return["autumn","Осень · дымка"];
}
function encodeShare(obj){return btoa(unescape(encodeURIComponent(JSON.stringify(obj))))}
function decodeShare(s){try{return JSON.parse(decodeURIComponent(escape(atob(s))))}catch{return null}}
function maybePublic(){
 const m=location.hash.match(/^#share=(.+)$/);
 if(!m)return false;
 const data=decodeShare(m[1]);
 if(!data)return false;
 renderPublic(data); return true;
}
function render(){
 if(maybePublic())return;
 const u=me();
 if(!u)return auth();
 if(!u.goal)return onboarding();
 app();
}
function auth(mode="register"){
 $("#app").innerHTML=`<div class="auth"><div class="auth-card">
 <div class="auth-logo">${icon()}</div>
 <div class="eyebrow">ТВОЙ ЭВЕРЕСТ</div>
 <h1>Ставим свой Эверест на 10 лет.</h1>
 <p style="color:var(--muted);line-height:1.55">Не тысяча задач. Одна большая вершина, несколько лагерей и следующий участок пути.</p>
 <div class="actions" style="margin:20px 0">
   <button class="btn ${mode==="register"?"dark":""}" data-mode="register">Создать профиль</button>
   <button class="btn ${mode==="login"?"dark":""}" data-mode="login">Войти</button>
 </div>
 <form id="authf" class="form">
 ${mode==="register"?`<div><label>Имя</label><input name="name" required placeholder="Алексей"></div><div><label>Публичный ник</label><input name="handle" placeholder="gorsky"></div>`:""}
 <div><label>Email</label><input type="email" name="email" required placeholder="you@example.com"></div>
 <div><label>Пароль</label><input type="password" name="password" minlength="4" required></div>
 <button class="btn primary">${mode==="register"?"Поставить свой Эверест":"Войти"}</button>
 </form>
 <p class="small-note" style="margin-top:17px">V0.3 — прототип. Сейчас данные сохраняются в браузере. Публичные ссылки работают как “снимок” цели; после публикации сайта их можно открывать с любого телефона.</p>
 </div></div>`;
 $$("[data-mode]").forEach(b=>b.onclick=()=>auth(b.dataset.mode));
 $("#authf").onsubmit=e=>{
   e.preventDefault(); const f=new FormData(e.currentTarget), email=String(f.get("email")).trim().toLowerCase(), pass=String(f.get("password"));
   if(mode==="register"){
     if(state.users[email])return alert("Такой профиль уже есть.");
     state.users[email]={id:uid(),email,name:String(f.get("name")).trim(),handle:String(f.get("handle")||"").trim().replace(/^@/,""),passwordHash:hash(pass),links:[],public:true,goal:null};
     state.session=email;save();render();
   }else{
     const u=state.users[email]; if(!u||u.passwordHash!==hash(pass))return alert("Неверные данные");
     state.session=email;save();render();
   }
 }
}
function onboarding(){
 const u=me(),d=u.draft||{};
 $("#app").innerHTML=`<div class="auth"><div class="auth-card" style="width:min(650px,100%)">
 <div class="auth-logo">${icon()}</div><div class="eyebrow">ЭКСПЕДИЦИЯ</div>
 <div class="stepdots">${[0,1,2].map(i=>`<span class="${i<=step?"on":""}"></span>`).join("")}</div>
 <form id="onb" class="form">
 <div style="${step===0?"":"display:none"}">
   <h1 style="font-size:48px">Ставим свой Эверест на 10 лет.</h1>
   <p style="color:var(--muted)">Что должно стать правдой через 10 лет, чтобы ты сказал: “я поднялся на свою вершину”?</p>
   <label>Мой Эверест</label><textarea name="title" placeholder="Например: построить компанию мирового уровня">${esc(d.title||"")}</textarea>
   <label>Почему мне это важно</label><textarea name="why" placeholder="Коротко. Без красивой воды.">${esc(d.why||"")}</textarea>
 </div>
 <div style="${step===1?"":"display:none"}">
   <h1 style="font-size:48px">Разбиваем путь на лагеря.</h1>
   <div class="form-grid"><div><label>Старт</label><input type="date" name="start" value="${d.start||iso()}"></div><div><label>Горизонт, лет</label><input type="number" name="years" min="1" max="30" value="${d.years||10}"></div></div>
   <label>Количество лагерей</label><input type="number" name="camps" min="3" max="8" value="${d.camps||5}">
   <p class="small-note">Не обязаны быть по году. После создания ты сможешь поставить каждому лагерю свою дату.</p>
 </div>
 <div style="${step===2?"":"display:none"}">
   <h1 style="font-size:48px">Теперь только первый участок.</h1>
   <label>Что означает “я дошёл до первого лагеря”?</label><textarea name="first" placeholder="Проверяемый результат">${esc(d.first||"")}</textarea>
   <label>Главное действие сейчас</label><input name="next" placeholder="Одно действие" value="${esc(d.next||"")}">
 </div>
 <div class="actions">${step?`<button type="button" class="btn" id="back">Назад</button>`:""}<button class="btn primary">${step<2?"Дальше":"Создать маршрут"}</button></div>
 </form></div></div>`;
 if($("#back"))$("#back").onclick=()=>{step--;onboarding()};
 $("#onb").onsubmit=e=>{
   e.preventDefault(); const f=new FormData(e.currentTarget); u.draft={...d};
   for(const[k,v]of f.entries())if(v!=="")u.draft[k]=v;
   if(step<2){step++;save();return onboarding()}
   const years=+u.draft.years||10,n=Math.min(8,Math.max(3,+u.draft.camps||5)),start=u.draft.start||iso(),sd=new Date(start+"T00:00:00");
   const camps=[];
   for(let i=1;i<=n;i++){const dt=new Date(sd);dt.setMonth(dt.getMonth()+Math.round(years*12*i/n));camps.push({id:uid(),name:i===n?"Вершина":`Лагерь ${i}`,date:dt.toISOString().slice(0,10),desc:i===1?(u.draft.first||""):"",status:i===1?"current":"planned"})}
   u.goal={title:u.draft.title||"Мой Эверест",why:u.draft.why||"",start,years,camps,next:u.draft.next||""};delete u.draft;save();render();
 }
}
function currentIndex(g){let i=g.camps.findIndex(c=>c.status==="current");if(i>=0)return i;return g.camps.length-1}
function positions(n){
 const p=[[18,82],[31,72],[46,61],[59,49],[69,40],[77,31],[84,23],[88,16]];
 return Array.from({length:n},(_,i)=>p[Math.round(i*(p.length-1)/(n-1))]);
}
function mountain(){
 return `<svg class="mountain-svg" viewBox="0 0 1200 760" preserveAspectRatio="none">
 <defs>
   <linearGradient id="faceA" x1=".2" y1=".1" x2=".8" y2=".95"><stop stop-color="#9da1a4"/><stop offset=".45" stop-color="#656a6d"/><stop offset="1" stop-color="#3f4346"/></linearGradient>
   <linearGradient id="faceB" x1=".8" y1=".1" x2=".2" y2="1"><stop stop-color="#c1c4c6"/><stop offset=".55" stop-color="#7c8083"/><stop offset="1" stop-color="#4e5255"/></linearGradient>
   <linearGradient id="snow" x1=".4" y1="0" x2=".6" y2="1"><stop stop-color="#ffffff"/><stop offset=".75" stop-color="#e9ecee"/><stop offset="1" stop-color="#d3d7da"/></linearGradient>
   <filter id="soft"><feGaussianBlur stdDeviation="7"/></filter>
 </defs>
 <ellipse cx="660" cy="720" rx="500" ry="36" fill="rgba(72,73,71,.2)" filter="url(#soft)"/>
 <path d="M0 760 155 625 280 583 373 493 449 540 560 421 633 465 733 323 793 369 900 172 960 261 1032 363 1200 547 1200 760Z" fill="url(#faceA)"/>
 <path d="M155 625 280 583 373 493 449 540 560 421 633 465 733 323 705 561 570 652 395 698Z" fill="#595e61" opacity=".55"/>
 <path d="M733 323 793 369 900 172 960 261 1032 363 961 338 912 431 845 361 778 504 705 561Z" fill="url(#faceB)" opacity=".94"/>
 <path d="M816 292 900 172 960 261 987 300 948 280 911 338 881 291 842 351 804 333Z" fill="url(#snow)"/>
 <path d="M676 381 733 323 793 369 775 414 747 391 721 431Z" fill="#f7f8f8" opacity=".86"/>
 <path d="M519 464 560 421 633 465 606 500 570 478 546 510Z" fill="#f4f5f6" opacity=".65"/>
 <path d="M170 625 C330 585, 460 532, 570 472 C690 406, 782 338, 900 172" class="route-line"/>
 </svg>`;
}
function app(){
 const u=me(),g=u.goal,ci=currentIndex(g),[s,slab]=season(),pos=positions(g.camps.length);
 $("#app").innerHTML=`<div class="shell">
 <header class="topbar"><div class="brand"><div class="brandmark">${icon()}</div><div>EVEREST<small>big goal system</small></div></div>
 <nav class="nav"><button class="${view==="everest"?"active":""}" data-v="everest">Эверест</button><button class="${view==="profile"?"active":""}" data-v="profile">Профиль</button></nav>
 <div class="avatar">${initials(u.name)}</div></header>
 ${view==="everest"?`<main>
 <section class="hero season-${s}">
   <div class="sky"><div class="sun"></div><div class="cloud c1"></div><div class="cloud c2"></div></div><div class="weather-snow"></div>
   <div class="weather-label">${slab}</div>
   <div class="hero-copy"><div class="eyebrow">МОЙ ЭВЕРЕСТ · ${g.years} ЛЕТ</div><h1>${esc(g.title)}</h1><div class="hero-sub">${esc(g.why||"Вершина задаёт направление. Лагерь говорит, куда идти сейчас.")}</div></div>
   <div class="mountain-wrap">${mountain()}
   ${g.camps.map((c,i)=>{const[x,y]=pos[i],cl=i<ci?"reached":i===ci?"current":"";return `<button class="camp ${cl}" data-camp="${c.id}" style="left:${x}%;top:${y}%;border:0;background:transparent;padding:0"><span class="camp-dot"></span><span class="camp-label">${esc(c.name)}</span></button>`}).join("")}
   <div class="summit-flag"><div class="flagpole"></div><div class="flag"></div></div>
   </div>
   <div class="bottom-card">
    <div><div class="title">Сейчас · ${esc(g.camps[ci].name)}</div><div class="value">${esc(g.next||g.camps[ci].desc||"Определи следующий шаг")}</div></div>
    <div><div class="title">Маршрут</div><div class="progress"><span style="width:${Math.round((ci)/(g.camps.length-1)*100)}%"></span></div><div class="small-note" style="margin-top:5px">${ci+1} из ${g.camps.length} лагерей · следующий дедлайн ${fmt(g.camps[ci].date)}</div></div>
    <button class="btn primary" id="editNow">Настроить</button>
   </div>
 </section>
 </main>`:profile(u,g,ci)}
 </div>`;
 $$("[data-v]").forEach(b=>b.onclick=()=>{view=b.dataset.v;app()});
 $$("[data-camp]").forEach(b=>b.onclick=()=>campModal(b.dataset.camp));
 if($("#editNow"))$("#editNow").onclick=()=>campModal(g.camps[ci].id);
 bindProfile();
}
function profile(u,g,ci){
 return `<main><div class="profile-grid">
 <section class="panel profile-main"><div class="avatar-xl">${initials(u.name)}</div><div class="profile-name">${esc(u.name)}</div><div class="handle">@${esc(u.handle||"yourname")}</div>
 <div class="socials">${(u.links||[]).map(l=>`<a class="social-chip" target="_blank" rel="noopener" href="${esc(l.url)}">${esc(l.label)}</a>`).join("")||`<span class="small-note">Добавь Telegram, YouTube и другие ссылки</span>`}</div>
 <div class="actions" style="justify-content:center"><button class="btn" id="editProfile">Редактировать профиль</button></div>
 <div class="public-card"><div class="eyebrow">PUBLIC GOAL</div><div class="switchline"><div><strong>Показывать путь публично</strong><div class="small-note" style="color:#aaa;margin-top:4px">Люди увидят вершину, лагеря и твой прогресс.</div></div><button class="switch ${u.public?"on":""}" id="publicSwitch"></button></div>
 <button class="btn primary" id="shareGoal" style="width:100%">Скопировать публичную ссылку</button></div></section>
 <section>
  <div class="panel"><div class="eyebrow">МОЯ ВЕРШИНА</div><div class="goal-summary">${esc(g.title)}</div>
  <div class="metric-grid"><div class="metric"><strong>${g.years}</strong><span>ЛЕТ ДО ГОРИЗОНТА</span></div><div class="metric"><strong>${ci+1}/${g.camps.length}</strong><span>ТЕКУЩИЙ ЛАГЕРЬ</span></div><div class="metric"><strong>${fmt(g.camps.at(-1).date).split(" ")[2]||"—"}</strong><span>ГОД ВЕРШИНЫ</span></div></div>
  </div>
  <div class="panel route-card"><div class="eyebrow">МАРШРУТ</div><div class="route-list">${g.camps.map((c,i)=>`<div class="route-item ${i<ci?"reached":i===ci?"current":""}"><div class="route-num">${i===g.camps.length-1?"▲":i+1}</div><div><strong>${esc(c.name)}</strong><p>${esc(c.desc||"Результат лагеря пока не описан")}</p></div><span class="badge">${fmt(c.date)}</span></div>`).join("")}</div></div>
 </section></div></main>`;
}
function bindProfile(){
 if(!$("#publicSwitch"))return;
 $("#publicSwitch").onclick=()=>{const u=me();u.public=!u.public;save();app()};
 $("#shareGoal").onclick=()=>{
   const u=me(); if(!u.public)return toast("Сначала сделай цель публичной");
   const data={name:u.name,handle:u.handle,links:u.links||[],goal:u.goal};
   const url=location.origin+location.pathname+"#share="+encodeShare(data);
   navigator.clipboard?.writeText(url).then(()=>toast("Публичная ссылка скопирована")).catch(()=>prompt("Скопируй ссылку",url));
 };
 $("#editProfile").onclick=()=>profileModal();
}
function profileModal(){
 const u=me();
 const links=(u.links||[]), tg=links.find(x=>x.label==="Telegram")?.url||"", yt=links.find(x=>x.label==="YouTube")?.url||"", other=links.find(x=>x.label==="Сайт")?.url||"";
 modal(`<div class="eyebrow">ПРОФИЛЬ</div><h2>Ссылки и имя</h2><form class="form" id="pf">
 <div class="form-grid"><div><label>Имя</label><input name="name" value="${esc(u.name)}"></div><div><label>Ник</label><input name="handle" value="${esc(u.handle||"")}"></div></div>
 <div><label>Telegram</label><input name="tg" placeholder="https://t.me/..." value="${esc(tg)}"></div>
 <div><label>YouTube</label><input name="yt" placeholder="https://youtube.com/@..." value="${esc(yt)}"></div>
 <div><label>Сайт / другая ссылка</label><input name="other" placeholder="https://..." value="${esc(other)}"></div>
 <div class="actions"><button type="button" class="btn" data-close>Отмена</button><button class="btn primary">Сохранить</button></div></form>`,d=>{
   $("[data-close]",d).onclick=()=>d.remove();
   $("#pf",d).onsubmit=e=>{e.preventDefault();const f=new FormData(e.currentTarget);u.name=f.get("name");u.handle=String(f.get("handle")||"").replace(/^@/,"");u.links=[];if(f.get("tg"))u.links.push({label:"Telegram",url:f.get("tg")});if(f.get("yt"))u.links.push({label:"YouTube",url:f.get("yt")});if(f.get("other"))u.links.push({label:"Сайт",url:f.get("other")});save();d.remove();app()}
 });
}
function campModal(id){
 const u=me(),g=u.goal,c=g.camps.find(x=>x.id===id),ci=currentIndex(g),idx=g.camps.indexOf(c);
 modal(`<div class="eyebrow">${idx===g.camps.length-1?"ВЕРШИНА":"ЛАГЕРЬ "+(idx+1)}</div><h2>${esc(c.name)}</h2>
 <form class="form" id="cf"><div><label>Название</label><input name="name" value="${esc(c.name)}"></div><div><label>Как выглядит достигнутый результат?</label><textarea name="desc">${esc(c.desc||"")}</textarea></div><div><label>Дата</label><input type="date" name="date" value="${c.date}"></div>${idx===ci?`<div><label>Главное действие сейчас</label><input name="next" value="${esc(g.next||"")}"></div>`:""}
 <div class="actions"><button type="button" class="btn" data-close>Закрыть</button><button class="btn primary">Сохранить</button>${idx===ci&&idx<g.camps.length-1?`<button type="button" class="btn dark" id="done">Лагерь достигнут</button>`:""}</div></form>`,d=>{
   $("[data-close]",d).onclick=()=>d.remove();
   if($("#done",d))$("#done",d).onclick=()=>{g.camps.forEach((x,i)=>x.status=i<=idx?"reached":i===idx+1?"current":"planned");save();d.remove();app()};
   $("#cf",d).onsubmit=e=>{e.preventDefault();const f=new FormData(e.currentTarget);c.name=f.get("name");c.desc=f.get("desc");c.date=f.get("date");if(f.has("next"))g.next=f.get("next");save();d.remove();app()}
 });
}
function modal(html,bind){
 const d=document.createElement("div");d.className="modal-bg";d.innerHTML=`<div class="modal">${html}</div>`;document.body.appendChild(d);d.onclick=e=>{if(e.target===d)d.remove()};bind?.(d)
}
function renderPublic(data){
 const g=data.goal,ci=currentIndex(g);
 $("#app").innerHTML=`<div class="public-page"><div class="public-shell">
 <header class="public-header"><div class="brand"><div class="brandmark">${icon()}</div><div>EVEREST<small>public ascent</small></div></div><span class="badge">Публичная цель</span></header>
 <section class="public-hero"><div class="public-profile"><div class="avatar">${initials(data.name)}</div><div><strong>${esc(data.name)}</strong><div style="color:#aaa;font-size:12px">@${esc(data.handle||"")}</div></div></div>
 <div class="public-title">${esc(g.title)}</div><div class="public-meta"><span class="badge">${g.years} лет</span><span class="badge">${ci+1} из ${g.camps.length} лагерей</span><span class="badge">Вершина ${fmt(g.camps.at(-1).date)}</span></div></section>
 <section class="panel public-route"><div class="eyebrow">МАРШРУТ</div><div class="route-list">${g.camps.map((c,i)=>`<div class="route-item ${i<ci?"reached":i===ci?"current":""}"><div class="route-num">${i===g.camps.length-1?"▲":i+1}</div><div><strong>${esc(c.name)}</strong><p>${esc(c.desc||"")}</p></div><span class="badge">${fmt(c.date)}</span></div>`).join("")}</div></section>
 ${(data.links||[]).length?`<div class="socials">${data.links.map(l=>`<a class="social-chip" href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)}</a>`).join("")}</div>`:""}
 </div></div>`;
}
window.addEventListener("hashchange",render);
render();

