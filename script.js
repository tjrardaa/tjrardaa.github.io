(()=>{
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const track=$('#track'),panels=$$('.panel'),N=panels.length;
const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
let modal=false;

/* ---------- Défilement horizontal ---------- */
let target=0,raf=0;
const maxX=()=>Math.max(0,track.scrollWidth-track.clientWidth);
function step(){const d=target-track.scrollLeft;
  if(Math.abs(d)<.8){track.scrollLeft=target;raf=0;return}
  const inc=d*(reduce?1:.14);track.scrollLeft+=Math.abs(inc)<1?Math.sign(d):inc;raf=requestAnimationFrame(step)}
function go(x){target=Math.max(0,Math.min(maxX(),x));if(!raf)raf=requestAnimationFrame(step)}
const cur=()=>Math.max(0,Math.min(N-1,Math.round(track.scrollLeft/track.clientWidth)));
function goPanel(i){i=Math.max(0,Math.min(N-1,i));go(i*track.clientWidth)}
addEventListener('wheel',e=>{
  if(modal||e.ctrlKey)return;
  const m=e.deltaMode===1?32:e.deltaMode===2?innerHeight:1,dx=e.deltaX*m,dy=e.deltaY*m;
  const p=e.target.closest&&e.target.closest('.panel');
  if(p&&Math.abs(dy)>Math.abs(dx)&&p.scrollHeight>p.clientHeight+2){
    if((dy>0&&p.scrollTop+p.clientHeight<p.scrollHeight-1)||(dy<0&&p.scrollTop>0))return}
  e.preventDefault();if(!raf)target=track.scrollLeft;
  go(target+(Math.abs(dx)>Math.abs(dy)?dx:dy));
},{passive:false});
track.addEventListener('scroll',()=>{if(!raf)target=track.scrollLeft;ui()},{passive:true});
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

/* ---------- Barre du bas (timeline) ---------- */
const rail=$('#rail'),head=$('#head'),fill=$('#fill'),tc=$('#tc'),hint=$('#scrollhint');
const marks=panels.map((p,i)=>{const b=document.createElement('button');b.type='button';b.className='mk';b.style.left=(i/(N-1)*100)+'%';
  b.setAttribute('aria-label',p.dataset.label);b.innerHTML='<span>'+p.dataset.label+'</span>';b.onclick=()=>goPanel(i);rail.appendChild(b);return b});
const pad=n=>String(Math.floor(n)).padStart(2,'0');
function ui(){
  const mx=maxX(),pr=mx?track.scrollLeft/mx:0;
  head.style.left=(pr*100)+'%';fill.style.width=(pr*100)+'%';
  const s=pr*90;tc.textContent=pad(s/3600)+':'+pad(s/60%60)+':'+pad(s%60)+':'+pad((s%1)*25);
  const c=cur();marks.forEach((m,i)=>m.classList.toggle('on',i<=c));
  $$('.links a').forEach(a=>a.classList.toggle('on',+a.dataset.go===c));
  $('#prev').disabled=c===0;$('#next').disabled=c===N-1;
  if(track.scrollLeft>60)hint.classList.add('off');
}
addEventListener('resize',()=>{track.scrollLeft=cur()*track.clientWidth;ui()});ui();
// petit coup de pouce pour montrer qu'on peut défiler vers la droite
setTimeout(()=>{if(!reduce&&track.scrollLeft<5&&!modal){go(70);setTimeout(()=>{if(track.scrollLeft<120)go(0)},650)}},2600);

/* ---------- Compétences : le logo qui jette un œil ---------- */
const SK=[
 ['Développement',[
  ['HTML','html5','E34F26','HT','BUT MMI et ce portfolio'],['CSS','css3','1572B6','CS','BUT MMI et ce portfolio'],
  ['JavaScript','javascript','F7DF1E','JS','BUT MMI et ce portfolio'],['PHP','php','777BB4','PHP','Back-office de la SAE 203'],
  ['Python','python','3776AB','PY','Scripts personnels'],['C#','csharp','512BD4','C#','Projet Unity en groupe'],
  ['Lua','lua','2C2D72','LU','Scripts et mods'],['SQL (MySQL)','mysql','4479A1','SQL','Base de données de la SAE 203']]],
 ['Systèmes & réseaux',[
  ['Linux (bases)','linux','FCC624','LX','Bases, en apprentissage'],['VirtualBox','virtualbox','21416B','VB','Machines virtuelles'],
  ['Docker','docker','2496ED','DK','Conteneurs'],['Modèle OSI','','12141F','OSI','Les 7 couches vues en cours'],
  ['TCP/IP','','12141F','IP','Adressage et protocoles'],['Packet Tracer','cisco','1BA0D7','PT','Cours et OpenClassrooms'],['SSH','','12141F','SSH','Accès à distance']]],
 ['Outils',[
  ['Git / GitHub','git','F05032','GIT','Versions et dépôts'],['VS Code','visualstudiocode','007ACC','VS','Mon éditeur de code'],
  ['PuTTY','','12141F','PuT','Connexions SSH'],['Premiere Pro','adobepremierepro','9999FF','Pr','Mon outil de montage'],
  ['After Effects','adobeaftereffects','9999FF','Ae','Animations et effets'],['Photoshop','adobephotoshop','31A8FF','Ps','Retouches et miniatures']]],
 ['Langues',[['Français','','2F4BFF','FR','Langue courante'],['Turc','','FF5A36','TR','Langue maternelle'],['Anglais B2','','35D6A3','EN','Niveau B2']]]
];
const sk=$('#skills');
SK.forEach(([g,items])=>{const d=document.createElement('div');d.innerHTML='<h3>'+g+'</h3>';const ul=document.createElement('ul');
  items.forEach(it=>{const li=document.createElement('li');li.className='chip';li.tabIndex=0;li.textContent=it[0];li._d=it;ul.appendChild(li)});
  d.appendChild(ul);sk.appendChild(d)});
const peek=$('#peek'),pimg=$('#pimg'),pmono=$('#pmono');let pt;
function showPeek(it){
  clearTimeout(pt);peek.style.setProperty('--c','#'+it[2]);pmono.textContent=it[3];pmono.hidden=false;pimg.hidden=true;pimg.removeAttribute('src');
  $('#pname').textContent=it[0];$('#pnote').textContent=it[4];
  if(it[1]){pimg.onload=()=>{pimg.hidden=false;pmono.hidden=true};pimg.onerror=()=>{pimg.hidden=true};pimg.src='https://cdn.simpleicons.org/'+it[1]+'/'+it[2]}
  peek.classList.add('on')}
const hidePeek=()=>{peek.classList.remove('on');$$('.chip.hot').forEach(c=>c.classList.remove('hot'))};
sk.addEventListener('pointerover',e=>{const c=e.target.closest('.chip');if(c&&e.pointerType==='mouse')showPeek(c._d)});
sk.addEventListener('pointerout',e=>{if(e.target.closest('.chip')&&e.pointerType==='mouse')hidePeek()});
sk.addEventListener('focusin',e=>{const c=e.target.closest('.chip');if(c)showPeek(c._d)});
sk.addEventListener('focusout',hidePeek);
sk.addEventListener('click',e=>{const c=e.target.closest('.chip');if(!c)return;hidePeek();c.classList.add('hot');showPeek(c._d);pt=setTimeout(hidePeek,2400)});
track.addEventListener('scroll',()=>{if(cur()!==3)hidePeek()},{passive:true});

/* ---------- Cartes projets : rotation 3D + compte rendu ---------- */
const stage=$('#stage'),fc=$('#fc'),rep=$('#report');
let anim=null,busy=false,from=null;
const T=(x,y,s,a)=>`perspective(1500px) translate(${x}px,${y}px) scale(${s}) rotateY(${a}deg)`;
function openP(btn){
  if(modal||busy)return;busy=modal=true;from=btn;hidePeek();
  const R=btn.getBoundingClientRect(),vw=innerWidth,vh=innerHeight,narrow=vw<900;
  $('.front',fc).innerHTML=btn.innerHTML;$('.front',fc).className='face pcard front '+[...btn.classList].find(c=>c.startsWith('t-'));
  Object.assign(fc.style,{left:R.left+'px',top:R.top+'px',width:R.width+'px',height:R.height+'px'});
  rep.innerHTML='<button class="x" type="button" aria-label="Fermer">✕</button>'+$('#'+btn.dataset.r).innerHTML;
  $('.x',rep).onclick=closeP;
  const cx=R.left+R.width/2,cy=R.top+R.height/2;
  const s1=Math.min(1.5,vh*.6/R.height,vw*.78/R.width);
  let s2,x2,y2;
  if(narrow){s2=.52;x2=vw/2;y2=64+R.height*s2/2;
    Object.assign(rep.style,{left:'12px',right:'12px',bottom:'12px',top:(y2+R.height*s2/2+14)+'px'})}
  else{s2=Math.min(1.12,vh*.66/R.height);x2=vw*.22;y2=vh/2;
    Object.assign(rep.style,{left:(x2+R.width*s2/2+48)+'px',right:'5vw',top:'10vh',bottom:'10vh'})}
  stage.hidden=false;document.body.classList.add('is-open');btn.style.visibility='hidden';
  requestAnimationFrame(()=>stage.classList.add('on'));
  const dur=reduce?1:1300;
  anim=fc.animate([
    {transform:T(0,0,1,0),easing:'cubic-bezier(.5,0,.25,1)'},
    {transform:T(vw/2-cx,vh/2-cy,s1,360),offset:.52,easing:'cubic-bezier(.45,0,.2,1)'},
    {transform:T(x2-cx,y2-cy,s2,360)}
  ],{duration:dur,fill:'forwards'});
  setTimeout(()=>rep.classList.add('on'),dur*.66);
  anim.onfinish=()=>{busy=false;const x=$('.x',rep);x&&x.focus({preventScroll:true})};
}
function closeP(){
  if(!modal||busy)return;busy=true;rep.classList.remove('on');stage.classList.remove('on');document.body.classList.remove('is-open');
  anim.reverse();
  anim.onfinish=()=>{stage.hidden=true;from.style.visibility='';anim.cancel();modal=busy=false;from.focus({preventScroll:true})};
}
$$('.pcard',track).forEach(b=>b.addEventListener('click',()=>openP(b)));
$('.veil',stage).addEventListener('click',closeP);
addEventListener('resize',()=>{if(modal&&!busy){rep.classList.remove('on');stage.classList.remove('on');stage.hidden=true;if(from)from.style.visibility='';anim&&anim.cancel();document.body.classList.remove('is-open');modal=false}});

/* ---------- Scène 3D : cadenas + pellicule ---------- */
const canvas=$('#scene');
function no3d(){document.body.classList.add('no3d')}
if(!window.THREE){no3d();return}
let renderer;
try{renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'})}catch(e){no3d();return}
renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));
const scene=new THREE.Scene(),cam=new THREE.PerspectiveCamera(45,1,.1,60);cam.position.z=9;
scene.add(new THREE.AmbientLight(0xffffff,.7));
const key=new THREE.DirectionalLight(0xffffff,.95);key.position.set(3,5,7);scene.add(key);
const blue=new THREE.PointLight(0x6f8bff,1.6,22);blue.position.set(-6,-2,4);scene.add(blue);
const warm=new THREE.PointLight(0xffb36b,1.2,22);warm.position.set(6,3,4);scene.add(warm);

function rr(w,h,r){const s=new THREE.Shape(),x=-w/2,y=-h/2;s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);return s}
const root=new THREE.Group();scene.add(root);
// cadenas
const lock=new THREE.Group();root.add(lock);lock.scale.setScalar(1.35);
const bodyGeo=new THREE.ExtrudeGeometry(rr(2.6,2.1,.42),{depth:.9,bevelEnabled:true,bevelSize:.1,bevelThickness:.1,bevelSegments:5,curveSegments:18});bodyGeo.center();
const bodyMat=new THREE.MeshPhysicalMaterial({color:0xff5a36,roughness:.32,metalness:.05,clearcoat:1,clearcoatRoughness:.15});
const body=new THREE.Mesh(bodyGeo,bodyMat);lock.add(body);
const silver=new THREE.MeshStandardMaterial({color:0xdfe3ee,roughness:.3,metalness:.55});
const pivot=new THREE.Group();pivot.position.set(-.78,1.15,0);lock.add(pivot);
const sh=new THREE.Group();sh.position.x=.78;pivot.add(sh);
sh.add(new THREE.Mesh(new THREE.TorusGeometry(.78,.18,20,48,Math.PI),silver));
[-.78,.78].forEach(x=>{const l=new THREE.Mesh(new THREE.CylinderGeometry(.18,.18,.62,20),silver);l.position.set(x,-.31,0);sh.add(l)});
const dark=new THREE.MeshStandardMaterial({color:0x12141f,roughness:.5});
const kh=new THREE.Mesh(new THREE.CircleGeometry(.21,32),dark);kh.position.set(0,.12,.56);lock.add(kh);
const ks=new THREE.Mesh(new THREE.BoxGeometry(.13,.5,.02),dark);ks.position.set(0,-.2,.56);lock.add(ks);
// pellicule
const reel=new THREE.Group();root.add(reel);reel.rotation.x=.22;reel.rotation.z=-.08;
const cols=[0xff5a36,0x2f4bff,0xffd23f,0x35d6a3,0xf3eee3],R0=3.25,NF=12;
const frameGeo=new THREE.BoxGeometry(1.5,1.05,.06),picGeo=new THREE.PlaneGeometry(1.22,.72),holeGeo=new THREE.PlaneGeometry(.12,.1);
const filmMat=new THREE.MeshStandardMaterial({color:0x12141f,roughness:.6}),holeMat=new THREE.MeshBasicMaterial({color:0xf3eee3});
for(let i=0;i<NF;i++){const a=i/NF*Math.PI*2,f=new THREE.Group();
  f.add(new THREE.Mesh(frameGeo,filmMat));
  const pic=new THREE.Mesh(picGeo,new THREE.MeshStandardMaterial({color:cols[i%cols.length],roughness:.55}));pic.position.z=.035;f.add(pic);
  for(let k=0;k<5;k++){[-1,1].forEach(sd=>{const h=new THREE.Mesh(holeGeo,holeMat);h.position.set(-.55+k*.275,sd*.44,.035);f.add(h)})}
  f.position.set(Math.sin(a)*R0,0,Math.cos(a)*R0);f.rotation.y=a;reel.add(f)}
