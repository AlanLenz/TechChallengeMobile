import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';

const servicePath = fileURLToPath(
  new URL('../src/modules/home/domain/services/dashboard-period.service.ts', import.meta.url)
);
const require = createRequire(import.meta.url);
const typescript = require('typescript');
const serviceModule = { exports: {} };
const compiledService = typescript.transpileModule(readFileSync(servicePath, 'utf8'), {
  compilerOptions: {
    module: typescript.ModuleKind.CommonJS,
    target: typescript.ScriptTarget.ES2020,
    esModuleInterop: true,
  },
}).outputText;

new Function('require', 'module', 'exports', compiledService)(
  createRequire(pathToFileURL(servicePath)),
  serviceModule,
  serviceModule.exports
);

const { filterTransactionsByPeriod } = serviceModule.exports;
const transaction = (id, date) => ({
  id,
  description: id,
  amount: 10,
  date,
  type: 'Transfer',
  categories_id: 1,
});

test('this-month includes only transactions in the current calendar month', () => {
  const transactions = [
    transaction('previous-month', '2026-10-31'),
    transaction('first-day', '2026-11-01'),
    transaction('today', '2026-11-16'),
    transaction('future', '2026-11-17'),
  ];

  assert.deepEqual(
    filterTransactionsByPeriod(transactions, 'this-month', new Date(2026, 10, 16, 12)).map(
      (item) => item.id
    ),
    ['first-day', 'today']
  );
});

test('last-30-days includes both boundary dates and excludes older or future transactions', () => {
  const transactions = [
    transaction('older', '2026-10-17'),
    transaction('first-day', '2026-10-18'),
    transaction('today', '2026-11-16'),
    transaction('future', '2026-11-17'),
  ];

  assert.deepEqual(
    filterTransactionsByPeriod(transactions, 'last-30-days', new Date(2026, 10, 16, 12)).map(
      (item) => item.id
    ),
    ['first-day', 'today']
  );
});

test('all-time returns the full transaction list', () => {
  const transactions = [transaction('old', '2020-01-01'), transaction('today', '2026-11-16')];

  assert.equal(filterTransactionsByPeriod(transactions, 'all-time'), transactions);
});
