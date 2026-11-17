// vite.config.ts
import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

export default defineConfig(({ command }) => ({
  plugins: [tailwindcss(), reactRouter()],
  ssr: {
    // sanitize-html (CommonJS) memanggil require() ke htmlparser2 dan is-plain-object (ESM murni);
    // di Node Vercel itu crash. Di-bundle hanya saat build: mode dev memakai Node lokal
    // yang mendukung require(esm), dan module runner Vite tidak mengenal require().
    noExternal: command === 'build' ? ['sanitize-html', 'htmlparser2', 'is-plain-object'] : [],
  },
  resolve: {
    alias: {
      '~': fileURLToPath(new URL('./app', import.meta.url)),
    },
  },
}));
