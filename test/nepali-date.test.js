import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  adToBs, bsToAd, daysInBsMonth, daysInBsYear, isValidBs, formatBs,
  toNepaliDigits, fromNepaliDigits, MIN_BS_YEAR, MAX_BS_YEAR,
} from '../src/nepali-date.js';

const sources = JSON.parse(readFileSync(new URL('./fixtures-sources.json', import.meta.url), 'utf8'));

test('known anchor dates (Nepali New Year / Baishakh 1)', () => {
  const anchors = [
    ['2000-01-01', '1943-04-14'],
    ['2080-01-01', '2023-04-14'],
    ['2081-01-01', '2024-04-13'],
    ['2082-01-01', '2025-04-14'],
    ['2083-01-01', '2026-04-14'],
    ['2090-12-30', '2034-04-13'],
  ];
  for (const [bs, ad] of anchors) {
    const [y, m, d] = bs.split('-').map(Number);
    const r = bsToAd(y, m, d);
    const got = `${r.year}-${String(r.month).padStart(2, '0')}-${String(r.day).padStart(2, '0')}`;
    assert.equal(got, ad, `BS ${bs}`);
    const back = adToBs(ad);
    assert.deepEqual([back.year, back.month, back.day], [y, m, d], `AD ${ad}`);
  }
});

test('weekday is correct', () => {
  assert.equal(bsToAd(2081, 1, 1).weekday, 6); // Saturday 13 Apr 2024
  assert.equal(adToBs(2026, 11, 1).weekday, 0); // Sunday
});

test('round-trip every single day in the supported range', () => {
  let count = 0;
  let prev = null;
  for (let y = MIN_BS_YEAR; y <= MAX_BS_YEAR; y++) {
    for (let m = 1; m <= 12; m++) {
      for (let d = 1; d <= daysInBsMonth(y, m); d++) {
        const ad = bsToAd(y, m, d);
        if (prev) assert.equal(ad.date - prev, 86400000, `gap at ${y}-${m}-${d}`);
        prev = ad.date;
        const bs = adToBs(ad.year, ad.month, ad.day);
        assert.deepEqual([bs.year, bs.month, bs.day], [y, m, d]);
        count++;
      }
    }
  }
  assert.ok(count > 33000);
});

test('month table matches the majority of 4 independent open-source tables', () => {
  const names = Object.keys(sources);
  for (let y = MIN_BS_YEAR; y <= MAX_BS_YEAR; y++) {
    const ours = JSON.stringify(Array.from({ length: 12 }, (_, i) => daysInBsMonth(y, i + 1)));
    const available = names.map((n) => sources[n][y]).filter(Boolean).map((v) => JSON.stringify(v));
    const agree = available.filter((v) => v === ours).length;
    assert.ok(agree >= 3, `year ${y}: only ${agree}/${available.length} sources agree`);
  }
});

test('year lengths are 365 or 366 days', () => {
  for (let y = MIN_BS_YEAR; y <= MAX_BS_YEAR; y++) {
    assert.ok([365, 366].includes(daysInBsYear(y)), `year ${y}`);
  }
});

test('accepts Date objects and strings', () => {
  assert.deepEqual(
    (({ year, month, day }) => [year, month, day])(adToBs(new Date(2026, 10, 1))),
    [2083, 7, 15],
  );
  assert.equal(bsToAd('2083-07-15').day, 1);
  assert.equal(bsToAd('2083/07/15').month, 11);
});

test('validation and range errors', () => {
  assert.equal(isValidBs(2083, 7, 15), true);
  assert.equal(isValidBs(2083, 13, 1), false);
  assert.equal(isValidBs(2083, 1, 32), false);
  assert.equal(isValidBs(1999, 1, 1), false);
  assert.throws(() => bsToAd(2083, 1, 40), RangeError);
  assert.throws(() => bsToAd(2091, 1, 1), RangeError);
  assert.throws(() => adToBs(2026, 2, 30), RangeError);
  assert.throws(() => adToBs('1900-01-01'), RangeError);
  assert.throws(() => adToBs('not a date'), TypeError);
  assert.throws(() => adToBs(new Date('x')), TypeError);
});

test('formatting in English and Nepali', () => {
  const bs = { year: 2083, month: 7, day: 15 };
  assert.equal(formatBs(bs), '2083-07-15');
  assert.equal(formatBs(bs, 'dddd, D MMMM YYYY'), 'Sunday, 15 Kartik 2083');
  assert.equal(formatBs(bs, 'YYYY MMMM D, dddd', 'ne'), '२०८३ कार्तिक १५, आइतबार');
  assert.equal(toNepaliDigits(2083), '२०८३');
  assert.equal(fromNepaliDigits('२०८३-०७-१५'), '2083-07-15');
});
