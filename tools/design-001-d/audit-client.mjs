import { chromium, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
const origin=process.argv[2] || 'http://127.0.0.1:4333';
const out=path.resolve(process.argv[3] || 'artifacts/design-001-d/client');await mkdir(out,{recursive:true});
const routes=['/','/aprender/','/manual/','/manual/leer-una-ficha/','/manual/distinguir-los-estados/','/manual/explorar-un-atlas-pendiente/','/fichas/','/fichas/leer-una-ficha/','/fichas/distinguir-los-estados/','/fichas/explorar-un-atlas-pendiente/','/buscar/','/atlas/','/atlas/chernarus/','/atlas/livonia/','/herramientas/','/fuentes/','/acerca/','/404.html'];
const result={source:'6091b56667b9042c3da72e42fd1dc7e206b56b8f',platform:process.platform,windowsReal:'NOT EXECUTED',routes:[],externalRequests:[],pageErrors:[],nonGetRequests:[],responsive:[]};
const browser=await chromium.launch();result.browser=browser.version();
const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});const page=await context.newPage();
page.on('pageerror',e=>result.pageErrors.push(e.message));
await context.route('**/*',r=>{if(new URL(r.request().url()).origin!==origin){result.externalRequests.push(r.request().url());return r.abort();}if(r.request().method()!=='GET')result.nonGetRequests.push(r.request().method());return r.continue();});
try{
 const targets=new Set();
 for(const route of routes){
  assert.equal((await page.goto(origin+route)).status(),200);
  const seo=await page.evaluate(()=>({title:document.title,description:document.querySelector('meta[name=description]')?.content,robots:document.querySelector('meta[name=robots]')?.content,canonical:document.querySelector('link[rel=canonical]')?.href || null,language:document.documentElement.lang,h1:[...document.querySelectorAll('h1')].map(e=>e.textContent),levels:[...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].filter(e=>e.getClientRects().length).map(e=>+e.tagName.slice(1)),images:[...document.images].map(i=>({src:i.getAttribute('src'),alt:i.getAttribute('alt')})),storage:{local:localStorage.length,session:sessionStorage.length},noPositiveTabindex:[...document.querySelectorAll('[tabindex]')].every(e=>+e.getAttribute('tabindex')<=0)}));
  assert.equal(seo.language,'es');assert.equal(seo.h1.length,1);assert.match(seo.robots,/noindex/);assert(seo.title && seo.description && seo.noPositiveTabindex);
  for(let i=1;i<seo.levels.length;i++)assert(seo.levels[i]<=seo.levels[i-1]+1,route);
  const links=await page.locator('a[href]').evaluateAll(nodes=>nodes.map(n=>n.href));links.forEach(h=>targets.add(h));
  const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();assert.deepEqual(axe.violations,[],route);
  const nav=await page.evaluate(()=>performance.getEntriesByType('navigation')[0].toJSON());
  result.routes.push({route,seo,axeViolations:0,navigation:nav});
 }
 for(const target of targets){const url=new URL(target);assert.equal(url.origin,origin);const response=await context.request.get(url.origin+url.pathname+url.search);assert.equal(response.status(),200,target);if(url.hash){const html=await response.text();assert(html.includes('id="'+decodeURIComponent(url.hash.slice(1))+'"'),target);}}
 result.checkedLinks=targets.size;
 await page.goto(origin+'/buscar/');
 for(const query of ['<svg onload="window.__injected=true">','<script>window.__injected=true</script>', 'x'.repeat(200), 'á'.repeat(200)]){
  await page.getByRole('searchbox').fill(query);await expect(page.locator('#search-status')).toContainText('0 resultados');assert.equal(await page.evaluate(()=>'__injected' in window),false);
 }
 for(const width of [320,375,768,1024,1100,1280,1440]){
  await page.setViewportSize({width,height:900});
  for(const route of ['/','/buscar/','/manual/distinguir-los-estados/','/fichas/explorar-un-atlas-pendiente/','/atlas/','/herramientas/']){
   await page.goto(origin+route);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${width} ${route}`);
   if(route==='/buscar/')await page.getByRole('searchbox').fill('á'.repeat(200));
   const outside=await page.locator('button,input,select,h1,h2,h3,p').evaluateAll(nodes=>nodes.filter(e=>e.getClientRects().length && getComputedStyle(e).position!=='absolute').filter(e=>{const r=e.getBoundingClientRect();return r.left< -1 || r.right>innerWidth+1;}).map(e=>e.outerHTML.slice(0,180)));
   assert.deepEqual(outside,[],`${width} ${route}`);result.responsive.push({width,route,overflow:false});
  }
 }
 await page.setViewportSize({width:1440,height:1000});
 await page.goto(origin+'/manual/leer-una-ficha/');
 await page.getByRole('navigation',{name:'En este artículo'}).locator('a[href="#seguir-el-hilo"]').focus();await page.keyboard.press('Enter');await expect(page.locator('#seguir-el-hilo')).toBeFocused();
 await page.emulateMedia({forcedColors:'active',reducedMotion:'reduce'});await expect(page.locator('#seguir-el-hilo')).not.toHaveCSS('outline-style','none');assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).scrollBehavior),'auto');
 await page.emulateMedia({forcedColors:'none'});
 result.cookies=await context.cookies();assert.deepEqual(result.cookies,[]);
 result.serviceWorkerRegistrations=await page.evaluate(async()=>('serviceWorker' in navigator)?(await navigator.serviceWorker.getRegistrations()).length:0);assert.equal(result.serviceWorkerRegistrations,0);
 assert.deepEqual(result.externalRequests,[]);assert.deepEqual(result.pageErrors,[]);assert.deepEqual(result.nonGetRequests,[]);
 result.descriptionGroups=Object.values(Object.groupBy(result.routes,r=>r.seo.description)).map(group=>({description:group[0].seo.description,count:group.length,routes:group.map(r=>r.route)}));
 result.uniqueTitles=new Set(result.routes.map(r=>r.seo.title)).size;assert.equal(result.uniqueTitles,routes.length);
 result.status='passed';
}catch(e){result.status='failed';result.error=e.stack;process.exitCode=1;console.error(e);}
finally{await context.close();await browser.close();await writeFile(path.join(out,'client-audit.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({status:result.status,routes:result.routes.length,responsive:result.responsive.length,checkedLinks:result.checkedLinks,descriptionGroups:result.descriptionGroups?.map(g=>g.count)}));}
