/** Two Meetings, One Forever: a self-contained playable 2D fairytale, no external JS libraries. */
'use strict';

const screenplay = [
  {title:'Once Upon a Time',breakTitle:'Once Upon<br><em>a Time</em>',tag:'PROLOGUE',place:'SOMEWHERE UNDER THE SAME SKY',set:'prologue',lines:[
    ['narrator','Once upon a time, two hearts lived far apart… and a beautiful story was waiting to begin.'],
    ['narrator','His name was Saifeddine. Her name was Ariana.']
  ]},
  {title:'Two Different Worlds',breakTitle:'Two Different<br><em>Worlds</em>',tag:'CHAPTER ONE',place:'MOROCCO ♡ SWITZERLAND',set:'worlds',lines:[
    ['narrator','He lived beneath the warm Moroccan sun. She lived among the mountains of Switzerland.'],
    ['saif','I wonder what kind of surprise the future has for me.'],
    ['ariana','Somewhere out there, maybe someone is wondering the same thing.']
  ]},
  {title:'The Unexpected Beginning',breakTitle:'The Unexpected<br><em>Beginning</em>',tag:'CHAPTER TWO',place:'TWO PHONES • ONE CONNECTION',set:'messages',lines:[
    ['narrator','Then, one day, two strangers began to talk.'],
    ['saif','Hello, from Morocco. 🇲🇦'],
    ['ariana','Hello, from Switzerland! 🇨🇭'],
    ['saif','Why do I suddenly smile whenever your message arrives?'],
    ['ariana','I don’t know… but I think I have the same problem. ♡']
  ]},
  {title:'The First Meeting',breakTitle:'The First<br><em>Meeting</em>',tag:'CHAPTER THREE',place:'THE DAY IT ALL BECAME REAL',set:'first',lines:[
    ['narrator','And finally, the day came when they stood face to face.'],
    ['saif','So… you’re really here.'],
    ['ariana','And you look even more nervous in person!'],
    ['saif','I practiced a thousand things to say.'],
    ['ariana','Then forget them. Just be you.'],
    ['saif','Okay… hello, my favorite person.']
  ]},
  {title:'The Second Meeting',breakTitle:'The Second<br><em>Meeting</em>',tag:'CHAPTER FOUR',place:'A LITTLE MOMENT • A BIG FEELING',set:'second',lines:[
    ['narrator','Time passed. They met once more. Only their second meeting…'],
    ['ariana','You’re smiling like that again?'],
    ['saif','Because this time, I know exactly what I’ve missed.'],
    ['ariana','And what is that?'],
    ['saif','You. Every single day in between.']
  ]},
  {title:'Our Beautiful Promise',breakTitle:'Our Beautiful<br><em>Promise</em>',tag:'CHAPTER FIVE',place:'OUR NIKAH • ALHAMDULILLAH',set:'nikah',lines:[
    ['narrator','They did not need a grand wedding to make a beautiful promise.'],
    ['narrator','Through Nikah, they became husband and wife. Alhamdulillah.'],
    ['saif','Ariana, I choose you for every day ahead of us.'],
    ['ariana','And I choose you, Saifeddine.'],
    ['saif','So… I finally get to call you my wife. ♡']
  ]},
  {title:'My Wife, My Home',breakTitle:'My Wife,<br><em>My Home</em>',tag:'CHAPTER SIX',place:'DISTANCE CANNOT CHANGE THIS',set:'wife',lines:[
    ['ariana','Can you believe it? We’re husband and wife now.'],
    ['saif','Those are my favorite words in the world.'],
    ['ariana','Even when Morocco and Switzerland feel so far apart?'],
    ['saif','A map can tell me where you are…'],
    ['saif','…but my heart already knows where home is. With you.']
  ]},
  {title:'Only the Beginning',breakTitle:'Only the<br><em>Beginning</em>',tag:'CHAPTER SEVEN',place:'OUR FOREVER STARTS HERE',set:'forever',lines:[
    ['narrator','Their story was never about how many times they met. It was about who they chose.'],
    ['saif','I can’t promise a perfect life.'],
    ['ariana','Good. Perfect sounds a little boring anyway.'],
    ['saif','But I promise to keep choosing you.'],
    ['ariana','Then our fairytale is only beginning.'],
    ['narrator','Two meetings. One Nikah. And a lifetime of chapters still to write. ♡']
  ]}
];

