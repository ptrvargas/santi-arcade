(()=>{'use strict';

const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];

const art={city:new Image(),heroes:[]};
art.city.src='assets/city-panorama.webp';
for(let i=0;
i<8;
i++){const im=new Image();
im.src=`assets/hero-${i}.webp`;
art.heroes.push(im)}
const I18N={en:{almost:'ALMOST!',again:'TRY AGAIN!',got:'YOU\'VE GOT THIS!',great:'NICE!',checkpoint:'CHECKPOINT!',goal:'GOAL!',moveTitle:'MOVE!',moveText:'Use LEFT and RIGHT.',jumpTitle:'JUMP!',jumpText:'Tap JUMP to leap.',solveTitle:'SOLVE IT!',solveText:'Math makes the path easier.',powerTitle:'POWER UP!',powerText:'Correct answers earn ⚡ and game powers.',checkTitle:'CHECKPOINT!',checkText:'You will restart here if you fall.',copied:'LINK COPIED!',saved:'PLAYER SAVED!',path:'POWER PATH UNLOCKED!'}};
const t=I18N.en;

const EDUCATION_PROFILE={grade:3,language:'en',subject:'math'};
const DEFAULT={version:5,profile:EDUCATION_PROFILE,player:null,unlocked:1,coins:0,stars:{},best:{},sound:true,musicOn:true,sfxOn:true,masterVolume:.7,powerEnergy:0,lastQuestions:{},tutorials:{}};

let save;
try{save={...DEFAULT,...JSON.parse(localStorage.getItem('santiArcadeSave')||'{}')}}catch(e){save={...DEFAULT}};
if(typeof save.musicOn!=='boolean')save.musicOn=save.sound!==false;
if(typeof save.sfxOn!=='boolean')save.sfxOn=save.sound!==false;
save.masterVolume=Math.max(0,Math.min(1,Number(save.masterVolume)||0));
save.powerEnergy=Math.max(0,Number(save.powerEnergy)||0);
save.lastQuestions=save.lastQuestions||{};
save.profile={...EDUCATION_PROFILE,...(save.profile||{})};
save.tutorials=save.tutorials||{};
save.version=5;

const persist=()=>localStorage.setItem('santiArcadeSave',JSON.stringify(save));

const screens=$$('.screen');
function show(id){screens.forEach(x=>x.classList.toggle('active',x.id===id));
if(id==='home-screen')syncHome();
if(id==='map-screen')buildMap();
if(['start-screen','home-screen','map-screen'].includes(id))setMusic('menu');
requestAnimationFrame(updateOrientationGate)}

// Original compact music files and synthesized effects. Audio starts only after a user gesture.
let audioCtx=null,audioUnlocked=false,currentTrack='';
const tracks={menu:new Audio('sounds/menu-theme.mp3'),game:new Audio('sounds/city-quest-theme.mp3'),victory:new Audio('sounds/victory-theme.mp3')};
tracks.menu.loop=true;
tracks.game.loop=true;
tracks.victory.loop=false;
Object.values(tracks).forEach(a=>{a.preload='auto';a.playsInline=true});
function applyAudioSettings(){Object.values(tracks).forEach(a=>a.volume=save.musicOn?save.masterVolume*.38:0);
$('#music-toggle')?.setAttribute('aria-checked',String(save.musicOn));
$('#sfx-toggle')?.setAttribute('aria-checked',String(save.sfxOn));
if($('#music-toggle'))$('#music-toggle').textContent=save.musicOn?'ON':'OFF';
if($('#sfx-toggle'))$('#sfx-toggle').textContent=save.sfxOn?'ON':'OFF';
if($('#master-volume'))$('#master-volume').value=Math.round(save.masterVolume*100);
if($('#volume-value'))$('#volume-value').textContent=`${Math.round(save.masterVolume*100)}%`;
if(!save.musicOn)Object.values(tracks).forEach(a=>a.pause());
updateAudioButtons()}
function wakeAudio(){audioUnlocked=true;
if(!audioCtx)audioCtx=new(window.AudioContext||window.webkitAudioContext)();
if(audioCtx.state==='suspended')audioCtx.resume().catch(()=>{});
if(currentTrack&&save.musicOn)tracks[currentTrack]?.play().catch(()=>{})}
function tone(freq,dur=.09,type='sine',vol=.05,delay=0){if(!save.sfxOn||save.masterVolume<=0)return;
if(!audioUnlocked)return;
if(!audioCtx)wakeAudio();
if(!audioCtx)return;
const o=audioCtx.createOscillator(),g=audioCtx.createGain(),now=audioCtx.currentTime+delay;
o.type=type;
o.frequency.setValueAtTime(freq,now);
g.gain.setValueAtTime(vol*save.masterVolume,now);
g.gain.exponentialRampToValueAtTime(.0001,now+dur);
o.connect(g).connect(audioCtx.destination);
o.start(now);
o.stop(now+dur)}
const sfx={jump:()=>tone(330,.1,'square',.028),coin:()=>{tone(740,.07,'square',.045);tone(980,.08,'square',.035,.06)},challenge:()=>[294,392].forEach((n,i)=>tone(n,.14,'sine',.035,i*.07)),correct:()=>[523,659,784].forEach((n,i)=>tone(n,.12,'triangle',.045,i*.07)),wrong:()=>tone(180,.16,'sine',.025),energy:()=>[659,880,1046].forEach((n,i)=>tone(n,.1,'square',.025,i*.055)),check:()=>[392,523].forEach((n,i)=>tone(n,.18,'sine',.05,i*.1)),unlock:()=>[392,523,659,784].forEach((n,i)=>tone(n,.18,'triangle',.05,i*.09)),shield:()=>[240,360,540].forEach((n,i)=>tone(n,.2,'sine',.045,i*.05)),turbo:()=>[440,660,880,1100].forEach((n,i)=>tone(n,.12,'sawtooth',.025,i*.045)),loseHeart:()=>[260,190].forEach((n,i)=>tone(n,.18,'triangle',.04,i*.08)),recover:()=>[330,440,660].forEach((n,i)=>tone(n,.18,'sine',.05,i*.08)),retry:()=>[220,330].forEach((n,i)=>tone(n,.12,'square',.03,i*.07)),ui:()=>tone(420,.05,'square',.018),tutorial:()=>[392,523].forEach((n,i)=>tone(n,.12,'triangle',.03,i*.07)),customize:()=>[440,554,659].forEach((n,i)=>tone(n,.12,'sine',.035,i*.06)),share:()=>[523,784].forEach((n,i)=>tone(n,.14,'square',.028,i*.08)),path:()=>[330,440,660,880].forEach((n,i)=>tone(n,.15,'triangle',.04,i*.06)),finish:()=>[523,659,784,1046].forEach((n,i)=>tone(n,.25,'triangle',.055,i*.1))};
function setMusic(name){currentTrack=name||'';
Object.entries(tracks).forEach(([key,a])=>{if(key!==name){a.pause();a.currentTime=0}});
if(name&&audioUnlocked&&save.musicOn&&save.masterVolume>0){tracks[name].volume=save.masterVolume*.38;tracks[name].play().catch(()=>{})}}
function music(on){setMusic(on?'game':'')}
function updateAudioButtons(){const audible=(save.musicOn||save.sfxOn)&&save.masterVolume>0;$$('#sound-btn,#game-sound-btn').forEach(b=>b.textContent=audible?'🔊':'🔇')}
function toggleSound(){const on=(save.musicOn||save.sfxOn)&&save.masterVolume>0;
save.musicOn=!on;save.sfxOn=!on;if(!on&&save.masterVolume===0)save.masterVolume=.7;
persist();applyAudioSettings();
if(!on){wakeAudio();sfx.ui();setMusic($('#game-screen').classList.contains('active')?'game':'menu')}}

const avatarDefaults={skin:1,hair:0,shirt:0,pants:0,accessories:{glasses:false,headphones:false,cap:false,wrist:false}};
let avatar={...avatarDefaults,accessories:{...avatarDefaults.accessories}},editingPlayer=false;

const skins=['#f4c9a2','#dca071','#b87345','#81482f','#512d25'],shirts=['#05d9ff','#ff3bbd','#ffe044','#8c36ff','#ff674d'],pants=['#162947','#39496d','#642a72','#184d55'];

const options={skin:skins,hair:['SHORT','SPIKE','CURL','FADE','WAVE'],shirt:shirts,pants:pants};

function normalizeAvatar(a={}){const next={...avatarDefaults,...a,accessories:{...avatarDefaults.accessories,...(a.accessories||{})}};
if(a.extra===1)next.accessories.glasses=true;
if(a.extra===2)next.accessories.headphones=true;
if(a.extra===3)next.accessories.wrist=true;
delete next.extra;return next}

function makeOptions(){['skin','hair','shirt','pants'].forEach(k=>{const box=$(`#${k}-options`);
box.innerHTML='';
options[k].forEach((v,i)=>{const b=document.createElement('button');
b.type='button';
b.className='option'+(avatar[k]===i?' selected':'');
b.dataset.value=i;
b.setAttribute('aria-label',`${k} ${i+1}`);
if(['skin','shirt','pants'].includes(k))b.style.background=v;
else b.textContent=['✂','▲','●','▬','≈'][i];
b.onclick=()=>{avatar[k]=i;
makeOptions();
drawAvatar($('#avatar-preview'),avatar)};
box.appendChild(b)})});
$$('.accessory-option').forEach(b=>{const key=b.dataset.accessory;b.classList.toggle('selected',!!avatar.accessories[key]);b.setAttribute('aria-pressed',String(!!avatar.accessories[key]));b.onclick=()=>{avatar.accessories[key]=!avatar.accessories[key];makeOptions();drawAvatar($('#avatar-preview'),avatar)}})}
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
const accessories=normalizeAvatar(a).accessories;
if(accessories.cap){c.fillStyle='#1578ff';c.beginPath();c.arc(0,0,43,Math.PI,0);c.fill();c.fillRect(-5,-5,48,8)}
if(accessories.glasses){c.strokeStyle='#142641';
c.lineWidth=4;
c.strokeRect(-29,25,25,20);
c.strokeRect(4,25,25,20);
c.beginPath();
c.moveTo(-4,34);
c.lineTo(4,34);
c.stroke()}if(accessories.headphones){c.strokeStyle='#ff3bbd';
c.lineWidth=7;
c.beginPath();
c.arc(0,28,49,Math.PI,0);
c.stroke();
c.fillStyle='#ff3bbd';
c.fillRect(-52,25,9,29);
c.fillRect(43,25,9,29)}if(accessories.wrist){c.fillStyle='#ffe044';
c.fillRect(45,108,18,7)}c.restore()}

