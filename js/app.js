(()=>{'use strict';

const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];

const art={city:new Image(),heroes:[]};
art.city.src='assets/city-panorama.webp';
for(let i=0;
i<8;
i++){const im=new Image();
im.src=`assets/hero-${i}.webp`;
art.heroes.push(im)}
const I18N={en:{almost:'ALMOST!',again:'TRY AGAIN!',got:'YOU\'VE GOT THIS!',great:'NICE!',checkpoint:'CHECKPOINT!',goal:'GOAL!'}};
const t=I18N.en;

const DEFAULT={version:1,player:null,unlocked:1,coins:0,stars:{},best:{},sound:true};

let save;
try{save={...DEFAULT,...JSON.parse(localStorage.getItem('santiArcadeSave')||'{}')}}catch(e){save={...DEFAULT}};

const persist=()=>localStorage.setItem('santiArcadeSave',JSON.stringify(save));

const screens=$$('.screen');
function show(id){screens.forEach(x=>x.classList.toggle('active',x.id===id));
if(id==='home-screen')syncHome();
if(id==='map-screen')buildMap();
requestAnimationFrame(updateOrientationGate)}

// Original procedural arcade audio: no downloaded or copyrighted sound files.
let audioCtx=null,musicTimer=null;
function wakeAudio(){if(!save.sound)return;
if(!audioCtx)audioCtx=new(window.AudioContext||window.webkitAudioContext)();
if(audioCtx.state==='suspended')audioCtx.resume()}
function tone(freq,dur=.09,type='sine',vol=.05,delay=0){if(!save.sound)return;
wakeAudio();
if(!audioCtx)return;
const o=audioCtx.createOscillator(),g=audioCtx.createGain(),now=audioCtx.currentTime+delay;
o.type=type;
o.frequency.setValueAtTime(freq,now);
g.gain.setValueAtTime(vol,now);
g.gain.exponentialRampToValueAtTime(.0001,now+dur);
o.connect(g).connect(audioCtx.destination);
o.start(now);
o.stop(now+dur)}
const sfx={jump:()=>tone(330,.1,'square',.025),coin:()=>{tone(740,.07,'square',.04);
tone(980,.08,'square',.03,.06)},correct:()=>[523,659,784].forEach((n,i)=>tone(n,.12,'triangle',.04,i*.07)),wrong:()=>tone(155,.22,'sawtooth',.025),check:()=>[392,523].forEach((n,i)=>tone(n,.18,'sine',.05,i*.1)),unlock:()=>[392,523,659,784].forEach((n,i)=>tone(n,.18,'triangle',.05,i*.09)),finish:()=>[523,659,784,1046].forEach((n,i)=>tone(n,.28,'triangle',.06,i*.1))};

function music(on){clearInterval(musicTimer);
musicTimer=null;
if(on&&save.sound){wakeAudio();
let i=0,notes=[130,164,196,164,147,196,220,196];
musicTimer=setInterval(()=>{if($('#game-screen').classList.contains('active')&&!game.paused)tone(notes[i++%notes.length],.15,'triangle',.012)},380)}}
function toggleSound(){save.sound=!save.sound;
persist();
$$('#sound-btn,#game-sound-btn').forEach(b=>b.textContent=save.sound?'🔊':'🔇');
if(save.sound){wakeAudio();
sfx.coin();
music($('#game-screen').classList.contains('active'))}else music(false)}

const avatarDefaults={skin:1,hair:0,shirt:0,pants:0,extra:0};
let avatar={...avatarDefaults};

const skins=['#f4c9a2','#dca071','#b87345','#81482f','#512d25'],shirts=['#05d9ff','#ff3bbd','#ffe044','#8c36ff','#ff674d'],pants=['#162947','#39496d','#642a72','#184d55'];

const options={skin:skins,hair:['SHORT','SPIKE','CURL','FADE','WAVE'],shirt:shirts,pants:pants,extra:['NONE','GLASSES','HEADSET','WRIST']};

function makeOptions(){['skin','hair','shirt','pants','extra'].forEach(k=>{const box=$(`#${k}-options`);
box.innerHTML='';
options[k].forEach((v,i)=>{const b=document.createElement('button');
b.type='button';
b.className='option'+(avatar[k]===i?' selected':'');
b.dataset.value=i;
b.setAttribute('aria-label',`${k} ${i+1}`);
if(['skin','shirt','pants'].includes(k))b.style.background=v;
else b.textContent=k==='hair'?['✂','▲','●','▬','≈'][i]:['—','▣','♫','◆'][i];
b.onclick=()=>{avatar[k]=i;
makeOptions();
drawAvatar($('#avatar-preview'),avatar)};
box.appendChild(b)})})}
function drawAvatar(canvas,a=avatar,pose=0){if(!canvas)return;
const c=canvas.getContext('2d'),w=canvas.width,h=canvas.height,s=Math.min(w/180,h/220),x=w/2,y=h*.12;
c.clearRect(0,0,w,h);
c.save();
c.translate(x,y);
c.scale(s,s);
const skin=skins[a.skin],shirt=shirts[a.shirt],pant=pants[a.pants];
c.fillStyle='#061421';
c.beginPath();
c.ellipse(0,174,55,10,0,0,7);
c.fill();
c.fillStyle=pant;
c.fillRect(-34,110,29,56);
c.fillRect(5,110,29,56);
c.fillStyle='#ecf7ff';
c.fillRect(-37,158,34,15);
c.fillRect(3,158,38,15);
c.fillStyle=shirt;
c.beginPath();
c.roundRect(-48,58,96,65,16);
c.fill();
c.fillStyle=skin;
c.fillRect(-62,69,17,55);
c.fillRect(45,69,17,55-pose*8);
c.beginPath();
c.arc(-53,126,11,0,7);
c.arc(54,126-pose*8,11,0,7);
c.fill();
c.beginPath();
c.arc(0,34,43,0,7);
c.fill();
c.fillStyle='#241816';
if(a.hair===0)c.fillRect(-38,-2,76,22);
if(a.hair===1){for(let i=-35;
i<40;
i+=14){c.beginPath();
c.moveTo(i,8);
c.lineTo(i+8,-18-Math.abs(i)/5);
c.lineTo(i+16,8);
c.fill()}}if(a.hair===2){for(let i=-32;
i<=32;
i+=16){c.beginPath();
c.arc(i,3+(i%3)*2,14,0,7);
c.fill()}}if(a.hair===3)c.fillRect(-41,0,82,13);
if(a.hair===4){c.beginPath();
c.arc(0,3,42,Math.PI,0);
c.fill()}c.fillStyle='#10233a';
c.beginPath();
c.arc(-15,36,4,0,7);
c.arc(15,36,4,0,7);
c.fill();
c.strokeStyle='#9f492e';
c.lineWidth=3;
c.beginPath();
c.arc(0,44,13,.15,Math.PI-.15);
c.stroke();
if(a.extra===1){c.strokeStyle='#142641';
c.lineWidth=4;
c.strokeRect(-29,25,25,20);
c.strokeRect(4,25,25,20);
c.beginPath();
c.moveTo(-4,34);
c.lineTo(4,34);
c.stroke()}if(a.extra===2){c.strokeStyle='#ff3bbd';
c.lineWidth=7;
c.beginPath();
c.arc(0,28,49,Math.PI,0);
c.stroke();
c.fillStyle='#ff3bbd';
c.fillRect(-52,25,9,29);
c.fillRect(43,25,9,29)}if(a.extra===3){c.fillStyle='#ffe044';
c.fillRect(45,108,18,7)}c.restore()}

$('#play-btn').onclick=()=>{wakeAudio();
if(save.player){avatar={...save.player.avatar};
show('home-screen')}else{makeOptions();
drawAvatar($('#avatar-preview'));
show('creator-screen')}};

$('#creator-form').onsubmit=e=>{e.preventDefault();
const name=$('#nickname').value.trim()||'Player';
save.player={nickname:name.slice(0,12),avatar:{...avatar}};
persist();
$('#welcome-title').textContent=`WELCOME TO SANTI ARCADE, ${name.toUpperCase()}!`;
show('welcome-screen');
sfx.unlock();
setTimeout(()=>show('home-screen'),1700)};

function syncHome(){if(!save.player)return;
$('#home-name').textContent=save.player.nickname.toUpperCase();
$('#total-coins').textContent=save.coins;
$$('.coins-sync').forEach(x=>x.textContent=save.coins);
drawAvatar($('#home-avatar'),save.player.avatar)}
$('#sound-btn').onclick=toggleSound;
$('#game-sound-btn').onclick=toggleSound;
$('#quest-card').onclick=()=>show('map-screen');
$$('[data-go]').forEach(b=>b.onclick=()=>{music(false);
show(b.dataset.go)});


const LEVELS=[
 {name:'NEON START',math:'add',world:2600,goal:2460,check:[1250],gates:[{x:720,a:4,b:5},{x:1740,a:7,b:6}]},
 {name:'PALM RUN',math:'add',world:2900,goal:2760,check:[1400],gates:[{x:900,a:8,b:7},{x:2050,a:16,b:9}]},
 {name:'TUNNEL DASH',math:'sub',world:3100,goal:2960,check:[1500],gates:[{x:820,a:13,b:5},{x:2160,a:21,b:7}]},
 {name:'ROOFTOP RUSH',math:'sub',world:3300,goal:3160,check:[1550],gates:[{x:1050,a:18,b:9},{x:2440,a:30,b:14}]},
 {name:'ELECTRIC AVE',math:'mix',world:3500,goal:3360,check:[1700],gates:[{x:930,a:17,b:8,op:'+'},{x:2580,a:24,b:7,op:'-'}]},
 {name:'SKYLINE SWITCH',math:'mix',world:3750,goal:3610,check:[1800],gates:[{x:1180,a:26,b:9,op:'-'},{x:2810,a:14,b:17,op:'+'}]},
 {name:'GROUP POWER',math:'groups',world:3950,goal:3810,check:[1900],gates:[{x:1100,a:3,b:2},{x:2950,a:4,b:3}]},
 {name:'DOUBLE TROUBLE',math:'times2',world:4200,goal:4060,check:[2050],gates:[{x:1250,a:2,b:6},{x:3140,a:2,b:9}]},
 {name:'FIVE ALIVE',math:'times5',world:4450,goal:4310,check:[2150],gates:[{x:1360,a:5,b:4},{x:3370,a:5,b:8}]},
 {name:'CITY CHAMPION',math:'final',world:4800,goal:4660,check:[1550,3150],gates:[{x:1050,a:2,b:7},{x:2650,a:5,b:6},{x:3900,a:10,b:4}]}
];

function buildMap(){const map=$('#level-map');
map.innerHTML='';
LEVELS.forEach((l,i)=>{const n=i+1,b=document.createElement('button'),locked=n>save.unlocked,stars=save.stars[n]||0;
b.className='level-node'+(locked?' locked':'');
b.disabled=locked;
b.innerHTML=`<span class="num">${locked?'🔒':n}</span><strong>${l.name}</strong><small>${mathLabel(l.math)}</small><span class="stars">${'★'.repeat(stars)}${'☆'.repeat(3-stars)}</span>`;
if(!locked)b.onclick=()=>startLevel(i);
map.appendChild(b)});
syncHome()}
function mathLabel(m){return({add:'ADDITION',sub:'SUBTRACTION',mix:'ADD + SUBTRACT',groups:'MULTIPLY GROUPS',times2:'×2 POWER',times5:'×5 POWER',final:'FINAL MIX'})[m]}

const canvas=$('#game-canvas'),ctx=canvas.getContext('2d');
let game={running:false,paused:false},keys={left:false,right:false,jump:false};

function makeLevel(i){const l=LEVELS[i],platforms=[{x:0,y:455,w:l.world,h:85}];
for(let x=380,n=0;
x<l.world-300;
x+=360,n++){if(n%3===1)platforms.push({x:x,y:355-(i>2?70:0),w:150,h:20});
if(i>1&&n%3===2)platforms.push({x:x+70,y:285,w:130,h:18});
if(i>4&&n%4===0)platforms.push({x:x+180,y:390,w:95,h:18,mobile:true,phase:n})}const gaps=[];
for(let g=650;
g<l.world-350;
g+=i<2?980:700)gaps.push({x:g+(i*43)%120,w:Math.min(90+i*8,155)});
const coins=[];
for(let x=240;
x<l.world-160;
x+=150)coins.push({x,y:390-((x/150)%3===0?90:0),got:false});
const obstacles=[];
for(let x=520;
x<l.world-250;
x+=Math.max(520-i*22,330))obstacles.push({x:x+(i*31)%100,y:423,w:42,h:32,mobile:i>3&&x%2===0,phase:x});
return{...l,platforms,gaps,coins,obstacles,gates:l.gates.map(g=>({...g,done:false,tries:0})),check:l.check.map(x=>({x,hit:false}))}}
function startLevel(i){game={running:true,paused:false,orientationPaused:false,attemptOver:false,index:i,level:makeLevel(i),player:{x:80,y:370,vx:0,vy:0,w:42,h:64,on:false},camera:0,runCoins:0,lives:3,mathCorrect:0,mathTotal:LEVELS[i].gates.length,start:performance.now(),checkpoint:80,last:performance.now(),raf:0,activeGate:null};
keys={left:false,right:false,jump:false};
$('#level-label').textContent=`LEVEL ${i+1}`;
$('#mission-label').textContent=LEVELS[i].name;
$('#run-coins').textContent=0;
$('#lives').textContent=3;
$('#pause-panel').classList.add('hidden');
$('#nice-try-panel').classList.add('hidden');
$('#math-panel').classList.add('hidden');
show('game-screen');
music(true);
cancelAnimationFrame(game.raf);
game.raf=requestAnimationFrame(loop)}
function groundAt(x){return !game.level.gaps.some(g=>x>g.x&&x<g.x+g.w)}
function collide(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y}
function update(dt,now){const p=game.player,l=game.level;
if(game.paused||game.orientationPaused||game.activeGate)return;
p.vx+=(keys.right-keys.left)*1500*dt;
p.vx*=Math.pow(.001,dt);
p.vx=Math.max(-310,Math.min(310,p.vx));
if(keys.jump&&p.on){p.vy=-650;
p.on=false;
sfx.jump()}keys.jump=false;
p.vy+=1700*dt;
const oldY=p.y;
p.x+=p.vx*dt;
p.y+=p.vy*dt;
p.x=Math.max(0,Math.min(l.world-p.w,p.x));
p.on=false;
if(groundAt(p.x+p.w/2)&&p.y+p.h>=455&&oldY+p.h<=470&&p.vy>=0){p.y=455-p.h;
p.vy=0;
p.on=true}l.platforms.slice(1).forEach(pl=>{const py=pl.y+(pl.mobile?Math.sin(now/700+pl.phase)*55:0),box={x:pl.x,y:py,w:pl.w,h:pl.h};
if(collide(p,box)&&oldY+p.h<=py+8&&p.vy>=0){p.y=py-p.h;
p.vy=0;
p.on=true}});
l.coins.forEach(c=>{if(!c.got&&Math.abs(p.x+p.w/2-c.x)<35&&Math.abs(p.y+p.h/2-c.y)<50){c.got=true;
game.runCoins++;
$('#run-coins').textContent=game.runCoins;
sfx.coin()}});
l.obstacles.forEach(o=>{const ox=o.x+(o.mobile?Math.sin(now/600+o.phase)*75:0);
if(collide(p,{...o,x:ox})&&!o.cool){o.cool=true;
hitPlayer();
setTimeout(()=>o.cool=false,800)}});
l.check.forEach(c=>{if(!c.hit&&p.x>c.x){c.hit=true;
game.checkpoint=c.x-70;
toast(t.checkpoint);
sfx.check()}});
const gate=l.gates.find(g=>!g.done&&p.x+p.w>g.x-20);
if(gate){p.vx=0;
openMath(gate)}if(p.y>600)hitPlayer();
if(p.x>l.goal)finishLevel();
game.camera=Math.max(0,Math.min(l.world-960,p.x-260))}
function hitPlayer(){const p=game.player;
if(game.attemptOver)return;
game.lives--;
$('#lives').textContent=game.lives;
sfx.wrong();
if(game.lives<=0){endAttempt();
return}toast('KEEP GOING!');
p.x=game.checkpoint;
p.y=350;
p.vx=0;
p.vy=0}
function endAttempt(){game.attemptOver=true;
game.paused=true;
game.activeGate=null;
keys={left:false,right:false,jump:false};
$('#math-panel').classList.add('hidden');
$('#nice-try-panel').classList.remove('hidden');
music(false)}
function questionFor(g){let op='+',answer;
if(game.level.math==='sub')op='-';
else if(['groups','times2','times5','final'].includes(game.level.math))op='×';
else if(game.level.math==='mix')op=g.op||'+';
if(op==='+')answer=g.a+g.b;
if(op==='-')answer=g.a-g.b;
if(op==='×')answer=g.a*g.b;
return{op,answer}}
function openMath(g){game.activeGate=g;
const q=questionFor(g);
$('#math-kind').textContent=game.level.math==='groups'?'GROUP POWER':'POWER GATE';
$('#math-question').textContent=`${g.a} ${q.op} ${g.b} = ?`;
$('#math-visual').textContent=q.op==='×'?(game.level.math==='groups'?`${g.b} groups of ${g.a}: `:'Count by groups: ')+Array(Math.min(g.b,10)).fill(`●`.repeat(Math.min(g.a,10))).join('  '):'Choose the number that powers the gate.';
const vals=[q.answer,q.answer+(q.answer<10?2:5),Math.max(0,q.answer-(q.answer<10?1:3))].sort(()=>Math.random()-.5),box=$('#math-answers');
box.innerHTML='';
vals.forEach(v=>{const b=document.createElement('button');
b.textContent=v;
b.onclick=()=>answerMath(v===q.answer,g,q.answer);
box.appendChild(b)});
$('#math-feedback').textContent='';
$('#math-panel').classList.remove('hidden')}
function answerMath(ok,g,answer){if(ok){g.done=true;
game.mathCorrect++;
game.activeGate=null;
$('#math-panel').classList.add('hidden');
toast(t.great);
sfx.correct();
return}g.tries++;
sfx.wrong();
$('#math-feedback').textContent=g.tries===1?t.almost:g.tries===2?`${t.got} HINT: Think in small steps.`:`THE ANSWER IS ${answer}. TAP IT!`}
function toast(msg){const el=$('#toast');
el.textContent=msg;
el.classList.add('show');
clearTimeout(toast.timer);
toast.timer=setTimeout(()=>el.classList.remove('show'),1100)}
function glow(color,blur=16){ctx.shadowColor=color;
ctx.shadowBlur=blur}function noGlow(){ctx.shadowBlur=0}
function roundBox(x,y,w,h,r,fill,stroke){ctx.beginPath();
ctx.roundRect(x,y,w,h,r);
ctx.fillStyle=fill;
ctx.fill();
if(stroke){ctx.strokeStyle=stroke;
ctx.lineWidth=3;
ctx.stroke()}}
function draw(now){const l=game.level,p=game.player,c=game.camera,w=canvas.width,h=canvas.height;
ctx.clearRect(0,0,w,h);
if(art.city.complete&&art.city.naturalWidth){const iw=1920,shift=(c*.1)%iw;
ctx.drawImage(art.city,-shift,0,iw,455);
ctx.drawImage(art.city,iw-shift,0,iw,455)}else{const sky=ctx.createLinearGradient(0,0,0,h);
sky.addColorStop(0,'#09284c');
sky.addColorStop(1,'#c43a70');
ctx.fillStyle=sky;
ctx.fillRect(0,0,w,h)}const par=(c*.32)%260;
ctx.fillStyle='#061323cc';
for(let i=-1;
i<6;
i++){const x=i*260-par,bh=70+(i*i*17%85);
ctx.fillRect(x,455-bh,190,bh);
ctx.fillStyle=i%2?'#102b4dcc':'#091a34dd'}ctx.fillStyle='#07131f';
ctx.fillRect(0,452,w,88);
ctx.fillStyle='#183850';
ctx.fillRect(0,452,w,7);
ctx.fillStyle='#e7c851';
for(let x=-c%130;
x<w;
x+=130)ctx.fillRect(x,492,62,5);
l.gaps.forEach(g=>{const x=g.x-c;
ctx.fillStyle='#01060b';
ctx.fillRect(x,450,g.w,90);
ctx.fillStyle='#ff3bbd';
ctx.fillRect(x-3,450,3,25);
ctx.fillRect(x+g.w,450,3,25)});
l.platforms.slice(1).forEach(pl=>{const py=pl.y+(pl.mobile?Math.sin(now/700+pl.phase)*55:0),x=pl.x-c;
glow(pl.mobile?'#ff3bbd':'#05d9ff',10);
roundBox(x,py,pl.w,pl.h,7,'#122b45',pl.mobile?'#ff3bbd':'#05d9ff');
noGlow();
ctx.fillStyle='#35536b';
for(let bx=x+12;
bx<x+pl.w-8;
bx+=34)ctx.fillRect(bx,py+7,19,4)});
l.coins.forEach(o=>{if(o.got)return;
const x=o.x-c,r=12+Math.sin(now/120)*2;
glow('#ffe044',18);
ctx.fillStyle='#ffb900';
ctx.beginPath();
ctx.arc(x,o.y,r,0,7);
ctx.fill();
ctx.strokeStyle='#fff6a0';
ctx.lineWidth=3;
ctx.stroke();
ctx.fillStyle='#fff5a0';
ctx.beginPath();
ctx.moveTo(x+2,o.y-8);
ctx.lineTo(x-4,o.y);
ctx.lineTo(x+1,o.y);
ctx.lineTo(x-3,o.y+9);
ctx.lineTo(x+7,o.y-2);
ctx.lineTo(x+2,o.y-2);
ctx.closePath();
ctx.fill();
noGlow()});
l.obstacles.forEach(o=>{const x=o.x+(o.mobile?Math.sin(now/600+o.phase)*75:0)-c;
if(o.mobile){glow('#ffe044',13);
roundBox(x,o.y-12,48,38,15,'#1b2943','#ffe044');
ctx.fillStyle='#05d9ff';
ctx.fillRect(x+13,o.y,7,5);
ctx.fillRect(x+29,o.y,7,5);
ctx.fillStyle='#ff647c';
ctx.beginPath();
ctx.moveTo(x+18,o.y+26);
ctx.lineTo(x+24,o.y+39);
ctx.lineTo(x+30,o.y+26);
ctx.fill()}else{glow('#ff5478',12);
ctx.fillStyle='#ff4b76';
for(let i=0;
i<3;
i++){ctx.beginPath();
ctx.moveTo(x+i*14,o.y+o.h);
ctx.lineTo(x+7+i*14,o.y);
ctx.lineTo(x+14+i*14,o.y+o.h);
ctx.fill()}}noGlow()});
l.gates.forEach(g=>{if(g.done)return;
const x=g.x-c;
glow('#ff3bbd',18);
roundBox(x-15,240,50,215,12,'#24143e','#ff3bbd');
ctx.fillStyle='#0b2743';
ctx.fillRect(x-5,267,30,155);
ctx.strokeStyle='#05d9ff';
ctx.lineWidth=4;
ctx.strokeRect(x-5,267,30,155);
ctx.fillStyle='#ffe044';
ctx.font='900 28px system-ui';
ctx.fillText('?',x+1,350);
noGlow()});
l.check.forEach(ch=>{const x=ch.x-c,col=ch.hit?'#ffe044':'#05d9ff';
glow(col,18);
ctx.strokeStyle=col;
ctx.lineWidth=7;
ctx.beginPath();
ctx.moveTo(x,455);
ctx.lineTo(x,330);
ctx.stroke();
ctx.fillStyle=col;
ctx.beginPath();
ctx.arc(x,330,17,0,7);
ctx.fill();
ctx.fillStyle='#07182b';
ctx.font='900 18px system-ui';
ctx.fillText('✓',x-8,337);
noGlow()});
const gx=l.goal-c;
glow('#ffe044',18);
ctx.fillStyle='#ffe044';
ctx.fillRect(gx,255,10,200);
ctx.fillStyle='#f7fbff';
ctx.beginPath();
ctx.moveTo(gx+10,265);
ctx.lineTo(gx+90,290);
ctx.lineTo(gx+10,335);
ctx.closePath();
ctx.fill();
ctx.fillStyle='#8c36ff';
ctx.font='900 34px system-ui';
ctx.fillText('⚡',gx+32,315);
noGlow();
for(let x=-c%420;
x<w;
x+=420){ctx.fillStyle='#13283b';
ctx.fillRect(x+40,400,74,55);
ctx.fillStyle='#05d9ff';
ctx.fillRect(x+47,407,60,4)}drawRunner(p.x-c,p.y,p.vx,p.vy,p.on,now)}
function drawRunner(x,y,vx,vy,on,now){let frame=0;
if(!on)frame=vy<0?4:5;
else if(Math.abs(vx)>35)frame=1+Math.floor(now/105)%3;
const im=art.heroes[frame];
ctx.save();
const dir=vx<0?-1:1,bob=on&&Math.abs(vx)<20?Math.sin(now/250)*2:0;
ctx.translate(x+21,y-22+bob);
if(dir<0)ctx.scale(-1,1);
glow('#05d9ff',7);
if(im&&im.complete&&im.naturalWidth)ctx.drawImage(im,-43,-19,86,115);
else{ctx.fillStyle='#05d9ff';
ctx.fillRect(-18,10,36,48);
ctx.fillStyle='#ffe044';
ctx.beginPath();
ctx.arc(0,0,15,0,7);
ctx.fill()}noGlow();
ctx.restore()}
function loop(now){if(!game.running)return;
const dt=Math.min((now-game.last)/1000,.035);
game.last=now;
update(dt,now);
draw(now);
game.raf=requestAnimationFrame(loop)}
function finishLevel(){if(!game.running)return;
game.running=false;
cancelAnimationFrame(game.raf);
music(false);
sfx.finish();
const secs=Math.round((performance.now()-game.start)/1000),l=game.index+1,math=game.mathCorrect/game.mathTotal,coinRate=game.runCoins/game.level.coins.length;
let stars=1;
if(math===1&&coinRate>=.35)stars++;
if(math===1&&coinRate>=.65&&game.lives>=2)stars++;
save.coins+=game.runCoins;
save.stars[l]=Math.max(save.stars[l]||0,stars);
const score=game.runCoins*100+stars*500-secs;
save.best[l]=Math.max(save.best[l]||0,score);
if(l<10)save.unlocked=Math.max(save.unlocked,l+1);
persist();
$('#earned-stars').textContent='★'.repeat(stars)+'☆'.repeat(3-stars);
$('#result-coins').textContent=game.runCoins;
$('#result-math').textContent=`${game.mathCorrect}/${game.mathTotal}`;
$('#result-time').textContent=`${Math.floor(secs/60)}:${String(secs%60).padStart(2,'0')}`;
$('#unlock-message').textContent=l<10?`LEVEL ${l+1} UNLOCKED!`:'YOU ARE THE CITY CHAMPION!';
$('#next-btn').style.display=l<10?'block':'none';
drawAvatar($('#dance-avatar'),save.player.avatar,1);
show('complete-screen')}
$('#pause-btn').onclick=()=>{game.paused=true;
$('#pause-panel').classList.remove('hidden')};
$('#resume-btn').onclick=()=>{game.paused=false;
game.last=performance.now();
$('#pause-panel').classList.add('hidden')};
$('#restart-btn').onclick=()=>startLevel(game.index);
$('#exit-btn').onclick=()=>{game.running=false;
cancelAnimationFrame(game.raf);
music(false);
show('map-screen')};
$('#again-btn').onclick=()=>startLevel(game.index);
$('#next-btn').onclick=()=>startLevel(Math.min(9,game.index+1));
$('#try-again-btn').onclick=()=>startLevel(game.index);
$('#retry-map-btn').onclick=()=>{game.running=false;
cancelAnimationFrame(game.raf);
music(false);
show('map-screen')};

function setKey(k,v){keys[k]=v}$$('#touch-controls button').forEach(b=>{const k=b.dataset.key,on=e=>{e.preventDefault();
wakeAudio();
if(b.setPointerCapture)try{b.setPointerCapture(e.pointerId)}catch(_){}
setKey(k,true);
b.classList.add('pressed')},off=e=>{e.preventDefault();
setKey(k,false);
b.classList.remove('pressed');
if(b.releasePointerCapture&&b.hasPointerCapture?.(e.pointerId))try{b.releasePointerCapture(e.pointerId)}catch(_){}};
b.addEventListener('pointerdown',on);
b.addEventListener('pointerup',off);
b.addEventListener('pointercancel',off);
b.addEventListener('lostpointercapture',off);
b.addEventListener('contextmenu',e=>e.preventDefault());
b.addEventListener('dragstart',e=>e.preventDefault())});
addEventListener('keydown',e=>{if(['ArrowLeft','a','A'].includes(e.key))setKey('left',true);
if(['ArrowRight','d','D'].includes(e.key))setKey('right',true);
if(['ArrowUp','w','W',' '].includes(e.key)){e.preventDefault();
setKey('jump',true)}if(e.key==='Escape'&&game.running)$('#pause-btn').click()});
addEventListener('keyup',e=>{if(['ArrowLeft','a','A'].includes(e.key))setKey('left',false);
if(['ArrowRight','d','D'].includes(e.key))setKey('right',false)});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&game.running&&!game.attemptOver){game.paused=true;
$('#pause-panel').classList.remove('hidden')}});
document.addEventListener('contextmenu',e=>{if($('#game-screen').classList.contains('active'))e.preventDefault()});

