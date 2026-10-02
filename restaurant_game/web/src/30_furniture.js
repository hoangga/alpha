// ================= FURNITURE MODELS =================
const itemObj=new Map();
const WOOD='#a0683c',DARK='#4a2c17';
function seatRot(o){const t=tableOf(o);const dx=o.face?o.face[0]:t?t.x-o.x:0,dz=o.face?o.face[1]:t?t.y-o.y:1;return Math.atan2(dx,dz)}
function buildItem(o){
  const g=new THREE.Group(),u=g.userData,inner=new THREE.Group();g.add(inner);u.inner=inner;g.position.set(o.x+.5,0,o.y+.5);
  const p=inner;
  switch(o.type){
  case'table':{rbox(.86,.07,.86,WOOD,0,.5,0,p,.04);rbox(.9,.03,.9,DARK,0,.455,0,p,.015);[[-.34,-.34],[.34,-.34],[-.34,.34],[.34,.34]].forEach(([a,b])=>rbox(.07,.45,.07,DARK,a,.23,b,p,.02));
    rbox(.5,.012,.16,'#c0392b',0,.54,0,p,.005);cyl(.04,.1,'#2c4a8a',.18,.58,-.18,p,8);cyl(.035,.06,'#f2f2f2',-.2,.56,-.2,p,8);u.plates=[];break}
  case'lowtable':{rbox(.9,.06,.9,'#6b4127',0,.3,0,p,.04);[[-.36,-.36],[.36,-.36],[-.36,.36],[.36,.36]].forEach(([a,b])=>rbox(.07,.27,.07,DARK,a,.14,b,p,.02));
    const pot=cyl(.09,.1,'#e8e0d0',.15,.38,-.1,p,10);cyl(.05,.07,'#3a7a4a',-.15,.37,.12,p,8);u.plates=[];break}
  case'chair':{g.rotation.y=seatRot(o);const out=o.y>=10;
    rbox(.44,.07,.44,WOOD,0,.26,0,p,.04);rbox(.38,.05,.38,out?'#4a8a6a':'#c0392b',0,.31,0,p,.03);
    rbox(.44,.36,.06,WOOD,0,.48,-.19,p,.03);rbox(.3,.05,.04,DARK,0,.52,-.16,p,.01);
    [[-.17,-.17],[.17,-.17],[-.17,.17],[.17,.17]].forEach(([a,b])=>cyl(.03,.24,DARK,a,.12,b,p,6));addTipDirty(p,u,.58,.42);break}
  case'stool':{g.rotation.y=seatRot(o);cyl(.2,.06,'#c0392b',0,.46,0,p,14);cyl(.21,.03,DARK,0,.42,0,p,14);cyl(.04,.4,'#3a3f48',0,.21,0,p,8);cyl(.15,.03,'#3a3f48',0,.02,0,p,12);break}
  case'cushion':{g.rotation.y=seatRot(o);rbox(.48,.09,.48,'#7a3cc0',0,.07,0,p,.04);rbox(.42,.02,.42,'#9b5ee0',0,.12,0,p,.01);addTipDirty(p,u,.36,.42);break}
  case'stove':{rbox(.92,.82,.86,'#dfe4e8',0,.41,0,p,.06);rbox(.94,.06,.88,'#4b5560',0,.84,0,p,.03);
    box(.6,.3,.02,'#3b4248',0,.42,.44,p);[-.25,0,.25].forEach(a=>cyl(.04,.04,'#ff9f1c',a,.7,.44,p,8).rotation.x=Math.PI/2);
    const burn=cyl(.2,.03,'#222',-.18,.88,0,p,16);burn.castShadow=false;u.burn=burn;cyl(.17,.03,'#222',.22,.88,-.1,p,16).castShadow=false;
    const pan=new THREE.Group();pan.position.set(-.18,.93,0);cyl(.19,.08,'#33373c',0,0,0,pan,18,.16);box(.3,.03,.05,DARK,.32,.03,0,pan);p.add(pan);u.pan=pan;
    cyl(.12,.18,'#c7d0d6',.22,.98,-.1,p,14);
    const idx=stoves().indexOf(o),cs=hired('chef')[idx];u.chefId=cs?cs.id:'helper';
    const chef=mkAvatar(Object.assign({role:'chef',staffRole:'chef',name:cs?cs.name:'Phụ bếp'},cs?cs.look:{skin:'#f9d3b0',hair:'#5a3820',eye:'#4a2e1a',style:'short',outfit:'chef'}));chef.parent.remove(chef);chef.position.set(-.05,0,.86);chef.rotation.y=Math.PI;g.add(chef);u.chef=chef;
    const b=bubbleCanvas();const bs=sprite(b.tex,.95,7);bs.scale.set(.85,1.06,1);bs.position.set(0,2.1,.2);bs.visible=false;g.add(bs);u.b=b;u.bs=bs;u.steam=0;break}
  case'stall':{g.rotation.y=Math.PI/2;rbox(.96,.8,.6,'#a0683c',0,.4,.15,p,.04);rbox(1,.06,.66,'#d8b07a',0,.82,.15,p,.02);
    [-.45,.45].forEach(x=>cyl(.04,1.6,DARK,x,.8,-.25,p,6));const r=M(new THREE.BoxGeometry(1.2,.06,.9),mat('#c0392b'),0,1.65,.05,p);r.rotation.x=.25;
    for(let i=0;i<4;i++)rbox(.24,.35,.02,i%2?'#ffffff':'#2c4a8a',-.36+i*.24,1.42,.42,p,.01);
    const sg=sprite(textTex('TAIYAKI','#ffd166',48),1,4,true);sg.scale.set(1,.38,1);sg.position.set(0,1.95,.1);p.add(sg);
    for(let i=0;i<3;i++){const t=sprite(emojiTex('🐟'),.24,4,true);t.position.set(-.25+i*.25,.95,.3);p.add(t)}
    u.vendorKey='';u.vp=p;break}
  case'stage':{rbox(.96,.12,.96,'#7a4a26',0,.06,0,p,.03);rbox(.5,.06,.5,'#7a3cc0',0,.15,0,p,.02);const sh=new THREE.Group();sh.position.set(.25,.4,.15);rbox(.12,.16,.04,'#f4ecd8',0,0,0,sh,.02);cyl(.012,.45,DARK,0,.28,0,sh,4);sh.rotation.z=-.6;p.add(sh);break}
  case'bar':{rbox(1.02,.95,.7,'#7a4a26',0,.48,0,p,.04);rbox(1.06,.07,.78,'#d8b07a',0,.98,0,p,.02);rbox(1.02,.05,.3,'#f4ecd8',0,1.03,-.15,p,.01);
    if(o.x%2){const c=cyl(.12,.03,'#2c4a8a',.2,1.06,-.15,p,12);const s=sprite(emojiTex('🍣'),.28,4,true);s.position.set(.2,1.15,-.15);p.add(s)}
    else{box(.22,.12,.22,basic('#bfe9f7'),-.2,1.1,-.15,p).castShadow=false}break}
  case'belt':{if(!o.main)break;const B=new THREE.Group();B.position.set(.5,0,1);p.add(B);
    rbox(1.9,.85,2.9,'#7a4a26',0,.42,0,B,.05);rbox(2.0,.06,3.0,'#d8b07a',0,.87,0,B,.03);
    const track=rbox(1.5,.05,2.5,'#9aa6ae',0,.92,0,B,.2);rbox(.9,.12,1.9,'#4a2c17',0,.96,0,B,.06);
    rbox(.6,.4,1.4,'#2c4a8a',0,1.2,0,B,.05);const s=sprite(textTex('回転寿司','#fff3c4',44),1,4,true);s.scale.set(1.2,.45,1);s.position.set(0,1.62,0);B.add(s);
    u.plates=[];const cols=['#e63946','#2c4a8a','#ffb703','#2a8a6a','#f4f4f4'];for(let i=0;i<12;i++){const pg=new THREE.Group();cyl(.11,.025,cols[i%5],0,0,0,pg,14);const sp=sprite(emojiTex(DISHES[i%3].e),.24,4,true);sp.position.y=.1;pg.add(sp);pg.userData.s=sp;B.add(pg);u.plates.push(pg)}
    u.B=B;break}
  case'crate':{const n=1+(o.x+o.y)%2;for(let i=0;i<n;i++)rbox(.62,.5,.62,['#b07a46','#9a6a3c'][i%2],(i?.12:0),.25+i*.5,(i?-.06:0),p,.03).rotation.y=i*.4;
    box(.66,.04,.08,'#6b4127',0,.3,.31,p);if(o.x+o.y==2||o.x+o.y==7||o.area=='stall'){const s=sprite(textTex('🔒 Cấp '+AREAS[o.area].lv,'#fff3c4',46),1,6,true);s.scale.set(1.3,.49,1);s.position.set(0,1.6,0);p.add(s)}break}
  case'shoji':{const along=o.x==4&&o.y<4?'z':'x';const corner=o.x==4&&o.y==4;
    const mk=ax=>{const pn=box(ax=='z'?.06:1,1.6,ax=='z'?1:.06,new THREE.MeshBasicMaterial({map:TEX.shoji(2,3.2),transparent:true,opacity:.92}),0,.85,0,p);pn.castShadow=false;
      rbox(ax=='z'?.1:1.04,.08,ax=='z'?1.04:.1,DARK,0,1.68,0,p,.02);rbox(ax=='z'?.12:1.04,.06,ax=='z'?1.04:.12,DARK,0,.05,0,p,.02)};
    if(corner){mk('x');rbox(.12,1.7,.12,DARK,-.5,.85,-.5,p,.02)}else mk(along);break}
  case'pond':{if(!o.main)break;const P=new THREE.Group();P.position.set(.5,0,.5);p.add(P);
    const w=cyl(.9,.05,new THREE.MeshToonMaterial({color:'#3a8ab0',gradientMap:ramp}),0,.02,0,P,28);w.scale.z=.85;w.castShadow=false;
    for(let i=0;i<14;i++){const a=i/14*Math.PI*2,r=ball(.15+(i%3)*.03,'#9a958c',Math.cos(a)*.95,.05,Math.sin(a)*.82,P,8);r.scale.y=.6}
    [[.3,.2],[-.4,-.1]].forEach(([a,b])=>{const l=cyl(.12,.01,'#5fae5a',a,.06,b,P,10);l.castShadow=false});
    u.koi=[0,1,2].map(i=>{const k=new THREE.Group();const b=ball(.07,i==1?'#ffffff':'#ff7b2e',0,0,0,k,10);b.scale.set(1,.6,2);if(i==1)ball(.035,'#ff7b2e',0,.03,.03,k,6);const t=M(new THREE.ConeGeometry(.04,.09,6),mat(i==1?'#ffffff':'#ff7b2e'),0,0,-.15,k);t.rotation.x=-Math.PI/2;k.position.y=.05;P.add(k);return k});break}
  case'bigsakura':case'sakura':{const s=o.type=='bigsakura'?1.25:.9;const tr=cyl(.12*s,1.5*s,'#5a3a28',0,.75*s,0,p,8,.16*s);tr.rotation.z=.08;
    [[0,1.8,0,.75],[.5,1.6,.2,.55],[-.5,1.65,-.1,.55],[.1,2.25,-.2,.5],[-.25,2.1,.35,.45],[.35,2.05,-.4,.4]].forEach(([a,y,b,r],i)=>ball(r*s,['#ffc2d4','#ffb0c8','#ffd6e2'][i%3],a*s,y*s,b*s,p,12));break}
  case'bonsai':{rbox(.42,.16,.32,'#2c4a8a',0,.08,0,p,.03);const t=cyl(.04,.3,'#5a3a28',.02,.3,0,p,6);t.rotation.z=.4;
    [[-.1,.45,0,.14],[.12,.52,.04,.12],[0,.6,-.05,.1]].forEach(([a,y,b,r])=>{const c=ball(r,'#3f8a4a',a,y,b,p,10);c.scale.y=.6});break}
  case'ikebana':{cyl(.1,.22,'#2a2a33',0,.11,0,p,10,.12);[[-.06,.42,'#ff6b8a'],[.05,.5,'#ffffff'],[.02,.36,'#ffd166']].forEach(([a,y,c])=>{cyl(.008,y,'#3f7a3a',a,y/2+.15,0,p,4);ball(.05,c,a,y+.15,0,p,8)});cyl(.25,.03,'#4a2c17',0,.015,0,p,14);break}
  case'lantern':{rbox(.34,.06,.34,DARK,0,.03,0,p,.02);cyl(.03,.6,DARK,0,.35,0,p,6);const b=rbox(.34,.46,.34,new THREE.MeshBasicMaterial({map:TEX.shoji(1.4,2)}),0,.88,0,p,.03);b.castShadow=false;rbox(.42,.05,.42,DARK,0,1.13,0,p,.02);
    const l=new THREE.PointLight('#ffcf8a',.35,3.5);l.position.y=.9;p.add(l);break}
  case'rug':{const m=rbox(.9,.02,.9,'#c9b27a',0,.012,0,p,.02);m.castShadow=false;rbox(.78,.025,.78,'#b89d62',0,.014,0,p,.02).castShadow=false;break}
  case'maneki':{rbox(.36,.12,.3,'#c0392b',0,.06,0,p,.03);const b=ball(.16,'#ffffff',0,.28,0,p,14);b.scale.set(1,1.1,.9);const h=ball(.15,'#ffffff',0,.52,0,p,14);
    [[-.08,.65],[.08,.65]].forEach(([a,y])=>M(new THREE.ConeGeometry(.05,.09,4),mat('#ffffff'),a,y,0,p));
    const arm=ball(.06,'#ffffff',.14,.62,.04,p,8);arm.scale.y=1.5;u.arm=arm;cyl(.11,.03,'#c0392b',0,.42,0,p,12);ball(.035,'#ffc93c',0,.4,.12,p,8);
    [-.05,.05].forEach(a=>{const e=box(.03,.008,.01,'#2a1a10',a,.54,.14,p);e.castShadow=false});ball(.02,'#ff8fa3',0,.51,.15,p,6);break}
  case'toro':{rbox(.36,.12,.36,'#9a958c',0,.06,0,p,.03);cyl(.07,.4,'#9a958c',0,.32,0,p,8);rbox(.34,.1,.34,'#8a857c',0,.55,0,p,.03);
    const l=rbox(.24,.2,.24,new THREE.MeshBasicMaterial({color:'#ffe6a8'}),0,.7,0,p,.02);l.castShadow=false;M(new THREE.ConeGeometry(.3,.18,4),mat('#8a857c'),0,.89,0,p).rotation.y=Math.PI/4;ball(.05,'#8a857c',0,1,0,p,6);break}
  case'umbrella':{cyl(.025,1.9,'#4a2c17',0,.95,0,p,8);const c=M(new THREE.ConeGeometry(.95,.38,16,1,true),new THREE.MeshToonMaterial({color:'#e63946',side:THREE.DoubleSide,gradientMap:ramp}),0,2,0,p);
    for(let i=0;i<8;i++){const r=box(.012,.012,.95,DARK,0,1.86,0,p);r.rotation.y=i*Math.PI/8;r.rotation.x=.38;r.castShadow=false}
    rbox(1.2,.06,.5,'#e63946',0,.35,0,p,.03);rbox(1.1,.32,.06,DARK,0,.17,0,p,.02);break}
  case'koto':{rbox(1.0,.08,.32,'#c8935a',0,.36,0,p,.04);[-.4,.4].forEach(a=>rbox(.06,.32,.3,DARK,a,.16,0,p,.02));for(let i=0;i<6;i++){const s=box(.95,.006,.006,'#f2f2f2',0,.41,-.12+i*.048,p);s.castShadow=false}
    for(let i=0;i<6;i++)M(new THREE.ConeGeometry(.02,.05,3),mat('#f4ecd8'),-.2+i*.08,.43,-.12+i*.048,p);break}
  case'shishi':{const b=cyl(.3,.2,'#8a857c',0,.1,0,p,14);const w=cyl(.24,.02,basic('#7fd3f0'),0,.2,0,p,14);w.castShadow=false;
    cyl(.04,.6,'#7ea84a',.3,.3,0,p,6);const arm=new THREE.Group();arm.position.set(.3,.55,0);const pipe=cyl(.045,.6,'#8ab85a',0,0,0,arm,8);pipe.rotation.z=Math.PI/2;pipe.position.x=-.1;p.add(arm);u.tilt=arm;ball(.08,'#9a958c',-.25,.06,.25,p,8);break}
  case'wall':{rbox(.22,.95,1.02,'#6b4127',0,.47,0,p,.03);const pn=box(.08,.8,.98,new THREE.MeshBasicMaterial({map:TEX.shoji(2,1.6)}),0,1.35,0,p);pn.castShadow=false;rbox(.24,.08,1.04,DARK,0,1.79,0,p,.02);break}
  case'fence':{for(let i=0;i<6;i++){const m=cyl(.05,.55+Math.sin(o.x*3+i)*.05,'#7ea84a',-.42+i*.17,.28,0,p,6);m.castShadow=false}rbox(1.02,.05,.08,'#5a7a3a',0,.4,0,p,.02);if(o.x%3==1)ball(.16,'#4fa35a',.2,.45,.12,p,10);break}
  case'counter':{rbox(.96,.88,.9,'#dfe4e8',0,.44,0,p,.05);rbox(1,.07,.94,'#8a949c',0,.9,0,p,.02);rbox(.4,.05,.28,'#d8b07a',-.15,.96,.05,p,.02);const k=box(.18,.01,.03,'#cfd6dc',-.1,1,.05,p);k.castShadow=false;ball(.08,'#ff9a76',.25,1,-.15,p,8).scale.set(1.6,.5,1);break}
  case'sink':{rbox(.96,.88,.9,'#dfe4e8',0,.44,0,p,.05);rbox(1,.07,.94,'#8a949c',0,.9,0,p,.02);box(.5,.04,.4,'#9fb3bd',0,.94,0,p);cyl(.025,.25,'#b0b7bd',0,1.05,-.3,p,6);break}
  case'fridge':{rbox(.86,1.7,.8,'#f4f8fa',0,.85,0,p,.07);box(.82,.02,.02,'#c9d2d8',0,1.15,.41,p);box(.04,.35,.04,'#8a949c',.3,1.4,.42,p);box(.04,.35,.04,'#8a949c',.3,.8,.42,p);break}
  }
  scene.add(g);return g}
