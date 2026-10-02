// ================= ANIME CHIBI CHARACTERS =================
// staff badge: rounded pill in the role colour with name and role, so staff never look like guests
function badgeTex(name,role,col){const k='BG'+name+role+col;if(texCache.has(k))return texCache.get(k);
  const c=document.createElement('canvas');c.width=360;c.height=112;const x=c.getContext('2d');
  const pill=(X,Y,w,h,r)=>{x.beginPath();x.moveTo(X+r,Y);x.arcTo(X+w,Y,X+w,Y+h,r);x.arcTo(X+w,Y+h,X,Y+h,r);x.arcTo(X,Y+h,X,Y,r);x.arcTo(X,Y,X+w,Y,r);x.closePath()};
  x.fillStyle='rgba(0,0,0,.25)';pill(6,10,348,96,48);x.fill();x.fillStyle=col;pill(4,4,348,94,47);x.fill();
  x.strokeStyle='#ffffff';x.lineWidth=6;x.stroke();x.textAlign='center';x.fillStyle='#ffffff';
  x.font='800 40px "Baloo 2",system-ui,sans-serif';x.fillText(name,178,50);x.font='700 26px "Baloo 2",system-ui,sans-serif';x.fillStyle='rgba(255,255,255,.88)';x.fillText(role,178,84);
  const t=new THREE.CanvasTexture(c);texCache.set(k,t);return t}
