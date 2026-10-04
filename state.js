/**
 * state.js — the save-game.
 * S is the persisted state (written to localStorage after every change).
 * ui is transient view state (which tab/form is open) and is never saved.
 */

let S = {
  hero: null,                 // { name } once onboarding finishes, else null
  xp: 0,
  theme: 'dark',               // 'dark' | 'light' | 'system'
  quests: [],                  // daily/one-time quests
  chapters: [],                // main-story chapters, each with its own objectives
  side: [],                    // side quests
  exps: [],                    // Lab self-experiments
  skills: [],                  // reserved for future custom skills
  log: [],                     // every XP grant: { id, t, xp, d, a } — lets deletes be reversible
  days: {},                    // 'YYYY-MM-DD' -> XP earned that day (streaks + heatmap + trend)
  attrs: { STR: 0, WIL: 0, INT: 0, VIT: 0 }
};

try {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
  if (saved) {
    S = Object.assign(S, saved, {
      attrs: Object.assign({ STR: 0, WIL: 0, INT: 0, VIT: 0 }, saved.attrs)
    });
  }
} catch (e) {
  // Corrupt or missing save — fall back to the defaults above.
}

let ui = {
  tab: 'quests',
  form: null,      // which inline "add ___" form is open, if any
  confirm: null,   // id of the item currently showing a delete-confirm card
  open: null,      // id of the experiment currently expanded in the Lab tab
  nq: { kind: 'daily', xp: 25, a: 'STR' } // in-progress "new quest" form state
};

function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(S)); } catch (e) { /* storage full/unavailable */ }
}
