/**
 * util.js — small, dependency-free helpers used by every other file.
 * Nothing here touches app state; it's pure DOM/date/string plumbing.
 */

/** Shorthand for document.querySelector. */
const $ = (selector) => document.querySelector(selector);

/** Short random id, good enough for quests/chapters/experiments in one browser. */
const uid = () => Math.random().toString(36).slice(2, 8);

/** Formats a Date as 'YYYY-MM-DD' (local time, used as the key into S.days). */
function dateStr(d) {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

const today = () => dateStr(new Date());

/** 'YYYY-MM-DD' for N days ago (ago(0) === today()). */
function ago(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return dateStr(d);
}

/** Escapes text that gets interpolated into innerHTML strings. */
function esc(value) {
  return String(value == null ? '' : value).replace(/[&<>"]/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'
  }[c]));
}

/** Finds an item by id in an array of {id, ...} objects. */
const find = (list, id) => list.find((item) => item.id === id);
