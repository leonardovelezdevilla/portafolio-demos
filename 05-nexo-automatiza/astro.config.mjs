import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  trailingSlash: 'always',
  build: { inlineStylesheets: 'never' },
  server: { port: 4335 },
  vite: { build: { assetsInlineLimit: 0 } },
});
