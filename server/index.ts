import { existsSync } from 'node:fs';
import { createAssistantServer } from './assistant';
import { isCatalog, installCatalog } from '../src/features/planning/catalog';

if (existsSync('.env')) process.loadEnvFile('.env');

const port = Number(process.env.AI_PORT ?? 8787);
const host = process.env.AI_HOST ?? '127.0.0.1';
const apiUrl = process.env.API_URL ?? `http://127.0.0.1:${process.env.API_PORT ?? 8000}`;
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('AI_PORT harus bilangan bulat antara 1 dan 65535.');
}

async function start() {
  const response = await fetch(new URL('/api/v1/catalog', apiUrl));
  if (!response.ok) throw new Error(`Database catalog unavailable: HTTP ${response.status}.`);
  const payload: unknown = await response.json();
  if (!isCatalog(payload)) throw new Error('Database catalog format is invalid.');
  installCatalog(payload);

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
}

void start().catch((error: unknown) => {
  process.stderr.write(
    `${error instanceof Error ? error.message : 'Assistant startup failed.'}\n`,
  );
  process.exitCode = 1;
});
