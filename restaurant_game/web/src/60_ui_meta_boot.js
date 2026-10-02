// ================= CAMERA VIEWS =================
function view(k,instant){viewK=k;zoomed=k!=='all';
  const V={all:[W/2+.5,H/2-2,.82],dining:[4,4.8,.45],kitchen:[9.8,3,.38],patio:[6,12.5,.5],tatami:[2,2,.32],kaiten:[6,2.5,.34],street:[W+4,8,.62],stall:[11.5,13.5,.34],garden2:[6,16,.45]}[k]||[W/2,H/2-.5,1];
  goalT.set(V[0],.3,V[1]);goalR=homeRad*V[2];if(instant){TGT.copy(goalT);rad=goalR;placeCam()}
  document.querySelectorAll('#views .rb').forEach(b=>b.classList.toggle('on',b.dataset.v===k))}
$('views').addEventListener('click',e=>{const b=e.target.closest('.rb');if(b&&b.dataset.v){view(b.dataset.v);$('vmenu').hidden=true;$('viewsBtn').setAttribute('aria-expanded','false')}});
$('viewsBtn').onclick=()=>{const m=$('vmenu');m.hidden=!m.hidden;$('viewsBtn').setAttribute('aria-expanded',String(!m.hidden));if(m.hidden)$('legend').hidden=true};
$('nMore').onclick=()=>{const m=$('morepop');m.hidden=!m.hidden;$('nMore').setAttribute('aria-expanded',String(!m.hidden))};
document.addEventListener('pointerdown',e=>{if(!e.target.closest('#nMore,#morepop'))$('morepop').hidden=true;if(!e.target.closest('#views,#legend')){$('vmenu').hidden=true;$('legend').hidden=true}},true);
// ================= INPUT =================
const ray=new THREE.Raycaster(),ptrs=new Map();let drag=null,pinch=0,hover=null;
const ndc=e=>{const r=cv.getBoundingClientRect();return new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-((e.clientY-r.top)/r.height)*2+1)};
function groundTile(e){ray.setFromCamera(ndc(e),cam);const p=new THREE.Vector3();return ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0,1,0),0),p)?[Math.floor(p.x),Math.floor(p.z)]:null}
function zoneOK(k,x,y){const z=T[k].zone;if(landLocked(x,y))return false;if(inTatami(x,y))return S.areas.tatami&&T[k].cat=='trang'&&!z;if(k=='stove')return inKitchen(x,y);if(inKitchen(x,y))return false;if(z=='patio')return y>=10;if(z=='inside')return y<9;return true}
function canPlace(k,x,y){if(x<0||y<0||x>=W||y>=H||isDoor(x,y)||!zoneOK(k,x,y))return false;
  if(T[k].flat)return !rugAt(x,y)&&!at(x,y)?.type?.match(/^(wall|fence)$/);
  return !at(x,y)&&!customers.some(c=>Math.floor(c.x)==x&&Math.floor(c.y)==y)&&!waiters.some(w=>Math.floor(w.x)==x&&Math.floor(w.y)==y)}
function placeErr(k,x,y){if(landLocked(x,y))return'Khu đất này chưa mở, hãy Mở rộng vườn trước';if(inTatami(x,y))return S.areas.tatami?'Phòng tatami chỉ đặt đồ trang trí':'Phòng tatami chưa mở';if(k=='stove')return'Bếp chỉ đặt trong khu bếp';if(inKitchen(x,y))return'Khu bếp chỉ đặt bếp nấu';if(T[k].zone=='patio')return'Món này chỉ đặt ở sân ngoài';if(T[k].zone=='inside')return'Món này chỉ đặt trong nhà';return'Ô này đã có đồ'}
let busyT=0;
cv.addEventListener('pointerdown',e=>{$('app').classList.add('busy');clearTimeout(busyT);cv.setPointerCapture(e.pointerId);ptrs.set(e.pointerId,[e.clientX,e.clientY]);drag={x:e.clientX,y:e.clientY,moved:false,az,pol};
  if(ptrs.size==2){const[a,b]=[...ptrs.values()];pinch=Math.hypot(a[0]-b[0],a[1]-b[1])}});
cv.addEventListener('pointermove',e=>{
  if(ptrs.has(e.pointerId))ptrs.set(e.pointerId,[e.clientX,e.clientY]);
  if(ptrs.size==2){const[a,b]=[...ptrs.values()],d=Math.hypot(a[0]-b[0],a[1]-b[1]);rad=goalR=Math.max(9,Math.min(70,rad*pinch/d));pinch=d;zoomed=true;if(drag)drag.moved=true;placeCam();return}
  if(drag&&ptrs.size==1){const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.hypot(dx,dy)>7)drag.moved=true;
    if(drag.moved){az=Math.max(.12,Math.min(Math.PI/2-.12,drag.az-dx*.006));pol=Math.max(.38,Math.min(1.25,drag.pol-dy*.005));placeCam()}}
  if(!drag||!drag.moved)hover=groundTile(e)});
cv.addEventListener('pointerup',e=>{clearTimeout(busyT);busyT=setTimeout(()=>$('app').classList.remove('busy'),1200);const was=drag;ptrs.delete(e.pointerId);if(!ptrs.size)drag=null;if(!was||was.moved||ptrs.size)return;tap(e)});
cv.addEventListener('pointercancel',e=>{ptrs.delete(e.pointerId);drag=null});
cv.addEventListener('pointerleave',()=>hover=null);
cv.addEventListener('wheel',e=>{e.preventDefault();rad=goalR=Math.max(9,Math.min(70,rad*(1+Math.sign(e.deltaY)*.08)));zoomed=true;placeCam()},{passive:false});
function tap(e){
  const t=groundTile(e);
  if(S.mode=='play'){
    ray.setFromCamera(ndc(e),cam);
    // tips first: they are the main thing to tap
    const tips=[...itemObj.entries()].filter(([id,v])=>v.g.userData.tip&&v.g.userData.tip.visible);
    const th=ray.intersectObjects(tips.map(([id,v])=>v.g.userData.tip),true)[0];
    if(th){const id=tips.find(([i,v])=>{let o=th.object;while(o){if(o===v.g.userData.tip)return true;o=o.parent}return false});if(id){collectTip(S.items.find(o=>o.id==id[0]));return}}
    if(t){const o=S.items.find(o=>o.type=='chair'&&o.tip&&Math.abs(o.x-t[0])+Math.abs(o.y-t[1])<=1&&(tableOf(o)||{}).x==t[0]&&(tableOf(o)||{}).y==t[1]);if(o){collectTip(o);return}}
    if(pickPerson(e))return;
    const ents=[...avMap.entries()].filter(([c,a])=>a.bs);const hits=ray.intersectObjects(ents.map(([c,a])=>a.g),true);
    for(const h of hits){let o=h.object;while(o&&!ents.some(([c,a])=>a.g===o))o=o.parent;const f=o&&ents.find(([c,a])=>a.g===o);
      if(f&&f[0].st=='wait'){f[0].pri=true;toast('Ưu tiên phục vụ khách này!');return}}
    return}
  if(!t)return;const[x,y]=t;
  if(S.sel=='sell'){const o=at(x,y)||rugAt(x,y);if(!o)return;if(T[o.type].fixed){toast('Không bán được phần này của quán');return}
    if(o.type=='stove'&&(o.cook||o.hold)){toast('Bếp đang nấu, chờ chút nhé');return}
    S.items=S.items.filter(i=>i!==o);const d=T[o.type];if(d.c)S.coins+=Math.floor(d.c/2);else S.gems+=Math.floor(d.g/2);bump('pCoin');renderDeco();save();return}
  if(!S.sel){toast('Chọn một món ở khay bên dưới trước');return}
  const d=T[S.sel];
  if(d.c&&S.coins<d.c||d.g&&S.gems<d.g){toast(d.g?'Chưa đủ kim cương':'Chưa đủ xu');return}
  if(!canPlace(S.sel,x,y)){toast(placeErr(S.sel,x,y));return}
  if(d.c)S.coins-=d.c;else S.gems-=d.g;add(S.sel,x,y);if(d.b)quest('decor');renderDeco();save()}
// hover tile in decorate mode
const hl=new THREE.Mesh(new THREE.PlaneGeometry(.94,.94),new THREE.MeshBasicMaterial({color:'#2ec4b6',transparent:true,opacity:.55,depthTest:false}));hl.rotation.x=-Math.PI/2;hl.position.y=.04;hl.renderOrder=3;hl.visible=false;scene.add(hl);
function updateHover(){hl.visible=false;grid.visible=S.mode=='deco';if(S.mode!='deco'||!hover||!S.sel)return;const[x,y]=hover;if(x<0||y<0||x>=W||y>=H)return;
  hl.visible=true;hl.position.set(x+.5,.04,y+.5);const o=at(x,y)||rugAt(x,y);
  const ok=S.sel=='sell'?!!(o&&!T[o.type].fixed):canPlace(S.sel,x,y);hl.material.color.set(ok?(S.sel=='sell'?'#ff9f1c':'#2ec4b6'):'#e63946')}

