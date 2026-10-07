# Campus Assistant — one front door

A single chat UI that figures out whether a student's question is IT, HR/Admin,
Fees, or Facilities, answers it with a cited source, or asks a clarifying
question / hands off to the right team when it isn't sure. Frontend only —
no backend, no build step, no frameworks.

## Running it

Any static file server works, since it's plain HTML/CSS/JS modules loaded
over `fetch`. From this folder:

```
npx serve .
# or
python -m http.server 8080
```

Then open `index.html` (chat) or `metrics.html` (routing accuracy + session
metrics). Opening `index.html` directly via `file://` won't work because
`fetch()` for the JSON data is blocked by the browser — it needs `http://`.

## How routing works

`js/router/keywordRouter.js` scores the message against each domain's
`keywords` list from `data/domains/*.json`. Each keyword has a weight
(0–1); if the keyword phrase appears anywhere in the (lowercased,
punctuation-stripped) message, its weight is added to that domain's score,
clamped to 1. The domain with the highest score wins.

`js/config.js` holds the confidence bands that decide what happens next:

- `>= THRESHOLDS.direct` (0.65): answer directly, show the domain badge.
- `THRESHOLDS.clarify`–`direct` (0.35–0.65): show 2–3 candidate domains as
  chips plus a clarifying question.
- `< THRESHOLDS.clarify`: hand off to the top candidate teams' contacts.

Answers themselves come from `js/skills/localSkill.js`, which ranks a
domain's `entries` by how many query words overlap with each entry's
question/answer text — same "plain loop, no ML" spirit as the router.

## Adding a domain

1. Add `data/domains/<id>.json` following the shape of the existing files
   (`id`, `displayName`, `colorToken`, `keywords`, `clarifyQuestion`,
   `handoffContact`, `entries`).
2. Add `{ "id": "<id>", "file": "domains/<id>.json" }` to
   `data/manifest.json`.
3. Pick a `colorToken` that's already defined in `css/base.css`
   (`teal`, `amber`, `plum`, `slate`, `rust`), or add a new
   `--domain-<name>` variable there.

No JS or other CSS changes needed — the UI reads `displayName` and
`colorToken` from the JSON, never a hardcoded domain name.

## What's next (the upgrade path)

- **Router**: `js/router/index.js` picks the active implementation from
  `ACTIVE_ROUTER` in `config.js`. `js/router/remoteRouter.js` is the stub
  for a hosted router (Azure Function / Azure AI Language) — same
  `route(text, context)` signature, so swapping it in is a one-line config
  change plus filling in the `fetch` call already sketched in that file.
- **Skills**: `js/skills/index.js` is the same kind of seam for answer
  retrieval, if entries ever move to a real search index.
- **Telemetry**: `js/store.js` currently logs to memory + localStorage.
  Swapping `logEvent`/`getEvents` to also POST to a telemetry endpoint
  wouldn't change any caller.

See the code review notes shared alongside this build for exactly which
lines change for a hosted router, and the latency/scaling trade-offs.