// big head (~45% of height), large glossy eyes, layered bangs, outfits per role; joints for poses
function hairPiece(r,c,x,y,z,sx,sy,sz,p){const b=ball(r,c,x,y,z,p,10);b.scale.set(sx,sy,sz);return b}
function mkAvatar(L){
  const g=new THREE.Group(),u=g.userData,body=new THREE.Group();g.add(body);u.body=body;const sk=L.skin,fem=L.female;
  const blob=new THREE.Mesh(new THREE.CircleGeometry(.24,16),new THREE.MeshBasicMaterial({color:'#000',transparent:true,opacity:.18,depthWrite:false}));blob.rotation.x=-Math.PI/2;blob.position.y=.015;g.add(blob);
  // outfit colours
  const O=L.outfit,col=L.color||'#5fb8ff';
  const top={office:'#f4f6fa',student:'#ffffff',casual:col,elder:'#b08a6a',hoodie:col,kimono:L.kimono||'#c0392b',kimonoV:'#6d3cc0',chef:'#ffffff'}[O]||col;
  const legC={office:'#2a3346',student:fem?'#2c3e66':'#2c3e66',casual:'#3a4a6b',elder:'#5a5048',hoodie:'#3a3f48',kimono:L.kimono||'#c0392b',kimonoV:'#6d3cc0',chef:'#3a3f48'}[O]||'#3a4a6b';
  const skirt=fem&&(O=='student'||O=='casual')||O=='kimono'||O=='kimonoV';
  const leg=x=>{const hip=new THREE.Group();hip.position.set(x,.27,0);cyl(.06,.13,skirt?sk:legC,0,-.06,0,hip,8);const knee=new THREE.Group();knee.position.y=-.12;
    cyl(.055,.11,skirt?(O=='student'?'#ffffff':sk):legC,0,-.05,0,knee,8);const sh=ball(.07,O=='kimono'||O=='kimonoV'?'#f4ecd8':O=='student'?'#3a2a20':'#4a3020',0,-.12,.03,knee,10);sh.scale.set(1,.65,1.35);hip.add(knee);body.add(hip);return{hip,knee}};
  u.lL=leg(-.08);u.lR=leg(.08);
  const torso=cyl(.15,.3,top,0,.42,0,body,16,.17);torso.scale.z=.85;if(!L.lite)outline(torso,1.07);
  if(skirt){const sk2=cyl(.14,.17,O=='student'?'#2c3e66':O=='casual'?'#ffffff':top,0,.25,0,body,16,.25);sk2.scale.z=.9}
  // outfit details
  if(O=='office'){rbox(.06,.2,.02,'#c0392b',0,.43,.15,body,.01);[-1,1].forEach(s=>{const l=box(.08,.22,.02,'#2a3346',s*.08,.44,.13,body);l.rotation.z=s*.25})}
  if(O=='student'){const c=cyl(.19,.05,'#2c3e66',0,.55,-.02,body,16);c.scale.z=.85;M(new THREE.ConeGeometry(.05,.1,4),mat('#e63946'),0,.48,.15,body).rotation.x=Math.PI}
  if(O=='hoodie'){const h=ball(.16,top,0,.56,-.12,body,10);h.scale.set(1.1,.6,.8);[-.05,.05].forEach(a=>cyl(.008,.12,'#ffffff',a,.45,.15,body,4))}
  if(O=='elder'){[-.06,.06].forEach(a=>ball(.02,'#e8d8b0',a,.4,.15,body,6))}
  if(O=='kimono'||O=='kimonoV'){rbox(.34,.1,.3,O=='kimono'?'#ffd166':'#ffc93c',0,.4,0,body,.03);[-1,1].forEach(s=>{const l=box(.05,.2,.02,'#ffffff',s*.04,.5,.14,body);l.rotation.z=-s*.5});
    if(O=='kimono')rbox(.22,.26,.02,'#ffffff',0,.27,.16,body,.01)}
  if(O=='chef'){rbox(.24,.24,.03,'#3a3f48',0,.32,.14,body,.01);[-1,1].forEach(s=>{const l=box(.04,.22,.02,'#2c4a8a',s*.04,.47,.14,body);l.rotation.z=-s*.5})}
  // arms (sleeves follow the top colour; kimono sleeves are wide)
  const wide=O=='kimono'||O=='kimonoV';
  const arm=x=>{const s=new THREE.Group();s.position.set(x,.52,0);const sl=cyl(wide?.07:.048,.12,top,0,-.05,0,s,8,wide?.09:.048);const el=new THREE.Group();el.position.y=-.11;
    cyl(.04,.1,O=='office'||O=='hoodie'||O=='elder'?top:sk,0,-.04,0,el,8);ball(.05,sk,0,-.1,0,el,8);s.add(el);body.add(s);return{s,el}};
  u.aL=arm(-.19);u.aR=arm(.19);
  // head
  const head=new THREE.Group();head.position.y=.8;body.add(head);u.head=head;
  const hd=ball(.26,sk,0,0,0,head,L.lite?14:22);hd.scale.set(1,.93,.95);if(!L.lite)outline(hd,1.045);
  [-.255,.255].forEach(x=>ball(.045,sk,x,-.03,0,head,8));
  // eyes: dark oval, coloured iris, two highlights; lashes for girls
  u.eyes=[-.09,.09].map(x=>{const e=new THREE.Group();e.position.set(x,-.01,.215);head.add(e);
    const w=ball(.055,'#2a1a10',0,0,0,e,12);w.scale.set(.78,1.05,.4);const ir=ball(.042,L.eye||'#4a2e1a',0,-.008,.012,e,12);ir.scale.set(.78,1,.4);
    const h1=ball(.016,basic('#ffffff'),.012,.022,.03,e,6);const h2=ball(.008,basic('#ffffff'),-.012,-.025,.03,e,6);h1.castShadow=h2.castShadow=false;
    if(fem){const l=box(.07,.012,.01,'#1a1010',x>0?.006:-.006,.05,.02,e);l.rotation.z=x>0?-.25:.25;l.castShadow=false}
    return e});
  u.brows=[-.09,.09].map(x=>{const b=box(.07,.013,.01,L.hair=='#d8d8d8'?'#9a9a9a':'#3a2412',x,.085,.225,head);b.castShadow=false;return b});
  [-.16,.16].forEach(x=>{const c=new THREE.Mesh(new THREE.CircleGeometry(.04,12),new THREE.MeshBasicMaterial({color:'#ff8fa3',transparent:true,opacity:.55}));c.position.set(x,-.075,.2);c.rotation.y=x>0?.55:-.55;head.add(c)});
  const mouth=new THREE.Mesh(new THREE.TorusGeometry(.03,.01,6,12,Math.PI),mat('#9b3a2a'));mouth.position.set(0,-.1,.235);mouth.rotation.z=Math.PI;head.add(mouth);u.mouth=mouth;
  if(L.glasses){[-.09,.09].forEach(x=>{const r=new THREE.Mesh(new THREE.TorusGeometry(.06,.009,6,14),basic('#5a4030'));r.position.set(x,-.01,.245);head.add(r)});box(.06,.01,.01,'#5a4030',0,0,.25,head)}
  if(L.beard){const b=ball(.13,'#e8e8e8',0,-.17,.12,head,12);b.scale.set(1.3,.8,.7);const m=ball(.05,'#e8e8e8',0,-.12,.22,head,8);m.scale.set(2,.6,.6)}
  // hair: skull cap, layered anime bangs, side locks, style extras
  const hc=L.hair,st=L.style;
  if(st=='cap'&&L.role=='c'){const c=ball(.27,col,0,.06,0,head,16);c.scale.set(1,.68,1);rbox(.26,.03,.2,col,0,.08,.25,head,.01);hairPiece(.07,hc,-.22,-.05,.0,.6,1.2,1,head);hairPiece(.07,hc,.22,-.05,0,.6,1.2,1,head)}
  else{
    const cap=new THREE.Mesh(new THREE.SphereGeometry(.28,18,12,0,Math.PI*2,0,Math.PI*.52),mat(hc));cap.position.set(0,.02,-.02);cap.castShadow=true;head.add(cap);if(!L.lite)outline(cap,1.035);
    const back=ball(.27,hc,0,-.02,-.06,head,14);back.scale.set(1,.95,.9);
    // bangs: overlapping flattened teardrops across the forehead
    [[-.16,.08,.17,-.3],[-.08,.1,.21,-.12],[0,.11,.22,0],[.08,.1,.21,.12],[.16,.08,.17,.3]].forEach(([x,y,z,rz])=>{const b=M(new THREE.ConeGeometry(.07,.16,6),mat(hc),x,y,z,head);b.rotation.set(Math.PI+.45,0,rz);b.scale.z=.45});
    [-.23,.23].forEach(x=>hairPiece(.07,hc,x,-.06,.06,.55,1.5,.8,head));
    if(st=='long'){hairPiece(.2,hc,0,-.22,-.12,1.25,1.4,.7,head)}
    if(st=='twin'){[-.27,.27].forEach(x=>{hairPiece(.09,hc,x,.0,-.08,.9,1,.9,head);const t=cyl(.07,.3,hc,x*1.15,-.18,-.08,head,8,.03);t.rotation.z=x>0?-.2:.2});[-.2,.2].forEach(x=>ball(.03,'#ff6b8a',x,.14,-.12,head,6))}
    if(st=='bob'){[-.25,.25].forEach(x=>hairPiece(.11,hc,x,-.1,-.03,.6,1.25,1,head))}
    if(st=='bun'){ball(.12,hc,0,.24,-.12,head,10);if(L.role=='w'){const k=cyl(.008,.26,'#ffc93c',.06,.27,-.12,head,4);k.rotation.z=.9;ball(.035,'#ff6b8a',.16,.32,-.1,head,8)}}
    if(st=='pony'){ball(.1,hc,0,.06,-.27,head,10);const t=cyl(.075,.26,hc,0,-.12,-.31,head,8,.03);t.rotation.x=.25}
    if(st=='spiky'){for(let i=0;i<7;i++){const k=M(new THREE.ConeGeometry(.07,.17,6),mat(hc),Math.cos(i*.9)*.13,.25,Math.sin(i*.9)*.12-.04,head);k.rotation.set(Math.sin(i*.9)*.5,0,-Math.cos(i*.9)*.5)}}
  }
  if(O=='chef'){const band=cyl(.275,.07,'#ffffff',0,.1,0,head,18);band.scale.z=.97;ball(.04,'#e63946',0,.1,.27,head,8);const knot=ball(.04,'#ffffff',.08,.1,-.27,head,6);
    [-1,1].forEach(s=>{const e=box(.03,.1,.01,'#ffffff',.08+s*.03,.04,-.28,head);e.rotation.z=s*.4})}
  if(L.crown){const c=cyl(.11,.08,'#ffc93c',0,.3,0,head,6,.13);c.material=basic('#ffd34d');for(let i=0;i<5;i++)M(new THREE.ConeGeometry(.03,.07,4),basic('#ffd34d'),Math.cos(i*1.256)*.1,.37,Math.sin(i*1.256)*.1,head)}
  u.tray=new THREE.Group();cyl(.16,.02,'#4a2c17',0,0,0,u.tray,16);u.tray.position.set(0,.5,.3);u.tray.visible=false;body.add(u.tray);
  u.carry=sprite(emojiTex('🍣'),.36,6);u.carry.position.set(0,.66,.3);u.carry.visible=false;body.add(u.carry);
  if(L.staffRole){const R=ROLE[L.staffRole];
    const ring=new THREE.Mesh(new THREE.RingGeometry(.28,.33,28),new THREE.MeshBasicMaterial({color:'#ffffff',transparent:true,opacity:.55,depthWrite:false}));ring.rotation.x=-Math.PI/2;ring.position.y=.025;ring.renderOrder=2;g.add(ring);u.ring=ring;
    const b=sprite(badgeTex(R.e+' '+(L.name||R.n),R.n,R.c),1,8);b.scale.set(1.15,.36,1);b.position.set(0,1.42,0);b.visible=false;g.add(b);u.badge=b;
    const act=sprite(emojiTex('💬'),.34,9);act.position.set(.42,1.15,0);act.visible=false;g.add(act);u.act=act}
  if(L.lite)g.traverse(o=>{o.castShadow=false});
  g.scale.setScalar(L.kid?.8:1.05);scene.add(g);return g}
