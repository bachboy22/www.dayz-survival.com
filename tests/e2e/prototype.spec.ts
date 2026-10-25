import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir } from 'node:fs/promises';
import { catalog } from '../../src/data/catalog';

const newRoutes = ['/aprender/', '/herramientas/', '/atlas/', ...catalog.slice(1).map(a => `/manual/${a.slug}/`), ...catalog.map(a => `/fichas/${a.slug}/`)];
for (const route of newRoutes) test(`${route} prototype semantics and axe`, async ({ page }) => {
  expect((await page.goto(route))?.status()).toBe(200);
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  await expect(page.getByRole('main')).toContainText(/DEMO|demostración/i);
  expect((await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()).violations).toEqual([]);
});
test('six navigation areas work and old routes are preserved', async ({ page }) => {
  for (const [name, route] of [['Inicio','/'],['Aprender','/aprender/'],['Manual','/manual/'],['Atlas','/atlas/'],['Herramientas','/herramientas/'],['Acerca','/acerca/']]) {
    await page.goto('/');
    const toggle = page.locator('.menu-toggle');
    if (await toggle.isVisible()) { await toggle.focus(); await page.keyboard.press('Enter'); }
    const link = page.getByRole('navigation', { name: 'Navegación principal' }).getByRole('link', { name, exact: true });
    await link.focus(); await page.keyboard.press('Enter');
    await expect(page).toHaveURL(new RegExp(`${route!.replaceAll('/', '\\/')}$`));
    if (await toggle.isVisible()) { await toggle.focus(); await page.keyboard.press('Enter'); }
    await expect(page.getByRole('navigation', { name: 'Navegación principal' }).getByRole('link', { name, exact: true })).toHaveAttribute('aria-current','page');
  }
});
test('search shows multiple records, combines filters, restores URL and safely announces', async ({ page }) => {
  await page.goto('/buscar/?q=interfaz');
  const cards = page.locator('[data-search-result]:visible');
  const input = page.getByRole('searchbox');
  await expect(cards).toHaveCount(3);
  await page.getByLabel('Ámbito de prueba', { exact: true }).selectOption('livonia');
  await expect(cards).toHaveCount(1);
  await expect(cards.first()).toHaveAttribute('data-content-id','DEMO-003');
  await page.getByLabel('Nivel de lectura').selectOption('Consulta');
  await expect(page.locator('#no-results')).toBeVisible();
  await page.getByRole('button', { name: 'Limpiar búsqueda y filtros' }).focus();
  await page.keyboard.press('Enter');
  await expect(cards).toHaveCount(3);
  await expect(page.getByRole('button', { name: 'Limpiar búsqueda y filtros' })).toBeFocused();
  await expect(page.locator('#search-status')).toContainText('3 resultados');
  await page.getByLabel('Vista de resultados').selectOption('card');
  await page.getByLabel('Estado de evidencia').selectOption('demo');
  await page.getByLabel('Ámbito de prueba', { exact: true }).selectOption('livonia');
  await page.reload();
  await expect(page.getByLabel('Vista de resultados')).toHaveValue('card');
  await expect(page.getByLabel('Ámbito de prueba', { exact: true })).toHaveValue('livonia');
  await expect(cards).toHaveCount(1);
  const target = cards.first().locator('[data-result-link]');
  await target.focus(); await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/fichas\/explorar-un-atlas-pendiente\//);
  await page.goto('/buscar/?map=invalid&type=invalid&q=%3Cimg%20src%3Dx%20onerror%3Dwindow.pwned%3Dtrue%3E');
  await expect(page.getByLabel('Ámbito de prueba', { exact: true })).toHaveValue('');
  await expect(page.getByLabel('Vista de resultados')).toHaveValue('manual');
  await expect(page.locator('#no-results')).toBeVisible();
  expect(await page.evaluate(() => 'pwned' in window)).toBe(false);
  await expect(input).toHaveCount(1);
});
test('every demo has distinct quick and long views, complete decisions, version panel and valid references', async ({ page }) => {
  for (const article of catalog) {
    await page.goto(`/manual/${article.slug}/`);
    const modes = page.getByRole('navigation', { name:'Velocidad de lectura' });
    const quick = modes.getByRole('link', { name:'Ficha rápida · consulta breve' });
    await quick.focus(); await page.keyboard.press('Enter');
    await expect(page).toHaveURL(new RegExp(`/fichas/${article.slug}/`));
    for (const label of ['Situación','Decisión inmediata','Error a evitar','Dos señales','Salida']) await expect(page.locator('.field-decisions dt').filter({ hasText: new RegExp(`^${label}$`) })).toBeVisible();
    await page.getByRole('link', { name:'Leer el artículo completo →', exact:true }).click();
    await expect(page).toHaveURL(new RegExp(`/manual/${article.slug}/`));
    await expect(page.getByRole('main')).toContainText('Build evaluada');
    await expect(page.getByRole('main')).toContainText('Ninguna');
    await expect(page.getByRole('main')).toContainText('Solo prototipo DEMO');
    const broken = await page.locator('main a[href^="#"]').evaluateAll(nodes => nodes.map(n => n.getAttribute('href')!).filter(h => !document.getElementById(h.slice(1))));
    expect(broken).toEqual([]);
  }
});
test('all prototype pages reflow at 320px, tablet and desktop with focus and screenshots', async ({ page }, info) => {
  test.setTimeout(120_000);
  await mkdir('artifacts/design-001-b', { recursive:true });
  for (const width of [320,768,1440]) {
    await page.setViewportSize({ width, height:960 });
    for (const route of ['/', '/buscar/', '/manual/', '/manual/distinguir-los-estados/', '/fichas/explorar-un-atlas-pendiente/', '/atlas/', '/aprender/', '/herramientas/']) {
      await page.goto(route);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${width} ${route}`).toBe(true);
      if (route === '/buscar/') {
        await expect(page.locator('[data-search-result]:visible')).toHaveCount(3);
        await page.getByLabel('Ámbito de prueba', { exact:true }).selectOption('livonia');
        await expect(page.locator('[data-search-result]:visible')).toHaveCount(1);
      }
      if (['/', '/buscar/', '/manual/distinguir-los-estados/', '/atlas/'].includes(route)) {
        const name = `${info.project.name}-${width}-${route === '/' ? 'home' : route.split('/')[1]}.png`;
        await page.screenshot({ path:`artifacts/design-001-b/${name}`,fullPage:true });
      }
    }
  }
});
test('local navigation has no broken destinations, no remote requests and no executable query input', async ({ page, request, baseURL }) => {
  test.setTimeout(120_000);
  const external: string[] = []; const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.route('**/*', route => {
    if (!route.request().url().startsWith(baseURL!)) { external.push(route.request().url()); return route.abort(); }
    return route.continue();
  });
  const targets = new Set<string>();
  for (const route of ['/', '/manual/', '/buscar/', '/fichas/', '/fuentes/', '/acerca/', '/atlas/chernarus/', '/atlas/livonia/', ...newRoutes]) {
    await page.goto(route);
    const hrefs = await page.locator('a[href]').evaluateAll(nodes => nodes.map(n => (n as HTMLAnchorElement).href));
    hrefs.forEach(h => { if (h.startsWith(baseURL!)) targets.add(h); });
  }
  for (const target of targets) {
    const url = new URL(target); const response = await request.get(url.origin + url.pathname + url.search);
    expect(response.status(), target).toBe(200);
    if (url.hash) {
      await page.goto(target);
      expect(await page.evaluate(hash => Boolean(document.getElementById(decodeURIComponent(hash.slice(1)))),url.hash),target).toBe(true);
    }
  }
  expect(external).toEqual([]); expect(errors).toEqual([]);
});
