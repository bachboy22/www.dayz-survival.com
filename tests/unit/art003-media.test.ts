import {test} from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
test('ART-003 accepts missing final assets but isolates reference concepts and QA images',()=>{
 const result=spawnSync('python3',['tools/art-003/test-media.py'],{encoding:'utf8'});
 assert.equal(result.status,0,result.stdout+result.stderr);
 assert.match(result.stderr,/Ran 17 tests/);
});