function addTipDirty(p,u,y,z){const tip=new THREE.Group();tip.position.set(0,y,z);[0,1,2].forEach(i=>cyl(.07,.03,'#ffc93c',i*.03-.03,i*.035,0,tip,12));
  const ts=sprite(emojiTex('💰'),.42,6);ts.position.set(0,.32,0);tip.add(ts);tip.visible=false;p.add(tip);u.tip=tip;u.tipS=ts;
  const dirty=new THREE.Group();dirty.position.set(0,y-.03,z);cyl(.14,.02,'#f2f2f2',0,0,0,dirty,14);box(.16,.01,.01,'#4a2c17',.02,.02,.03,dirty);ball(.03,'#f4ecd8',-.04,.025,0,dirty,6);dirty.visible=false;p.add(dirty);u.dirty=dirty}
const easeBack=t=>{const c=1.70158;return 1+(c+1)*Math.pow(t-1,3)+c*Math.pow(t-1,2)};
function beltPos(t){ // rounded-rectangle loop around the belt centre
  const a=.62,b=1.12,per=2*(2*a+2*b);let d=((t%1)+1)%1*per;
  if(d<2*a)return[-a+d,b];d-=2*a;if(d<2*b)return[a,b-d];d-=2*b;if(d<2*a)return[a-d,-b];d-=2*a;return[-a,-b+d]}
