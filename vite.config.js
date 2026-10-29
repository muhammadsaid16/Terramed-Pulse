import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: false,
    // On Cloudflare Pages the /api/* paths are functions and the SPA is static, so the
    // same-origin requests in dbService need no base URL. In development they are two
    // different ports, so the dev server forwards them to `wrangler pages dev`
    // (npm run functions). Without this the badge would report a 404 as local mode,
    // which is honest but not what you are trying to see.
    proxy: {
      '/api': 'http://localhost:8788'
    }
  }
});
