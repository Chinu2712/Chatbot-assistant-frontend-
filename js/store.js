// store.js
// In-memory session log, mirrored to localStorage, behind a small interface
// so a later version could point logEvent()/getEvents() at a real
// telemetry endpoint instead. Everything metrics.html shows is computed
// from this log.

import { STORAGE_KEY } from './config.js';

let events = loadFromStorage();

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

// type: 'question' | 'clarify' | 'handoff' | 'feedback'
export function logEvent(event) {
  events.push({ ...event, timestamp: Date.now() });
  persist();
}

export function getEvents() {
  return events.slice();
}

export function clearEvents() {
  events = [];
  persist();
}

export function computeMetrics() {
  const questions = events.filter(e => e.type === 'question');
  const clarifies = events.filter(e => e.type === 'clarify');
  const handoffs = events.filter(e => e.type === 'handoff');
  const feedback = events.filter(e => e.type === 'feedback');
  const solved = feedback.filter(e => e.resolved);

  const totalQuestions = questions.length;
  const avgConfidence = totalQuestions
    ? questions.reduce((sum, e) => sum + (e.confidence || 0), 0) / totalQuestions
    : 0;

  return {
    totalQuestions,
    resolutionRate: feedback.length ? solved.length / feedback.length : 0,
    clarificationRate: totalQuestions ? clarifies.length / totalQuestions : 0,
    handoffRate: totalQuestions ? handoffs.length / totalQuestions : 0,
    avgConfidence,
    feedbackCount: feedback.length,
    solvedCount: solved.length
  };
}