// ================= HUD + UI =================
let toastT;function toast(m){const e=$('toast');e.textContent=m;e.classList.add('on');clearTimeout(toastT);toastT=setTimeout(()=>e.classList.remove('on'),2300)}
function bump(id){const e=$(id);e.classList.remove('bump');void e.offsetWidth;e.classList.add('bump')}
let shown={};
function hud(){
  const v={coins:Math.floor(S.coins),gems:S.gems,beauty:beauty(),stars:rating().toFixed(1),lvn:S.level};
  for(const k in v)if(shown[k]!==v[k]){$(k).textContent=v[k];shown[k]=v[k]}
  $('xpRing').setAttribute('stroke-dashoffset',(125.7*(1-S.xp/xpNeed())).toFixed(1));
  const q=S.quests.filter(q=>q.done).length;$('qBadge').hidden=!q;$('qBadge').textContent=q}
// coin flying from 3D position to the coin pill
function flyCoins(wx,wz,n,tip){const v=new THREE.Vector3(wx,1.2,wz).project(cam),st=$('stage').getBoundingClientRect(),dst=$('pCoin').getBoundingClientRect();
  const sx=(v.x+1)/2*st.width,sy=(1-v.y)/2*st.height,tx=dst.left-st.left+12,ty=dst.top-st.top+12,k=Math.min(6,2+Math.floor(n/15));
  for(let i=0;i<k;i++){const c=document.createElement('div');c.className='coin';c.textContent=tip?'💰':'🪙';c.style.left=sx+rnd(-18,18)+'px';c.style.top=sy+rnd(-12,12)+'px';$('fly').appendChild(c);
    setTimeout(()=>{c.style.transform=`translate(${tx-parseFloat(c.style.left)}px,${ty-parseFloat(c.style.top)}px) scale(.7)`;c.style.opacity='.4'},30+i*70);
    setTimeout(()=>{c.remove();bump('pCoin')},800+i*70)}}
// order board
let boardMin=false;
function stateOf(c){
  if(c.st=='in')return['Đang vào bàn',null,'#8a6a48'];
  if(c.st=='wait')return[c.kind=='belt'?'Chọn đĩa':c.kind=='bar'?'Gọi ở quầy':c.pri?'Chờ gọi món ❗':'Chờ gọi món',null,'#8a6a48'];
  if(c.st=='eat')return['Đang ăn','🍴 '+Math.max(0,Math.ceil(5-c.t))+'s','#2a8a55'];
  const o=orders.find(o=>o.c===c);if(!o)return['Chờ món',null];
  if(o.st=='queued')return['Chờ bếp',null];
  if(o.st=='cooking'){const s=stoves().find(s=>s.cook===o);return['Đang nấu','🍳 '+Math.ceil((1-(s&&s.prog||0))*dishCook(c.dish))+'s','#e07f00']}
  return['Chờ mang ra','✅','#2a8a55']}
let boardOpen=false,boardOpenT=0;
const pc=c=>c.pat>.5?'var(--ok)':c.pat>.25?'var(--warn)':'var(--bad)';
function updateBoard(){
  const list=customers.filter(c=>c.st!='out'),waiting=list.filter(c=>c.st=='wait'||c.st=='food');
  const urgent=waiting.filter(c=>c.pat<.25).length,warnN=waiting.filter(c=>c.pat>=.25&&c.pat<.5).length,H=hints();
  if(boardOpen&&performance.now()-boardOpenT>9000)boardOpen=false;
  let h=`<div class="h"><span>🧾 ${list.length} khách</span>`+
    (urgent?`<span class="st" style="color:var(--bad)"><i class="dotc" style="background:var(--bad)"></i>${urgent} sắp bỏ về</span>`:warnN?`<span class="st" style="color:#9a6a00"><i class="dotc" style="background:var(--warn)"></i>${warnN} chờ lâu</span>`:list.length?`<span class="st" style="color:var(--ok)"><i class="dotc" style="background:var(--ok)"></i>ổn</span>`:'')+
    (H.length?`<span class="st" style="color:#b0400f">⚠️ ${H.length}</span>`:'')+`<span>${boardOpen?'▴':'▾'}</span></div>`;
  if(boardOpen){
    h+=`<div class="hotl">🔥 Món hot: ${DISHES[S.hot].e} ${DISHES[S.hot].n}</div>`;
    for(const[e,t,sub,go]of H)h+=`<div class="warn" data-go="${go}">${e}<div>${t}<small>${sub}</small></div></div>`;
    h+='<div class="list">'+(list.length?'':'<div class="empty">Chưa có khách. Khách tới từ cổng vườn.</div>');
    for(const c of [...list].sort((a,b)=>(a.st=='wait'||a.st=='food'?a.pat:2)-(b.st=='wait'||b.st=='food'?b.pat:2))){const[l,x]=stateOf(c),p=c.st=='wait'||c.st=='food',sec=p?Math.ceil(patSecs(c)):null;
      h+=`<div class="r" data-i="${customers.indexOf(c)}"><span class="d">${c.vip?'<sup>👑</sup>':''}${DISHES[c.dish].e}</span><span class="l">${l}</span><span class="s" style="color:${p?pc(c):'var(--text2)'}">${x||(sec!=null?sec+'s':'')}</span>${p?`<span class="t"><i style="width:${Math.max(0,c.pat)*100}%;background:${pc(c)}"></i></span>`:''}</div>`}
    h+='</div>'}
  $('board').innerHTML=h}
$('board').addEventListener('pointerdown',e=>{const w=e.target.closest('.warn');if(w){if(w.dataset.go=='staff')$('nStaff').click();else $('nDeco').click();return}if(e.target.closest('.h')){boardOpen=!boardOpen;boardOpenT=performance.now();updateBoard();return}
  const r=e.target.closest('.r');if(!r)return;boardOpenT=performance.now();const c=customers[+r.dataset.i];if(c&&c.st=='wait'){c.pri=true;toast('Ưu tiên phục vụ khách này!')}});
// modal sheets
function openModal(title,render){$('mTitle').textContent=title;openModal.render=render;render();$('modal').hidden=false}
function closeModal(){$('modal').hidden=true;openModal.render=null;document.querySelectorAll('.nb').forEach(b=>b.classList.remove('on'));if(popQ.length)setTimeout(nextPop,250)}
$('mClose').onclick=closeModal;$('modal').addEventListener('pointerdown',e=>{if(e.target.id=='modal')closeModal()});
function refreshModal(){if(openModal.render&&!$('modal').hidden)openModal.render()}
function btn(label,ok,cls='',act=''){return`<button class="btn ${cls}" ${ok?'':'disabled'} data-act="${act}">${label}</button>`}
let menuCat='sushi';
function menuPanel(){
  const hot=DISHES[S.hot];
  const list=DISHES.map((d,i)=>[d,i]).filter(([d])=>d.cat==menuCat);
  $('mBody').innerHTML=`<div class="hot"><span class="e">${hot.e}</span><div style="flex:1">🔥 Món hot: ${hot.n}<br><small style="font-weight:600;color:#8a5a00">Khách gọi nhiều hơn, trả x1,5 · đổi sau ${Math.ceil(S.hotT)}s</small></div></div>
  <div class="tabs2">${MCATS.map(([k,n])=>`<button class="${menuCat==k?'on':''}" data-mcat="${k}">${n}</button>`).join('')}</div>
  <div class="dgrid">${list.map(([d,i])=>{const lock=d.unlock>S.level,c=dishUpCost(i),max=S.menu[i]>=10,q=S.quality[d.ch]||0;
    return`<div class="dish ${lock?'lock':''}"><span class="lvtag">${lock?'🔒 Cấp '+d.unlock:'Lv '+S.menu[i]}</span>${i==S.hot&&!lock?'<span class="fire">🔥</span>':''}<div class="pic">${d.e}</div><b>${d.n}</b>
    <small>💰 ${dishPrice(i)} xu · ⏱️ ${dishCook(i).toFixed(1)}s</small><small>${CHAINS[d.ch].items.at(-1)} <span class="stars">${'★'.repeat(Math.min(5,q))}${'☆'.repeat(Math.max(0,5-q))}</span></small>
    ${lock?'':max?'<small><b>Đã tối đa</b></small>':btn('⬆ '+c+' 🪙',S.coins>=c,'o','dish:'+i)}</div>`}).join('')}</div>
  <div class="sec">Ghép nguyên liệu ở Chợ cá để thêm ★ (+12% giá mỗi sao).</div>`}
$('mBody').addEventListener('click',e=>{const b=e.target.closest('[data-mcat]');if(b){menuCat=b.dataset.mcat;menuPanel()}});
const ROLE_DESC={chef:s=>`Nấu nhanh hơn ${Math.round(15*staffPow(s))}% · đứng bếp`,waiter:s=>`Tốc độ đi ${Math.round(6*staffPow(s))}% nhanh hơn`,greeter:s=>`Khách kiên nhẫn thêm ${Math.round(6*staffPow(s))}%`,
  musician:s=>`+${Math.round(staffPow(s)*3)} ✨ độ đẹp nhờ tiếng đàn`,manager:s=>'Tự nhặt tiền tip trên bàn',vendor:s=>'Quầy mang về bán giá x1,6, khách ghé nhiều hơn'};