const standalone=()=>matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
function updateOrientationGate(){const playing=$('#game-screen').classList.contains('active'),coarse=matchMedia('(pointer: coarse)').matches,portrait=innerHeight>innerWidth,mobileSize=Math.min(innerWidth,innerHeight)<=900,blocked=playing&&coarse&&mobileSize&&portrait;
$('#rotate-hint').classList.toggle('visible',blocked);
if(game.running){game.orientationPaused=blocked;
if(!blocked)game.last=performance.now()}}
addEventListener('orientationchange',()=>setTimeout(updateOrientationGate,150));
addEventListener('resize',updateOrientationGate);
if(window.visualViewport)visualViewport.addEventListener('resize',updateOrientationGate);

const fullscreenTarget=document.documentElement;
function fullscreenSupported(){return !!(fullscreenTarget.requestFullscreen||fullscreenTarget.webkitRequestFullscreen)}
function fullscreenActive(){return !!(document.fullscreenElement||document.webkitFullscreenElement)}
async function toggleFullscreen(){try{if(fullscreenActive()){const exit=document.exitFullscreen||document.webkitExitFullscreen;
if(exit)await exit.call(document)}else{const enter=fullscreenTarget.requestFullscreen||fullscreenTarget.webkitRequestFullscreen;
if(enter)await enter.call(fullscreenTarget)}}catch(_){/* Fullscreen is optional; gameplay must continue. */}
updateFullscreenUI()}
function updateFullscreenUI(){const b=$('#fullscreen-btn'),useful=fullscreenSupported()&&!standalone();
b.classList.toggle('hidden',!useful);
b.innerHTML=fullscreenActive()?'⛶ <span>EXIT FULL SCREEN</span>':'⛶ <span>FULL SCREEN</span>';
b.setAttribute('aria-label',fullscreenActive()?'Exit full screen':'Enter full screen')}
$('#fullscreen-btn').onclick=toggleFullscreen;
document.addEventListener('fullscreenchange',updateFullscreenUI);
document.addEventListener('webkitfullscreenchange',updateFullscreenUI);

