/* BE YOU — WORKING LOCAL-FIRST PWA
   No dependencies, no API, no analytics, no account. Your writing stays in this browser.
   Data is stored in localStorage and can be exported/deleted in Settings. */
'use strict';
const STORAGE_KEY='beyou-v1-local-data';
const defaultData=()=>({version:1,onboarded:false,checkins:[],journal:[],journeys:{},favorites:[],settings:{light:false,reduceMotion:false,largeText:false}});
let data=(()=>{try {const saved=JSON.parse(localStorage.getItem(STORAGE_KEY));return saved&&saved.version===1?{...defaultData(),...saved,settings:{...defaultData().settings,...saved.settings}}:defaultData()}catch{return defaultData()}})();
let page='today',selectedMood='calm',selectedTags=[],moodEnergy=3,editingJournal=null,chosenJourney='letting-go',affirmationIndex=0,breathTimer=null,breathSecs=0,breathActive=false,toastTimeout=null,installEvent=null,journalSearch='';
const esc=t=>String(t??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const save=()=>{try{localStorage.setItem(STORAGE_KEY,JSON.stringify(data));return true}catch{notice('Storage unavailable. Export a copy of your data.');return false}};
const id=()=>globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const dateLong=(value=Date.now())=>new Date(value).toLocaleDateString(undefined,{weekday:'long',day:'numeric',month:'long'});
const fmtDate=value=>new Date(value).toLocaleDateString(undefined,{day:'numeric',month:'short',year:'numeric'});
const todayKey=()=>new Date().toLocaleDateString('en-CA');
const dateKey=t=>new Date(t).toLocaleDateString('en-CA');
const countToday=()=>data.checkins.filter(x=>dateKey(x.createdAt)===todayKey()).length;
const art=(name,alt='Manga illustration')=>`<img loading="eager" decoding="async" src="${artwork(name)}" alt="${esc(alt)}">`;
const pane=(title,back='today',body='',extra='')=>`${status()}<main class="content no-nav">${headerRow(title,back)}${body}</main>${extra}${homeind()}`;
const foot=(body,tab='today')=>`${status()}<main class="content">${body}</main>${nav(tab)}${homeind()}`;
const primary=(text,action,extra='')=>`<button class="primary" data-action="${action}" ${extra}>${text}</button>`;
const smallLink=(text,action)=>`<button class="text-link" data-action="${action}">${text}</button>`;
const shellTile=(name,title,journey)=>`<button class="story-tile" data-journey="${journey}"><span class="art">${art(name,'Illustration for '+title)}</span><span class="story-name">${title}</span></button>`;
const cardLink=(text,sub,screen,icon='arrow')=>`<button class="action-card" data-screen="${screen}"><span><strong>${text}</strong><small>${sub}</small></span><span class="tiny-circle">${ico(icon)}</span></button>`;
const moodDefs=[['happy','Good'],['calm','Calm'],['neutral','Okay'],['anxious','Anxious'],['sad','Low']];
const moodText=m=>moodDefs.find(x=>x[0]===m)?.[1]||'Unknown';

/* Screen 05 stays ONE interactive view with five separately approved
   portrait images. The rest of the 23-screen visual baseline stays unchanged. */
const moodStates=Object.freeze({
 happy:{summary:'Joyful · Energetic · Light',note:'A little brightness can mean a lot.',icon:'sun'},
 calm:{summary:'Peaceful · Grounded · Settled',note:'A quiet moment to feel at ease.',icon:'leaf'},
 neutral:{summary:'Neutral · Managing · In between',note:'Being somewhere in between is enough.',icon:'neutral'},
 anxious:{summary:'Tense · Overwhelmed · Uneasy',note:'You can take this one moment at a time.',icon:'anxious'},
 sad:{summary:'Tired · Heavy · Withdrawn',note:'You do not need to feel different right now.',icon:'sad'}
});
const moodPortraitRoles=Object.freeze({
 happy:'happy',calm:'calm',neutral:'neutral',anxious:'anxious',sad:'sad'
});
const moodPortraitSrc=m=>moodArtwork(moodPortraitRoles[m]||'calm');
const moodPortraitAlt=m=>({
 happy:'Illustrated woman with full dark hair smiling gently among blossoms.',
 calm:'Illustrated woman with full dark hair holding a warm mug, eyes peacefully closed.',
 neutral:'Illustrated woman with full dark hair writing in a notebook, feeling thoughtful.',
 anxious:'Illustrated woman with full dark hair and hands in her hair, feeling overwhelmed.',
 sad:'Illustrated woman with full dark hair resting beneath a blanket beside a sleeping cat.'
}[m]||'Illustrated woman with full dark hair in a peaceful pose.');
const moodChoiceIcon=m=>['happy','calm'].includes(m)?ico(moodStates[m].icon):moodFace(m);

const affirmationList=["I am proud of how far I’ve come, and excited for what’s next.","I can begin again without starting over.","I am allowed to grow at my own pace.","I can hold hard feelings with kindness.","My worth is not measured by my productivity.","Today, I can choose one small, gentle step."];
const journeys={
 'letting-go':{name:'Letting Go',sub:'Give yourself permission to move forward.',tag:'Release & renew',art:'journey-letting-go',description:'Make space for what matters by exploring what you are ready to release.',steps:[['What are you holding on to?','Write about a thought, person or situation that keeps weighing on you.'],['What did it mean to you?','Notice what mattered. There is no need to judge your feelings.'],['What could you loosen?','Name one expectation, worry or burden you may be ready to carry more lightly.'],['An unsent goodbye','Write a few words of closure to yourself, even if nothing outside has changed.']]},
 'unsent-letter':{name:'Unsent Letter',sub:'Words that deserve somewhere to land.',tag:'Write & release',art:'journey-unsent',description:'Say what has been unsaid, without needing to send it.',steps:[['Who is this for?','Write a name, a feeling or even a part of yourself.'],['What do you wish they knew?','Let the honest words arrive without editing them.'],['What do you need?','Consider what would make this moment feel a little safer.'],['Your closing words','Finish in a way that feels true to you, whether it is gentle or unfinished.']]},
 'loneliness':{name:'Rethinking Loneliness',sub:'Find company in your own presence.',tag:'Connection & self-trust',art:'journey-loneliness',description:'Explore belonging, solitude and small moments of connection.',steps:[['When do you feel alone?','Describe a place, moment or pattern without assigning blame.'],['What do you miss?','Name something that would help you feel seen.'],['Where does connection live?','Recall a person, place, activity or moment that felt supportive.'],['One gentle connection','What is one small step you might take toward belonging?']]},
 'travel':{name:'Travel Journal',sub:'A little wonder, wherever you are.',tag:'Notice & discover',art:'journey-travel',description:'Travel through memories and places that make you feel more alive.',steps:[['Where would you wander?','Describe a place that calls to you, real or imagined.'],['A favourite memory','Revisit a moment that felt wonderfully present.'],['What makes you curious?','List the little details you want to notice more often.'],['A local adventure','Imagine a tiny adventure you could enjoy this week.']]}
};
const journeyProgress=j=>data.journeys[j]?.step??0;
const journeyPct=j=>Math.round(100*journeyProgress(j)/journeys[j].steps.length);
const _weekday=()=>new Date().toLocaleDateString(undefined,{weekday:'long'});
const _artLink=(name,title,route)=>`<button class="mini-jump" data-screen="${route}">${art(name,title)}<span>${title}</span>${ico('arrow')}</button>`;
const dataCountLabel=(a,singular,plural)=>`${a} ${a===1?singular:plural}`;
function notice(text){const n=document.getElementById('toast');n.textContent=text;n.classList.add('show');clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>n.classList.remove('show'),3300)}

