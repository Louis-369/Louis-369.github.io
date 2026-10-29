import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://louis-369.is-a.dev',
  trailingSlash: 'always',
  build: {
    format: 'directory'
  }
});
