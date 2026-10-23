import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { demoArticle } from '../../src/data/demo';
import {
  createProductionExport, sourceHash, validateAuthorization, validateDemoArticle,
  validateProductionImport, type ImportAuthorization, type ImportEnvelope,
} from '../../src/lib/content';

// Synthetic validation records. None are real editorial IDs or gameplay evidence.
function example(): { batch: ImportEnvelope; authorization: ImportAuthorization } {
  const rawText = 'Synthetic test fixture. No gameplay claims.\n';
  return {
    authorization: {
      schemaVersion: 1, sourceVersion: 'v0.16.1', approvedBy: 'Synthetic reviewer',
      approvedAt: '2026-01-01T00:00:00Z',
      entries: [{ id: 'TEST001', sha256: sourceHash(rawText), map: 'chernarus-plus', gameBuild: 'synthetic-test-build', buildChannel: 'experimental' }],
    },
    batch: {
      schemaVersion: 1, sourceVersion: 'v0.16.1', articles: [{
        id: 'TEST001', slug: 'synthetic-test', title: 'Synthetic test', summary: 'Schema test only.', tags: ['Synthetic'],
        lane: 'core', editorialStatus: 'approved', sourceVersion: 'v0.16.1', demonstration: false,
        rawText, sourceSha256: sourceHash(rawText), map: 'chernarus-plus',
        citations: [{ id: 'CITE-TEST', label: 'Synthetic evidence', url: 'https://example.invalid/synthetic', accessedAt: '2026-01-01T00:00:00Z' }],
        technicalEvidence: [{ lane: 'C29', status: 'verified', gameBuild: 'synthetic-test-build', buildChannel: 'experimental', map: 'chernarus-plus', platform: 'vanilla-pc', checkedAt: '2026-01-01T00:00:00Z', reviewer: 'Synthetic reviewer', citationIds: ['CITE-TEST'] }],
        relatedIds: [],
      }],
    },
  };
}

test('one explicitly synthetic article validates without approval or game certification', () => {
  assert.doesNotThrow(() => validateDemoArticle(demoArticle));
  assert.equal(demoArticle.metadata.editorialStatus, 'demo');
  assert.equal(demoArticle.metadata.technicalStatus, 'unverified');
  assert.equal(demoArticle.quickCard.articleId, demoArticle.id);
});

test('demo cannot claim approved status or source-master provenance', () => {
  const value = structuredClone(demoArticle) as unknown as Record<string, any>;
  value.metadata.editorialStatus = 'approved';
  assert.throws(() => validateDemoArticle(value), /cannot claim/);
  value.metadata.editorialStatus = 'demo'; value.metadata.sourceVersion = 'v0.16.1';
  assert.throws(() => validateDemoArticle(value), /cannot claim/);
});

test('demo cross-links reject traversal, unsafe URL schemes and duplicates', () => {
  for (const href of ['/../private', '//example.com', 'javascript:alert(1)', '/%2e%2e/private']) {
    const value = structuredClone(demoArticle); value.references[0]!.href = href;
    assert.throws(() => validateDemoArticle(value), /unsafe cross-reference/);
  }
  const value = structuredClone(demoArticle); value.references.push(value.references[0]!);
  assert.throws(() => validateDemoArticle(value), /duplicates/);
});

test('exact reviewed ID, hash and independent provenance permit a synthetic schema test', () => {
  const { batch, authorization } = example();
  assert.doesNotThrow(() => validateProductionImport(batch, authorization));
  const exported = createProductionExport(batch, authorization);
  assert.deepEqual(exported, batch);
  exported.articles[0]!.title = 'Different';
  assert.equal(batch.articles[0]!.title, 'Synthetic test', 'export must not mutate input');
});

test('hash preserves exact UTF-8 bytes and line endings', () => {
  assert.notEqual(sourceHash('Texto\n'), sourceHash('Texto'));
  assert.notEqual(sourceHash('Texto\n'), sourceHash('Texto\r\n'));
  assert.notEqual(sourceHash('á'), sourceHash('a\u0301'));
});