let staffTab='all';
function staffPanel(){
  const roles=['all',...Object.keys(ROLE)];
  const list=STAFF.filter(s=>staffTab=='all'||s.role==staffTab).sort((a,b)=>S.staff[b.id].hired-S.staff[a.id].hired);
  $('mBody').innerHTML=`<div class="tabs2">${roles.map(r=>`<button class="${staffTab==r?'on':''}" data-stab="${r}">${r=='all'?'Tất cả':ROLE[r].e+' '+ROLE[r].n}</button>`).join('')}</div>`+
  list.map(st=>{const h=S.staff[st.id],lock=(st.lv||1)>S.level,tc=trainCost(st),price=st.c?st.c+' 🪙':st.g+' 💎',can=st.c?S.coins>=st.c:S.gems>=st.g;
    const por=portrait(st);
    return`<div class="staff ${h.hired?'':'no'}"><div class="por">${por?`<img src="${por}" alt="">`:ROLE[st.role].e}</div><div class="m"><b>${st.name}</b><span class="role">${ROLE[st.role].e} ${ROLE[st.role].n}</span>
      <small><span class="stars">${'★'.repeat(st.stars)}</span>${h.hired?' · Lv '+h.lv:''}</small><small>${ROLE_DESC[st.role](st)}</small></div>
      ${h.hired?(h.lv>=5?'<b>Lv tối đa</b>':btn('Huấn luyện<br>'+tc+' 🪙',S.coins>=tc,'o','train:'+st.id)):lock?`<b style="font-size:12px">🔒 Cấp ${st.lv}</b>`:btn('Thuê<br>'+price,can,'','hire:'+st.id)}</div>`}).join('')}
$('mBody').addEventListener('click',e=>{const b=e.target.closest('[data-stab]');if(b){staffTab=b.dataset.stab;staffPanel()}});
// 3D portraits for the staff cards, rendered once into images with a small offscreen renderer
const porCache={};let porR=null,porScene=null,porCam=null;
function portrait(st){if(porCache[st.id]!==undefined)return porCache[st.id];
  try{if(!porR){porR=new THREE.WebGLRenderer({alpha:true,antialias:true,preserveDrawingBuffer:true});porR.setSize(128,128);porScene=new THREE.Scene();porScene.add(new THREE.HemisphereLight('#fff6e6','#a07850',.9));const l=new THREE.DirectionalLight('#ffffff',.6);l.position.set(1,2,3);porScene.add(l);porCam=new THREE.PerspectiveCamera(30,1,.1,10);porCam.position.set(0,1.0,2.1);porCam.lookAt(0,.82,0)}
    const g=mkAvatar(Object.assign({role:st.role=='chef'?'chef':'w'},st.look));g.parent.remove(g);g.scale.setScalar(1);porScene.add(g);const u=g.userData;pose(u,{});setFace(u,'happy');
    porR.render(porScene,porCam);porCache[st.id]=porR.domElement.toDataURL();porScene.remove(g)}catch(e){porCache[st.id]=null}
  return porCache[st.id]}
// expansion panel
function expandPanel(){
  $('mBody').innerHTML=`<div class="sec">Mở rộng tiệm để có thêm chỗ ngồi, thêm khách và thêm cách kiếm tiền.</div>`+Object.entries(AREAS).map(([k,a])=>{const open=S.areas[k],lv=S.level>=a.lv,ok=lv&&S.coins>=a.c&&!open;
    return`<div class="area ${open?'done':''}"><div class="ban">${a.e}</div><div class="tx"><div><b>${a.n}</b><small>${a.d}</small></div>${open?btn('Xem',true,'','look:'+k):lv?btn(a.c+' 🪙',ok,'o','area:'+k):`<b style="font-size:12px">🔒 Cấp ${a.lv}</b>`}</div></div>`}).join('')+
  `<div class="sec">Nâng cấp tiệm</div>`+Object.entries(UPG).map(([k,u])=>{const l=S.upg[k],c=upgCost(k);return`<div class="it"><span class="e">${u.e}</span><div class="m"><b>${u.n}<span class="lvtag">Cấp ${l}/${u.max}</span></b><small>${l?u.d(l):'Chưa nâng cấp'} → ${u.d(l+1)}</small></div>${l>=u.max?'<b>Tối đa</b>':btn(c+' 🪙',S.coins>=c,'o','upg:'+k)}</div>`}).join('')}
$('nExpand').onclick=()=>{navOn('nExpand');openModal('Mở rộng cửa hàng',expandPanel)};
let questTab='q';
function questPanel(){ensureQuests();
  const tabs=`<div class="tabs2">${[['q','📜 Nhiệm vụ'],['book','📖 Sổ tay'],['login','📅 Điểm danh'],['set','⚙️ Cài đặt']].map(([k,n])=>`<button class="${questTab==k?'on':''}" data-qtab="${k}">${n}</button>`).join('')}</div>`;
  let body='';
  if(questTab=='q')body=chestLine()+S.quests.map((q,i)=>`<div class="it"><span class="e">${q.e}</span><div class="m"><b>${q.title}</b><small>Thưởng: ${q.coins} 🪙${q.gems?' + '+q.gems+' 💎':''}</small><div class="prog"><i style="width:${q.p/q.n*100}%"></i></div><small>${q.p}/${q.n}</small></div>${btn('Nhận',q.done,'','claim:'+i)}</div>`).join('');
  if(questTab=='book')body=bookPanelHTML();
  if(questTab=='login'){loginPanel();body=$('mBody').innerHTML}
  if(questTab=='set')body=settingsHTML();
  $('mBody').innerHTML=tabs+body}
$('mBody').addEventListener('click',e=>{const b=e.target.closest('[data-qtab]');if(b){questTab=b.dataset.qtab;questPanel()}});
let resetArm=false;
$('mBody').addEventListener('click',e=>{const b=e.target.closest('[data-act]');if(!b||b.disabled)return;const[a,v]=b.dataset.act.split(':');
  if(a=='dish'){const i=+v,c=dishUpCost(i);if(S.coins>=c){S.coins-=c;S.menu[i]++;toast(DISHES[i].n+' lên Lv '+S.menu[i]+'!')}}
  if(a=='hire'){const st=STAFF.find(s=>s.id==v);if(st&&!S.staff[v].hired&&(st.c?S.coins>=st.c:S.gems>=st.g)){if(st.c)S.coins-=st.c;else S.gems-=st.g;S.staff[v].hired=true;syncWaiters();ensureStage();
    toast(st.name+' đã vào làm! '+ROLE[st.role].e);closeModal();if(STAFF_INTRO[st.id])setTimeout(()=>talk([{who:st.id,t:STAFF_INTRO[st.id]}]),400);if(st.role=='greeter')view('patio');if(st.role=='musician')view('dining');if(st.role=='chef')view('kitchen')}}
  if(a=='train'){const st=STAFF.find(s=>s.id==v),c=trainCost(st);if(S.coins>=c&&S.staff[v].lv<5){S.coins-=c;S.staff[v].lv++;syncWaiters();toast(st.name+' lên Lv '+S.staff[v].lv+'!')}}
  if(a=='area'){const ar=AREAS[v];if(S.coins>=ar.c&&S.level>=ar.lv&&!S.areas[v]){S.coins-=ar.c;unlockArea(v);closeModal()}}
  if(a=='look'){closeModal();view(v);return}
  if(a=='claim'){const q=S.quests[+v];if(q&&q.done){S.coins+=q.coins;S.gems+=q.gems;S.quests.splice(+v,1);ensureQuests();onClaimQuest();sfx('coin');toast('Nhận '+q.coins+' 🪙'+(q.gems?' + '+q.gems+' 💎':''));bump('pCoin')}}
  if(a=='chest'&&S.qd.done>=5&&!S.qd.chest){S.qd.chest=1;S.gems+=5;S.coins+=500;sfx('level');toast('Mở rương: 500 🪙 + 5 💎!')}
  if(a=='medal'){const i=+v,m=S.medal[i]||0,need=[10,50,150][m];if(need&&(S.dc[i]||0)>=need){S.medal[i]=m+1;const r=[{c:50},{g:1},{g:3}][m];if(r.c)S.coins+=r.c;if(r.g)S.gems+=r.g;sfx('coin');toast(DISHES[i].n+': '+['🥉','🥈','🥇'][m]+' · '+loginText(r))}}
  if(a=='login'&&S.daily.last!==today()){const r=LOGIN[S.daily.idx];if(r.c)S.coins+=r.c;if(r.g)S.gems+=r.g;if(r.q){const k=pick(Object.keys(CHAINS));S.quality[k]++}S.daily.last=today();S.daily.idx=(S.daily.idx+1)%7;sfx('level');toast('Quà hôm nay: '+loginText(r))}
  if(a=='off'){const m=+v;if(m==2&&S.gems>=2)S.gems-=2;S.coins+=offlineGain*(m==2&&S.gems>=0?2:1);offlineGain=0;sfx('coin');closeModal();save();return}
  if(a=='snd'){S.sound[v]=!S.sound[v]}
  if(a=='upg'){const k=v,c=upgCost(k);if(S.coins>=c&&S.upg[k]<UPG[k].max){S.coins-=c;S.upg[k]++;sfx('level');toast(UPG[k].n+' lên cấp '+S.upg[k]+'!')}}
  if(a=='reset'){if(!resetArm){resetArm=true;setTimeout(()=>{resetArm=false;refreshModal()},3000)}else{try{localStorage.removeItem(SAVE)}catch(_){}location.reload();return}}
  save();refreshModal()});
