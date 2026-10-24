import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { mkdtemp, readFile, readdir, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { sourceHash } from '../../src/lib/content';

const repository = fileURLToPath(new URL('../../', import.meta.url));
const script = resolve(repository, 'scripts/validate-import.ts');
function run(...args: string[]) {
  return spawnSync(process.execPath, ['--import', 'tsx', script, ...args], { cwd: repository, encoding: 'utf8' });
}
function syntheticInput() {
  const rawText = 'SYNTHETIC-PRIVATE-SENTINEL: not a manuscript or gameplay claim.\n';
  const authorization = {
    schemaVersion: 1, sourceVersion: 'v0.16.1', approvedBy: 'Synthetic reviewer', approvedAt: '2026-01-01T00:00:00Z',
    entries: [{ id: 'TEST001', sha256: sourceHash(rawText), map: 'chernarus-plus', gameBuild: 'synthetic-build', buildChannel: 'experimental' }],
  };
  const batch = {
    schemaVersion: 1, sourceVersion: 'v0.16.1', articles: [{
      id: 'TEST001', slug: 'synthetic', title: 'Synthetic', summary: 'Test only', tags: ['Test'], lane: 'core',
      editorialStatus: 'approved', sourceVersion: 'v0.16.1', demonstration: false, rawText, sourceSha256: sourceHash(rawText), map: 'chernarus-plus', relatedIds: [],
      citations: [{ id: 'CITE-TEST', label: 'Synthetic evidence', url: 'https://example.invalid/test', accessedAt: '2026-01-01T00:00:00Z' }],
      technicalEvidence: [{ lane: 'E30', status: 'verified', gameBuild: 'synthetic-build', buildChannel: 'experimental', map: 'chernarus-plus', platform: 'vanilla-pc', checkedAt: '2026-01-01T00:00:00Z', reviewer: 'Synthetic reviewer', citationIds: ['CITE-TEST'] }],
    }],
  };
  return { batch, authorization, rawText };
}

test('read-only CLI validates an external reviewed batch without leaking or modifying source bytes', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'dayz-import-test-'));
  try {
    const { batch, authorization, rawText } = syntheticInput();
    const input = join(dir, 'input.json'); const allowlist = join(dir, 'authorization.json');
    const original = JSON.stringify(batch); const originalAuth = JSON.stringify(authorization);
    await writeFile(input, original); await writeFile(allowlist, originalAuth);
    const result = run(input, allowlist);
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /Read-only validation passed/);
    assert.ok(!result.stdout.includes(rawText)); assert.ok(!result.stderr.includes(rawText));
    assert.equal(await readFile(input, 'utf8'), original);
    assert.equal(await readFile(allowlist, 'utf8'), originalAuth);
    assert.deepEqual((await readdir(dir)).sort(), ['authorization.json', 'input.json']);
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test('CLI rejects repository-local inputs, including a symlink outside pointing into the repo', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'dayz-import-test-'));
  try {
    const input = join(dir, 'linked-source.json'); const allowlist = join(dir, 'authorization.json');
    await writeFile(allowlist, '{}');
    await symlink(resolve(repository, 'src/data/demo.ts'), input);
    const result = run(input, allowlist);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /outside the source repository/);
    const direct = run(resolve(repository, 'src/data/demo.ts'), allowlist);
    assert.equal(direct.status, 1);
    assert.match(direct.stderr, /outside the source repository/);
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test('CLI rejects malformed JSON without quoting input contents', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'dayz-import-test-'));
  try {
    const input = join(dir, 'input.json'); const allowlist = join(dir, 'authorization.json');
    const sentinel = 'SYNTHETIC-PRIVATE-SENTINEL';
    await writeFile(input, '{' + sentinel); await writeFile(allowlist, '{}');
    const result = run(input, allowlist);
    assert.equal(result.status, 1); assert.match(result.stderr, /Invalid JSON input/);
    assert.ok(!result.stderr.includes(sentinel)); assert.ok(!result.stdout.includes(sentinel));
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test('CLI requires both input and independent authorization paths', () => {
  const result = run(); assert.equal(result.status, 1); assert.match(result.stderr, /Usage:/);
});