// interaction
let unlocked=false,mx=0,my=0,hover=false,boost=0,vis=true,w=1,h=1;
const ray=new THREE.Raycaster(),ndc=new THREE.Vector2(),green=new THREE.Color(0x35d6a3),coral=new THREE.Color(0xff5a36);
function aim(e){const r=canvas.getBoundingClientRect();ndc.set(((e.clientX-r.left)/r.width)*2-1,-((e.clientY-r.top)/r.height)*2+1);ray.setFromCamera(ndc,cam);return ray.intersectObject(lock,true).length>0}
addEventListener('pointermove',e=>{mx=e.clientX/innerWidth-.5;my=e.clientY/innerHeight-.5;if(!modal&&cur()===0){hover=aim(e);canvas.style.cursor=hover?'pointer':'default'}},{passive:true});
const msgs=['Accès accordé. Alternance 2027 ?','Re-verrouillé. Sécurité d\'abord.'];
const toast=document.createElement('div');Object.assign(toast.style,{position:'fixed',left:'50%',bottom:'82px',transform:'translate(-50%,20px)',opacity:'0',background:'#12141f',color:'#fff',padding:'10px 16px',borderRadius:'10px',font:'500 13px "DM Mono",monospace',transition:'.3s',zIndex:'30',pointerEvents:'none',maxWidth:'90vw'});document.body.appendChild(toast);let tt;
canvas.addEventListener('click',e=>{if(!aim(e))return;unlocked=!unlocked;boost=1;$('#hint3d').style.opacity=0;
  toast.textContent=unlocked?msgs[0]:msgs[1];toast.style.opacity='1';toast.style.transform='translate(-50%,0)';clearTimeout(tt);tt=setTimeout(()=>{toast.style.opacity='0';toast.style.transform='translate(-50%,20px)'},2400)});