function navOn(id){document.querySelectorAll('.nb').forEach(b=>b.classList.toggle('on',b.id==id))}
$('nMenu').onclick=()=>{navOn('nMenu');openModal('Thực đơn',menuPanel)};
$('nStaff').onclick=()=>{navOn('nStaff');openModal('Nhân viên',staffPanel)};
$('nQuest').onclick=()=>{navOn('nQuest');openModal('Nhiệm vụ',questPanel)};
$('nSpeed').onclick=e=>{e.stopPropagation();S.speed=S.speed==1?2:S.speed==2?4:1;$('spd').textContent='x'+S.speed};
$('nMarket').onclick=()=>{navOn('nMarket');openModal('Chợ cá · Ghép nguyên liệu',marketPanel)};
// decorate tray
function renderDeco(){
  $('dTabs').innerHTML=CATS.map(([k,n])=>`<button class="tab ${S.cat==k?'on':''}" data-c="${k}">${n}</button>`).join('');
  if(S.cat=='mo'){S.sel=null;$('dCards').innerHTML=Object.entries(AREAS).map(([k,a])=>{const open=S.areas[k],lv=S.level>=a.lv,ok=lv&&S.coins>=a.c&&!open;
    return`<button class="card" style="flex-basis:150px;text-align:left;padding:6px 8px" data-area="${k}" ${ok?'':'disabled'}><span class="e" style="text-align:center">${a.e}</span>${a.n}<span class="c" style="font-weight:600;color:#7a5a3a">${a.d}</span><span class="c">${open?'✅ Đã mở':lv?a.c+' 🪙':'🔒 Cần cấp '+a.lv}</span></button>`}).join('');$('dHint').textContent='Mở rộng tiệm để có thêm chỗ ngồi và khách.';return}
  if(S.cat=='sell'){$('dCards').innerHTML='<div class="hint" style="padding:8px">Chạm một món trong quán để bán lại, hoàn 50% giá.</div>';S.sel='sell'}
  else $('dCards').innerHTML=Object.entries(T).filter(([k,d])=>d.cat==S.cat).map(([k,d])=>{const cost=d.c?d.c+' 🪙':d.g+' 💎',ok=d.c?S.coins>=d.c:S.gems>=d.g;
    return`<button class="card ${S.sel==k?'sel':''}" data-k="${k}" ${ok?'':'disabled'}>${d.b?`<span class="bt">✨${d.b}</span>`:''}<span class="e">${d.e}</span>${d.n}<span class="c">${cost}</span></button>`}).join('');
  $('dHint').textContent=S.sel=='sell'?'Chạm món đồ cần bán.':S.sel?`Chạm ô sàn để đặt ${T[S.sel].n.toLowerCase()}. Ô xanh là đặt được.`:'Chọn món đồ, rồi chạm ô trên sàn. Kéo để xoay góc nhìn.'}
$('dTabs').addEventListener('click',e=>{const b=e.target.closest('.tab');if(!b)return;S.cat=b.dataset.c;S.sel=S.cat=='sell'?'sell':null;renderDeco()});
$('dCards').addEventListener('click',e=>{const b=e.target.closest('.card');if(!b||b.disabled)return;
  if(b.dataset.area){const a=AREAS[b.dataset.area];if(S.coins>=a.c&&S.level>=a.lv&&!S.areas[b.dataset.area]){S.coins-=a.c;unlockArea(b.dataset.area);save();renderDeco()}return}S.sel=S.sel==b.dataset.k?null:b.dataset.k;renderDeco()});
$('nDeco').onclick=()=>{S.mode='deco';S.sel=null;$('deco').hidden=false;navOn('nDeco');renderDeco()};
$('dDone').onclick=()=>{S.mode='play';S.sel=null;$('deco').hidden=true;navOn('');save()};
function nextTease(){const nl=S.level+1;const n=[...DISHES.filter(d=>d.unlock==nl).map(d=>d.e+' '+d.n),...Object.values(AREAS).filter(a=>a.lv==nl).map(a=>a.e+' '+a.n),...STAFF.filter(s=>s.lv==nl).map(s=>ROLE[s.role].e+' '+s.name)];
  return n.length?`<br><small style="color:#8a5a00">Cấp ${nl} sẽ mở: ${n.join(', ')}</small>`:''}
// level up celebration
function levelUp(){
  const news=DISHES.filter(d=>d.unlock==S.level);
  const el=document.createElement('div');el.className='lvup';el.innerHTML=`<div class="card2"><div class="big">🎉</div><h3>Lên cấp ${S.level}!</h3><p>${news.length?'Mở món mới: '+news.map(d=>d.e+' '+d.n).join(', '):'Khách tới đông hơn.'}<br>Thưởng 2 💎${nextTease()}</p><button class="btn o">Tuyệt!</button></div>`;
  $('app').appendChild(el);el.querySelector('button').onclick=()=>el.remove();
  const cols=['#ff6b8a','#ffd166','#2ec4b6','#5aa9ff','#ff9f1c','#7ee081'];
  for(let i=0;i<60;i++){const c=document.createElement('div');c.className='cf';c.style.left=rnd(0,100)+'%';c.style.background=pick(cols);c.style.animationDuration=rnd(1.6,3)+'s';c.style.animationDelay=rnd(0,.5)+'s';$('app').appendChild(c);setTimeout(()=>c.remove(),3800)}}

// ================= LOOP =================
load();ensureQuests();syncWaiters();ensureStage();
let last=performance.now(),clock=0,boardAt=0,saveAt=0;
let loopErr=false,firstFrame=true;
function loop(now){requestAnimationFrame(loop);try{frame(now)}catch(e){if(!loopErr){loopErr=true;console.error(e);toast('Có lỗi: '+(e&&e.message||e))}}}
function frame(now){const dt=Math.min(.05,(now-last)/1000);last=now;clock+=dt;
  for(let i=0;i<S.speed;i++)tick(dt);
  for(const ev of events.splice(0)){if(ev.k=='coins'){flyCoins(ev.x,ev.y,ev.n,ev.tip);sfx('coin')}if(ev.k=='level'){levelUp();sfx('level')}if(ev.k=='chime')sfx('chime');if(ev.k=='angry')sfx('angry');if(ev.k=='sizzle')sfx('sizzle');if(ev.k=='unlock')sfx('level');if(ev.k=='quest')refreshModal();if(ev.k=='unlock')onUnlock(ev.a);if(ev.k=='hot')toast('🔥 Món hot mới: '+DISHES[S.hot].e+' '+DISHES[S.hot].n)}
  if(TGT.distanceTo(goalT)>.01||Math.abs(rad-goalR)>.05){TGT.lerp(goalT,.12);rad+=(goalR-rad)*.12;placeCam()}
  syncItems(clock,now);syncAvatars(clock,dt);syncCars(dt,clock);syncPeds(dt,clock);syncStaffExtras(clock,dt);syncManager(clock,dt);syncInfo();syncLand();syncFx();syncPuffs(dt);syncPetals(dt,clock);updateHover();
  lanterns.forEach((l,i)=>l.rotation.z=Math.sin(clock*1.3+i)*.05);norens.forEach((n,i)=>n.children.forEach(c=>{if(c.userData.sway!=null)c.rotation.x=Math.sin(clock*2+c.userData.sway+i)*.06}));
  renderer.render(scene,cam);hud();
  syncDay(dt);musicTick();if(Math.random()<dt*.04&&cars.some(c=>c.v<.5))sfx('honk');
  if(now-boardAt>250){boardAt=now;updateBoard();renderChap()}
  if(now-saveAt>5000){saveAt=now;save()}
  if(firstFrame){firstFrame=false;$('boot').hidden=true}}
resize();view('all',true);requestAnimationFrame(loop);
setTimeout(startSession,700);
// ================= EXPANSION =================
function onUnlock(k){const a=AREAS[k];toast('Đã mở '+a.n+'! 🎉');view(k);
  const c={tatami:[2,2],kaiten:[6,2.5],stall:[11.5,13.5],garden2:[6,16]}[k];for(let i=0;i<18;i++)puff(c[0]+rnd(-1.5,1.5),rnd(.2,1),c[1]+rnd(-1.5,1.5));
  if(k=='tatami')talk(['Ồ, căn phòng tatami của bà ngày xưa! Khách quý rất thích ngồi xếp bằng ở đây đấy.']);
  if(k=='kaiten')talk(['Băng chuyền chạy rồi! Khách tự lấy đĩa nên mình đỡ vất vả hơn nhiều.']);
  if(k=='stall')talk(['Quầy taiyaki ven đường mở rồi! Người đi bộ ngoài phố sẽ ghé mua. Thuê cậu Ren thì bán còn đắt hàng hơn.']);
  if(k=='garden2')talk(['Khu vườn rộng thêm nhiều quá! Đặt thêm bàn ghế, ô và đèn đá cho đẹp nhé.'])}