// Time-based playback makes the film play continuously like a video. Dialogue is invented, not claimed to be a transcript.
const INTRO_BEAT = 1150;
function lineDuration(text) { return Math.min(7300, Math.max(3600, 1650 + text.replace(/<[^>]+>/g, '').length * 53)); }
let totalMs = 0;
for (const scene of screenplay) {
  scene.start = totalMs;
  let t = INTRO_BEAT;
  scene.cues = scene.lines.map(([role,text]) => { const cue={start:t,end:t+lineDuration(text),role,text};t=cue.end;return cue; });
  scene.duration = t + 750;
  totalMs += scene.duration;
  scene.end = totalMs;
}

const dom = Object.fromEntries(['screen','sceneHost','sceneShutter','sceneBadge','sceneLocation','chapterHeading','speechLayer','subtitles','speaker','spokenText','opening','ending','beginButton','replayEnd','timeline','chapterMarkers','playButton','prevButton','nextButton','timecode','voiceButton','voiceText','musicButton','musicText','fullButton','centerPlay'].map(id=>[id,document.getElementById(id)]));
const state = {playing:false,started:false,finished:false,position:0,scene:-1,cue:-1,voice:true,music:true,frame:0,lastFrame:0,transition:null};

// Visual language inspired by the original supplied 2D characters: Saif = black hair/green top, Ariana = long brown hair/pink dress.
function characterSVG(person,phone=false) {
  const girl = person==='ariana';
  const id = girl?'ar':'sa';
  return `<svg viewBox="0 0 215 355" role="img" aria-label="${girl?'Ariana':'Saifeddine'} 2D cartoon character" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="skin-${id}" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#ffe1c9"/><stop offset="1" stop-color="#eeb49f"/></linearGradient>
    <linearGradient id="dress-${id}" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${girl?'#ffced8':'#658b76'}"/><stop offset="1" stop-color="${girl?'#dc779c':'#2d5a55'}"/></linearGradient>
    <linearGradient id="hair-${id}" x1="0" y1="0" x2="1" y2=".6"><stop stop-color="${girl?'#755046':'#30283c'}"/><stop offset="1" stop-color="${girl?'#3f2932':'#151b29'}"/></linearGradient>
  </defs>
  <ellipse cx="106" cy="348" rx="62" ry="7" fill="#271c46" opacity=".26"/>
  ${girl?`
  <g class="hair-swing"><path d="M49 111 Q30 70 54 48 Q73 15 117 24 Q175 24 171 101 L175 225 Q158 252 141 231 L132 170 L76 167 L69 225 Q45 242 36 219Z" fill="url(#hair-${id})" stroke="#352331" stroke-width="3"/></g>
  <path d="M89 286 Q83 312 82 330" stroke="#f2bca7" stroke-width="17" stroke-linecap="round"/>
  <path d="M129 286 Q134 313 130 330" stroke="#f2bca7" stroke-width="17" stroke-linecap="round"/>
  <path d="M69 332 Q74 324 91 327 Q103 342 89 346 L60 346 Q55 339 69 332" fill="#5e4166"/>
  <path d="M119 327 Q136 323 147 335 Q153 345 139 346 L111 346 Q109 339 119 327" fill="#5e4166"/>
  <path d="M102 172 L102 202" stroke="url(#skin-${id})" stroke-width="29" stroke-linecap="round"/>
  <path d="M76 195 Q42 206 44 260 Q59 274 77 252" fill="none" stroke="#efbba7" stroke-width="19" stroke-linecap="round"/>
  <g class="hand-wave"><path d="M140 199 Q179 206 181 168" fill="none" stroke="#f5bfa9" stroke-width="17" stroke-linecap="round"/><ellipse cx="181" cy="163" rx="9" ry="15" fill="#f7c8b3" transform="rotate(-20 181 163)"/></g>
  <path d="M79 190 Q106 183 132 193 L142 248 Q161 288 159 305 Q104 318 57 306 Q58 285 72 248Z" fill="url(#dress-${id})" stroke="#bb6389" stroke-width="3"/>
  <path d="M80 226 Q110 239 137 226" fill="none" stroke="#ffe8e4" stroke-width="4" opacity=".6"/>
  <path d="M65 286 Q109 300 153 286" fill="none" stroke="#ffedf0" stroke-width="4" opacity=".28"/>
  <circle cx="104" cy="123" r="62" fill="url(#skin-${id})" stroke="#a87873" stroke-width="2"/>
  <path d="M46 116 Q33 43 84 32 Q151 6 164 65 Q173 88 160 110 Q147 78 134 67 Q115 92 85 80 Q60 103 46 116Z" fill="url(#hair-${id})"/>
  <path d="M45 116 Q27 180 45 220 Q65 227 73 204 Q51 171 61 119Z" fill="url(#hair-${id})"/>
  <path d="M163 115 Q182 168 166 228 Q143 241 135 211 Q157 166 150 115Z" fill="url(#hair-${id})"/>
  `:`
  <path d="M75 281 L75 329 M131 281 L133 329" stroke="#293c48" stroke-width="23" stroke-linecap="round"/>
  <path d="M57 330 Q75 320 91 328 Q101 342 87 346 L46 346 Q43 337 57 330Z M119 328 Q139 319 154 333 Q162 344 148 346 L111 346 Q108 337 119 328Z" fill="#211c2c"/>
  <path d="M102 174 L102 208" stroke="url(#skin-${id})" stroke-width="31" stroke-linecap="round"/>
  <path d="M69 199 Q40 219 47 270" fill="none" stroke="url(#skin-${id})" stroke-width="18" stroke-linecap="round"/>
  <g class="hand-wave"><path d="M144 202 Q176 220 177 163" fill="none" stroke="#ecc0ac" stroke-width="18" stroke-linecap="round"/><ellipse cx="177" cy="157" rx="10" ry="15" fill="#f0c6b0" transform="rotate(-20 177 157)"/></g>
  <path d="M76 185 Q107 172 137 191 L154 258 Q135 284 105 279 Q71 283 55 259Z" fill="url(#dress-${id})" stroke="#254b47" stroke-width="3"/>
  <path d="M72 202 Q105 215 137 204" fill="none" stroke="#b5d4b2" stroke-width="4" opacity=".5"/>
  <path d="M105 186 L104 240" stroke="#c1dfca" stroke-width="2" opacity=".6"/>
  <circle cx="105" cy="121" r="61" fill="url(#skin-${id})" stroke="#a5786e" stroke-width="2"/>
  <path d="M44 110 Q33 40 83 43 Q116 13 162 47 Q176 66 168 110 Q150 96 153 78 Q132 84 120 69 Q98 95 72 79 Q71 101 44 110Z" fill="url(#hair-${id})"/>
  <path d="M64 73 Q96 42 121 57" fill="none" stroke="#554558" stroke-width="6" opacity=".48" stroke-linecap="round"/>
  `}
  <g class="head-group">
    <path d="M75 120 Q87 114 96 120" fill="none" stroke="#4e3540" stroke-width="3" stroke-linecap="round"/>
    <path d="M120 120 Q132 114 142 120" fill="none" stroke="#4e3540" stroke-width="3" stroke-linecap="round"/>
    <g class="blink"><ellipse cx="86" cy="131" rx="7" ry="10.5" fill="#352638"/><ellipse cx="129" cy="131" rx="7" ry="10.5" fill="#352638"/><ellipse cx="88" cy="127" rx="2.6" ry="3.5" fill="#fff"/><ellipse cx="131" cy="127" rx="2.6" ry="3.5" fill="#fff"/></g>
    <ellipse cx="65" cy="151" rx="14" ry="7" fill="#df7c90" opacity=".34"/><ellipse cx="148" cy="151" rx="14" ry="7" fill="#df7c90" opacity=".34"/>
    <path d="M106 138 Q100 147 107 149" stroke="#b87972" stroke-width="2" fill="none" opacity=".7"/>
    <path class="mouth-smile" d="M94 161 Q106 176 120 161" stroke="#a8506a" stroke-width="3" stroke-linecap="round" fill="none"/>
    <ellipse class="mouth-open" cx="107" cy="166" rx="7" ry="5.5" fill="#b85674"/>
    <circle cx="53" cy="143" r="9" fill="url(#skin-${id})"/><circle cx="157" cy="143" r="9" fill="url(#skin-${id})"/>
  </g>
  ${phone?'<g class="phone-prop"><rect x="94" y="215" width="27" height="45" rx="6" fill="#30243f" stroke="#dfacd6" stroke-width="3"/><rect x="99" y="220" width="17" height="29" rx="2" fill="#9aaad2"/><circle cx="107" cy="254" r="2" fill="#f8d9d8"/></g>':''}
  </svg>`;
}
function actor(person,classes='',phone=false){return `<div class="actor ${person} bob ${classes}" id="${person}-actor">${characterSVG(person,phone)}</div>`;}
function starfield(count=23){return `<div class="sky-elements">${Array.from({length:count},(_,i)=>`<i class="star" style="--x:${((i*41+13)%94)+2}%;--y:${((i*29+7)%66)+4}%;--s:${i%4?2:4}px;--d:${2+i%4}s;--delay:-${(i%7)*.6}s"></i>`).join('')}</div>`;}
function sparkleSet(count=18){return `<div class="sparkles">${Array.from({length:count},(_,i)=>`<span class="sparkle" style="--x:${(i*47+11)%100}%;--y:${(i*31+7)%82}%;--s:${9+(i%4)*4}px;--d:${2+(i%5)}s;--delay:-${i*.37}s">✦</span>`).join('')}</div>`;}
function clouds(){return `<div class="sky-cloud" style="--x:6%;--y:20%"></div><div class="sky-cloud" style="--x:65%;--y:10%;--delay:-4s;transform:scale(.7)"></div>`;}
function hills(){return `<div class="horizon-glow"></div><div class="hill-back"></div><div class="hill-front"></div>`;}
function flowerBed(){return Array.from({length:25},(_,i)=>`<span class="flower" style="--x:${(i*37)%98}%;--y:${4+(i*11)%19}%;--s:${11+(i%4)*5}px;--delay:-${i*.3}s">${i%5===0?'✿':i%3===0?'✾':'❀'}</span>`).join('');}
function lanterns(){return `<div class="lantern" style="--x:13%;--h:27%"></div><div class="lantern" style="--x:85%;--h:20%"></div><div class="lantern" style="--x:70%;--h:12%"></div>`;}
function makeSet(type){
  let landscape='';let actors='';let effects='';
  switch(type){
    case 'prologue': landscape=`<div class="moon-disk"></div>${starfield(44)}${hills()}<div class="connection"></div>`; actors=actor('saif','far-left small')+actor('ariana','far-right small');effects=sparkleSet(18);break;
    case 'worlds': landscape=`<div class="sun-disk"></div><div class="moon-disk"></div><div class="desert-hills"></div><div class="morocco-silhouette"></div><div class="swiss-mountains"></div><div class="snowcaps"></div><div class="swiss-meadow"></div><div class="split-line"></div>${clouds()}<div class="split-label">🇲🇦 &nbsp; MOROCCO</div><div class="split-label right">🇨🇭 &nbsp; SWITZERLAND</div>`;actors=actor('saif','far-left small')+actor('ariana','far-right small');effects=sparkleSet(12);break;
    case 'messages':landscape=`<div class="room-window left"><span class="window-moon"></span><span class="window-hill"></span></div><div class="room-window right"><span class="window-moon"></span><span class="window-hill"></span><span class="window-star">✧</span></div><div class="split-line"></div><div class="room-floor"></div><span class="floating-text" style="--x:34%;--y:40%;--duration:6s;--delay:0s">♡</span><span class="floating-text" style="--x:54%;--y:27%;--duration:5s;--delay:1s">Hello! ♡</span><span class="floating-text" style="--x:46%;--y:46%;--duration:7s;--delay:2s">💌</span>`;actors=actor('saif','far-left',true)+actor('ariana','far-right',true);effects=sparkleSet(14);break;
    case 'first':landscape=`${hills()}<div class="sunset-arc"></div>${clouds()}<div class="tree" style="--x:11%;--scale:1.1"></div><div class="tree" style="--x:89%;--scale:.8"></div>${flowerBed()}`;actors=actor('saif','left-mid enter-left')+actor('ariana','right-mid enter-right');effects=sparkleSet(16)+'<span class="heart-emerge">♥</span>';break;
    case 'second':landscape=`${starfield(29)}${hills()}<div class="moon-disk" style="left:44%;right:auto;top:8%"></div><div class="tree" style="--x:12%"></div><div class="tree" style="--x:90%;--scale:.8"></div>${lanterns()}${flowerBed()}`;actors=actor('saif','center-left')+actor('ariana','center-right');effects=sparkleSet(20)+'<span class="heart-emerge">♥</span>';break;
    case 'nikah':landscape=`<div class="arch"></div><div class="carpet"></div>${lanterns()}<div class="bokeh"></div>`;actors=actor('saif','center-left')+actor('ariana','center-right');effects=sparkleSet(33)+'<span class="heart-emerge">♥</span>';break;
    case 'wife':landscape=`<div class="room-window left" style="width:25%;left:12%"><span class="window-moon"></span><span class="window-hill"></span></div><div class="room-window right" style="width:25%;right:12%"><span class="window-moon"></span><span class="window-hill"></span></div><div class="split-line"></div><div class="connection"></div><div class="room-floor"></div>`;actors=actor('saif','far-left')+actor('ariana','far-right');effects=sparkleSet(22);break;
    case 'forever':landscape=`${starfield(37)}<div class="moon-disk" style="left:9%;top:13%;width:9%"></div>${hills()}<div class="tiny-home"></div><div class="tree" style="--x:9%"></div><div class="tree" style="--x:90%;--scale:.7"></div>${flowerBed()}`;actors=actor('saif','very-close-left')+actor('ariana','very-close-right');effects=sparkleSet(32)+'<span class="heart-emerge">♥</span>';break;
  }
  return `<div class="scene-visual scene-${type}"><div class="scenery">${landscape}</div>${effects}${actors}</div>`;
}

