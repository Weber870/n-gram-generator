import { test } from 'node:test';
import assert from 'node:assert/strict';

import { ngrams, charNgrams, wordNgrams } from '../src/index.js';

test('ngrams returns overlapping length-n slices of a token array', () => {
  const out = ngrams(['a', 'b', 'c', 'd'], 2);
  assert.deepEqual(out, [
    ['a', 'b'],
    ['b', 'c'],
    ['c', 'd'],
  ]);
});

test('ngrams with n === 1 returns each token as its own array', () => {
  const out = ngrams(['x', 'y'], 1);
  assert.deepEqual(out, [['x'], ['y']]);
});

test('ngrams with n equal to length returns a single slice', () => {
  const out = ngrams(['a', 'b', 'c'], 3);
  assert.deepEqual(out, [['a', 'b', 'c']]);
});

test('ngrams with n greater than length returns an empty array', () => {
  assert.deepEqual(ngrams(['a', 'b'], 5), []);
});

test('ngrams with empty input returns an empty array', () => {
  assert.deepEqual(ngrams([], 2), []);
});

test('ngrams throws RangeError for n of 0', () => {
  assert.throws(() => ngrams(['a'], 0), RangeError);
});

test('ngrams throws RangeError for negative n', () => {
  assert.throws(() => ngrams(['a'], -1), RangeError);
});

test('ngrams throws RangeError for non-integer n', () => {
  assert.throws(() => ngrams(['a'], 2.5), RangeError);
});

test('ngrams returns copies, not views into the input', () => {
  const input = ['a', 'b', 'c'];
  const out = ngrams(input, 2);
  out[0][0] = 'Z';
  assert.equal(input[0], 'a', 'mutating an n-gram must not touch the source');
});

test('charNgrams splits on Unicode code points, not UTF-16 code units', () => {
  // '🏆' is an astral-plane character: one code point, two UTF-16 code units.
  // We expect it to count as a single token.
  const out = charNgrams('a🏆b', 2);
  assert.deepEqual(out, [
    ['a', '🏆'],
    ['🏆', 'b'],
  ]);
});

test('charNgrams on an empty string returns an empty array', () => {
  assert.deepEqual(charNgrams('', 2), []);
});

test('wordNgrams splits on whitespace runs and ignores empties', () => {
  const out = wordNgrams('  one   two\nthree  ', 2);
  assert.deepEqual(out, [
    ['one', 'two'],
    ['two', 'three'],
  ]);
});

test('wordNgrams does not strip punctuation or lowercase', () => {
  // This is deliberate and documented. Punctuation and case are the caller's
  // concern, not ours.
  const out = wordNgrams('Hello, world!', 2);
  assert.deepEqual(out, [['Hello,', 'world!']]);
});

test('wordNgrams with fewer words than n returns an empty array', () => {
  assert.deepEqual(wordNgrams('solo', 2), []);
});