// ================= MERGE MARKET (ghép nguyên liệu) =================
let mSel=-1,mPop=-1;
const SPAWN_COST=4;
function marketPanel(){
  const cells=S.grid.map((it,i)=>{if(!it)return`<button class="cell" data-c="${i}" aria-label="Ô trống"></button>`;const ch=CHAINS[it[0]],max=it[1]==ch.items.length-1;
    return`<button class="cell ${mSel==i?'sel':''} ${max?'max':''} ${mPop==i?'pop':''}" data-c="${i}">${ch.items[it[1]]}<span class="lv">${max?'MAX':'Lv'+(it[1]+1)}</span></button>`}).join('');mPop=-1;
  const free=S.grid.filter(x=>!x).length;
  $('mBody').innerHTML=`<div class="sec">Chạm 2 nguyên liệu giống nhau để ghép lên cấp. Nguyên liệu MAX chạm để đưa vào bếp: món dùng nó được +1 ★ chất lượng.</div>
  <div class="mg">${cells}</div>
  <div style="display:flex;gap:8px;align-items:center">${btn('🛒 Nhập hàng · '+SPAWN_COST+' 🪙',free>0&&S.coins>=SPAWN_COST,'o','spawn')}<span style="font-size:12px;color:#7a5a3a">${free} ô trống</span></div>
  <div class="chains">${Object.entries(CHAINS).map(([k,c])=>`<div class="chain"><b>${c.n} <span class="stars">${'★'.repeat(Math.min(5,S.quality[k]))}</span></b>${c.items.join(' → ')}</div>`).join('')}</div>`}
$('mBody').addEventListener('click',e=>{
  if(openModal.render!==marketPanel)return;
  const b=e.target.closest('[data-act="spawn"]');
  if(b&&!b.disabled){const free=S.grid.map((x,i)=>x?-1:i).filter(i=>i>=0);if(free.length&&S.coins>=SPAWN_COST){S.coins-=SPAWN_COST;const i=pick(free);S.grid[i]=[pick(Object.keys(CHAINS)),0];mPop=i;marketPanel();save()}return}
  const c=e.target.closest('.cell');if(!c)return;const i=+c.dataset.c,it=S.grid[i];
  if(!it){mSel=-1;marketPanel();return}
  const ch=CHAINS[it[0]];
  if(it[1]==ch.items.length-1&&mSel===-1){S.grid[i]=null;S.quality[it[0]]++;toast(ch.n+' +1 ★ chất lượng! Món '+DISHES.filter(d=>d.ch==it[0]).map(d=>d.e).join('')+' đắt hơn');marketPanel();save();return}
  if(mSel===-1||mSel===i){mSel=mSel===i?-1:i;marketPanel();return}
  const a=S.grid[mSel];
  if(a&&a[0]==it[0]&&a[1]==it[1]&&it[1]<ch.items.length-1){S.grid[mSel]=null;S.grid[i]=[it[0],it[1]+1];mSel=-1;mPop=i;quest('merge');gainXP(1);sfx('merge')}else mSel=i;
  marketPanel();save()});
// ================= STORY (Ono Ryota) =================
let talkQ=[];
function talk(lines){talkQ.push(...lines.map(l=>typeof l=='string'?{who:'ono',t:l}:l));if($('talk').hidden)nextTalk()}
function nextTalk(){if(!talkQ.length){$('talk').hidden=true;return}const l=talkQ.shift();
  const sp=SPK[l.who]||(()=>{const st=STAFF.find(s=>s.id==l.who);return st?{n:st.name+' · '+ROLE[st.role].n,f:ROLE[st.role].e,c:ROLE[st.role].c,sid:st.id}:SPK.ono})();
  $('talk').querySelector('.face').innerHTML=talkPortrait(sp);$('talkName').textContent=sp.n;$('talkName').style.background=sp.c;$('talkText').textContent=l.t;$('talk').hidden=false}
$('talk').addEventListener('click',nextTalk);
// ================= WHO IS WHO: tap a person for an info card, legend of role colours =================
function people(){const L=[];
  for(const[e,a]of avMap)L.push({g:a.g,kind:e.role=='c'?'guest':'staff',e,sid:e.sid});
  if(greeterAv)L.push({g:greeterAv,kind:'staff',sid:greeterAv.userData.sid});
  if(musicianAv)L.push({g:musicianAv,kind:'staff',sid:musicianAv.userData.sid});
  if(managerAv)L.push({g:managerAv,kind:'staff',sid:managerAv.userData.sid});
  for(const[id,v]of itemObj){const u=v.g.userData;if(u.chef)L.push({g:u.chef,kind:'staff',sid:u.chefId,chef:1,stove:S.items.find(o=>o.id==id)});if(u.vendor)L.push({g:u.vendor,kind:'staff',sid:u.vendorKey=='gen'?null:u.vendorKey,vendor:1})}
  return L}
let infoSel=null,infoT=0;
function pickPerson(e){ray.setFromCamera(ndc(e),cam);const L=people();const hits=ray.intersectObjects(L.map(p=>p.g),true);
  for(const h of hits){let o=h.object;while(o&&!L.some(p=>p.g===o))o=o.parent;const p=o&&L.find(p=>p.g===o);if(p){if(p.kind=='guest'&&p.e.st=='wait')p.e.pri=true;infoSel=p;infoT=6;renderInfo();return true}}
  return false}
function staffDoing(p){const st=STAFF.find(s=>s.id==p.sid);
  if(p.chef){const o=p.stove;return o&&o.cook?'Đang nấu '+DISHES[o.cook.c.dish].e+' '+DISHES[o.cook.c.dish].n+' · còn '+Math.ceil((1-(o.prog||0))*dishCook(o.cook.c.dish))+'s':o&&o.hold?'Món đã xong, chờ phục vụ mang ra ✅':'Đang chờ đơn mới'}
  if(p.vendor)return'Bán bánh taiyaki cho người đi đường · '+stallPrice()+' xu/phần';
  if(!st)return'';
  if(st.role=='waiter'){const t=p.e.task;return !t?'Đang rảnh, chờ việc':t.k=='take'?'Đi nhận order 📝':t.k=='pick'?'Vào bếp lấy món 🏃':t.k=='give'?'Bưng '+DISHES[t.c.dish].e+' ra cho khách':'Dọn bàn 🧹'}
  return{greeter:'Đứng ở cổng chào đón khách 🙇',musician:'Chơi đàn shamisen cho khách nghe 🎵',manager:'Đi quanh quán nhặt tiền tip 💰'}[st.role]||''}
function renderInfo(){const el=$('info');if(!infoSel){el.hidden=true;return}const p=infoSel;el.hidden=false;
  if(p.kind=='guest'){const c=p.e;if(!customers.includes(c)){infoSel=null;el.hidden=true;return}
    const[l]=stateOf(c);const sec=c.st=='wait'||c.st=='food'?' · kiên nhẫn còn '+Math.ceil(patSecs(c))+'s':'';
    el.style.setProperty('--c','#8a6a48');
    el.innerHTML=`<div class="por">${c.vip?'👑':'🙂'}</div><div><b>${c.vip?'Khách VIP':'Khách'}<span class="tag">KHÁCH</span></b><small>Gọi món: ${DISHES[c.dish].e} ${DISHES[c.dish].n}</small><small>${c.st=='out'?(c.angry?'Bỏ về vì chờ lâu 😠':'Ăn xong, ra về vui vẻ 😊'):l+sec}</small></div>`;return}
  const st=STAFF.find(s=>s.id==p.sid),role=st?st.role:p.chef?'chef':'vendor',R=ROLE[role];
  el.style.setProperty('--c','var(--orange)');
  el.innerHTML=`<div class="por">${st&&portrait(st)?`<img src="${portrait(st)}" alt="">`:R.e}</div><div><b>${st?st.name:R.n}<span class="tag">${R.e} ${R.n.toUpperCase()}</span></b><small>${st?'<span class="stars">'+'★'.repeat(st.stars)+'</span> · Lv '+S.staff[st.id].lv:'Nhân viên phụ'}</small><small>${staffDoing(p)}</small></div>`}
