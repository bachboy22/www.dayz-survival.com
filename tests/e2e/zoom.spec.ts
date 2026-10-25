import { test, expect, chromium, devices, type Page, type CDPSession } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const origin = 'http://127.0.0.1:4321';
const directory = path.resolve('artifacts/zoom');
const routes = ['/', '/manual/', '/manual/leer-una-ficha/', '/fichas/', '/buscar/', '/atlas/chernarus/', '/atlas/livonia/', '/fuentes/', '/acerca/', '/aprender/', '/herramientas/', '/atlas/', '/manual/distinguir-los-estados/', '/manual/explorar-un-atlas-pendiente/', '/fichas/leer-una-ficha/', '/fichas/distinguir-los-estados/', '/fichas/explorar-un-atlas-pendiente/'];
const labels: Record<string, string> = { '/': 'home', '/manual/leer-una-ficha/': 'reader', '/buscar/': 'search', '/atlas/': 'atlas', '/aprender/': 'learn' };

async function measure(page: Page) {
  return page.evaluate(() => ({
    layoutWidth: innerWidth, layoutHeight: innerHeight, documentWidth: document.documentElement.scrollWidth,
    devicePixelRatio, visualScale: visualViewport?.scale, visualWidth: visualViewport?.width,
    visualHeight: visualViewport?.height,
  }));
}

async function assertReflow(page: Page) {
  const metrics = await measure(page);
  expect(metrics.documentWidth).toBeLessThanOrEqual(metrics.layoutWidth + 1);
  // Check controls and text boxes rather than hiding overflow at the document edge.
  const outside = await page.locator('button,input,h1,h2,h3,p,small').evaluateAll(elements => elements
    .filter(element => element.getClientRects().length && getComputedStyle(element).position !== 'absolute')
    .filter(element => { const rect = element.getBoundingClientRect(); return rect.left < -1 || rect.right > innerWidth + 1; })
    .map(element => element.outerHTML.slice(0, 160)));
  expect(outside).toEqual([]);
  return metrics;
}

// Browser-zoom screenshots must use CDP device-independent content dimensions.
// Playwright's CSS-size fullPage clipping otherwise captures only a fraction at 400%.
async function captureZoom(cdp: CDPSession, filename: string, fullPage: boolean, expectedWidth = 1280) {
  const metrics = await cdp.send('Page.getLayoutMetrics');
  const result = await cdp.send('Page.captureScreenshot', {
    format: 'png', fromSurface: true, captureBeyondViewport: fullPage,
    ...(fullPage ? { clip: { x: 0, y: 0, width: metrics.contentSize.width, height: metrics.contentSize.height, scale: 1 } } : {}),
  });
  const bytes = Buffer.from(result.data, 'base64');
  expect(bytes.readUInt32BE(16)).toBe(expectedWidth);
  await writeFile(filename, bytes);
}

async function exerciseReader(page: Page) {
  const more = page.getByRole('button', { name: 'Aumentar tamaño del texto' });
  const less = page.getByRole('button', { name: 'Reducir tamaño del texto' });
  await more.focus();
  for (let step = 0; step < 3; step++) await page.keyboard.press('Enter');
  await expect(more).toBeFocused();
  await expect(more).toHaveAttribute('aria-disabled', 'true');
  await expect(page.locator('#text-size-status')).toContainText('135 %');
  await assertReflow(page);
  return { more, less };
}

