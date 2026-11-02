import {chromium} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const origin=process.argv[2],output=process.argv[3];const catalog=JSON.parse(await fs.readFile('private/web005/catalog.json','utf8'));
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true});const records=[];let next=0;
try{await Promise.all([0,1].map(async()=>{const ctx=await browser.newContext({viewport:{width:320,height:960},reducedMotion:'reduce'});const p=await ctx.newPage();while(next<catalog.length){const e=catalog[next++];await p.goto(origin+'/articulos/'+e.id+'/');const axe=await new AxeBuilder({page:p}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();const metrics=await p.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth}));records.push({id:e.id,metrics,violations:axe.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)}))});if(records.length%50===0)console.log(records.length+' / 308');}await ctx.close();}));}finally{await browser.close();}
records.sort((a,b)=>a.id.localeCompare(b.id));await fs.writeFile(output,JSON.stringify({count:records.length,width:320,records},null,2));const failures=records.filter(r=>r.violations.length||r.metrics.scroll>r.metrics.width+1);console.log(JSON.stringify({audits:records.length,failures:failures.length}));assert.equal(failures.length,0,'See full article audit JSON');
