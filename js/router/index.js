// router/index.js
// Picks the active router implementation from config.js so the rest of the
// app only ever imports from here, never from keywordRouter/remoteRouter
// directly. This is the whole "swap local for hosted" seam.

import { ACTIVE_ROUTER } from '../config.js';
import * as keywordRouter from './keywordRouter.js';
import * as remoteRouter from './remoteRouter.js';

const impls = { keyword: keywordRouter, remote: remoteRouter };

export const activeRouter = impls[ACTIVE_ROUTER] || keywordRouter;

export async function route(text, context, domains) {
  return activeRouter.route(text, context, domains);
}