test('unknown IDs fail against exact allowlist, without namespace guessing', () => {
  const { batch, authorization } = example(); batch.articles[0]!.id = 'TEST002';
  assert.throws(() => validateProductionImport(batch, authorization), /exact reviewed allowlist/);
});

test('wildcards, path traversal and invalid IDs cannot form authorizations', () => {
  for (const id of ['*', '../TEST001', 'TEST001/../../', 'TEST001*', 'test001', 'TEST 001']) {
    const { authorization } = example(); authorization.entries[0]!.id = id;
    assert.throws(() => validateAuthorization(authorization), /invalid identifier/);
  }
});

test('independent CHR, LIV, AUD and demo namespaces remain blocked', () => {
  for (const id of ['CHR-001', 'LIV-001', 'AUD-130', 'DEMO-001']) {
    const { authorization } = example(); authorization.entries[0]!.id = id;
    assert.throws(() => validateAuthorization(authorization), /namespace is blocked/);
  }
});

test('all isolated lanes stay outside core exports', () => {
  for (const lane of ['CHR', 'LIV', 'AUD-130'] as const) {
    const { batch, authorization } = example(); batch.articles[0]!.lane = lane;
    assert.throws(() => validateProductionImport(batch, authorization), /remain isolated/);
  }
});

test('drafts, rejected records and demos are rejected rather than silently filtered', () => {
  for (const status of ['draft', 'rejected', 'demo'] as const) {
    const { batch, authorization } = example(); batch.articles[0]!.editorialStatus = status;
    assert.throws(() => createProductionExport(batch, authorization), /cannot be exported/);
  }
  const { batch, authorization } = example(); batch.articles[0]!.demonstration = true;
  assert.throws(() => createProductionExport(batch, authorization), /cannot be exported/);
});

test('editorial approval alone never establishes technical certification', () => {
  for (const status of ['unverified', 'documentary'] as const) {
    const { batch, authorization } = example(); batch.articles[0]!.technicalEvidence[0]!.status = status;
    assert.throws(() => validateProductionImport(batch, authorization), /technical verification/);
  }
  const { batch, authorization } = example(); batch.articles[0]!.technicalEvidence = [];
  assert.throws(() => validateProductionImport(batch, authorization), /independently of editorial approval/);
});

test('D26 is always blocked', () => {
  const { batch, authorization } = example(); batch.articles[0]!.technicalEvidence[0]!.lane = 'D26';
  assert.throws(() => validateProductionImport(batch, authorization), /D26 is blocked/);
});

test('C29, E30, CE26 and D30DOC remain distinct provenance records', () => {
  const { batch, authorization } = example();
  const evidence = batch.articles[0]!.technicalEvidence[0]!;
  batch.articles[0]!.technicalEvidence = ['C29', 'E30', 'CE26', 'D30DOC'].map((lane) => ({ ...evidence, lane: lane as typeof evidence.lane }));
  const result = createProductionExport(batch, authorization);
  assert.deepEqual(result.articles[0]!.technicalEvidence.map((item) => item.lane), ['C29', 'E30', 'CE26', 'D30DOC']);
});

test('source text or hash changes fail independently against reviewed hash', () => {
  const { batch, authorization } = example(); batch.articles[0]!.rawText += 'Changed';
  assert.throws(() => validateProductionImport(batch, authorization), /hash mismatch/);
  batch.articles[0]!.sourceSha256 = sourceHash(batch.articles[0]!.rawText);
  assert.throws(() => validateProductionImport(batch, authorization), /hash mismatch/);
});

test('versions are explicit, never auto-upgraded', () => {
  const { batch, authorization } = example();
  (batch as unknown as Record<string, unknown>).sourceVersion = 'v0.17.0';
  assert.throws(() => validateProductionImport(batch, authorization), /source version/);
});

