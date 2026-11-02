import {chromium} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
const origin=process.argv[2],output=path.resolve(process.argv[3]);await fs.mkdir(output,{recursive:true});
const results=[];const extension=path.resolve('tests/fixtures/zoom-extension');
for(const factor of [2,4]){
 const profile=await fs.mkdtemp(path.join(os.tmpdir(),'web005-zoom-'));
 const context=await chromium.launchPersistentContext(profile,{executablePath:process.env.WEB005_ZOOM_CHROMIUM||chromium.executablePath(),headless:true,ignoreDefaultArgs:['--disable-extensions'],viewport:{width:1280,height:960},reducedMotion:'reduce',args:[`--disable-extensions-except=${extension}`,`--load-extension=${extension}`]});
 try{
 const worker=context.serviceWorkers()[0]??await context.waitForEvent('serviceworker');const page=context.pages()[0];const cdp=await context.newCDPSession(page);
 for(const [label,route] of [['home','/'],['search','/enciclopedia/'],['reader','/articulos/MAN-01-01/'],['table','/articulos/MAN-02-02/'],['atlas','/atlas/livonia/']]){
  await page.goto(origin+route);const actual=await worker.evaluate(async({origin,factor})=>{const tabs=await chrome.tabs.query({});const t=tabs.find(t=>t.url?.startsWith(origin));await chrome.tabs.setZoomSettings(t.id,{mode:'automatic',scope:'per-tab'});await chrome.tabs.setZoom(t.id,factor);return chrome.tabs.getZoom(t.id);},{origin,factor});assert(Math.abs(actual-factor)<0.00001);await page.waitForFunction(w=>innerWidth===w,1280/factor);
  if(label==='reader'||label==='table'){for(let i=0;i<3;i++)await page.getByRole('button',{name:'Aumentar tamaño del texto'}).click();assert.equal(await page.getByRole('button',{name:'Aumentar tamaño del texto'}).getAttribute('aria-disabled'),'true');}
  if(label==='search'){await page.locator('#query').fill('sinresultadosWEB005');await page.waitForTimeout(300);}
  const metrics=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,dpr:devicePixelRatio,visualScale:visualViewport.scale}));assert.equal(metrics.width,1280/factor);assert(metrics.scroll<=metrics.width+1);assert(Math.abs(metrics.dpr-factor)<0.00001);
  const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();results.push({factor,route,method:'chrome.tabs.setZoom',metrics,violations:axe.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))});
  const image=await cdp.send('Page.captureScreenshot',{format:'png',fromSurface:true});await fs.writeFile(path.join(output,`zoom-${factor*100}-${label}.png`),Buffer.from(image.data,'base64'));
 }
 }finally{await context.close();await fs.rm(profile,{recursive:true,force:true});}
}
await fs.writeFile(path.join(output,'zoom-results.json'),JSON.stringify(results,null,2));console.log(JSON.stringify({zoomAudits:results.length,violations:results.reduce((n,r)=>n+r.violations.length,0)}));assert.equal(results.reduce((n,r)=>n+r.violations.length,0),0);
