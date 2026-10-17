/* BE YOU: verify the one real app, approved artwork and offline shell. */
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const error=[];
const has=f=>existsSync(path.join(root,f));
const read=f=>readFileSync(path.join(root,f),'utf8');
const required=['index.html','app.css','ui-primitives.js','functional.js','sw.js','manifest.webmanifest','server.mjs','package.json','assets/icons/favicon.svg','assets/brand/wordmark.svg'];
for(const f of required)if(!has(f))error.push(`Missing ${f}`);
const html=read('index.html');
for(const f of ['app.css','ui-primitives.js','functional.js','manifest.webmanifest'])if(!html.includes(f))error.push(`index.html does not load ${f}`);
if(html.includes('styles.css')||html.includes('refinement.css'))error.push('Stale CSS references remain');
const shared=read('ui-primitives.js'), code=read('functional.js');
if(/const screens\s*=/.test(shared))error.push('Duplicate static screen registry found in UI primitives');
if(!/const screens\s*=/.test(code))error.push('Working screen registry missing');
const destinations=['welcome','onboard-notice','onboard-grow','today','home','mood','journal','journal-edit','journal-view','heal','journey-detail','exercise','affirmations','breathe','insights','you','settings','offline','install'];
for(const page of destinations){const expression=page.includes('-')?`screens['${page}']`:`screens.${page}`;
if(!code.includes(expression)&&!code.includes(`${page}:()=>`)&&!code.includes(`'${page}':()=>`))error.push(`Missing functional destination: ${page}`)}
const config=shared;
const approved=[...config.matchAll(/'([\w-]+)'\s*:\s*'(volume-\d+\/[^']+\.webp)'/g)];
const assets=[...new Set(approved.map(x=>'assets/approved/'+x[2]))];
if(assets.length!==8)error.push(`Expected 8 approved images, found ${assets.length}`);
for(const file of assets){if(!has(file)){error.push(`Missing artwork ${file}`);continue;}const b=readFileSync(path.join(root,file));if(b.toString('ascii',0,4)!=='RIFF'||b.toString('ascii',8,12)!=='WEBP')error.push(`Invalid artwork: ${file}`)}
const manifest=JSON.parse(read('manifest.webmanifest'));
if(!Array.isArray(manifest.icons)||manifest.icons.length<2)error.push('PWA icons incomplete');
for(const icon of manifest.icons??[])if(!has(icon.src))error.push('Missing PWA icon '+icon.src);
const moodNames=['01-good.webp','02-calm.webp','03-okay.webp','04-anxious.webp','05-low.webp'];
const moodFiles=moodNames.map(n=>'assets/approved/moods/'+n);
const sw=read('sw.js');
if(!read('ui-primitives.js').includes("['heal','leaf','Grow']"))error.push('Four approved mobile tabs missing');
if(!read('functional.js').includes('mock-journal-empty'))error.push('Approved journal empty state missing');
for(const file of ['index.html','functional.js','ui-primitives.js','app.css','responsive.css','responsive-nav.js',...assets,...moodFiles])if(!sw.includes(file.replace(/^assets\/approved\//,''))&&!sw.includes(file))error.push(`Offline cache missing ${file}`);
for(const f of ['styles.css','refinement.css','assets/manga/city-night.webp','assets/manga/cat-window.webp'])if(has(f))error.push(`Unused legacy duplicate file: ${f}`);
for(const f of ['assets/brand/flower-line.png','assets/brand/koi-botanical.png','screenshots/refined/today.webp','screenshots/refined/mood.webp','screenshots/refined/journal.webp'])if(!has(f))error.push(`Missing brand / review asset: ${f}`);
// Catch the desktop footer regression and stale PWA upgrade behaviour.
if(!html.includes('responsive.css')||!html.includes('responsive-nav.js'))error.push('Missing coordinated responsive runtime assets');
const responsive=read('responsive.css');
if(!responsive.includes('@media (min-width:1024px){.screenfooter{display:none}}'))error.push('Desktop must hide mobile footer after baseline overrides');
if(!sw.includes("cache:'no-store'")||!sw.includes("request.mode==='navigate'"))error.push('Core online updates must prefer the network');
if(!sw.includes('k.startsWith(CACHE_PREFIX)'))error.push('Service worker must not delete other apps cache data');
if(!code.includes('moodPortraitRoles')||!code.includes('paintMoodSelection()'))error.push('Reactive mood selector missing');
if(!responsive.includes('MOOD CHOOSER — SINGLE REACTIVE SCREEN'))error.push('Reactive mood styling missing');

for(const [i,file] of moodFiles.entries()){
  if(!has(file)){error.push('Missing approved mood image: '+file);continue}
  const b=readFileSync(path.join(root,file));
  if(b.toString('ascii',0,4)!=='RIFF'||b.toString('ascii',8,12)!=='WEBP')error.push('Invalid mood WebP image: '+file);
  if(!shared.includes("'moods/"+moodNames[i]+"'"))error.push('Mood art registry missing '+file);
}
if(new Set(moodNames).size!==5||!code.includes('moodArtwork(moodPortraitRoles[m]'))error.push('Five unique mood images must be wired to the one screen');
const inventory=JSON.parse(read('ASSET_INVENTORY.json'));
for(const file of moodFiles){
  if(!has(file))continue;
  const record=inventory.assets.find(a=>a.path===file);
  if(!record||record.bytes!==readFileSync(path.join(root,file)).length||
    record.sha256!==createHash('sha256').update(readFileSync(path.join(root,file))).digest('hex'))
    error.push('Mood inventory checksum mismatch: '+file);
}
const frameRule=responsive.match(/\.device\[data-page="mood"\] \.mood-v2-art\s*\{([^}]+)\}/)?.[1]||'';
const imageRule=responsive.match(/\.device\[data-page="mood"\] \.mood-v2-art img\s*\{([^}]+)\}/)?.[1]||'';
if(!frameRule.includes('aspect-ratio:306 / 562')||
   !imageRule.includes('object-fit:cover')||
   !imageRule.includes('width:100%')||
   !imageRule.includes('height:100%'))
  error.push('All five moods must fill one fixed portrait frame proportionally');
if(error.length){console.error('BE YOU verification FAILED:\n - '+error.join('\n - '));process.exit(1)}
console.log(`BE YOU unified app verified: ${destinations.length} real screens, ${approved.length} artwork roles / ${assets.length} approved images, coordinated CSS, five distinct mood portraits, safe PWA offline shell.`);