let infoAt=0;
let badgeOn=null;
function syncInfo(){const g=infoSel&&infoSel.g.userData.badge||null;if(g!==badgeOn){if(badgeOn)badgeOn.visible=false;if(g)g.visible=true;badgeOn=g}if(!infoSel)return;infoT-=1/60;if(infoT<=0){infoSel=null;$('info').hidden=true;return}if(performance.now()-infoAt>300){infoAt=performance.now();renderInfo()}}
$('info').addEventListener('pointerdown',()=>{infoSel=null;$('info').hidden=true});
$('nLegend').onclick=e=>{e.stopPropagation();const el=$('legend');el.hidden=!el.hidden;$('nLegend').classList.toggle('on',!el.hidden);if(el.hidden)return;
  el.innerHTML='<b>Ai là ai?</b><div class="lr"><span class="dot" style="--c:#c9b48a"></span><div>Nhân viên<small>Có vòng trắng mờ dưới chân. Chạm vào để xem tên và việc đang làm.</small></div></div>'+Object.entries(ROLE).map(([k,r])=>`<div class="lr"><span style="font-size:18px;width:20px">${r.e}</span><div>${r.n}<small>${{chef:'Áo trắng, mũ cao, đứng ở bếp',waiter:'Kimono xanh chàm, bưng món, dọn bàn',greeter:'Đứng ở cổng cúi chào',musician:'Ngồi trên bục chơi đàn',manager:'Áo vest, đi nhặt tiền tip',vendor:'Đứng ở quầy taiyaki ven đường'}[k]}</small></div></div>`).join('')+
  '<div class="lr"><span class="dot" style="--c:var(--ok)"></span><div>Khách<small>Không có vòng. Bong bóng món ăn: xanh = ổn, vàng = chờ lâu, đỏ = sắp bỏ về.</small></div></div><div class="lr"><div><small>Chạm vào bất kỳ ai trong quán để xem chi tiết.</small></div></div>'};
// ================= STORY: chapters with clear goals, letters from grandma, staff intros =================
const SPK={ono:{n:'Bác Ono Ryota',f:'👴',c:'#e63946',sid:'ono'},ba:{n:'Thư của bà Kiku',f:'👵',c:'#7a4fd0'},sys:{n:'Mẹo',f:'💡',c:'#1f9d92'}};
const sumQ=()=>Object.values(S.quality).reduce((a,b)=>a+b,0);
const CHAPTERS=[
 {t:'Mở cửa lại tiệm cũ',lines:[
   'Cháu tới rồi à! Ta là Ono Ryota, đầu bếp già của tiệm. Bà Kiku của cháu đi du lịch vòng quanh thế giới và giao lại tiệm này cho cháu.',
   'Tiệm vắng khách mấy năm rồi. Có Hana và Yuki phụ việc, mặc kimono xanh, có vòng xanh ngọc dưới chân. Khách tới thì các cô nhận order, ta nấu ở bếp.',
   {who:'sys',t:'Ăn xong khách để lại túi 💰 trên bàn. Chạm vào để nhặt. Bấm 👥 "Ai là ai" để phân biệt nhân viên và khách.'}],
  goal:{x:'Phục vụ 15 khách',f:()=>[S.served,15]},rw:{c:150},done:['Tốt lắm! Hàng xóm bắt đầu nhắc tới tiệm mình rồi đấy.']},
 {t:'Lá thư từ Kyoto',lines:[{who:'ba',t:'Cháu yêu, bà đang ở Kyoto. Ở đây người ta nói: món ngon là món được chăm chút từng chút một. Cháu thử nâng cấp một món trong Thực đơn nhé! — Bà Kiku'}],
  goal:{x:'Nâng 1 món lên Lv 3',f:()=>[Math.max(...S.menu),3]},rw:{g:2},done:['Món này giờ đắt hàng hơn hẳn. Bà cháu mà biết chắc vui lắm.']},
 {t:'Căn phòng của bà',lines:['Phía sau có căn phòng chiếu tatami bà dùng để đón khách quý. Giờ toàn thùng gỗ. Đủ tiền thì mình dọn ra nhé.'],
  goal:{x:'Mở phòng tatami (cấp 3)',f:()=>[S.areas.tatami?1:0,1]},rw:{c:400},done:['Phòng sạch bóng rồi! Khách VIP 👑 sẽ thích ngồi đây, trả thêm 50%.']},
 {t:'Thêm một đôi tay',lines:['Khách đông, một mình ta nấu không xuể. Bấm Nhân viên, thuê thêm một đầu bếp nhé. Đầu bếp có vòng cam và mũ trắng.'],
  goal:{x:'Có 2 đầu bếp',f:()=>[hired('chef').length,2]},rw:{c:500},done:['Có người phụ bếp rồi, món ra nhanh hơn hẳn!']},
 {t:'Mùi bánh ngoài phố',lines:[{who:'ba',t:'Ở Osaka bà ăn bánh taiyaki nóng hổi ngay trên phố. Tiệm mình nằm sát đường, sao không bán cho người đi bộ nhỉ? — Bà Kiku'}],
  goal:{x:'Mở quầy mang về (cấp 4)',f:()=>[S.areas.stall?1:0,1]},rw:{g:3},done:['Người đi đường xếp hàng mua bánh kìa!']},
 {t:'Bí quyết của bà',lines:['Bí quyết của bà Kiku là nguyên liệu tươi. Ra Chợ cá ghép nguyên liệu lên MAX rồi đưa vào bếp để món có thêm sao ★.'],
  goal:{x:'Đạt tổng 5 ★ nguyên liệu',f:()=>[sumQ(),5]},rw:{c:800},done:['Đúng vị ngày xưa rồi! Khách quen bảo món ngon như hồi bà còn đứng bếp.']},
 {t:'Băng chuyền huyền thoại',lines:[{who:'ba',t:'Ở Tokyo bà thấy những đĩa sushi chạy vòng vòng trên băng chuyền. Khách tự lấy, vui lắm! Cháu thử xem. — Bà Kiku'}],
  goal:{x:'Mở sushi băng chuyền (cấp 6)',f:()=>[S.areas.kaiten?1:0,1]},rw:{g:4},done:['Băng chuyền chạy rồi, tiệm mình thành điểm hẹn của cả phố!']},
 {t:'Tiệm đẹp nhất phố',lines:['Khách bây giờ không chỉ đến ăn, mà còn đến chụp ảnh. Trang trí thêm cho tiệm đẹp nhé: đèn lồng, bonsai, cây anh đào…'],
  goal:{x:'Độ đẹp ✨ đạt 150',f:()=>[beauty(),150]},rw:{c:1500},done:['Đẹp quá! Có người còn đăng ảnh tiệm mình lên mạng nữa đấy.']},
 {t:'Năm sao',lines:['Một nhà phê bình ẩm thực sẽ âm thầm ghé tiệm. Giữ cho khách hài lòng, đừng để ai phải bỏ về nhé!'],
  goal:{x:'Phục vụ 400 khách, đánh giá từ 4,5 ⭐',f:()=>[Math.min(S.served,400)+(rating()>=4.5?0:-1),400]},rw:{g:6},done:['Báo đăng rồi: "Tiệm sushi nhỏ có trái tim lớn"! Ta tự hào về cháu.']},
 {t:'Khu vườn mới',lines:[{who:'ba',t:'Bà nhớ khoảng đất trống trước tiệm. Ngày xưa ông cháu định làm vườn ở đó mà chưa kịp. Cháu làm giúp ông nhé. — Bà Kiku'}],
  goal:{x:'Mở vườn mở rộng (cấp 8)',f:()=>[S.areas.garden2?1:0,1]},rw:{c:3000},done:['Ông cháu mà thấy khu vườn này chắc mỉm cười lắm.']},
 {t:'Lễ hội ẩm thực phố',lines:['Cả phố sắp mở lễ hội ẩm thực, và tiệm mình được mời làm gian hàng chính! Hãy đưa tiệm lên cấp 12.'],
  goal:{x:'Đạt cấp 12',f:()=>[S.level,12]},rw:{g:10},done:['Lễ hội thành công rực rỡ! Và… có một lá thư mới vừa tới.']},
 {t:'Bà về thăm',lines:[{who:'ba',t:'Cháu yêu, bà đã đọc hết tin tức về tiệm. Bà đang trên chuyến bay về nhà đây! Nấu cho bà một đĩa sushi ngon nhất nhé. — Bà Kiku'}],
  goal:{x:'Đạt cấp 15 để đón bà',f:()=>[S.level,15]},rw:{g:20},done:[{who:'ba',t:'Bà về rồi đây! Tiệm sáng đèn, đông khách, ai cũng cười. Cảm ơn cháu đã giữ lửa cho căn bếp của bà. Từ nay đây là tiệm của cháu.'},'Hết phần truyện chính. Cháu cứ tiếp tục làm tiệm đẹp hơn nữa nhé!']},
];
const STAFF_INTRO={takeshi:'Takeshi đây! Tôi từng nấu ở một khách sạn lớn. Giao chảo cho tôi!',mei:'Em là Mei! Em sẽ đứng ở cổng cúi chào từng khách một.',mai:'Mai xin chào! Em đi nhanh lắm, khách không phải chờ đâu.',
  haru:'Haru đây. Tiếng đàn shamisen sẽ làm món ăn ngon hơn, tin tôi đi.',sora:'Sora tới rồi! Bưng năm đĩa một lúc cũng được!',kenji:'Kenji, quản lý. Tôi sẽ thu tip và để mắt tới mọi thứ.',
  ren:'Yo, Ren đây! Bánh taiyaki của tôi giòn rụm, người qua đường không cưỡng nổi.',aiko:'Aiko. Tôi học làm sushi ở Hokkaido mười năm. Rất vui được làm việc.',kaito:'Kaito, phục vụ hạng nhất. Khách VIP cứ để tôi lo.'};
