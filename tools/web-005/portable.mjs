// Offline bridge for the same Astro-rendered pages. No service worker or network.
const data=JSON.parse(document.querySelector('#offline-pages').textContent);
let pageNumber=1,level=0;
const main=document.querySelector('main');
const norm=s=>s.normalize('NFD').replace(/\p{M}/gu,'').toLowerCase();
function renderSearch(){
 const form=document.querySelector('#catalog-search');if(!form)return;
 const field=n=>form.elements.namedItem(n).value;
 const words=norm(field('q').slice(0,200)).trim().split(/\s+/).filter(Boolean);
 const found=data.index.filter(e=>words.every(w=>e.normalized.includes(w))&&(!field('family')||field('family')===e.category)&&(!field('map')||field('map')===e.map)&&(!field('state')||field('state')===e.state)&&(!field('technical')||(field('technical')==='pending'&&e.technical==='PENDIENTE_DE_REVISION_ATOMICA')));
 const pages=Math.max(1,Math.ceil(found.length/12));pageNumber=Math.max(1,Math.min(pages,pageNumber));
 const nodes=found.slice((pageNumber-1)*12,pageNumber*12).map(e=>{const li=document.createElement('li');li.className='card';const m=document.createElement('p');m.className='meta';m.textContent=e.id+' / '+e.map;const h=document.createElement('h2');const a=document.createElement('a');a.href='/articulos/'+e.id+'/';a.textContent=e.title;h.append(a);const p=document.createElement('p');p.textContent=e.state.replaceAll('_',' ')+' · Técnica pendiente';li.append(m,h,p);return li;});
 document.querySelector('#results').replaceChildren(...nodes);document.querySelector('#empty').hidden=found.length!==0;
 document.querySelector('#search-status').textContent=found.length+' artículos. Mostrando '+(found.length?(pageNumber-1)*12+1:0)+'–'+Math.min(pageNumber*12,found.length)+'.';document.querySelector('#page-number').textContent='Página '+pageNumber+' de '+pages;document.querySelector('#previous').setAttribute('aria-disabled',String(pageNumber===1));document.querySelector('#next').setAttribute('aria-disabled',String(pageNumber===pages));
}
function mount(){
 const route=location.hash.slice(1)||'/';const [pathname,query]=route.split('?');
 const record=data.pages[pathname]??data.pages['/404.html'];main.innerHTML=record.main;document.title=record.title;pageNumber=1;level=0;
 const reader=document.querySelector('.reader');if(reader)reader.style.setProperty('--reader-size','1.02rem');
 document.querySelectorAll('header nav a').forEach(a=>{a.removeAttribute('aria-current');if(a.getAttribute('href')===pathname)a.setAttribute('aria-current','page');});document.querySelector('.navigation').open=false;
 const form=document.querySelector('#catalog-search');if(form){const p=new URLSearchParams(query);for(const key of ['q','family','map','state','technical'])form.elements.namedItem(key).value=(p.get(key)||'').slice(0,key==='q'?200:80);renderSearch();}
 main.focus();window.scrollTo(0,0);
}
function download(body,name,type){const url=URL.createObjectURL(new Blob([body],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
document.addEventListener('click',event=>{
 const target=event.target.closest('a,button');if(!target)return;
 if(target.tagName==='A'){
  const href=target.getAttribute('href');if(!href)return;
  if(href.startsWith('#')){event.preventDefault();const section=document.getElementById(href.slice(1));if(section){section.setAttribute('tabindex','-1');section.focus();section.scrollIntoView();}return;}
  if(data.files[href]){event.preventDefault();download(Uint8Array.from(atob(data.files[href]),c=>c.charCodeAt(0)),href.split('/').pop(),'text/plain;charset=utf-8');return;}
  if(href.startsWith('/')){event.preventDefault();location.hash=href;return;}
 }
 if(target.id==='previous'||target.id==='next'){if(target.getAttribute('aria-disabled')==='false'){pageNumber+=target.id==='next'?1:-1;renderSearch();}return;}
 if(target.id==='text-larger'||target.id==='text-smaller'){
  level=Math.max(0,Math.min(3,level+(target.id==='text-larger'?1:-1)));document.querySelector('.reader').style.setProperty('--reader-size',(1.02+level*.12)+'rem');document.querySelector('#text-smaller').setAttribute('aria-disabled',String(level===0));document.querySelector('#text-larger').setAttribute('aria-disabled',String(level===3));document.querySelector('#text-size-status').textContent='Tamaño del texto: '+Math.round((1.02+level*.12)/1.02*100)+' %. Nivel '+(level+1)+' de 4.';
 }
 if(target.id==='export-json'||target.id==='export-txt'){
  const format=target.id.endsWith('json')?'json':'txt';const fields=Object.fromEntries(new FormData(document.querySelector('#review-form')));const row={contract:'WEB-005',timestamp:new Date().toISOString(),automaticApproval:false,delivery:'offline-html',...fields};download(format==='json'?JSON.stringify(row,null,2):Object.entries(row).map(([k,v])=>k+': '+v).join('\r\n'),'DAYZ-SURVIVAL-WEB-005-REVISION.'+format,format==='json'?'application/json':'text/plain;charset=utf-8');document.querySelector('#export-status').textContent='Exportación local solicitada: '+format.toUpperCase()+'.';
 }
});
document.addEventListener('submit',e=>{e.preventDefault();if(e.target.id!=='catalog-search'){const q=new FormData(e.target).get('q');location.hash='/enciclopedia/?q='+encodeURIComponent(q??'');}});
document.addEventListener('input',e=>{if(e.target.closest('#catalog-search')){pageNumber=1;renderSearch();}});
document.addEventListener('reset',e=>{if(e.target.id==='catalog-search')setTimeout(()=>{pageNumber=1;renderSearch();},0);});
document.addEventListener('keydown',e=>{const menu=document.querySelector('.navigation');if(e.key==='Escape'&&menu.open){menu.open=false;menu.querySelector('summary').focus();}});
window.addEventListener('hashchange',mount);mount();
