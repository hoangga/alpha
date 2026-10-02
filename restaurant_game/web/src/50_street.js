// ================= STREET: shops across the road, traffic, pedestrians, takeaway stall =================
const SW_NEAR=W+.85,ROAD_C=W+4.15,LANES=[W+2.9,W+5.4],SW_FAR=W+7.45,Z_MIN=-26,Z_MAX=H+26;
rbox(1.6,.16,H+60,'#d9d2c4',SW_FAR,-.12,H/2,room,.05).castShadow=false;
for(let x=W+2;x<W+6.4;x+=.62)plane(.34,1.6,basic('#f4f4f4'),x,-.165,DOOR[1]+.5,room);
for(let z=Z_MIN;z<Z_MAX;z+=1.2){const k=plane(.35,.5,basic('#c9c2b4'),SW_NEAR,-.035,z,room);const k2=plane(.35,.5,basic('#c9c2b4'),SW_FAR,-.035,z,room)}
// shop fronts across the street
function building(z0,len,o){ // cut-away shop fronts: ground floor only so they never hide the restaurant
  const g=new THREE.Group();g.position.set(W+10.2,0,z0+len/2);const d=3.2,h=1.45;
  rbox(d,h,len-.15,o.col,0,h/2,0,g,.06);rbox(d-.3,.05,len-.45,'#d9cfc0',0,h+.01,0,g,.02).castShadow=false;
  const glass=box(.05,.75,len-1.1,new THREE.MeshBasicMaterial({color:o.glass||'#ffe6a8'}),-d/2-.03,.62,-.25,g);glass.castShadow=false;
  rbox(.08,1.05,.65,'#5a3a28',-d/2-.04,.53,len/2-.6,g,.02);
  for(let i=0;i<5;i++){const m=box(.5,.05,(len-.4)/5,i%2?'#ffffff':o.awn,-d/2-.22,1.22,-len/2+.2+(i+.5)*(len-.4)/5,g);m.rotation.z=-.35;m.castShadow=false}
  [-len/2+.6,len/2-1.4].forEach(z=>cyl(.04,.5,'#3a3f48',-.8,h+.25,z,g,6));
  rbox(.1,.5,Math.min(len*.7,2.8),o.sign||'#3a2412',-.8,h+.62,-.4,g,.04);
  const t=sprite(textTex(o.label,'#fff3c4',o.label.length>10?30:42),1,4,true);const tw=Math.min(len*.7,2.8);t.scale.set(tw,tw*.375,1);t.position.set(-.9,h+.62,-.4);g.add(t);
  if(o.emo){const e=sprite(emojiTex(o.emo),.7,4,true);e.position.set(-d/2-.4,1.0,len/2-1.25);g.add(e)}
  [[.6,-len/4],[.6,len/4]].forEach(([x,z])=>{const pl=ball(.28,'#4fa35a',x,h+.25,z,g,8);pl.castShadow=false});
  room.add(g)}
[[-24,6,{col:'#f6d6c8',awn:'#e85d75',label:'Tiệm bánh',emo:'🥐',roof:'#b5524a'}],
 [-18,5,{col:'#dfe9d4',awn:'#3cb371',label:'Hoa tươi',emo:'💐',roof:'#4a7a5a'}],
 [-13,7,{col:'#f4f6fa',awn:'#2e86de',label:'Tiện lợi 24h',emo:'🏪',h:3.4,sign:'#2e86de'}],
 [-6,5,{col:'#f2e3c4',awn:'#8a5a30',label:'Cà phê',emo:'☕',roof:'#6b4127'}],
 [-1,6,{col:'#e6dcf4',awn:'#8a63d2',label:'Hiệu sách',emo:'📚',h:4.4,roof:'#5a4a7a'}],
 [5,6,{col:'#fde4b8',awn:'#ff9f1c',label:'Kem & trà',emo:'🍦',roof:'#c0703a'}],
 [11,7,{col:'#f6d6c8',awn:'#e63946',label:'Ramen Taro',emo:'🍜',roof:'#3d4a5c',glass:'#ffd08a'}],
 [18,5,{col:'#d6eef6',awn:'#4fd1c5',label:'Giặt ủi',emo:'🧺',h:3.4}],
 [23,6,{col:'#f4e8d0',awn:'#b58cff',label:'Đồ chơi',emo:'🧸',roof:'#8a3a3a'}]].forEach(a=>building(...a));