/* One authoritative screen registry, including onboarding. No duplicate static mockups. */
const screens = {
  welcome:()=>`<section class="mock-onboarding mock-welcome">${status()}<div class="mock-welcome-art">${art('welcome-be-you','Woman resting among koi fish and blossoms')}</div><div class="mock-welcome-shade"></div><div class="mock-welcome-copy"><div class="mock-eyebrow">BE YOU · A SPACE OF YOUR OWN</div><h1>A little space<br>for you.</h1><p>Your feelings deserve somewhere to land.</p><button class="mock-cta" data-screen="onboard-notice">Begin gently ${ico('arrow')}</button></div></section>${homeind()}`,
  'onboard-notice':()=>`<section class="mock-onboarding mock-onboard-step">${status()}<div class="mock-onboard-content"><div class="mock-eyebrow">01 / 03 · A PLACE TO NOTICE</div><h1>Understand your<br>emotions.</h1><div class="mock-onboard-art">${art('welcome-notice','Quiet moment beside a window')}</div><p>Some days are complicated.<br>You can meet them with kindness.</p><div class="mock-onboard-dots" aria-label="Onboarding step 1 of 2">● <span>○ ○</span></div><button class="mock-cta" data-screen="onboard-grow">Continue ${ico('arrow')}</button></div></section>${homeind()}`,
  'onboard-grow':()=>`<section class="mock-onboarding mock-onboard-step">${status()}<div class="mock-onboard-content"><div class="mock-eyebrow">03 / 03 · WELCOME TO GROWTH</div><h1>Grow at your<br>own pace.</h1><div class="mock-onboard-art">${art('welcome-grow','Hopeful manga portrait with blossoms')}</div><p>Small reflections. Kinder habits.<br>One gentle day at a time.</p><div class="mock-onboard-dots" aria-label="Final onboarding step"><span>○ ○</span> ●</div><button class="mock-cta" data-screen="today">Enter my space ${ico('arrow')}</button></div></section>${homeind()}`
};
const moodButton=(key,label)=>`<button type="button" data-mood="${key}" aria-pressed="${selectedMood===key}" class="mooditem mood-v3-option ${selectedMood===key?'sel':''}"><span class="mood-v3-symbol" aria-hidden="true">${moodChoiceIcon(key)}</span><span class="mood-v3-label">${label}</span></button>`;
/* Main destinations */
screens.today=()=>foot(`<section class="mock-page mock-today"><div class="mock-eyebrow">YOUR SPACE · ${esc(_weekday().toUpperCase())}</div><h1>A little kinder,<br>today.</h1><p class="mock-lede">A small check-in can change your day.</p><button class="mock-cta mock-checkin" data-screen="mood"><span>${countToday()?'Take another moment':'How are you feeling?'}</span>${ico('arrow')}</button><div class="mock-eyebrow mock-section-cap">HEAL & GROW</div><button class="mock-feature" data-journey="travel">${art('journey-travel','Illustrated Travel Journal scene')}<span class="mock-feature-label"><strong>Travel Journal</strong><small>A little wonder, wherever you are.</small></span></button><button class="mock-line-link" data-journey="letting-go"><span>Letting Go</span>${ico('arrow')}</button><button class="mock-line-link mock-muted-link" data-screen="heal">Explore all journeys ${ico('arrow')}</button></section>`, 'today');
screens.home=()=>foot(`<section class="mock-page mock-home"><div class="mock-eyebrow">WELCOME TO BE YOU</div><h1>Your space<br>to begin.</h1><div class="mock-tall-art">${art('welcome-be-you','A thoughtful person with koi and blossoms')}</div><h2>What do you need today?</h2><button class="mock-line-link" data-screen="mood"><span>A quiet check-in <small>Notice how you feel</small></span>${ico('arrow')}</button><button class="mock-line-link" data-screen="journal"><span>Write a reflection <small>A page just for you</small></span>${ico('arrow')}</button><button class="mock-line-link" data-screen="heal"><span>Choose a gentle path <small>Explore your journeys</small></span>${ico('arrow')}</button></section>`, 'today');
screens.mood=()=>pane('Today','today',`<section class="mood-v2" data-selected-mood="${selectedMood}" aria-labelledby="mood-v2-title">
<div class="eyebrow">A MOMENT TO NOTICE</div>
<h1 id="mood-v2-title">How are you<br>feeling today?</h1>
<p class="mood-v2-lede">There is no right answer. Just yours.</p>
<div class="mood-v2-body">
<div class="mood-v2-art"><img id="mood-portrait" loading="eager" decoding="async" src="${moodPortraitSrc(selectedMood)}" alt="${moodPortraitAlt(selectedMood)}"></div>
<div class="mood-v2-picker">
<fieldset class="mood-v2-select">
<legend>Choose what feels closest</legend>
<div class="mood-v2-options mood-v3-options">${moodDefs.map(([key,label])=>moodButton(key,label)).join('')}</div>
</fieldset>
<div class="mood-v3-feedback" role="status" aria-live="polite" aria-atomic="true">
<strong id="mood-feeling-summary">${moodStates[selectedMood].summary}</strong>
<span id="mood-feeling-note">${moodStates[selectedMood].note}</span>
</div>
<button type="button" class="mood-v2-next mood-v3-next" data-screen="mood-details"><span>Continue</span>${ico('arrow')}</button>
<p class="mood-v2-hint">You can add a little context next.</p>
</div></div>
</section>`);
/* The previously working tags, energy, note and save flow continues here. */
/* Approved Screen 06 — mood details. Preserves actual check-in saving on this device. */
screens['mood-details']=()=>pane('Your check-in','mood',`<section class="mood-details-v2" aria-labelledby="mood-details-title">
 <div class="eyebrow">A LITTLE MORE ABOUT TODAY</div>
 <h1 id="mood-details-title">What's influencing<br>this?</h1>
 <p class="mood-details-lede">Every feeling has a story.</p>
 <div class="mood-details-hero">${art('portrait-affirm','Original BE YOU black-and-ivory manga portrait with cherry blossoms')}</div>
 <div class="mood-details-current" aria-label="Your selected mood">
   <span class="mood-details-selected-face" aria-hidden="true">${moodFace(selectedMood)}</span>
   <span><strong>${esc(moodText(selectedMood))}</strong><small>SELECTED FEELING</small></span>
   <button type="button" data-screen="mood" aria-label="Change selected mood">Change</button>
 </div>
 <fieldset class="mood-details-tags"><legend>What's on your mind? <small>(optional)</small></legend>
   <div class="mood-details-pills">${['Work','Relationships','Sleep','Health','Family','Money','Other'].map(t=>`<button type="button" class="pill ${selectedTags.includes(t)?'active':''}" data-tag="${t}" aria-pressed="${selectedTags.includes(t)}">${t}</button>`).join('')}</div>
 </fieldset>
 <label for="mood-energy" class="mood-details-caption">Energy today <small>(1—5)</small></label>
 <div class="mood-details-energy"><span>Low</span><input id="mood-energy" type="range" min="1" max="5" value="${moodEnergy}" aria-label="Energy today, one to five"><span>High</span></div>
 <label for="mood-note" class="mood-details-caption mood-details-note-label">Add a little context <small>(optional)</small></label>
 <textarea id="mood-note" class="mood-details-note" maxlength="4000" placeholder="What's on your mind?"></textarea>
 <div class="mood-details-actions">${primary('Save my check-in','save-mood')}</div>
 <p class="mood-details-privacy">${ico('lock')} Private on this device.</p>
 </section>`);
