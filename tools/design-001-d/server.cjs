'use strict';
// DESIGN-001-D: dependency-free, offline, loopback-only static review server.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawn } = require('node:child_process');
const ROOT = fs.realpathSync(path.resolve(__dirname, '..'));
const STATE = 'SESION_DESIGN001D.json';
const APP = 'DAYZ-SURVIVAL-DESIGN001D';
const TYPES = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.json':'application/json; charset=utf-8', '.svg':'image/svg+xml', '.png':'image/png', '.md':'text/plain; charset=utf-8', '.txt':'text/plain; charset=utf-8', '.ico':'image/x-icon' };

function inventory(root) {
  const files = new Map();
  function scan(directory, prefix) {
    for (const item of fs.readdirSync(directory, { withFileTypes: true })) {
      if (item.isSymbolicLink()) throw new Error('No se admiten enlaces simbolicos en el paquete.');
      const relative = prefix + item.name;
      if (item.isDirectory()) scan(path.join(directory, item.name), relative + '/');
      else if (item.isFile()) files.set('/' + relative, path.join(directory, item.name));
    }
  }
  scan(path.join(root, 'sitio'), '');
  for (const name of ['revision', 'evidencia']) scan(path.join(root, name), name + '/');
  for (const name of ['INSTRUCCIONES_WINDOWS.html','MANIFEST.json','SHA256SUMS.txt','DESIGN-001-D-REPORT.md']) {
    const filename = path.join(root, name);
    if (fs.existsSync(filename)) files.set('/' + name, filename);
  }
  return files;
}

function verifyIntegrity(root) {
  const lines = fs.readFileSync(path.join(root, 'SHA256SUMS.txt'), 'utf8').trim().split(/\r?\n/);
  for (const line of lines) {
    const match = /^([a-f0-9]{64})  (.+)$/.exec(line);
    if (!match || match[2].split(/[\\/]/).includes('..') || path.isAbsolute(match[2])) throw new Error('Lista de hashes no valida.');
    const filename = path.resolve(root, match[2]);
    if (!fs.realpathSync(filename).startsWith(root + path.sep) || fs.lstatSync(filename).isSymbolicLink()) throw new Error('Ruta no valida en hashes.');
    const actual = crypto.createHash('sha256').update(fs.readFileSync(filename)).digest('hex');
    if (actual !== match[1]) throw new Error('Integridad incorrecta: ' + match[2] + '. Extraiga de nuevo el ZIP original.');
  }
  return lines.length;
}