function getSceneAt(ms){let i=screenplay.findIndex(s=>ms<s.end);return i===-1?screenplay.length-1:i;}
function cueFor(scene,local){let i=-1;for(let k=0;k<scene.cues.length;k++){if(local>=scene.cues[k].start) i=k;else break;}return i;}
function formatTime(ms){const sec=Math.floor(ms/1000);return String(Math.floor(sec/60)).padStart(2,'0')+':'+String(sec%60).padStart(2,'0');}
function updateTimeUI(){dom.timeline.value=Math.floor(state.position/totalMs*1000);dom.timeline.style.setProperty('--played',`${state.position/totalMs*100}%`);dom.timecode.textContent=`${formatTime(state.position)} / ${formatTime(totalMs)}`;}
function renderScene(index){const scene=screenplay[index];state.scene=index;state.cue=-10;dom.sceneHost.innerHTML=makeSet(scene.set);dom.sceneBadge.textContent=index===0?'PROLOGUE':`CHAPTER ${String(index).padStart(2,'0')} / 07`;dom.sceneLocation.textContent=scene.place;dom.chapterHeading.innerHTML=`<span class="chapter-num">${scene.tag}</span><h2>${scene.breakTitle}</h2>`;dom.chapterHeading.classList.remove('pop');void dom.chapterHeading.offsetWidth;dom.chapterHeading.classList.add('pop');}
function renderCue(cueIndex,sceneIndex){
  state.cue=cueIndex;const scene=screenplay[sceneIndex];const cue=scene.cues[cueIndex];
  // As the conversation grows, the couple literally moves closer together.
  // It is intentionally subtle and stays within the scenic composition.
  if((scene.set==='first'||scene.set==='second'||scene.set==='nikah')&&cueIndex>=2){
    const boy=document.getElementById('saif-actor'),girl=document.getElementById('ariana-actor');
    for(const a of [boy,girl]) a?.classList.remove('left-mid','right-mid','center-left','center-right');
    boy?.classList.add(cueIndex>=4?'very-close-left':'center-left');
    girl?.classList.add(cueIndex>=4?'very-close-right':'center-right');
  }

  for(const p of ['saif','ariana']) document.getElementById(`${p}-actor`)?.classList.toggle('speaking',!!cue&&cue.role===p);
  dom.spokenText.classList.remove('new-line');void dom.spokenText.offsetWidth;
  dom.speechLayer.innerHTML='';
  if(!cue){dom.speaker.textContent='';dom.spokenText.textContent='';return;}
  const label=cue.role==='saif'?'SAIFEDDINE':cue.role==='ariana'?'ARIANA':'NARRATOR';
  dom.speaker.className='speaker '+cue.role;dom.speaker.textContent=label;
  dom.spokenText.textContent=cue.text;dom.spokenText.classList.add('new-line');
  if(cue.role!=='narrator'){const bubble=document.createElement('div');bubble.className='bubble '+cue.role;bubble.textContent=cue.text.length>68?cue.text.slice(0,65)+'…':cue.text;dom.speechLayer.appendChild(bubble);}
  if(state.playing) speak(cue);
}
function renderFrame(){
  if(!state.started)return;
  if(state.position>=totalMs){finish();return;}
  const idx=getSceneAt(state.position);
  if(idx!==state.scene) renderScene(idx);
  const scene=screenplay[idx],local=state.position-scene.start;
  const cue=cueFor(scene,local);
  if(cue!==state.cue){cancelVoice();renderCue(cue,idx);}
  dom.chapterHeading.style.opacity=local>5200?'.0':'1';
  updateTimeUI();
}
let voiceList=[];
function refreshVoices(){if('speechSynthesis' in window)voiceList=window.speechSynthesis.getVoices().filter(v=>/^en[-_]/i.test(v.lang));}
if('speechSynthesis' in window){refreshVoices();window.speechSynthesis.addEventListener?.('voiceschanged',refreshVoices);}
function preferredVoice(role){
  const picks=role==='ariana'?['samantha','zira','aria','jenny','victoria','karen','female']:role==='saif'?['daniel','david','guy','george','male']:['alex','en-us','english'];
  return picks.map(hint=>voiceList.find(v=>v.name.toLowerCase().includes(hint))).find(Boolean)||voiceList[role==='ariana'?1:0]||voiceList[0];
}
function cancelVoice(){try{window.speechSynthesis?.cancel();}catch(e){}}
function speak(cue){if(!state.voice||!('speechSynthesis' in window))return;try{const utterance=new SpeechSynthesisUtterance(cue.text.replace(/🇲🇦/g,'').replace(/🇨🇭/g,'').replace(/♡/g,'love'));utterance.lang='en-US';utterance.rate=cue.role==='narrator'?.88:.93;utterance.pitch=cue.role==='ariana'?1.25:cue.role==='saif'?.91:1.02;utterance.volume=.95;const voice=preferredVoice(cue.role);if(voice)utterance.voice=voice;window.speechSynthesis.speak(utterance);}catch(e){console.warn('Speech not available:',e);}}