screens['mood-saved']=()=>pane('Your check-in','today',`<section class="mock-page mock-success"><div class="mock-eyebrow">A MOMENT FOR YOURSELF</div><h1>You made room<br>for yourself.</h1><div class="mock-tall-art">${art('welcome-grow','Hopeful manga portrait in sakura blossoms')}</div><h2>Thank you for noticing how you feel.</h2><p class="mock-lede">Every small moment matters.</p><button class="mock-cta" data-screen="today">Return to Today ${ico('arrow')}</button></section>`);
screens.journal=()=>foot(`<section class="mock-page mock-journal"><div class="mock-eyebrow">${data.journal.length?'YOUR REFLECTIONS':'A PRIVATE HOME FOR YOUR WORDS'}</div><h1>${data.journal.length?'Journal.':'Your journal.'}</h1><p class="mock-lede">${data.journal.length?'A place to keep what matters.':'Make room for what is on your mind.'}</p><div class="mock-journal-art">${art('journal-quiet','Illustration of a letter held close')}</div>${data.journal.length?`<button class="mock-cta" data-action="new-journal">+ New reflection ${ico('arrow')}</button><div class="mock-journal-history"><h2>Recent reflections</h2><label class="search search-box">${ico('search')}<input id="journal-search" type="search" aria-label="Search journal entries" placeholder="Search your thoughts…" value="${esc(journalSearch)}"></label><div id="journal-results">${journalRows()}</div></div>`:`<div class="mock-journal-empty"><h2>Your pages are waiting.</h2><p>Even one sentence is enough.</p><button class="mock-cta" data-action="new-journal">Write a new reflection ${ico('arrow')}</button></div>`}</section>`,'journal');
function journalRows(){const rows=[...data.journal].sort((a,b)=>b.updatedAt-a.updatedAt).filter(e=>(e.title+' '+e.body).toLowerCase().includes(journalSearch.toLowerCase()));return rows.length?rows.map(e=>`<button type="button" class="mock-reflection-row" data-view="${esc(e.id)}"><span><strong>${esc(e.title)}</strong><small>${esc(fmtDate(e.updatedAt))} · ${esc(e.body.slice(0,75))}</small></span>${ico('arrow')}</button>`).join(''):`<div class="mock-noresults">${journalSearch?'No matching reflections.':'Your pages are waiting.'}</div>`}
function hash(s){return Array.from(String(s)).reduce((a,c)=>((a*31+c.charCodeAt(0))|0),0)}
screens['journal-view']=()=>{const entry=data.journal.find(e=>e.id===editingJournal);if(!entry)return screens.journal();return pane('Your writing','journal',`<section class="mock-page mock-view"><div class="mock-eyebrow">YOUR WRITING · ${esc(fmtDate(entry.updatedAt).toUpperCase())}</div><h1>${esc(entry.title)}</h1><div class="mock-view-art">${art('portrait-reflect','Manga illustration of a quiet reflection')}</div><p class="mock-entry-body">${esc(entry.body).replace(/\n/g,'<br>')}</p><button class="mock-secondary" data-screen="journal-edit">Edit reflection ${ico('arrow')}</button></section>`)};
screens['journal-edit']=()=>{const entry=data.journal.find(e=>e.id===editingJournal);return pane(entry?'Edit reflection':'New reflection','journal',`<section class="mock-page mock-editor"><div class="mock-eyebrow">A LITTLE HONESTY</div><h1>${entry?'Your words.':'Just write.'}</h1><p class="mock-lede">No rules. No judgment.</p><div class="mock-editor-art">${art('journey-travel','A gentle moment for writing')}</div><label class="field-label" for="journal-title">Give it a title</label><input class="input-field" id="journal-title" maxlength="120" placeholder="Today I noticed…" value="${esc(entry?.title||'')}"><label class="field-label" for="journal-body">Your reflection</label><textarea class="textarea journal-area" id="journal-body" placeholder="Start anywhere. This space is yours." maxlength="40000">${esc(entry?.body||'')}</textarea><button class="mock-cta" data-action="save-journal">${entry?'Save changes':'Keep this reflection'} ${ico('arrow')}</button>${entry?`<button class="mock-text-action" data-action="delete-journal">Delete reflection</button>`:''}<p class="mock-privacy">${ico('lock')} Private on this device.</p></section>`)};
screens.heal=()=>foot(`<section class="mock-page mock-grow"><div class="mock-eyebrow">SMALL STEPS, YOUR PACE</div><h1>Heal & Grow.</h1><p class="mock-lede">Choose a gentle path forward.</p><div class="mock-grow-stack">${[['travel','Travel Journal','Notice and discover.'],['letting-go','Letting Go','Make space for what matters.'],['unsent-letter','Unsent Letter','Words you never have to send.'],['loneliness','Rethinking Loneliness','Find company in your own presence.']].map(([key,title,summary])=>`<button class="mock-grow-card" data-journey="${key}">${art(journeys[key].art,title+' illustration')}<span><strong>${title}</strong><small>${summary}</small></span></button>`).join('')}</div></section>`,'heal');
screens['journey-detail']=()=>{const j=journeys[chosenJourney];return foot(`<section class="mock-page mock-journey-detail"><div class="mock-eyebrow">${esc(j.tag.toUpperCase())}</div><h1>${esc(j.name)}.</h1><div class="mock-tall-art">${art(j.art,j.name+' illustration')}</div><h2>${esc(j.sub)}</h2><p class="mock-lede">${esc(j.description)}</p><div class="mock-eyebrow">${j.steps.length} STEPS · SAVE AS YOU GO</div><button class="mock-cta" data-action="begin-journey">${journeyProgress(chosenJourney)>=j.steps.length?'Begin again':journeyProgress(chosenJourney)?'Continue journey':'Start this journey'} ${ico('arrow')}</button><div class="mock-steps">${j.steps.map(([title],i)=>`<div><span>${String(i+1).padStart(2,'0')}</span><span>${esc(title)}</span>${i<journeyProgress(chosenJourney)?ico('check'):''}</div>`).join('')}</div></section>`,'heal')};
screens.exercise=()=>{const j=journeys[chosenJourney],p=Math.min(journeyProgress(chosenJourney),j.steps.length-1),step=j.steps[p],answer=data.journeys[chosenJourney]?.answers?.[p]||'';return pane(j.name,'journey-detail',`<section class="mock-page mock-exercise"><div class="mock-eyebrow">GUIDED REFLECTION · STEP ${p+1}/${j.steps.length}</div><h1>${esc(step[0])}</h1><div class="mock-exercise-art">${art(['journey-letting-go','journey-loneliness','portrait-reflect','flowers'][p],'Illustration for a reflective exercise')}</div><h2>Notice what feels heavy.</h2><p class="mock-lede">${esc(step[1])}</p><label class="sr-only" for="exercise-answer">Your private reflection</label><textarea class="textarea journal-area" id="exercise-answer" maxlength="12000" placeholder="Start with one sentence…">${esc(answer)}</textarea><button class="mock-cta" data-action="save-exercise">${p===j.steps.length-1?'Finish journey':'Save & continue'} ${ico('arrow')}</button><button class="mock-text-action" data-action="pause-journey">Pause for now</button></section>`)};
screens['journey-complete']=()=>pane('Your journey','heal',`<section class="mock-page mock-success"><div class="mock-eyebrow">A JOURNEY COMPLETED</div><h1>You showed up<br>for yourself.</h1><div class="mock-tall-art">${art('welcome-grow','Hopeful manga portrait')}</div><h2>That is something to be proud of.</h2><p class="mock-lede">Take this gentleness with you.</p><button class="mock-cta" data-screen="heal">Back to journeys ${ico('arrow')}</button></section>`);
screens.affirmations=()=>pane('A gentle reminder','today',`<section class="mock-page mock-affirmation"><div class="mock-eyebrow">A LITTLE KINDNESS</div><h1>Affirmations.</h1><div class="mock-tall-art">${art('portrait-reflect','Serene manga portrait')}</div><div class="mock-affirmation-note"><blockquote>“${esc(affirmationList[affirmationIndex])}”</blockquote></div><button class="mock-text-action" data-action="favorite">${ico('heart')} ${data.favorites.includes(affirmationIndex)?'Saved to your favourites':'Save this thought'}</button><button class="mock-cta" data-action="next-affirmation">Another gentle thought ${ico('arrow')}</button></section>`);
screens.breathe=()=>pane('Take a moment','today',`<section class="mock-page mock-breathe"><div class="mock-eyebrow">A MOMENT TO BREATHE</div><h1>Find your calm.</h1><p class="mock-lede">You can begin again, one breath at a time.</p><div class="mock-breathe-art">${art('exercise-breathe','Calming ink portrait')}<div class="breath-ring ${breathActive?'breathing':''}"><strong id="breath-label">${breathActive?'Breathe gently':'Breathe in'}</strong><span>4 seconds</span></div></div><p class="mock-lede">Breathe gently. There is no rush.</p><div id="breath-time" class="mock-breathe-timer">${Math.floor(breathSecs/60)}:${String(breathSecs%60).padStart(2,'0')}</div><button class="mock-cta" data-action="${breathActive?'pause-breath':'start-breath'}">${breathActive?'Pause breathing':'Start breathing'} ${ico('arrow')}</button></section>`);
function weekData(){const arr=[];const now=new Date();for(let d=6;d>=0;d--){const x=new Date(now.getFullYear(),now.getMonth(),now.getDate()-d);const key=dateKey(x.getTime());const rows=data.checkins.filter(m=>dateKey(m.createdAt)===key);arr.push({key,label:x.toLocaleDateString(undefined,{weekday:'short'}),entries:rows,avg:rows.length?rows.reduce((a,r)=>a+(moodDefs.findIndex(m=>m[0]===r.mood)+1),0)/rows.length:0})}return arr;}
screens.insights=()=>foot(`${headerRow('Your patterns','today')}<div class="eyebrow">PAST SEVEN DAYS</div><h1 class="page-title main-headline">Your insights.</h1><p class="body-copy muted-copy">A gentler way to see patterns in what you’ve recorded.</p><div class="insight-hero"><span class="eyebrow">YOUR RECORDINGS</span><strong>${data.checkins.length}</strong><span>check-ins in total</span></div><div class="section-heading"><div><h2>Mood moments</h2><p>Each bar is the number of check-ins that day.</p></div></div><div class="real-chart">${weekData().map(x=>`<div class="bar-col"><span class="bar-number">${x.entries.length||''}</span><span class="bar"><i style="height:${x.entries.length?Math.max(12,Math.min(100,x.entries.length*27)):3}%"></i></span><small>${esc(x.label)}</small></div>`).join('')}</div><div class="section-heading"><div><h2>What you've felt</h2></div></div><div class="breakdown">${moodDefs.map(([m,label])=>{const count=data.checkins.filter(x=>x.mood===m).length;const pct=data.checkins.length?Math.round(count/data.checkins.length*100):0;return `<div class="breakdown-row"><span>${label}</span><div class="mbar"><i style="width:${pct}%"></i></div><strong>${pct}%</strong></div>`}).join('')}</div><div class="insight-note">${ico('leaf')} There are no good or bad scores here. These are patterns in the information you entered, not diagnoses or explanations.</div>`, 'today');
screens.insights=()=>foot(`<section class="mock-page mock-insights"><div class="mock-eyebrow">REFLECTIONS OVER TIME</div><h1>Your insights.</h1><p class="mock-lede">A quiet look at your emotional patterns.</p><div class="mock-insights-art">${art('insights-reflection','Reflective manga illustration with koi')}</div><h2>Your week in feelings</h2><div class="real-chart">${weekData().map(x=>`<div class="bar-col"><span class="bar-number">${x.entries.length||''}</span><span class="bar"><i style="height:${x.entries.length?Math.max(12,Math.min(100,x.entries.length*27)):3}%"></i></span><small>${esc(x.label)}</small></div>`).join('')}</div><p class="mock-lede">${data.checkins.length} check-ins recorded. Every feeling belongs.</p><div class="breakdown">${moodDefs.map(([m,label])=>{const count=data.checkins.filter(x=>x.mood===m).length;const pct=data.checkins.length?Math.round(count/data.checkins.length*100):0;return `<div class="breakdown-row"><span>${label}</span><div class="mbar"><i style="width:${pct}%"></i></div><strong>${pct}%</strong></div>`}).join('')}</div><p class="mock-privacy">These patterns reflect only what you recorded, not a diagnosis.</p></section>`,'you');
screens.you=()=>foot(`<section class="mock-page mock-you"><div class="mock-eyebrow">A SPACE THAT IS YOURS</div><h1>Just be you.</h1><div class="mock-tall-art">${art('you-portrait','A manga portrait with sakura and koi')}</div><h2>Your little moments add up.</h2><div class="mock-stats"><button data-screen="insights"><strong>${data.checkins.length}</strong><small>Check-ins</small></button><button data-screen="journal"><strong>${data.journal.length}</strong><small>Reflections</small></button></div><div class="mock-you-links"><button class="mock-line-link" data-screen="settings">Settings & privacy ${ico('arrow')}</button><button class="mock-line-link" data-screen="affirmations">Gentle reminders ${ico('arrow')}</button><button class="mock-line-link" data-screen="breathe">Take a breath ${ico('arrow')}</button><button class="mock-line-link" data-screen="insights">Your insights ${ico('arrow')}</button><button class="mock-line-link" data-screen="home">Your home ${ico('arrow')}</button></div></section>`,'you');
screens.settings=()=>pane('Your choices','you',`<section class="mock-page mock-settings"><div class="mock-eyebrow">YOUR SPACE, YOUR CHOICES</div><h1>Settings.</h1><div class="mock-settings-art">${art('welcome-grow','Manga portrait looking to the light')}</div><h2>Make this space yours.</h2><div class="mock-settings-group"><div class="mock-eyebrow">APPEARANCE</div>${settingToggle('light','Light appearance','Use warm paper backgrounds')}${settingToggle('largeText','Larger text','Increase reading size')}${settingToggle('reduceMotion','Reduce motion','Limit breathing and UI animation')}</div><div class="mock-settings-group"><div class="mock-eyebrow">YOUR INFORMATION</div><button data-action="export" class="mock-line-link">Export backup ${ico('download')}</button><label class="mock-line-link mock-import">Import backup <input type="file" accept="application/json,.json" id="import-data" aria-label="Import your data">${ico('arrow')}</label><button data-action="delete-all" class="mock-line-link">Delete local data ${ico('arrow')}</button></div><div class="mock-settings-group"><div class="mock-eyebrow">ABOUT YOUR SPACE</div><button class="mock-line-link" data-screen="offline">Privacy & offline access ${ico('arrow')}</button><button class="mock-line-link" data-screen="install">Install BE YOU ${ico('arrow')}</button></div><p class="mock-privacy">Your writing is unencrypted on this device. Export regular backups; this isn't medical care.</p></section>`);
function settingToggle(key,text,sub){return `<button class="setting-row" data-setting="${key}" aria-pressed="${!!data.settings[key]}"><span><strong>${text}</strong><small>${sub}</small></span><span class="toggle ${data.settings[key]?'on':''}" aria-hidden="true"><i></i></span></button>`}
screens.offline=()=>pane('Your information','settings',`<section class="mock-page mock-offline"><div class="mock-eyebrow">YOU CAN BE HERE ANYTIME</div><h1>Still here<br>with you.</h1><div class="mock-tall-art">${art('welcome-notice','Woman quietly reflecting beside a window')}</div><h2>Even without a connection.</h2><p class="mock-lede">After the first online visit, cached pages can reopen offline. Your writing stays in this browser.</p><button class="mock-cta" data-screen="today">Return to Today ${ico('arrow')}</button><p class="mock-privacy">No automatic sync. Export backups before clearing browser storage.</p></section>`);
screens.install=()=>pane('Keep it close','settings',`<section class="mock-page mock-install"><div class="mock-eyebrow">A SMALL SPACE YOU CAN KEEP</div><h1>Take BE YOU<br>with you.</h1><div class="mock-tall-art">${art('welcome-grow','Hopeful manga portrait')}</div><h2>Add the app to your home screen.</h2><p class="mock-lede">Your writing remains on this device.</p><button class="mock-cta" data-action="install-app">Install BE YOU ${ico('arrow')}</button><p class="mock-privacy">If installation isn't available, use your browser's Add to Home Screen option.</p></section>`);
screens['exercise-next']=screens.exercise;
/* Navigation and interactions */
function go(target,replace=false){if(!screens[target])target='today';if(page==='breathe'&&target!=='breathe')pauseBreathe();page=target;const u=new URL(location.href);u.searchParams.set('screen',target);history[replace?'replaceState':'pushState']({screen:target},'',u.pathname+u.search);draw();}
function draw(){if(!screens[page])page='today';document.title=`Be You · ${page.replaceAll('-',' ')}`;document.getElementById('app').innerHTML=`<div class="device" data-page="${page}">${screens[page]()}</div>`;document.querySelectorAll('.status > span:first-child').forEach(n=>n.textContent=new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit',hour12:false}));document.querySelectorAll('.topstatus').forEach(n=>{if(n.firstChild)n.firstChild.textContent=new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit',hour12:false})+' ';});document.body.classList.toggle('theme-light',!!data.settings.light);document.body.classList.toggle('reduce-motion',!!data.settings.reduceMotion);document.body.classList.toggle('large-type',!!data.settings.largeText);const root=document.querySelector('.device');if(root)root.setAttribute('aria-label',`Be You ${page.replaceAll('-',' ')} screen`);}
function paintMoodSelection(){
 const panel=document.querySelector('.mood-v2');
 if(!panel)return;
 const state=moodStates[selectedMood];
 panel.dataset.selectedMood=selectedMood;
 document.querySelectorAll('.mood-v2-options [data-mood]').forEach(button=>{
   const active=button.dataset.mood===selectedMood;
   button.classList.toggle('sel',active);
   button.setAttribute('aria-pressed',String(active));
 });
 const summary=document.getElementById('mood-feeling-summary');
 const note=document.getElementById('mood-feeling-note');
 if(summary)summary.textContent=state.summary;
 if(note)note.textContent=state.note;
 // Keep one portrait slot: change only its source and accessible description.
 const portrait=document.getElementById('mood-portrait');
 const src=moodPortraitSrc(selectedMood);
 if(portrait){
   if(portrait.getAttribute('src')!==src)portrait.setAttribute('src',src);
   portrait.setAttribute('alt',moodPortraitAlt(selectedMood));
 }
}
function routeIfClicked(ev){const control=ev.target.closest('button[data-action],button[data-screen],button[data-mood],button[data-tag],button[data-setting],button[data-journey],button[data-edit],button[data-view]');if(!control)return;ev.preventDefault();if(control.dataset.screen){if(control.dataset.screen==='today'&&['onboard-grow','onboard-notice'].includes(page)){data.onboarded=true;save()}go(control.dataset.screen);return}
if(control.dataset.journey){chosenJourney=control.dataset.journey;go('journey-detail');return}
if(control.dataset.view){editingJournal=control.dataset.view;go('journal-view');return}
if(control.dataset.edit){editingJournal=control.dataset.edit;go('journal-edit');return}
if(control.dataset.mood){if(!moodStates[control.dataset.mood])return;selectedMood=control.dataset.mood;paintMoodSelection();return}
if(control.dataset.tag){const tag=control.dataset.tag;selectedTags=selectedTags.includes(tag)?selectedTags.filter(t=>t!==tag):[...selectedTags,tag];control.classList.toggle('active',selectedTags.includes(tag));control.setAttribute('aria-pressed',selectedTags.includes(tag));return}
if(control.dataset.setting){const k=control.dataset.setting;data.settings[k]=!data.settings[k];save();draw();notice('Preference updated');return}
const action=control.dataset.action;
switch(action){
case 'save-mood':{const note=document.getElementById('mood-note')?.value.trim()||'';const energy=Number(document.getElementById('mood-energy')?.value||3);data.checkins.push({id:id(),createdAt:Date.now(),mood:selectedMood,tags:[...selectedTags],note,energy});if(save()){selectedTags=[];selectedMood='calm';moodEnergy=3;go('mood-saved')}break}
case 'new-journal':editingJournal=null;go('journal-edit');break;
case 'save-journal':{const title=document.getElementById('journal-title')?.value.trim(),body=document.getElementById('journal-body')?.value.trim();if(!body){notice('Add a few words before saving.');document.getElementById('journal-body')?.focus();return}const time=Date.now();if(editingJournal){const e=data.journal.find(e=>e.id===editingJournal);if(e){e.title=title||'Untitled reflection';e.body=body;e.updatedAt=time}}else{data.journal.push({id:id(),title:title||'Untitled reflection',body,createdAt:time,updatedAt:time})}if(save()){editingJournal=null;journalSearch='';go('journal');notice('Reflection saved privately')}break}
case 'delete-journal':{if(!editingJournal||!confirm('Delete this reflection? This cannot be undone.'))return;data.journal=data.journal.filter(e=>e.id!==editingJournal);save();editingJournal=null;go('journal');notice('Reflection deleted');break}
case 'begin-journey':{const p=journeyProgress(chosenJourney);if(p>=journeys[chosenJourney].steps.length){if(!confirm('Start this journey again? This will replace your previous answers.'))return;data.journeys[chosenJourney]={step:0,answers:{}};save()}go('exercise');break}
case 'save-exercise':{const j=journeys[chosenJourney],p=Math.min(journeyProgress(chosenJourney),j.steps.length-1),answer=document.getElementById('exercise-answer')?.value.trim()||'';if(!answer){notice('Write a little before continuing, or pause for now.');document.getElementById('exercise-answer')?.focus();return}if(!data.journeys[chosenJourney])data.journeys[chosenJourney]={step:0,answers:{}};data.journeys[chosenJourney].answers[p]=answer;data.journeys[chosenJourney].step=Math.max(p+1,data.journeys[chosenJourney].step);save();go(data.journeys[chosenJourney].step>=j.steps.length?'journey-complete':'exercise');notice('Reflection saved');break}
case 'pause-journey':go('journey-detail');notice('Your progress is saved after each step');break;
case 'favorite':{const k=affirmationIndex;data.favorites=data.favorites.includes(k)?data.favorites.filter(n=>n!==k):[...data.favorites,k];save();draw();notice(data.favorites.includes(k)?'Added to your favourites':'Removed from favourites');break}
case 'next-affirmation':affirmationIndex=(affirmationIndex+1)%affirmationList.length;draw();break;
case 'start-breath':startBreathe();break;
case 'pause-breath':pauseBreathe();draw();break;
case 'reset-breath':pauseBreathe();breathSecs=0;draw();break;
case 'go-insights':go('insights');break;
case 'return-today':go('today');break;
case 'export':exportData();break;
case 'delete-all':{if(!confirm('Permanently delete ALL your check-ins, writing, journey progress and settings from this browser? Export a copy first if you want to keep them.'))return;if(!confirm('This cannot be undone. Delete everything?'))return;data=defaultData();save();selectedTags=[];editingJournal=null;go('today');notice('Local data deleted');break}
case 'install-app':installApp();break;
}
}
function startBreathe(){if(breathActive)return;breathActive=true;draw();breathTimer=setInterval(()=>{breathSecs++;const t=document.getElementById('breath-time');const l=document.getElementById('breath-label');if(t)t.textContent=`${Math.floor(breathSecs/60)}:${String(breathSecs%60).padStart(2,'0')}`;if(l)l.textContent=breathSecs%10<4?'Breathe in':breathSecs%10<7?'Hold gently':'Breathe out';if(breathSecs>=120){pauseBreathe();notice('Two minutes for yourself. Nicely done.');draw()}},1000)}
function pauseBreathe(){breathActive=false;if(breathTimer)clearInterval(breathTimer);breathTimer=null}
function exportData(){const payload={app:'BE YOU',exportedAt:new Date().toISOString(),...data};const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`be-you-backup-${todayKey()}.json`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),5000);notice('Your backup file is ready')}
async function installApp(){if(installEvent){installEvent.prompt();const result=await installEvent.userChoice;installEvent=null;notice(result.outcome==='accepted'?'Installation started':'You can install whenever you like')}else{notice('Use your browser menu → Add to Home Screen / Install app')}}
document.addEventListener('click',routeIfClicked);
document.addEventListener('input',e=>{if(e.target?.id==='journal-search'){journalSearch=e.target.value;document.getElementById('journal-results').innerHTML=journalRows()}else if(e.target?.id==='mood-energy')moodEnergy=Number(e.target.value)});
document.addEventListener('change',async e=>{if(e.target?.id!=='import-data')return;const file=e.target.files?.[0];if(!file)return;try{if(file.size>2_000_000)throw Error('Backup is too large');const json=JSON.parse(await file.text());if(json.version!==1||!Array.isArray(json.journal)||!Array.isArray(json.checkins)||typeof json.journeys!=='object')throw Error('Not a valid BE YOU backup');if(!confirm('Replace all current local data with this backup? Export your current data first if needed.'))return;data={...defaultData(),...json,settings:{...defaultData().settings,...json.settings}};save();go('settings');notice('Backup restored')}catch(err){notice(err.message||'Unable to load this backup')}});
window.addEventListener('popstate',()=>{page=new URLSearchParams(location.search).get('screen')||'today';draw()});
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installEvent=e});
if('serviceWorker' in navigator&&location.protocol.startsWith('http')){
  // Never reload automatically: a visitor may be midway through a private journal draft.
  let controlled=!!navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener('controllerchange',()=>{
    if(controlled)notice('A BE YOU update is ready. Reload the page to see it.');
    controlled=true;
  });
  window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'}).then(reg=>reg.update()).catch(()=>{}));
}
page=new URLSearchParams(location.search).get('screen')||(data.onboarded?'today':'welcome');if(!screens[page])page='today';go(page,true);
