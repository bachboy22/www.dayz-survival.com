import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { demoArticles } from '../../src/data/demo';
import { normalizeSearch, searchArticles } from '../../src/lib/search';

test('search is case and accent insensitive', () => {
  assert.equal(normalizeSearch('  DEMOSTRACIÓN  '), 'demostracion');
  assert.equal(searchArticles(demoArticles, 'COMO FICHA').length, 1);
});
test('search covers paragraphs as well as title and summary', () => {
  assert.equal(searchArticles(demoArticles, 'cuaderno').length, 1);
});
test('all tokens must match, arbitrary HTML is treated as text', () => {
  assert.equal(searchArticles(demoArticles, 'ficha inexistente').length, 0);
  assert.equal(searchArticles(demoArticles, '<script>alert(1)</script>').length, 0);
});
test('empty search returns available demo and unknown query returns no results', () => {
  assert.equal(searchArticles(demoArticles, '  ').length, 1);
  assert.equal(searchArticles(demoArticles, 'balística').length, 0);
});
test('tag filters use an exact normalized match and combine with query', () => {
  assert.equal(searchArticles(demoArticles, 'ficha', 'DEMOSTRACION').length, 1);
  assert.equal(searchArticles(demoArticles, '', 'demostra').length, 0);
  assert.equal(searchArticles(demoArticles, '', 'Livonia').length, 0);
});
test('search never mutates the supplied content', () => {
  const original = structuredClone(demoArticles);
  searchArticles(demoArticles, 'ficha', 'lectura');
  assert.deepEqual(demoArticles, original);
});
