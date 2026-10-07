// app.js
// Wires the chat page together: loads domain data, sends each message
// through the router, then either answers directly, asks a clarifying
// question, or hands off - per the confidence bands in config.js. Keeps a
// running list of which domains have been touched in this conversation for
// the topics strip. Nothing here is domain-specific; it all comes from the
// loaded JSON.

import { THRESHOLDS, MANIFEST_URL } from './config.js';
import { route } from './router/index.js';
import { answer } from './skills/index.js';
import * as store from './store.js';
import {
  appendUserMessage,
  appendAssistantAnswer,
  appendClarifyCard,
  appendHandoffCard,
  renderTopicsStrip,
  showLoadError
} from './ui.js';
import { qs } from './util/dom.js';

const messageList = qs('#message-list');
const topicsStrip = qs('#topics-strip');
const composer = qs('#composer');
const input = qs('#message-input');

const state = {
  domains: [],
  domainMap: {},
  lastDomain: null,
  topicsUsed: []
};

async function loadDomains() {
  const manifestRes = await fetch(MANIFEST_URL, { cache: 'no-store' });
  if (!manifestRes.ok) throw new Error(`manifest.json: HTTP ${manifestRes.status}`);
  const manifest = await manifestRes.json();

  const domains = await Promise.all(manifest.domains.map(async ({ file }) => {
    const res = await fetch(`data/${file}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`${file}: HTTP ${res.status}`);
    return res.json();
  }));

  return domains;
}

function markTopicUsed(domainId) {
  if (!state.topicsUsed.includes(domainId)) {
    state.topicsUsed.push(domainId);
    renderTopicsStrip(topicsStrip, state.topicsUsed, state.domainMap);
  }
}

function topCandidates(scores, count) {
  return Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([id, score]) => ({ domain: state.domainMap[id], score }));
}

function wireFeedback(feedback, feedbackNote, domain, entryId) {
  const [solvedBtn, notSolvedBtn] = feedback.children;

  solvedBtn.addEventListener('click', () => {
    store.logEvent({ type: 'feedback', domain: domain.id, entryId, resolved: true });
    feedbackNote.hidden = false;
    feedbackNote.textContent = 'Thanks - glad that helped.';
    solvedBtn.disabled = true;
    notSolvedBtn.disabled = true;
  });

  notSolvedBtn.addEventListener('click', () => {
    store.logEvent({ type: 'feedback', domain: domain.id, entryId, resolved: false });
    solvedBtn.disabled = true;
    notSolvedBtn.disabled = true;
    const { noneButton } = appendHandoffCard(messageList, {
      candidates: [{ domain, score: 1 }]
    });
    noneButton.addEventListener('click', () => {
      store.logEvent({ type: 'handoff', domain: domain.id, confidence: null, dismissed: true });
      noneButton.closest('.card').remove();
    });
    messageList.scrollTop = messageList.scrollHeight;
  });
}

async function answerDirectly(text, domain, confidence, viaClarify) {
  const result = await answer(text, domain);
  const { feedback, feedbackNote } = appendAssistantAnswer(messageList, {
    domain,
    text: result.text,
    sources: result.sources,
    confidence,
    viaClarify
  });
  wireFeedback(feedback, feedbackNote, domain, result.entryId);
  markTopicUsed(domain.id);
  state.lastDomain = domain.id;
}

async function handleMessage(text) {
  appendUserMessage(messageList, text);

  const result = await route(text, { lastDomain: state.lastDomain }, state.domains);
  const { domain: topId, confidence, scores } = result;

  if (confidence >= THRESHOLDS.direct) {
    store.logEvent({ type: 'question', domain: topId, confidence, band: 'direct' });
    await answerDirectly(text, state.domainMap[topId], confidence, false);
    return;
  }

  if (confidence >= THRESHOLDS.clarify) {
    store.logEvent({ type: 'question', domain: topId, confidence, band: 'clarify' });
    store.logEvent({ type: 'clarify', domain: topId, confidence });

    const candidates = topCandidates(scores, 3);
    const { chipsRow } = appendClarifyCard(messageList, {
      candidates,
      clarifyQuestion: state.domainMap[topId].clarifyQuestion
    });

    chipsRow.addEventListener('click', async (event) => {
      const chip = event.target.closest('.chip');
      if (!chip) return;
      [...chipsRow.children].forEach(c => (c.disabled = true));
      chip.classList.add('chip--chosen');
      const chosen = state.domainMap[chip.dataset.domainId];
      await answerDirectly(text, chosen, scores[chosen.id], true);
    });
    return;
  }

  store.logEvent({ type: 'question', domain: topId, confidence, band: 'handoff' });
  store.logEvent({ type: 'handoff', domain: topId, confidence });

  const candidates = topCandidates(scores, 3);
  const { noneButton } = appendHandoffCard(messageList, { candidates });
  noneButton.addEventListener('click', () => {
    noneButton.closest('.card').remove();
  });
}

composer.addEventListener('submit', (event) => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  input.value = '';
  handleMessage(text);
  messageList.scrollTop = messageList.scrollHeight;
});

input.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    composer.requestSubmit();
  }
});

loadDomains()
  .then((domains) => {
    state.domains = domains;
    state.domainMap = Object.fromEntries(domains.map(d => [d.id, d]));
    renderTopicsStrip(topicsStrip, state.topicsUsed, state.domainMap);
    input.disabled = false;
    input.focus();
  })
  .catch((err) => {
    showLoadError(messageList, `Couldn't load campus data (${err.message}). Check that data/manifest.json and its domain files are reachable.`);
  });
