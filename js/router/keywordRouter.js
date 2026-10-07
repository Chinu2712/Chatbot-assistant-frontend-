// router/keywordRouter.js
// Implementation A of the router interface: async route(text, context)
// -> { domain, confidence, scores, reason }
//
// Scores the message against every domain's keyword list, clamps each
// domain's score to 0-1, and picks the highest. `context.lastDomain` gives
// a small continuity nudge so a follow-up in the same thread doesn't
// randomly flip domains on a borderline score - that's the only "memory"
// this router has.

import { scoreKeywords } from '../util/score.js';

const CONTINUITY_BONUS = 0.05;

// TODO: keyword weights in data/domains/*.json are guessed, not measured.
// Tune them against data/eval-set.json misses (see metrics.html) as real
// phrasing shows up.

export async function route(text, context, domains) {
  const scores = {};
  const reasons = {};

  for (const domain of domains) {
    const { score, matched } = scoreKeywords(text, domain.keywords);
    let finalScore = score;
    if (context && context.lastDomain === domain.id && score > 0) {
      finalScore = Math.min(1, finalScore + CONTINUITY_BONUS);
    }
    scores[domain.id] = finalScore;
    reasons[domain.id] = matched.map(m => `${m.term} (${m.weight})`).join(', ');
  }

  const topId = Object.keys(scores).reduce(
    (best, id) => (scores[id] > scores[best] ? id : best),
    domains[0].id
  );

  return {
    domain: topId,
    confidence: scores[topId],
    scores,
    reason: reasons[topId] ? `matched: ${reasons[topId]}` : 'no keywords matched'
  };
}
