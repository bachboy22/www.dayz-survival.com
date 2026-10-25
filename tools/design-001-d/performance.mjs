// Synthetic load audit of the real catalog/search controller; does not edit the baseline site.
import { chromium } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, writeFile, symlink, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
const source=path.resolve(fileURLToPath(new URL('../..',import.meta.url)));
const out=path.resolve(process.argv[2] || 'artifacts/design-001-d/performance');
await mkdir(out,{recursive:true});
const baseline='6091b56667b9042c3da72e42fd1dc7e206b56b8f';
const files=execFileSync('git',['ls-tree','-r','--name-only',baseline],{cwd:source,encoding:'utf8'}).trim().split('\n');
const records=[];const browser=await chromium.launch();
try{
 for(const count of [100,500,900]){
  const root=await mkdtemp(path.join(tmpdir(),'DESIGN001D-carga-sintetica-'));
  let server;
  try{
   for(const name of files){const dest=path.join(root,name);await mkdir(path.dirname(dest),{recursive:true});await writeFile(dest,execFileSync('git',['show',baseline+':'+name],{cwd:source}));}
   await symlink(path.join(source,'node_modules'),path.join(root,'node_modules'),'dir');
   const original=await readFile(path.join(root,'src/data/catalog.ts'),'utf8');
   await writeFile(path.join(root,'src/data/catalog.original.ts'),original);
   const extras=[];
   for(let i=4;i<=count;i++){
    const id='DEMO-'+String(i).padStart(3,'0');
    extras.push({id,slug:'demo-carga-'+String(i).padStart(6,'0'),title:'DEMO de carga '+String(i).padStart(6,'0')+' · texto sintético',summary:'Registro DEMO para medir interfaz; no es un artículo del corpus ni una afirmación sobre DayZ.',tags:['Carga sintética','Demostración','Interfaz'],readingMinutes:2,
     metadata:{mode:'demo',editorialStatus:'demo',technicalStatus:'unverified',sourceVersion:null,map:'none',lane:'demo',notice:'DEMO de rendimiento: texto sintético, sin información del juego.'},mapScope:i%2?'livonia':'general',topic:'Lectura',level:i%3?'Inicial':'Consulta',publicationStatus:'demo-only',
     sections:[{id:'prueba-de-carga',title:'Texto sintético de interfaz',paragraphs:Array.from({length:6},(_,j)=>`DEMO ${i}, bloque ${j}. `+'Este texto solo sirve para medir búsqueda y representación de la interfaz. No describe objetos, lugares, parámetros ni mecánicas de DayZ. '.repeat(4))}],
     quickCard:{id:'DEMO-CARD-'+String(i).padStart(3,'0'),articleId:id,title:'Consulta DEMO '+i,items:['Ejemplo sintético.','Sin uso en juego.'],demonstration:true},fieldCard:{situation:'Medir interfaz DEMO.',decision:'Consultar el ejemplo.',avoid:'Usarlo como guía de juego.',signals:['DEMO visible.','Sin fuente real.'],exit:'Volver al índice de prueba.'},references:[{label:'Método del proyecto',href:'/fuentes/'}],relatedDemoIds:['DEMO-001']});
   }
   await writeFile(path.join(root,'src/data/catalog.ts'),`import { catalog as original } from './catalog.original';\nimport type { PrototypeArticle } from './catalog.original';\nexport * from './catalog.original';\nexport const catalog: readonly PrototypeArticle[] = [...original, ...${JSON.stringify(extras)}];\n`);
   const buildStart=performance.now();
   try{const log=execFileSync(process.execPath,[path.join(source,'node_modules/astro/bin/astro.mjs'),'build'],{cwd:root,encoding:'utf8',timeout:180000,maxBuffer:16*1024*1024});await writeFile(path.join(out,`build-${count}.txt`),log);}catch(error){await writeFile(path.join(out,`build-${count}.txt`),String(error.stdout||'')+String(error.stderr||''));throw error;}
   const buildMs=performance.now()-buildStart;
   const dist=path.join(root,'dist');
   const html=await readFile(path.join(dist,'buscar/index.html'));
   // This throwaway server is a fixed-file benchmark fixture, never distributed as the review server.
   const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml'};
   server=createServer(async(req,res)=>{try{const url=new URL(req.url,'http://127.0.0.1');let name=decodeURIComponent(url.pathname);if(name.endsWith('/'))name+='index.html';const file=path.resolve(dist,'.'+name);if(!file.startsWith(dist+path.sep))throw Error('outside fixture');const bytes=await readFile(file);res.writeHead(200,{'Content-Type':types[path.extname(file)]||'text/plain','Cache-Control':'no-store'});res.end(bytes);}catch{res.writeHead(404);res.end('Fixture not found');}});
   await new Promise(resolve=>server.listen({host:'127.0.0.1',port:0},resolve));
   const origin='http://127.0.0.1:'+server.address().port;
   for(const cpu of [1,4]){
    const context=await browser.newContext({viewport:{width:1280,height:900}});
    const page=await context.newPage();const cdp=await context.newCDPSession(page);
    await cdp.send('Emulation.setCPUThrottlingRate',{rate:cpu});
    const errors=[],external=[];page.on('pageerror',e=>errors.push(e.message));
    await page.route('**/*',route=>new URL(route.request().url()).origin===origin?route.continue():(external.push(route.request().url()),route.abort()));
    await page.addInitScript(()=>{globalThis.__auditLongTasks=[];new PerformanceObserver(list=>{globalThis.__auditLongTasks.push(...list.getEntries().map(e=>({start:e.startTime,duration:e.duration})));}).observe({type:'longtask',buffered:true});});
    await page.goto(origin+'/buscar/');await page.waitForLoadState('networkidle');
    assert.equal(await page.locator('[data-search-result]:visible').count(),count);
    const initial=await page.evaluate(()=>({navigation:performance.getEntriesByType('navigation')[0].toJSON(),resources:performance.getEntriesByType('resource').map(e=>({name:new URL(e.name).pathname,bytes:e.decodedBodySize,duration:e.duration})),domNodes:document.getElementsByTagName('*').length,longTasks:globalThis.__auditLongTasks.slice()}));
    const samples=[];
    for(const query of ['carga','000004','no-coincide-con-el-catalogo','interfaz']){
     for(let repeat=0;repeat<5;repeat++){
      const measured=await page.evaluate(async(query)=>{const input=document.querySelector('#search-input');const start=performance.now();input.value=query;input.dispatchEvent(new Event('input',{bubbles:true}));const sync=performance.now()-start;await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));return {query,syncHandlerMs:sync,inputToFrameMs:performance.now()-start,visible:[...document.querySelectorAll('[data-search-result]')].filter(e=>!e.hidden).length};},query);
      assert.equal(measured.visible, query==='carga'?count-3:query==='000004'?1:query==='interfaz'?count:0, 'Synthetic search counts');
      samples.push(measured);
     }
    }
    await page.getByLabel('Ámbito de prueba',{exact:true}).selectOption('livonia');
    const filtered=await page.locator('[data-search-result]:visible').count();assert(filtered>0 && filtered<count);
    assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
    const percentile=(values,p)=>values.toSorted((a,b)=>a-b)[Math.ceil(values.length*p)-1];
    records.push({count,cpuThrottle:cpu,buildMs,searchHtmlBytes:html.length,initial,samples,p95SyncHandlerMs:percentile(samples.map(s=>s.syncHandlerMs),.95),p95InputToFrameMs:percentile(samples.map(s=>s.inputToFrameMs),.95),filterVisible:filtered,errors,externalRequests:external});
    await context.close();console.log('PASS synthetic count='+count+' CPU='+cpu+' p95 sync='+records.at(-1).p95SyncHandlerMs.toFixed(1)+'ms');
   }
  }finally{if(server){server.closeAllConnections();await new Promise(r=>server.close(r));}await rm(root,{recursive:true,force:true});}
 }
}finally{await browser.close();await writeFile(path.join(out,'performance.json'),JSON.stringify({baseline,platform:process.platform,node:process.version,browser:browser.version(),method:'Temporary source copy; only DEMO catalog enlarged; actual build and unmodified search controller; localhost/no remote network; 5 repeats/query; CPU throttle is emulation, not physical mobile.',records},null,2)+'\n');}
