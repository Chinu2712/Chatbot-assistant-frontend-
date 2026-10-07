# metrics.html — component breakdown

What every part of [metrics.html](./metrics.html) does, top to bottom.

## `<head>`

- Standard charset/viewport meta + title.
- Loads the same three CSS files as `index.html` (`base.css`, `layout.css`,
  `components.css`) so both pages share one design system — no page-specific
  stylesheet.

## `<header class="site-header">`

- Site title + a two-link nav (`Chat` / `Metrics`). `aria-current="page"` is
  set on the `Metrics` link so assistive tech and the `.site-header__nav
  a[aria-current="page"]` CSS rule can highlight the active page.

## `<main class="metrics-page">` — two `<section class="panel">` blocks

### Panel 1 — Routing accuracy

- `#run-eval` button: the only user action on this panel. Triggers the
  evaluation described below.
- `#eval-summary` (`class="stat-row"`): empty container filled with three
  `stat()` boxes (accuracy / questions / misses) once evaluation runs.
- `#eval-output`: empty container filled with the confusion table and, if
  any exist, the misses list.
- Both have `aria-live="polite"` so screen readers announce results when
  they appear without needing focus to move.

### Panel 2 — Session metrics

- `#session-summary` (`class="stat-row"`): filled immediately on page load
  (see bottom of script) from whatever is already in `localStorage` —
  no button needed, it just reflects the current session log.
- `#clear-log` button: wipes the session log and re-renders the (now all
  zero) stats. Useful for resetting the demo between runs.

## `<script type="module">` (inline — this page has no separate `.js` file)

### Imports

```js
import { route } from './js/router/index.js';
import { EVAL_SET_URL, MANIFEST_URL } from './js/config.js';
import * as store from './js/store.js';
import { el, clearChildren, qs } from './js/util/dom.js';
```

- `route` — the active router (keyword or remote, picked by `config.js`);
  reused as-is so the evaluation always tests whatever `app.js` would
  actually use.
- `EVAL_SET_URL` / `MANIFEST_URL` — the two JSON paths, defined once in
  `config.js` rather than hardcoded here.
- `store` — session log read/clear/compute functions (shared with
  `app.js`, which is what wrote the log in the first place).
- `el` / `clearChildren` / `qs` — the tiny DOM-builder helpers used
  everywhere else in the app, so this page doesn't invent its own markup
  patterns.

### `loadDomains()`

Fetches `manifest.json`, then fetches every domain file it lists, in
parallel (`Promise.all`). Returns the array of domain objects (same shape
`app.js` uses: `id`, `displayName`, `keywords`, `entries`, etc.).
`cache: 'no-store'` is set on every fetch so edits to the JSON during
development/demoing are always picked up instead of being served from the
browser's HTTP cache.

### `stat(label, value)`

One-line helper: builds a `<div class="stat">` with a big value and a small
label underneath (the boxes you see in both panels' `stat-row`s). Shared by
both the eval summary and the session summary so they look identical.

### `renderSessionMetrics()`

Calls `store.computeMetrics()` (counts events already logged by `app.js` —
questions, clarifications, handoffs, feedback) and renders five `stat()`
boxes into `#session-summary`: questions asked, resolution rate,
clarification rate, handoff rate, average confidence. All the actual math
lives in `store.js`; this function only turns numbers into DOM.

### `runEvaluation()` — the core of the page

1. Loads the domains and `eval-set.json` in parallel.
2. Builds an empty `confusion` object: `confusion[expectedDomain][predictedDomain] = 0` for every domain pair, as a nested lookup table (a plain object standing in for a matrix).
3. Loops over every item in `eval-set.json`, calls `route(item.text, {}, domains)` — the exact same router function the chat UI uses — and:
   - increments `confusion[expected][predicted]`
   - if predicted matches expected, counts it `correct`
   - otherwise pushes it into `misses` with what was predicted and at what confidence
4. Computes `accuracy = correct / total` and renders it plus counts into `#eval-summary` via `stat()`.
5. Builds the confusion `<table>` with `el(...)` calls: header row of predicted-domain names, one row per expected domain with counts per predicted domain. Diagonal cells (`expected === predicted`, i.e. correct predictions) get `.confusion__hit` styling; off-diagonal non-zero cells get `.confusion__miss` styling (both just CSS classes for colour/weight).
6. If there are misses, appends a `<h3>` and a `<ul class="misses">` listing each missed question with its expected vs. predicted domain and confidence.

### Event wiring (bottom of the script)

- `#run-eval` click → runs `runEvaluation()`; if it throws (e.g. a JSON
  file 404s), the `.catch` renders a `.load-error` alert into `#eval-output`
  instead of leaving the page silently broken — same "real error state"
  rule the chat page follows.
- `#clear-log` click → `store.clearEvents()` then re-renders session stats
  (all back to zero).
- `renderSessionMetrics()` is also called once, unconditionally, at the
  bottom of the script — this is what makes the session panel populate
  immediately on page load without waiting for a button click.
