// skills/localSkill.js
// Implementation of the answer interface: async answer(query, domain)
// -> { text, sources[], entryId }
//
// Ranks a domain's entries by term overlap between the query and each
// entry's question+answer text, and returns the best match. If nothing
// clears the minimum overlap, it says so plainly instead of guessing -
// the UI is responsible for rendering the "no source found" warning when
// sources is empty.

import { termOverlap } from '../util/score.js';

const MIN_OVERLAP = 0.2;

// TODO: haven't found a good way to handle a query that legitimately
// matches two entries in the same domain equally well - it just picks the
// first best match found, which is order-dependent.

export async function answer(query, domain) {
  let best = null;
  let bestScore = 0;

  for (const entry of domain.entries) {
    const target = `${entry.question} ${entry.answer}`;
    const overlapScore = termOverlap(query, target);
    if (overlapScore > bestScore) {
      bestScore = overlapScore;
      best = entry;
    }
  }

  if (!best || bestScore < MIN_OVERLAP) {
    return {
      text: `I couldn't find a specific answer for that in ${domain.displayName}. Try rephrasing, or use the handoff contact below.`,
      sources: [],
      entryId: null
    };
  }

  return { text: best.answer, sources: best.sources, entryId: best.id };
}
