// router/remoteRouter.js
// Implementation B (STUB ONLY) of the router interface. Same signature as
// keywordRouter so config.js can flip ACTIVE_ROUTER without touching
// app.js. Not implemented on purpose - this is the seam where the project
// becomes a cloud service.
//
// TODO(upgrade path): swap the body below for something like:
//   const res = await fetch('https://<function-app>.azurewebsites.net/api/route', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ text, context })
//   });
//   return await res.json();
// The Azure Function would host the same scoring logic (or a real model,
// e.g. an Azure AI Language custom classification project) behind an HTTP
// trigger, so the { domain, confidence, scores, reason } contract doesn't
// change for callers.

export async function route(_text, _context, _domains) {
  throw new Error('remoteRouter is a stub - set ACTIVE_ROUTER to "keyword" in config.js');
}