// An optional original, quiet, synthesized ambient soundtrack (no third-party/copyrighted recording).
let ctx=null,musicTimer=null,musicTick=0;
function musicNote(midi,start,duration=1){if(!ctx)return;const osc=ctx.createOscillator(),gain=ctx.createGain();osc.type='sine';osc.frequency.value=440*Math.pow(2,(midi-69)/12);osc.connect(gain);gain.connect(ctx.destination);gain.gain.setValueAtTime(.0001,start);gain.gain.exponentialRampToValueAtTime(.022,start+.055);gain.gain.exponentialRampToValueAtTime(.0001,start+duration);osc.start(start);osc.stop(start+duration+.04);}
const tune=[60,64,67,72,67,64,59,62,67,71,67,62,57,60,64,69,64,60,55,59,62,67,62,59];
function startMusic(){if(!state.playing||!state.music)return;try{const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;if(!ctx)ctx=new AC();if(ctx.state==='suspended')ctx.resume();if(musicTimer)return;musicTimer=setInterval(()=>{const midi=tune[(musicTick++)%tune.length];musicNote(midi,ctx.currentTime+.025,.85);if(musicTick%4===0)musicNote(midi-12,ctx.currentTime+.025,1.45);},490);}catch(e){console.warn('Ambient soundtrack unavailable',e);}}
function stopMusic(){if(musicTimer){clearInterval(musicTimer);musicTimer=null;}}

