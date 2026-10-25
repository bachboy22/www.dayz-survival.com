import { chromium, expect } from '@playwright/test';
import { createRequire } from 'node:module';
import { spawn, spawnSync } from 'node:child_process';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
const auditRequire = createRequire(import.meta.url);
const AxeBuilder = auditRequire('@axe-core/playwright').default;
const root = path.resolve(process.argv[2]);
const out = path.resolve(process.argv[3] || 'artifacts/design-001-d/package');
await mkdir(out, {recursive:true});
const script = path.join(root,'servidor/server.cjs');
const sourceSha = '6091b56667b9042c3da72e42fd1dc7e206b56b8f';
const result = { platform:process.platform,node:process.version,extractedPath:root,sourceSha,windowsReal:'NOT EXECUTED',wine:'NOT EXECUTED',checks:[],externalRequests:[] };
function done(name,details={}) { result.checks.push({name,status:'passed',...details}); console.log('PASS '+name); }
async function launch() {
  const child=spawn(process.execPath,[script,'--no-open'],{cwd:'/tmp',env:{...process.env,NODE_PATH:'',NODE_OPTIONS:''},stdio:['ignore','pipe','pipe']});
  let output=''; let errors=''; child.stderr.on('data',chunk=>errors+=chunk);
  const ready=await new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>reject(new Error('Server not ready: '+output+' '+errors)),15000);
    child.stdout.on('data',chunk=>{output+=chunk;const match=/DESIGN001D_READY (\{[^\n]+\})/.exec(output);if(match){clearTimeout(timer);resolve(JSON.parse(match[1]));}});
    child.once('error',error=>{clearTimeout(timer);reject(error);});
    child.once('exit',code=>{if(!output.includes('DESIGN001D_READY')){clearTimeout(timer);reject(new Error('Server exited '+code+': '+output+' '+errors));}});
  });
  return {child,ready};
}
async function waitExit(child) { if(child.exitCode!==null || child.signalCode!==null)return;await new Promise((resolve,reject)=>{const t=setTimeout(()=>reject(new Error('Orphan server process')),5000);child.once('exit',()=>{clearTimeout(t);resolve();});}); }
let running, browser, context;
try {
  assert(root.includes(' ') && /[áéíóúñ]/.test(root));
  assert(!existsSync(path.join(root,'.git')) && !existsSync(path.join(root,'node_modules')));
  running=await launch();const origin=new URL(running.ready.url).origin;
  assert.equal(running.ready.host,'127.0.0.1');done('isolated startup from accented path without checkout/dependencies',{host:running.ready.host,port:running.ready.port});
  const second=spawnSync(process.execPath,[script,'--no-open'],{cwd:'/tmp',encoding:'utf8',timeout:10000});assert.equal(second.status,0);assert.match(second.stdout,/ya esta abierta/);
  const state=JSON.parse(await readFile(path.join(root,'SESION_DESIGN001D.json'),'utf8'));assert.equal(state.pid,running.ready.pid);done('second launch reuses the same owned process');
  browser=await chromium.launch();context=await browser.newContext({viewport:{width:1280,height:960},acceptDownloads:true});
  await context.route(/^https?:/,route=>{if(new URL(route.request().url()).origin!==origin){result.externalRequests.push(route.request().url());return route.abort();}return route.continue();});
  const page=await context.newPage();const errors=[];page.on('pageerror',error=>errors.push(error.message));
  const routes=['/','/aprender/','/manual/','/manual/leer-una-ficha/','/manual/distinguir-los-estados/','/manual/explorar-un-atlas-pendiente/','/fichas/','/fichas/leer-una-ficha/','/fichas/distinguir-los-estados/','/fichas/explorar-un-atlas-pendiente/','/buscar/','/atlas/','/atlas/chernarus/','/atlas/livonia/','/herramientas/','/fuentes/','/acerca/','/404.html'];
  const checked=new Set();let anchorCount=0;
  for(const route of routes){
    const response=await page.goto(origin+route);assert.equal(response.status(),200);
    await expect(page.getByRole('heading',{level:1})).toHaveCount(1);
    const refs=await page.locator('a[href],link[href],script[src]').evaluateAll(nodes=>nodes.map(node=>({url:new URL(node.getAttribute('href')??node.getAttribute('src'),location.href).href,anchor:node.tagName==='A'})));
    for(const ref of refs){
      const url=new URL(ref.url);assert.equal(url.origin,origin);
      if(ref.anchor)anchorCount++;
      const target=url.pathname+url.search;
      if(!checked.has(target)){const response=await context.request.get(origin+target);assert.equal(response.status(),200,target);checked.add(target);}
      if(ref.anchor&&url.hash){
        const parsed=await context.request.get(origin+url.pathname);const html=await parsed.text();assert(html.includes('id="'+decodeURIComponent(url.hash.slice(1))+'"'),ref.url);
      }
    }
    const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.equal(axe.violations.length,0,JSON.stringify(axe.violations));
  }
  done('eighteen packaged pages, CSS/JS, internal links and anchors',{routes:routes.length,uniqueTargets:checked.size,anchorLinks:anchorCount,axeAudits:18,axeViolations:0});
  await page.goto(origin+'/buscar/');await page.getByRole('searchbox').fill('interfaz');await expect(page.locator('[data-search-result]:visible')).toHaveCount(3);await page.getByLabel('Ámbito de prueba',{exact:true}).selectOption('livonia');await expect(page.locator('[data-search-result]:visible')).toHaveCount(1);await page.getByRole('button',{name:'Limpiar búsqueda y filtros'}).click();await page.getByRole('searchbox').fill('como');await expect(page.locator('#search-results')).toBeVisible();
  await page.getByRole('searchbox').fill('cuaderno');await page.getByRole('button',{name:'Lectura',exact:true}).click();await expect(page.locator('#search-status')).toContainText('etiqueta Lectura');
  await page.getByRole('searchbox').fill('no-coincide');await expect(page.locator('#no-results')).toBeVisible();done('packaged full-text/accent search, filter and empty result');
  await page.goto(origin+'/manual/leer-una-ficha/');await page.getByRole('navigation',{name:'En este artículo'}).locator('a[href="#seguir-el-hilo"]').focus();await page.keyboard.press('Enter');await expect(page.locator('#seguir-el-hilo')).toBeFocused();
  const more=page.getByRole('button',{name:'Aumentar tamaño del texto'});await more.focus();for(let step=0;step<3;step++)await page.keyboard.press('Enter');await expect(page.locator('#text-size-status')).toContainText('135 %');
  await page.getByRole('link',{name:'Ver esta ficha por separado →'}).click();await expect(page).toHaveURL(origin+'/fichas/leer-una-ficha/');done('packaged index focus, A+ and quick-card cross-link');
  await page.goto(origin+'/INSTRUCCIONES_WINDOWS.html');await expect(page.getByRole('link',{name:'Abrir hoja de evaluación'})).toBeVisible();
  await page.getByRole('link',{name:'Abrir hoja de evaluación'}).click();await expect(page).toHaveURL(/REVISION_MANUAL.html/);
  await expect(page.getByRole('heading',{level:1})).toHaveText('Hoja de evaluación');
  assert.equal(await page.locator('select[name$="-result"]').count(),44);
  assert((await page.locator('select[name$="-result"]').evaluateAll(nodes=>nodes.map(node=>node.value))).every(value=>value==='No probado'));
  await expect(page.locator('#recommendation')).toHaveValue('No evaluada');
  await page.keyboard.press('Tab');await page.getByRole('link',{name:'Saltar al contenido'}).focus();await page.keyboard.press('Enter');await expect(page.locator('#contenido')).toBeFocused();
  await page.locator('#operator').fill('QA AUTOMÁTICA — NO ES REVISIÓN HUMANA');
  await page.locator('#G01-result').selectOption('Incidencia');await page.locator('#G01-notes').fill('Prueba de exportación: áéíóú. <img src=x onerror=window.injected=true>');
  const detail=page.locator('details').filter({has:page.locator('#nvda-M01-result')});await detail.locator('summary').click();
  await page.locator('#nvda-M01-notes').fill('Prueba del formulario; NVDA real NO ejecutado.');
  const jsonDownload=page.waitForEvent('download');await page.locator('#export-json').click();const jsonFile=path.join(out,'QA-form-export.json');await (await jsonDownload).saveAs(jsonFile);
  const report=JSON.parse(await readFile(jsonFile,'utf8'));assert.equal(report.sourceSha,sourceSha);assert.equal(report.automaticApproval,false);assert.equal(report.summary.recommendation,'No evaluada');
  assert.equal(report.screenReaders.nvda.length,16);assert.equal(report.screenReaders.narrador.length,16);assert.equal(report.general.length,12);assert.equal(report.packageId,'DESIGN-001-D');assert.equal(report.reviewRevision,'DESIGN001D-R1');assert(report.screenReaders.nvda.every(row=>row.result==='No probado'));assert(report.screenReaders.narrador.every(row=>row.result==='No probado'));
  const txtDownload=page.waitForEvent('download');await page.locator('#export-txt').click();const txtFile=path.join(out,'QA-form-export.txt');await (await txtDownload).saveAs(txtFile);assert.match(await readFile(txtFile,'utf8'),/áéíóú/);done('local JSON/TXT export preserves human defaults, accents and both M01–M16 lanes');
  await page.locator('#save-draft').click();page.once('dialog',dialog=>dialog.accept());await page.locator('#reset-review').click();await expect(page.locator('#G01-result')).toHaveValue('No probado');
  await page.locator('#load-draft').click();await expect(page.locator('#G01-result')).toHaveValue('Incidencia');
  page.once('dialog',dialog=>dialog.accept());await page.locator('#reset-review').click();await page.locator('#import-json').setInputFiles(jsonFile);await expect(page.locator('#G01-result')).toHaveValue('Incidencia');assert.equal(await page.evaluate(()=>'injected' in window),false);
  const bad={...report,sourceSha:'wrong'};const badFile=path.join(out,'QA-wrong-source.json');await writeFile(badFile,JSON.stringify(bad));await page.locator('#import-json').setInputFiles(badFile);await expect(page.locator('#review-status')).toContainText('no corresponde');done('draft restore, JSON round-trip, wrong-SHA rejection and text-only import');
  const wrongPackage={...report,packageId:'WEB-004'};await page.locator('#import-json').setInputFiles({name:'old-review.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(wrongPackage))});await expect(page.locator('#review-status')).toContainText('no corresponde');
  const beforeBad=await page.locator('#operator').inputValue();
  const badDate=structuredClone(report);badDate.environment.date='2026-02-31';badDate.environment.operator='should not be applied';await page.locator('#import-json').setInputFiles({name:'bad-date.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(badDate))});await expect(page.locator('#review-status')).toContainText('Fecha no válida');assert.equal(await page.locator('#operator').inputValue(),beforeBad);
  const oversize=Buffer.alloc(4*1024*1024+1,32);await page.locator('#import-json').setInputFiles({name:'large.json',mimeType:'application/json',buffer:oversize});await expect(page.locator('#review-status')).toContainText('4 MB');
  const longReport=structuredClone(report);for(const row of [...longReport.general,...longReport.screenReaders.nvda,...longReport.screenReaders.narrador])row.observations='漢'.repeat(20000);
  const longBytes=Buffer.from(JSON.stringify(longReport));assert(longBytes.length>1024*1024 && longBytes.length<4*1024*1024);await page.locator('#import-json').setInputFiles({name:'large-valid-review.json',mimeType:'application/json',buffer:longBytes});await expect(page.locator('#review-status')).toContainText('recuperada');assert.equal((await page.locator('#G01-notes').inputValue()).length,20000);
  done('independent schema, invalid-date atomic rejection, size limit and large valid Unicode comments');

  page.once('dialog',dialog=>dialog.accept());await page.locator('#reset-review').click();
  const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.equal(axe.violations.length,0,JSON.stringify(axe.violations));
  await page.screenshot({path:path.join(out,'hoja-evaluacion-escritorio.png'),fullPage:true});
  await page.setViewportSize({width:320,height:800});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);
  const mobileAxe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.equal(mobileAxe.violations.length,0,JSON.stringify(mobileAxe.violations));done('evaluation form keyboard, labels, axe and 320px reflow',{axeAudits:2});
  await page.setViewportSize({width:1280,height:960});await page.goto(origin+'/revision/REVISION_MANUAL.html');
  const extraContext=await browser.newContext({javaScriptEnabled:false});const plain=await extraContext.newPage();await plain.goto(origin+'/manual/leer-una-ficha/');await expect(plain.locator('#seguir-el-hilo')).toBeVisible();await extraContext.close();done('static reader without JavaScript');
  assert.deepEqual(errors,[]);assert.deepEqual(result.externalRequests,[]);done('no page-script errors or external HTTP requests while external access blocked');
  // Exercise true browser zoom against the extracted service, not Astro preview.
  const profile=path.join(out,'temporary-browser-profile');const extension=fileURLToPath(new URL('../../tests/fixtures/zoom-extension/',import.meta.url));
  const zoomContext=await chromium.launchPersistentContext(profile,{channel:'chromium',headless:true,viewport:{width:1280,height:960},args:[`--disable-extensions-except=${extension}`,`--load-extension=${extension}`]});
  try{
    await zoomContext.route(/^https?:/,route=>{if(new URL(route.request().url()).origin===origin)return route.continue();result.externalRequests.push(route.request().url());return route.abort();});
    const worker=zoomContext.serviceWorkers()[0]??await zoomContext.waitForEvent('serviceworker');const zoomPage=zoomContext.pages()[0];const cdp=await zoomContext.newCDPSession(zoomPage);const records=[];
    for(const factor of [2,4])for(const [label,target] of [['reader','/manual/leer-una-ficha/'],['form','/revision/REVISION_MANUAL.html'],['search','/buscar/'],['atlas','/atlas/']]){
      await zoomPage.goto(origin+target);
      const actual=await worker.evaluate(async({origin,factor})=>{const tabs=await chrome.tabs.query({});const tab=tabs.find(t=>t.url?.startsWith(origin));await chrome.tabs.setZoomSettings(tab.id,{mode:'automatic',scope:'per-tab'});await chrome.tabs.setZoom(tab.id,factor);return chrome.tabs.getZoom(tab.id);},{origin,factor});assert(Math.abs(actual-factor)<0.00001);
      await expect.poll(()=>zoomPage.evaluate(()=>innerWidth)).toBe(1280/factor);
      if(label==='reader'){const plus=zoomPage.getByRole('button',{name:'Aumentar tamaño del texto'});await plus.focus();for(let i=0;i<3;i++)await zoomPage.keyboard.press('Enter');await expect(zoomPage.locator('#text-size-status')).toContainText('135 %');}
      else if(label==='form') await zoomPage.locator('#operator').focus();
      else if(label==='search') {await zoomPage.getByRole('searchbox').fill('interfaz');await expect(zoomPage.locator('[data-search-result]:visible')).toHaveCount(3);await zoomPage.getByLabel('Ámbito de prueba',{exact:true}).selectOption('livonia');await expect(zoomPage.locator('[data-search-result]:visible')).toHaveCount(1);}
      const metrics=await zoomPage.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,dpr:devicePixelRatio,visualScale:visualViewport.scale}));assert(metrics.scrollWidth<=metrics.width+1);
      const audit=await new AxeBuilder({page:zoomPage}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.equal(audit.violations.length,0,JSON.stringify(audit.violations));
      const screenshot=await cdp.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false,fromSurface:true});const filename=`paquete-${factor*100}-${label}.png`;await writeFile(path.join(out,filename),Buffer.from(screenshot.data,'base64'));
      records.push({factor:actual,target,metrics,axeViolations:0,screenshot:filename});
    }
    await writeFile(path.join(out,'package-zoom.json'),JSON.stringify(records,null,2)+'\n');done('extracted reader and evaluation form at actual 200% and 400% browser zoom',{scenarios:8});
  }finally{await zoomContext.close();}
  assert.deepEqual(result.externalRequests,[]);
  const fileContext=await browser.newContext({acceptDownloads:true});const filePage=await fileContext.newPage();
  await filePage.goto(new URL('file://'+root+'/INSTRUCCIONES_WINDOWS.html').href);await expect(filePage.locator('#file-note')).toBeVisible();
  await filePage.getByRole('link',{name:'Abrir hoja de evaluación'}).click();await expect(filePage.getByRole('heading',{level:1})).toHaveText('Hoja de evaluación');
  const offlineDownload=filePage.waitForEvent('download');await filePage.locator('#export-json').click();await (await offlineDownload).saveAs(path.join(out,'QA-file-export.json'));await fileContext.close();done('instructions and review JSON export also work as local files');
  const stop=spawnSync(process.execPath,[script,'--stop'],{cwd:'/tmp',encoding:'utf8',timeout:10000});assert.equal(stop.status,0,stop.stderr);await waitExit(running.child);
  assert(!existsSync(path.join(root,'SESION_DESIGN001D.json')));await assert.rejects(()=>fetch(origin+'/'));done('explicit stop removes session, closes socket and exits without orphan process');
  const postStopExport=page.waitForEvent('download');await page.locator('#export-json').click();const download=await postStopExport;await download.saveAs(path.join(out,'QA-export-after-stop.json'));done('already-loaded evaluation still exports locally after service stops');
  const twice=spawnSync(process.execPath,[script,'--stop'],{cwd:'/tmp',encoding:'utf8',timeout:10000});assert.equal(twice.status,0);done('repeated close is harmless');
  running=await launch();running.child.kill('SIGKILL');await waitExit(running.child);assert(existsSync(path.join(root,'SESION_DESIGN001D.json')));
  running=await launch();const recovered=spawnSync(process.execPath,[script,'--stop'],{cwd:'/tmp',encoding:'utf8',timeout:10000});assert.equal(recovered.status,0);await waitExit(running.child);assert(!existsSync(path.join(root,'SESION_DESIGN001D.json')));done('stale-session recovery after abrupt process termination');
  const guide=path.join(root,'INSTRUCCIONES_WINDOWS.html');const original=await readFile(guide);await writeFile(guide,Buffer.concat([original,Buffer.from('changed')]));
  try{const corrupted=spawnSync(process.execPath,[script,'--no-open'],{encoding:'utf8',timeout:10000});assert.equal(corrupted.status,1);assert.match(corrupted.stderr,/Integridad incorrecta/);assert(!existsSync(path.join(root,'SESION_DESIGN001D.json')));}
  finally{await writeFile(guide,original);}done('changed delivered bytes prevent startup');
  const final=spawnSync(process.execPath,[script,'--verify'],{encoding:'utf8',timeout:15000});assert.equal(final.status,0);done('all delivered files still match checksums after round-trip review');
  result.success=true;
}catch(error){result.success=false;result.error=error.stack;console.error(error);process.exitCode=1;}
finally{
  await context?.close();await browser?.close();
  if(running?.child.exitCode===null && running?.child.signalCode===null){running.child.kill('SIGTERM');await waitExit(running.child);}
  await writeFile(path.join(out,'package-tests.json'),JSON.stringify(result,null,2)+'\n');
}
