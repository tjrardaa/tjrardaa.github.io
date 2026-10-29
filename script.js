const APPS={
 about:{ico:'👤',name:'À propos',w:340,html:`<h2>Arda Nigiz</h2>
  <p>Étudiant en 3<sup>e</sup> année de Bachelor Cybersécurité à l'ESGI Paris, en alternance à partir de janvier 2027 (3 semaines en entreprise, 1 semaine de cours).</p>
  <p>Je vise le métier de pentester. Avant ça, j'ai validé 2 ans de BUT MMI (parcours développement web) à l'IUT de Cergy-Pontoise.</p>
  <p>En parallèle, je suis monteur vidéo en auto-entrepreneur depuis janvier 2025.</p>
  <p><span class="tag">Je cherche une alternance en cybersécurité, réseaux ou systèmes</span></p>`},
 projets:{ico:'📁',name:'Projets',w:380,html:`<h2>Projets</h2>
  <div class="proj sunk"><b>Jeu de plateforme 2D</b> <span class="tag">C#, Unity</span><br>Projet de groupe à deux : déplacements du joueur, ennemis, gestion des scènes et du son.</div>
  <div class="proj sunk"><b>Site PHP / MySQL</b> <span class="tag">BUT MMI</span><br>Projet de groupe à quatre : back-office d'administration (articles, auteurs, messages, connexion).</div>
  <div class="proj sunk"><b>Ce portfolio</b> <span class="tag">en ligne</span><br>Un bureau façon Windows XP en HTML, CSS et JavaScript, sans framework.</div>
  <div class="proj sunk"><b>Montage vidéo</b> <span class="tag">clients</span><br>Travail pour des clients depuis janvier 2025.</div>`},
 skills:{ico:'⚙️',name:'Compétences',w:340,html:`<h2>Compétences</h2>
  <p><b>Développement</b></p><ul><li>HTML, CSS, JavaScript, PHP</li><li>Python, C#, Lua</li><li>SQL (MySQL)</li></ul>
  <p><b>Systèmes et réseaux</b></p><ul><li>Linux (bases), VirtualBox, Docker</li><li>Modèle OSI, TCP/IP, Packet Tracer</li></ul>
  <p><b>Cybersécurité</b> <span class="tag">auto-formation</span></p><ul><li>TryHackMe, Root-Me, OverTheWire</li></ul>
  <p><b>Langues</b></p><ul><li>Français, turc (langue maternelle), anglais B2</li></ul>`},
 formation:{ico:'🎓',name:'Formation',w:340,html:`<h2>Formation</h2>
  <p><b>Bachelor Cybersécurité, 3<sup>e</sup> année en alternance</b><br>ESGI Paris – janvier 2027</p>
  <p><b>BUT MMI, parcours développement web</b><br>IUT de Cergy-Pontoise – 2 années validées</p>
  <p><b>Bac professionnel microtechniques</b></p>`},
 contact:{ico:'✉️',name:'Contact',w:320,html:`<h2>Contact</h2>
  <p>Une alternance à proposer, une question, un conseil ?</p>
  <p><a href="mailto:bryanigizarda@gmail.com">bryanigizarda@gmail.com</a></p>
  <p>Paris et Île-de-France.</p>`}
};
const $=s=>document.querySelector(s);
const desk=$('#desktop'),apps=$('#apps'),menu=$('#menu'),mlist=$('#mlist');
const coarse=matchMedia('(pointer:coarse)').matches;
let z=10,open={};

// Démarrage
const boot=$('#boot'),login=$('#login');
function toLogin(){boot.classList.remove('on');login.classList.add('on')}
setTimeout(()=>{if(boot.classList.contains('on'))toLogin()},2800);
boot.onclick=toLogin;boot.onkeydown=e=>{if(e.key==='Enter'||e.key===' ')toLogin()};
$('#shut').onclick=()=>{login.classList.remove('on');boot.classList.add('on');setTimeout(()=>{if(boot.classList.contains('on'))toLogin()},2800)};
$('#user').onclick=()=>{login.classList.remove('on');openApp('about')};

