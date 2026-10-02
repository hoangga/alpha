<script>
function startGame(){'use strict';
// ================= DATA =================
const W=12,H=18,DOOR=[11,11];
const landLocked=(x,y)=>y>=14&&!S.areas.garden2;
const inKitchen=(x,y)=>x>=9&&x<=11&&y>=0&&y<=4;
const inTatami=(x,y)=>x>=0&&x<=3&&y>=0&&y<=3;
const CHAINS={
  fish:{n:'Hải sản',items:['🦐','🐟','🐠','🍣']},
  rice:{n:'Gạo',items:['🌾','🍚','🍙','🍘']},
  veg:{n:'Rau củ',items:['🌱','🥬','🥕','🥗']},
  meat:{n:'Thịt',items:['🐔','🍗','🍖','🥩']},
  sweet:{n:'Đồ ngọt',items:['🥛','🥚','🍯','🍮']},
  tea:{n:'Trà',items:['🍃','🌿','🍵']},
};
const UPG={
  kit:{n:'Thiết bị bếp',e:'🍳',d:l=>`Nấu nhanh hơn ${l*10}%`,base:400,max:10},
  sign:{n:'Biển hiệu & quảng cáo',e:'📣',d:l=>`Khách tới nhiều hơn ${l*8}%`,base:500,max:8},
  till:{n:'Két tiền & dịch vụ',e:'💴',d:l=>`Tiền tip nhiều hơn ${l*12}%`,base:450,max:8},
  seat:{n:'Ghế êm & khăn ấm',e:'🛋️',d:l=>`Khách kiên nhẫn thêm ${l*6}%`,base:350,max:8},
};
const upgCost=k=>Math.round(UPG[k].base*1.75**(S.upg[k]||0));
const MCATS=[['sushi','🍣 Sushi'],['bowl','🍜 Mì & cơm'],['fry','🍤 Chiên nướng'],['sweet','🍡 Tráng miệng'],['drink','🍵 Đồ uống']];
const DISHES=[
  {e:'🍣',n:'Sushi cá hồi',base:14,cook:5,unlock:1,ch:'fish',cat:'sushi'},
  {e:'🍙',n:'Cơm nắm',base:8,cook:3,unlock:1,ch:'rice',cat:'sushi'},
  {e:'🍵',n:'Trà xanh',base:6,cook:2,unlock:1,ch:'tea',cat:'drink'},
  {e:'🍜',n:'Mì ramen',base:18,cook:6,unlock:2,ch:'veg',cat:'bowl'},
  {e:'🍡',n:'Bánh dango',base:10,cook:3,unlock:2,ch:'sweet',cat:'sweet'},
  {e:'🥤',n:'Soda chanh',base:7,cook:2,unlock:3,ch:'tea',cat:'drink'},
  {e:'🍤',n:'Tôm tempura',base:22,cook:6,unlock:3,ch:'fish',cat:'fry'},
  {e:'🥟',n:'Há cảo gyoza',base:16,cook:5,unlock:4,ch:'meat',cat:'fry'},
  {e:'🍢',n:'Lẩu oden',base:15,cook:5,unlock:4,ch:'veg',cat:'bowl'},
  {e:'🍱',n:'Cơm hộp bento',base:32,cook:8,unlock:5,ch:'rice',cat:'bowl'},
  {e:'🐙',n:'Bánh takoyaki',base:20,cook:5,unlock:5,ch:'fish',cat:'fry'},
  {e:'🍮',n:'Pudding trứng',base:14,cook:4,unlock:6,ch:'sweet',cat:'sweet'},
  {e:'🍛',n:'Cơm cà ri Nhật',base:28,cook:7,unlock:7,ch:'meat',cat:'bowl'},
  {e:'🍧',n:'Đá bào kakigori',base:16,cook:3,unlock:7,ch:'sweet',cat:'sweet'},
  {e:'🦀',n:'Sushi cua hoàng đế',base:45,cook:8,unlock:8,ch:'fish',cat:'sushi'},
  {e:'🍶',n:'Rượu sake',base:24,cook:2,unlock:9,ch:'rice',cat:'drink'},
  {e:'🍗',n:'Gà karaage',base:26,cook:6,unlock:9,ch:'meat',cat:'fry'},
  {e:'🥩',n:'Bò wagyu nướng',base:70,cook:10,unlock:10,ch:'meat',cat:'fry'},
  {e:'🦞',n:'Sashimi tôm hùm',base:90,cook:10,unlock:12,ch:'fish',cat:'sushi'},
  {e:'🍨',n:'Kem trà xanh',base:18,cook:3,unlock:11,ch:'tea',cat:'sweet'},
];
// staff roster: role, stars (rarity), cost in coins (c) or gems (g), level required
const STAFF=[
  {id:'ono',name:'Ono Ryota',role:'chef',stars:4,start:1,look:{skin:'#f9d3b0',hair:'#d8d8d8',eye:'#4a2e1a',style:'short',outfit:'chef',beard:true}},
  {id:'hana',name:'Hana',role:'waiter',stars:2,start:1,look:{skin:'#ffe3cc',hair:'#2b1b12',eye:'#4a2e1a',style:'bun',outfit:'kimono',kimono:'#2c4a8a',female:true}},
  {id:'yuki',name:'Yuki',role:'waiter',stars:2,start:1,look:{skin:'#f9d3b0',hair:'#1a1a2e',eye:'#2d4a7a',style:'bun',outfit:'kimono',kimono:'#2c4a8a',female:true}},
  {id:'takeshi',name:'Takeshi',role:'chef',stars:3,c:600,lv:3,look:{skin:'#e8b48a',hair:'#1a1a2e',eye:'#2a2a2a',style:'spiky',outfit:'chef'}},
  {id:'mei',name:'Mei',role:'greeter',stars:3,c:500,lv:2,look:{skin:'#ffe3cc',hair:'#f08aa8',eye:'#6a3a2a',style:'twin',outfit:'kimono',kimono:'#ff8fc8',female:true}},
  {id:'mai',name:'Mai',role:'waiter',stars:3,c:450,lv:2,look:{skin:'#f9d3b0',hair:'#5a3820',eye:'#3a6a3a',style:'bun',outfit:'kimono',kimono:'#2c4a8a',female:true}},
  {id:'haru',name:'Haru',role:'musician',stars:4,c:900,lv:5,look:{skin:'#f9d3b0',hair:'#3d2a1e',eye:'#4a2e1a',style:'short',outfit:'kimonoV',color:'#2c4a8a'}},
  {id:'sora',name:'Sora',role:'waiter',stars:3,c:900,lv:4,look:{skin:'#e8b48a',hair:'#e8c066',eye:'#2d4a7a',style:'pony',outfit:'kimono',kimono:'#2c4a8a',female:true}},
  {id:'kenji',name:'Kenji',role:'manager',stars:4,g:12,lv:6,look:{skin:'#f9d3b0',hair:'#2b1b12',eye:'#2a2a2a',style:'short',outfit:'office',glasses:true}},
  {id:'ren',name:'Ren',role:'vendor',stars:3,c:700,lv:4,look:{skin:'#ffe3cc',hair:'#c0392b',eye:'#6a3a2a',style:'spiky',outfit:'hoodie',color:'#ff9f1c'}},
  {id:'aiko',name:'Aiko',role:'chef',stars:5,g:15,lv:7,look:{skin:'#ffe3cc',hair:'#6d4c9f',eye:'#6d4c9f',style:'long',outfit:'chef',female:true}},
  {id:'kaito',name:'Kaito',role:'waiter',stars:5,g:15,lv:9,look:{skin:'#c48a60',hair:'#1a1a1a',eye:'#2a2a2a',style:'spiky',outfit:'kimono',kimono:'#2c4a8a'}},
];
const ROLE={chef:{n:'Đầu bếp',e:'👨‍🍳',c:'#f07c1b'},waiter:{n:'Phục vụ',e:'👘',c:'#1f9d92'},greeter:{n:'Lễ tân',e:'🙇',c:'#e0457b'},musician:{n:'Nhạc công',e:'🪕',c:'#7a4fd0'},manager:{n:'Quản lý',e:'🕴️',c:'#2c4a8a'},vendor:{n:'Bán mang về',e:'🏪',c:'#d99a00'}};
// catalogue: c = coins, g = gems, b = beauty; zone: kitchen | patio | inside
const T={
  table:{n:'Bàn gỗ',e:'🪵',c:60,cat:'ban'},
  chair:{n:'Ghế gỗ',e:'🪑',c:25,cat:'ban',seat:1},
  stove:{n:'Bếp nấu',e:'🔥',c:240,cat:'bep',zone:'kitchen'},
  bonsai:{n:'Bonsai',e:'🌳',c:60,cat:'trang',b:4},
  ikebana:{n:'Bình hoa',e:'💐',c:35,cat:'trang',b:2},
  lantern:{n:'Đèn lồng',e:'🏮',c:80,cat:'trang',b:4},
  rug:{n:'Thảm cói',e:'🟤',c:35,cat:'trang',b:2,flat:1},
  maneki:{n:'Mèo may mắn',e:'🐱',c:150,cat:'trang',b:8},
  toro:{n:'Đèn đá',e:'🗿',c:120,cat:'trang',b:6,zone:'patio'},
  umbrella:{n:'Dù giấy',e:'⛱️',c:90,cat:'trang',b:4,zone:'patio'},
  koto:{n:'Đàn koto',e:'🎵',g:10,cat:'vip',b:15,zone:'inside'},
  shishi:{n:'Máng tre',e:'🎋',g:15,cat:'vip',b:22,zone:'patio'},
  sakura:{n:'Cây anh đào',e:'🌸',g:20,cat:'vip',b:30,zone:'patio'},
  // building parts (not for sale)
  wall:{fixed:1},fence:{fixed:1},counter:{fixed:1},fridge:{fixed:1},sink:{fixed:1},shoji:{fixed:1},bar:{fixed:1},belt:{fixed:1},crate:{fixed:1},pond:{fixed:1},bigsakura:{fixed:1},stall:{fixed:1},stage:{fixed:1},
  stool:{fixed:1,seat:1},cushion:{fixed:1,seat:1},lowtable:{fixed:1},
};
const TABLES={table:'table',lowtable:'table',bar:'bar',belt:'belt'};

const CATS=[['ban','Bàn ghế'],['bep','Bếp'],['trang','Trang trí'],['vip','💎 Cao cấp'],['sell','🗑️ Bán']];
const AREAS={
  tatami:{n:'Phòng chiếu tatami',e:'🎎',lv:3,c:900,d:'Phòng riêng kiểu Nhật. Khách VIP thích ngồi đây, trả thêm 50%.'},
  kaiten:{n:'Sushi băng chuyền',e:'🍣',lv:6,c:4500,d:'Khách tự lấy đĩa trên băng chuyền, không cần phục vụ.'},
  stall:{n:'Quầy mang về ven đường',e:'🏪',lv:4,c:2200,d:'Người đi bộ ngoài phố ghé mua bánh taiyaki mang đi. Thuê Ren để bán nhanh hơn.'},
  garden2:{n:'Vườn mở rộng',e:'🌳',lv:8,c:8000,d:'Thêm 4 hàng đất phía trước: 2 bàn ăn ngoài trời và chỗ trang trí rộng rãi.'},
};
const QUEST_T=[
  {k:'serve',n:'Phục vụ {n} khách',e:'🍽️',n0:6},
  {k:'earn',n:'Kiếm {n} xu',e:'🪙',n0:250},
  {k:'tips',n:'Nhặt tiền tip {n} lần',e:'💰',n0:4},
  {k:'merge',n:'Ghép nguyên liệu {n} lần',e:'🐟',n0:5},
  {k:'vip',n:'Phục vụ {n} khách VIP',e:'👑',n0:1},
  {k:'decor',n:'Đặt {n} món trang trí',e:'🏮',n0:2},
  {k:'dish',n:'Bán {n} phần {d}',e:'🍣',n0:4},
  {k:'stall',n:'Bán {n} phần mang về',e:'🏪',n0:5},
];
// ================= STATE =================
const S={coins:300,gems:5,xp:0,level:1,served:0,rSum:0,rN:0,speed:1,mode:'play',sel:null,cat:'ban',
  items:[],menu:DISHES.map(()=>1),quests:[],areas:{tatami:false,kaiten:false,stall:false,garden2:false},
  grid:Array(20).fill(null),quality:{fish:0,rice:0,veg:0,meat:0,sweet:0,tea:0},story:0,hot:0,hotT:120,upg:{kit:0,sign:0,till:0,seat:0},medal:DISHES.map(()=>0),tod:9,dc:DISHES.map(()=>0),lost:0,ips:0,seen:0,daily:{idx:0,last:''},qd:{day:'',done:0,chest:0},chapter:0,chGoalDone:false,sound:{music:true,sfx:true},
  staff:Object.fromEntries(STAFF.map(s=>[s.id,{hired:!!s.start,lv:1}]))};
let uid=1;
const add=(type,x,y,extra)=>{const o=Object.assign({id:uid++,type,x,y,born:performance.now()},extra);S.items.push(o);return o};
const at=(x,y)=>S.items.find(o=>o.x==x&&o.y==y&&!T[o.type].flat)||null;
const rugAt=(x,y)=>S.items.find(o=>o.x==x&&o.y==y&&T[o.type].flat)||null;
const isDoor=(x,y)=>x==DOOR[0]&&y==DOOR[1];
function defaultLayout(){
  [['table',2,6],['chair',1,6],['chair',3,6],['table',5,7],['chair',4,7],['chair',6,7],['table',3,12],['chair',2,12],['chair',4,12],
   ['umbrella',5,12],['bonsai',0,8],['lantern',7,8],['ikebana',3,8],['toro',10,10],['stove',10,0],['stove',11,0]].forEach(a=>add(...a))}
function fixedLayout(){
  add('counter',9,0);add('sink',9,1);add('fridge',11,3);
  for(const y of[0,1,2,3])add('wall',8,y);
  for(const x of[8,9,10,11])add('bar',x,5);
  for(const x of[9,10,11])add('stool',x,6,{face:[0,-1]});
  for(let x=0;x<W;x++)if(x!=5&&x!=6)add('fence',x,9);
  add('pond',8,12,{main:1});add('pond',9,12);add('pond',8,13);add('pond',9,13);
  add('bigsakura',1,11);
  for(const y of[0,1,2,3,4])add('shoji',4,y);for(const x of[0,1,3])add('shoji',x,4);
  for(const k in AREAS)buildArea(k,S.areas[k]);
}
function buildArea(k,open){
  if(k=='tatami'){
    if(open){[[1,1],[1,3]].forEach(([x,y])=>add('lowtable',x,y));[[0,1,[1,0]],[2,1,[-1,0]],[1,0,[0,1]],[0,3,[1,0]],[2,3,[-1,0]]].forEach(([x,y,f])=>add('cushion',x,y,{face:f}))}
    else [[1,1],[2,2],[1,3],[0,2]].forEach(([x,y])=>add('crate',x,y,{area:'tatami'}))}
  if(k=='kaiten'){
    if(open){for(const x of[5,6])for(const y of[1,2,3])add('belt',x,y,{main:x==5&&y==1});
      [[7,1,[-1,0]],[7,2,[-1,0]],[7,3,[-1,0]],[5,4,[0,-1]],[6,4,[0,-1]],[5,0,[0,1]],[6,0,[0,1]]].forEach(([x,y,f])=>add('stool',x,y,{face:f}))}
    else [[5,1],[6,2],[5,3],[6,1]].forEach(([x,y])=>add('crate',x,y,{area:'kaiten'}))}
  if(k=='stall'){if(open)add('stall',11,13);else add('crate',11,13,{area:'stall'})}
  if(k=='garden2'&&open&&!S.items.some(o=>o.y>=14)){[['table',3,15],['chair',2,15],['chair',4,15],['table',8,15],['chair',7,15],['chair',9,15],['umbrella',6,16],['toro',0,17],['bonsai',11,17]].forEach(a=>add(...a))}
}
function unlockArea(k){S.items=S.items.filter(o=>o.area!==k);S.areas[k]=true;buildArea(k,true);events.push({k:'unlock',a:k})}
const hired=r=>STAFF.filter(s=>s.role==r&&S.staff[s.id].hired);
const staffPow=s=>s.stars*(1+.2*(S.staff[s.id].lv-1));
const musicBonus=()=>hired('musician').reduce((a,s)=>a+Math.round(staffPow(s)*3),0);
const beauty=()=>S.items.reduce((s,o)=>s+(T[o.type].b||0),0)+(S.areas.tatami?10:0)+(S.areas.kaiten?15:0)+(S.areas.garden2?12:0)+musicBonus();
const greetBonus=()=>hired('greeter').reduce((a,s)=>a+.06*staffPow(s),0);
const hasManager=()=>hired('manager').length>0;
const trainCost=s=>Math.round((s.c||s.g*80||300)*.6*1.7**(S.staff[s.id].lv-1));
const dishPrice=i=>Math.round(DISHES[i].base*(1+.25*(S.menu[i]-1))*(1+.12*(S.quality[DISHES[i].ch]||0)));
const dishCook=i=>DISHES[i].cook*1.6/(1+hired('chef').reduce((a,s)=>a+.15*staffPow(s),0))/(1+.1*S.upg.kit);
const dishUpCost=i=>Math.round(DISHES[i].base*12*1.55**(S.menu[i]-1));
const unlocked=()=>DISHES.map((d,i)=>i).filter(i=>DISHES[i].unlock<=S.level);
const MAX_LV=15;
const xpNeed=()=>Math.round(200*1.55**(S.level-1));
const rating=()=>S.rN?S.rSum/S.rN:5;

// ================= SAVE (this browser only) =================
const SAVE='nhtp_save_v7';
function save(){try{localStorage.setItem(SAVE,JSON.stringify({coins:S.coins,gems:S.gems,xp:S.xp,level:S.level,served:S.served,rSum:S.rSum,rN:S.rN,menu:S.menu,staff:S.staff,hot:S.hot,quests:S.quests,upg:S.upg,dc:S.dc,lost:S.lost,ips:S.ips,seen:Date.now(),daily:S.daily,qd:S.qd,chapter:S.chapter,sound:S.sound,medal:S.medal,tod:S.tod,areas:S.areas,grid:S.grid,quality:S.quality,story:S.story,
  items:S.items.filter(o=>!T[o.type].fixed).map(o=>[o.type,o.x,o.y])}))}catch(e){}}
function load(){let d=null;try{d=JSON.parse(localStorage.getItem(SAVE)||localStorage.getItem('nhtp_save_v6')||'null')}catch(e){}
  if(d&&d.areas)S.areas=Object.assign(S.areas,d.areas);
  fixedLayout();
  if(!d||!Array.isArray(d.items)){defaultLayout();return}
  for(const k of['coins','gems','xp','level','served','rSum','rN','story','hot','lost','ips','seen','chapter','tod'])if(d[k]!=null)S[k]=d[k];
  for(const k of['upg','daily','qd','sound'])if(d[k])Object.assign(S[k],d[k]);if(Array.isArray(d.dc))S.dc=DISHES.map((_,i)=>d.dc[i]||0);if(Array.isArray(d.medal))S.medal=DISHES.map((_,i)=>d.medal[i]||0);
  if(d.staff)for(const k in d.staff)if(S.staff[k])S.staff[k]=d.staff[k];
  if(Array.isArray(d.menu))S.menu=DISHES.map((_,i)=>Math.max(1,d.menu[i]|0||1));
  if(Array.isArray(d.quests))S.quests=d.quests;
  if(Array.isArray(d.grid)&&d.grid.length==20)S.grid=d.grid;
  if(d.quality)Object.assign(S.quality,d.quality);if(S.hot>=DISHES.length)S.hot=0;
  d.items.forEach(([t,x,y])=>{if(T[t]&&!T[t].fixed&&!at(x,y))add(t,x,y)})}

// ================= PATHFINDING =================
// seats are walkable so rows of stools never wall anyone in
function blocked(x,y){if(x<0||y<0||x>=W||y>=H||landLocked(x,y))return true;const o=at(x,y);return !!(o&&!T[o.type].seat)}
function bfs(from,goals){
  const fx=Math.floor(from[0]),fy=Math.floor(from[1]),key=(x,y)=>x*32+y;
  const seen=new Map([[key(fx,fy),-1]]),q=[[fx,fy]],gs=new Set(goals.map(g=>key(g[0],g[1])));
  for(let qi=0;qi<q.length;qi++){const[x,y]=q[qi];
    if(gs.has(key(x,y))){const p=[];let k=key(x,y);while(seen.get(k)!==-1){p.unshift([k/32|0,k%32]);k=seen.get(k)}return p}
    for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,nk=key(nx,ny);
      if(seen.has(nk)||blocked(nx,ny))continue;seen.set(nk,key(x,y));q.push([nx,ny])}}
  return null}
