import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { catalog, type PrototypeArticle } from '../../src/data/catalog';
import { buildSearchIndex } from '../../src/lib/search-index';

function fixture(count = 100) {
  const articles: PrototypeArticle[] = structuredClone(catalog) as PrototypeArticle[];
  for (let i=4;i<=count;i++) articles.push({ ...structuredClone(catalog[0]!), id:`DEMO-${String(i).padStart(3,'0')}`,slug:`demo-carga-${i}`,title:`Ejemplo sintético de interfaz ${i}`,mapScope:i%2?'livonia':'general',level:i%3?'Inicial':'Consulta' });
  return buildSearchIndex(articles);
}
test('bounded pagination preserves totals, order, focus, filters, view and Back/Forward', async ({ page }) => {
  await page.route('**/search-index.json', route => route.fulfill({ json: fixture() }));
  await page.goto('/buscar/');
  const results=page.locator('#search-results');
  const cards=results.locator('[data-search-result]');
  await expect(results).toHaveAttribute('data-total','100');
  await expect(cards).toHaveCount(12);
  await expect(cards.first()).toHaveAttribute('data-content-id','DEMO-001');
  const next=page.getByRole('button',{name:'Página siguiente',exact:true});
  await next.focus();await page.keyboard.press('Enter');
  await expect(cards.first()).toHaveAttribute('data-content-id','DEMO-013');
  await expect(next).toBeFocused();await expect(page).toHaveURL(/page=2/);
  await expect(page.locator('#search-status')).toContainText('Página 2 de 9');
  await page.getByLabel('Vista de resultados').selectOption('card');
  await expect(page).toHaveURL(/type=card/);
  await expect(cards).toHaveCount(12);
  await expect(cards.first().locator('[data-result-link]')).toHaveAttribute('href','/fichas/leer-una-ficha/');
  await page.getByLabel('Ámbito de prueba',{exact:true}).focus();
  await page.getByLabel('Ámbito de prueba',{exact:true}).selectOption('livonia');
  await expect(results).toHaveAttribute('data-total','49');
  await expect(cards).toHaveCount(12);
  await expect(page.getByLabel('Ámbito de prueba',{exact:true})).toBeFocused();
  await page.goBack();
  await expect(page.getByLabel('Ámbito de prueba',{exact:true})).toHaveValue('');
  await expect(results).toHaveAttribute('data-total','100');
  await expect(page.getByLabel('Vista de resultados')).toHaveValue('card');
  await page.goBack();
  await expect(page.getByLabel('Vista de resultados')).toHaveValue('manual');
  await expect(cards.first()).toHaveAttribute('data-content-id','DEMO-013');
  await page.goForward();await page.goForward();
  await expect(results).toHaveAttribute('data-total','49');
  await page.reload();await expect(results).toHaveAttribute('data-total','49');
  await expect(page.getByLabel('Vista de resultados')).toHaveValue('card');
  const reset=page.getByRole('button',{name:'Limpiar búsqueda y filtros'});
  await reset.focus();await page.keyboard.press('Space');
  await expect(results).toHaveAttribute('data-total','100');await expect(reset).toBeFocused();
  for(let i=0;i<8;i++){await next.focus();await page.keyboard.press('Enter');}
  await expect(cards).toHaveCount(4);await expect(cards.first()).toHaveAttribute('data-content-id','DEMO-097');
  await expect(next).toHaveAttribute('aria-disabled','true');await expect(next).toBeFocused();
  await page.keyboard.press('Enter');await expect(cards).toHaveCount(4);await expect(next).toBeFocused();
  await page.getByRole('searchbox').fill('sin-coincidencias');
  await expect(results).toBeHidden();await expect(cards).toHaveCount(0);
  await expect(page.getByRole('searchbox')).toBeFocused();await expect(page.locator('#search-status')).toContainText('0 resultados');
  await page.getByRole('searchbox').fill('interfaz');await expect(cards).toHaveCount(12);
  const anchor=page.getByRole('link',{name:'Ir a los resultados →'});await anchor.focus();await page.keyboard.press('Enter');await expect(page.locator('#results-heading')).toBeFocused();
  expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()).violations).toEqual([]);
});
test('SSR cards are preserved at initial readiness, and navigation is bounded at 320 CSS px', async ({ page }) => {
  await page.route('**/search-index.json', async route=>{await new Promise(r=>setTimeout(r,300));await route.fulfill({json:buildSearchIndex(catalog)});});
  await page.goto('/buscar/');
  await page.evaluate(()=>{ (window as any).__originalCard=document.querySelector('[data-content-id]'); });
  await expect(page.locator('#search-results')).toHaveAttribute('data-search-ready','true');
  expect(await page.evaluate(()=> (window as any).__originalCard===document.querySelector('[data-content-id]'))).toBe(true);
  await page.setViewportSize({width:320,height:900});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  await expect(page.getByRole('button',{name:'Página siguiente',exact:true})).toHaveAttribute('aria-disabled','true');
});
for (const failure of ['http','approval','markup']) test(`failed/unsafe index (${failure}) preserves the static fallback without untrusted content`, async ({page})=>{
  await page.route('**/search-index.json',route=>{
    if(failure==='http')return route.fulfill({status:503,body:'Unavailable'});
    if(failure==='markup')return route.fulfill({contentType:'application/json',body:'<svg onload="window.pwned=true">'});
    const index=fixture();(index.entries[0] as any).editorialStatus='approved';return route.fulfill({json:index});
  });
  await page.goto('/buscar/');
  await expect(page.locator('#search-status')).toContainText('No se pudo cargar el índice');
  await expect(page.locator('#static-search-pages')).toBeVisible();
  await expect(page.locator('[data-search-result]')).toHaveCount(3);
  await expect(page.locator('#search-pagination')).toBeHidden();
  expect(await page.evaluate(()=>'pwned' in window)).toBe(false);
  await page.getByRole('searchbox').fill('interfaz');
  await expect(page.locator('#search-status')).toContainText('no se aplican');
});
test('index titles/summary remain plain text and cannot inject HTML or approval',async({page})=>{
  const index=fixture();(index.entries[3] as any).title='<img src=x onerror="window.pwned=true">';
  await page.route('**/search-index.json',route=>route.fulfill({json:index}));
  await page.goto('/buscar/');await expect(page.locator('#search-results')).toHaveAttribute('data-total','100');
  await expect(page.locator('#search-results img')).toHaveCount(0);
  await expect(page.locator('h3').filter({hasText:'<img src=x'})).toBeVisible();
  expect(await page.evaluate(()=>'pwned' in window)).toBe(false);
  await expect(page.getByRole('main')).not.toContainText('VERIFICADO_VERSION');
});
test('specific DEMO metadata, 404 meaning and historical microcopy stay distinct from indexing/editorial approval',async({page})=>{
  const routes=['/','/aprender/','/manual/','/buscar/','/fichas/','/atlas/','/atlas/chernarus/','/atlas/livonia/','/herramientas/','/fuentes/','/acerca/','/404.html',...catalog.map(a=>`/manual/${a.slug}/`),...catalog.map(a=>`/fichas/${a.slug}/`)];
  const titles=new Set<string>();const descriptions=new Set<string>();
  for(const route of routes){
    expect((await page.goto(route))?.status()).toBe(200);
    titles.add(await page.title());const description=await page.locator('meta[name=description]').getAttribute('content');expect(description).toBeTruthy();descriptions.add(description!);
    await expect(page.locator('meta[name=robots]')).toHaveAttribute('content',/noindex.*nofollow/);
    await expect(page.locator('link[rel=canonical]')).toHaveCount(0);
  }
  expect(titles.size).toBe(18);expect(descriptions.size).toBe(18);
  const missing=await page.goto('/ruta-demostracion-ausente/');expect(missing?.status()).toBe(404);await expect(page).toHaveTitle(/Página no encontrada/);
  await page.goto('/fuentes/');await expect(page.getByRole('main')).toContainText('Producto web 0.1.0');await expect(page.getByRole('main')).toContainText('Historial: el MVP web v0.1');
  await expect(page.getByRole('main')).toContainText('CODEX-PERF-001');await expect(page.getByRole('main')).toContainText('Fuente Maestra editorial v0.16.1');
});
test('no-JS search explicitly remains a static directory and requests no index',async({browser,baseURL})=>{
  const context=await browser.newContext({javaScriptEnabled:false});const page=await context.newPage();const requests:string[]=[];page.on('request',r=>requests.push(r.url()));
  try{await page.goto(baseURL+'/buscar/?q=sin-coincidencias');await expect(page.locator('[data-search-result]')).toHaveCount(3);await expect(page.getByText('La consulta y los filtros de la URL no se aplican sin JavaScript.',{exact:false})).toBeVisible();expect(requests.some(r=>r.includes('search-index.json'))).toBe(false);}finally{await context.close();}
});
