// ================= 3D: renderer, toon materials, textures =================
const $=id=>document.getElementById(id);
const cv=$('c');
const LOW=(()=>{try{if(localStorage.getItem('nhtp_low'))return true}catch(e){}return matchMedia('(pointer:coarse)').matches||Math.min(screen.width,screen.height)<700})();
const renderer=new THREE.WebGLRenderer({canvas:cv,antialias:!LOW,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(LOW?1.5:2,window.devicePixelRatio||1));
renderer.outputEncoding=THREE.sRGBEncoding;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=.92;
cv.addEventListener('webglcontextlost',e=>{e.preventDefault();try{localStorage.setItem('nhtp_low','1')}catch(_){}bootFail('Đồ họa bị quá tải nên trình duyệt đã tắt khung 3D. Bấm Tải lại để chạy ở chế độ nhẹ hơn.')});
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
const scene=new THREE.Scene();scene.background=new THREE.Color('#c9dfe0');scene.fog=new THREE.Fog('#c9dfe0',72,185);
const cam=new THREE.PerspectiveCamera(32,1,.5,260);
const TGT=new THREE.Vector3(W/2,.3,H/2-.5),goalT=TGT.clone();
let az=Math.PI/4,pol=.92,rad=34,goalR=34,homeRad=34,zoomed=false,viewK='all';
function placeCam(){cam.position.set(TGT.x+rad*Math.sin(pol)*Math.cos(az),TGT.y+rad*Math.cos(pol),TGT.z+rad*Math.sin(pol)*Math.sin(az));cam.lookAt(TGT)}
function resize(){const r=cv.parentElement.getBoundingClientRect();if(!r.width)return;renderer.setSize(r.width,r.height,false);cam.aspect=r.width/r.height;cam.updateProjectionMatrix();
  homeRad=Math.max(26,Math.min(72,36/Math.min(1.35,cam.aspect)));if(!zoomed)view(viewK,true)}
new ResizeObserver(resize).observe(cv.parentElement);
scene.add(new THREE.HemisphereLight('#fff4df','#536453',.55));
const sun=new THREE.DirectionalLight('#ffe0b0',.78);sun.position.set(W+8,20,H+2);sun.target.position.set(W/2,0,H/2);
sun.castShadow=true;sun.shadow.mapSize.set(LOW?1024:2048,LOW?1024:2048);Object.assign(sun.shadow.camera,{left:-20,right:20,top:20,bottom:-20,near:1,far:80});sun.shadow.bias=-.00035;sun.shadow.normalBias=.018;sun.shadow.radius=4;scene.add(sun,sun.target);
const fillLight=new THREE.DirectionalLight('#9ec7d8',.13);fillLight.position.set(-12,9,-8);scene.add(fillLight);
// 3-step toon ramp gives the cel-shaded cartoon look
const ramp=(()=>{const c=document.createElement('canvas');c.width=4;c.height=1;const x=c.getContext('2d');['#7a7a7a','#b8b8b8','#dedede','#f2f2f2'].forEach((v,i)=>{x.fillStyle=v;x.fillRect(i,0,1,1)});
  const t=new THREE.CanvasTexture(c);t.minFilter=t.magFilter=THREE.NearestFilter;t.generateMipmaps=false;return t})();
const mats=new Map();
const mat=(c,o={})=>{const k=c+JSON.stringify(o);if(!mats.has(k))mats.set(k,new THREE.MeshToonMaterial(Object.assign({color:c,gradientMap:ramp},o)));return mats.get(k)};
const basic=c=>{const k='B'+c;if(!mats.has(k))mats.set(k,new THREE.MeshBasicMaterial({color:c}));return mats.get(k)};
const OUT=new THREE.MeshBasicMaterial({color:'#3a2412',side:THREE.BackSide});
function canvasTex(w,h,draw,rx=1,ry=1){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rx,ry);t.anisotropy=4;return t}
const rnd=(a,b)=>a+Math.random()*(b-a);
const TEX={
  wood:(rx,ry)=>canvasTex(256,256,(x,w,h)=>{for(let i=0;i<8;i++){x.fillStyle=`hsl(30 ${rnd(42,54)}% ${rnd(46,53)}%)`;x.fillRect(0,i*32,w,32);x.fillStyle='rgba(91,49,20,.28)';x.fillRect(0,i*32,w,2);
    const off=(i%2)*128;x.fillRect(off+rnd(60,120),i*32,2,32);for(let k=0;k<5;k++){x.fillStyle='rgba(120,70,30,.08)';x.fillRect(rnd(0,w),i*32+rnd(4,28),rnd(30,90),2)}}},rx,ry),
  tile:(rx,ry)=>canvasTex(128,128,(x,w,h)=>{x.fillStyle='#b9c3c9';x.fillRect(0,0,w,h);for(let i=0;i<2;i++)for(let j=0;j<2;j++){x.fillStyle=(i+j)%2?'#e9eef0':'#c9d6db';x.fillRect(i*64+2,j*64+2,60,60)}},rx,ry),
  deck:(rx,ry)=>canvasTex(256,256,(x,w,h)=>{for(let i=0;i<8;i++){x.fillStyle=`hsl(26 ${rnd(40,50)}% ${rnd(46,54)}%)`;x.fillRect(i*32,0,32,h);x.fillStyle='rgba(60,30,10,.4)';x.fillRect(i*32,0,3,h);x.fillStyle='rgba(60,30,10,.25)';x.fillRect(i*32+10,rnd(20,200),3,3);x.fillRect(i*32+20,rnd(20,200),3,3)}},rx,ry),
  grass:(rx,ry)=>canvasTex(256,256,(x,w,h)=>{x.fillStyle='#77aa5d';x.fillRect(0,0,w,h);for(let i=0;i<900;i++){x.fillStyle=`hsla(${rnd(88,108)} 38% ${rnd(36,52)}% / .42)`;x.fillRect(rnd(0,w),rnd(0,h),2,rnd(3,6))}},rx,ry),
  road:(rx,ry)=>canvasTex(128,128,(x,w,h)=>{x.fillStyle='#59616a';x.fillRect(0,0,w,h);for(let i=0;i<500;i++){x.fillStyle=`rgba(${Math.random()<.5?0:255},${Math.random()<.5?0:255},255,.045)`;x.fillRect(rnd(0,w),rnd(0,h),2,2)}},rx,ry),
  paper:(rx,ry)=>canvasTex(128,128,(x,w,h)=>{x.fillStyle='#f7d9a8';x.fillRect(0,0,w,h);x.fillStyle='#efc283';for(let i=0;i<4;i++)x.fillRect(i*32+12,0,8,h);x.fillStyle='#f1a36b';for(let i=0;i<4;i++)for(let j=0;j<4;j++){x.beginPath();x.arc(i*32+16,j*32+16,3,0,7);x.fill()}},rx,ry),
  tatami:(rx,ry)=>canvasTex(256,256,(x,w,h)=>{for(let i=0;i<2;i++){x.fillStyle=i?'#c9c27a':'#d3cc86';x.fillRect(i*128,0,128,h);for(let k=0;k<64;k++){x.fillStyle='rgba(120,110,40,.18)';x.fillRect(i*128,k*4,128,1)}x.fillStyle='#2f3a2a';x.fillRect(i*128,0,6,h);x.fillRect(i*128+122,0,6,h)}},rx,ry),
  gravel:(rx,ry)=>canvasTex(256,256,(x,w,h)=>{x.fillStyle='#d9d3c7';x.fillRect(0,0,w,h);for(let i=0;i<1600;i++){const l=rnd(70,92);x.fillStyle=`hsl(35 10% ${l}%)`;x.beginPath();x.arc(rnd(0,w),rnd(0,h),rnd(1,2.5),0,7);x.fill()}x.strokeStyle='rgba(150,140,120,.35)';x.lineWidth=2;for(let j=8;j<h;j+=16){x.beginPath();for(let i=0;i<=w;i+=8)x.lineTo(i,j+Math.sin(i/20)*3);x.stroke()}},rx,ry),
  plaster:(rx,ry)=>canvasTex(128,128,(x,w,h)=>{x.fillStyle='#f6ead2';x.fillRect(0,0,w,h);for(let i=0;i<300;i++){x.fillStyle=`rgba(180,150,100,${rnd(.03,.08)})`;x.fillRect(rnd(0,w),rnd(0,h),rnd(2,6),rnd(2,6))}},rx,ry),
  shoji:(rx,ry)=>canvasTex(128,128,(x,w,h)=>{x.fillStyle='#fffaf0';x.fillRect(0,0,w,h);x.fillStyle='#7a4a26';for(let i=0;i<=4;i++){x.fillRect(i*32-2,0,4,h);x.fillRect(0,i*32-2,w,4)}},rx,ry),
  roof:(rx,ry)=>canvasTex(128,128,(x,w,h)=>{x.fillStyle='#3d4a5c';x.fillRect(0,0,w,h);for(let i=0;i<8;i++){x.fillStyle=i%2?'#4a5a70':'#56688a';x.fillRect(i*16,0,12,h)}for(let j=0;j<4;j++){x.fillStyle='rgba(0,0,0,.25)';x.fillRect(0,j*32+28,w,4)}},rx,ry),
  ktile:(rx,ry)=>canvasTex(128,128,(x,w,h)=>{x.fillStyle='#8c9aa0';x.fillRect(0,0,w,h);for(let i=0;i<4;i++)for(let j=0;j<4;j++){x.fillStyle=(i+j)%2?'#e9eef0':'#dfe6e9';x.fillRect(i*32+1,j*32+1,30,30)}},rx,ry),
};
const texMat=(t,c='#ffffff')=>new THREE.MeshToonMaterial({map:t,color:c,gradientMap:ramp});
// rounded box via extruded rounded-rect with bevel: soft "toy" furniture
const geoC=new Map();
function rgeo(w,h,d,r=.06){const k=[w,h,d,r].join();if(geoC.has(k))return geoC.get(k);
  const b=Math.min(r,h/2-.001,w/2-.001,d/2-.001),iw=w-2*b,id=d-2*b,rr=Math.min(b,iw/2,id/2)*.9+.0001,s=new THREE.Shape();
  s.moveTo(-iw/2+rr,-id/2);s.lineTo(iw/2-rr,-id/2);s.quadraticCurveTo(iw/2,-id/2,iw/2,-id/2+rr);s.lineTo(iw/2,id/2-rr);s.quadraticCurveTo(iw/2,id/2,iw/2-rr,id/2);
  s.lineTo(-iw/2+rr,id/2);s.quadraticCurveTo(-iw/2,id/2,-iw/2,id/2-rr);s.lineTo(-iw/2,-id/2+rr);s.quadraticCurveTo(-iw/2,-id/2,-iw/2+rr,-id/2);
  const g=new THREE.ExtrudeGeometry(s,{depth:Math.max(.001,h-2*b),bevelEnabled:true,bevelThickness:b,bevelSize:b,bevelSegments:2,curveSegments:3});
  g.rotateX(-Math.PI/2);g.translate(0,-(h-2*b)/2,0);geoC.set(k,g);return g}