for (const factor of [2, 4]) {
  test(`desktop browser zoom ${factor * 100}%: all prototype routes, keyboard, reader and search`, async ({}, testInfo) => {
    test.setTimeout(150_000);
    await mkdir(directory, { recursive: true });
    const profile = await mkdtemp(path.join(tmpdir(), 'dayz-browser-zoom-'));
    const extension = fileURLToPath(new URL('../fixtures/zoom-extension/', import.meta.url));
    const context = await chromium.launchPersistentContext(profile, {
      channel: 'chromium', headless: true, viewport: { width: 1280, height: 960 }, reducedMotion: 'reduce',
      args: [`--disable-extensions-except=${extension}`, `--load-extension=${extension}`],
    });
    const records: object[] = [];
    try {
      const worker = context.serviceWorkers()[0] ?? await context.waitForEvent('serviceworker');
      const page = context.pages()[0] ?? await context.newPage();
      const cdp = await context.newCDPSession(page);
      await page.goto(origin);
      const setZoom = () => worker.evaluate(async ({ origin, factor }) => {
        // This isolated test extension uses the browser's zoom API, not CSS zoom,
        // a resized viewport, deviceScaleFactor, or CDP pinch emulation.
        const api = (globalThis as any).chrome;
        const tabs = await api.tabs.query({});
        const tab = tabs.find((entry: any) => entry.url?.startsWith(origin));
        await api.tabs.setZoomSettings(tab.id, { mode: 'automatic', scope: 'per-tab' });
        await api.tabs.setZoom(tab.id, factor);
        return api.tabs.getZoom(tab.id) as Promise<number>;
      }, { origin, factor });
      const actual = await setZoom();
      expect(actual).toBeCloseTo(factor, 5);
      await expect.poll(() => page.evaluate(() => innerWidth)).toBe(Math.round(1280 / factor));
      for (const route of routes) {
        await page.goto(origin + route);
        expect(await setZoom()).toBeCloseTo(factor, 5);
        await expect.poll(() => page.evaluate(() => innerWidth)).toBe(Math.round(1280 / factor));
        let state = 'default';
        if (route === '/manual/leer-una-ficha/') {
          await exerciseReader(page);
          state = 'A+ maximum (135% relative text)';
        }
        if (route === '/buscar/') {
          await page.getByRole('searchbox').fill('interfaz');
          await expect(page.locator('[data-search-result]:visible')).toHaveCount(3);
          await page.getByLabel('Ámbito de prueba', { exact: true }).selectOption('livonia');
          await expect(page.locator('[data-search-result]:visible')).toHaveCount(1);
          await page.getByLabel('Ámbito de prueba', { exact: true }).selectOption('');
          await page.getByRole('searchbox').fill('sin-coincidencias');
          await expect(page.locator('#search-status')).toContainText('0 resultados');
          state = 'empty results, search focused';
        }
        const metrics = await assertReflow(page);
        expect(metrics.layoutWidth).toBe(Math.round(1280 / factor));
        expect(metrics.devicePixelRatio).toBeCloseTo(factor, 5);
        expect(metrics.visualScale).toBe(1);
        const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
        expect(result.violations).toEqual([]);
        const label = labels[route];
        const screenshots: string[] = [];
        if (label) {
          for (const fullPage of [false, true]) {
            const name = `desktop-${factor * 100}-${label}-${fullPage ? 'full' : 'viewport'}.png`;
            await captureZoom(cdp, path.join(directory, name), fullPage);
            screenshots.push(name);
            await testInfo.attach(name, { path: path.join(directory, name), contentType: 'image/png' });
          }
        }
        records.push({ route, method: 'chrome.tabs.setZoom', actualFactor: actual, state, metrics, axeViolations: 0, screenshots });
      }
      // The reduced layout uses the actual mobile disclosure, with keyboard recovery.
      await page.goto(origin);
      await setZoom();
      await expect.poll(() => page.evaluate(() => innerWidth)).toBe(Math.round(1280 / factor));
      const toggle = page.locator('button[aria-controls="primary-navigation"]');
      await toggle.focus(); await page.keyboard.press('Enter');
      await expect(toggle).toHaveAttribute('aria-expanded', 'true');
      await page.keyboard.press('Tab');
      await expect(page.getByRole('navigation', { name: 'Navegación principal' }).getByRole('link', { name: 'Inicio', exact: true })).toBeFocused();
      await page.keyboard.press('Escape'); await expect(toggle).toBeFocused();
      await writeFile(path.join(directory, `desktop-${factor * 100}.json`), JSON.stringify(records, null, 2) + '\n');
    } finally { await context.close(); await rm(profile, { recursive: true, force: true }); }
  });

  test(`mobile pinch emulation ${factor * 100}%: distinct visual and layout viewports`, async ({}, testInfo) => {
    test.setTimeout(120_000);
    await mkdir(directory, { recursive: true });
    const browser = await chromium.launch();
    const context = await browser.newContext({ ...devices['Pixel 7'], deviceScaleFactor: 1, reducedMotion: 'reduce' });
    const page = await context.newPage();
    const cdp = await context.newCDPSession(page);
    const records: object[] = [];
    try {
      for (const route of routes) {
        await page.goto(origin + route);
        await cdp.send('Emulation.setPageScaleFactor', { pageScaleFactor: factor });
        await expect.poll(() => page.evaluate(() => visualViewport?.scale)).toBe(factor);
        if (route === '/manual/leer-una-ficha/') await exerciseReader(page);
        if (route === '/buscar/') {
          await page.getByRole('searchbox').fill('cuaderno');
          await expect(page.locator('#search-status')).toContainText('1 resultado');
        }
        const metrics = await assertReflow(page);
        expect(metrics.layoutWidth).toBe(412);
        expect(metrics.visualWidth).toBeCloseTo(412 / factor, 1);
        const label = labels[route];
        let screenshot: string | undefined;
        if (label) {
          screenshot = `mobile-pinch-${factor * 100}-${label}-viewport.png`;
          await captureZoom(cdp, path.join(directory, screenshot), false, 412);
          await testInfo.attach(screenshot, { path: path.join(directory, screenshot), contentType: 'image/png' });
        }
        records.push({ route, method: 'CDP mobile pinch emulation, not browser reflow zoom', requestedFactor: factor,
          state: route === '/manual/leer-una-ficha/' ? 'A+ maximum; external keyboard activation' : 'default', metrics, screenshot });
      }
      await writeFile(path.join(directory, `mobile-pinch-${factor * 100}.json`), JSON.stringify(records, null, 2) + '\n');
    } finally { await context.close(); await browser.close(); }
  });
}
