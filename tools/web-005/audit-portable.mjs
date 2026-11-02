import {chromium} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
const file=path.resolve(process.argv[2]),output=path.resolve(process.argv[3]);await fs.mkdir(output,{recursive:true});
const bytes=await fs.readFile(file,'utf8');const payload=JSON.parse(bytes.match(/<script type="application\/json" id="offline-pages">([\s\S]*?)<\/script>/)[1]);assert.equal(Object.keys(payload.pages).filter(k=>k.startsWith('/articulos/')).length,308);
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true});const results=[];
try{for(const width of [320,768,1440]){
 const ctx=await browser.newContext({viewport:{width,height:1000},offline:true,acceptDownloads:true});const p=await ctx.newPage();const errors=[],network=[];p.on('pageerror',e=>errors.push(e.message));p.on('request',r=>{if(/^https?:/.test(r.url()))network.push(r.url());});
 await p.setContent(await fs.readFile(file,'utf8'));assert.equal(await p.locator('h1').textContent(),'El conocimientotambién es equipo.');
 await p.locator('#home-search').fill('MAN-01-01');await p.getByRole('button',{name:'Buscar',exact:true}).click();await p.waitForFunction(()=>document.querySelector('#query')?.value==='MAN-01-01');assert(await p.locator('#results li').count()>=1);await p.locator('#results a').first().click();await p.waitForFunction(()=>document.querySelector('.manuscript'));
 const initial=await p.locator('.manuscript').textContent();assert(initial.length>5000);await p.getByRole('button',{name:'Aumentar tamaño del texto'}).click();assert.equal(await p.getByRole('button',{name:'Reducir tamaño del texto'}).getAttribute('aria-disabled'),'false');
 const [download]=await Promise.all([p.waitForEvent('download'),p.getByRole('link',{name:'Descargar manuscrito original sin modificaciones'}).click()]);await download.saveAs(path.join(output,'portable-original-'+width+'.md'));assert.deepEqual(await fs.readFile(path.join(output,'portable-original-'+width+'.md')),await fs.readFile('private/web005/public/originales/MAN-01-01.md'));
 await p.evaluate(()=>{location.hash='/atlas/livonia/';});await p.waitForFunction(()=>document.querySelector('h1')?.textContent==='Livonia');assert.equal(await p.locator('.card').count(),14);assert(await p.locator('h1').textContent()==='Livonia');
 const axe=await new AxeBuilder({page:p}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();assert.deepEqual(axe.violations,[]);const m=await p.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth}));assert(m.scroll<=m.width+1);
 await p.evaluate(()=>{location.hash='/revision/';});await p.waitForFunction(()=>document.querySelector('#review-form'));await p.locator('[name=comments]').fill('Revisión sintética portable sin conexión.');for(const format of ['json','txt']){const [d]=await Promise.all([p.waitForEvent('download'),p.locator('#export-'+format).click()]);await d.saveAs(path.join(output,'portable-review-'+width+'.'+format));}
 await p.screenshot({path:path.join(output,'portable-review-'+width+'.png'),fullPage:true});assert.deepEqual(errors,[]);assert.deepEqual(network,[]);results.push({width,offline:true,network,errors,axeViolations:0,originalDownload:true,jsonTxtExports:true});await ctx.close();
}
await fs.writeFile(path.join(output,'portable-results.json'),JSON.stringify(results,null,2));console.log(JSON.stringify(results));}finally{await browser.close();}