$('#play-btn').onclick=()=>{wakeAudio();setMusic('menu');
if(save.player){avatar=normalizeAvatar(save.player.avatar);
show('home-screen')}else{makeOptions();
drawAvatar($('#avatar-preview'));
show('creator-screen')}};

$('#creator-form').onsubmit=e=>{e.preventDefault();
const name=$('#nickname').value.trim()||'Player';
save.player={nickname:name.slice(0,12),avatar:{...avatar}};
persist();
if(editingPlayer){editingPlayer=false;sfx.customize();toast(t.saved);show('home-screen');return}
$('#welcome-title').textContent=`WELCOME TO SANTI ARCADE, ${name.toUpperCase()}!`;
show('welcome-screen');
sfx.unlock();
setTimeout(()=>show('home-screen'),1700)};

function syncHome(){if(!save.player)return;
$('#home-name').textContent=save.player.nickname.toUpperCase();
$('#total-coins').textContent=save.coins;
$$('.coins-sync').forEach(x=>x.textContent=save.coins);
$$('.energy-sync').forEach(x=>x.textContent=save.powerEnergy);
drawAvatar($('#home-avatar'),save.player.avatar)}
$('#sound-btn').onclick=toggleSound;
$('#game-sound-btn').onclick=toggleSound;
$('#quest-card').onclick=()=>show('map-screen');
$('#customize-btn').onclick=()=>{editingPlayer=true;avatar=normalizeAvatar(save.player.avatar);$('#nickname').value=save.player.nickname;$('#creator-title').textContent='EDIT YOUR PLAYER';$('#creator-subtitle').textContent='Change your look anytime!';$('#creator-save-btn').textContent='SAVE PLAYER';$('#creator-cancel-btn').classList.remove('hidden');makeOptions();drawAvatar($('#avatar-preview'),avatar);show('creator-screen')};
$('#creator-cancel-btn').onclick=()=>{editingPlayer=false;$('#creator-cancel-btn').classList.add('hidden');show('home-screen')};
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