function tick(now){state.frame=requestAnimationFrame(tick);if(!state.playing){state.lastFrame=now;return;}if(!state.lastFrame)state.lastFrame=now;state.position+=Math.min(now-state.lastFrame,120);state.lastFrame=now;renderFrame();}
function start(){
  dom.opening.classList.add('hidden');dom.ending.classList.add('hidden');dom.subtitles.style.display='flex';dom.chapterHeading.style.display='';state.started=true;state.finished=false;state.position=0;state.scene=-1;state.cue=-1;renderFrame();play();}
function play(){if(!state.started){start();return;}if(state.finished){start();return;}if(state.playing)return;state.playing=true;dom.playButton.textContent='Ⅱ';dom.centerPlay.classList.add('hidden');state.lastFrame=performance.now();startMusic();if(state.cue>=0)speak(screenplay[state.scene].cues[state.cue]);}
function pause(){state.playing=false;dom.playButton.textContent='▶';cancelVoice();stopMusic();if(state.started&&!state.finished)dom.centerPlay.classList.remove('hidden');}
function finish(){state.position=totalMs;state.finished=true;state.playing=false;state.scene=-1;dom.playButton.textContent='▶';dom.ending.classList.remove('hidden');dom.subtitles.style.display='none';dom.chapterHeading.style.display='none';dom.speechLayer.innerHTML='';dom.centerPlay.classList.add('hidden');cancelVoice();stopMusic();updateTimeUI();}
function seek(ms){
  const wasFinished=state.finished;
  state.position=Math.max(0,Math.min(totalMs-50,ms));state.finished=false;
  dom.ending.classList.add('hidden');dom.opening.classList.add('hidden');dom.subtitles.style.display='flex';dom.chapterHeading.style.display='';state.started=true;
  if(wasFinished)state.scene=-1;
  renderFrame();
}
function jumpByScene(dir){if(!state.started){start();return;}const i=getSceneAt(state.position);let target=i+dir;if(dir<0&&state.position>screenplay[i].start+2800)target=i;target=Math.max(0,Math.min(screenplay.length-1,target));seek(screenplay[target].start);}
function updateSettings(){dom.voiceText.textContent=state.voice?'Voices on':'Voices off';dom.musicText.textContent=state.music?'Music on':'Music off';dom.voiceButton.setAttribute('aria-pressed',String(state.voice));dom.musicButton.setAttribute('aria-pressed',String(state.music));}

