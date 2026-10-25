import test from 'node:test';
import assert from 'node:assert/strict';
import { catalog, type PrototypeArticle } from '../../src/data/catalog';
import { buildSearchIndex, searchIndex, validateSearchIndex, searchPage } from '../../src/lib/search-index';
import { searchCatalog } from '../../src/lib/prototype';

const index = buildSearchIndex(catalog);
test('build-only index excludes sections/raw bodies/unknown source fields and preserves source bytes', () => {
  const before = JSON.stringify(catalog); const copy = structuredClone(catalog);
  Object.assign(copy[0]!, { original_file_pointer: 'PRIVATE-SENTINEL-NOT-A-MANUSCRIPT', rawText: 'RAW-SENTINEL' });
  const encoded = JSON.stringify(buildSearchIndex(copy));
  assert(!encoded.includes('PRIVATE-SENTINEL')); assert(!encoded.includes('RAW-SENTINEL')); assert(!encoded.includes('paragraphs'));
  assert.equal(JSON.stringify(catalog), before);
  assert.ok(index.entries.every(e => e.sourceVersion === null && e.verifiedGameBuild === null));
});
test('indexed AND/accents/substrings/punctuation/order and filters match the original search', () => {
  const fixture: PrototypeArticle[] = structuredClone(catalog) as PrototypeArticle[];
  fixture[0]!.sections[0]!.paragraphs.push('Árbol, ÁRBOL, acción: cuaderno/ficha; a-b\tA.B\n¿qué? cancio\u0301n. Extrañó 例文.');
  const optimized = buildSearchIndex(fixture);
  const queries = ['', 'como', 'cuaderno', 'INTERFAZ', 'contexto ficha', 'árbol,', 'rbol', 'a-b', 'a.b', 'qué?', 'cancion.', '例', '<script>', 'sin-coincidencias', 'x'.repeat(201)];
  for (const q of queries) for (const tag of ['', 'Lectura', 'PROCEDENCIA', 'Atlas', 'inexistente']) for (const map of ['', 'general', 'livonia','invalid']) {
    const filters = { tag, map };
    assert.deepEqual(searchIndex(optimized, q, filters).map(e => e.id), searchCatalog(fixture, q.slice(0, 200), filters).map(e => e.id), `${q}/${tag}/${map}`);
  }
  assert.equal(searchIndex(optimized,'',{ evidence:'verified' }).length,0);
  assert.equal(searchIndex(optimized,'',{ type:'unknown' }).length,0);
});
test('pagination clamps invalid/end pages, retains stable order and never returns more than twelve', () => {
  const entries = Array.from({ length: 31 }, (_, i) => ({ ...index.entries[0]!, id: `DEMO-${String(i).padStart(3,'0')}` }));
  assert.equal(searchPage(entries,1).entries.length,12);
  assert.equal(searchPage(entries,2).entries[0]!.id,'DEMO-012');
  assert.equal(searchPage(entries,99).entries.length,7);
  assert.equal(searchPage(entries,NaN).page,1);
  assert.equal(searchPage(entries,-2).page,1);
  assert.deepEqual(searchPage([],9),{ page:1,pages:0,total:0,entries:[] });
});
for (const [name, mutate] of [
  ['editorial approval',(x:any)=>{x.entries[0].editorialStatus='approved';}],
  ['technical verification',(x:any)=>{x.entries[0].technicalStatus='verified';}],
  ['game build',(x:any)=>{x.entries[0].verifiedGameBuild='1.30.164078';}],
  ['publication',(x:any)=>{x.entries[0].publicationStatus='approved';}],
  ['source provenance',(x:any)=>{x.entries[0].sourceVersion='v0.16.1';}],
  ['private unknown field',(x:any)=>{x.entries[0].original_file_pointer='private';}],
  ['unsafe slug',(x:any)=>{x.entries[0].slug='../../private';}],
  ['historical namespace',(x:any)=>{x.entries[0].id='LIV-001';}],
  ['duplicate ID',(x:any)=>{x.entries[1].id=x.entries[0].id;}],
  ['unrecognized schema',(x:any)=>{x.schemaVersion=2;}],
] as const) test(`static JSON rejects ${name}`,()=>{const bad=structuredClone(index);mutate(bad);assert.throws(()=>validateSearchIndex(bad));});
test('build rejects non-DEMO metadata before deriving any index',()=>{
  const bad=structuredClone(catalog);(bad[0]!.metadata as any).technicalStatus='verified';assert.throws(()=>buildSearchIndex(bad));
});