// street furniture: lamps, trees in planters, bus stop, vending machines
for(let z=-20;z<H+22;z+=8){cyl(.06,3,'#3a3f48',W+1.55,1.5,z,room,8);const b=ball(.17,basic('#fff3c4'),W+1.3,3,z,room);b.castShadow=false;cyl(.06,3,'#3a3f48',W+6.75,1.5,z+4,room,8);const b2=ball(.17,basic('#fff3c4'),W+7,3,z+4,room);b2.castShadow=false}
for(let z=-22;z<H+22;z+=8){rbox(.7,.3,.7,'#8a857c',SW_FAR+.3,.05,z,room,.04);ball(.55,'#4fa35a',SW_FAR+.3,1.1,z,room,10);cyl(.06,.7,'#6a4a32',SW_FAR+.3,.45,z,room,6)}
{const g=new THREE.Group();g.position.set(SW_FAR+.2,0,1.5);[-1,1].forEach(s=>cyl(.05,2.2,'#3a3f48',.4,1.1,s*1.1,g,8));const r=rbox(1.1,.08,2.5,'#2e86de',0,2.2,0,g,.03);
 const gl=box(.05,1.5,2.2,new THREE.MeshBasicMaterial({color:'#bfe9f7',transparent:true,opacity:.4}),.5,1.3,0,g);gl.castShadow=false;rbox(.4,.08,1.8,'#8a5a30',.25,.45,0,g,.03);
 const s=sprite(textTex('🚌 BUS','#ffffff',48),1,4,true);s.scale.set(1,.38,1);s.position.set(0,2.55,0);g.add(s);room.add(g)}
[[SW_FAR+.35,7.2,'#e63946'],[SW_FAR+.35,8,'#2e86de']].forEach(([x,z,c])=>{rbox(.6,1.6,.7,c,x,.8,z,room,.05);const f=box(.02,.9,.5,basic('#e9f6ff'),x-.31,1,z,room);f.castShadow=false});
// ---- traffic ----
const CAR_COLS=['#e63946','#2e86de','#f4f4f4','#3a3f48','#3cb371','#ff9f1c','#b58cff'];
function wheel(g,x,z,r=.2){const w=cyl(r,.16,'#222',x,r,z,g,12);w.rotation.z=Math.PI/2;cyl(r*.5,.17,'#cfd6dc',x,r,z,g,8).rotation.z=Math.PI/2;return w}
function mkCar(kind){
  const g=new THREE.Group(),inner=new THREE.Group();g.add(inner);const p=inner,c=kind=='taxi'?'#ffc93c':pick(CAR_COLS);let len=2.1;
  const glass=mat('#9fd3ee');
  if(kind=='bus'){len=4.8;rbox(1.3,1.5,4.6,'#2ec4b6',0,1.0,0,p,.12);box(1.32,.45,4.2,glass,0,1.35,-.1,p).castShadow=false;rbox(1.32,.12,4.62,'#ffffff',0,.62,0,p,.04);
    [-1.6,1.6].forEach(z=>[-.58,.58].forEach(x=>wheel(p,x,z,.28)));const s=sprite(textTex('18','#ffffff',60),1,4,true);s.scale.set(.6,.22,1);s.position.set(0,1.62,2.32);p.add(s)}
  else if(kind=='van'){len=2.5;rbox(1.15,1.2,2.4,c,0,.85,0,p,.1);box(1.0,.45,.06,glass,0,1.15,1.2,p).castShadow=false;[-.85,.85].forEach(z=>[-.55,.55].forEach(x=>wheel(p,x,z)))}
  else if(kind=='scooter'){len=1.1;rbox(.3,.35,.9,c,0,.45,0,p,.08);rbox(.26,.08,.4,'#2a2a33',0,.66,-.12,p,.03);cyl(.03,.5,'#555',0,.75,.35,p,6).rotation.x=-.3;
    [-.38,.38].forEach(z=>wheel(p,0,z,.17));const rider=new THREE.Group();rider.position.set(0,.68,-.08);cyl(.13,.32,pick(CAR_COLS),0,.2,0,rider,10);const hm=ball(.17,pick(CAR_COLS),0,.5,0,rider,12);ball(.15,'#f9d3b0',0,.47,.04,rider,10);p.add(rider)}
  else{rbox(1.05,.5,2.05,c,0,.45,0,p,.12);rbox(.92,.42,1.1,glass,0,.86,-.12,p,.1);rbox(.94,.07,1.0,c,0,1.08,-.12,p,.03);
    [-.68,.68].forEach(z=>[-.5,.5].forEach(x=>wheel(p,x,z)));
    if(kind=='taxi'){rbox(.4,.16,.2,'#ffffff',0,1.2,-.12,p,.04);const s=sprite(textTex('TAXI','#3a2412',56),.5,4,true);s.scale.set(.5,.19,1);s.position.set(0,1.38,-.12);p.add(s)}}
  if(kind!='scooter')[-.35,.35].forEach(x=>{const h=ball(.08,basic('#fff6c8'),x*(kind=='bus'?1.4:1),.55,len/2-.02,p,8);h.castShadow=false;const t=ball(.07,basic('#ff4d4d'),x*(kind=='bus'?1.4:1),.55,-len/2+.02,p,8);t.castShadow=false});
  g.traverse(o=>{if(o.isMesh)o.castShadow=false});scene.add(g);return{g,len,kind}}