const N4=o=>[[1,0],[-1,0],[0,1],[0,-1]].map(d=>[o.x+d[0],o.y+d[1]]);
const seatTaken=(x,y)=>customers.some(c=>c.chair&&c.chair.x==x&&c.chair.y==y&&c.st!='out');
function freeN(o){const a=N4(o).filter(t=>!blocked(t[0],t[1]));const plain=a.filter(t=>!at(t[0],t[1]));return plain.length?plain:a.filter(t=>!seatTaken(t[0],t[1]))}
function tableOf(ch){if(ch.face){const o=at(ch.x+ch.face[0],ch.y+ch.face[1]);if(o&&TABLES[o.type])return o}
  return N4(ch).map(t=>at(t[0],t[1])).find(o=>o&&(o.type=='table'||o.type=='lowtable'))||null}
function walk(e,dt,sp=2.3){
  if(!e.path.length)return true;
  const[tx,ty]=e.path[0],dx=tx+.5-e.x,dy=ty+.5-e.y,d=Math.hypot(dx,dy),s=sp*dt;
  if(d<=s){e.x=tx+.5;e.y=ty+.5;e.path.shift()}else{e.x+=dx/d*s;e.y+=dy/d*s}
  return !e.path.length}

// ================= SIMULATION =================
let customers=[],waiters=[],orders=[],fx=[],events=[];
const SKIN=['#ffe3cc','#f9d3b0','#e8b48a','#c48a60','#9a6440'];
const HAIRC=['#2b1b12','#3d2a1e','#5a3820','#e8c066','#c0392b','#1a1a2e','#6d4c9f','#f08aa8','#8a8a8a'];
const EYEC=['#4a2e1a','#2d4a7a','#3a6a3a','#6a3a2a','#2a2a2a'];
const OUTFITS=['student','casual','casual','elder','hoodie','casual'];
const pick=a=>a[Math.random()*a.length|0];
function mkWaiter(st){return{x:5.5+Math.random(),y:8.4,path:[],task:null,carry:null,role:'w',sid:st.id,name:st.name,speed:2.4*(1+.06*staffPow(st)),look:st.look}}
function syncWaiters(){for(const st of hired('waiter'))if(!waiters.some(w=>w.sid==st.id))waiters.push(mkWaiter(st));for(const w of waiters){const st=STAFF.find(s=>s.id==w.sid);w.speed=2.4*(1+.06*staffPow(st))}}
function freeChairs(){return S.items.filter(o=>T[o.type].seat&&!o.dirty&&!seatTaken(o.x,o.y)&&tableOf(o))}
const kindOf=ch=>TABLES[(tableOf(ch)||{}).type]||'table';
let spawnT=1.5;
function spawn(){
  const ch=freeChairs();if(!ch.length){fullT+=3;return}fullT=0;
  const vip=S.level>=2&&Math.random()<.12,u=unlocked();
  let pool=ch;if(vip){const t=ch.filter(o=>o.type=='cushion');if(t.length)pool=t}
  const chair=pick(pool),path=bfs(DOOR,[[chair.x,chair.y]]);if(!path)return;
  const z0=Math.random()<.5?-8:H+8;
  customers.push({x:W+.5,y:z0+.5,path:[[W,DOOR[1]],DOOR,...path],chair,table:tableOf(chair),kind:kindOf(chair),st:'in',dish:Math.random()<.35&&u.includes(S.hot)?S.hot:pick(u),pat:1,t:0,vip,pri:false,a:0,role:'c',look:randomLook(vip)})}
