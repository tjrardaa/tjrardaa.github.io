(()=>{
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const track=$('#track'),panels=$$('.panel'),N=panels.length;
const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
const INTERACTIVE='a,button,.chip,.pcard,.report,input,textarea';
let modal=false;

/* ---------- Défilement horizontal fluide (par sections) ---------- */
let anim=0;
const maxX=()=>Math.max(0,track.scrollWidth-track.clientWidth);
const cur=()=>Math.max(0,Math.min(N-1,Math.round(track.scrollLeft/track.clientWidth)));
const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
function scrollToX(x,min=600){
  cancelAnimationFrame(anim);anim=0;
  const from=track.scrollLeft,to=Math.max(0,Math.min(maxX(),x));
  if(reduce||Math.abs(to-from)<2){track.scrollLeft=to;return}
  const dur=Math.min(1200,Math.max(min,Math.abs(to-from)*.45+380)),t0=performance.now();
  track.style.scrollSnapType='none';
  (function tick(now){const p=Math.min(1,(now-t0)/dur);track.scrollLeft=from+(to-from)*ease(p);
    if(p<1)anim=requestAnimationFrame(tick);else{anim=0;track.style.scrollSnapType=''}})(t0);
}
const goPanel=i=>scrollToX(Math.max(0,Math.min(N-1,i))*track.clientWidth);
let gate=true,lastW=0;
addEventListener('wheel',e=>{
  if(modal||e.ctrlKey)return;
  const m=e.deltaMode===1?32:e.deltaMode===2?innerHeight:1,dx=e.deltaX*m,dy=e.deltaY*m;
  const p=e.target.closest&&e.target.closest('.panel');
  if(p&&Math.abs(dy)>Math.abs(dx)&&p.scrollHeight>p.clientHeight+2){
    if((dy>0&&p.scrollTop+p.clientHeight<p.scrollHeight-1)||(dy<0&&p.scrollTop>0))return}
  e.preventDefault();
  const now=performance.now(),gap=now-lastW;lastW=now;
  if(!gate&&!anim&&gap>120)gate=true;       // un nouveau geste commence quand le précédent est fini
  if(!gate||anim)return;
  const d=Math.abs(dx)>Math.abs(dy)?dx:dy;if(Math.abs(d)<6)return;
  gate=false;goPanel(cur()+(d>0?1:-1));
},{passive:false});
track.addEventListener('scroll',ui,{passive:true});
addEventListener('keydown',e=>{
  if(modal){if(e.key==='Escape')closeP();return}
  const t=document.activeElement&&document.activeElement.tagName;if(t==='INPUT'||t==='TEXTAREA')return;
  if(e.key==='ArrowRight'||e.key==='PageDown'){e.preventDefault();goPanel(cur()+1)}
  else if(e.key==='ArrowLeft'||e.key==='PageUp'){e.preventDefault();goPanel(cur()-1)}
  else if(e.key==='Home'){e.preventDefault();goPanel(0)}
  else if(e.key==='End'){e.preventDefault();goPanel(N-1)}
});
$$('[data-go]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();goPanel(+a.dataset.go)}));
$('#prev').onclick=()=>goPanel(cur()-1);$('#next').onclick=()=>goPanel(cur()+1);

/* ---------- Barre du bas ---------- */
const rail=$('#rail'),head=$('#head'),fill=$('#fill'),tc=$('#tc'),hint=$('#scrollhint');
const marks=panels.map((p,i)=>{const b=document.createElement('button');b.type='button';b.className='mk';b.style.left=(i/(N-1)*100)+'%';
  b.setAttribute('aria-label',p.dataset.label);b.innerHTML='<span>'+p.dataset.label+'</span>';b.onclick=()=>goPanel(i);rail.appendChild(b);return b});
function ui(){
  const mx=maxX(),pr=mx?track.scrollLeft/mx:0;
  head.style.left=(pr*100)+'%';fill.style.width=(pr*100)+'%';
  tc.textContent='0x'+Math.round(pr*255).toString(16).toUpperCase().padStart(2,'0');
  const c=cur();marks.forEach((m,i)=>m.classList.toggle('on',i<=c));
  $$('.links a').forEach(a=>a.classList.toggle('on',+a.dataset.go===c));
  $('#prev').disabled=c===0;$('#next').disabled=c===N-1;
  if(track.scrollLeft>60)hint.classList.add('off');
  if(c!==3)hidePeek();
}
addEventListener('resize',()=>{track.scrollLeft=cur()*track.clientWidth;ui()});
setTimeout(()=>{if(!reduce&&track.scrollLeft<5&&!modal){scrollToX(80,520);setTimeout(()=>{if(track.scrollLeft<130)scrollToX(0,520)},750)}},2600);

/* ---------- Compétences : le logo qui jette un œil ---------- */
const dev=n=>[`https://cdn.jsdelivr.net/gh/devicons/devicon@v2.16.0/icons/${n}/${n}-original.svg`,`https://cdn.jsdelivr.net/gh/devicons/devicon@v2.16.0/icons/${n}/${n}-plain.svg`,`https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${n}/${n}-original.svg`];
// [nom, devicon, simple-icons, couleur, initiales, note]
const SK=[
 ['Développement',[
  ['HTML','html5','html5','E34F26','HT','BUT MMI et ce portfolio'],['CSS','css3','css3','1572B6','CS','BUT MMI et ce portfolio'],
  ['JavaScript','javascript','javascript','F7DF1E','JS','BUT MMI et ce portfolio'],['PHP','php','php','777BB4','PHP','Back-office de la SAE 203'],
  ['Python','python','python','3776AB','PY','Scripts personnels'],['C#','csharp','csharp','512BD4','C#','Projet Unity en groupe'],
  ['Lua','lua','lua','2C2D72','LU','Scripts et mods'],['SQL (MySQL)','mysql','mysql','4479A1','SQL','Base de données de la SAE 203']]],
 ['Systèmes & réseaux',[
  ['Linux (bases)','linux','linux','FCC624','LX','Bases, en apprentissage'],['VirtualBox','virtualbox','virtualbox','21416B','VB','Machines virtuelles'],
  ['Docker','docker','docker','2496ED','DK','Conteneurs'],['Modèle OSI','','','12141F','OSI','Les 7 couches vues en cours'],
  ['TCP/IP','','','12141F','IP','Adressage et protocoles'],['Packet Tracer','cisco','cisco','1BA0D7','PT','Cours et OpenClassrooms'],['SSH','','','12141F','>_','Accès à distance']]],
 ['Outils',[
  ['Git / GitHub','git','git','F05032','GIT','Versions et dépôts'],['VS Code','vscode','visualstudiocode','007ACC','VS','Mon éditeur de code'],
  ['PuTTY','','','12141F','PuT','Connexions SSH'],['Premiere Pro','premierepro','adobepremierepro','9999FF','Pr','Mon outil de montage'],
  ['After Effects','aftereffects','adobeaftereffects','9999FF','Ae','Animations et effets'],['Photoshop','photoshop','adobephotoshop','31A8FF','Ps','Retouches et miniatures']]],
 ['Langues',[['Français','','','2F4BFF','FR','Langue courante'],['Turc','','','FF5A36','TR','Langue maternelle'],['Anglais B2','','','35D6A3','EN','Niveau B2']]]
];
const sk=$('#skills');
SK.forEach(([g,items])=>{const d=document.createElement('div');d.innerHTML='<h3>'+g+'</h3>';const ul=document.createElement('ul');
  items.forEach(it=>{const li=document.createElement('li');li.className='chip';li.tabIndex=0;li.textContent=it[0];li._d=it;ul.appendChild(li)});
  d.appendChild(ul);sk.appendChild(d)});
const peek=$('#peek'),pimg=$('#pimg'),pmono=$('#pmono');let pt,ptok=0;
function showPeek(it){
  clearTimeout(pt);const tok=++ptok;
  peek.style.setProperty('--c','#'+it[3]);pmono.textContent=it[4];pmono.hidden=false;pimg.hidden=true;pimg.removeAttribute('src');
  $('#pname').textContent=it[0];$('#pnote').textContent=it[5];
  const urls=[...(it[1]?dev(it[1]):[]),...(it[2]?['https://cdn.simpleicons.org/'+it[2]+'/'+it[3]]:[])];let k=0;
  pimg.onload=()=>{if(tok===ptok){pimg.hidden=false;pmono.hidden=true}};
  pimg.onerror=()=>{if(tok===ptok&&k<urls.length)pimg.src=urls[k++]};
  if(urls.length)pimg.src=urls[k++];
  peek.classList.add('on')}
function hidePeek(){peek.classList.remove('on');$$('.chip.hot').forEach(c=>c.classList.remove('hot'))}
sk.addEventListener('pointerover',e=>{const c=e.target.closest('.chip');if(c&&e.pointerType==='mouse')showPeek(c._d)});
sk.addEventListener('pointerout',e=>{if(e.target.closest('.chip')&&e.pointerType==='mouse')hidePeek()});
sk.addEventListener('focusin',e=>{const c=e.target.closest('.chip');if(c)showPeek(c._d)});
sk.addEventListener('focusout',hidePeek);
sk.addEventListener('click',e=>{const c=e.target.closest('.chip');if(!c)return;hidePeek();c.classList.add('hot');showPeek(c._d);pt=setTimeout(hidePeek,2400)});

/* ---------- Cartes projets : rotation 3D + compte rendu ---------- */
const stage=$('#stage'),fc=$('#fc'),rep=$('#report');
let canim=null,busy=false,from=null;
const T=(x,y,s,a)=>`perspective(1500px) translate(${x}px,${y}px) scale(${s}) rotateY(${a}deg)`;
function openP(btn){
  if(modal||busy)return;busy=modal=true;from=btn;hidePeek();
  const R=btn.getBoundingClientRect(),vw=innerWidth,vh=innerHeight,narrow=vw<900;
  $('.front',fc).innerHTML=btn.innerHTML;$('.front',fc).className='face pcard front '+[...btn.classList].find(c=>c.startsWith('t-'));
  Object.assign(fc.style,{left:R.left+'px',top:R.top+'px',width:R.width+'px',height:R.height+'px'});
  rep.innerHTML='<button class="x" type="button" aria-label="Fermer">✕</button>'+$('#'+btn.dataset.r).innerHTML;
  $('.x',rep).onclick=closeP;
  const cx=R.left+R.width/2,cy=R.top+R.height/2,s1=Math.min(1.5,vh*.6/R.height,vw*.78/R.width);
  let s2,x2,y2;
  if(narrow){s2=.52;x2=vw/2;y2=64+R.height*s2/2;Object.assign(rep.style,{left:'12px',right:'12px',bottom:'12px',top:(y2+R.height*s2/2+14)+'px'})}
  else{s2=Math.min(1.12,vh*.66/R.height);x2=vw*.22;y2=vh/2;Object.assign(rep.style,{left:(x2+R.width*s2/2+48)+'px',right:'5vw',top:'10vh',bottom:'10vh'})}
  stage.hidden=false;document.body.classList.add('is-open');btn.style.visibility='hidden';
  requestAnimationFrame(()=>stage.classList.add('on'));
  const dur=reduce?1:1300;
  canim=fc.animate([
    {transform:T(0,0,1,0),easing:'cubic-bezier(.5,0,.25,1)'},
    {transform:T(vw/2-cx,vh/2-cy,s1,360),offset:.52,easing:'cubic-bezier(.45,0,.2,1)'},
    {transform:T(x2-cx,y2-cy,s2,360)}],{duration:dur,fill:'forwards'});
  setTimeout(()=>rep.classList.add('on'),dur*.66);
  canim.onfinish=()=>{busy=false;const x=$('.x',rep);x&&x.focus({preventScroll:true})};
}
function closeP(){
  if(!modal||busy)return;busy=true;rep.classList.remove('on');stage.classList.remove('on');document.body.classList.remove('is-open');
  canim.reverse();
  canim.onfinish=()=>{stage.hidden=true;from.style.visibility='';canim.cancel();modal=busy=false;from.focus({preventScroll:true})};
}
$$('.pcard',track).forEach(b=>b.addEventListener('click',()=>openP(b)));
$('.veil',stage).addEventListener('click',closeP);
addEventListener('resize',()=>{if(modal&&!busy){rep.classList.remove('on');stage.classList.remove('on');stage.hidden=true;if(from)from.style.visibility='';canim&&canim.cancel();document.body.classList.remove('is-open');modal=false}});
ui();

/* ---------- Scène 3D : cadenas entourés de 0 et de 1 ---------- */
const canvas=$('#scene');
const no3d=()=>document.body.classList.add('no3d');
if(!window.THREE){no3d();return}
let renderer;
try{renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'})}catch(e){no3d();return}
renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));
const scene=new THREE.Scene(),cam=new THREE.PerspectiveCamera(45,1,.1,80);cam.position.z=9;
scene.add(new THREE.AmbientLight(0xffffff,.7));
const key=new THREE.DirectionalLight(0xffffff,.95);key.position.set(3,5,7);scene.add(key);
const blue=new THREE.PointLight(0x6f8bff,1.6,26);blue.position.set(-6,-2,4);scene.add(blue);
const warm=new THREE.PointLight(0xffb36b,1.2,26);warm.position.set(6,3,4);scene.add(warm);

function rr(w,h,r){const s=new THREE.Shape(),x=-w/2,y=-h/2;s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);return s}
const bodyGeo=new THREE.ExtrudeGeometry(rr(2.6,2.1,.42),{depth:.9,bevelEnabled:true,bevelSize:.1,bevelThickness:.1,bevelSegments:5,curveSegments:18});bodyGeo.center();
const silver=new THREE.MeshStandardMaterial({color:0xdfe3ee,roughness:.3,metalness:.55}),dark=new THREE.MeshStandardMaterial({color:0x12141f,roughness:.5});
const archGeo=new THREE.TorusGeometry(.78,.18,20,48,Math.PI),legGeo=new THREE.CylinderGeometry(.18,.18,.62,20),khGeo=new THREE.CircleGeometry(.21,32),ksGeo=new THREE.BoxGeometry(.13,.5,.02);
// textures des caractères
const GL={};
function glyph(t,col){const k=t+col;if(GL[k])return GL[k];const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');
  g.font=(t.length>1?'700 54px':'700 92px')+' "DM Mono",ui-monospace,monospace';g.textAlign='center';g.textBaseline='middle';g.fillStyle=col;g.fillText(t,64,68);
  return GL[k]=new THREE.CanvasTexture(c)}
const GT=['0','1','0','1','0','1','0x','</>','{ }','0','1'],GC=['#12141f','#12141f','#ff5a36','#2f4bff'];
function makeShell(rMin,rMax,count){
  const g=new THREE.Group();
  for(let i=0;i<count;i++){const t=GT[(Math.random()*GT.length)|0],col=GC[(Math.random()*GC.length)|0];
    const s=new THREE.Sprite(new THREE.SpriteMaterial({map:glyph(t,col),transparent:true,depthWrite:false,opacity:.9}));
    const r=rMin+Math.random()*(rMax-rMin),th=Math.random()*Math.PI*2,ph=Math.acos(2*Math.random()-1);
    s.position.set(r*Math.sin(ph)*Math.cos(th),r*Math.cos(ph)*.8,r*Math.sin(ph)*Math.sin(th));
    const z=.36+Math.random()*.34;s.scale.set(z,z,1);g.add(s)}
  const ico=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(rMin-.2,1)),new THREE.LineBasicMaterial({color:0x12141f,transparent:true,opacity:.16}));g.add(ico);
  return g}