const cars=[];
const KINDS=['sedan','sedan','taxi','van','scooter','sedan','bus','scooter'];
for(let i=0;i<(LOW?4:7);i++){const lane=i%2,c=mkCar(KINDS[i%KINDS.length]);c.lane=lane;c.dir=lane?-1:1;c.v0=rnd(3,4.6)*(c.kind=='bus'?.8:c.kind=='scooter'?1.15:1);c.v=c.v0;
  c.z=Z_MIN+(Z_MAX-Z_MIN)*(i/((LOW?4:7)))+rnd(0,3);c.g.position.set(LANES[lane]+rnd(-.1,.1),0,c.z);c.g.rotation.y=lane?Math.PI:0;cars.push(c)}
function syncCars(dt,t){
  for(const c of cars){
    const ahead=cars.filter(o=>o!==c&&o.lane==c.lane&&(o.z-c.z)*c.dir>0).sort((a,b)=>Math.abs(a.z-c.z)-Math.abs(b.z-c.z))[0];
    const gap=ahead?Math.abs(ahead.z-c.z)-(ahead.len+c.len)/2:99;
    // slow for traffic ahead and for people on the zebra crossing in front of the shop
    const nearCross=Math.abs(c.z+c.dir*(c.len/2+1)-(DOOR[1]+.5))<1.2&&crossBusy;
    const want=nearCross?0:gap<1.2?0:gap<3?Math.min(c.v0,ahead.v):c.v0;c.v+=(want-c.v)*Math.min(1,dt*3);
    c.z+=c.dir*c.v*dt;
    if(c.dir>0&&c.z>Z_MAX)c.z=Z_MIN;if(c.dir<0&&c.z<Z_MIN)c.z=Z_MAX;
    c.g.position.z=c.z;c.g.children[0].position.y=Math.abs(Math.sin(t*14+c.z))*.012*(c.v>.3?1:0)}}
