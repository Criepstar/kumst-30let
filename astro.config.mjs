import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import tailwindcss from '@tailwindcss/vite';
import { loadEnv } from 'vite';

// .env auch für Build-Konfiguration lesen (BASE_PATH, SITE_URL, PORT)
const fileEnv = loadEnv(process.env.NODE_ENV ?? 'production', process.cwd(), '');
const base = process.env.BASE_PATH || fileEnv.BASE_PATH || '/';
const site = process.env.SITE_URL || fileEnv.SITE_URL || 'https://www.trta.at';
const port = Number(process.env.PORT || fileEnv.PORT || 4321);

export default defineConfig({
  site,
  base,
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  trailingSlash: 'ignore',
  vite: {
    plugins: [tailwindcss()],
  },
  server: {
    host: true,
    port,
  },
  devToolbar: { enabled: false },
});
