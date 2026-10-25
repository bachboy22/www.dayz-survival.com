import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

test('DESIGN-001-D loopback package server security suite', () => {
  const childEnvironment = { ...process.env };
  delete childEnvironment.NODE_TEST_CONTEXT;
  const result = spawnSync(process.execPath, ['--test', '--test-reporter=tap', fileURLToPath(new URL('../../tools/design-001-d/server.test.cjs', import.meta.url))], { encoding: 'utf8', timeout: 15000, env: childEnvironment });
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout, /pass 8/);
  assert.match(result.stdout, /fail 0/);
});
