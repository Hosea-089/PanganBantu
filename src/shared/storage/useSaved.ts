/*
=============================
useSaved
--> State lokal tersimpan dengan pelaporan kegagalan penyimpanan.
=============================
*/

import { useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { read, write, type Validator } from './storage';

// Pemilik hook harus di-remount dengan key ketika lingkup akun berubah.
export function useSaved<T>(key: string, fallback: T | (() => T), validate: Validator<T>) {
  const [state, setState] = useState(() => ({
    value: read(key, typeof fallback === 'function' ? (fallback as () => T)() : fallback, validate),
    saveFailed: false,
  }));
  const current = useRef(state.value);
  const setValue: Dispatch<SetStateAction<T>> = (next) => {
    const value = typeof next === 'function' ? (next as (previous: T) => T)(current.current) : next;
    current.current = value;
    const saved = write(key, value);
    setState({ value, saveFailed: !saved });
  };
  return { ...state, setValue };
}