// Hooks: cinematic buttons, keyboard shortcuts, timeline scrub, and fullscreen.
dom.beginButton.addEventListener('click',start);
dom.replayEnd.addEventListener('click',start);
dom.playButton.addEventListener('click',()=>state.playing?pause():play());
dom.screen.addEventListener('click',event=>{if(event.target.closest('button'))return;if(!state.started||state.finished)return;state.playing?pause():play();});
dom.prevButton.addEventListener('click',()=>jumpByScene(-1));
dom.nextButton.addEventListener('click',()=>jumpByScene(1));
dom.timeline.addEventListener('input',()=>{const wasPlaying=state.playing;if(wasPlaying)cancelVoice();seek(Number(dom.timeline.value)/1000*totalMs);});
dom.voiceButton.addEventListener('click',()=>{state.voice=!state.voice;cancelVoice();if(state.voice&&state.playing&&state.cue>=0)speak(screenplay[state.scene].cues[state.cue]);updateSettings();});
dom.musicButton.addEventListener('click',()=>{state.music=!state.music;if(state.music)startMusic();else stopMusic();updateSettings();});
dom.fullButton.addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await dom.screen.requestFullscreen();}catch(e){console.warn('Fullscreen unavailable',e);}});
document.addEventListener('keydown',event=>{if(event.target instanceof HTMLInputElement)return;if(event.code==='Space'){event.preventDefault();state.playing?pause():play();}else if(event.code==='ArrowRight'){event.preventDefault();jumpByScene(1);}else if(event.code==='ArrowLeft'){event.preventDefault();jumpByScene(-1);}else if(event.code==='KeyF'){dom.fullButton.click();}});
for(const s of screenplay){const marker=document.createElement('span');marker.style.left=`${s.start/totalMs*100}%`;dom.chapterMarkers.appendChild(marker);}
dom.opening.classList.remove('hidden');updateSettings();updateTimeUI();state.frame=requestAnimationFrame(tick);