function talkPortrait(sp){if(sp.sid){const st=STAFF.find(s=>s.id==sp.sid);const p=st&&portrait(st);if(p)return`<img src="${p}" alt="">`}return sp.f}
// chapter tracker
function chapter(){return CHAPTERS[Math.min(S.chapter,CHAPTERS.length-1)]}
function startChapter(){const ch=chapter();if(S.chapter>=CHAPTERS.length)return;talk(ch.lines);renderChap()}
function chapProgress(){const ch=chapter(),[a,b]=ch.goal.f();return[Math.max(0,Math.min(a,b)),b]}
let chapKey='';
function renderChap(){const el=$('chap');if(S.chapter>=CHAPTERS.length){el.innerHTML='<span class="ct">📖 Truyện chính đã xong</span><small>Tiệm của bạn là số 1 phố!</small>';el.classList.remove('ready');return}
  const ch=chapter(),[a,b]=chapProgress(),ok=a>=b,key=S.chapter+'|'+a+'|'+b;if(key===chapKey)return;chapKey=key;
  el.classList.toggle('ready',ok);
  el.innerHTML=`<span class="ct">📖 Chương ${S.chapter+1}: ${ch.t}</span><small>${ok?'✅ Hoàn thành! Chạm để nhận thưởng':'🎯 '+ch.goal.x+' · '+(b>1?a+'/'+b:'chưa xong')}</small><span class="cb"><i style="width:${Math.round(a/b*100)}%"></i></span>`}
$('chap').addEventListener('click',()=>{if(S.chapter>=CHAPTERS.length)return;const ch=chapter(),[a,b]=chapProgress();
  if(a<b){talk([{who:'sys',t:'Mục tiêu chương này: '+ch.goal.x+'.'},...ch.lines]);return}
  if(ch.rw.c)S.coins+=ch.rw.c;if(ch.rw.g)S.gems+=ch.rw.g;sfx('level');toast('Nhận '+(ch.rw.c?ch.rw.c+' 🪙 ':'')+(ch.rw.g?ch.rw.g+' 💎':''));
  talk(ch.done);S.chapter++;chapKey='';save();setTimeout(startChapter,300)});
// ================= RETENTION: offline earnings, daily login, daily chest, collection book =================
const today=()=>{const d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()};
const LOGIN=[{c:150},{g:2},{c:300},{q:1},{c:600},{g:5},{c:1000,g:10}];
const loginText=r=>[r.c?r.c+' 🪙':'',r.g?r.g+' 💎':'',r.q?'Nguyên liệu ★':''].filter(Boolean).join(' + ');
let popQ=[];
function popup(title,render){popQ.push([title,render]);if($('modal').hidden&&popQ.length==1)nextPop()}
function nextPop(){const p=popQ.shift();if(p)openModal(p[0],p[1])}
function offlinePanel(){const g=offlineGain;
  $('mBody').innerHTML=`<div class="area done"><div class="ban">😴💰</div><div class="tx"><div><b>Trong lúc bạn vắng ${fmtDur(offlineSecs)}</b><small>Bác Ono và các nhân viên vẫn mở tiệm, kiếm được <b>${g} 🪙</b>. (Tính tối đa 8 giờ.)</small></div></div></div>
  <div style="display:flex;gap:8px">${btn('Nhận '+g+' 🪙',true,'','off:1')}${btn('Nhận x2 · 2 💎',S.gems>=2,'o','off:2')}</div>`}
const fmtDur=s=>s>=3600?Math.floor(s/3600)+' giờ '+Math.floor(s%3600/60)+' phút':Math.max(1,Math.floor(s/60))+' phút';
let offlineGain=0,offlineSecs=0;
function loginPanel(){const can=S.daily.last!==today();
  $('mBody').innerHTML=`<div class="sec">Ghé tiệm mỗi ngày để nhận quà. Ngày 7 có quà lớn!</div><div class="days">${LOGIN.map((r,i)=>{const st=i<S.daily.idx?'got':i==S.daily.idx&&can?'now':'';
    return`<div class="day ${st} ${i==6?'big':''}"><small>Ngày ${i+1}</small><span>${r.g&&!r.c?'💎':r.q?'🍣':i==6?'🎁':'🪙'}</span><small>${loginText(r)}</small>${st=='got'?'<em>✓</em>':''}</div>`}).join('')}</div>
  ${can?btn('Nhận quà hôm nay',true,'o','login'):'<div class="sec" style="text-align:center">Đã nhận hôm nay. Mai quay lại nhé! 👋</div>'}`}
function bookPanelHTML(){const tot=DISHES.length*3,got=DISHES.reduce((a,_,i)=>a+(S.medal&&S.medal[i]||0),0);
  return`<div class="sec">Sổ tay món ăn: bán đủ số phần để nhận huy chương 🥉 10 · 🥈 50 · 🥇 150. Đã sưu tập ${got}/${tot}.</div><div class="prog"><i style="width:${got/tot*100}%"></i></div><div class="dgrid">${DISHES.map((d,i)=>{
    const n=S.dc[i]||0,m=S.medal[i]||0,next=[10,50,150][m],lock=d.unlock>S.level,can=next&&n>=next;
    return`<div class="dish ${lock?'lock':''}"><div class="pic" style="height:48px;font-size:32px">${d.e}</div><b>${lock?'???':d.n}</b><small>Đã bán ${n} phần · ${['','🥉','🥉🥈','🥉🥈🥇'][m]||'chưa có'}</small>
      ${next?(can?btn('Nhận '+['🥉','🥈','🥇'][m],true,'o','medal:'+i):`<small>Tiếp theo: ${next} phần</small>`):'<small><b>Đủ bộ!</b></small>'}</div>`}).join('')}</div>`}
function settingsHTML(){return`<div class="it"><span class="e">🎵</span><div class="m"><b>Nhạc nền</b><small>Giai điệu đàn koto nhẹ nhàng</small></div>${btn(S.sound.music?'Đang bật':'Đang tắt',true,S.sound.music?'':'r','snd:music')}</div>
  <div class="it"><span class="e">🔔</span><div class="m"><b>Âm thanh</b><small>Tiếng xu, chuông cửa, xe cộ…</small></div>${btn(S.sound.sfx?'Đang bật':'Đang tắt',true,S.sound.sfx?'':'r','snd:sfx')}</div>
  <div class="it"><span class="e">↺</span><div class="m"><b>Chơi lại từ đầu</b><small>Xoá tiến trình đã lưu trên trình duyệt này.</small></div>${btn(resetArm?'Chắc chắn?':'Chơi lại',true,'r','reset')}</div>`}
function chestLine(){if(S.qd.day!==today())S.qd={day:today(),done:0,chest:0};
  return`<div class="hot"><span class="e">${S.qd.chest?'📦':'🎁'}</span><div style="flex:1">Rương nhiệm vụ hôm nay: ${Math.min(5,S.qd.done)}/5<br><small style="font-weight:600;color:#8a5a00">${S.qd.chest?'Đã mở hôm nay':'Hoàn thành 5 nhiệm vụ để nhận 5 💎 + 500 🪙'}</small></div>${!S.qd.chest&&S.qd.done>=5?btn('Mở',true,'o','chest'):''}</div>`}
function onClaimQuest(){if(S.qd.day!==today())S.qd={day:today(),done:0,chest:0};S.qd.done++}
function startSession(){
  if(S.seen&&S.ips>0){offlineSecs=Math.min(8*3600,(Date.now()-S.seen)/1000);if(offlineSecs>120){offlineGain=Math.round(offlineSecs*S.ips*.3);if(offlineGain>0)popup('Chào mừng trở lại!',offlinePanel)}}
  if(S.daily.last!==today())popup('Quà đăng nhập',loginPanel);
  if(S.story==0){S.story=1;startChapter()}else{renderChap();if(!popQ.length&&$('modal').hidden)toast('Chào mừng trở lại tiệm! 🍣')}}
// ================= BOTTLENECK HINTS =================
let fullT=0;
function hints(){const H=[];const q=orders.filter(o=>o.st=='queued').length,ns=stoves().length;
  if(q>=Math.max(2,ns*2))H.push(['🔥','Bếp quá tải: '+q+' món đang chờ nấu','Thuê đầu bếp hoặc nâng cấp Thiết bị bếp','staff']);
  const w=customers.filter(c=>c.st=='wait'&&c.kind=='table'&&!claimedC(c)).length;if(w>=Math.max(3,waiters.length*2))H.push(['👘','Thiếu phục vụ: '+w+' bàn chờ gọi món','Thuê thêm phục vụ','staff']);
  if(fullT>8)H.push(['🪑','Hết chỗ ngồi, khách không vào được','Đặt thêm bàn ghế ở Trang trí','deco']);
  return H}
// ================= SOUND: synthesised with WebAudio, no files to load =================
const AU={ctx:null,out:null,mus:null,next:0,step:0,last:{}};
function audioInit(){if(AU.ctx)return;try{const C=window.AudioContext||window.webkitAudioContext;if(!C)return;AU.ctx=new C();AU.out=AU.ctx.createGain();AU.out.gain.value=.55;AU.out.connect(AU.ctx.destination);
  AU.mus=AU.ctx.createGain();AU.mus.gain.value=.16;AU.mus.connect(AU.out)}catch(e){AU.ctx=null}}
