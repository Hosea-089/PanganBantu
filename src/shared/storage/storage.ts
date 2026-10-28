/*
=============================
storage
--> Pembacaan tervalidasi dan penulisan localStorage yang menangani kegagalan.
=============================
*/

export type Validator<T> = (value: unknown) => value is T;

export function read<T>(key: string, fallback: T, validate: Validator<T>): T {
  try {
    const raw = localStorage.getItem(`pb-${key}`);
    if (raw === null) return fallback;
    const value: unknown = JSON.parse(raw);
    return validate(value) ? value : fallback;
  } catch {
    return fallback;
  }
}

export function write<T>(key: string, value: T): boolean {
  try {
    localStorage.setItem(`pb-${key}`, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}