function size(){const r=canvas.getBoundingClientRect();w=r.width;h=r.height;renderer.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix();
  const hh=Math.tan(22.5*Math.PI/180)*cam.position.z,hw=hh*cam.aspect;
  if(innerWidth>900){const s=Math.min(1.15,hw*.46/4.1);root.scale.setScalar(s);root.position.set(hw*.5,0,0)}
  else{const s=Math.min(.9,hw*.86/4.1);root.scale.setScalar(s);root.position.set(0,hh*.38,0)}}
size();addEventListener('resize',size);
new IntersectionObserver(e=>{vis=e[0].isIntersecting},{root:track,threshold:0}).observe(canvas);
let t=0;
(function frame(){requestAnimationFrame(frame);if(!vis||document.hidden)return;
  t+=.012;boost*=.96;
  reel.rotation.y+=reduce?.0:(.004+boost*.06);
  const tp=unlocked?1:0;
  pivot.position.y+=((1.15+tp*.5)-pivot.position.y)*.12;
  pivot.rotation.y+=((tp*2.4)-pivot.rotation.y)*.1;
  bodyMat.color.lerp(unlocked?green:coral,.08);
  root.rotation.y+=((mx*.7)-root.rotation.y)*.05;root.rotation.x+=((my*.45)-root.rotation.x)*.05;
  lock.position.y=Math.sin(t)*.08;lock.scale.setScalar(1.35*(hover?1.04:1));
  renderer.render(scene,cam)})();
})();
