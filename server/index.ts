import { existsSync } from 'node:fs';
import { createAssistantServer } from './assistant';

if (existsSync('.env')) process.loadEnvFile('.env');

const port = Number(process.env.AI_PORT ?? 8787);
const host = process.env.AI_HOST ?? '127.0.0.1';
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('AI_PORT harus bilangan bulat antara 1 dan 65535.');
}

const server = createAssistantServer({
  apiUrl: process.env.LLM_API_URL,
  apiKey: process.env.LLM_API_KEY,
  model: process.env.LLM_MODEL,
});
server.listen(port, host, () => {
  process.stdout.write(`PanganBantu assistant API listening at http://${host}:${port}\n`);
});

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.once(signal, () => server.close(() => process.exit(0)));
}