function randomLook(vip){const female=Math.random()<.5,outfit=pick(OUTFITS);
  return{skin:pick(SKIN),hair:outfit=='elder'?'#d8d8d8':pick(HAIRC),eye:pick(EYEC),female,style:female?pick(['long','twin','bob','bun','pony']):pick(['short','spiky','short','cap']),outfit,
    color:vip?'#7a3cc0':pick(['#ff7b7b','#5fb8ff','#7ed67e','#ffb84d','#b58cff','#ff8fc8','#4fd1c5']),glasses:outfit=='elder'||Math.random()<.15,crown:vip,kid:!vip&&Math.random()<.12}}
const PAT_WAIT=c=>(c.vip?24:34)*(1+greetBonus()+.06*S.upg.seat), PAT_FOOD=c=>(c.vip?38:52)*(1+greetBonus()+.06*S.upg.seat);
const patSecs=c=>Math.max(0,c.pat*(c.st=='wait'?PAT_WAIT(c):PAT_FOOD(c)));
function leave(c,angry){
  if(c.st=='out')return;c.st='out';c.angry=angry;c.sit=0;
  c.path=(bfs([c.x,c.y],[DOOR])||[]).concat([[W,DOOR[1]],[W,Math.random()<.5?-8:H+8]]);
  if(angry){fx.push({x:c.x,y:c.y,t:'😠',k:'emo'});S.rSum+=1;S.rN++;S.lost=(S.lost||0)+1;events.push({k:'angry'})}
  orders=orders.filter(o=>{if(o.c!==c)return true;stoves().forEach(s=>{if(s.cook===o)s.cook=null;if(s.hold===o)s.hold=null});return false})}
