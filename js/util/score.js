// util/score.js
// Shared scoring helpers used by both the router (matching text against
// domain keyword lists) and the local skill (matching text against a
// domain's entries). Deliberately dumb: lowercase, strip punctuation,
// substring/overlap checks. No stemming, no ranking model.

export function normalize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function tokenize(text) {
  const normalized = normalize(text);
  return normalized.length ? normalized.split(' ') : [];
}

// Short, common words that would otherwise dominate term-overlap scoring
// (every question has "i", "my", "is"...) without saying anything about
// the topic. Not a real stopword list, just enough to stop them winning.
const STOPWORDS = new Set([
  'i', 'a', 'an', 'the', 'is', 'are', 'am', 'my', 'me', 'to', 'of', 'in',
  'on', 'at', 'and', 'or', 'do', 'does', 'did', 'can', 't', 'it', 'for',
  'this', 'that', 'be', 'how', 'what', 'with', 'not'
]);

function meaningfulTokens(text) {
  return tokenize(text).filter(token => !STOPWORDS.has(token));
}

// Sums the weights of every keyword phrase found (as a substring) in the
// normalized text, clamped to 1. Also returns which terms matched so the
// caller can show a human-readable reason.
export function scoreKeywords(text, keywords) {
  const normalized = normalize(text);
  const matched = [];
  let raw = 0;
  for (const { term, weight } of keywords) {
    if (normalized.includes(normalize(term))) {
      raw += weight;
      matched.push({ term, weight });
    }
  }
  return { score: Math.min(1, raw), matched };
}

// Counts how many of the query's tokens appear in the target text's tokens,
// ignoring common stopwords. Used to rank a domain's entries against a
// free-text query.
export function termOverlap(queryText, targetText) {
  const queryTokens = new Set(meaningfulTokens(queryText));
  const targetTokens = new Set(meaningfulTokens(targetText));
  let overlap = 0;
  for (const token of queryTokens) {
    if (targetTokens.has(token)) overlap += 1;
  }
  return queryTokens.size ? overlap / queryTokens.size : 0;
}
