import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  trailingSlash: 'always',
  server: { port: 4340 },
  build: { inlineStylesheets: 'never' },
  vite: { build: { assetsInlineLimit: 0 } },
});
