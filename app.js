
const $=(s,e=document)=>e.querySelector(s), $$=(s,e=document)=>[...e.querySelectorAll(s)];
const STORE="everest_v03";
let state=JSON.parse(localStorage.getItem(STORE)||'{"users":{},"session":null}');
let view="everest",step=0,threeCleanup=null;
const save=()=>localStorage.setItem(STORE,JSON.stringify(state));
const me=()=>state.session?state.users[state.session]:null;
const uid=()=>Math.random().toString(36).slice(2)+Date.now().toString(36);
const esc=(v="")=>String(v).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
const hash=s=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return(h>>>0).toString(16)};
const iso=()=>new Date().toISOString().slice(0,10);
const fmt=d=>d?new Date(d+"T00:00:00").toLocaleDateString("ru-RU",{day:"numeric",month:"short",year:"numeric"}):"—";
const initials=n=>(n||"U").trim().split(/\s+/).slice(0,2).map(x=>x[0]?.toUpperCase()).join("");
const enc=o=>btoa(unescape(encodeURIComponent(JSON.stringify(o))));
const dec=s=>{try{return JSON.parse(decodeURIComponent(escape(atob(s))))}catch{return null}};
function publicHash(){
 const m=location.hash.match(/^#share=(.+)$/); if(!m)return null; return dec(m[1]);
}
function toast(t){const x=$("#toast");x.textContent=t;x.classList.add("show");setTimeout(()=>x.classList.remove("show"),1700)}
function logo(){return `<svg viewBox="0 0 64 64" fill="none"><path d="M5 52 25 16l8 14 7-10 19 32H5Z" fill="#fff"/><path d="m20 25 5-9 8 14 7-10 8 13-9-6-6 8-8-7-5 8Z" fill="#171717"/></svg>`}
function season(){
 const m=new Date().getMonth()+1,h=new Date().getHours();
 const light=h<8?"утро":h<17?"день":h<22?"вечер":"ночь";
 if([12,1,2].includes(m))return["Зима",light,.76];
 if([3,4,5].includes(m))return["Весна",light,.52];
 if([6,7,8].includes(m))return["Лето",light,.34];
 return["Осень",light,.44];
}
function currentIndex(g){const x=g.camps.findIndex(c=>c.status==="current");return x>=0?x:g.camps.length-1}
function positions(n){
 const p=[[18,80],[30,73],[43,64],[55,55],[65,45],[73,36],[80,27],[85,19]];
 return Array.from({length:n},(_,i)=>p[Math.round(i*(p.length-1)/(n-1))]);
}
function render(){
 if(threeCleanup){threeCleanup();threeCleanup=null}
 const shared=publicHash(); if(shared)return renderPublic(shared);
 const u=me(); if(!u)return auth(); if(!u.goal)return onboarding(); app();
}
function auth(mode="login"){
 $("#app").innerHTML=`<div class="auth"><div class="auth-card"><div class="auth-logo">${logo()}</div><div class="kicker">EVEREST</div><h1>Ставим свой Эверест на 10 лет.</h1><p style="color:var(--muted);line-height:1.55">Одна большая вершина. Несколько лагерей. Один следующий участок пути.</p>
 <div class="actions" style="margin:18px 0"><button class="btn ${mode==="register"?"dark":""}" data-mode="register">Создать профиль</button><button class="btn ${mode==="login"?"dark":""}" data-mode="login">Войти</button></div>
 <form id="authf" class="form">${mode==="register"?`<div><label>Имя</label><input name="name" required><label style="margin-top:10px">Ник</label><input name="handle" placeholder="gorsky"></div>`:""}<div><label>Email</label><input type="email" name="email" required></div><div><label>Пароль</label><input type="password" minlength="4" name="password" required></div><button class="btn primary">${mode==="register"?"Поставить Эверест":"Войти"}</button></form></div></div>`;
 $$("[data-mode]").forEach(b=>b.onclick=()=>auth(b.dataset.mode));
 $("#authf").onsubmit=e=>{e.preventDefault();const f=new FormData(e.currentTarget),email=String(f.get("email")).trim().toLowerCase(),pass=String(f.get("password"));if(mode==="register"){if(state.users[email])return alert("Профиль уже есть");state.users[email]={id:uid(),email,name:f.get("name"),handle:String(f.get("handle")||"").replace(/^@/,""),passwordHash:hash(pass),links:[],public:true,goal:null};state.session=email}else{const u=state.users[email];if(!u||u.passwordHash!==hash(pass))return alert("Неверные данные");state.session=email}save();render()}
}
function onboarding(){
 const u=me(),d=u.draft||{};
 $("#app").innerHTML=`<div class="auth"><div class="auth-card"><div class="auth-logo">${logo()}</div><div class="steps">${[0,1,2].map(i=>`<span class="${i<=step?"on":""}"></span>`).join("")}</div><form id="onb" class="form">
 <div style="${step===0?"":"display:none"}"><div class="kicker">ШАГ 1</div><h1>Ставим свой Эверест на 10 лет.</h1><label>Мой Эверест</label><textarea name="title">${esc(d.title||"")}</textarea><label>Почему это важно</label><textarea name="why">${esc(d.why||"")}</textarea></div>
 <div style="${step===1?"":"display:none"}"><div class="kicker">ШАГ 2</div><h1>Ставим лагеря.</h1><div class="form-grid"><div><label>Старт</label><input type="date" name="start" value="${d.start||iso()}"></div><div><label>Горизонт, лет</label><input type="number" name="years" min="1" max="30" value="${d.years||10}"></div></div><label>Количество лагерей</label><input type="number" name="camps" min="3" max="8" value="${d.camps||5}"></div>
 <div style="${step===2?"":"display:none"}"><div class="kicker">ШАГ 3</div><h1>Только первый участок.</h1><label>Как выглядит первый достигнутый лагерь?</label><textarea name="first">${esc(d.first||"")}</textarea><label>Одно главное действие сейчас</label><input name="next" value="${esc(d.next||"")}"></div>
 <div class="actions">${step?`<button type="button" class="btn" id="back">Назад</button>`:""}<button class="btn primary">${step<2?"Дальше":"Создать маршрут"}</button></div></form></div></div>`;
 if($("#back"))$("#back").onclick=()=>{step--;onboarding()};
 $("#onb").onsubmit=e=>{e.preventDefault();const f=new FormData(e.currentTarget);u.draft={...d};for(const[k,v]of f.entries())if(v!=="")u.draft[k]=v;if(step<2){step++;save();return onboarding()}const years=+u.draft.years||10,n=Math.min(8,Math.max(3,+u.draft.camps||5)),start=u.draft.start||iso(),sd=new Date(start+"T00:00:00"),camps=[];for(let i=1;i<=n;i++){const dt=new Date(sd);dt.setMonth(dt.getMonth()+Math.round(years*12*i/n));camps.push({id:uid(),name:i===n?"Вершина":`Лагерь ${i}`,date:dt.toISOString().slice(0,10),desc:i===1?(u.draft.first||""):"",status:i===1?"current":"planned"})}u.goal={title:u.draft.title||"Мой Эверест",why:u.draft.why||"",start,years,camps,next:u.draft.next||""};delete u.draft;save();render()}
}
function app(){
 const u=me(),g=u.goal,ci=currentIndex(g),pos=positions(g.camps.length),[ss,day,snow]=season();
 $("#app").innerHTML=`<div class="app-shell"><header class="topbar"><div class="brand"><div class="logo">${logo()}</div><div>EVEREST<small>BIG GOAL SYSTEM</small></div></div><nav class="nav"><button class="${view==="everest"?"active":""}" data-v="everest">Эверест</button><button class="${view==="profile"?"active":""}" data-v="profile">Профиль</button></nav><div class="avatar">${initials(u.name)}</div></header>
 ${view==="everest"?`<main><section class="hero"><canvas id="mountainCanvas"></canvas><div class="hero-overlay"></div><div class="cloud a"></div><div class="cloud b"></div><div class="season">${ss} · ${day}</div><div class="title-block"><div class="kicker">МОЙ ЭВЕРЕСТ · ${g.years} ЛЕТ</div><h1>${esc(g.title)}</h1><div class="why">${esc(g.why||"")}</div></div>
 <div class="route-layer"><svg viewBox="0 0 1000 700" preserveAspectRatio="none"><path class="route" d="M160 575 C300 535 420 500 540 420 C660 340 760 250 850 140"/></svg></div>
 ${g.camps.map((c,i)=>{const[x,y]=pos[i],cl=i<ci?"reached":i===ci?"current":"";return `<button class="camp ${cl}" data-camp="${c.id}" style="left:${x}%;top:${y}%"><span class="camp-dot"></span><span class="camp-label">${esc(c.name)}</span></button>`}).join("")}
 <div class="climber" style="left:${pos[ci][0]}%;top:${pos[ci][1]}%">↗</div>
 <div class="bottom-dock"><div><div class="dock-label">СЕЙЧАС · ${esc(g.camps[ci].name)}</div><div class="dock-value">${esc(g.next||g.camps[ci].desc||"Определи следующий шаг")}</div></div><div><div class="dock-label">МАРШРУТ</div><div class="progress"><span style="width:${Math.round(ci/(g.camps.length-1)*100)}%"></span></div><div class="dock-label" style="margin-top:5px">${ci+1} из ${g.camps.length} · дедлайн ${fmt(g.camps[ci].date)}</div></div><button class="btn primary" id="editNow">Настроить</button></div>
 </section></main>`:profile(u,g,ci)}</div>`;
 $$("[data-v]").forEach(b=>b.onclick=()=>{view=b.dataset.v;render()});
 $$("[data-camp]").forEach(b=>b.onclick=()=>campModal(b.dataset.camp));
 if($("#editNow"))$("#editNow").onclick=()=>campModal(g.camps[ci].id);
 bindProfile();
 if(view==="everest") initMountain(snow);
}
function initMountain(snowLevel=.4){
 if(!window.THREE||!$("#mountainCanvas"))return;
 const canvas=$("#mountainCanvas"),scene=new THREE.Scene();
 scene.fog=new THREE.Fog(0xe9eef1,8,28);
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.6)); renderer.setClearColor(0x000000,0);
 const camera=new THREE.PerspectiveCamera(34,1,.1,100);camera.position.set(9,6.1,10.8);camera.lookAt(0,.8,-1.5);
 scene.add(new THREE.HemisphereLight(0xf6fbff,0x56514b,2.15));
 const dl=new THREE.DirectionalLight(0xffffff,3.1);dl.position.set(-4,10,7);scene.add(dl);
 const geo=new THREE.PlaneGeometry(19,13,105,75);geo.rotateX(-Math.PI/2);
 const p=geo.attributes.position, colors=[];
 function peak(x,z,cx,cz,h,sx,sz){const dx=(x-cx)/sx,dz=(z-cz)/sz;return h*Math.exp(-(dx*dx+dz*dz))}
 for(let i=0;i<p.count;i++){
   const x=p.getX(i),z=p.getZ(i);
   let y=peak(x,z,2.5,-2.4,8.6,2.25,2.05)+peak(x,z,-1.7,-1.0,5.6,2.7,2.5)+peak(x,z,5.1,.2,4.2,2.3,2.3);
   y+=peak(x,z,.1,2.2,2.2,4.6,1.7);
   y+=Math.sin(x*1.7+z*.9)*.12+Math.sin(z*2.5)*.09;
   y=Math.max(-.25,y-1.05); p.setY(i,y);
   const snowStart=4.6-(snowLevel*.8), t=Math.max(0,Math.min(1,(y-snowStart)/1.35));
   const base=new THREE.Color(0x62676a), mid=new THREE.Color(0x8a8e90), white=new THREE.Color(0xf6f7f7);
   const c=y>2.2?mid.clone():base.clone(); c.lerp(white,t);
   const shade=.9+(Math.sin(x*2.3+z)*.045);c.multiplyScalar(shade);
   colors.push(c.r,c.g,c.b);
 }
 geo.setAttribute("color",new THREE.Float32BufferAttribute(colors,3));geo.computeVertexNormals();
 const mat=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.95,metalness:0,flatShading:false});
 const mesh=new THREE.Mesh(geo,mat);mesh.position.set(1.3,-1.5,-2.6);mesh.rotation.y=-.10;scene.add(mesh);
 const ground=new THREE.Mesh(new THREE.PlaneGeometry(40,30),new THREE.MeshStandardMaterial({color:0xd8d6d0,roughness:1}));ground.rotation.x=-Math.PI/2;ground.position.y=-1.72;scene.add(ground);
 function resize(){const r=canvas.getBoundingClientRect();renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix()}
 let raf,alive=true;function loop(){if(!alive)return;mesh.rotation.y=-.10+Math.sin(Date.now()/9000)*.012;renderer.render(scene,camera);raf=requestAnimationFrame(loop)}
 resize();window.addEventListener("resize",resize);loop();
 threeCleanup=()=>{alive=false;cancelAnimationFrame(raf);window.removeEventListener("resize",resize);geo.dispose();mat.dispose();renderer.dispose()};
}
function profile(u,g,ci){
 return `<main class="profile"><div class="profile-cover"></div><section class="profile-card"><div class="profile-head"><div class="profile-identity"><div class="avatar-xl">${initials(u.name)}</div><div class="name"><h2>${esc(u.name)}</h2><div class="handle">@${esc(u.handle||"yourname")}</div></div></div><button class="btn" id="editProfile">Редактировать</button></div>
 <div class="socials">${(u.links||[]).map(l=>`<a class="social" href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)}</a>`).join("")||`<span style="font-size:11px;color:var(--muted)">Добавь Telegram, YouTube и другие ссылки</span>`}</div>
 <div class="goal-card"><div class="kicker">МОЙ ЭВЕРЕСТ</div><h3>${esc(g.title)}</h3><div class="goal-meta"><span class="pill">${g.years} лет</span><span class="pill">${ci+1} из ${g.camps.length} лагерей</span><span class="pill">вершина ${fmt(g.camps.at(-1).date)}</span></div>
 <div class="route-summary">${g.camps.map((c,i)=>`<div class="route-step ${i<ci?"reached":i===ci?"current":""}"><b>${esc(c.name)}</b><span>${esc(c.desc||fmt(c.date))}</span></div>`).join("")}</div>
 <div class="public-row"><div><b style="font-size:12px">Публичный путь</b><div style="font-size:10px;color:var(--muted);margin-top:3px">Люди видят вершину и твой текущий лагерь.</div></div><div class="actions"><button class="switch ${u.public?"on":""}" id="publicSwitch"></button><button class="btn primary" id="shareGoal">Поделиться</button></div></div></div>
 </section></main>`;
}
function bindProfile(){
 if(!$("#editProfile"))return;
 $("#editProfile").onclick=profileModal;
 $("#publicSwitch").onclick=()=>{const u=me();u.public=!u.public;save();render()};
 $("#shareGoal").onclick=()=>{
   const u=me(); if(!u.public)return toast("Сначала включи публичный путь");
   const data={name:u.name,handle:u.handle,links:u.links||[],goal:u.goal};
   const url=location.origin+location.pathname+"#share="+enc(data);
   navigator.clipboard?.writeText(url).then(()=>toast("Публичная ссылка скопирована")).catch(()=>prompt("Скопируй ссылку",url));
 };
}
function profileModal(){
 const u=me(),links=u.links||[],tg=links.find(x=>x.label==="Telegram")?.url||"",yt=links.find(x=>x.label==="YouTube")?.url||"",site=links.find(x=>x.label==="Сайт")?.url||"";
 modal(`<div class="kicker">ПРОФИЛЬ</div><h2>Имя и ссылки</h2><form id="pf" class="form"><div class="form-grid"><div><label>Имя</label><input name="name" value="${esc(u.name)}"></div><div><label>Ник</label><input name="handle" value="${esc(u.handle||"")}"></div></div><div><label>Telegram</label><input name="tg" value="${esc(tg)}"></div><div><label>YouTube</label><input name="yt" value="${esc(yt)}"></div><div><label>Сайт</label><input name="site" value="${esc(site)}"></div><div class="actions"><button type="button" class="btn" data-close>Отмена</button><button class="btn primary">Сохранить</button></div></form>`,d=>{$("[data-close]",d).onclick=()=>d.remove();$("#pf",d).onsubmit=e=>{e.preventDefault();const f=new FormData(e.currentTarget);u.name=f.get("name");u.handle=String(f.get("handle")||"").replace(/^@/,"");u.links=[];if(f.get("tg"))u.links.push({label:"Telegram",url:f.get("tg")});if(f.get("yt"))u.links.push({label:"YouTube",url:f.get("yt")});if(f.get("site"))u.links.push({label:"Сайт",url:f.get("site")});save();d.remove();render()}})
}
function campModal(id){
 const u=me(),g=u.goal,c=g.camps.find(x=>x.id===id),ci=currentIndex(g),idx=g.camps.indexOf(c);
 modal(`<div class="kicker">${idx===g.camps.length-1?"ВЕРШИНА":"ЛАГЕРЬ "+(idx+1)}</div><h2>${esc(c.name)}</h2><form id="cf" class="form"><div><label>Название</label><input name="name" value="${esc(c.name)}"></div><div><label>Как выглядит достигнутый результат?</label><textarea name="desc">${esc(c.desc||"")}</textarea></div><div><label>Дата</label><input type="date" name="date" value="${c.date}"></div>${idx===ci?`<div><label>Главное действие сейчас</label><input name="next" value="${esc(g.next||"")}"></div>`:""}<div class="actions"><button type="button" class="btn" data-close>Закрыть</button><button class="btn primary">Сохранить</button>${idx===ci&&idx<g.camps.length-1?`<button type="button" class="btn dark" id="done">Лагерь достигнут</button>`:""}</div></form>`,d=>{$("[data-close]",d).onclick=()=>d.remove();if($("#done",d))$("#done",d).onclick=()=>{g.camps.forEach((x,i)=>x.status=i<=idx?"reached":i===idx+1?"current":"planned");save();d.remove();render()};$("#cf",d).onsubmit=e=>{e.preventDefault();const f=new FormData(e.currentTarget);c.name=f.get("name");c.desc=f.get("desc");c.date=f.get("date");if(f.has("next"))g.next=f.get("next");save();d.remove();render()}})
}

