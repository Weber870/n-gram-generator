# ngram

Extract overlapping length-`n` character or word sequences from text. Pure ESM, zero dependencies.

```js
import { ngrams, charNgrams, wordNgrams } from './src/index.js';

ngrams(['a', 'b', 'c', 'd'], 2);
// => [['a','b'], ['b','c'], ['c','d']]

charNgrams('toast', 3);
// => [['t','o','a'], ['o','a','s'], ['a','s','t']]

wordNgrams('the quick brown fox', 2);
// => [['the','quick'], ['quick','brown'], ['brown','fox']]
```

## Why

Built for the small but specific job of feeding token sequences into similarity
and language-modelling code without dragging in a corpus toolkit. The trade-off:
there is no padding, no smoothing, no frequency counting, and no normalisation.
`ngrams(tokens, n)` slices an array you already have; `charNgrams` and
`wordNgrams` are conveniences that build that array from a string. If you need
stop-word removal, lowercasing, or tf-idf weighting, do it before calling in —
those are modelling decisions this library refuses to make for you.

## Edge you will hit

`wordNgrams` splits on whitespace only. It does **not** strip punctuation or
lowercase, so `"Hello, world!"` yields the single token pair
`['Hello,', 'world!']`. That is intentional: case-folding and punctuation
handling belong to your pipeline, not to a splitter. Apply `text.toLowerCase()`
and a punctuation regex yourself if your comparison needs it.

`charNgrams` uses `Array.from(text)`, which iterates Unicode **code points**,
not UTF-16 code units. An emoji like `🏆` is one token, not two. This is almost
always what you want for text comparison, but it means `charNgrams(text, n)`
may return fewer n-grams than `text.length - n + 1` when the text contains
astral-plane characters.

`n` must be a positive integer; `0`, negatives, and `2.5` throw `RangeError`.
An input shorter than `n` returns `[]` rather than padding — the empty set is
the honest answer when there is nothing to extract.
