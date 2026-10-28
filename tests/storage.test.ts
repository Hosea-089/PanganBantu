import assert from 'node:assert/strict';
import test from 'node:test';
import { defaultForm, defaultPrefs, demoStock, generate } from '../src/features/planning/model';
import {
  isAccounts,
  isChecks,
  isPlanForm,
  isPrefs,
  isSavedPlan,
  isStock,
} from '../src/shared/storage/validators';
import { read, write } from '../src/shared/storage/storage';
import { migrateLegacyKitchen } from '../src/shared/storage/migrate';
import { kitchenKey } from '../src/features/pantry/kitchen';

function mockStorage() {
  const values = new Map<string, string>();
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => {
        values.set(key, value);
      },
    },
  });
  return {
    values,
    restore: () => {
      if (previous) Object.defineProperty(globalThis, 'localStorage', previous);
      else Reflect.deleteProperty(globalThis, 'localStorage');
    },
  };
}

test('malformed or structurally invalid storage falls back safely', () => {
  const mock = mockStorage();
  try {
    mock.values.set('pb-stock', '{');
    assert.deepEqual(read('stock', {}, isStock), {});
    mock.values.set('pb-stock', '{"unknown":1}');
    assert.deepEqual(read('stock', {}, isStock), {});
    mock.values.set('pb-stock', '{"beras":100}');
    assert.deepEqual(read('stock', {}, isStock), { beras: 100 });
  } finally {
    mock.restore();
  }
});

test('storage rejection reports failure without throwing', () => {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    get: () => {
      throw new Error('disabled');
    },
  });
  try {
    assert.equal(write('stock', {}), false);
    assert.deepEqual(read('stock', {}, isStock), {});
  } finally {
    if (previous) Object.defineProperty(globalThis, 'localStorage', previous);
    else Reflect.deleteProperty(globalThis, 'localStorage');
  }
});

test('input validation rejects invalid calendar dates, out-of-range days and invalid quantities', () => {
  for (const days of [0, 8, 1.5, Infinity])
    assert.equal(isPlanForm({ ...defaultForm, days }), false);
  assert.equal(isPlanForm({ ...defaultForm, start: '2026-02-30' }), false);
  assert.equal(isPlanForm({ ...defaultForm, people: 101 }), false);
  assert.equal(isStock({ beras: -1 }), false);
  assert.equal(isStock({ telur: 1.5 }), false);
  assert.equal(isStock({ __proto__: { polluted: true }, unknown: 1 }), false);
  assert.equal(isChecks({ beras: 'true' }), false);
  assert.equal(
    isAccounts([{ name: 'Test', email: 'test@example.test', digest: 'invalid' }]),
    false,
  );
  assert.equal(isPrefs({ ...defaultPrefs, avoided: ['unknown'] }), false);
  assert.throws(() => generate({ ...defaultForm, days: 1000 }, {}, defaultPrefs));
});

test('saved plans must match recipe slots and duration', () => {
  const result = generate(defaultForm, demoStock, defaultPrefs);
  assert.ok(result.plan);
  assert.ok(isSavedPlan(result.plan));
  assert.equal(isSavedPlan({ ...result.plan, menu: [['missing']] }), false);
  const wrongSlot = structuredClone(result.plan);
  wrongSlot.menu[0].reverse();
  assert.equal(isSavedPlan(wrongSlot), false);
});

test('legacy migration is scoped to the current account and never overwrites scoped data', () => {
  const mock = mockStorage();
  try {
    mock.values.set('pb-session', JSON.stringify({ name: 'Test', email: 'test@example.test' }));
    mock.values.set('pb-stock', JSON.stringify({ beras: 999 }));
    const scoped = `pb-${kitchenKey('test@example.test', 'stock')}`;
    mock.values.set(scoped, JSON.stringify({ beras: 321 }));
    migrateLegacyKitchen();
    assert.deepEqual(JSON.parse(mock.values.get(scoped) ?? ''), { beras: 321 });
    assert.equal(mock.values.has(`pb-${kitchenKey('other@example.test', 'stock')}`), false);
    assert.equal(mock.values.get('pb-scoped-storage-v1'), 'true');
  } finally {
    mock.restore();
  }
});

test('legacy active session keeps its existing kitchen', () => {
  const mock = mockStorage();
  try {
    mock.values.set('pb-session', JSON.stringify({ name: 'Test', email: 'test@example.test' }));
    mock.values.set('pb-stock', JSON.stringify({ beras: 999 }));
    migrateLegacyKitchen();
    assert.deepEqual(
      JSON.parse(mock.values.get(`pb-${kitchenKey('test@example.test', 'stock')}`) ?? ''),
      { beras: 999 },
    );
  } finally {
    mock.restore();
  }
});
