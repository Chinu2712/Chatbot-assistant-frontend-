// config.js
// Single place for the knobs that would otherwise be scattered through the
// app: which router implementation is live, and the confidence bands that
// decide whether we answer directly, ask a clarifying question, or hand off.
// Changing a threshold or swapping the router should never require touching
// any other file.

export const ACTIVE_ROUTER = 'keyword'; // 'keyword' | 'remote'

export const THRESHOLDS = {
  direct: 0.65,   // >= this: route straight to the domain, show its badge
  clarify: 0.35   // >= this and < direct: ask a clarifying question
                  // below this: hand off to a human team
};

export const MANIFEST_URL = 'data/manifest.json';
export const EVAL_SET_URL = 'data/eval-set.json';

export const STORAGE_KEY = 'campus-assistant-session-log';
