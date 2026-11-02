import {test} from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
test('WEB-005 importer preserves text and rejects unsafe presentation using synthetic cases',()=>{
 const result=spawnSync('python3',['tools/web-005/test-import.py'],{encoding:'utf8'});
 assert.equal(result.status,0,result.stdout+result.stderr);
 assert.match(result.stderr,/Ran 9 tests/);
});