// City Quest course profiles are independent from the math curriculum so future games
// and school grades can use their own engines and content without changing this platformer.
const COURSE_PROGRESSION=[
 {rank:'VERY EASY',gapStart:1160,gapEvery:1500,gapWidth:50,platformStep:520,platformWidth:240,obstacleStep:900,checks:[540,1240,2050]},
 {rank:'EASY',gapStart:1080,gapEvery:1250,gapWidth:64,platformStep:500,platformWidth:225,obstacleStep:800,checks:[620,1380,2320]},
 {rank:'EASY+',gapStart:900,gapEvery:1050,gapWidth:76,platformStep:470,platformWidth:205,obstacleStep:690,checks:[650,1450,2380]},
 {rank:'MODERATE',gapStart:820,gapEvery:900,gapWidth:88,platformStep:440,platformWidth:185,obstacleStep:600,checks:[720,1600,2550]},
 {rank:'MODERATE',gapStart:780,gapEvery:790,gapWidth:100,platformStep:410,platformWidth:170,obstacleStep:530,checks:[820,1750,2800]},
 {rank:'MODERATE+',gapStart:720,gapEvery:700,gapWidth:110,platformStep:390,platformWidth:155,obstacleStep:470,checks:[900,1900,3000]},
 {rank:'CHALLENGING',gapStart:680,gapEvery:630,gapWidth:120,platformStep:360,platformWidth:140,obstacleStep:420,checks:[1050,2050,3150]},
 {rank:'CHALLENGING+',gapStart:650,gapEvery:570,gapWidth:130,platformStep:335,platformWidth:125,obstacleStep:380,checks:[1200,2350,3450]},
 {rank:'HARD',gapStart:620,gapEvery:520,gapWidth:140,platformStep:310,platformWidth:112,obstacleStep:345,checks:[1400,2750,3900]},
 {rank:'HARD BUT FAIR',gapStart:600,gapEvery:480,gapWidth:148,platformStep:290,platformWidth:104,obstacleStep:320,checks:[1500,3000,4150]}
];

