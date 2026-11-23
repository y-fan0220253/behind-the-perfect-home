/* Behind the Perfect Home / an offline-capable interactive research website.
   Room collages and level-three illustrations are supplied/redrawn visuals.
   Chinese and English on-site evidence text is paraphrased from the final evidence workbook, identified internally by Case/Evidence ID.
   All interpretations are explicitly attributed to the researcher; no fabricated metrics. */
(()=>{
'use strict';
const data=window.BTPH_CONTENT;
if(!data){document.body.textContent='Research content is missing.';return;}
const rooms={
 entrance:{name:'Entrance',alt:'Collaged Chinese apartment front door with a spring couplet',index:'01',art:'entrance.png'},
 living:{name:'Living room',alt:'Collaged living room with blue sofa, television, coffee table and window',index:'02',art:'living.png'},
 kitchen:{name:'Kitchen & dining',alt:'Collaged modern Chinese kitchen with grocery bags, cooking area and dining table',index:'03',art:'kitchen.png'},
 balcony:{name:'Balcony',alt:'Collaged balcony with washing machine and hanging clothes',index:'04',art:'balcony.png'},
 bedroom:{name:'Bedroom',alt:'Collaged bedroom with bed, wardrobe and baby crib',index:'05',art:'bedroom.png'}
};
const points={
 entrance:{objects:[],links:[{to:'living',x:54,y:73,glyph:'↗',label:'Enter the living room'}],portal:{x:55,y:48,w:20,h:60,to:'living'}},
 living:{objects:[{id:'C019',x:16,y:48,label:'The shoe cabinet'},{id:'C015',x:50,y:64,label:'The coffee table'}],links:[{to:'entrance',x:6,y:53,glyph:'←',label:'Entrance'},{to:'bedroom',x:24,y:26,glyph:'↖',label:'Bedroom'},{to:'balcony',x:66,y:30,glyph:'↗',label:'Balcony'},{to:'kitchen',x:94,y:70,glyph:'→',label:'Kitchen & dining'}]},
 kitchen:{objects:[{id:'C011',x:17,y:76,label:'The grocery bags'},{id:'C021',x:67,y:40,label:'The cooking pan'}],links:[{to:'living',x:5,y:69,glyph:'←',label:'Living room'},{to:'balcony',x:89,y:23,glyph:'↗',label:'Balcony'}]},
 balcony:{objects:[{id:'C024',x:37,y:60,label:'The washing machine'},{id:'C001',x:72,y:27,label:'The clothes rail'}],links:[{to:'living',x:91,y:69,glyph:'→',label:'Living room'},{to:'kitchen',x:7,y:50,glyph:'←',label:'Kitchen & dining'}]},
 bedroom:{objects:[{id:'C003',x:31,y:77,label:'The baby crib'}],links:[{to:'living',x:5,y:48,glyph:'←',label:'Living room'}]}
};
const $=id=>document.getElementById(id);
const el={scrollCue:$('reading-scroll-cue'),stage:$('room-stage'),move:$('room-move'),art:$('room-art'),obj:$('object-layer'),nav:$('path-layer'),note:$('entrance-note'),roomTag:$('room-tag'),experience:$('experience'),intro:$('intro'),introCopy:$('intro-copy'),enter:$('enter-house'),caseOverlay:$('case-overlay'),caseBackdrop:$('case-room-backdrop'),caseImg:$('case-image'),caseReading:$('case-reading'),caseLocation:$('case-location'),caseIdHead:$('case-id-head'),visualCounter:$('case-visual-counter'),stepPrev:$('step-prev'),stepNext:$('step-next'),nextLabel:$('next-label'),stepProgress:$('step-progress'),research:$('research-overlay'),archive:$('archive-grid'),toast:$('toast')};
const state={room:'entrance',caseId:null,step:0,entered:false,changing:false,lastFocus:null,aboutOpen:false,peekedCases:{},reactions:{}};
const publicCaseNumber=id=>String(data.archive.findIndex(x=>x.id===id)+1).padStart(2,'0');
const caseName=id=>data.cases[id]?.title||id;
const esc=s=>String(s??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const urlRoom=r=>`assets/rooms/${rooms[r].art}`;
const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let toastTimer;
function toast(msg){el.toast.textContent=msg;el.toast.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.toast.hidden=true,1700)}
function initIntro(){
 el.introCopy.replaceChildren();data.intro.paragraphs.forEach(p=>{let node=document.createElement('p');node.textContent=p;el.introCopy.append(node)});
 el.enter.addEventListener('click',()=>{
  el.intro.classList.add('dismissed');state.entered=true;el.enter.textContent='BACK TO THE HOUSE ↗';
  setTimeout(()=>{el.intro.setAttribute('aria-hidden','true');$('brand').focus({preventScroll:true})},reduceMotion?10:800);
 });
 $('read-note').addEventListener('click',()=>{el.intro.removeAttribute('aria-hidden');el.intro.classList.remove('dismissed');el.enter.focus()});
}
function fitPoint(x,y){
 // Original room collage dimensions (all five room images): 2048×1280, object-fit cover on desktop.
 const w=el.stage.clientWidth,h=el.stage.clientHeight,nw=2048,nh=1280;
 const fit=window.innerWidth<680?'contain':'cover';
 const scale=fit==='cover'?Math.max(w/nw,h/nh):Math.min(w/nw,h/nh);
 return {left:((w-nw*scale)/2+x/100*nw*scale)+'px',top:((h-nh*scale)/2+y/100*nh*scale)+'px'};
}
function place(elem,x,y){const p=fitPoint(x,y);elem.style.left=p.left;elem.style.top=p.top}
function renderPoints(){
 const p=points[state.room];el.obj.replaceChildren();el.nav.replaceChildren();
 if(p.portal){const port=document.createElement('button');port.type='button';port.className='portal-hit';port.setAttribute('aria-label','Open the front door to the living room');port.title='Open the front door';port.style.position='absolute';port.style.border='0';port.style.background='transparent';port.style.pointerEvents='auto';port.style.cursor='pointer';port.style.zIndex='2';port.style.width='16%';port.style.height='52%';port.style.transform='translate(-50%,-50%)';place(port,p.portal.x,p.portal.y);port.addEventListener('click',()=>navigate(p.portal.to));el.obj.append(port)}
 p.objects.forEach(obj=>{
  const b=document.createElement('button');b.type='button';b.className='object-hotspot';b.setAttribute('aria-label',`Look closer: ${obj.label}`);b.innerHTML=`<span class="object-tooltip">${esc(obj.label)}</span>`;place(b,obj.x,obj.y);b.dataset.x=obj.x;b.dataset.y=obj.y;b.addEventListener('click',()=>openCase(obj.id,b));el.obj.append(b);
 });
 p.links.forEach((link,i)=>{
  let b=document.createElement('button');b.type='button';b.className='nav-arrow';b.setAttribute('aria-label',`Go to ${rooms[link.to].name}`);b.innerHTML=`<span class="nav-glyph" aria-hidden="true">${esc(link.glyph)}</span><span class="nav-tooltip" aria-hidden="true">${esc(link.label)}</span>`;place(b,link.x,link.y);b.dataset.x=link.x;b.dataset.y=link.y;b.addEventListener('click',()=>navigate(link.to));el.nav.append(b);
 });
 el.note.hidden=state.room!=='entrance';
}
function navigate(room,{instant=false}={}){
 if(!rooms[room]||state.changing)return;
 if(state.caseId)closeCase({restoreFocus:false});
 if(state.aboutOpen)closeResearch();
 const apply=()=>{
  state.room=room;el.art.src=urlRoom(room);el.art.alt=rooms[room].alt;
  el.experience.style.setProperty('--room-image',`url('${urlRoom(room)}')`);
  el.roomTag.innerHTML=`${esc(rooms[room].name).toUpperCase()} <span>${rooms[room].index} / 05</span>`;
  el.stage.setAttribute('aria-label',`${rooms[room].name} — click objects and follow arrows`);
  renderPoints();
  el.move.classList.remove('changing');state.changing=false;
 };
 if(instant){apply();return;}
 state.changing=true;el.move.classList.add('changing');setTimeout(apply,reduceMotion?0:300);
}
function onResize(){renderPoints()}
window.addEventListener('resize',onResize);
if(window.matchMedia('(pointer:fine)').matches&&!reduceMotion){
 el.stage.addEventListener('pointermove',e=>{
  if(state.caseId||state.aboutOpen)return;
  const px=(e.clientX/window.innerWidth-.5)*-15,py=(e.clientY/window.innerHeight-.5)*-11;
  el.move.style.setProperty('--mx',`${px.toFixed(1)}px`);el.move.style.setProperty('--my',`${py.toFixed(1)}px`);
 });
 el.stage.addEventListener('pointerleave',()=>{el.move.style.setProperty('--mx','0px');el.move.style.setProperty('--my','0px')});
}
function evidenceHTML(e,{compact=false}={}){
 const role=e.type==='Reader comment'?'Someone in the comments':(e.type==='Creator reply'?'The creator replies':e.type==='Creator caption'?'From the caption':e.type==='On-screen text'?'Words on screen':e.type==='Character dialogue (staged)'?'In the sketch':e.type);
 if(compact){return `<article class="comment-card"><p class="comment-who"><span class="comment-avatar" aria-hidden="true">${e.type==='Creator reply'?'✿':'♡'}</span> ${esc(role)}</p><p class="comment-zh" lang="zh-Hans">${esc(e.zh)}</p>${e.en?`<p class="comment-en">${esc(e.en)}</p>`:''}</article>`}
 return `<div class="quote-clip"><div class="quote-source">${esc(role)}</div><p class="quote-cn" lang="zh-Hans">${esc(e.zh)}</p>${e.en?`<p class="quote-en">${esc(e.en)}</p>`:''}</div>`;
}
function stageHTML(c,stage){
 const selected=state.peekedCases?.[c.id]||false;
 if(stage===0){
  return `<div class="story-overline">A LITTLE STORY FROM ${esc(rooms[c.room].name.toUpperCase())} <span class="story-asterisk">✳</span></div>
   <h2 class="case-title" id="case-title">${esc(c.title)}</h2>
   <p class="story-big-line">${esc(c.first)}</p>
   <p class="story-pencilled">${esc(c.tease)}</p>
   <div class="peel-zone">
    <button type="button" class="peel-note ${selected?'turned':''}" data-peek aria-expanded="${selected}"><span class="peel-burst" aria-hidden="true">✺</span><span><b>${selected?'That little detail':'Look a little closer'}</b><small>${selected?'TAP TO FOLD AWAY ↶':'TAP TO TURN OVER ↷'}</small></span><span class="peel-corner" aria-hidden="true">↗</span></button>
    <div class="peel-reveal" ${selected?'':'hidden'}>${esc(c.friendlyReading||c.lens)}</div>
   </div>
   <p class="story-whisper">There’s more to this picture than meets the eye. <span aria-hidden="true">↗</span></p>`;
 }
 if(stage===1){
  return `<div class="story-overline">THE WORDS BEHIND THE PICTURE <span class="story-asterisk">✳</span></div>
   <h2 class="case-title" id="case-title">What they shared<span class="tiny-pink-period">.</span></h2>
   <div class="source-postcards">${c.main.map(e=>evidenceHTML(e)).join('')}</div>
   `;
 }
 const follow=c.follow.filter(e=>!c.comments.some(x=>x.id===e.id));
 const comments=[...c.comments,...follow.filter(e=>e.type==='Creator reply')];
 const commentary=comments.length?`<div class="comment-heading">OVERHEARD IN THE COMMENTS <span aria-hidden="true">✳</span></div><div class="comment-list">${comments.map(e=>evidenceHTML(e,{compact:true})).join('')}</div>`:`<div class="no-comments">No comments are included for this story. Sometimes the picture is all we have.</div>`;
 const other=follow.filter(e=>e.type!=='Creator reply');
 const otherBlock=other.length?`<div class="quote-stack side-quote">${other.map(e=>evidenceHTML(e)).join('')}</div>`:'';
 const insight=`<div class="margin-notes"><div class="margin-note"><span>✎ A NOTE FROM ME</span><p>${esc(c.friendlyReading||c.lens)}</p></div><div class="margin-note counter"><span>↝ AND ANOTHER WAY TO SEE IT</span><p>${esc(c.friendlyOther||c.alternative)}</p></div></div>`;
 return `<div class="story-overline">THE CONVERSATION CONTINUES <span class="story-asterisk">✳</span></div><h2 class="case-title" id="case-title">Everyone has something to say<span class="tiny-pink-period">.</span></h2>
 ${commentary}${otherBlock}${insight}${c.comp?`<button type="button" class="comparison-btn" data-compare="${esc(c.comp)}"><span>✳</span> FOLLOW ANOTHER LITTLE STORY <span aria-hidden="true">↗</span><small>${esc(c.compText)}</small></button>`:''}`;
}
function updateCase(){
 const c=data.cases[state.caseId];if(!c)return;
 const imgIndex=c.images.length>1?Math.min(state.step,c.images.length-1):0;
 el.caseImg.style.opacity='0.6';
 el.caseImg.src=c.images[imgIndex];el.caseImg.alt=`Illustrated reconstruction: ${c.first}`;
 el.caseImg.onload=()=>{el.caseImg.style.opacity='1'};
 el.visualCounter.textContent=`${String(imgIndex+1).padStart(2,'0')} / ${String(c.images.length).padStart(2,'0')}`;
 el.caseLocation.textContent=rooms[c.room].name.toUpperCase();el.caseIdHead.textContent='STORY '+publicCaseNumber(c.id);
 $('floating-insight').innerHTML=state.step===0?`${esc(c.sticker||'TAKE A LOOK')} <span>✳</span>`:state.step===1?'FROM THE POSTS <span>✳</span>':'THE COMMENT CORNER <span>✳</span>';
 syncReactions();
 el.caseReading.dataset.step=String(state.step);el.caseReading.closest('.case-main').classList.toggle('cover-view',state.step===0);
 el.caseReading.innerHTML=stageHTML(c,state.step);
 el.caseReading.scrollTop=0;
 requestAnimationFrame(updateScrollCue);
 el.stepProgress.replaceChildren();
 for(let i=0;i<3;i++){
  const b=document.createElement('button');b.type='button';b.className='step-pip'+(state.step===i?' selected':'');b.setAttribute('aria-label',`Go to step ${i+1} of 3`);b.setAttribute('aria-current',state.step===i?'step':'false');b.addEventListener('click',()=>{state.step=i;updateCase()});el.stepProgress.append(b);
 }
 el.stepPrev.querySelector('span:last-child').textContent=state.step===0?'BACK TO ROOM':'PREVIOUS';
 el.nextLabel.textContent=['READ THE POST','SEE COMMENTS','BACK TO ROOM'][state.step];
 el.stepNext.setAttribute('aria-label',el.nextLabel.textContent);
 const peek=el.caseReading.querySelector('[data-peek]');if(peek)peek.addEventListener('click',()=>{state.peekedCases[c.id]=!state.peekedCases[c.id];const wasOn=state.peekedCases[c.id];peek.classList.toggle('turned',wasOn);peek.setAttribute('aria-expanded',String(wasOn));peek.querySelector('b').textContent=wasOn?'That little detail':'Look a little closer';peek.querySelector('small').textContent=wasOn?'TAP TO FOLD AWAY ↶':'TAP TO TURN OVER ↷';el.caseReading.querySelector('.peel-reveal').hidden=!wasOn;requestAnimationFrame(updateScrollCue)});
 el.caseReading.querySelectorAll('[data-compare]').forEach(b=>b.addEventListener('click',()=>{
  const id=b.getAttribute('data-compare');if(!data.cases[id])return;
  if(data.cases[id].room!==state.room){state.room=data.cases[id].room;el.art.src=urlRoom(state.room);el.experience.style.setProperty('--room-image',`url('${urlRoom(state.room)}')`);el.roomTag.innerHTML=`${esc(rooms[state.room].name).toUpperCase()} <span>${rooms[state.room].index} / 05</span>`;renderPoints()}
  openCase(id,undefined,true);
 }));
}
function updateScrollCue(){
 const t=el.caseReading,hidden=t.dataset.step==='0' || t.scrollHeight <= t.clientHeight + 9 || t.scrollTop + t.clientHeight >= t.scrollHeight-7;
 el.scrollCue.hidden=hidden;
}
el.caseReading.addEventListener('scroll',updateScrollCue,{passive:true});
function openCase(id,source,fromCompare=false){
 if(!data.cases[id])return;
 if(!fromCompare)state.lastFocus=source||document.activeElement;
 state.reactions[id]??={like:false,save:false};
 state.caseId=id;state.step=0;
 const c=data.cases[id];
 if(c.room!==state.room){state.room=c.room;el.art.src=urlRoom(c.room);el.experience.style.setProperty('--room-image',`url('${urlRoom(c.room)}')`);el.roomTag.innerHTML=`${esc(rooms[c.room].name).toUpperCase()} <span>${rooms[c.room].index} / 05</span>`;renderPoints()}
 el.caseBackdrop.style.backgroundImage=`url('${urlRoom(c.room)}')`;
 el.caseOverlay.hidden=false;
 updateCase();
 document.body.classList.add('in-case');
 $('case-close').focus({preventScroll:true});
}
function closeCase({restoreFocus=true}={}){
 if(!state.caseId)return;
 state.caseId=null;el.caseOverlay.hidden=true;document.body.classList.remove('in-case');
 if(restoreFocus){const f=state.lastFocus&&state.lastFocus.isConnected?state.lastFocus:$('brand');f.focus({preventScroll:true})}
}
$('case-close').addEventListener('click',()=>closeCase());
el.stepPrev.addEventListener('click',()=>{
 if(!state.caseId)return;
 if(state.step===0){closeCase();return}
 state.step--;updateCase();
});
el.stepNext.addEventListener('click',()=>{
 if(!state.caseId)return;
 if(state.step===2){closeCase();return}
 state.step++;updateCase();
});
function syncReactions(){
 const r=state.reactions[state.caseId]||{};
 const like=$('reaction-like'),save=$('reaction-save');
 like.classList.toggle('is-selected',!!r.like);save.classList.toggle('is-selected',!!r.save);
 like.setAttribute('aria-pressed',String(!!r.like));save.setAttribute('aria-pressed',String(!!r.save));
 like.querySelector('span').textContent=r.like?'♥':'♡';save.querySelector('span').textContent=r.save?'★':'☆';
}
$('reaction-like').addEventListener('click',()=>{const r=state.reactions[state.caseId];if(!r)return;r.like=!r.like;syncReactions();toast(r.like?'A little heart for this scene ♡':'Heart removed.');});
$('reaction-save').addEventListener('click',()=>{const r=state.reactions[state.caseId];if(!r)return;r.save=!r.save;syncReactions();toast(r.save?'Saved for this little visit ★':'Save removed.');});
$('reaction-discuss').addEventListener('click',()=>{if(!state.caseId)return;state.step=2;updateCase();el.caseReading.focus({preventScroll:true});});
function initResearch(){
 const archive=data.archive;
 el.archive.innerHTML=archive.map(x=>{
  const label=x.featured?'COME INSIDE ↗':'FROM THE 24 POSTS';
  return `<${x.featured?'button':'div'} ${x.featured?'type="button"':''} class="archive-item ${x.featured?'featured':''}" ${x.featured?`data-open-case="${esc(x.id)}"`:''}><div class="archive-meta">POST ${publicCaseNumber(x.id)} · ${label}</div><div class="archive-theme" lang="en">${esc(x.theme)}</div></${x.featured?'button':'div'}>`
 }).join('');
 el.archive.querySelectorAll('[data-open-case]').forEach(b=>b.addEventListener('click',()=>{
  const id=b.getAttribute('data-open-case');closeResearch();openCase(id,$('open-research'));
 }));
 $('open-research').addEventListener('click',openResearch);
 $('close-research').addEventListener('click',closeResearch);
 $('research-shade').addEventListener('click',closeResearch);
}
function openResearch(){
 if(state.caseId)closeCase({restoreFocus:false});
 state.aboutOpen=true;el.research.hidden=false;$('close-research').focus({preventScroll:true});
}
function closeResearch(){state.aboutOpen=false;el.research.hidden=true;$('open-research').focus({preventScroll:true})}
$('brand').addEventListener('click',()=>navigate('entrance'));
document.addEventListener('keydown',e=>{
 if(e.key==='Escape'){
  if(state.aboutOpen){closeResearch();e.preventDefault()}
  else if(state.caseId){closeCase();e.preventDefault()}
  else if(!el.intro.classList.contains('dismissed')){el.intro.classList.add('dismissed');state.entered=true;e.preventDefault()}
  else if(state.room!=='entrance'){navigate('entrance');e.preventDefault()}
 }
 if(!state.caseId||['INPUT','TEXTAREA'].includes(document.activeElement?.tagName))return;
 if(e.key==='ArrowRight'&&state.step<2){state.step++;updateCase();e.preventDefault()}
 if(e.key==='ArrowLeft'&&state.step>0){state.step--;updateCase();e.preventDefault()}
});
initIntro();initResearch();navigate('entrance',{instant:true});
})();