function makeLock(){
  const root=new THREE.Group(),lock=new THREE.Group();root.add(lock);lock.scale.setScalar(1.35);
  const mat=new THREE.MeshPhysicalMaterial({color:0xff5a36,roughness:.32,metalness:.05,clearcoat:1,clearcoatRoughness:.15});
  lock.add(new THREE.Mesh(bodyGeo,mat));
  const pivot=new THREE.Group();pivot.position.set(-.78,1.15,0);lock.add(pivot);
  const sh=new THREE.Group();sh.position.x=.78;pivot.add(sh);sh.add(new THREE.Mesh(archGeo,silver));
  [-.78,.78].forEach(x=>{const l=new THREE.Mesh(legGeo,silver);l.position.set(x,-.31,0);sh.add(l)});
  const kh=new THREE.Mesh(khGeo,dark);kh.position.set(0,.12,.56);lock.add(kh);
  const ks=new THREE.Mesh(ksGeo,dark);ks.position.set(0,-.2,.56);lock.add(ks);
  const shell=makeShell(3.2,4.7,70);root.add(shell);scene.add(root);
  return {root,lock,pivot,mat,shell,hover:false,open:false,boost:0}}
const A=makeLock(),B=makeLock();     // A : accueil · B : contact
B.shell.scale.setScalar(.85);
const green=new THREE.Color(0x35d6a3),coral=new THREE.Color(0xff5a36);

