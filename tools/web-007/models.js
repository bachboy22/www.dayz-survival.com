// WEB-007: progressive enhancement of the two approved-for-review models only.
window.initWeb007=function(){
 if(!document.body.classList.contains('web007'))return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 if(!reduced&&'IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){e.target.classList.add('w7-seen');observer.unobserve(e.target);}},{threshold:.07});for(const e of document.querySelectorAll('.w7-reveal')){e.classList.add('w7-waiting');observer.observe(e);}}
 const reader=document.querySelector('.w7-reader');if(reader)reader.style.setProperty('--reader-size','1.125rem');
};
let w7level=0;
document.addEventListener('click',event=>{
 const button=event.target.closest('button');if(!button||!document.body.classList.contains('web007')||!document.querySelector('.w7-reader'))return;
 if(!['text-larger','text-smaller'].includes(button.id))return;
 w7level=Math.max(0,Math.min(3,w7level+(button.id==='text-larger'?1:-1)));document.querySelector('.w7-reader').style.setProperty('--reader-size',(1.125+w7level*.125)+'rem');document.querySelector('#text-smaller').setAttribute('aria-disabled',String(w7level===0));document.querySelector('#text-larger').setAttribute('aria-disabled',String(w7level===3));document.querySelector('#text-size-status').textContent='Tamaño del texto: '+Math.round((1.125+w7level*.125)/1.125*100)+' %. Nivel '+(w7level+1)+' de 4.';
});
document.addEventListener('keydown',event=>{if(event.key!=='Escape')return;const menu=document.querySelector('.navigation');if(menu?.open){menu.open=false;menu.querySelector('summary').focus();}});
window.addEventListener('hashchange',()=>{w7level=0;});
window.initWeb007();
