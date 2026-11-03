import {chromium} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
const [origin,file,out]=process.argv.slice(2);await fs.mkdir(out,{recursive:true});const b=await chromium.launch({executablePath:chromium.executablePath(),headless:true});const records=[],errors=[],remote=[];
try{for(const mode of ['site','file'])for(const width of [320,768,1440]){
 const c=await b.newContext({viewport:{width,height:960},reducedMotion:'no-preference',offline:mode==='file'});const p=await c.newPage();p.on('pageerror',e=>errors.push(e.message));p.on('request',r=>{if(/^https?:/.test(r.url())&&(mode==='file'||!r.url().startsWith(origin)))remote.push(r.url());});
 const base=mode==='site'?origin:pathToFileURL(path.resolve(file)).href;const go=async route=>{await p.goto(base+(mode==='file'?'#':'')+route);await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(150);};
 await go('/');assert.equal(await p.locator('main img').count(),0);assert.equal(await p.locator('[data-art-slot]').count(),3);const button=p.locator('[data-art003-motion]');assert(await button.isVisible());await p.waitForFunction(()=>document.querySelector('[data-art003-hero]')?.classList.contains('art003-motion-enabled'));
 await button.focus();await p.keyboard.press('Enter');assert.equal(await button.getAttribute('aria-pressed'),'true');assert(!(await p.locator('[data-art003-hero]').evaluate(e=>e.classList.contains('art003-motion-enabled'))));await p.keyboard.press('Enter');assert.equal(await button.getAttribute('aria-pressed'),'false');
 await p.locator('footer').scrollIntoViewIfNeeded();await p.waitForFunction(()=>!document.querySelector('[data-art003-hero]').classList.contains('art003-motion-enabled'));await p.evaluate(()=>window.scrollTo(0,0));await p.waitForFunction(()=>document.querySelector('[data-art003-hero]').classList.contains('art003-motion-enabled'));
 await button.focus();await p.emulateMedia({reducedMotion:'reduce'});assert(!(await button.isVisible()));await p.waitForFunction(()=>document.querySelector('[data-art003-hero] a')===document.activeElement);assert.equal(await p.locator('.art003-ambient').evaluate(e=>getComputedStyle(e).animationName),'none');
 const heroText=await p.locator('main').innerText();assert(!/imagen pendiente|reserva de portada|imagen por incorporar/i.test(heroText));
 for(const route of ['/','/articulos/MAN-01-01/','/atlas/chernarus/','/atlas/livonia/']){
  await go(route);assert.equal(await p.locator('main img').count(),0);assert(await p.locator('[data-art-slot]').count()>0);const metrics=await p.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth}));assert(metrics.scroll<=metrics.width+1);const axe=await new AxeBuilder({page:p}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();records.push({mode,width,route,metrics,violations:axe.violations.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)}))});
 }
 await go('/articulos/MAN-01-01/');const larger=p.getByRole('button',{name:'Aumentar tamaño del texto'});for(let i=0;i<3;i++)await larger.click();assert.equal(await p.locator('.w7-reader').evaluate(e=>parseFloat(getComputedStyle(e).fontSize)),24);
 await go('/enciclopedia/?q=MAN-01-01');await p.waitForFunction(()=>document.querySelector('#results li')?.textContent.includes('MAN-01-01'));await p.locator('[name=family]').selectOption('LIV');await p.getByRole('button',{name:'Limpiar búsqueda y filtros'}).click();await p.waitForTimeout(300);assert.equal(await p.locator('#results .card').count(),12);
 await go('/');await p.screenshot({path:path.join(out,`${mode}-home-${width}.png`)});await go('/articulos/MAN-01-01/');await p.screenshot({path:path.join(out,`${mode}-reader-${width}.png`)});await c.close();
}
assert.deepEqual(errors,[]);assert.deepEqual(remote,[]);await fs.writeFile(path.join(out,'results.json'),JSON.stringify({state:'PREPARATION_NOT_FINAL_ART',records,axeAudits:records.length,axeViolations:records.reduce((n,r)=>n+r.violations.length,0),errors,remote,finalImagesIncluded:0,conceptPngFilesReceived:false},null,2));console.log(JSON.stringify({audits:records.length,violations:records.reduce((n,r)=>n+r.violations.length,0),errors,remote}));assert(records.every(r=>!r.violations.length));
}finally{await b.close();}
