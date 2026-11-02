import {chromium} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
const [origin,out]=process.argv.slice(2);await fs.mkdir(out,{recursive:true});const records=[];const extension=path.resolve('tests/fixtures/zoom-extension');
for(const factor of [2,4]){
 const profile=await fs.mkdtemp(path.join(os.tmpdir(),'web007-zoom-'));const c=await chromium.launchPersistentContext(profile,{executablePath:chromium.executablePath(),headless:true,ignoreDefaultArgs:['--disable-extensions'],viewport:{width:1280,height:960},reducedMotion:'reduce',args:[`--disable-extensions-except=${extension}`,`--load-extension=${extension}`]});
 try{const worker=c.serviceWorkers()[0]??await c.waitForEvent('serviceworker');const p=c.pages()[0];const cdp=await c.newCDPSession(p);
 for(const [label,route] of [['home','/'],['reader','/articulos/MAN-01-01/']]){
  await p.goto(origin+route);const actual=await worker.evaluate(async({origin,factor})=>{const tabs=await chrome.tabs.query({});const t=tabs.find(t=>t.url?.startsWith(origin));await chrome.tabs.setZoomSettings(t.id,{mode:'automatic',scope:'per-tab'});await chrome.tabs.setZoom(t.id,factor);return chrome.tabs.getZoom(t.id);},{origin,factor});assert(Math.abs(actual-factor)<.00001);await p.waitForFunction(w=>innerWidth===w,1280/factor);await p.evaluate(()=>document.fonts.ready);
  if(label==='reader')for(let i=0;i<3;i++)await p.getByRole('button',{name:'Aumentar tamaño del texto'}).click();const metrics=await p.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,dpr:devicePixelRatio}));assert(metrics.scroll<=metrics.width+1);const axe=await new AxeBuilder({page:p}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();records.push({route,factor,method:'chrome.tabs.setZoom',metrics,violations:axe.violations.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)}))});const shot=await cdp.send('Page.captureScreenshot',{format:'png',fromSurface:true});await fs.writeFile(path.join(out,`zoom-${factor*100}-${label}.png`),Buffer.from(shot.data,'base64'));
 }
 }finally{await c.close();await fs.rm(profile,{recursive:true,force:true});}
}
await fs.writeFile(path.join(out,'zoom-results.json'),JSON.stringify(records,null,2));console.log(JSON.stringify({audits:records.length,violations:records.reduce((n,r)=>n+r.violations.length,0)}));assert(records.every(r=>!r.violations.length));
