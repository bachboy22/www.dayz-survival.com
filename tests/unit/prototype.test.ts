import test from 'node:test';
import assert from 'node:assert/strict';
import { catalog } from '../../src/data/catalog';
import { searchCatalog, validatePrototype } from '../../src/lib/prototype';
import { SOURCE_BASELINE } from '../../src/lib/content';

test('isolated multi-record catalog never changes editorial counts or namespaces', () => {
  validatePrototype(catalog);
  assert.equal(catalog.length, 3);
  assert.deepEqual(SOURCE_BASELINE, { version: 'v0.16.1', approvedArticles: 84, identifiers: 294, packages: 42 });
  assert.ok(catalog.every(a => a.id.startsWith('DEMO-') && a.metadata.sourceVersion === null));
});
test('multi-result full-text search supports combined filters and card destinations', () => {
  assert.equal(searchCatalog(catalog, '').length, 3);
  assert.equal(searchCatalog(catalog, 'interfaz').length, 3);
  assert.deepEqual(searchCatalog(catalog, 'COMO', { tag: 'Lectura' }).map(a => a.id), ['DEMO-001']);
  assert.deepEqual(searchCatalog(catalog, '', { map: 'livonia', level: 'Inicial', type: 'card', evidence: 'demo' }).map(a => a.id), ['DEMO-003']);
  assert.equal(searchCatalog(catalog, '', { map: 'chernarus-plus' }).length, 0);
  assert.equal(searchCatalog(catalog, '<script>').length, 0);
  assert.equal(searchCatalog(catalog, '', { evidence: 'verified' }).length, 0);
});
for (const [name, mutate] of [
  ['duplicate ID', (a: any[]) => { a[1].id = a[0].id; }],
  ['source provenance claim', (a: any[]) => { a[1].metadata.sourceVersion = 'v0.16.1'; }],
  ['technical certification', (a: any[]) => { a[1].metadata.technicalStatus = 'verified'; }],
  ['editorial approval', (a: any[]) => { a[1].metadata.editorialStatus = 'approved'; }],
  ['publication authorization', (a: any[]) => { a[1].publicationStatus = 'approved'; }],
  ['historical namespace', (a: any[]) => { a[1].id = 'LIV-001'; }],
  ['unresolved relation', (a: any[]) => { a[1].relatedDemoIds = ['CHR-001']; }],
  ['card-source mismatch', (a: any[]) => { a[1].quickCard.articleId = 'DEMO-001'; }],
  ['incomplete field decision', (a: any[]) => { a[1].fieldCard.signals = ['Only one']; }],
  ['external cross-reference', (a: any[]) => { a[1].references = [{ label: 'unsafe', href: '//example.com/' }]; }],
] as const) test(`synthetic boundary rejects ${name}`, () => {
  const copy = structuredClone(catalog) as any[]; mutate(copy); assert.throws(() => validatePrototype(copy));
});
