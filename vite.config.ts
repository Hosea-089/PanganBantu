import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'AI_PORT');
  const port = Number(env.AI_PORT || 8787);
  const assistantProxy = {
    '/api/assistant/recipes': {
      target: `http://127.0.0.1:${port}`,
      changeOrigin: false,
    },
  };
  return {
    cacheDir: '.vite-cache',
    plugins: [react()],
    server: { proxy: assistantProxy },
    preview: { proxy: assistantProxy },
    resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  };
});