test('map, platform, channel and build must match reviewed provenance', () => {
  for (const [key, value] of [['map', 'livonia'], ['platform', 'modded'], ['buildChannel', 'stable'], ['gameBuild', '1.30-stable']] as const) {
    const { batch, authorization } = example();
    (batch.articles[0]!.technicalEvidence[0]! as unknown as Record<string, unknown>)[key] = value;
    assert.throws(() => validateProductionImport(batch, authorization), /provenance mismatch/);
  }
});

test('Livonia cannot be authorized through the core policy', () => {
  const { authorization } = example(); authorization.entries[0]!.map = 'livonia';
  assert.throws(() => validateAuthorization(authorization), /separate approved policy/);
});

test('slugs reject traversal and encoded paths', () => {
  for (const slug of ['../private', 'demo/../../', '%2e%2e', 'with space', 'with#fragment']) {
    const { batch, authorization } = example(); batch.articles[0]!.slug = slug;
    assert.throws(() => validateProductionImport(batch, authorization), /unsafe slug/);
  }
});

test('duplicate IDs and slugs are rejected', () => {
  const { batch, authorization } = example(); batch.articles.push(structuredClone(batch.articles[0]!));
  assert.throws(() => validateProductionImport(batch, authorization), /duplicates/);
  authorization.entries.push(structuredClone(authorization.entries[0]!));
  assert.throws(() => validateAuthorization(authorization), /duplicates/);
});

test('citations must resolve, be unique and use safe HTTPS URLs', () => {
  const { batch, authorization } = example();
  batch.articles[0]!.technicalEvidence[0]!.citationIds = ['MISSING'];
  assert.throws(() => validateProductionImport(batch, authorization), /unresolved citation/);
  batch.articles[0]!.technicalEvidence[0]!.citationIds = ['CITE-TEST'];
  batch.articles[0]!.citations.push(structuredClone(batch.articles[0]!.citations[0]!));
  assert.throws(() => validateProductionImport(batch, authorization), /duplicates/);
  batch.articles[0]!.citations.pop(); batch.articles[0]!.citations[0]!.url = 'javascript:alert(1)';
  assert.throws(() => validateProductionImport(batch, authorization), /HTTPS/);
});

test('missing and unrecognized fields fail closed', () => {
  const { batch, authorization } = example();
  const item = batch.articles[0]! as unknown as Record<string, unknown>; item.additionalPrivateData = 'unexpected';
  assert.throws(() => validateProductionImport(batch, authorization), /unexpected field/);
  delete item.additionalPrivateData; delete item.technicalEvidence;
  assert.throws(() => validateProductionImport(batch, authorization), /missing field/);
});

test('cross-references reject duplicates, missing IDs and self-references', () => {
  for (const relatedIds of [['MISSING'], ['MISSING', 'MISSING'], ['TEST001']]) {
    const { batch, authorization } = example(); batch.articles[0]!.relatedIds = relatedIds;
    assert.throws(() => validateProductionImport(batch, authorization), /cross-reference|duplicates|self-reference/);
  }
});

test('one invalid member rejects an entire batch', () => {
  const { batch, authorization } = example();
  const second = structuredClone(batch.articles[0]!); second.id = 'TEST002'; second.slug = 'second-synthetic'; second.editorialStatus = 'draft';
  batch.articles.push(second); authorization.entries.push({ ...authorization.entries[0]!, id: 'TEST002' });
  assert.throws(() => createProductionExport(batch, authorization), /cannot be exported/);
});

test('invalid dates and empty provenance identities are rejected', () => {
  const { batch, authorization } = example(); batch.articles[0]!.technicalEvidence[0]!.reviewer = ' ';
  assert.throws(() => validateProductionImport(batch, authorization), /nonempty string/);
  authorization.approvedAt = 'yesterday';
  assert.throws(() => validateAuthorization(authorization), /UTC timestamp/);
  authorization.approvedAt = '2026-02-31T00:00:00Z';
  assert.throws(() => validateAuthorization(authorization), /invalid calendar date/);
});