// ---- pedestrians (lite avatars) ----
let crossBusy=false;
const peds=[];
function mkPed(i){const look=randomLook(false);look.lite=true;const g=mkAvatar(Object.assign({role:'c'},look));
  const far=i%2==1;const p={g,far,x:(far?SW_FAR:SW_NEAR)+rnd(-.35,.35),z:rnd(Z_MIN,Z_MAX),dir:Math.random()<.5?1:-1,v:rnd(.9,1.35),stop:0,seed:rnd(0,6),look};
  g.userData.seed=p.seed;g.position.set(p.x,0,p.z);peds.push(p);return p}
for(let i=0;i<(LOW?4:8);i++)mkPed(i);
const STALL_Z=13.5;
function stallPrice(){return Math.round((9+S.level*2)*(hired('vendor').length?1.6:1))}
function syncPeds(dt,t){
  crossBusy=false;
  for(const p of peds){const u=p.g.userData;
    if(p.stop>0){p.stop-=dt;pose(u,{t});p.g.rotation.y=-Math.PI/2;
      if(p.stop<=0){const n=stallPrice();S.coins+=n;quest('stall');quest('earn',n);fx.push({x:p.x-.4,y:p.z,t:'+'+n,k:'coin'});events.push({k:'coins',x:p.x-.4,y:p.z,n,tip:0})}
      continue}
    if(p.cross){const tx=p.far?SW_NEAR:SW_FAR,d=tx-p.x;p.x+=Math.sign(d)*Math.min(Math.abs(d),p.v*dt);p.g.position.set(p.x,0,p.z);p.g.rotation.y=d>0?Math.PI/2:-Math.PI/2;
      const s=Math.sin(t*9+p.seed);pose(u,{s,t});u.body.position.y=Math.abs(s)*.035;if(Math.abs(d)<.02){p.cross=false;p.far=!p.far}continue}
    const pz=p.z;p.z+=p.dir*p.v*dt;
    const CZ=DOOR[1]+.5;if((pz-CZ)*(p.z-CZ)<=0&&Math.random()<.3&&!cars.some(c=>Math.abs(c.z-CZ)<3)){p.z=CZ;p.cross=true;continue}
    if(!p.far&&S.areas.stall&&(pz-STALL_Z)*(p.z-STALL_Z)<=0&&!p.bought&&Math.random()<(hired('vendor').length?.6:.35)){p.bought=true;p.stop=2.4;p.z=STALL_Z}
    if(p.z>Z_MAX||p.z<Z_MIN){p.z=p.dir>0?Z_MIN:Z_MAX;p.bought=false}
    p.g.position.set(p.x,0,p.z);p.g.rotation.y=p.dir>0?0:Math.PI;
    const s=Math.sin(t*9+p.seed);pose(u,{s,t});u.body.position.y=Math.abs(s)*.035;blink(u,dt)}
  // customers on the sidewalk use the crossing area in front of the gate
  crossBusy=peds.some(p=>p.cross)}
// ---- greeter and musician ----
let greeterAv=null,musicianAv=null,musicKey='';
function syncStaffExtras(t,dt){
  const gr=hired('greeter')[0];
  if(gr&&!greeterAv){greeterAv=mkAvatar(Object.assign({role:'w',staffRole:'greeter',name:gr.name},gr.look));greeterAv.userData.sid=gr.id;greeterAv.position.set(11.45,0,10.35);greeterAv.rotation.y=-Math.PI*.75}
  if(greeterAv){const u=greeterAv.userData;pose(u,{t});blink(u,dt);const near=customers.some(c=>c.st=='in'&&Math.hypot(c.x-11.5,c.y-11.5)<1.6);
    u.bow=(u.bow||0)+((near?1:0)-(u.bow||0))*Math.min(1,dt*6);u.body.rotation.x=u.bow*.5;u.aL.s.rotation.x=u.aR.s.rotation.x=-.3*u.bow;setFace(u,'happy')}
  const mu=hired('musician')[0];
  if(mu&&!musicianAv){const st=S.items.find(o=>o.type=='stage');if(st){musicianAv=mkAvatar(Object.assign({role:'w',staffRole:'musician',name:mu.name},mu.look));musicianAv.userData.sid=mu.id;musicianAv.position.set(st.x+.5,.12,st.y+.5);musicianAv.rotation.y=Math.PI/2;musicianAv.userData.stage=st}}
  if(greeterAv){greeterAv.userData.act.visible=false;if(greeterAv.userData.actK!=='🙇'){greeterAv.userData.actK='🙇';greeterAv.userData.act.material.map=emojiTex('🙇')}}
  if(musicianAv){const u=musicianAv.userData;u.act.visible=false;pose(u,{sit:1,t});u.aR.s.rotation.x=-.9+Math.sin(t*10)*.25;u.aL.s.rotation.x=-1.1;u.aL.s.rotation.z=.5;u.head.rotation.z=Math.sin(t*2)*.12;blink(u,dt);setFace(u,'happy');
    if(Math.random()<dt*.25)fx.push({x:musicianAv.position.x+rnd(-.3,.3),y:musicianAv.position.z,t:pick(['🎵','🎶']),k:'emo'})}}