function buildMap(){const map=$('#level-map');
map.innerHTML='';
LEVELS.forEach((l,i)=>{const n=i+1,b=document.createElement('button'),locked=n>save.unlocked,stars=save.stars[n]||0;
b.className='level-node'+(locked?' locked':'');
b.disabled=locked;
b.innerHTML=`<span class="num">${locked?'🔒':n}</span><strong>${l.name}</strong><small>${mathLabel(l.math)}</small><em>${COURSE_PROGRESSION[i].rank}</em><span class="stars">${'★'.repeat(stars)}${'☆'.repeat(3-stars)}</span>`;
if(!locked)b.onclick=()=>startLevel(i);
map.appendChild(b)});
syncHome()}
function mathLabel(m){return({add:'ADDITION',sub:'SUBTRACTION',mix:'ADD + SUBTRACT',groups:'MULTIPLY GROUPS',times2:'×2 POWER',times5:'×5 POWER',final:'FINAL MIX'})[m]}

const canvas=$('#game-canvas'),ctx=canvas.getContext('2d');
let game={running:false,paused:false},keys={left:false,right:false,jump:false};

function makeLevel(i){const l=LEVELS[i],course=COURSE_PROGRESSION[i],platforms=[{x:0,y:455,w:l.world,h:85}];
for(let x=360,n=0;x<l.world-260;x+=course.platformStep,n++){
const tier=i<2?0:(n%3===1?70:n%4===2?135:0),w=Math.max(92,course.platformWidth-(n%3)*8);
platforms.push({x,y:365-tier,w,h:20,mobile:i>5&&n%5===0,phase:n});
if(i>3&&n%4===2)platforms.push({x:x+Math.floor(course.platformStep*.48),y:285-(i>7?30:0),w:Math.max(90,w-30),h:18})}
const gaps=[];
for(let x=course.gapStart,n=0;x<l.world-280;x+=course.gapEvery,n++){
const candidate={x:x+(n%2)*35,w:Math.min(155,course.gapWidth+(n%3)*4)};
if(!l.gates.some(g=>Math.abs(g.x-candidate.x)<250))gaps.push(candidate)}
const coins=[];
for(let x=240;
x<l.world-160;
x+=150)coins.push({x,y:390-((x/150)%3===0?90:0),got:false});
const obstacles=[];
for(let x=520,n=0;x<l.world-250;x+=course.obstacleStep,n++){
const ox=x+(i*29+n*17)%75,clearance=Math.max(110,320-i*24);
if(!gaps.some(g=>ox>g.x-clearance&&ox<g.x+g.w+clearance)&&!l.gates.some(g=>Math.abs(g.x-ox)<150)&&!course.checks.some(c=>Math.abs(c-ox)<115))obstacles.push({x:ox,y:423,w:42,h:32,mobile:i>4&&n%3===2,phase:x,disabled:false})}
const bridges=gaps.map(g=>({x:g.x,w:g.w,active:false})),gates=l.gates.map(g=>({...g,done:false,tries:0,reward:null}));
const used=new Set();
gates.forEach(g=>{const bridge=bridges.find((b,n)=>!used.has(n)&&b.x>g.x+100&&b.x<g.x+850);
if(bridge){const n=bridges.indexOf(bridge);used.add(n);g.reward={type:'bridge',index:n}}
else{const obstacle=obstacles.find(o=>!o.rewarded&&o.x>g.x&&o.x<g.x+850);if(obstacle){obstacle.rewarded=true;g.reward={type:'obstacle',index:obstacles.indexOf(obstacle)}}else g.reward={type:'checkpoint'}}});
return{...l,rank:course.rank,platforms,gaps,bridges,coins,obstacles,gates,check:course.checks.filter(x=>x<l.goal-120).map(x=>({x,hit:false}))}}
function startLevel(i){game={running:true,paused:false,orientationPaused:false,tutorialPaused:false,helpPaused:false,attemptOver:false,index:i,level:makeLevel(i),player:{x:80,y:370,vx:0,vy:0,w:42,h:64,on:false},camera:0,runCoins:0,lives:5,mathCorrect:0,mathTotal:LEVELS[i].gates.length,start:performance.now(),checkpoint:80,last:performance.now(),raf:0,activeGate:null,pendingGate:null,shield:false,rescues:0,correctStreak:0,missStreak:0,turboUntil:0,safeMath:null};
keys={left:false,right:false,jump:false};
$('#level-label').textContent=`LEVEL ${i+1}`;
$('#mission-label').textContent=LEVELS[i].name;
$('#run-coins').textContent=0;
$('#lives').textContent=5;
$('#run-stars').textContent=save.stars[i+1]||0;
updatePowerHUD();
$('#pause-panel').classList.add('hidden');
$('#nice-try-panel').classList.add('hidden');
$('#rescue-panel').classList.add('hidden');
$('#tutorial-panel').classList.add('hidden');
$('#game-help-panel').classList.add('hidden');
$('#math-panel').classList.add('hidden');
show('game-screen');
music(true);
cancelAnimationFrame(game.raf);
game.raf=requestAnimationFrame(loop);
if(i===0&&!save.tutorials.move)setTimeout(()=>{if(game.running&&game.index===0)showTutorial('move','🎮',t.moveTitle,t.moveText)},260)}
function groundYAt(x){const gapIndex=game.level.gaps.findIndex(g=>x>g.x&&x<g.x+g.w);if(gapIndex<0)return 455;return game.level.bridges[gapIndex]?.active?438:null}
function groundAt(x){return groundYAt(x)!==null}
function collide(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y}
function update(dt,now){const p=game.player,l=game.level;
if(game.paused||game.orientationPaused||game.tutorialPaused||game.helpPaused||game.activeGate)return;
const turbo=now<game.turboUntil,speed=turbo?1.22:1;
p.vx+=(keys.right-keys.left)*1500*speed*dt;
p.vx*=Math.pow(.001,dt);
p.vx=Math.max(-310*speed,Math.min(310*speed,p.vx));
if(keys.jump&&p.on){p.vy=-650;
p.on=false;
sfx.jump()}keys.jump=false;
p.vy+=1700*dt;
const oldY=p.y;
p.x+=p.vx*dt;
p.y+=p.vy*dt;
p.x=Math.max(0,Math.min(l.world-p.w,p.x));
p.on=false;
const groundY=groundYAt(p.x+p.w/2);
if(groundY!==null&&p.y+p.h>=groundY&&oldY+p.h<=groundY+15&&p.vy>=0){p.y=groundY-p.h;
p.vy=0;
p.on=true}l.platforms.slice(1).forEach(pl=>{const py=pl.y+(pl.mobile?Math.sin(now/700+pl.phase)*55:0),box={x:pl.x,y:py,w:pl.w,h:pl.h};
if(collide(p,box)&&oldY+p.h<=py+8&&p.vy>=0){p.y=py-p.h;
p.vy=0;
p.on=true}});
l.coins.forEach(c=>{if(!c.got&&Math.abs(p.x+p.w/2-c.x)<35&&Math.abs(p.y+p.h/2-c.y)<50){c.got=true;
game.runCoins++;
$('#run-coins').textContent=game.runCoins;
sfx.coin()}});
l.obstacles.forEach(o=>{if(o.disabled)return;const ox=o.x+(o.mobile?Math.sin(now/600+o.phase)*75:0);
if(collide(p,{...o,x:ox})&&!o.cool){o.cool=true;
hitPlayer();
setTimeout(()=>o.cool=false,800)}});
l.check.forEach(c=>{if(!c.hit&&p.x>c.x){c.hit=true;
let respawnX=Math.max(20,c.x-25);while(respawnX<l.goal&&!groundAt(respawnX+p.w/2))respawnX+=12;game.checkpoint=respawnX;
toast(t.checkpoint);
sfx.check();
if(game.index===0&&!save.tutorials.checkpoint)showTutorial('checkpoint','✓',t.checkTitle,t.checkText)}});
if(game.tutorialPaused)return;
const gate=l.gates.find(g=>!g.done&&p.x+p.w>g.x-20);
if(gate){p.vx=0;
if(game.index===0&&!save.tutorials.math){game.pendingGate=gate;showTutorial('math','➕',t.solveTitle,t.solveText)}else openMath(gate)}if(p.y>600)hitPlayer();
if(p.x>l.goal)finishLevel();
game.camera=Math.max(0,Math.min(l.world-960,p.x-260))}
function respawn(){const p=game.player;p.x=game.checkpoint;p.y=350;p.vx=0;p.vy=0;p.on=false;game.last=performance.now()}
function updatePowerHUD(){if(!game||!$('#power-energy'))return;
$('#power-energy').textContent=save.powerEnergy;
$$('.energy-sync').forEach(x=>x.textContent=save.powerEnergy);
const shield=$('#shield-btn');
shield.classList.toggle('active',!!game.shield);
shield.classList.toggle('ready',save.powerEnergy>=3&&!game.shield);
shield.disabled=save.powerEnergy<3||!!game.shield||!game.running;
shield.innerHTML=game.shield?'🛡️ <span>READY</span>':'🛡️ <span>3⚡</span>'}
function hitPlayer(){if(game.attemptOver)return;
if(game.shield){game.shield=false;respawn();updatePowerHUD();toast('SHIELD SAVED YOU!');sfx.shield();return}
game.lives--;$('#lives').textContent=game.lives;sfx.loseHeart();
if(game.lives<=0){endAttempt();return}
toast('KEEP GOING!');respawn()}
function endAttempt(){game.attemptOver=true;game.paused=true;game.activeGate=null;keys={left:false,right:false,jump:false};
$('#math-panel').classList.add('hidden');music(false);
if(save.powerEnergy>=5&&game.rescues<2){$('#rescue-count').textContent=`${2-game.rescues} rescue${2-game.rescues===1?'':'s'} left this run.`;$('#rescue-panel').classList.remove('hidden')}
else $('#nice-try-panel').classList.remove('hidden')}
const rand=(min,max)=>Math.floor(Math.random()*(max-min+1))+min;
function questionFor(){const level=game.index+1,kind=game.level.math,up=game.correctStreak>=2?1:game.missStreak>=2?-1:0;
let a,b,op,key,answer,tries=0;
do{if(kind==='add'){const cap=(level===1?10:18)+up*3;a=rand(1,Math.max(5,cap));b=rand(1,Math.max(4,cap-a+4));op='+'}
else if(kind==='sub'){const cap=(level===3?22:38)+up*4;a=rand(10,Math.max(14,cap));b=rand(1,a);op='-'}
else if(kind==='mix'){op=Math.random()<.5?'+':'-';const cap=(level===5?28:45)+up*4;a=rand(6,Math.max(12,cap));b=rand(1,op==='-'?a:Math.max(6,Math.floor(cap*.55)))}
else if(kind==='groups'){a=rand(2,Math.max(2,4+up));b=rand(2,Math.max(2,4+up));op='×'}
else if(kind==='times2'){a=2;b=rand(1,Math.max(6,10+up));op='×'}
else if(kind==='times5'){a=5;b=rand(1,Math.max(6,10+up));op='×'}
else{a=[2,5,10][rand(0,2)];b=rand(1,Math.max(6,10+up));op='×'}
answer=op==='+'?a+b:op==='-'?a-b:a*b;key=`${a}${op}${b}`;tries++}while(key===save.lastQuestions[level]&&tries<20);
save.lastQuestions[level]=key;persist();return{a,b,op,answer}}
function safeForMath(g){const p=game.player;let safeX=Math.max(game.checkpoint,Math.min(g.x-95,p.x));
const clear=x=>groundAt(x+p.w/2)&&!game.level.obstacles.some(o=>Math.abs(o.x-x)<75);
while(safeX>game.checkpoint&&!clear(safeX))safeX-=12;
if(!clear(safeX))safeX=Math.max(20,game.checkpoint-90);
p.x=safeX;p.y=455-p.h;p.vx=0;p.vy=0;p.on=true;game.safeMath={x:safeX,y:p.y}}
function restoreMathSafety(){const p=game.player,s=game.safeMath||{x:game.checkpoint,y:391};p.x=s.x;p.y=s.y;p.vx=0;p.vy=0;p.on=true;game.last=performance.now()}
function hintFor(q,strong=false){if(q.op==='+')return strong?`Break it apart: ${q.a} + ${q.b}. Count on ${q.b} more.`:'Start with the bigger number and count on.';
if(q.op==='-')return strong?`Start at ${q.a}. Count back ${q.b} steps.`:'Count backward in small steps.';
return strong?`${q.b} groups of ${q.a}: ${Array(Math.min(q.b,10)).fill('●'.repeat(Math.min(q.a,10))).join('  ')}`:`Think of ${q.b} groups with ${q.a} in each group.`}
function openMath(g){game.activeGate=g;g.tries=0;g.question=questionFor();safeForMath(g);const q=g.question;
$('#math-kind').textContent=game.level.math==='groups'?'GROUP POWER':'POWER GATE';
$('#math-question').textContent=`${q.a} ${q.op} ${q.b} = ?`;
$('#math-visual').textContent=q.op==='×'?(game.level.math==='groups'?`${q.b} groups of ${q.a}: `:'Count the groups: ')+Array(Math.min(q.b,10)).fill('●'.repeat(Math.min(q.a,10))).join('  '):'Choose the number that powers the path.';
const offsets=q.answer<10?[1,2]:[3,5],vals=[q.answer,q.answer+offsets[1],Math.max(0,q.answer-offsets[0])].sort(()=>Math.random()-.5),box=$('#math-answers');box.innerHTML='';
vals.forEach(v=>{const b=document.createElement('button');b.textContent=v;b.onclick=()=>answerMath(v===q.answer,g);box.appendChild(b)});
$('#math-feedback').textContent='';$('#math-reward').classList.add('hidden');$('#math-panel').classList.remove('hidden');sfx.challenge()}
function applyLearningAdvantage(g){if(g.reward?.type==='bridge'){const bridge=game.level.bridges[g.reward.index];if(bridge)bridge.active=true}
else if(g.reward?.type==='obstacle'){const obstacle=game.level.obstacles[g.reward.index];if(obstacle)obstacle.disabled=true}
game.checkpoint=Math.max(game.checkpoint,Math.floor(game.safeMath?.x||game.player.x));toast(t.path);sfx.path()}
function finishMath(g,quality){g.done=true;restoreMathSafety();applyLearningAdvantage(g);
const rewarded=quality==='full'||quality==='hint';
if(rewarded){game.mathCorrect++;game.correctStreak=quality==='full'?game.correctStreak+1:0;game.missStreak=0;save.powerEnergy++;persist();updatePowerHUD();
$('.power-stat')?.classList.add('flash');setTimeout(()=>$('.power-stat')?.classList.remove('flash'),900);
$('#math-reward').classList.remove('hidden');$('#math-feedback').textContent=quality==='hint'?'NICE COMEBACK!':'';sfx.correct();setTimeout(()=>sfx.energy(),120);
if(quality==='full'&&game.correctStreak%3===0){game.turboUntil=performance.now()+6000;setTimeout(()=>{toast('TURBO BOOST!');sfx.turbo()},300)}}
else{game.correctStreak=0;game.missStreak++}
setTimeout(()=>{game.activeGate=null;$('#math-panel').classList.add('hidden');$('#math-reward').classList.add('hidden');restoreMathSafety();if(rewarded&&!save.tutorials.power)showTutorial('power','⚡',t.powerTitle,t.powerText)},rewarded?1050:1350)}
function answerMath(ok,g){if(g.resolving)return;
if(ok){g.resolving=true;finishMath(g,g.tries===0?'full':'hint');return}
g.tries++;game.correctStreak=0;sfx.wrong();
if(g.tries===1){$('#math-feedback').textContent=`${t.almost} ${t.again} ${hintFor(g.question)}`;return}
if(g.tries===2){$('#math-feedback').textContent=`${t.got} ${hintFor(g.question,true)}`;return}
g.resolving=true;$('#math-feedback').textContent=`LET'S LEARN IT: ${g.question.a} ${g.question.op} ${g.question.b} = ${g.question.answer}`;finishMath(g,'assisted')}
function showTutorial(key,icon,title,text){if(!game.running||save.tutorials[key]||game.tutorialPaused)return;
game.tutorialPaused=true;game.tutorialKey=key;game.player.vx=0;game.player.vy=0;keys={left:false,right:false,jump:false};$$('#touch-controls button').forEach(b=>b.classList.remove('pressed'));
$('#tutorial-icon').textContent=icon;$('#tutorial-title').textContent=title;$('#tutorial-text').textContent=text;$('#tutorial-panel').classList.remove('hidden');sfx.tutorial()}
function closeTutorial(){const key=game.tutorialKey;if(key){save.tutorials[key]=true;persist()}
game.tutorialPaused=false;game.tutorialKey='';$('#tutorial-panel').classList.add('hidden');game.last=performance.now();sfx.tutorial();
if(key==='math'&&game.pendingGate){const gate=game.pendingGate;game.pendingGate=null;openMath(gate)}}
$('#tutorial-close').onclick=closeTutorial;
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
l.bridges.forEach(b=>{if(!b.active)return;const x=b.x-c;glow('#ffe044',18);roundBox(x-4,438,b.w+8,18,6,'#ffe044','#fff6a0');ctx.fillStyle='#8c36ff';for(let bx=x+7;bx<x+b.w-4;bx+=22)ctx.fillRect(bx,443,12,5);noGlow()});
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
l.obstacles.forEach(o=>{if(o.disabled)return;const x=o.x+(o.mobile?Math.sin(now/600+o.phase)*75:0)-c;
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
glow(game.shield?'#ffe044':now<game.turboUntil?'#ff3bbd':'#05d9ff',game.shield?22:now<game.turboUntil?16:7);
if(im&&im.complete&&im.naturalWidth)ctx.drawImage(im,-43,-19,86,115);
else{ctx.fillStyle='#05d9ff';
ctx.fillRect(-18,10,36,48);
ctx.fillStyle='#ffe044';
ctx.beginPath();
ctx.arc(0,0,15,0,7);
ctx.fill()}noGlow();
if(game.shield){ctx.strokeStyle='#ffe044aa';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(0,38,47,62,0,0,Math.PI*2);ctx.stroke()}
if(now<game.turboUntil){ctx.strokeStyle='#ff3bbdaa';ctx.lineWidth=3;for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(-54-i*10,38+i*14);ctx.lineTo(-83-i*13,38+i*14);ctx.stroke()}}
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
show('complete-screen');
setTimeout(()=>setMusic('victory'),180)}
$('#pause-btn').onclick=()=>{game.paused=true;tracks.game.pause();
$('#pause-panel').classList.remove('hidden')};
$('#resume-btn').onclick=()=>{game.paused=false;
game.last=performance.now();
if(save.musicOn&&audioUnlocked)tracks.game.play().catch(()=>{});
$('#pause-panel').classList.add('hidden')};
$('#restart-btn').onclick=()=>{sfx.retry();startLevel(game.index)};
$('#exit-btn').onclick=()=>{game.running=false;
cancelAnimationFrame(game.raf);
music(false);
show('map-screen')};
$('#again-btn').onclick=()=>{sfx.retry();startLevel(game.index)};
$('#next-btn').onclick=()=>startLevel(Math.min(9,game.index+1));
$('#try-again-btn').onclick=()=>{sfx.retry();startLevel(game.index)};
$('#rescue-retry-btn').onclick=()=>{sfx.retry();startLevel(game.index)};
$('#keep-going-btn').onclick=()=>{if(save.powerEnergy<5||game.rescues>=2)return;
save.powerEnergy-=5;persist();game.rescues++;game.lives=1;game.attemptOver=false;game.paused=false;$('#lives').textContent=1;$('#rescue-panel').classList.add('hidden');respawn();updatePowerHUD();setMusic('game');toast('+1 HEART! KEEP GOING!');sfx.recover()};
$('#shield-btn').onclick=()=>{wakeAudio();if(!game.running||game.shield||save.powerEnergy<3)return;
save.powerEnergy-=3;persist();game.shield=true;updatePowerHUD();toast('SHIELD READY!');sfx.shield()};
$('#retry-map-btn').onclick=()=>{game.running=false;
cancelAnimationFrame(game.raf);
music(false);
show('map-screen')};