const stoves=()=>S.items.filter(o=>o.type=='stove');
const claimedC=c=>waiters.some(w=>w.task&&w.task.c===c);
function gainXP(n){if(S.level>=MAX_LV){S.xp=0;return}S.xp+=n;while(S.level<MAX_LV&&S.xp>=xpNeed()){S.xp-=xpNeed();S.level++;S.gems+=2;events.push({k:'level'})}}
function quest(k,n=1,extra){let ch=false;for(const q of S.quests){if(q.k==k&&!q.done&&(k!='dish'||q.d===extra)){q.p=Math.min(q.n,q.p+n);if(q.p>=q.n){q.done=true;events.push({k:'questDone',q})}ch=true}}if(ch)events.push({k:'quest'})}
function newQuest(){const used=new Set(S.quests.map(q=>q.k));const pool=QUEST_T.filter(t=>!used.has(t.k)&&(t.k!='vip'||S.level>=2)&&(t.k!='stall'||S.areas.stall));const t=pick(pool.length?pool:QUEST_T);
  const sc=1+(S.level-1)*.35,n=Math.max(1,Math.round(t.n0*sc)),d=t.k=='dish'?pick(unlocked()):null;
  return{k:t.k,e:t.k=='dish'?DISHES[d].e:t.e,n,p:0,d,title:t.n.replace('{n}',n).replace('{d}',d!=null?DISHES[d].n:''),coins:Math.round(40*sc*(t.k=='earn'?1.5:1)),gems:Math.random()<.35?1:0,done:false}}
