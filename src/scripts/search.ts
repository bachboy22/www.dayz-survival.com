import { catalog } from '../data/catalog';
import { searchCatalog } from '../lib/prototype';

const input = document.querySelector<HTMLInputElement>('#search-input');
const form = document.querySelector<HTMLFormElement>('.search-box');
const results = document.querySelector<HTMLElement>('#search-results');
const empty = document.querySelector<HTMLElement>('#no-results');
const status = document.querySelector<HTMLElement>('#search-status');
const tags = [...document.querySelectorAll<HTMLButtonElement>('[data-tag]')];
const controls = {
  map: document.querySelector<HTMLSelectElement>('#filter-map'),
  level: document.querySelector<HTMLSelectElement>('#filter-level'),
  type: document.querySelector<HTMLSelectElement>('#filter-type'),
  evidence: document.querySelector<HTMLSelectElement>('#filter-evidence'),
};
let selected = '';
let announcement: ReturnType<typeof setTimeout> | undefined;
function readLocation() {
  const params = new URLSearchParams(location.search);
  if (input) input.value = (params.get('q') ?? '').slice(0, 200);
  selected = tags.some(button => button.dataset.tag === params.get('tag')) ? params.get('tag') ?? '' : '';
  for (const [key, control] of Object.entries(controls)) if (control) {
    const candidate = params.get(key) ?? (key === 'type' ? 'manual' : '');
    control.value = [...control.options].some(o => o.value === candidate) ? candidate : control.options[0]!.value;
  }
}
function update(writeLocation = true, announce = true) {
  if (!input || !results || !empty || !status) return;
  const filters = Object.fromEntries(Object.entries(controls).map(([key, control]) => [key, control?.value ?? '']));
  const matches = searchCatalog(catalog, input.value, { ...filters, tag: selected });
  const ids = new Set(matches.map(a => a.id));
  results.querySelectorAll<HTMLElement>('[data-content-id]').forEach(card => {
    const article = catalog.find(a => a.id === card.dataset.contentId);
    card.hidden = !ids.has(card.dataset.contentId ?? '');
    if (!article) return;
    const cardView = filters.type === 'card';
    card.querySelectorAll<HTMLAnchorElement>('[data-result-link],[data-result-action]').forEach(link => { link.href = `/${cardView ? 'fichas' : 'manual'}/${article.slug}/`; });
    const action = card.querySelector<HTMLAnchorElement>('[data-result-action]');
    if (action) { action.replaceChildren(document.createTextNode(`${cardView ? 'Abrir la ficha rápida' : 'Abrir lectura extensa'}: ${article.title} →`)); }
  });
  results.hidden = matches.length === 0; empty.hidden = matches.length > 0;
  tags.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.tag === selected)));
  const query = input.value.trim();
  const descriptions = Object.values(controls).filter((c): c is HTMLSelectElement => Boolean(c && c.value)).map(c => c.selectedOptions[0]?.textContent ?? '');
  const message = `${matches.length} ${matches.length === 1 ? 'resultado' : 'resultados'} de demostración${query ? ` para «${query}»` : ''}${selected ? `, etiqueta ${selected}` : ''}${descriptions.length ? `, ${descriptions.join(', ')}` : ''}.`;
  clearTimeout(announcement);
  if (announce) announcement = setTimeout(() => { status.textContent = message; }, 250); else status.textContent = message;
  if (writeLocation) {
    const params = new URLSearchParams();
    if (input.value) params.set('q', input.value);
    if (selected) params.set('tag', selected);
    for (const [key, value] of Object.entries(filters)) if (value && !(key === 'type' && value === 'manual')) params.set(key, value);
    history.replaceState(null, '', `${location.pathname}${params.size ? '?' + params.toString() : ''}`);
  }
}
form?.addEventListener('submit', e => { e.preventDefault(); update(); });
input?.addEventListener('input', () => update());
tags.forEach(button => button.addEventListener('click', () => { selected = button.dataset.tag ?? ''; update(); }));
Object.values(controls).forEach(control => control?.addEventListener('change', () => update()));
document.querySelector('#reset-search')?.addEventListener('click', () => {
  if (input) input.value = ''; selected = '';
  Object.entries(controls).forEach(([key, control]) => { if (control) control.value = key === 'type' ? 'manual' : ''; });
  update(); // Keep focus on the reset control; results announce the changed state.
});
window.addEventListener('popstate', () => { readLocation(); update(false); });
readLocation(); update(false, false);