let mx=0,my=0,w=1,h=1,hw=1,hh=1,baseX=0,baseY=0,S=1;
function size(){w=innerWidth;h=innerHeight;renderer.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix();
  hh=Math.tan(22.5*Math.PI/180)*cam.position.z;hw=hh*cam.aspect;
  if(w>900){S=Math.min(1.15,hw*.46/4.2);baseX=hw*.5;baseY=0}else{S=Math.min(.9,hw*.86/4.2);baseX=0;baseY=hh*.38}
  A.root.scale.setScalar(S);B.root.scale.setScalar(S)}
size();addEventListener('resize',size);

const ray=new THREE.Raycaster(),ndc=new THREE.Vector2();
function aim(e,L){ndc.set(e.clientX/innerWidth*2-1,-(e.clientY/innerHeight*2-1));ray.setFromCamera(ndc,cam);return ray.intersectObject(L.lock,true).length>0}
const sx=()=>track.scrollLeft/innerWidth;
addEventListener('pointermove',e=>{
  mx=e.clientX/innerWidth-.5;my=e.clientY/innerHeight-.5;if(modal)return;
  const ok=!(e.target.closest&&e.target.closest(INTERACTIVE));
  A.hover=ok&&sx()<.7&&aim(e,A);B.hover=ok&&sx()>N-1.7&&aim(e,B);
  document.body.classList.toggle('hoverlock',B.hover)},{passive:true});