let installPrompt=null;
const ua=navigator.userAgent,isIOS=/iPad|iPhone|iPod/.test(ua),isIOSSafari=isIOS&&/Safari/.test(ua)&&!/CriOS|FxiOS|EdgiOS/.test(ua);
function updateInstallUI(){const installed=standalone();
$('#install-btn').classList.toggle('hidden',installed||!installPrompt||isIOS);
$('#ios-install-help').classList.toggle('hidden',installed||!isIOSSafari)}
addEventListener('beforeinstallprompt',e=>{e.preventDefault();
installPrompt=e;
updateInstallUI()});
$('#install-btn').onclick=async()=>{if(!installPrompt)return;
try{await installPrompt.prompt();
await installPrompt.userChoice}catch(_){}finally{installPrompt=null;
updateInstallUI()}};
addEventListener('appinstalled',()=>{installPrompt=null;
updateInstallUI()});

function fitCanvas(){const r=$('#game-wrap').getBoundingClientRect();
canvas.width=960;
canvas.height=540}addEventListener('resize',fitCanvas);
fitCanvas();
updateInstallUI();
updateFullscreenUI();
updateOrientationGate();
$$('#sound-btn,#game-sound-btn').forEach(b=>b.textContent=save.sound?'🔊':'🔇');
if('serviceWorker'in navigator)addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js').catch(()=>{}));

})();
