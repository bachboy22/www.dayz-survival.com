'use strict';
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const http = require('node:http');
const crypto = require('node:crypto');
const { makeServer, verifyIntegrity } = require('./server.cjs');
let root, server, port, stopped = 0;
const token = 'a'.repeat(64);
function request(url, options = {}) {
  return new Promise((resolve,reject) => {
    const req = http.request({host:'127.0.0.1',port,path:url,method:options.method || 'GET',headers:options.headers || {}},res => {
      let body='';res.setEncoding('utf8');res.on('data',chunk=>body+=chunk);res.on('end',()=>resolve({status:res.statusCode,headers:res.headers,body}));
    });req.on('error',reject);req.end();
  });
}
before(async () => {
  root=fs.mkdtempSync(path.join(os.tmpdir(),'design001d-seguridad-'));
  for(const directory of ['sitio/manual','sitio/_astro','revision','evidencia'])fs.mkdirSync(path.join(root,directory),{recursive:true});
  fs.writeFileSync(path.join(root,'sitio/index.html'),'<h1>Demo</h1><script>window.packageReady=true;</script>');
  fs.writeFileSync(path.join(root,'sitio/manual/index.html'),'<h1>Manual</h1>');
  fs.writeFileSync(path.join(root,'sitio/404.html'),'No encontrado');
  fs.writeFileSync(path.join(root,'sitio/_astro/app.js'),'console.log("local")');
  fs.writeFileSync(path.join(root,'MANIFEST.json'),JSON.stringify({source:{commit:'synthetic-server-test'}}));
  server=makeServer(root,token,()=>stopped++);
  await new Promise(resolve=>server.listen({host:'127.0.0.1',port:0},resolve));port=server.address().port;
});
after(async () => {server.closeAllConnections();await new Promise(resolve=>server.close(resolve));fs.rmSync(root,{recursive:true,force:true});});
test('binds only IPv4 loopback and serves real route roots, modules and HEAD',async()=>{
  assert.equal(server.address().address,'127.0.0.1');
  const home=await request('/');assert.equal(home.status,200);
  const inlineHash=crypto.createHash('sha256').update('window.packageReady=true;').digest('base64');
  assert(home.headers['content-security-policy'].includes("'sha256-"+inlineHash+"'"));
  assert.equal((await request('/manual/')).body,'<h1>Manual</h1>');
  assert.equal((await request('/manual')).headers.location,'/manual/');
  const script=await request('/_astro/app.js');assert.match(script.headers['content-type'],/javascript/);
  assert.match(script.headers['content-security-policy'],/connect-src 'self'/);
  assert.equal((await request('/manual/',{method:'HEAD'})).body,'');
});
test('never exposes runtime, scripts, session state or a directory listing',async()=>{
  for(const target of ['/runtime/node.exe','/servidor/server.cjs','/SESION_DESIGN001D.json','/_astro/','/revision/unknown'])assert.equal((await request(target)).status,404);
});
test('rejects traversal, malformed paths and foreign Host',async()=>{
  for(const target of ['/../MANIFEST.json','/%2e%2e/MANIFEST.json','/revision/%2e%2e/%2e%2e/secret','/a%5cb','/%00','/%GG'])assert.equal((await request(target)).status,400);
  assert.equal((await request('/',{headers:{Host:'other.example'}})).status,421);
});
test('is read-only and does not permit unauthenticated shutdown',async()=>{
  assert.equal((await request('/manual/',{method:'POST'})).status,405);
  for(const value of ['', 'x'.repeat(64), 'é'.repeat(64)])assert.equal((await request('/__design001d/stop',{method:'POST',headers:{'X-Design001d-Token':value}})).status,403);
  assert.equal(stopped,0);
  assert.equal((await request('/')).status,200);
});
test('authenticated status identifies the exact service but returns no token',async()=>{
  const result=await request('/__design001d/status',{headers:{'X-Design001d-Token':token}});
  assert.equal(result.status,200);const status=JSON.parse(result.body);
  assert.equal(status.address,'127.0.0.1');assert.equal(status.sourceSha,'synthetic-server-test');assert.equal(status.token,undefined);
});
test('refuses a replaced file pointing outside the package',async()=>{
  const file=path.join(root,'sitio/_astro/app.js');const external=path.join(os.tmpdir(),'design001d-external-'+process.pid);
  fs.writeFileSync(external,'outside must not be read');fs.unlinkSync(file);fs.symlinkSync(external,file);
  try{const result=await request('/_astro/app.js');assert.equal(result.status,403);assert.doesNotMatch(result.body,/outside must/);}
  finally{fs.unlinkSync(file);fs.writeFileSync(file,'console.log("local")');fs.unlinkSync(external);}
});
test('integrity verification detects changed bytes',()=>{
  const relative='sitio/index.html';const file=path.join(root,relative);const original=fs.readFileSync(file);
  const hash=crypto.createHash('sha256').update(original).digest('hex');fs.writeFileSync(path.join(root,'SHA256SUMS.txt'),hash+'  '+relative+'\n');
  assert.equal(verifyIntegrity(root),1);fs.appendFileSync(file,'changed');assert.throws(()=>verifyIntegrity(root),/Integridad incorrecta/);fs.writeFileSync(file,original);
});
test('authenticated stop rejects foreign Origin, then invokes only the owned shutdown',async()=>{
  assert.equal((await request('/__design001d/stop',{method:'POST',headers:{'X-Design001d-Token':token,Origin:'https://other.example'}})).status,403);
  assert.equal((await request('/__design001d/stop',{method:'POST',headers:{'X-Design001d-Token':token}})).status,200);
  await new Promise(resolve=>setTimeout(resolve,60));assert.equal(stopped,1);
});