function ensureQuests(){while(S.quests.length<3)S.quests.push(newQuest())}
function pay(c,mult=1){
  const mood=Math.max(.2,c.minPat==null?1:c.minPat),stars=Math.round((3+2*mood)*2)/2;
  const room=c.chair&&c.chair.type=='cushion'?1.5:1;
  const base=dishPrice(c.dish)*(c.vip?2.5:1)*(c.dish==S.hot?1.5:1)*room*mult*(1+beauty()/200),tip=Math.max(1,Math.round(base*.35*mood*(1+.12*S.upg.till)));
  S.coins+=Math.round(base);S.served++;S.dc[c.dish]=(S.dc[c.dish]||0)+1;earnRate(Math.round(base));S.rSum+=stars;S.rN++;
  if(c.kind=='table'){const ch=c.chair;ch.dirty=true;ch.tip=(ch.tip||0)+tip;ch.tipT=0}else S.coins+=tip;
  fx.push({x:c.x,y:c.y,t:'+'+Math.round(base),k:'coin'});
  events.push({k:'coins',x:c.x,y:c.y,n:Math.round(base)});
  gainXP(c.vip?12:5);quest('serve');quest('earn',Math.round(base));quest('dish',1,c.dish);if(c.vip)quest('vip')}
let earnAcc=0,earnT=0;
function earnRate(n){earnAcc+=n}
function tick(dt){
  earnT+=dt;if(earnT>=30){S.ips=S.ips?S.ips*.7+.3*earnAcc/earnT:earnAcc/earnT;earnAcc=0;earnT=0}
  spawnT-=dt;S.hotT-=dt;if(S.hotT<=0){S.hotT=120;const u=unlocked();S.hot=pick(u.length>1?u.filter(i=>i!=S.hot):u);events.push({k:'hot'})}
  if(spawnT<=0){spawnT=Math.max(2.2,(9-Math.min(S.level,12)*.35-beauty()/30)/(1+.08*S.upg.sign)/rush(S.tod))*(.7+Math.random()*.6);if(customers.filter(c=>c.st!='out').length<16)spawn()}
  for(const c of customers){
    if(c.st!='out'&&c.chair&&!S.items.includes(c.chair)){leave(c,true);continue}
    c.a=Math.min(1,c.a+dt*3);
    if(c.st=='in'){if(!c.ding&&Math.abs(c.x-DOOR[0]-.5)<.6&&Math.abs(c.y-DOOR[1]-.5)<.6){c.ding=1;events.push({k:'chime'})}if(walk(c,dt)){c.st='wait';c.sit=1;c.t=0}}
    else if(c.st=='wait'||c.st=='food'){
      c.t+=dt;c.pat-=dt/(c.st=='wait'?PAT_WAIT(c):PAT_FOOD(c));if(c.pat<=0){leave(c,true);continue}
      // sushi bar: chef takes the order across the counter; conveyor: guest grabs a plate
      if(c.kind=='bar'&&c.st=='wait'&&c.t>1.5){c.st='food';orders.push({c,st:'queued',direct:1});0}
      if(c.kind=='belt'&&c.st=='wait'&&c.t>1.2){c.st='eat';c.t=0;c.dish=pick(unlocked());0}}
    else if(c.st=='eat'){c.t+=dt;if(c.t>=5){pay(c,c.kind=='belt'?.85:1);leave(c,false)}}
    else if(c.st=='out'){if(walk(c,dt,2.8))c.dead=1}
    if(c.st=='wait'||c.st=='food')c.minPat=Math.min(c.minPat==null?1:c.minPat,c.pat)
  }
  customers=customers.filter(c=>!c.dead);
  for(const o of S.items)if(o.tip){o.tipT=(o.tipT||0)+dt;if(hasManager()&&o.tipT>1.5||o.tipT>25)collectTip(o)}
  // kitchen
  for(const s of stoves()){
    if(s.cook){s.prog=(s.prog||0)+dt/dishCook(s.cook.c.dish);if(s.prog>=1){const o=s.cook;s.cook=null;
      if(o.direct){o.c.st='eat';o.c.t=0;orders=orders.filter(x=>x!==o);0}else{s.hold=o;o.st='ready'}}}
    else if(!s.hold){const o=orders.find(o=>o.st=='queued');if(o){o.st='cooking';s.cook=o;s.prog=0;events.push({k:'sizzle'})}}
  }
  // waiters: deliver ready food > take orders (priority, VIP, impatient first) > clear dirty tables
  for(const w of waiters){
    const tk=w.task;
    if(tk&&tk.c&&tk.c.st=='out'){w.task=null;w.carry=null;w.path=[];if(tk.o)tk.o.claim=0}
    if(!w.task){
      const ready=orders.find(o=>o.st=='ready'&&!o.claim);
      if(ready){const s=stoves().find(s=>s.hold===ready),g=s?freeN(s):[],p=g.length&&bfs([w.x,w.y],g);if(p){ready.claim=1;w.task={k:'pick',o:ready,c:ready.c,s};w.path=p;continue}}
      const cand=customers.filter(c=>c.st=='wait'&&c.kind=='table'&&c.table&&!claimedC(c)).sort((a,b)=>(b.pri-a.pri)||(b.vip-a.vip)||(a.pat-b.pat));
      let done=false;
      for(const c of cand){const g=freeN(c.table),p=g.length&&bfs([w.x,w.y],g);if(p){w.task={k:'take',c};w.path=p;done=true;break}}
      if(done)continue;
      const dirty=S.items.find(o=>o.dirty&&!waiters.some(v=>v.task&&v.task.ch===o));
      if(dirty){const t=tableOf(dirty),g=t?freeN(t):freeN(dirty),p=g.length&&bfs([w.x,w.y],g);if(p){w.task={k:'clean',ch:dirty};w.path=p}else dirty.dirty=false}
    } else if(walk(w,dt,w.speed||2.6)){
      if(tk.k=='take'){tk.c.st='food';tk.c.pri=false;orders.push({c:tk.c,st:'queued'});w.task=null;0}
      else if(tk.k=='pick'){if(tk.s.hold===tk.o){tk.s.hold=null;w.carry=tk.o.c.dish;const g=freeN(tk.c.table),p=g.length&&bfs([w.x,w.y],g);
          if(p){w.task={k:'give',o:tk.o,c:tk.c};w.path=p}else{w.task=null;w.carry=null}}else w.task=null}
      else if(tk.k=='give'){tk.c.st='eat';tk.c.t=0;orders=orders.filter(o=>o!==tk.o);w.carry=null;w.task=null}
      else if(tk.k=='clean'){tk.ch.dirty=false;w.task=null;0}
    }
  }
  fx.forEach(f=>f.a=(f.a||0)+dt);fx=fx.filter(f=>f.a<1.3);
}
function collectTip(o){const n=o.tip;if(!n)return;o.tip=0;S.coins+=n;earnRate(n);quest('tips');quest('earn',n);events.push({k:'coins',x:o.x+.5,y:o.y+.5,n,tip:1})}
