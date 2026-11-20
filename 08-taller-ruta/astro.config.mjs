import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  trailingSlash: 'always',
  build: { inlineStylesheets: 'never' },
  server: { port: 4338 },
  vite: { build: { assetsInlineLimit: 0 } },
});
