(function(){
const $=s=>document.querySelector(s);
// Horloges Paris / Genève
function clocks(){const f=tz=>new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit',timeZone:tz});
 $('#c1').textContent=f('Europe/Paris');$('#c2').textContent=f('Europe/Zurich')}
clocks();setInterval(clocks,15000);
// Toast
const toast=$('#toast');let tt;
function say(m){toast.textContent=m;toast.classList.add('on');clearTimeout(tt);tt=setTimeout(()=>toast.classList.remove('on'),2600)}
// Révélation au scroll
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.15});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
// Lien actif + timecode lié au scroll
const links=[...document.querySelectorAll('.nav nav a')];
const secs=links.map(a=>document.querySelector(a.getAttribute('href')));
const tc=$('#tc');
function onScroll(){
 const y=scrollY+innerHeight*.35;let cur=0;secs.forEach((s,i)=>{if(s&&s.offsetTop<=y)cur=i});
 links.forEach((a,i)=>a.classList.toggle('on',i===cur));
 const max=document.documentElement.scrollHeight-innerHeight;const sec=(max>0?scrollY/max:0)*3600;
 const p=n=>String(Math.floor(n)).padStart(2,'0');
 tc.textContent='TC '+p(sec/3600)+':'+p(sec/60%60)+':'+p(sec%60)+':'+p((sec%1)*25);
}
addEventListener('scroll',onScroll,{passive:true});onScroll();
// Scène 3D
const canvas=$('#scene');
const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
function fail(){document.body.classList.add('no3d')}
if(!window.THREE){fail();return}
let renderer;
try{renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'})}catch(e){fail();return}
renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
const scene=new THREE.Scene();
const cam=new THREE.PerspectiveCamera(45,1,.1,50);cam.position.z=8;
scene.add(new THREE.AmbientLight(0xffffff,.6));
const key=new THREE.DirectionalLight(0xffffff,.9);key.position.set(3,4,6);scene.add(key);
const rim=new THREE.PointLight(0xff3b1f,2.2,18);rim.position.set(-4,-2,3);scene.add(rim);
const rim2=new THREE.PointLight(0xff3b1f,1.6,18);rim2.position.set(4,3,2);scene.add(rim2);
const mats={
 dark:new THREE.MeshPhysicalMaterial({color:0x1a1210,roughness:.18,metalness:.35,clearcoat:1,clearcoatRoughness:.08}),
 white:new THREE.MeshPhysicalMaterial({color:0xf4f4f2,roughness:.42,metalness:.05,clearcoat:.6}),
 lime:new THREE.MeshBasicMaterial({color:0xb8f21d})
};
const rings=[];const grp=new THREE.Group();scene.add(grp);
function add(geo,mat,x,y,z,s,rs){const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.scale.setScalar(s);m.userData={rs,ox:x,oy:y,ph:Math.random()*6};grp.add(m);rings.push(m);return m}
const tor=new THREE.TorusGeometry(1,.42,48,96),box=new THREE.BoxGeometry(.55,1.7,.55);
add(tor,mats.dark,-4.6,1.3,-1.5,1.15,[.004,.006]);
add(tor,mats.white,4.4,1.1,-1,1.1,[.005,-.004]);
add(tor,mats.dark,3.6,-2.5,-.4,.9,[-.006,.005]);
add(tor,mats.white,-3.8,-2.4,-.8,1,[.003,.004]);
add(box,mats.lime,-6.2,-.2,-2,1,[.003,.005]);
add(box,mats.lime,6.4,-.6,-2,.8,[-.004,.003]);
add(box,mats.lime,.2,3.2,-3.5,.7,[.005,-.003]);
let mx=0,my=0,boost=0,w=0,h=0,vis=true;
addEventListener('pointermove',e=>{mx=e.clientX/innerWidth-.5;my=e.clientY/innerHeight-.5},{passive:true});
function size(){const r=canvas.getBoundingClientRect();w=r.width;h=r.height;renderer.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix();grp.scale.setScalar(w<720?.5:1);grp.position.y=w<720?1.4:0}
size();addEventListener('resize',size);
new IntersectionObserver(e=>{vis=e[0].isIntersecting}).observe(canvas);
// Clic : les anneaux s'emballent
const msgs=['sudo make me hired','Accès root… refusé. Pour l\'instant.','nmap -sV arda.dev','Tu cherches un alternant ? Il est ici.','cat /etc/passwd → non, tu rêves','Bravo, tu as trouvé l\'easter egg.'];
let mi=0;
canvas.addEventListener('click',()=>{boost=1;say(msgs[mi++%msgs.length]);$('#hint').style.opacity=0});
let t=0;
function frame(){requestAnimationFrame(frame);if(!vis||document.hidden)return;
 t+=.01;boost*=.965;const k=1+boost*14;
 rings.forEach(m=>{m.rotation.x+=m.userData.rs[0]*k+(reduce?0:.0);m.rotation.y+=m.userData.rs[1]*k;
  if(!reduce)m.position.y=m.userData.oy+Math.sin(t+m.userData.ph)*.18});
 grp.rotation.y+=((mx*.5)-grp.rotation.y)*.05;grp.rotation.x+=((my*.35)-grp.rotation.x)*.05;
 rim.position.x=-4+Math.sin(t*.7)*2;rim2.position.y=3+Math.cos(t*.6)*1.5;
 renderer.render(scene,cam)}
frame();
})();
