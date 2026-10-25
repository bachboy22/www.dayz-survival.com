import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '@playwright/test';

const routes = [
  '/', '/manual/', '/manual/leer-una-ficha/', '/fichas/', '/buscar/',
  '/atlas/chernarus/', '/atlas/livonia/', '/fuentes/', '/acerca/',
] as const;

for (const route of routes) {
  test(`${route} has an accessible, responsive document`, async ({ page }) => {
    const response = await page.goto(route);
    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(/DAYZ.SURVIVAL/i);
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
    await expect(page.getByRole('main')).toHaveCount(1);
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    await expect(page.getByText(/demostración/i).first()).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    expect(overflow, `Horizontal overflow on ${route}`).toBe(false);
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
  });
}

test('reader and quick card cross-reference each other', async ({ page }) => {
  await page.goto('/manual/');
  await page.getByRole('main').getByRole('link', { name: /Cómo leer una ficha de campo/i }).first().click();
  await expect(page).toHaveURL(/\/manual\/leer-una-ficha\//);
  await expect(page.getByRole('main')).toContainText(/\d+\s*min/);
  await page.getByRole('main').locator('a[href^="/fichas/"]').first().click();
  await expect(page).toHaveURL(/\/fichas\//);
  await page.getByRole('main').locator('a[href^="/manual/leer-una-ficha/"]').first().click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Cómo leer una ficha de campo/i);
});

test('search normalizes accents, filters tags, and recovers from no results', async ({ page }) => {
  await page.goto('/buscar/');
  const input = page.getByPlaceholder('Buscar en el manual', { exact: true });
  const results = page.locator('#search-results');
  await input.fill('como');
  await expect(results.getByRole('heading', { level: 3 }).getByRole('link', { name: /Cómo leer una ficha de campo/i })).toBeVisible();
  await input.fill('cuaderno');
  await expect(results.getByRole('heading', { level: 3 }).getByRole('link', { name: /Cómo leer una ficha de campo/i })).toBeVisible();
  await page.getByRole('button', { name: 'Lectura', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Lectura', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(results.getByRole('heading', { level: 3 }).getByRole('link', { name: /Cómo leer una ficha de campo/i })).toBeVisible();
  await input.fill('zzzz-no-coincide');
  await expect(page.getByText('No se encontraron resultados', { exact: false })).toBeVisible();
  await input.fill('');
  await expect(results.getByRole('heading', { level: 3 }).getByRole('link', { name: /Cómo leer una ficha de campo/i })).toBeVisible();
});

test('skip link moves keyboard focus to the content', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'Saltar al contenido' });
  await expect(skip).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('main')).toBeFocused();
});

test('reader text size controls change readable text and keep safe bounds', async ({ page }) => {
  await page.goto('/manual/leer-una-ficha/');
  const paragraph = page.locator('.reader section p').first();
  const smaller = page.getByRole('button', { name: 'Reducir tamaño del texto' });
  const larger = page.getByRole('button', { name: 'Aumentar tamaño del texto' });
  await expect(smaller).toBeDisabled();
  const original = await paragraph.evaluate(el => parseFloat(getComputedStyle(el).fontSize));
  await larger.click();
  expect(await paragraph.evaluate(el => parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThan(original);
  await larger.click();
  await larger.click();
  await expect(larger).toBeDisabled();
  await smaller.click();
  await smaller.click();
  await smaller.click();
  await expect(smaller).toBeDisabled();
  expect(await paragraph.evaluate(el => parseFloat(getComputedStyle(el).fontSize))).toBe(original);
});

test('primary navigation remains usable on a small screen', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'Mobile menu behavior only');
  await page.goto('/');
  const menu = page.locator('button[aria-controls="primary-navigation"]');
  await expect(menu).toHaveAccessibleName('Abrir menú');
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
  await menu.click();
  await expect(menu).toHaveAttribute('aria-expanded', 'true');
  await expect(menu).toHaveAccessibleName('Cerrar menú');
  await page.getByRole('navigation', { name: /principal/i }).getByRole('link', { name: 'Manual', exact: true }).click();
  await expect(page).toHaveURL(/\/manual\//);
});

test('demo pages and index do not expose executable user input', async ({ page }) => {
  await page.goto('/buscar/');
  await page.getByPlaceholder('Buscar en el manual', { exact: true }).fill('<img src=x onerror="window.__injected=true">');
  await expect(page.getByText('No se encontraron resultados', { exact: false })).toBeVisible();
  expect(await page.evaluate(() => '__injected' in window)).toBe(false);
});

test('article text and section links work without JavaScript', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  try {
    await page.goto(`${baseURL}/manual/leer-una-ficha/`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Cómo leer una ficha de campo/i);
    await expect(page.getByRole('main').getByRole('paragraph').first()).not.toBeEmpty();
    const brokenAnchors = await page.getByRole('main').locator('a[href^="#"]').evaluateAll((anchors) => anchors
      .map((anchor) => anchor.getAttribute('href') ?? '')
      .filter((href) => href.length > 1 && !document.getElementById(decodeURIComponent(href.slice(1)))));
    expect(brokenAnchors).toEqual([]);
  } finally {
    await context.close();
  }
});

test('capture home and article screenshots', async ({ page }, testInfo) => {
  const directory = path.resolve('artifacts/screenshots');
  await mkdir(directory, { recursive: true });
  for (const [label, route] of [['home', '/'], ['article', '/manual/leer-una-ficha/']] as const) {
    await page.goto(route);
    await page.evaluate(() => document.fonts.ready);
    const target = path.join(directory, `${testInfo.project.name}-${label}.png`);
    await page.screenshot({ path: target, fullPage: true, animations: 'disabled' });
    await testInfo.attach(`${testInfo.project.name}-${label}`, { path: target, contentType: 'image/png' });
  }
});
