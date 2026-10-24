import { readFile, realpath } from 'node:fs/promises';
import { resolve, relative, isAbsolute, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateProductionImport } from '../src/lib/content';
const [input, authorization, ...extra] = process.argv.slice(2);
if (!input || !authorization || extra.length) {
  console.error('Usage: npm run validate:import -- /external/export.json /external/reviewed-allowlist.json'); process.exitCode = 1;
} else {
  try {
    const repository = await realpath(fileURLToPath(new URL('../', import.meta.url)));
    const paths = await Promise.all([input, authorization].map((path) => realpath(resolve(path))));
    for (const path of paths) {
      const rel = relative(repository, path);
      if (!rel || (!rel.startsWith('..' + sep) && rel !== '..' && !isAbsolute(rel))) throw new Error('Import inputs must remain outside the source repository, including symlink targets.');
    }
    const [batch, allowlist] = await Promise.all(paths.map(async (path) => {
      const contents = await readFile(path, 'utf8');
      try { return JSON.parse(contents); }
      catch { throw new Error('Invalid JSON input. Source contents are not printed.'); }
    }));
    validateProductionImport(batch, allowlist);
    console.log(`Read-only validation passed: ${batch.articles.length} authorized article(s). No files written or published.`);
  } catch (error) { console.error(error instanceof Error ? error.message : 'Import validation failed.'); process.exitCode = 1; }
}