function syncItems(time,now){
  const ids=new Set(S.items.map(o=>o.id));
  for(const[id,e]of itemObj)if(!ids.has(id)){scene.remove(e.g);itemObj.delete(id)}
  for(const o of S.items){let e=itemObj.get(o.id);if(!e){e={g:buildItem(o)};itemObj.set(o.id,e)}
    const g=e.g,u=g.userData,age=(now-o.born)/1000;
    if(age<.6&&(!T[o.type].fixed||o.type=='belt'||o.type=='stool'||o.type=='cushion'||o.type=='lowtable'))u.inner.scale.setScalar(Math.max(.01,easeBack(Math.min(1,age/.5))));else u.inner.scale.setScalar(1);
    if(u.tip){u.tip.visible=!!o.tip;u.dirty.visible=!!o.dirty&&!o.tip;if(o.tip)u.tipS.position.y=.32+Math.abs(Math.sin(time*4))*.12}
    if(o.type=='stove'){const cs=hired('chef')[stoves().indexOf(o)];if((cs?cs.id:'helper')!==u.chefId){scene.remove(g);itemObj.delete(o.id);continue}const hot=o.cook||o.hold;u.burn.material=hot?basic('#ff8a2a'):mat('#222');u.bs.visible=!!hot&&(viewK=='kitchen'||rad<homeRad*.45);
      if(o.cook){const d=o.cook.c.dish,rem=(1-(o.prog||0))*dishCook(d);drawBubble(u.b,DISHES[d].e,o.prog||0,rem,false,'🍳');u.pan.rotation.z=Math.sin(time*9)*.12;u.pan.position.y=.93+Math.abs(Math.sin(time*9))*.04;
        if((u.steam-=1/60)<=0){u.steam=.25;puff(g.position.x-.18,1.05,g.position.z)}}
      else{u.pan.rotation.z=0;u.pan.position.y=.93}
      if(o.hold)drawBubble(u.b,DISHES[o.hold.c.dish].e,null,null,false,'✅');
      animChef(u.chef,time,!!o.cook)}
    else if(o.type=='table'||o.type=='lowtable'){const eaters=customers.filter(c=>c.table===o&&c.st=='eat');
      while(u.plates.length<eaters.length){const pg=new THREE.Group();cyl(.13,.02,'#ffffff',0,0,0,pg,16);const s=sprite(emojiTex('🍣'),.32,4);s.position.y=.12;pg.add(s);pg.userData.s=s;g.add(pg);u.plates.push(pg)}
      while(u.plates.length>eaters.length)g.remove(u.plates.pop());
      const top=o.type=='lowtable'?.34:.55;eaters.forEach((c,i)=>{const pg=u.plates[i],dx=c.chair.x-o.x,dz=c.chair.y-o.y;pg.position.set(dx*.26,top,dz*.26);pg.userData.s.material.map=emojiTex(DISHES[c.dish].e)})}
    else if(o.type=='stall'){const vh=hired('vendor')[0],key=vh?vh.id:'gen';if(u.vendorKey!==key){if(u.vendor)u.vp.remove(u.vendor);
        const v=mkAvatar(Object.assign({role:'w',staffRole:'vendor',name:vh?vh.name:'Bán hàng'},vh?vh.look:{skin:'#f9d3b0',hair:'#2b1b12',eye:'#4a2e1a',style:'short',outfit:'casual',color:'#ff9f1c'}));v.parent.remove(v);v.position.set(0,0,-.35);u.vp.add(v);u.vendor=v;u.vendorKey=key}
      pose(u.vendor.userData,{t:time});blink(u.vendor.userData,1/60)}
    else if(o.type=='belt'&&u.plates)u.plates.forEach((pg,i)=>{const[x,z]=beltPos(time*.035+i/12);pg.position.set(x,.97,z)});
    else if(o.type=='pond'&&u.koi)u.koi.forEach((k,i)=>{const a=time*(.5+i*.15)+i*2.1;k.position.x=Math.cos(a)*.5;k.position.z=Math.sin(a)*.4;k.rotation.y=-a});
    else if(o.type=='maneki')u.arm.position.y=.62+Math.sin(time*4)*.05;
    else if(o.type=='shishi')u.tilt.rotation.z=Math.sin(time*1.2)>.92?-.5:.15;
  }}
const puffs=[];const puffTex=canvasTex(64,64,(x)=>{const gr=x.createRadialGradient(32,32,2,32,32,30);gr.addColorStop(0,'rgba(255,255,255,.9)');gr.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=gr;x.fillRect(0,0,64,64)});
function puff(x,y,z){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:puffTex,transparent:true,depthWrite:false}));s.position.set(x+rnd(-.08,.08),y,z+rnd(-.08,.08));s.scale.setScalar(.2);s.userData.a=0;scene.add(s);puffs.push(s)}
function syncPuffs(dt){for(let i=puffs.length-1;i>=0;i--){const s=puffs[i];s.userData.a+=dt;s.position.y+=dt*.6;s.scale.setScalar(.2+s.userData.a*.5);s.material.opacity=Math.max(0,.8-s.userData.a*.7);if(s.userData.a>1.1){scene.remove(s);s.material.dispose();puffs.splice(i,1)}}}
