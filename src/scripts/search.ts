import { validateSearchIndex, searchIndex, searchPage, SEARCH_PAGE_SIZE, SEARCH_MAP_LABELS, type SearchIndex, type SearchEntry } from '../lib/search-index';

const input = document.querySelector<HTMLInputElement>('#search-input');
const form = document.querySelector<HTMLFormElement>('.search-box');
const results = document.querySelector<HTMLElement>('#search-results');
const empty = document.querySelector<HTMLElement>('#no-results');
const status = document.querySelector<HTMLElement>('#search-status');
const heading = document.querySelector<HTMLElement>('#results-heading');
const template = document.querySelector<HTMLTemplateElement>('#search-card-template');
const previous = document.querySelector<HTMLButtonElement>('#search-previous');
const next = document.querySelector<HTMLButtonElement>('#search-next');
const tags = [...document.querySelectorAll<HTMLButtonElement>('[data-tag]')];
const controls = {
  map: document.querySelector<HTMLSelectElement>('#filter-map'), level: document.querySelector<HTMLSelectElement>('#filter-level'),
  type: document.querySelector<HTMLSelectElement>('#filter-type'), evidence: document.querySelector<HTMLSelectElement>('#filter-evidence'),
};
let index: SearchIndex | undefined;
let byId = new Map<string, SearchEntry>();
let selected = ''; let page = 1; let pages = 0; let failed = false;
let signature = [...(results?.querySelectorAll<HTMLElement>('[data-content-id]') ?? [])].map(c => c.dataset.contentId).join('|') + ':manual';
let announcement: ReturnType<typeof setTimeout> | undefined;
const announce = (message: string, delayed = true) => {
  clearTimeout(announcement);
  if (delayed) announcement = setTimeout(() => { if (status) status.textContent = message; }, 250);
  else if (status) status.textContent = message;
};
function readLocation() {
  const params = new URLSearchParams(location.search);
  if (input) input.value = (params.get('q') ?? '').slice(0, 200);
  selected = tags.some(b => b.dataset.tag === params.get('tag')) ? params.get('tag') ?? '' : '';
  const raw = params.get('page') ?? (location.pathname.startsWith('/buscar/pagina/') ? document.querySelector<HTMLElement>('[data-search-panel]')?.dataset.initialPage : '1');
  page = raw && /^\d{1,5}$/.test(raw) ? Math.max(1, Number(raw)) : 1;
  for (const [key, control] of Object.entries(controls)) if (control) {
    const value = params.get(key) ?? (key === 'type' ? 'manual' : '');
    control.value = [...control.options].some(o => o.value === value) ? value : control.options[0]!.value;
  }
}
function writeLocation(mode: 'push' | 'replace') {
  const params = new URLSearchParams();
  if (input?.value) params.set('q', input.value.slice(0, 200));
  if (selected) params.set('tag', selected);
  for (const [key, control] of Object.entries(controls)) if (control?.value && !(key === 'type' && control.value === 'manual')) params.set(key, control.value);
  if (page > 1) params.set('page', String(page));
  const url = '/buscar/' + (params.size ? '?' + params.toString() : '');
  if (location.pathname + location.search !== url) history[mode === 'push' ? 'pushState' : 'replaceState'](null, '', url);
}
function makeCard(entry: SearchEntry, cardView: boolean): HTMLElement {
  const card = template!.content.firstElementChild!.cloneNode(true) as HTMLElement;
  card.dataset.contentId = entry.id;
  const put = (slot: string, value: string) => { const node = card.querySelector(`[data-slot="${slot}"]`); if (node) node.textContent = value; };
  put('identity', `${entry.id} / ${entry.topic}`); put('summary', entry.summary);
  put('meta', `${entry.readingMinutes} min de lectura · ${SEARCH_MAP_LABELS[entry.mapScope]}`);
  const tagList = card.querySelector('[data-slot="tags"]');
  for (const tag of entry.tags) { const span = document.createElement('span'); span.className = 'tag'; span.textContent = tag; tagList?.append(span); }
  const href = `/${cardView ? 'fichas' : 'manual'}/${entry.slug}/`;
  const title = card.querySelector<HTMLAnchorElement>('[data-result-link]')!;
  title.href = href; title.textContent = entry.title;
  const action = card.querySelector<HTMLAnchorElement>('[data-result-action]')!;
  action.href = href; action.textContent = `${cardView ? 'Abrir la ficha rápida' : 'Abrir lectura extensa'}: ${entry.title} →`;
  return card;
}
function render(mode?: 'push' | 'replace', speak = true) {
  if (!input || !results || !empty || !status) return;
  tags.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.tag === selected)));
  if (!index) {
    if (mode) writeLocation(mode);
    if (failed) announce('No se pudo cargar el índice. La búsqueda y los filtros no se aplican; usa el listado estático sin filtros y sus enlaces.');
    return;
  }
  const filters = Object.fromEntries(Object.entries(controls).map(([k, c]) => [k, c?.value ?? '']));
  const matches = searchIndex(index, input.value, { ...filters, tag: selected });
  const view = searchPage(matches, page); page = view.page; pages = view.pages;
  const newSignature = view.entries.map(e => e.id).join('|') + ':' + filters.type;
  if (newSignature !== signature) {
    const active = document.activeElement;
    const wasInResults = active instanceof HTMLElement && results.contains(active);
    const focusedId = wasInResults ? active.closest<HTMLElement>('[data-content-id]')?.dataset.contentId : undefined;
    const focusedAction = wasInResults && active.hasAttribute('data-result-action');
    // Reuse current nodes when possible; never retain detached cards for the whole corpus.
    const current = new Map([...results.querySelectorAll<HTMLElement>('[data-content-id]')].map(c => [c.dataset.contentId!, c]));
    const cards = view.entries.map(e => filters.type === 'manual' && signature.endsWith(':manual') && current.has(e.id) ? current.get(e.id)! : makeCard(byId.get(e.id)!, filters.type === 'card'));
    results.replaceChildren(...cards); signature = newSignature;
    if (wasInResults) {
      const same = [...results.querySelectorAll<HTMLElement>('[data-content-id]')].find(c => c.dataset.contentId === focusedId);
      (same?.querySelector<HTMLElement>(focusedAction ? '[data-result-action]' : '[data-result-link]') ?? heading)?.focus();
    }
  }
  results.hidden = view.total === 0; empty.hidden = view.total !== 0;
  results.dataset.total = String(view.total); results.dataset.searchReady = 'true';
  previous?.setAttribute('aria-disabled', String(page <= 1)); next?.setAttribute('aria-disabled', String(page >= pages));
  const label = document.querySelector('#search-page-label');
  if (label) label.textContent = pages ? `Página ${page} de ${pages}` : 'Sin páginas: 0 resultados';
  document.querySelector<HTMLElement>('#search-pagination')!.hidden = false;
  document.querySelector<HTMLElement>('#static-search-pages')!.hidden = true;
  const descriptions = Object.values(controls).filter((c): c is HTMLSelectElement => Boolean(c?.value)).map(c => c.selectedOptions[0]?.textContent ?? '');
  const range = view.total ? ` Mostrando ${(page - 1) * SEARCH_PAGE_SIZE + 1}–${(page - 1) * SEARCH_PAGE_SIZE + view.entries.length}. Página ${page} de ${pages}.` : '';
  announce(`${view.total} ${view.total === 1 ? 'resultado' : 'resultados'} de demostración${input.value.trim() ? ` para «${input.value.trim()}»` : ''}${selected ? `, etiqueta ${selected}` : ''}${descriptions.length ? `, ${descriptions.join(', ')}` : ''}.${range}`, speak);
  if (mode) writeLocation(mode);
}
function change(mode: 'push' | 'replace' = 'push') { page = 1; render(mode); }
form?.addEventListener('submit', e => { e.preventDefault(); change(); });
input?.addEventListener('input', () => { if (input.value.length > 200) input.value = input.value.slice(0, 200); change('replace'); });
tags.forEach(b => b.addEventListener('click', () => { selected = b.dataset.tag ?? ''; change(); }));
Object.values(controls).forEach(c => c?.addEventListener('change', () => change()));
document.querySelector('#reset-search')?.addEventListener('click', () => {
  if (input) input.value = ''; selected = '';
  Object.entries(controls).forEach(([key, c]) => { if (c) c.value = key === 'type' ? 'manual' : ''; });
  change();
});
previous?.addEventListener('click', () => { if (page > 1) { page--; render('push'); } });
next?.addEventListener('click', () => { if (page < pages) { page++; render('push'); } });
window.addEventListener('popstate', () => { readLocation(); render(); });
readLocation();
async function initialize() {
  try {
    const response = await fetch('/search-index.json', { cache: 'no-store', credentials: 'omit' });
    if (!response.ok) throw new Error('Index unavailable');
    const data: unknown = await response.json(); validateSearchIndex(data);
    index = data; byId = new Map(data.entries.map(e => [e.id, e]));
    render(undefined, false);
  } catch {
    failed = true; render(undefined, false);
  }
}
void initialize();
