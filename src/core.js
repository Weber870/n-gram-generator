/**
 * Core n-gram extraction routines.
 *
 * Design decisions (stated plainly so callers know exactly what they get):
 *
 * 1. There is exactly one primitive: `ngrams(tokens, n)`. It treats its input as
 *    an array of already-segmented tokens and returns every length-`n` contiguous,
 *    overlapping slice. Nothing else is attempted — no padding, no smoothing,
 *    no frequency counting. If you need those, build them on top.
 *
 * 2. `charNgrams` and `wordNgrams` are thin conveniences that produce the token
 *    array for you first. `charNgrams` splits on UTF-16 code units via `Array.from`
 *    (which iterates code points, not bytes), and `wordNgrams` splits on any run
 *    of Unicode whitespace. We deliberately do NOT strip punctuation or lowercase:
 *    that is a modelling choice the caller should make explicitly. Documented here
 *    so nobody is surprised that "Hello," and "hello," produce different word tokens.
 *
 * 3. `n` of 0 or negative is a programmer error and throws `RangeError`. An empty
 *    input with a positive `n` simply yields no n-grams — the empty set is the
 *    correct, least-surprising answer there.
 */

/**
 * Yield every contiguous, overlapping run of length `n` from `tokens`.
 *
 * Returns a fresh array of arrays (not a generator) so callers can safely
 * mutate or serialise the result without aliasing the input. Each sub-array
 * is a copy, because returning slices that share storage with the input would
 * be a subtle bug farm for anyone who later mutates `tokens`.
 *
 * @param {Array<*>} tokens - The pre-segmented sequence to slice.
 * @param {number} n - The n-gram length. Must be a positive integer.
 * @returns {Array<Array<*>>} Array of n-grams, each an array of length `n`.
 * @throws {RangeError} If `n` is not a positive integer.
 */
export function ngrams(tokens, n) {
  if (!Number.isInteger(n) || n < 1) {
    throw new RangeError(`n must be a positive integer, got ${String(n)}`);
  }
  if (!Array.isArray(tokens)) {
    throw new TypeError('tokens must be an array');
  }

  const count = tokens.length - n + 1;
  if (count <= 0) return [];

  const out = new Array(count);
  for (let i = 0; i < count; i++) {
    // slice() copies; we never hand back views into the caller's array.
    out[i] = tokens.slice(i, i + n);
  }
  return out;
}

/**
 * Split `text` into its characters and return overlapping length-`n` runs.
 *
 * Uses `Array.from(text)`, which iterates Unicode code points rather than
 * UTF-16 code units, so an emoji such as "🏆" is one token, not a surrogate
 * pair. This is the behaviour you almost always want for text comparison;
 * splitting on `.split('')` would silently split surrogate pairs and produce
 * garbage n-grams. The cost is that astral-plane characters count as one
 * token, which is the correct unit for "character" in most contexts.
 *
 * @param {string} text
 * @param {number} n
 * @returns {Array<Array<string>>}
 */
export function charNgrams(text, n) {
  if (typeof text !== 'string') {
    throw new TypeError('text must be a string');
  }
  // Array.from on a string iterates code points, which is what we want.
  return ngrams(Array.from(text), n);
}

/**
 * Split `text` on whitespace into words and return overlapping length-`n` runs.
 *
 * `\\s+` matches any run of Unicode whitespace, so leading/trailing/multiple
 * spaces collapse cleanly and never produce empty-string tokens. We do NOT
 * lowercase or strip punctuation — that is the caller's job, because it is a
 * modelling decision (e.g. "Don't" vs "dont") that this library refuses to
 * make for you.
 *
 * @param {string} text
 * @param {number} n
 * @returns {Array<Array<string>>}
 */
export function wordNgrams(text, n) {
  if (typeof text !== 'string') {
    throw new TypeError('text must be a string');
  }
  const words = text.split(/\s+/).filter((w) => w.length > 0);
  return ngrams(words, n);
}
