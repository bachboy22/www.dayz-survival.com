import { demoArticles } from '../data/demo';
import { searchArticles } from '../lib/search';

const input = document.querySelector<HTMLInputElement>('#search-input');
const form = document.querySelector<HTMLFormElement>('.search-box');
const results = document.querySelector<HTMLElement>('#search-results');
const empty = document.querySelector<HTMLElement>('#no-results');
const status = document.querySelector<HTMLElement>('#search-status');
const filters = [...document.querySelectorAll<HTMLButtonElement>('[data-tag]')];
let selected = '';
let announcement: ReturnType<typeof setTimeout> | undefined;

function readLocation() {
  const params = new URLSearchParams(location.search);
  selected = filters.some(button => button.dataset.tag === params.get('tag')) ? params.get('tag') ?? '' : '';
  if (input) input.value = (params.get('q') ?? '').slice(0, 200);
}

function update(writeLocation = true, announce = true) {
  if (!input || !results || !empty || !status) return;
  const count = searchArticles(demoArticles, input.value, selected).length;
  results.hidden = count === 0;
  empty.hidden = count > 0;
  filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.tag === selected)));
  const query = input.value.trim();
  const message = `${count === 1 ? '1 resultado' : '0 resultados'} de demostración${query ? ` para «${query}»` : ''}${selected ? `, etiqueta ${selected}` : ''}.`;
  clearTimeout(announcement);
  // Preserve focus; announce the query and filter even when the count stays equal.
  // Debounce speech while typing. DOM output uses textContent, never HTML.
  if (announce) announcement = setTimeout(() => { status.textContent = message; }, 250);
  else status.textContent = message;
  if (writeLocation) {
    const params = new URLSearchParams();
    if (input.value) params.set('q', input.value);
    if (selected) params.set('tag', selected);
    history.replaceState(null, '', `${location.pathname}${params.size ? '?' + params.toString() : ''}`);
  }
}

form?.addEventListener('submit', event => { event.preventDefault(); update(); });
input?.addEventListener('input', () => update());
filters.forEach(button => button.addEventListener('click', () => { selected = button.dataset.tag ?? ''; update(); }));
window.addEventListener('popstate', () => { readLocation(); update(false); });
readLocation();
update(false, false);
