// skills/index.js
// Only one implementation exists today (localSkill). Kept as its own
// module - rather than importing localSkill.js directly everywhere - so a
// future remote skill (backed by the same kind of Azure Function as
// remoteRouter.js) can be swapped in from one line, same pattern as
// router/index.js.

import * as localSkill from './localSkill.js';

export async function answer(query, domain) {
  return localSkill.answer(query, domain);
}
