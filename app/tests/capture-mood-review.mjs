/* Real running-app screenshots for the mood chooser review branch.
   Executes only on localhost with synthetic isolated data. No mockup rendering. */
import {chromium} from '@playwright/test';
import {fileURLToPath} from 'node:url';
import {resolve, dirname} from 'node:path';

const root=resolve(dirname(fileURLToPath(import.meta.url)), '..');
const moodNames=[
  ['happy','GOOD'],['calm','CALM'],['neutral','OKAY'],['anxious','ANXIOUS'],['sad','LOW']
];
const baseURL='http://127.0.0.1:4173/?screen=mood';
const browser=await chromium.launch({headless:true});
try{
  for(const {width,height,name} of [
    {width:390,height:844,name:'phone'},
    {width:320,height:700,name:'small'},
    {width:1280,height:800,name:'desktop'}
  ]){
    const context=await browser.newContext({
      viewport:{width,height},deviceScaleFactor:1,locale:'en-US',
      timezoneId:'UTC',reducedMotion:'reduce',serviceWorkers:'block'
    });
    const page=await context.newPage();
    await page.addInitScript(()=>{
      const key='beyou-v1-local-data';
      localStorage.setItem(key,JSON.stringify({
        version:1,onboarded:true,checkins:[],journal:[],journeys:{},
        favorites:[],settings:{light:false,reduceMotion:true,largeText:false}
      }));
    });
    await page.goto(baseURL,{waitUntil:'networkidle'});
    await page.locator('.device[data-page="mood"]').waitFor();
    const portrait=page.locator('#mood-portrait');
    async function waitArt(){
      await page.waitForFunction(()=>{
        const img=document.querySelector('#mood-portrait');
        return !!img&&img.complete&&img.naturalWidth>0&&img.naturalHeight>0;
      });
      await page.evaluate(()=>document.fonts.ready);
      await page.mouse.move(0,0);
    }
    async function take(filename){
      await waitArt();
      await page.screenshot({path:resolve(root,filename),animations:'disabled'});
    }
    await take(name==='phone'?'SCREENSHOT-MOBILE-MOOD.png':
      name==='small'?'SCREENSHOT-MOBILE-MOOD-320.png':'SCREENSHOT-DESKTOP-MOOD.png');
    if(name==='phone'){
      for(const [mood,label] of moodNames){
        await page.locator('[data-mood="'+mood+'"]').click();
        await page.waitForFunction(key=>document.querySelector('.mood-v2')?.dataset.selectedMood===key,mood);
        await portrait.scrollIntoViewIfNeeded();
        // restore original top of content so all five states can be compared fairly
        await page.locator('.device .content').evaluate(el=>{el.scrollTop=0;});
        await take('SCREENSHOT-MOOD-'+label+'.png');
      }
      await page.locator('.mood-v2-next').scrollIntoViewIfNeeded();
      await take('SCREENSHOT-MOBILE-MOOD-CHOICES.png');
      await page.locator('[data-mood="calm"]').click();
      await page.locator('.device .content').evaluate(el=>{el.scrollTop=0;});
      await take('SCREENSHOT-MOBILE-MOOD.png');
    }
    await context.close();
  }
}finally{await browser.close();}
console.log('Captured genuine BE YOU mood screen at 320, 390 and 1280 widths and all five choices.');