function setFace(u,m){if(u.face===m)return;u.face=m;
  u.mouth.rotation.z=m=='angry'?0:Math.PI;u.mouth.scale.set(m=='happy'?1.15:1,m=='ok'?.35:1,1);u.mouth.position.y=m=='angry'?-.12:-.1;
  u.brows[0].rotation.z=m=='angry'?-.45:m=='ok'?.15:0;u.brows[1].rotation.z=m=='angry'?.45:m=='ok'?-.15:0}
function blink(u,dt){u.blink=(u.blink==null?rnd(1,4):u.blink)-dt;const b=u.blink<0&&u.blink>-.12;u.eyes.forEach(e=>e.scale.y=b?.12:1);if(u.blink<-.12)u.blink=rnd(2,5)}
function pose(u,k){const t=k.t||0;
  if(k.sit){u.lL.hip.rotation.x=u.lR.hip.rotation.x=-1.5;u.lL.knee.rotation.x=u.lR.knee.rotation.x=k.kneel?-.1:1.45}
  else{const s=k.s||0;u.lL.hip.rotation.x=s*.75;u.lR.hip.rotation.x=-s*.75;u.lL.knee.rotation.x=Math.max(0,-s)*.9;u.lR.knee.rotation.x=Math.max(0,s)*.9}
  if(k.carry){u.aL.s.rotation.x=u.aR.s.rotation.x=-1.35;u.aL.el.rotation.x=u.aR.el.rotation.x=-.2;u.aL.s.rotation.z=.15;u.aR.s.rotation.z=-.15}
  else if(k.sit){u.aL.s.rotation.z=u.aR.s.rotation.z=0;u.aL.s.rotation.x=-.8;u.aL.el.rotation.x=-.7;const e=k.eat?Math.sin(t*7):0;u.aR.s.rotation.x=-.8+e*.4;u.aR.el.rotation.x=-.9-Math.max(0,e)*.8}
  else{const s=k.s||0;u.aL.s.rotation.x=-s*.7;u.aR.s.rotation.x=s*.7;u.aL.el.rotation.x=u.aR.el.rotation.x=-.25;u.aL.s.rotation.z=.12;u.aR.s.rotation.z=-.12}
  u.head.rotation.z=k.sit?Math.sin(t*1.3+(u.seed||0))*.05:0}