function openSettings(){wakeAudio();if(!currentTrack)setMusic('menu');sfx.ui();applyAudioSettings();$('#settings-panel').classList.remove('hidden')}
function closeSettings(){sfx.ui();$('#settings-panel').classList.add('hidden')}
$$('.settings-btn').forEach(b=>b.onclick=openSettings);
$('#settings-close').onclick=closeSettings;
$('#settings-panel').addEventListener('pointerdown',e=>{if(e.target===$('#settings-panel'))closeSettings()});
$('#music-toggle').onclick=()=>{wakeAudio();save.musicOn=!save.musicOn;persist();applyAudioSettings();if(save.musicOn)setMusic($('#game-screen').classList.contains('active')?'game':'menu')};
$('#sfx-toggle').onclick=()=>{wakeAudio();save.sfxOn=!save.sfxOn;persist();applyAudioSettings();if(save.sfxOn)sfx.ui()};
$('#master-volume').oninput=e=>{save.masterVolume=Number(e.target.value)/100;persist();applyAudioSettings()};

function modalToggle(id,on){$(id).classList.toggle('hidden',!on);if(on)sfx.ui()}
$('#how-to-btn').onclick=()=>modalToggle('#how-to-panel',true);
$('#how-to-close').onclick=$('#how-to-done').onclick=()=>modalToggle('#how-to-panel',false);