function renderPublic(data){
 const g=data.goal,ci=currentIndex(g);
 $("#app").innerHTML=`<div class="app-shell"><header class="topbar"><div class="brand"><div class="logo">${logo()}</div><div>EVEREST<small>PUBLIC ASCENT</small></div></div><div class="pill">Публичная цель</div></header>
 <main class="profile"><div class="profile-cover"></div><section class="profile-card"><div class="profile-head"><div class="profile-identity"><div class="avatar-xl">${initials(data.name)}</div><div class="name"><h2>${esc(data.name)}</h2><div class="handle">@${esc(data.handle||"")}</div></div></div></div>
 <div class="socials">${(data.links||[]).map(l=>`<a class="social" href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)}</a>`).join("")}</div>
 <div class="goal-card"><div class="kicker">МОЙ ЭВЕРЕСТ</div><h3>${esc(g.title)}</h3><div class="goal-meta"><span class="pill">${g.years} лет</span><span class="pill">${ci+1} из ${g.camps.length} лагерей</span><span class="pill">вершина ${fmt(g.camps.at(-1).date)}</span></div>
 <div class="route-summary">${g.camps.map((c,i)=>`<div class="route-step ${i<ci?"reached":i===ci?"current":""}"><b>${esc(c.name)}</b><span>${esc(c.desc||fmt(c.date))}</span></div>`).join("")}</div></div></section></main></div>`;
}
function modal(html,bind){const d=document.createElement("div");d.className="modal-bg";d.innerHTML=`<div class="modal">${html}</div>`;document.body.appendChild(d);d.onclick=e=>{if(e.target===d)d.remove()};bind?.(d)}
window.addEventListener("hashchange",render);
render();