function M(geo,m,x,y,z,p,shadow=true){const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);o.castShadow=shadow;o.receiveShadow=true;p&&p.add(o);return o}
const rbox=(w,h,d,c,x,y,z,p,r)=>M(rgeo(w,h,d,r),typeof c=='string'?mat(c):c,x,y,z,p);
const box=(w,h,d,c,x,y,z,p)=>M(new THREE.BoxGeometry(w,h,d),typeof c=='string'?mat(c):c,x,y,z,p);
const cyl=(r,h,c,x,y,z,p,seg=16,r2)=>M(new THREE.CylinderGeometry(r,r2==null?r:r2,h,seg),typeof c=='string'?mat(c):c,x,y,z,p);
const ball=(r,c,x,y,z,p,seg=16)=>M(new THREE.SphereGeometry(r,seg,Math.max(8,seg*.75|0)),typeof c=='string'?mat(c):c,x,y,z,p);
function outline(m,s=1.06){const o=new THREE.Mesh(m.geometry,OUT);o.scale.setScalar(s);m.add(o);return m}
function plane(w,h,m,x,y,z,p){const o=new THREE.Mesh(new THREE.PlaneGeometry(w,h),m);o.rotation.x=-Math.PI/2;o.position.set(x,y,z);o.receiveShadow=true;p&&p.add(o);return o}
// sprites
const texCache=new Map();
function emojiTex(t){if(!texCache.has(t)){const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');x.font='96px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",system-ui,sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText(t,64,72);const tx=new THREE.CanvasTexture(c);tx.encoding=THREE.sRGBEncoding;texCache.set(t,tx)}return texCache.get(t)}
function sprite(map,s,ro=5,depth=false){const sp=new THREE.Sprite(new THREE.SpriteMaterial({map,depthTest:depth,transparent:true}));sp.scale.set(s,s,1);sp.renderOrder=ro;return sp}
function textTex(t,col,size=58){const k='T'+t+col+size;if(!texCache.has(k)){if(texCache.size>500)[...texCache.keys()].filter(k=>k[0]=='T').slice(0,200).forEach(k=>{texCache.get(k).dispose();texCache.delete(k)});
  const c=document.createElement('canvas');c.width=256;c.height=96;const x=c.getContext('2d');x.font=`800 ${size}px "Baloo 2",system-ui,sans-serif`;x.textAlign='center';x.textBaseline='middle';x.lineJoin='round';x.lineWidth=12;x.strokeStyle='#3a2412';x.strokeText(t,128,52);x.fillStyle=col;x.fillText(t,128,52);const tx=new THREE.CanvasTexture(c);tx.encoding=THREE.sRGBEncoding;texCache.set(k,tx)}return texCache.get(k)}
// speech bubble with dish emoji and a patience ring, redrawn only when its content changes
function bubbleCanvas(){const c=document.createElement('canvas');c.width=160;c.height=200;return{c,x:c.getContext('2d'),tex:new THREE.CanvasTexture(c),key:''}}
function drawBubble(b,icon,frac,sec,vip,badge){
  const col=frac>.5?'#3cb371':frac>.25?'#ffb020':'#e63946',key=[icon,Math.ceil(sec),col,vip,badge].join('|');if(b.key===key)return;b.key=key;
  const x=b.x;x.clearRect(0,0,160,200);
  x.fillStyle='rgba(58,36,18,.25)';x.beginPath();x.ellipse(80,90,62,62,0,0,7);x.fill();
  x.fillStyle='#fff';x.beginPath();x.arc(80,82,60,0,7);x.fill();x.beginPath();x.moveTo(66,136);x.lineTo(80,160);x.lineTo(94,136);x.fill();
  if(frac!=null){x.lineWidth=11;x.strokeStyle='#eee2cc';x.beginPath();x.arc(80,82,52,0,7);x.stroke();x.strokeStyle=col;x.lineCap='round';x.beginPath();x.arc(80,82,52,-Math.PI/2,-Math.PI/2+Math.PI*2*Math.max(.001,frac));x.stroke()}
  x.font='62px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",system-ui';x.textAlign='center';x.textBaseline='middle';x.fillText(icon,80,86);
  if(vip){x.font='40px system-ui';x.fillText('👑',32,30)}
  if(badge){x.font='36px system-ui';x.fillText(badge,130,30)}
  if(sec!=null){x.font='800 34px "Baloo 2",system-ui';x.lineWidth=8;x.strokeStyle='#3a2412';x.lineJoin='round';const s=Math.ceil(sec)+'s';x.strokeText(s,80,184);x.fillStyle=col=='#e63946'?'#ff9a9a':'#fff';x.fillText(s,80,184)}
  b.tex.needsUpdate=true}

// ================= WORLD: a little Japanese sushi house with a garden =================
const room=new THREE.Group();scene.add(room);
plane(220,220,texMat(TEX.grass(40,40)),W/2,-.21,H/2,room);
plane(5,H+60,texMat(TEX.road(2,30)),W+4.15,-.18,H/2,room);
for(let z=-30;z<H+30;z+=3)plane(.14,1.4,basic('#f6efb0'),W+4.15,-.17,z,room);
rbox(1.6,.16,H+60,'#d9d2c4',W+.85,-.12,H/2,room,.05).castShadow=false;
// foundation + floors per zone
rbox(W+.3,.3,10.3,'#6b4a33',W/2,-.17,4.95,room,.08).castShadow=false;
rbox(W+.3,.3,4.3,'#a59c8c',W/2,-.17,11.85,room,.08).castShadow=false;
plane(8,9,texMat(TEX.wood(3,3.4)),4,0,4.5,room);
plane(4,4,texMat(TEX.wood(1.5,1.5)),10,0,7,room);
plane(3,5,texMat(TEX.ktile(3,5)),10.5,0,2.5,room);plane(1,5,texMat(TEX.ktile(1,5)),8.5,0,2.5,room);
const tatamiFloor=plane(4,4,texMat(TEX.tatami(2,2)),2,.03,2,room);
rbox(4.1,.07,4.1,'#5a3a22',2,-.01,2,room,.02).castShadow=false;
plane(W,1,texMat(TEX.wood(4,.4)),W/2,0,9.5,room);
plane(W,4,texMat(TEX.gravel(3,1)),W/2,0,12,room);
// stepping stones from gate to the house
[[10.6,11.5],[9.6,11.1],[8.6,10.6],[7.5,10.4],[6.2,10.2],[5.6,9.6]].forEach(([x,z],i)=>{const m=cyl(.32,.06,'#9a958c',x,.03,z,room,10);m.scale.z=.8;m.castShadow=false});
// back walls: dark timber frame, plaster panels, wood wainscot, tiled eave on top
function wallRun(len,horiz,kitchen,x0,z0){
  const g=new THREE.Group(),Hh=2.7,t=.28;
  const up=M(new THREE.BoxGeometry(horiz?len:t,Hh-.9,horiz?t:len),texMat(kitchen?TEX.ktile(len*1.2,1.4):TEX.plaster(len/2,1)),0,.9+(Hh-.9)/2,0,g);up.castShadow=false;
  rbox(horiz?len:t+.05,.9,horiz?t+.05:len,kitchen?'#5f6e76':'#6b4127',0,.45,0,g,.03);
  for(let s=0;s<=len+.01;s+=len/Math.max(1,Math.round(len/1.8))){const p=-len/2+s;rbox(horiz?.16:t+.1,Hh,horiz?t+.1:.16,'#4a2c17',horiz?p:0,Hh/2,horiz?0:p,g,.03)}
  rbox(horiz?len:t+.12,.12,horiz?t+.12:len,'#4a2c17',0,1.85,0,g,.03);
  rbox(horiz?len+.3:t+.16,.16,horiz?t+.16:len+.3,'#4a2c17',0,Hh,0,g,.04);
  const roof=M(new THREE.BoxGeometry(horiz?len+.8:1.1,.12,horiz?1.1:len+.8),texMat(TEX.roof(horiz?len:2,horiz?2:len)),horiz?0:-.25,Hh+.22,horiz?-.25:0,g);roof.rotation[horiz?'x':'z']=horiz?-.35:.35;
  rbox(horiz?len+.8:.16,.14,horiz?.16:len+.8,'#2e3846',horiz?0:.27,Hh+.06,horiz?.27:0,g,.04);
  g.position.set(x0,0,z0);room.add(g);return g}
wallRun(8.3,true,false,4-.15,-.14);wallRun(4,true,true,10,-.14);wallRun(9.3,false,false,-.14,4.5);
// shoji windows glowing warm
function shojiWin(x,z,horiz,w=1.6){const g=new THREE.Group();g.position.set(x,0,z);if(!horiz)g.rotation.y=Math.PI/2;
  rbox(w+.16,1.1,.1,'#4a2c17',0,1.45,.13,g,.03);const p=box(w,.96,.04,new THREE.MeshBasicMaterial({map:TEX.shoji(w*2,2)}),0,1.45,.18,g);p.castShadow=false;room.add(g)}
shojiWin(5.9,0,true);shojiWin(10.2,0,true,1.2);shojiWin(0,6.8,false);
// noren curtains on the kitchen pass + chalk menu + hanging scroll
function noren(x,z,rotY,w=1,col='#2c4a8a'){const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rotY;cyl(.03,w+.2,'#6b4127',0,2.12,0,g,6).rotation.z=Math.PI/2;
  const n=3;for(let i=0;i<n;i++){const p=rbox(w/n-.04,.7,.03,col,-w/2+w/n*(i+.5),1.75,0,g,.01);p.userData.sway=i}
  const s=sprite(emojiTex('🍣'),.34,4,true);s.position.set(0,1.8,.04);g.add(s);room.add(g);return g}
const norens=[noren(8.5,4.5,Math.PI/2,1,'#2c4a8a'),noren(2.5,4.5,0,1,'#a8323e')];
{const g=new THREE.Group();g.position.set(.02,0,2.6);g.rotation.y=Math.PI/2;rbox(1.9,1.2,.08,'#4a2c17',0,1.55,.14,g,.04);box(1.7,1.0,.04,'#2f4a3a',0,1.55,.19,g).castShadow=false;
 const t=sprite(textTex('THỰC ĐƠN','#fff3c4',44),1.3,4,true);t.scale.set(1.4,.52,1);t.position.set(0,1.86,.25);g.add(t);
 DISHES.slice(0,4).forEach((d,i)=>{const s=sprite(emojiTex(d.e),.32,4,true);s.position.set(-.6+i*.4,1.42,.25);g.add(s)});g.visible=false;room.add(g)}
{const g=new THREE.Group();g.position.set(3.3,0,.02);rbox(.7,1.3,.03,'#f4ecd8',0,1.55,.18,g,.01);cyl(.04,.86,'#4a2c17',0,2.22,.2,g,6).rotation.z=Math.PI/2;cyl(.04,.86,'#4a2c17',0,.9,.2,g,6).rotation.z=Math.PI/2;
 const s=sprite(textTex('寿司','#2a1a10',60),.7,4,true);s.scale.set(.9,.34,1);s.position.set(0,1.7,.22);g.add(s);ball(.12,'#e85d75',0,1.3,.21,g,10).scale.z=.3;room.add(g)}
// red paper lanterns (chochin) along the beams + gate
function chochin(x,y,z,c='#e63946',s=1){const g=new THREE.Group();g.position.set(x,y,z);cyl(.005,.25,'#222',0,.2,0,g,4);
  const b=ball(.2*s,basic(c),0,0,0,g,14);b.scale.y=1.25;b.castShadow=false;cyl(.12*s,.05,'#1a1a1a',0,.25*s,0,g,10);cyl(.12*s,.05,'#1a1a1a',0,-.25*s,0,g,10);
  if(!LOW)for(let k=-2;k<=2;k++){const r=new THREE.Mesh(new THREE.TorusGeometry(.2*s*Math.cos(k*.32),.006,4,18),basic('#7a1010'));r.rotation.x=Math.PI/2;r.position.y=k*.09*s;g.add(r)}
  room.add(g);return g}
const lanterns=[chochin(1.6,2.3,.35),chochin(4.6,2.3,.35),chochin(7.2,2.3,.35),chochin(.35,2.3,8),chochin(W-.1,2.1,DOOR[1]-.1,'#e63946',1.2),chochin(W-.1,2.1,DOOR[1]+1.1,'#e63946',1.2)];
// kitchen hood
rbox(1.9,.35,.5,'#9aa6ae',10.9,2.45,.2,room,.06);
{const s=sprite(textTex('BẾP','#ffe28a',56),1,4,true);s.scale.set(1.2,.45,1);s.position.set(8.6,2.55,4.5);room.add(s)}
// garden: bamboo fence along the street side, string of lanterns, torii-like gate with noren
for(let z=9.6;z<=13.95;z+=.17){if(Math.abs(z-(DOOR[1]+.5))<.6)continue;const m=cyl(.06,1.1+Math.sin(z*7)*.05,'#7ea84a',W-.05,.55,z,room,6);m.castShadow=false}
[[0,9.6],[0,13.8]].forEach(([x,z])=>cyl(.06,2.4,'#4a2c17',x+.05,1.2,z,room,8));
for(let i=0;i<=8;i++){const t=i/8,z=9.6+4.2*t;chochin(.05,2.25-Math.sin(t*Math.PI)*.3,z,i%2?'#ffb703':'#e63946',.45)}
{const g=new THREE.Group();g.position.set(W+.1,0,DOOR[1]+.5);cyl(.1,2.5,'#c0392b',0,1.25,-.62,g,10);cyl(.1,2.5,'#c0392b',0,1.25,.62,g,10);
 rbox(.2,.14,1.8,'#2a1a10',0,2.55,0,g,.04);rbox(.16,.12,1.5,'#c0392b',0,2.25,0,g,.04);
 const n=noren(0,0,Math.PI/2,1.1,'#2c4a8a');room.remove(n);n.position.set(0,.25,0);g.add(n);
 const s=sprite(textTex('MỞ CỬA','#7dffb4',50),1,4,true);s.scale.set(1.1,.41,1);s.position.set(.12,2.9,0);g.add(s);room.add(g)}
// shop sign above the entrance gap in the fence
{const g=new THREE.Group();g.position.set(6,0,9.5);cyl(.08,2.6,'#4a2c17',-1.05,1.3,0,g,10);cyl(.08,2.6,'#4a2c17',1.05,1.3,0,g,10);
 
 rbox(2.3,.46,.12,'#4a2c17',0,2.35,.3,g,.05);const s=sprite(textTex('NHÀ HÀNG TRIỆU PHÚ','#ffd166',30),1.6,4,true);s.scale.set(2.2,.82,1);s.position.set(0,2.35,.42);g.add(s);room.add(g)}
// trees outside: pines and round shrubs
function tree(x,z,s=1,kind=0){cyl(.12*s,1.1*s,'#6a4a32',x,.5*s,z,room,8);
  if(kind){[[0,1.4,.75],[.2,2,.55],[-.1,2.45,.38]].forEach(([dx,y,r])=>M(new THREE.ConeGeometry(r*s*1.2,r*s*1.6,9),mat('#3f8a4a'),x+dx*.2,y*s,z,room))}
  else{ball(.7*s,'#4fa35a',x,1.5*s,z,room,12);ball(.5*s,'#5fb46a',x+.38*s,1.85*s,z+.15*s,room,10);ball(.45*s,'#43925a',x-.35*s,1.75*s,z-.1*s,room,10)}}
[[-2.6,1,1,1],[-2.4,6,1.2,1],[-2.2,11,1,0],[2,H+1.6,1.1,1],[6.5,H+1.9,1,0],[10,H+1.5,1.2,1],[-3.4,15,1.3,0],[-4,-2,1.4,1],[4,-3,1.2,0],[9,-2.6,1.3,1]].forEach(a=>tree(...a));
// sakura petals drifting over the garden
const petals=[];const petalGeo=new THREE.PlaneGeometry(.09,.06),petalMat=new THREE.MeshBasicMaterial({color:'#ffb7c9',side:THREE.DoubleSide});
for(let i=0;i<(LOW?25:60);i++){const p=new THREE.Mesh(petalGeo,petalMat);p.position.set(rnd(-1,W+1),rnd(0,4),rnd(8,H+2));p.userData={v:rnd(.25,.5),s:rnd(0,6)};scene.add(p);petals.push(p)}
function syncPetals(dt,t){for(const p of petals){const u=p.userData;p.position.y-=u.v*dt;p.position.x+=Math.sin(t+u.s)*dt*.4;p.position.z+=dt*.15;p.rotation.set(t*1.5+u.s,t+u.s,0);
  if(p.position.y<.02){p.position.set(rnd(-1,8),rnd(3,4.5),rnd(9,13))}}}
// edit-mode grid overlay
const grid=(()=>{const p=[];for(let x=0;x<=W;x++)p.push(x,.04,0,x,.04,H);for(let z=0;z<=H;z++)p.push(0,.04,z,W,.04,z);
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));const l=new THREE.LineSegments(g,new THREE.LineBasicMaterial({color:'#ffffff',transparent:true,opacity:.55}));l.visible=false;scene.add(l);return l})();