const SHARE_URL='https://ptrvargas.github.io/santi-arcade/',SHARE_TEXT='Come play Santi Arcade with me! 🎮\nPlay • Learn • Level Up ⚡';
async function copyShareLink(){let copied=false;
try{if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(SHARE_URL);copied=true}}
catch(_){}
if(!copied){const area=document.createElement('textarea');area.value=SHARE_URL;area.setAttribute('readonly','');area.style.position='fixed';area.style.opacity='0';document.body.appendChild(area);area.select();try{copied=document.execCommand('copy')}catch(_){}area.remove()}
$('#share-feedback').textContent=copied?t.copied:SHARE_URL;if(copied){toast(t.copied);sfx.share()}}
async function shareArcade(){if(navigator.share){try{await navigator.share({title:'Santi Arcade',text:SHARE_TEXT,url:SHARE_URL});sfx.share();return}catch(e){if(e?.name==='AbortError')return}}
modalToggle('#share-panel',true)}
$('#share-btn').onclick=shareArcade;
$('#native-share-btn').classList.toggle('hidden',!navigator.share);
$('#native-share-btn').onclick=shareArcade;
$('#copy-link-btn').onclick=copyShareLink;
$('#share-close').onclick=()=>modalToggle('#share-panel',false);
$('#qr-btn').onclick=()=>{modalToggle('#qr-panel',true);sfx.share()};
$('#qr-close').onclick=()=>modalToggle('#qr-panel',false);
$('#qr-copy-btn').onclick=copyShareLink;

