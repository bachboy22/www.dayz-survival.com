import { defineConfig } from 'astro/config';

export default defineConfig({
  ...(process.env.WEB005_PRIVATE === '1' ? { srcDir: './src/web005', publicDir: './private/web005/public', outDir: './private/web005/dist' } : {}),
  output: 'static',
  trailingSlash: 'always',
  devToolbar: { enabled: false },
});
