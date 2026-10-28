/*
=============================
planner.worker
--> Menjalankan pencarian menu di thread terpisah agar antarmuka tetap responsif.
=============================
*/

import { generate } from './model';
import type { GenerationInput } from './types';

self.onmessage = (event: MessageEvent<GenerationInput>) => {
  try {
    self.postMessage({ result: generate(event.data.form, event.data.stock, event.data.prefs) });
  } catch {
    self.postMessage({ error: 'Perhitungan rencana gagal. Periksa isian dan coba lagi.' });
  }
};
