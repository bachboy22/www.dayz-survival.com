import {chromium} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
const origin=process.argv[2];if(!/^http:\/\/127\.0\.0\.1:\d+$/.test(origin))throw Error('Use private loopback origin');
const output=path.resolve(process.argv[3]||'artifacts/web-005');await fs.mkdir(output,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH||'/usr/bin/chromium',headless:true});
const records=[];const errors=[];const remote=[];
const catalog=JSON.parse(await fs.readFile('private/web005/catalog.json','utf8'));
const sample=Object.values(Object.groupBy(catalog,e=>e.category)).map(es=>es[0].id);
const routes=['/','/enciclopedia/','/proyecto/','/revision/','/atlas/chernarus/','/atlas/livonia/',...sample.map(id=>'/articulos/'+id+'/')];
async function reflow(page){const m=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,dpr:devicePixelRatio}));assert(m.scroll<=m.width+1,JSON.stringify(m));return m;}
try{
for(const width of [320,768,1440]){
 const context=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce',acceptDownloads:true});const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(!r.url().startsWith(origin)&&!r.url().startsWith('blob:'))remote.push(r.url());});
 for(const route of routes){await page.goto(origin+route);await page.waitForLoadState('networkidle');assert.equal(await page.locator('h1').count(),1);const m=await reflow(page);const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();records.push({width,route,metrics:m,axe:axe.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)}))});}
 await page.goto(origin+'/');await page.keyboard.press('Tab');assert.equal(await page.locator('.skip-link').evaluate(e=>e===document.activeElement),true);await page.keyboard.press('Enter');assert.equal(await page.locator('#main-content').evaluate(e=>e===document.activeElement),true);
 const menu=page.locator('.navigation summary');await menu.focus();await page.keyboard.press('Enter');assert(await page.locator('.navigation').evaluate(e=>e.open));await page.keyboard.press('Escape');assert(await menu.evaluate(e=>e===document.activeElement));
 await page.screenshot({path:path.join(output,`home-${width}.png`),fullPage:true});
 await page.goto(origin+'/enciclopedia/');await page.waitForFunction(()=>document.querySelector('#page-number')?.textContent==='Página 1 de 26');
 await page.locator('#next').focus();await page.keyboard.press('Enter');assert.equal(await page.locator('#next').evaluate(e=>e===document.activeElement),true);assert.equal(await page.locator('#results .card').count(),12);assert.match(page.url(),/page=2/);
 await page.locator('[name=family]').selectOption('LIV');await page.waitForTimeout(250);assert.match(await page.locator('#search-status').textContent(),/14 artículos/);assert.equal(await page.locator('#results a').first().getAttribute('href'),'/articulos/LIV-REG-001/');await page.locator('#next').click();assert.equal(await page.locator('#results .card').count(),2);
 await page.goBack();await page.waitForTimeout(250);assert.equal(await page.locator('#results .card').count(),12);
 await page.locator('[name=technical]').selectOption('verified');await page.waitForTimeout(250);assert.match(await page.locator('#search-status').textContent(),/0 artículos/);assert(await page.locator('#empty').isVisible());
 await page.getByRole('button',{name:'Limpiar búsqueda y filtros'}).click();await page.waitForTimeout(250);await page.locator('#query').fill('MAN-01-01');await page.waitForTimeout(250);assert(await page.locator('#results .card').count()>=1);assert.equal(await page.locator('#results a').first().getAttribute('href'),'/articulos/MAN-01-01/');assert.equal(await page.locator('#query').evaluate(e=>e===document.activeElement),true);await page.screenshot({path:path.join(output,`search-${width}.png`),fullPage:true});
 await page.locator('#query').fill('<img src=x onerror=alert(1)>');await page.waitForTimeout(250);assert.equal(await page.locator('#results img').count(),0);assert(await page.locator('#empty').isVisible());
 await page.goto(origin+'/articulos/MAN-01-01/');const more=page.getByRole('button',{name:'Aumentar tamaño del texto'});await more.focus();for(let i=0;i<3;i++)await page.keyboard.press('Enter');assert.equal(await more.getAttribute('aria-disabled'),'true');assert.match(await page.locator('#text-size-status').textContent(),/135/);await reflow(page);await page.screenshot({path:path.join(output,`reader-max-${width}.png`),fullPage:true});await page.getByRole('button',{name:'Reducir tamaño del texto'}).click();assert.equal(await more.getAttribute('aria-disabled'),'false');
 await page.goto(origin+'/revision/');await page.locator('[name=comments]').fill('Prueba sintética de exportación; no aprobación humana.');for(const format of ['json','txt']){const [d]=await Promise.all([page.waitForEvent('download'),page.locator('#export-'+format).click()]);await d.saveAs(path.join(output,'review-test-'+width+'.'+format));const body=await fs.readFile(path.join(output,'review-test-'+width+'.'+format),'utf8');assert.match(body,/Prueba sintética/);assert.match(body,/false/);}
 const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width,height:1000}});const p=await nojs.newPage();await p.goto(origin+'/familias/LIV/');assert.equal(await p.locator('.card').count(),14);await p.goto(origin+'/articulos/MAN-01-01/');assert(await p.locator('.manuscript p').count()>5);await nojs.close();await context.close();
}
// Check actual HTTP destinations for all 308 articles and originals from the packaged server.
const requestContext=await browser.newContext();for(const e of catalog){const r=await requestContext.request.get(origin+'/articulos/'+e.id+'/');assert.equal(r.status(),200);const raw=await requestContext.request.get(origin+'/originales/'+e.id+'.md');assert.equal(raw.status(),200);}assert.equal((await requestContext.request.get(origin+'/missing-route/')).status(),404);await requestContext.close();
assert.deepEqual(errors,[]);assert.deepEqual(remote,[]);
await fs.writeFile(path.join(output,'browser-results.json'),JSON.stringify({records,pageErrors:errors,remoteRequests:remote,articlesHTTPChecked:308,exportsChecked:6,automatedOnly:true,windowsHumanTests:'NOT_EXECUTED'},null,2));
console.log(JSON.stringify({axeAudits:records.length,violations:records.reduce((n,r)=>n+r.axe.length,0),screenshots:9,articlesHTTPChecked:308,errors,remote}));
assert.equal(records.reduce((n,r)=>n+r.axe.length,0),0,'axe violations; see browser-results.json');
}finally{await browser.close();}
