/**
 * game.js — XP/level math, quest-completion bookkeeping, theme cycling,
 * and the two small feedback widgets (toast, full-screen overlay).
 */

const lvl = () => Math.floor(S.xp / 100) + 1;
const title = () => TITLES[Math.min(lvl() - 1, 5)];

/** Consecutive days (ending today, or yesterday if nothing logged yet today)
 *  with at least some XP earned. */
function streak() {
  let n = 0;
  let i = S.days[today()] > 0 ? 0 : 1;
  while (S.days[ago(i)] > 0) { n++; i++; }
  return n;
}

/** A daily quest is "done" if it was last completed today; a one-time quest
 *  is "done" once its own `done` flag is set. */
const isDone = (q) => (q.kind === 'daily' ? q.last === today() : !!q.done);

function toast(message) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = message;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 1800);
}

function overlay(kicker, big, sub) {
  const d = document.createElement('div');
  d.className = 'ov';
  d.innerHTML =
    '<div><div class="kicker">' + esc(kicker) + '</div>' +
    '<div class="big">' + esc(big) + '</div>' +
    '<div class="sub">' + esc(sub) + '</div></div>';
  d.onclick = () => d.remove();
  document.body.appendChild(d);
  setTimeout(() => d.remove(), 2600);
}

/**
 * Grants XP for a deed, logs it (so it can be reversed later), and shows
 * feedback. When `el` is a card-dwelling element, the re-render is delayed
 * so the pop/float animations started by the caller get a chance to play.
 */
function award(id, text, xp, attr, el) {
  const levelBefore = lvl();
  S.log.push({ id, t: text, xp, d: today(), a: attr });
  S.xp += xp;
  S.days[today()] = (S.days[today()] || 0) + xp;
  if (attr) S.attrs[attr]++;
  save();

  const card = el && el.closest('.card');
  if (card) card.insertAdjacentHTML('beforeend', '<span class="float">+' + xp + ' XP</span>');
  else toast('+' + xp + ' XP · ' + text);

  const leveledUp = lvl() > levelBefore;
  setTimeout(() => {
    render();
    if (leveledUp) {
      const ring = $('.ring');
      if (ring) ring.classList.add('burst');
      setTimeout(() => overlay('LEVEL UP', 'Lv ' + lvl(), title()), 200);
    }
  }, card ? 550 : 0);
}

/** Reverses the most recent log entry for an id. Used when un-checking a
 *  quest/objective, and as the building block for wipeAll() below. */
function revoke(id) {
  for (let i = S.log.length - 1; i >= 0; i--) {
    if (S.log[i].id === id) {
      const entry = S.log.splice(i, 1)[0];
      S.xp = Math.max(0, S.xp - entry.xp);
      S.days[entry.d] = Math.max(0, (S.days[entry.d] || 0) - entry.xp);
      if (entry.a) S.attrs[entry.a] = Math.max(0, S.attrs[entry.a] - 1);
      return;
    }
  }
}

/** Removes every logged XP grant for an id — used when deleting something
 *  and choosing to wipe its earned XP rather than keep it. */
function wipeAll(id) {
  for (let i = S.log.length - 1; i >= 0; i--) {
    if (S.log[i].id === id) revoke(id);
  }
}

function setTheme(t) {
  S.theme = t;
  document.documentElement.dataset.theme = t === 'system' ? '' : t;
  save();
  render();
}

function cycleTheme() {
  setTheme(THEME_CYCLE[(THEME_CYCLE.indexOf(S.theme) + 1) % THEME_CYCLE.length]);
}