// manager walks between the tables, picking up tips
let managerAv=null,mgr=null;
function syncManager(t,dt){const m=hired('manager')[0];if(!m)return;
  if(!managerAv){managerAv=mkAvatar(Object.assign({role:'w',staffRole:'manager',name:m.name},m.look));managerAv.userData.sid=m.id;mgr={x:6.5,y:8.5,path:[]}}
  const u=managerAv.userData;
  if(!mgr.path.length){const tip=S.items.find(o=>o.tip&&o.tipT>1);const tgt=tip?(tableOf(tip)?freeN(tableOf(tip)):freeN(tip)):[[Math.floor(rnd(1,8)),Math.floor(rnd(5,9))]];
    const p=tgt.length&&bfs([mgr.x,mgr.y],tgt);if(p)mgr.path=p;u.idle=rnd(1,3)}
  if(mgr.path.length&&(u.idle-=dt)<=0){const p=mgr.path[0],dx=p[0]+.5-mgr.x,dz=p[1]+.5-mgr.y;if(Math.hypot(dx,dz)>.01)managerAv.rotation.y=Math.atan2(dx,dz);walk(mgr,dt,1.6);const s=Math.sin(t*10);pose(u,{s,t});u.body.position.y=Math.abs(s)*.03}
  else pose(u,{t});blink(u,dt);setFace(u,'happy');managerAv.position.set(mgr.x,0,mgr.y);
  u.act.visible=false}
function ensureStage(){if(!hired('musician').length||S.items.some(o=>o.type=='stage'))return;
  for(const[x,y]of[[0,7],[0,5],[7,6],[3,8],[1,8]])if(!at(x,y)&&!rugAt(x,y)){add('stage',x,y);return}}
// ---- locked land in front (garden extension) ----
const g2=new THREE.Group();room.add(g2);
rbox(W+.3,.3,4.3,'#a59c8c',W/2,-.17,15.85,g2,.08).castShadow=false;plane(W,4,texMat(TEX.gravel(3,1)),W/2,0,16,g2);
for(let z=14.6;z<=17.9;z+=.17){const m=cyl(.06,1.1+Math.sin(z*7)*.05,'#7ea84a',W-.05,.55,z,g2,6);m.castShadow=false}
const lockG=new THREE.Group();room.add(lockG);
for(let x=.3;x<W;x+=1.4){cyl(.05,.6,'#8a5a30',x,.3,14.1,lockG,6);cyl(.05,.6,'#8a5a30',x,.3,17.9,lockG,6)}
{const r=box(W,.02,.02,'#e0a030',W/2,.5,14.1,lockG);r.castShadow=false;const s=sprite(textTex('🔒 Đất trống · Cấp '+AREAS.garden2.lv,'#fff3c4',38),1,6,true);s.scale.set(2.6,.98,1);s.position.set(W/2,1.3,16);lockG.add(s)}
function syncLand(){g2.visible=!!S.areas.garden2;lockG.visible=!S.areas.garden2}
