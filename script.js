(()=>{
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const track=$('#track'),panels=$$('.panel'),N=panels.length,compIdx=panels.findIndex(p=>p.id==='competences');
const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
const INTERACTIVE='a,button,.chip,.pcard,.slot,.report,#term,.tools,input,textarea';
let modal=false,termOpen=false;
const docEl=document.documentElement;let recolor=()=>{};
const isDark=()=>docEl.dataset.theme==='dark';
function setTheme(t,save){docEl.dataset.theme=t;if(save){try{localStorage.setItem('theme',t)}catch(e){}}recolor()}
$('#theme').onclick=()=>{sfx.tick();setTheme(isDark()?'light':'dark',true)};
try{matchMedia('(prefers-color-scheme:dark)').addEventListener('change',e=>{let s=null;try{s=localStorage.getItem('theme')}catch(_){}if(!s)setTheme(e.matches?'dark':'light',false)})}catch(e){}
const bg=$('#bg');

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
const goPanel=i=>{sfx.nav();scrollToX(Math.max(0,Math.min(N-1,i))*track.clientWidth)};
let gate=true,lastW=0;
addEventListener('wheel',e=>{
  if(modal||termOpen||e.ctrlKey)return;
  const m=e.deltaMode===1?32:e.deltaMode===2?innerHeight:1,dx=e.deltaX*m,dy=e.deltaY*m;
  const p=e.target.closest&&e.target.closest('.panel');
  if(p&&Math.abs(dy)>Math.abs(dx)&&p.scrollHeight>p.clientHeight+24){
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
  if(e.key==='Escape'&&termOpen){closeTerm();return}
  if((e.key==='²'||e.key==='`')&&document.activeElement!==tcmd&&!modal){e.preventDefault();toggleTerm();return}
  if(modal){if(e.key==='Escape')closeP();return}
  if(termOpen)return;
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
  bg.style.setProperty('--sx',track.scrollLeft);
  const mx=maxX(),pr=mx?track.scrollLeft/mx:0;
  head.style.left=(pr*100)+'%';fill.style.width=(pr*100)+'%';
  tc.textContent='0x'+Math.round(pr*255).toString(16).toUpperCase().padStart(2,'0');
  const c=cur();marks.forEach((m,i)=>m.classList.toggle('on',i<=c));
  $$('.links a').forEach(a=>a.classList.toggle('on',+a.dataset.go===c));
  $('#prev').disabled=c===0;$('#next').disabled=c===N-1;
  if(track.scrollLeft>60)hint.classList.add('off');
  if(c!==compIdx)hidePeek();
}
addEventListener('resize',()=>{track.scrollLeft=cur()*track.clientWidth;ui()});
let touched=false;['wheel','keydown','pointerdown','touchstart'].forEach(ev=>addEventListener(ev,()=>{touched=true},{passive:true,once:true}));
setTimeout(()=>{if(!reduce&&!touched&&track.scrollLeft<5&&!modal&&!termOpen){scrollToX(80,520);setTimeout(()=>{if(!touched&&track.scrollLeft<130)scrollToX(0,520)},750)}},2600);

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
  if(modal||busy||termOpen)return;busy=modal=true;from=btn;hidePeek();sfx.whoosh();
  const R=btn.getBoundingClientRect(),vw=innerWidth,vh=innerHeight,narrow=vw<900;
  $('.front',fc).innerHTML=btn.innerHTML;$('.front',fc).className='face pcard front '+[...btn.classList].find(c=>c.startsWith('t-'));
  Object.assign(fc.style,{left:R.left+'px',top:R.top+'px',width:R.width+'px',height:R.height+'px'});
  rep.innerHTML='<button class="x" type="button" aria-label="Fermer">✕</button>'+$('#'+btn.dataset.r).innerHTML;
  $('.x',rep).onclick=closeP;
  const cx=R.left+R.width/2,cy=R.top+R.height/2,s1=Math.min(1.5,vh*.6/R.height,vw*.78/R.width);
  let s2,x2,y2;
  if(narrow){s2=.52;x2=vw/2;y2=64+R.height*s2/2;Object.assign(rep.style,{left:'12px',right:'12px',bottom:'12px',top:(y2+R.height*s2/2+14)+'px'})}
  else{const zone=vw*.4;s2=Math.min(1.12,vh*.66/R.height,(zone-120)/R.width);x2=zone/2;y2=vh/2;Object.assign(rep.style,{left:zone+'px',right:'5vw',top:'10vh',bottom:'10vh'})}
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
  if(!modal||busy)return;busy=true;sfx.whoosh2();rep.classList.remove('on');stage.classList.remove('on');document.body.classList.remove('is-open');
  canim.reverse();
  canim.onfinish=()=>{stage.hidden=true;from.style.visibility='';canim.cancel();modal=busy=false;from.focus({preventScroll:true})};
}
$$('.pcard',track).forEach(b=>b.addEventListener('click',()=>openP(b)));
$('.veil',stage).addEventListener('click',closeP);
addEventListener('resize',()=>{if(modal&&!busy){rep.classList.remove('on');stage.classList.remove('on');stage.hidden=true;if(from)from.style.visibility='';canim&&canim.cancel();document.body.classList.remove('is-open');modal=false}});
ui();


/* ---------- Notification ---------- */
const toast=$('#toast');let tt;
function say(m){toast.textContent=m;toast.classList.add('on');clearTimeout(tt);tt=setTimeout(()=>toast.classList.remove('on'),2600)}

/* ---------- Sons (activés par défaut, synthétisés) ---------- */
let soundOn=true;try{soundOn=localStorage.getItem('sound')!=='off'}catch(e){}
let ac=null;
function tone(f,d,type='sine',v=.05,slide=0,delay=0){
  if(!soundOn)return;
  try{ac=ac||new (window.AudioContext||window.webkitAudioContext)();if(ac.state==='suspended')ac.resume();
    const t=ac.currentTime+delay,o=ac.createOscillator(),g=ac.createGain();o.type=type;o.frequency.setValueAtTime(f,t);
    if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(30,f*slide),t+d);
    g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+.015);g.gain.exponentialRampToValueAtTime(.0001,t+d);
    o.connect(g);g.connect(ac.destination);o.start(t);o.stop(t+d+.05)}catch(e){}}
const sfx={
  tick:()=>tone(620,.05,'triangle',.035),
  nav:()=>tone(380,.09,'triangle',.04,1.4),
  whoosh:()=>tone(160,.4,'sawtooth',.018,4),
  whoosh2:()=>tone(640,.35,'sawtooth',.016,.25),
  open:()=>[523,659,784,1047].forEach((f,i)=>tone(f,.22,'sine',.05,0,i*.07)),
  lock:()=>{tone(220,.12,'square',.035,.5);tone(150,.14,'square',.03,.6,.06)},
  win:()=>[659,784,988,1319].forEach((f,i)=>tone(f,.28,'triangle',.05,0,i*.09)),
  key:()=>tone(900+Math.random()*200,.03,'square',.012),
  err:()=>tone(180,.18,'sawtooth',.03,.7)
};
const paintSound=()=>document.body.classList.toggle('muted',!soundOn);paintSound();
$('#soundBtn').onclick=()=>{soundOn=!soundOn;try{localStorage.setItem('sound',soundOn?'on':'off')}catch(e){}paintSound();if(soundOn)sfx.tick()};

/* ---------- Vitrine à trophées ---------- */
// Pour débloquer un trophée : ajoute  got:true,date:'12/11/2026'  à son objet.
const TROPHIES=[
 {t:'Bandit niveau 10',d:'OverTheWire : résoudre les 10 premiers niveaux en SSH.',k:'medal',c:'#ff5a36',got:true,date:'29/10/2026'},
 {t:'Pre Security',d:'TryHackMe : terminer le parcours gratuit Pre Security.',k:'shield',c:'#2f4bff'},
 {t:'5 challenges Root-Me',d:'Résoudre 5 challenges faciles (web ou cryptanalyse).',k:'trophy',c:'#ffb400'},
 {t:'Badge Cisco',d:'Cisco Skills for All : décrocher un premier badge de formation.',k:'medal',c:'#1ba0d7'},
 {t:'Home lab',d:'Kali Linux et une cible vulnérable dans VirtualBox.',k:'cube',c:'#35d6a3'},
 {t:'Premier write-up',d:'Publier un compte rendu de challenge sur GitHub.',k:'doc',c:'#7b5cff'},
 {t:'Premier lab PortSwigger',d:'Résoudre un lab de la Web Security Academy.',k:'bug',c:'#ff6a47'},
 {t:'Alternance signée',d:'Le trophée final : un contrat d\'alternance pour janvier 2027.',k:'crown',c:'#ffd23f'}
];
const IC={
 medal:c=>`<svg viewBox="0 0 64 64"><path d="M22 3h10l-5 20-9-3z" fill="#2f4bff"/><path d="M42 3H32l5 20 9-3z" fill="#ff5a36"/><circle cx="32" cy="40" r="18" fill="${c}" stroke="#12141f" stroke-width="3"/><circle cx="32" cy="40" r="12" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="2"/><path d="M32 31l3 6.2 6.8 1-4.9 4.8 1.2 6.8-6.1-3.2-6.1 3.2 1.2-6.8-4.9-4.8 6.8-1z" fill="#fff"/></svg>`,
 shield:c=>`<svg viewBox="0 0 64 64"><path d="M32 5l22 8v18c0 15-10 25-22 30C20 56 10 46 10 31V13z" fill="${c}" stroke="#12141f" stroke-width="3" stroke-linejoin="round"/><path d="M21 32l8 8 15-17" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
 trophy:c=>`<svg viewBox="0 0 64 64"><path d="M16 8h32v16c0 10-7 16-16 16S16 34 16 24z" fill="${c}" stroke="#12141f" stroke-width="3" stroke-linejoin="round"/><path d="M16 13H7c0 9 4 14 11 15M48 13h9c0 9-4 14-11 15" fill="none" stroke="#12141f" stroke-width="3" stroke-linecap="round"/><rect x="28" y="40" width="8" height="10" fill="${c}" stroke="#12141f" stroke-width="3"/><rect x="19" y="50" width="26" height="9" rx="2" fill="#12141f"/><path d="M24 14v10" stroke="#fff" stroke-opacity=".6" stroke-width="3" stroke-linecap="round"/></svg>`,
 cube:c=>`<svg viewBox="0 0 64 64"><path d="M32 5l23 12-23 12L9 17z" fill="#fff" stroke="#12141f" stroke-width="3" stroke-linejoin="round"/><path d="M9 17l23 12v29L9 46z" fill="${c}" stroke="#12141f" stroke-width="3" stroke-linejoin="round"/><path d="M55 17L32 29v29l23-12z" fill="${c}" fill-opacity=".72" stroke="#12141f" stroke-width="3" stroke-linejoin="round"/></svg>`,
 doc:c=>`<svg viewBox="0 0 64 64"><rect x="13" y="5" width="38" height="54" rx="5" fill="${c}" stroke="#12141f" stroke-width="3"/><path d="M21 18h22M21 27h22M21 36h22M21 45h13" stroke="#fff" stroke-width="3.5" stroke-linecap="round"/></svg>`,
 bug:c=>`<svg viewBox="0 0 64 64"><ellipse cx="32" cy="38" rx="13" ry="17" fill="${c}" stroke="#12141f" stroke-width="3"/><circle cx="32" cy="17" r="8" fill="${c}" stroke="#12141f" stroke-width="3"/><path d="M19 30H8M19 40H7M20 50l-9 6M45 30h11M45 40h12M44 50l9 6M26 10l-4-6M38 10l4-6M32 26v24" fill="none" stroke="#12141f" stroke-width="3" stroke-linecap="round"/></svg>`,
 crown:c=>`<svg viewBox="0 0 64 64"><path d="M6 47L10 16l14 15 8-20 8 20 14-15 4 31z" fill="${c}" stroke="#12141f" stroke-width="3" stroke-linejoin="round"/><rect x="7" y="48" width="50" height="10" rx="3" fill="${c}" stroke="#12141f" stroke-width="3"/><circle cx="32" cy="38" r="3.5" fill="#ff5a36"/><circle cx="19" cy="40" r="3" fill="#2f4bff"/><circle cx="45" cy="40" r="3" fill="#35d6a3"/></svg>`
};
const LK='<svg viewBox="0 0 24 24" width="14" height="14"><rect x="5" y="11" width="14" height="10" rx="2" fill="currentColor"/><path d="M8 11V8a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" stroke-width="2.4"/></svg>';
const cab=$('#cabinet');let per=0;
function renderCab(){
  const n=innerWidth>900?4:2;if(n===per)return;per=n;cab.innerHTML='';
  for(let i=0;i<TROPHIES.length;i+=n){
    const sh=document.createElement('div');sh.className='shelf';sh.style.setProperty('--n',n);
    TROPHIES.slice(i,i+n).forEach(t=>{
      const b=document.createElement('button');b.type='button';b.className='slot '+(t.got?'got':'lock');
      b.innerHTML=`<span class="tro">${IC[t.k](t.c)}</span>${t.got?'':'<span class="lk">'+LK+'</span>'}<b>${t.t}</b><i>${t.got?'Débloqué le '+(t.date||''):'À débloquer'}</i><span class="tip">${t.d}</span>`;
      b.onclick=()=>{if(t.got){sfx.win();say('Trophée débloqué : '+t.t)}else{sfx.err();say('À débloquer : '+t.d)}};
      sh.appendChild(b)});
    cab.appendChild(sh)}
  $('#vcount').textContent=TROPHIES.filter(t=>t.got).length+' / '+TROPHIES.length}
renderCab();addEventListener('resize',renderCab);

/* ---------- Terminal ---------- */
const term=$('#term'),tout=$('#tout'),tcmd=$('#tcmd');let hist=[],hi=0,welcomed=false;
const esc=t=>t.replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
function out(t,cls){const d=document.createElement('div');if(cls)d.className=cls;d.innerHTML=t;tout.appendChild(d);tout.scrollTop=tout.scrollHeight}
const SECS={accueil:0,apropos:1,parcours:2,projets:3,competences:4,vitrine:5,contact:6};
const FILES={
 'about.txt':'Étudiant en Bachelor Cybersécurité à l\'ESGI Paris (3e année en alternance, janvier 2027). Je viens du développement web (BUT MMI) et je vise le pentest.',
 'competences.txt':SK.map(([g,it])=>g+' : '+it.map(x=>x[0]).join(', ')).join('\n'),
 'contact.txt':'bryanigizarda@gmail.com\ngithub.com/tjrardaa'
};
const CMD_NAMES=['help','whoami','about','ls','cat','projets','skills','contact','cv','goto','theme','sound','trophees','date','echo','clear','exit','sudo','hack','nmap','ping'];
const CMDS={
 help(){out('Commandes : <span class="c">'+CMD_NAMES.filter(x=>!['sudo','hack','nmap','ping'].includes(x)).join(' ')+'</span>\n<span class="m">Il y a aussi quelques surprises cachées…</span>')},
 whoami(){out('arda — étudiant en Bachelor Cybersécurité (ESGI Paris), alternance dès janvier 2027.')},
 about(){out(esc(FILES['about.txt']))},
 ls(a){if(a==='projets'||a==='projets/')out('jeu-plateforme-2d/  site-php-mysql/  portfolio/  write-ups/ <span class="m">(bientôt)</span>');else out('<span class="c">about.txt  competences.txt  contact.txt  cv.pdf  projets/  vitrine/</span>')},
 cat(a){if(!a)return out('Usage : cat &lt;fichier&gt;','e');if(FILES[a])out(esc(FILES[a]));else if(a==='cv.pdf')out('Fichier binaire. Utilise la commande <span class="c">cv</span> pour le télécharger.','m');else out('cat : '+esc(a)+' : fichier introuvable','e')},
 projets(){out('1. Jeu de plateforme 2D — C#, Unity (groupe de 2)\n2. Site dynamique — PHP, MySQL (groupe de 4, j\'ai fait le back-office)\n3. Ce portfolio — HTML, CSS, JavaScript, Three.js\n4. Write-ups — bientôt\n<span class="m">Tape « goto projets » pour les voir.</span>')},
 skills(){out(esc(FILES['competences.txt']))},
 contact(){out('bryanigizarda@gmail.com\ngithub.com/tjrardaa')},
 cv(){const a=document.createElement('a');a.href='CV_Arda_Nigiz.pdf';a.download='CV_Arda_Nigiz.pdf';document.body.appendChild(a);a.click();a.remove();out('Téléchargement du CV… <span class="c">ok</span>')},
 goto(a){if(!(a in SECS))return out('Usage : goto &lt;'+Object.keys(SECS).join('|')+'&gt;','e');closeTerm();setTimeout(()=>goPanel(SECS[a]),350)},
 theme(a){const t=a==='dark'||a==='light'?a:(isDark()?'light':'dark');setTheme(t,true);out('Thème : <span class="c">'+(t==='dark'?'sombre':'clair')+'</span>')},
 sound(a){soundOn=a==='off'?false:a==='on'?true:!soundOn;try{localStorage.setItem('sound',soundOn?'on':'off')}catch(e){}paintSound();out('Son : <span class="c">'+(soundOn?'activé':'coupé')+'</span>')},
 trophees(){const g=TROPHIES.filter(t=>t.got).length;out('Trophées débloqués : <span class="c">'+g+' / '+TROPHIES.length+'</span>\n'+TROPHIES.map(t=>(t.got?'[x] ':'[ ] ')+t.t).join('\n'))},
 date(){out(new Date().toLocaleString('fr-FR'))},
 echo(a,all){out(esc(all))},
 clear(){tout.innerHTML=''},
 exit(){closeTerm()},
 sudo(a,all){if(/make me hired/i.test(all)){sfx.open();out('<span class="c">Accès accordé. Alternance 2027 ?</span> Écris-moi : bryanigizarda@gmail.com')}else out('arda n\'est pas dans le fichier sudoers. <span class="e">Cet incident sera signalé.</span>')},
 hack(){const L=['[*] Initialisation…','[*] Recherche de la cible…','[#####.....] 50 %','[##########] 100 %'];L.forEach((l,i)=>setTimeout(()=>out(l,'m'),i*450));setTimeout(()=>out('<span class="e">Accès refusé.</span> Je ne teste que ce que j\'ai le droit de tester : c\'est la règle d\'or du pentest.'),L.length*450)},
 nmap(){out('Scan interdit ici. Un pentest se fait avec une <span class="c">autorisation écrite</span>, jamais sur une cible au hasard.')},
 ping(){out('pong — 0 % de perte, 1 ms. Ce portfolio est en bonne santé.')}
};
function runCmd(line){
  const raw=line.trim();if(!raw)return;out('<span class="c">arda@portfolio:~$</span> '+esc(raw));
  hist.push(raw);hi=hist.length;
  const [cmd,...rest]=raw.split(/\s+/),arg=rest[0]||'',all=rest.join(' ');
  if(/^rm\s+-rf/.test(raw))return out('Bien essayé.','e');
  if(CMDS[cmd])CMDS[cmd](arg.toLowerCase()===arg?arg:arg.toLowerCase(),all);
  else{sfx.err();out('commande introuvable : '+esc(cmd)+'. Tape <span class="c">help</span>.','e')}
}
function openTerm(){termOpen=true;hidePeek();term.classList.add('on');term.setAttribute('aria-hidden','false');sfx.nav();
  if(!welcomed){welcomed=true;out('Bienvenue sur le terminal d\'Arda. Tape <span class="c">help</span> pour commencer.')}
  setTimeout(()=>tcmd.focus({preventScroll:true}),120)}
function closeTerm(){termOpen=false;term.classList.remove('on');term.setAttribute('aria-hidden','true');tcmd.blur();sfx.tick()}
function toggleTerm(){termOpen?closeTerm():openTerm()}
$('#termBtn').onclick=toggleTerm;
tcmd.addEventListener('keydown',e=>{
  if(e.key==='Enter'){const v=tcmd.value;tcmd.value='';runCmd(v)}
  else if(e.key==='ArrowUp'){e.preventDefault();if(hi>0)tcmd.value=hist[--hi]||''}
  else if(e.key==='ArrowDown'){e.preventDefault();hi=Math.min(hist.length,hi+1);tcmd.value=hist[hi]||''}
  else if(e.key==='Tab'){e.preventDefault();const m=CMD_NAMES.filter(n=>n.startsWith(tcmd.value.trim()));if(tcmd.value.trim()&&m.length===1)tcmd.value=m[0]+' '}
  else if(e.key.length===1)sfx.key()});
term.addEventListener('click',()=>tcmd.focus({preventScroll:true}));

/* ---------- Curseur personnalisé ---------- */
if(matchMedia('(hover:hover) and (pointer:fine)').matches){
  document.body.classList.add('cc');
  const cur=$('#cur'),ring=$('#ring'),lab=$('span',ring);let x=0,y=0,rx=0,ry=0;
  addEventListener('pointermove',e=>{
    x=e.clientX;y=e.clientY;document.body.classList.add('seen');cur.style.transform=`translate(${x}px,${y}px)`;
    const t=e.target.closest&&e.target.closest('.pcard,.chip,.slot,a,button,#term');let txt='',cls='';
    if(t){if(t.matches('.pcard')){cls='big';txt='Ouvrir'}else if(t.matches('.chip')){cls='big';txt='Regarde'}
      else if(t.matches('.slot')){cls='big';txt=t.classList.contains('got')?'Bravo':'Verrouillé'}else if(t.matches('a,button')){cls='link'}}
    else if(window.__lockHover){cls='big';txt=window.__lockHover}
    ring.className=cls;lab.textContent=txt},{passive:true});
  (function loop(){rx+=(x-rx)*.2;ry+=(y-ry)*.2;ring.style.transform=`translate(${rx}px,${ry}px)`;requestAnimationFrame(loop)})();
}

/* ---------- Nom qui se déchiffre ---------- */
(function(){
  const el=$('#name');if(!el||reduce)return;const fin=el.textContent;el.textContent='';
  const sp=[...fin].map(ch=>{const s=document.createElement('span');s.textContent=ch;s.setAttribute('aria-hidden','true');el.appendChild(s);return s});
  const run=()=>{
    sp.forEach(s=>{if(s.textContent!==' '){const w=s.getBoundingClientRect().width;s.style.cssText='display:inline-block;width:'+w+'px;text-align:center'}});
    const ch='01{}</>#x',t0=performance.now(),dur=1400;
    (function tick(now){const p=Math.min(1,(now-t0)/dur);
      sp.forEach((s,i)=>{const lock=.2+i/sp.length*.65;s.textContent=(p>=lock||fin[i]===' ')?fin[i]:ch[(Math.random()*ch.length)|0]});
      if(p<1)requestAnimationFrame(tick);else sp.forEach((s,i)=>{s.textContent=fin[i];s.style.cssText=''})})(t0)};
  (document.fonts&&document.fonts.ready?document.fonts.ready:Promise.resolve()).then(run)
})();

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
const GT=['0','1','0','1','0','1','0x','</>','{ }','0','1'];
const GCS={light:['#12141f','#12141f','#ff5a36','#2f4bff'],dark:['#f1eee5','#f1eee5','#ff6a47','#7b95ff']};
function makeShell(rMin,rMax,count){
  const g=new THREE.Group();
  for(let i=0;i<count;i++){const GC=GCS[isDark()?'dark':'light'],t=GT[(Math.random()*GT.length)|0],col=GC[(Math.random()*GC.length)|0];
    const s=new THREE.Sprite(new THREE.SpriteMaterial({map:glyph(t,col),transparent:true,depthWrite:false,opacity:.9}));
    const r=rMin+Math.random()*(rMax-rMin),th=Math.random()*Math.PI*2,ph=Math.acos(2*Math.random()-1);
    s.position.set(r*Math.sin(ph)*Math.cos(th),r*Math.cos(ph)*.8,r*Math.sin(ph)*Math.sin(th));
    const z=.36+Math.random()*.34;s.scale.set(z,z,1);g.add(s)}
  const ico=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(rMin-.2,1)),new THREE.LineBasicMaterial({color:isDark()?0xf1eee5:0x12141f,transparent:true,opacity:isDark()?.2:.16}));g.add(ico);
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
recolor=()=>{for(const L of [A,B]){L.root.remove(L.shell);L.shell=makeShell(3.2,4.7,70);L.root.add(L.shell)}B.shell.scale.setScalar(.85)};
const green=new THREE.Color(0x35d6a3),coral=new THREE.Color(0xff5a36);

let mx=0,my=0,w=1,h=1,hw=1,hh=1,baseX=0,baseY=0,S=1;
function size(){w=innerWidth;h=innerHeight;renderer.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix();
  hh=Math.tan(22.5*Math.PI/180)*cam.position.z;hw=hh*cam.aspect;
  if(w>900){baseX=hw*.44;S=Math.min(1.1,hw*.5/4.8);baseY=0}else{S=Math.min(.9,hw*.88/4.8);baseX=0;baseY=hh*.38}
  A.root.scale.setScalar(S);B.root.scale.setScalar(S)}
size();addEventListener('resize',size);

const ray=new THREE.Raycaster(),ndc=new THREE.Vector2();
function aim(e,L){ndc.set(e.clientX/innerWidth*2-1,-(e.clientY/innerHeight*2-1));ray.setFromCamera(ndc,cam);return ray.intersectObject(L.lock,true).length>0}
const sx=()=>track.scrollLeft/innerWidth;
addEventListener('pointermove',e=>{
  mx=e.clientX/innerWidth-.5;my=e.clientY/innerHeight-.5;bg.style.setProperty('--mx',e.clientX+'px');bg.style.setProperty('--my',e.clientY+'px');if(modal||termOpen)return;
  const ok=!(e.target.closest&&e.target.closest(INTERACTIVE));
  A.hover=ok&&sx()<.7&&aim(e,A);B.hover=ok&&sx()>N-1.7&&aim(e,B);
  document.body.classList.toggle('hoverlock',B.hover);window.__lockHover=B.hover?(B.open?'Fermer':'Ouvrir'):(A.hover?'Coucou':'')},{passive:true});
addEventListener('click',e=>{
  if(modal||termOpen||(e.target.closest&&e.target.closest(INTERACTIVE)))return;
  if(sx()>N-1.7&&aim(e,B)){B.open=!B.open;B.boost=1;B.open?sfx.open():sfx.lock();$('#hint3d').style.opacity=0;say(B.open?'Accès accordé. Alternance 2027 ?':'Re-verrouillé. Sécurité d\'abord.')}
  else if(sx()<.7&&aim(e,A)){A.boost=1;sfx.tick()}});

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
