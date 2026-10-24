import { test, expect } from '@playwright/test';

test('heading levels do not skip and tab order never uses positive tabindex', async ({ page }) => {
  for (const route of ['/', '/manual/', '/manual/leer-una-ficha/', '/fichas/', '/buscar/', '/atlas/chernarus/', '/atlas/livonia/', '/fuentes/', '/acerca/']) {
    await page.goto(route);
    const levels = await page.locator('h1,h2,h3,h4,h5,h6').evaluateAll(elements => elements
      .filter(element => element.getClientRects().length > 0)
      .map(element => Number(element.tagName.slice(1))));
    expect(levels[0]).toBe(1);
    for (let index = 1; index < levels.length; index++) expect(levels[index]!).toBeLessThanOrEqual(levels[index - 1]! + 1);
    expect(await page.locator('[tabindex]').evaluateAll(nodes => nodes.every(node => Number(node.getAttribute('tabindex')) <= 0))).toBe(true);
  }
});

test('reader index keyboard activation moves focus to the named section', async ({ page }) => {
  await page.goto('/manual/leer-una-ficha/');
  const index = page.getByRole('navigation', { name: 'En este artículo' });
  const link = index.locator('a[href="#seguir-el-hilo"]');
  await link.focus();
  await page.keyboard.press('Enter');
  const target = page.locator('#seguir-el-hilo');
  await expect(target).toBeFocused();
  await expect(target).toBeInViewport();
  expect(await target.evaluate(element => getComputedStyle(element).outlineStyle)).not.toBe('none');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Ver esta ficha por separado →' })).toBeFocused();
  await page.getByRole('link', { name: 'Fuentes y notas de versión', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/fuentes\//);
});

test('search announcements include query and filter without moving focus', async ({ page }) => {
  await page.goto('/buscar/');
  const input = page.getByRole('searchbox');
  const status = page.locator('#search-status');
  await expect(status).toHaveAttribute('aria-live', 'polite');
  await expect(status).toHaveAttribute('aria-atomic', 'true');
  await input.fill('cuaderno');
  await expect(status).toContainText('1 resultado de demostración para «cuaderno»');
  await expect(input).toBeFocused();
  await input.fill('ficha'); // Still one result; live text must actually change.
  await expect(status).toContainText('para «ficha»');
  const filter = page.getByRole('button', { name: 'Lectura', exact: true });
  await filter.focus();
  await page.keyboard.press('Space');
  await expect(filter).toHaveAttribute('aria-pressed', 'true');
  await expect(status).toContainText('etiqueta Lectura');
  await expect(filter).toBeFocused();
  await input.fill('sin-coincidencias');
  await expect(status).toContainText('0 resultados');
  await expect(page.locator('#search-results')).toBeHidden();
  await expect(input).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/q=sin-coincidencias/);
});

test('mobile disclosure supports keyboard and breakpoint focus recovery', async ({ page }) => {
  await page.setViewportSize({ width: 640, height: 900 });
  await page.goto('/manual/');
  const toggle = page.locator('button[aria-controls="primary-navigation"]');
  await toggle.focus();
  await page.keyboard.press('Space');
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Tab');
  const nav = page.getByRole('navigation', { name: 'Navegación principal' });
  await expect(nav.getByRole('link', { name: 'Inicio', exact: true })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(toggle).toBeFocused();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(nav).toBeHidden();
  await page.setViewportSize({ width: 1280, height: 900 });
  await expect(nav.getByRole('link', { name: 'Manual', exact: true })).toBeFocused();
  await page.setViewportSize({ width: 320, height: 800 });
  await expect(toggle).toBeFocused();
});

test('reader controls retain focus at bounds and announce the resulting size', async ({ page }) => {
  await page.goto('/manual/leer-una-ficha/');
  const more = page.getByRole('button', { name: 'Aumentar tamaño del texto' });
  const less = page.getByRole('button', { name: 'Reducir tamaño del texto' });
  await more.focus();
  for (let index = 0; index < 3; index++) await page.keyboard.press('Enter');
  await expect(more).toBeFocused();
  await expect(more).toHaveAttribute('aria-disabled', 'true');
  // The inactive state must not fade the focus outline with parent opacity.
  await expect(more).toHaveCSS('opacity', '1');
  await expect(page.locator('#text-size-status')).toContainText('135 %');
  await page.keyboard.press('Enter');
  await expect(page.locator('#text-size-status')).toContainText('Nivel 4 de 4');
  await less.focus();
  for (let index = 0; index < 3; index++) await page.keyboard.press('Enter');
  await expect(less).toBeFocused();
  await expect(page.locator('#text-size-status')).toContainText('100 %');
  await page.emulateMedia({ forcedColors: 'active' });
  expect(await less.evaluate(element => getComputedStyle(element).outlineStyle)).not.toBe('none');
});
