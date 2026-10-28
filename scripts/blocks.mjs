import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, URL } from 'node:url';
import process from 'node:process';

const root = fileURLToPath(new URL('../', import.meta.url));
const source = path.join(root, 'src');
const filter = process.argv
  .slice(2)
  .filter((arg) => arg !== '--')
  .join(' ')
  .toLowerCase();

async function files(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const found = await Promise.all(
    entries.map((entry) =>
      entry.isDirectory() ? files(path.join(dir, entry.name)) : [path.join(dir, entry.name)],
    ),
  );
  return found.flat();
}

let count = 0;
for (const file of (await files(source)).sort()) {
  if (!/\.(?:tsx?|css)$/.test(file)) continue;
  const text = await readFile(file, 'utf8');
  const block = text.match(/\/\*\s*(={10,})\s*\n([^\n]+)\n--> ([\s\S]*?)\n={10,}\s*\*\//);
  if (!block) continue;
  const name = block[2].trim();
  const description = block[3].trim().replace(/\s+/g, ' ');
  const relative = path.relative(root, file).replaceAll('\\', '/');
  if (filter && !`${name} ${description} ${relative}`.toLowerCase().includes(filter)) continue;
  process.stdout.write(
    `=============================\n${name}\n--> ${description}\n=============================\nFile: ${relative}\n\n`,
  );
  count++;
}

if (!count) {
  process.stderr.write('Blok tidak ditemukan. Jalankan pnpm blocks untuk melihat seluruh blok.\n');
  process.exitCode = 1;
}