$('#game-help-btn').onclick=()=>{if(!game.running||game.attemptOver)return;
game.helpPaused=true;game.player.vx=0;game.player.vy=0;keys={left:false,right:false,jump:false};$$('#touch-controls button').forEach(b=>b.classList.remove('pressed'));
let tip='Keep moving toward the glowing goal.';
if(game.activeGate)tip='Try a math strategy: count on, count back, or make equal groups.';
else if(!game.player.on)tip='Stay calm. Hold a direction and get ready to land.';
else if(save.powerEnergy>=3&&!game.shield)tip='You have enough ⚡ for a Shield. Tap 🛡️ in the HUD.';
else if(game.level.gaps.some(g=>g.x>game.player.x&&g.x<game.player.x+420))tip='Try jumping near the edge. A powered bridge can make the gap easier.';
$('#game-help-text').textContent=tip;$('#game-help-panel').classList.remove('hidden');sfx.tutorial()};
$('#game-help-close').onclick=()=>{game.helpPaused=false;$('#game-help-panel').classList.add('hidden');game.last=performance.now();sfx.ui()};

function setKey(k,v){if(k==='jump'&&v&&game.running&&game.index===0&&!save.tutorials.jump&&!game.tutorialPaused){showTutorial('jump','▲',t.jumpTitle,t.jumpText);return}keys[k]=v}$$('#touch-controls button').forEach(b=>{const k=b.dataset.key,on=e=>{e.preventDefault();
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
applyAudioSettings();
if('serviceWorker'in navigator)addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js').catch(()=>{}));

})();
