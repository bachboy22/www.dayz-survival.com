// No storage, tracking, network, image synthesis or replacement navigation.
let art003Hero=null;let art003Dispose=()=>{};let art003UserPaused=false;
window.initArt003=function(){
 const hero=document.querySelector('[data-art003-hero]');if(hero===art003Hero)return;art003Dispose();art003Hero=hero;if(!hero)return;
 const button=hero.querySelector('[data-art003-motion]');const reduced=matchMedia('(prefers-reduced-motion: reduce)');let inView=true;let observer;let lastButtonFocus=false;
 const focus=event=>{if(event.target!==document.body)lastButtonFocus=event.target===button;};const pointer=event=>{if(!button.contains(event.target))lastButtonFocus=false;};document.addEventListener('focusin',focus);document.addEventListener('pointerdown',pointer);
 function sync(){const active=!reduced.matches&&!art003UserPaused&&!document.hidden&&inView;hero.classList.toggle('art003-motion-ready',!reduced.matches);hero.classList.toggle('art003-motion-enabled',active);if(reduced.matches&&(document.activeElement===button||(document.activeElement===document.body&&lastButtonFocus)))hero.querySelector('a')?.focus({preventScroll:true});button.hidden=reduced.matches;button.setAttribute('aria-pressed',String(art003UserPaused));button.textContent=art003UserPaused?'Reanudar ambiente':'Pausar ambiente';}
 const click=()=>{art003UserPaused=!art003UserPaused;sync();};button.addEventListener('click',click);document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',sync);
 if('IntersectionObserver' in window){observer=new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;sync();});observer.observe(hero);}
 art003Dispose=()=>{button.removeEventListener('click',click);document.removeEventListener('visibilitychange',sync);document.removeEventListener('focusin',focus);document.removeEventListener('pointerdown',pointer);reduced.removeEventListener('change',sync);observer?.disconnect();};sync();
};
window.initArt003();
