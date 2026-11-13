import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), ['AI_PORT', 'API_PORT']);
  const aiPort = Number(env.AI_PORT || 8787);
  const apiPort = Number(env.API_PORT || 8000);
  const proxies = {
    '/api/auth': { target: `http://127.0.0.1:${apiPort}`, changeOrigin: false },
    '/api/v1': { target: `http://127.0.0.1:${apiPort}`, changeOrigin: false },
    '/api/assistant/recipes': { target: `http://127.0.0.1:${aiPort}`, changeOrigin: false },
  };
  return {
    cacheDir: '.vite-cache',
    plugins: [react()],
    server: { proxy: proxies },
    preview: { proxy: proxies },
    resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  };
});