// Icônes et menu
Object.entries(APPS).forEach(([id,a])=>{
  const b=document.createElement('button');b.className='icon';b.type='button';
  b.innerHTML=`<span class="g">${a.ico}</span><span class="t">${a.name}</span>`;
  b.onclick=()=>{document.querySelectorAll('.icon').forEach(i=>i.classList.remove('sel'));b.classList.add('sel');if(coarse)openApp(id)};
  b.ondblclick=()=>openApp(id);
  b.onkeydown=e=>{if(e.key==='Enter')openApp(id)};
  desk.appendChild(b);
  const m=document.createElement('button');m.className='item';m.type='button';m.innerHTML=`<span>${a.ico}</span>${a.name}`;
  m.onclick=()=>{menu.classList.remove('on');openApp(id)};mlist.appendChild(m);
});
mlist.insertAdjacentHTML('beforeend','<hr>');
const off=document.createElement('button');off.className='item';off.type='button';off.innerHTML='<span>⏻</span>Arrêter…';
off.onclick=()=>{menu.classList.remove('on');Object.keys(open).forEach(closeApp);boot.classList.add('on');boot.querySelector('.bar i').style.animation='none';boot.querySelector('.bar i').offsetWidth;boot.querySelector('.bar i').style.animation='';setTimeout(()=>{if(boot.classList.contains('on'))toLogin()},2800)};
mlist.appendChild(off);
$('#startBtn').onclick=e=>{e.stopPropagation();menu.classList.toggle('on')};
document.addEventListener('click',e=>{if(!menu.contains(e.target))menu.classList.remove('on')});
desk.onclick=e=>{if(e.target===desk)document.querySelectorAll('.icon').forEach(i=>i.classList.remove('sel'))};

// Fenêtres
function focusWin(id){Object.entries(open).forEach(([k,o])=>{o.win.classList.toggle('top',k===id);o.btn.classList.toggle('act',k===id)});open[id].win.style.zIndex=++z}
function openApp(id){
  if(open[id]){open[id].win.style.display='block';focusWin(id);return}
  const a=APPS[id],n=Object.keys(open).length;
  const w=document.createElement('div');w.className='win';w.style.width=a.w+'px';
  w.style.left=Math.max(4,Math.min(innerWidth-a.w-8,90+n*28))+'px';w.style.top=(40+n*28)+'px';
  w.innerHTML=`<div class="tb"><span>${a.ico}</span><span class="n">${a.name}</span><button type="button" aria-label="Réduire">_</button><button type="button" aria-label="Fermer">✕</button></div><div class="body sunk">${a.html}</div>`;
  document.body.appendChild(w);
  const btn=document.createElement('button');btn.textContent=a.ico+' '+a.name;apps.appendChild(btn);
  open[id]={win:w,btn};
  const [min,cls]=w.querySelectorAll('.tb button');
  min.onclick=()=>{w.style.display='none';btn.classList.remove('act')};
  cls.onclick=()=>closeApp(id);
  btn.onclick=()=>{if(w.style.display==='none'||!w.classList.contains('top')){w.style.display='block';focusWin(id)}else{w.style.display='none';btn.classList.remove('act')}};
  w.addEventListener('pointerdown',()=>focusWin(id));
  const tb=w.querySelector('.tb');
  tb.addEventListener('pointerdown',e=>{
    if(e.target.tagName==='BUTTON'||matchMedia('(max-width:560px)').matches)return;
    const r=w.getBoundingClientRect(),dx=e.clientX-r.left,dy=e.clientY-r.top;tb.setPointerCapture(e.pointerId);
    const mv=ev=>{w.style.left=Math.max(0,Math.min(innerWidth-60,ev.clientX-dx))+'px';w.style.top=Math.max(0,Math.min(innerHeight-70,ev.clientY-dy))+'px'};
    const up=()=>{tb.removeEventListener('pointermove',mv);tb.removeEventListener('pointerup',up)};
    tb.addEventListener('pointermove',mv);tb.addEventListener('pointerup',up);
  });
  focusWin(id);
}
function closeApp(id){const o=open[id];if(!o)return;o.win.remove();o.btn.remove();delete open[id];const k=Object.keys(open).pop();if(k)focusWin(k)}

// Horloge
const clk=$('#clock');(function t(){clk.textContent=new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});setTimeout(t,10000)})();
