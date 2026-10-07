// ui.js
// Rendering functions for the chat view. Every function takes plain data
// and (where needed) callbacks, and returns/mutates DOM nodes - no state
// lives in here, app.js owns that. Domain colour/label always comes from
// the domain object passed in, never hardcoded.

import { el, clearChildren } from './util/dom.js';

function domainBadge(domain) {
  const badge = el('span', { class: 'badge' }, domain.displayName);
  badge.style.setProperty('--badge-color', `var(--domain-${domain.colorToken})`);
  return badge;
}

function sourcesBlock(sources) {
  if (!sources || sources.length === 0) {
    return el('div', { class: 'sources sources--missing' }, [
      warningIcon(),
      el('span', {}, 'No source found for this answer.')
    ]);
  }
  return el('div', { class: 'sources' }, [
    el('h4', { class: 'sources__title' }, 'Sources'),
    el('ul', { class: 'sources__list' }, sources.map(s =>
      el('li', {}, [
        el('a', { href: s.url, target: '_blank', rel: 'noopener' }, s.title),
        el('span', { class: 'sources__date' }, ` \u00b7 updated ${s.updated}`)
      ])
    ))
  ]);
}

function warningIcon() {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', '0 0 16 16');
  svg.setAttribute('class', 'icon icon--warning');
  svg.setAttribute('aria-hidden', 'true');
  const path = document.createElementNS(ns, 'path');
  path.setAttribute('d', 'M8 1 15 14 1 14 Z M8 6v4 M8 11.5v.5');
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke', 'currentColor');
  path.setAttribute('stroke-width', '1.3');
  path.setAttribute('stroke-linejoin', 'round');
  svg.append(path);
  return svg;
}

export function appendUserMessage(list, text) {
  const node = el('div', { class: 'msg msg--user' }, [
    el('div', { class: 'msg__bubble' }, text)
  ]);
  list.append(node);
  return node;
}

export function appendAssistantAnswer(list, { domain, text, sources, confidence, viaClarify }) {
  const meta = el('div', { class: 'msg__meta' }, [
    domainBadge(domain),
    el('span', { class: 'msg__confidence' }, `confidence ${(confidence * 100).toFixed(0)}%`),
    viaClarify ? el('span', { class: 'msg__tag' }, 'resolved via clarification') : null
  ]);

  const feedback = el('div', { class: 'feedback' }, [
    el('button', { class: 'btn btn--ghost', type: 'button' }, 'Solved it'),
    el('button', { class: 'btn btn--ghost', type: 'button' }, "Didn't solve it")
  ]);
  const feedbackNote = el('p', { class: 'feedback__note', hidden: true }, '');

  const node = el('div', { class: 'msg msg--assistant' }, [
    meta,
    el('div', { class: 'msg__bubble' }, text),
    sourcesBlock(sources),
    feedback,
    feedbackNote
  ]);
  list.append(node);

  return { node, feedback, feedbackNote };
}

export function appendClarifyCard(list, { candidates, clarifyQuestion }) {
  const chipsRow = el('div', { class: 'chips' },
    candidates.map(c => {
      const chip = el('button', { class: 'chip', type: 'button' }, c.domain.displayName);
      chip.style.setProperty('--chip-color', `var(--domain-${c.domain.colorToken})`);
      chip.dataset.domainId = c.domain.id;
      return chip;
    })
  );

  const node = el('div', { class: 'msg msg--system card card--clarify' }, [
    el('p', { class: 'card__title' }, "I'm not sure which team this is for."),
    el('p', {}, clarifyQuestion),
    chipsRow
  ]);
  list.append(node);
  return { node, chipsRow };
}

export function appendHandoffCard(list, { candidates }) {
  const contactsList = el('ul', { class: 'contacts' }, candidates.map(c =>
    el('li', {}, [
      el('span', { class: 'contacts__team' }, `${c.domain.displayName} \u2014 ${c.domain.handoffContact.team}`),
      el('span', { class: 'contacts__detail' }, `${c.domain.handoffContact.email} \u00b7 ${c.domain.handoffContact.phone}`)
    ])
  ));

  const noneButton = el('button', { class: 'btn btn--ghost', type: 'button' }, 'None of these');

  const node = el('div', { class: 'msg msg--system card card--handoff' }, [
    el('p', { class: 'card__title' }, "I'm not sure which team handles this."),
    el('p', {}, 'Try one of these teams directly:'),
    contactsList,
    noneButton
  ]);
  list.append(node);
  return { node, noneButton };
}

export function renderTopicsStrip(container, topicIds, domainMap) {
  clearChildren(container);
  if (topicIds.length === 0) {
    container.append(el('span', { class: 'topics-strip__empty' }, 'No topics yet - ask a question to get started.'));
    return;
  }
  for (const id of topicIds) {
    const domain = domainMap[id];
    if (!domain) continue;
    const pill = el('span', { class: 'topic-pill' }, domain.displayName);
    pill.style.setProperty('--pill-color', `var(--domain-${domain.colorToken})`);
    container.append(pill);
  }
}

export function showLoadError(container, message) {
  clearChildren(container);
  container.append(el('div', { class: 'load-error', role: 'alert' }, [
    warningIcon(),
    el('span', {}, message)
  ]));
}
