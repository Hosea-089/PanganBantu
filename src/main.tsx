/*
=============================
main
--> Titik masuk React, migrasi penyimpanan, dan urutan stylesheet aplikasi.
=============================
*/

import { App } from '@/app/App';
import { migrateLegacyKitchen } from '@/shared/storage/migrate';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/index.css';

const root = document.getElementById('root');
migrateLegacyKitchen();
if (!root) throw new Error('Elemen root aplikasi tidak ditemukan.');
createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