function makeServer(root, token, onStop = () => {}) {
  const files = inventory(root);
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'MANIFEST.json'), 'utf8'));
  const inlineScripts = new Set();
  for (const filename of files.values()) {
    if (path.extname(filename) !== '.html') continue;
    const source = fs.readFileSync(filename, 'utf8');
    for (const match of source.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
      if (/\bsrc\s*=|\btype\s*=\s*["']application\/json["']/i.test(match[1])) continue;
      inlineScripts.add("'sha256-" + crypto.createHash('sha256').update(match[2], 'utf8').digest('base64') + "'");
    }
  }
  const server = http.createServer((req, res) => {
    const address = server.address();
    const host = '127.0.0.1:' + address.port;
    const headers = {
      'Cache-Control':'no-store', 'X-Content-Type-Options':'nosniff', 'X-Frame-Options':'DENY',
      'Referrer-Policy':'no-referrer',
      'Content-Security-Policy':"default-src 'self'; script-src 'self' " + [...inlineScripts].join(' ') + "; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; base-uri 'none'; object-src 'none'; frame-ancestors 'none'; form-action 'self'",
    };
    function answer(status, text) { res.writeHead(status, { ...headers, 'Content-Type':'text/plain; charset=utf-8' }); res.end(text); }
    if (req.headers.host !== host || req.socket.remoteAddress !== '127.0.0.1') return answer(421, 'Origen local no valido.');
    let pathname;
    try { pathname = decodeURIComponent((req.url || '/').split('?')[0]); }
    catch { return answer(400, 'Ruta no valida.'); }
    if (!pathname.startsWith('/') || /[\\\x00-\x1f]/.test(pathname) || pathname.split('/').includes('..')) return answer(400, 'Ruta no valida.');
    if (pathname.startsWith('/__design001d/')) {
      const supplied = req.headers['x-design001d-token'];
      const valid = typeof supplied === 'string' && /^[a-f0-9]{64}$/.test(supplied) && crypto.timingSafeEqual(Buffer.from(supplied), Buffer.from(token));
      if (!valid || (req.headers.origin && req.headers.origin !== 'http://' + host)) return answer(403, 'Accion local no autorizada.');
      if (pathname === '/__design001d/status' && req.method === 'GET') {
        res.writeHead(200, { ...headers, 'Content-Type':'application/json' });
        return res.end(JSON.stringify({ app:APP, address:address.address, port:address.port, sourceSha:manifest.source.commit, pid:process.pid }));
      }
      if (pathname === '/__design001d/stop' && req.method === 'POST') {
        res.once('finish', () => setTimeout(onStop, 30));
        return answer(200, 'Revision local cerrada.');
      }
      return answer(405, 'Metodo no permitido.');
    }
    if (!['GET','HEAD'].includes(req.method)) return answer(405, 'Solo lectura.');
    if (pathname === '/revision/') pathname = '/revision/REVISION_MANUAL.html';
    if (pathname.endsWith('/')) pathname += 'index.html';
    let filename = files.get(pathname);
    if (!filename && files.has(pathname + '/index.html')) {
      res.writeHead(301, { ...headers, Location:pathname + '/' }); return res.end();
    }
    const status = filename ? 200 : 404;
    if (!filename) filename = files.get('/404.html');
    if (!filename) return answer(404, 'No encontrado.');
    // Recheck the actual target; never follow a replaced file out of the package.
    let real;
    try { real = fs.realpathSync(filename); }
    catch { return answer(404, 'No encontrado.'); }
    if (!real.startsWith(root + path.sep) || fs.lstatSync(filename).isSymbolicLink()) return answer(403, 'Ruta no autorizada.');
    res.writeHead(status, { ...headers, 'Content-Type':TYPES[path.extname(real)] || 'application/octet-stream' });
    if (req.method === 'HEAD') return res.end();
    const stream = fs.createReadStream(real);
    stream.on('error', () => res.destroy()); stream.pipe(res);
  });
  server.requestTimeout = 5000; server.headersTimeout = 5000; server.keepAliveTimeout = 1000;
  return server;
}

function contact(state, action) {
  return new Promise((resolve, reject) => {
    if (!Number.isInteger(state.port) || state.port < 1 || state.port > 65535 || !/^[a-f0-9]{64}$/.test(state.token)) return reject(new Error('Sesion local no valida.'));
    const req = http.request({ host:'127.0.0.1', port:state.port, path:'/__design001d/' + action, method:action === 'stop' ? 'POST' : 'GET', headers:{ 'X-Design001d-Token':state.token }, timeout:1200 }, response => {
      let body = ''; response.setEncoding('utf8'); response.on('data', chunk => { body += chunk; });
      response.on('end', () => response.statusCode === 200 ? resolve(body) : reject(new Error('La sesion no corresponde al paquete.')));
    });
    req.on('timeout', () => req.destroy(new Error('La sesion no responde.'))); req.on('error', reject); req.end();
  });
}
function alive(pid) { try { if (!Number.isInteger(pid) || pid < 1) return false; process.kill(pid, 0); return true; } catch { return false; } }
function openBrowser(url) {
  if (process.platform !== 'win32') return;
  const cmd = path.join(process.env.SystemRoot || 'C:\\Windows', 'System32', 'cmd.exe');
  const child = spawn(cmd, ['/d','/s','/c', 'start "" "' + url + '"'], { windowsHide:true, stdio:'ignore' });
  child.on('error', () => console.log('Abra manualmente: ' + url));
}

async function main(args = process.argv.slice(2)) {
  const statePath = path.join(ROOT, STATE);
  if (args.includes('--verify')) { console.log('Integridad verificada: ' + verifyIntegrity(ROOT) + ' archivos.'); return; }
  if (args.includes('--stop')) {
    if (!fs.existsSync(statePath)) { console.log('No hay una revision local abierta desde esta carpeta.'); return; }
    const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
    try { console.log(await contact(state, 'stop')); }
    catch (error) {
      if (!alive(state.pid)) { fs.unlinkSync(statePath); console.log('La sesion ya estaba cerrada; se limpio el registro local.'); }
      else throw error;
    }
    return;
  }
  if (fs.existsSync(statePath)) {
    const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
    try {
      const status = JSON.parse(await contact(state, 'status'));
      if (status.app !== APP) throw new Error('Sesion ajena.');
      const url = 'http://127.0.0.1:' + state.port + '/INSTRUCCIONES_WINDOWS.html';
      console.log('La revision ya esta abierta: ' + url);
      if (!args.includes('--no-open')) openBrowser(url);
      return;
    } catch (error) {
      if (alive(state.pid)) throw new Error('Ya existe una sesion iniciandose o sin respuesta. Cierre su ventana y vuelva a intentarlo.');
      fs.unlinkSync(statePath);
    }
  }
  verifyIntegrity(ROOT);
  const token = crypto.randomBytes(32).toString('hex');
  const lock = fs.openSync(statePath, 'wx');
  fs.writeFileSync(lock, JSON.stringify({ pid:process.pid, token })); fs.closeSync(lock);
  let server; let stopped = false;
  function cleanState() {
    try { const current = JSON.parse(fs.readFileSync(statePath, 'utf8')); if (current.token === token) fs.unlinkSync(statePath); } catch {}
  }
  function stop() {
    if (stopped) return; stopped = true;
    cleanState();
    server?.close(); server?.closeAllConnections();
    console.log('DEMO LOCAL cerrada. No queda un servicio en segundo plano.');
  }
  process.on('SIGINT', stop); process.on('SIGTERM', stop); process.on('SIGHUP', stop); process.on('exit', cleanState);
  server = makeServer(ROOT, token, stop);
  server.on('error', error => { cleanState(); console.error(error.message); process.exitCode = 1; });
  server.listen({ host:'127.0.0.1', port:0 }, () => {
    const address = server.address(); const state = { pid:process.pid, token, port:address.port };
    fs.writeFileSync(statePath, JSON.stringify(state));
    const url = 'http://127.0.0.1:' + address.port + '/INSTRUCCIONES_WINDOWS.html';
    console.log('\nDAYZ-SURVIVAL - DEMO LOCAL, SIN CONTENIDO EDITORIAL REAL');
    console.log('Solo este equipo: ' + url);
    console.log('Mantenga esta ventana abierta. Para cerrar: Ctrl+C o CERRAR_REVISION.cmd.');
    console.log('Exporte su evaluacion antes de cerrar. No se transmite informacion.\n');
    console.log('DESIGN001D_READY ' + JSON.stringify({ url, host:address.address, port:address.port, pid:process.pid }));
    if (!args.includes('--no-open')) openBrowser(url);
  });
}

module.exports = { makeServer, verifyIntegrity, inventory, contact, main };
if (require.main === module) main().catch(error => { console.error('No se pudo abrir DESIGN-001-D: ' + error.message); process.exitCode = 1; });