function tone(f,at,dur,type='sine',vol=.2,dest){const c=AU.ctx;if(!c)return;const o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.value=f;
  g.gain.setValueAtTime(0,at);g.gain.linearRampToValueAtTime(vol,at+.008);g.gain.exponentialRampToValueAtTime(.0005,at+dur);o.connect(g);g.connect(dest||AU.out);o.start(at);o.stop(at+dur+.05)}
function noise(at,dur,vol=.1,freq=3000){const c=AU.ctx;if(!c)return;const b=c.createBuffer(1,Math.floor(c.sampleRate*dur),c.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
  const s=c.createBufferSource();s.buffer=b;const f=c.createBiquadFilter();f.type='bandpass';f.frequency.value=freq;const g=c.createGain();g.gain.setValueAtTime(vol,at);g.gain.exponentialRampToValueAtTime(.001,at+dur);s.connect(f);f.connect(g);g.connect(AU.out);s.start(at)}
function sfx(k){if(!AU.ctx||!S.sound.sfx||AU.ctx.state!='running')return;const t=AU.ctx.currentTime;if(AU.last[k]&&t-AU.last[k]<.09)return;AU.last[k]=t;
  if(k=='coin'){tone(1318,t,.09,'square',.05);tone(1760,t+.07,.16,'square',.045)}
  else if(k=='pop'){tone(660,t,.07,'triangle',.08)}
  else if(k=='chime'){tone(1046,t,.5,'triangle',.07);tone(784,t+.18,.6,'triangle',.06)}
  else if(k=='angry'){tone(140,t,.25,'sawtooth',.05);tone(110,t+.1,.25,'sawtooth',.05)}
  else if(k=='level'){[523,659,784,1046].forEach((f,i)=>tone(f,t+i*.1,.35,'triangle',.08))}
  else if(k=='sizzle'){noise(t,.35,.04,5000)}
  else if(k=='honk'){tone(392,t,.18,'square',.03);tone(392,t+.24,.25,'square',.03)}
  else if(k=='merge'){tone(784,t,.08,'sine',.08);tone(1175,t+.06,.18,'sine',.08)}}
// koto-like melody on the Japanese "in" scale, scheduled ahead in small steps
const SCALE=[293.7,311.1,392,440,466.2,587.3,622.3,784];
const MEL=[0,2,3,4,3,2,0,-1,5,4,3,2,3,-1,1,0, 2,3,5,6,5,4,3,-1,2,3,4,3,2,1,0,-1];
function musicTick(){if(!AU.ctx||AU.ctx.state!='running')return;const c=AU.ctx;AU.mus.gain.value=S.sound.music?.16:0;if(!S.sound.music)return;
  if(AU.next<c.currentTime)AU.next=c.currentTime+.05;
  while(AU.next<c.currentTime+.4){const n=MEL[AU.step%MEL.length];if(n>=0){tone(SCALE[n]*(dayNight.night>.5?.5:1),AU.next,.9,'triangle',.22,AU.mus);tone(SCALE[n]*2,AU.next,.25,'sine',.05,AU.mus)}
    if(AU.step%8==0)tone(SCALE[0]/2,AU.next,1.8,'sine',.18,AU.mus);AU.next+=.32;AU.step++}}
document.addEventListener('pointerdown',e=>{audioInit();if(AU.ctx&&AU.ctx.state=='suspended')AU.ctx.resume();if(e.target.closest('button'))sfx('pop')},true);
// ================= DAY / NIGHT: 24 in-game hours pass in 8 minutes; lunch and dinner rush =================
const dayNight={night:0};
const SKY=[[0,'#18233f'],[5,'#2a3157'],[6.5,'#ffc9a8'],[9,'#cde9f5'],[16,'#d6ecf5'],[18,'#ffb38a'],[19.5,'#5a4a7a'],[21,'#1c2748'],[24,'#18233f']];
const lerpC=(a,b,t)=>new THREE.Color(a).lerp(new THREE.Color(b),t);
function skyAt(h){for(let i=0;i<SKY.length-1;i++)if(h>=SKY[i][0]&&h<=SKY[i+1][0])return lerpC(SKY[i][1],SKY[i+1][1],(h-SKY[i][0])/(SKY[i+1][0]-SKY[i][0]));return new THREE.Color(SKY[0][1])}
const nightAt=h=>h<5||h>21?1:h<7?(7-h)/2:h>18.5?(h-18.5)/2.5:0;
function rush(h){return h>=11&&h<13.5||h>=18&&h<21?1.45:h>=23||h<6?.5:1}
const glowTex=canvasTex(64,64,x=>{const g=x.createRadialGradient(32,32,1,32,32,31);g.addColorStop(0,'rgba(255,214,140,.95)');g.addColorStop(.35,'rgba(255,180,90,.45)');g.addColorStop(1,'rgba(255,160,60,0)');x.fillStyle=g;x.fillRect(0,0,64,64)});
const glows=[];function glow(x,y,z,s=1.4){const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:0}));sp.position.set(x,y,z);sp.scale.setScalar(s);scene.add(sp);glows.push(sp)}
lanterns.forEach(l=>glow(l.position.x,l.position.y,l.position.z,1.2));
for(let z=-20;z<H+22;z+=8){glow(W+1.3,3,z,2.2);glow(W+7,3,z+4,2.2)}
[[5.9,1.45,.3],[10.2,1.45,.3],[.3,1.45,6.8]].forEach(([x,y,z])=>glow(x,y,z,2));
let hemi=null;scene.traverse(o=>{if(o.isHemisphereLight)hemi=o});
function syncDay(dt){S.tod=((S.tod==null?10:S.tod)+dt*S.speed*24/480)%24;const h=S.tod,n=nightAt(h);dayNight.night=n;
  const sky=skyAt(h);scene.background.copy(sky);scene.fog.color.copy(sky);
  const warm=h>16.5&&h<19.5||h>5&&h<7.5;sun.intensity=.62*(1-n*.6);sun.color.set(warm?'#ffb070':'#ffe6c8');
  if(hemi){hemi.intensity=.52*(1-n*.3);hemi.color.set(n>.5?'#9fb0e0':'#fff0e0')}
  sun.position.set(W/2+Math.cos(h/24*Math.PI*2-Math.PI/2)*14+6,6+Math.max(0,Math.sin((h-6)/12*Math.PI))*16,H+2);
  for(const g of glows)g.material.opacity=n*.95;
  const hh=Math.floor(h),mm=Math.floor((h-hh)*60);$('clock').textContent=(n>.5?'🌙 ':h<11?'🌅 ':h<17?'☀️ ':'🌇 ')+String(hh).padStart(2,'0')+':'+String(mm).padStart(2,'0')+(rush(h)>1?' 🔥':'')}

window.__game={sim:{tick,STAFF,AREAS,DISHES,dishUpCost,trainCost,unlockArea,syncWaiters,ensureStage,unlocked,ensureQuests,beauty,get orders(){return orders},clearEvents:()=>{events.length=0}},proj:()=>{const r=cv.getBoundingClientRect();return people().filter(p=>p.kind=='staff'&&p.e).map(p=>{const v=new THREE.Vector3();p.g.getWorldPosition(v);v.y+=.6;v.project(cam);return[r.left+(v.x+1)/2*r.width,r.top+(1-v.y)/2*r.height]}).find(([x,y])=>x>60&&x<340&&y>320&&y<r.bottom-40)||null},S,view,unlockArea,get customers(){return customers},goalT,setR:r=>{goalR=r;zoomed=true},clearTalk:()=>{talkQ=[];$('talk').hidden=true},LOW};
}
// ================= BOOT: load three.js (with a second CDN as backup), show readable errors =================
function bootFail(msg){const b=document.getElementById('boot');if(!b)return;b.hidden=false;document.getElementById('bootMsg').textContent='Ối, tiệm chưa mở được';
  const p=document.getElementById('bootErr');p.hidden=false;p.textContent=String(msg&&msg.message||msg);const k=document.getElementById('bootBtn');k.hidden=false;k.onclick=()=>location.reload()}
window.addEventListener('error',e=>{if(!document.getElementById('boot').hidden||!window.__game)bootFail(e.error||e.message)});
function bootRun(){
  const t=document.createElement('canvas');if(!(t.getContext('webgl')||t.getContext('experimental-webgl'))){bootFail('Trình duyệt hoặc thiết bị này không bật WebGL nên không vẽ được 3D.');return}
  try{startGame()}catch(e){console.error(e);bootFail(e)}}
if(window.THREE)bootRun();
else{document.getElementById('bootMsg').textContent='Đang tải đồ họa 3D…';const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.min.js';
  s.onload=bootRun;s.onerror=()=>bootFail('Không tải được thư viện đồ họa three.js từ cả cdnjs và jsdelivr. Hãy kiểm tra mạng rồi tải lại.');document.head.appendChild(s)}
</script>
