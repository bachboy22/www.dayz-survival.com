export {};
type Item={id:string;title:string;category:string;map:string;state:string;technical:string;normalized:string};
const norm=(s:string)=>s.normalize('NFD').replace(/\p{M}/gu,'').toLowerCase();
const form=document.querySelector<HTMLFormElement>('#catalog-search')!;
const list=document.querySelector<HTMLUListElement>('#results')!;
const status=document.querySelector<HTMLElement>('#search-status')!;
const prev=document.querySelector<HTMLButtonElement>('#previous')!;
const next=document.querySelector<HTMLButtonElement>('#next')!;
const keys=['q','family','map','state','technical'];let items:Item[]=[];let page=1;let timer:ReturnType<typeof setTimeout>;
function control(name:string){return form.elements.namedItem(name) as HTMLInputElement|HTMLSelectElement;}
function restore(){const p=new URLSearchParams(location.search);for(const key of keys)control(key).value=(p.get(key)??'').slice(0,key==='q'?200:80);page=Math.max(1,Number(p.get('page'))||1);}
function writeHistory(push=false){const p=new URLSearchParams();for(const key of keys)if(control(key).value)p.set(key,control(key).value);if(page>1)p.set('page',String(page));history[push?'pushState':'replaceState'](null,'',location.pathname+(p.size?'?'+p:''));}
function render(){
 const terms=norm(control('q').value.slice(0,200)).trim().split(/\s+/).filter(Boolean);
 const matches=items.filter(e=>terms.every(t=>e.normalized.includes(t))&&(!control('family').value||e.category===control('family').value)&&(!control('map').value||e.map===control('map').value)&&(!control('state').value||e.state===control('state').value)&&(!control('technical').value||(control('technical').value==='pending'&&e.technical==='PENDIENTE_DE_REVISION_ATOMICA')));
 const pages=Math.max(1,Math.ceil(matches.length/12));page=Math.min(pages,page);const fragment=document.createDocumentFragment();
 for(const e of matches.slice((page-1)*12,page*12)){
  const li=document.createElement('li');li.className='card';const meta=document.createElement('span');meta.className='meta';meta.textContent=e.id+' / '+e.category+' / '+e.map;
  const h=document.createElement('h2');const a=document.createElement('a');a.href='/articulos/'+encodeURIComponent(e.id)+'/';a.textContent=e.title;h.append(a);
  const p=document.createElement('p');p.textContent=e.state.replaceAll('_',' ')+' · '+e.technical.replaceAll('_',' ');li.append(meta,h,p);fragment.append(li);
 }
 const focusInResults=list.contains(document.activeElement);list.replaceChildren(fragment);if(focusInResults)document.querySelector<HTMLElement>('#results-heading')?.focus();
 prev.setAttribute('aria-disabled',String(page===1));next.setAttribute('aria-disabled',String(page===pages));document.querySelector('#page-number')!.textContent=`Página ${page} de ${pages}`;
 (document.querySelector('#empty') as HTMLElement).hidden=matches.length!==0;
 clearTimeout(timer);timer=setTimeout(()=>{status.textContent=`${matches.length} artículos. ${matches.length?`Mostrando ${(page-1)*12+1}–${Math.min(page*12,matches.length)}.`:'Sin resultados.'}`;},200);
}
form.addEventListener('submit',e=>e.preventDefault());
form.addEventListener('input',e=>{if(!items.length)return;page=1;render();writeHistory(!(e.target instanceof HTMLInputElement));});
form.addEventListener('reset',()=>setTimeout(()=>{page=1;render();writeHistory(true);},0));
prev.addEventListener('click',()=>{if(prev.getAttribute('aria-disabled')==='false'){page--;render();writeHistory(true);}});
next.addEventListener('click',()=>{if(next.getAttribute('aria-disabled')==='false'){page++;render();writeHistory(true);}});
window.addEventListener('popstate',()=>{restore();render();});
restore();
fetch('/search-index.json',{credentials:'omit',cache:'no-store'}).then(r=>{if(!r.ok)throw Error('Index');return r.json();}).then((data:unknown)=>{
 if(!Array.isArray(data)||data.length!==308||new Set(data.map(e=>e.id)).size!==308||data.some(e=>!e||!/^((MAN|COM|EQP|CHR|MEC|GUI|ARC|LIV)-[A-Z0-9-]+)$/.test(e.id)||['title','category','map','state','technical','normalized'].some(k=>typeof e[k]!=='string')))throw Error('Invalid index');
 items=data;render();
}).catch(()=>{document.querySelector<HTMLElement>('#load-error')!.hidden=false;status.textContent='Búsqueda no disponible. Los índices por familia siguen disponibles.';prev.setAttribute('aria-disabled','true');next.setAttribute('aria-disabled','true');});