const toast=$('#toast');let tt;
function say(m){toast.textContent=m;toast.classList.add('on');clearTimeout(tt);tt=setTimeout(()=>toast.classList.remove('on'),2600)}
addEventListener('click',e=>{
  if(modal||(e.target.closest&&e.target.closest(INTERACTIVE)))return;
  if(sx()>N-1.7&&aim(e,B)){B.open=!B.open;B.boost=1;$('#hint3d').style.opacity=0;say(B.open?'Accès accordé. Alternance 2027 ?':'Re-verrouillé. Sécurité d\'abord.')}
  else if(sx()<.7&&aim(e,A)){A.boost=1}});

let t=0;
(function frame(){requestAnimationFrame(frame);if(document.hidden)return;
  const s=sx();if(s>1.3&&s<N-2.3)return;
  t+=.012;
  const upp=2*hw/w,off=track.scrollLeft*upp;
  A.root.position.set(baseX-off,baseY,0);B.root.position.set(baseX+(N-1)*innerWidth*upp-off,baseY,0);
  for(const L of [A,B]){
    L.boost*=.96;L.shell.rotation.y+=reduce?0:.0025+L.boost*.05+(L.hover?.004:0);L.shell.rotation.x+=reduce?0:.0009;
    const tp=L.open?1:0;
    L.pivot.position.y+=((1.15+tp*.5)-L.pivot.position.y)*.12;L.pivot.rotation.y+=((tp*2.4)-L.pivot.rotation.y)*.1;
    L.mat.color.lerp(L.open?green:coral,.08);
    L.root.rotation.y+=((mx*.7)-L.root.rotation.y)*.05;L.root.rotation.x+=((my*.45)-L.root.rotation.x)*.05;
    L.lock.position.y=Math.sin(t+(L===B?2:0))*.08;L.lock.scale.setScalar(1.35*(L.hover?1.05:1))}
  renderer.render(scene,cam)})();
})();