function animChef(g,t,cooking){const u=g.userData;if(u.seed==null)u.seed=Math.random()*6;pose(u,{t});setFace(u,'happy');
  if(cooking){u.aR.s.rotation.x=-1.2+Math.sin(t*9)*.3;u.aR.el.rotation.x=-.5;u.aL.s.rotation.x=-1;u.aL.el.rotation.x=-.4;u.body.position.y=Math.abs(Math.sin(t*9))*.02}else u.body.position.y=Math.sin(t*2)*.01;
  blink(u,1/60)}
const avMap=new Map();
function syncAv(e,time,dt){
  let a=avMap.get(e);
  if(!a){const g=mkAvatar(Object.assign({role:e.role,name:e.name,staffRole:e.role=='w'?'waiter':null},e.look));a={g};g.userData.seed=Math.random()*6;
    if(e.role=='c'){a.b=bubbleCanvas();a.bs=sprite(a.b.tex,.9,7);a.bs.scale.set(.82,1.03,1);a.bs.position.set(0,1.66,0);g.add(a.bs)}
    avMap.set(e,a)}
  const g=a.g,u=g.userData,moving=e.path&&e.path.length>0,seated=e.role=='c'&&e.sit&&e.st!='out';
  const ct=seated&&e.chair.type;
  g.position.set(e.x,seated?(ct=='cushion'?-.18:ct=='stool'?.2:.02):0,e.y);
  if(seated){g.rotation.y=seatRot(e.chair);pose(u,{sit:1,kneel:ct=='cushion',eat:e.st=='eat',t:time});u.body.position.y=0}
  else if(moving){const p=e.path[0],dx=p[0]+.5-e.x,dz=p[1]+.5-e.y;if(Math.hypot(dx,dz)>.01){const tr=Math.atan2(dx,dz);let d=tr-g.rotation.y;d=Math.atan2(Math.sin(d),Math.cos(d));g.rotation.y+=d*Math.min(1,dt*14)}
    const s=Math.sin(time*12+u.seed);pose(u,{s,carry:e.carry!=null,t:time});u.body.position.y=Math.abs(s)*.045}
  else{pose(u,{carry:e.carry!=null,t:time});u.body.position.y=Math.sin(time*2+u.seed)*.008}
  blink(u,dt);
  if(e.role=='w'){const c=e.carry!=null;u.carry.visible=u.tray.visible=c;if(c)u.carry.material.map=emojiTex(DISHES[e.carry].e);setFace(u,'happy');
    const k=e.task&&e.task.k,ic={take:'📝',pick:'🏃',give:'🍽️',clean:'🧹'}[k];u.act.visible=false;u.act.position.y=1.15+Math.sin(time*5)*.03}
  if(e.role=='c'){
    setFace(u,e.st=='out'?(e.angry?'angry':'happy'):e.st=='eat'?'happy':e.pat<.3?'angry':e.pat<.6?'ok':'happy');
    const show=e.st=='wait'||e.st=='food';a.bs.visible=show;
    if(show){const icon=e.st=='wait'?(e.pri?'❗':e.kind=='belt'?'👀':'📋'):DISHES[e.dish].e,urgent=e.pat<.25,warn=e.pat<.5;
      drawBubble(a.b,icon,e.pat,urgent?patSecs(e):null,e.vip,null);
      // calm guests get a small faded bubble; only guests about to leave grow, pulse and show seconds
      const k=urgent?.82+Math.sin(time*8)*.05:warn?.62:.48;a.bs.scale.set(.82*k/.82*1,1.03*k/.82,1);a.bs.material.opacity=urgent||warn?1:.8;a.bs.position.y=1.5+k*.2}
    g.scale.setScalar((e.look.kid?.8:1.05)*(.5+.5*e.a))}
}
function syncAvatars(time,dt){
  for(const c of customers)syncAv(c,time,dt);for(const w of waiters)syncAv(w,time,dt);
  for(const[e,a]of avMap)if(!customers.includes(e)&&!waiters.includes(e)){scene.remove(a.g);avMap.delete(e)}}
const fxMap=new Map();
function syncFx(){
  for(const f of fx){let s=fxMap.get(f);if(!s){s=f.k=='coin'?sprite(textTex(f.t,'#ffd34d'),1,9):sprite(emojiTex(f.t),.55,9);if(f.k=='coin')s.scale.set(1.2,.45,1);scene.add(s);fxMap.set(f,s)}
    const a=f.a||0;s.position.set(f.x,(f.k=='coin'?1.95:1.65)+a*.8,f.y);s.material.opacity=Math.max(0,1-a/1.3)}
  for(const[f,s]of fxMap)if(!fx.includes(f)){scene.remove(s);s.material.dispose();fxMap.delete(f)}}
