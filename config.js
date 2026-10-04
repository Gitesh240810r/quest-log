/**
 * config.js — static configuration.
 * No logic lives here, just the constants every other file reads from.
 */

const STORAGE_KEY = 'questlog.dash1';

/** Level titles, indexed by level - 1 (capped at the last entry = level 6+). */
const TITLES = ['Novice', 'Initiate', 'Adept', 'Veteran', 'Champion', 'Legend'];

/** Attribute codes used on quests and the Hero page, mapped to their full name. */
const ATTRS = { STR: 'Strength', WIL: 'Willpower', INT: 'Intellect', VIT: 'Vitality' };

/** Order the single sidebar theme button cycles through on each click. */
const THEME_CYCLE = ['dark', 'light', 'system'];

/** Sidebar nav: label + icon per tab, in display order. Each tab's `view`
 *  function is attached in app.js once quests.js/story.js/lab.js/hero.js
 *  have all defined theirs. */
const PAGE_META = {
  quests: { label: 'Quests', icon: '⚔' },
  story: { label: 'Story', icon: '📜' },
  lab: { label: 'Lab', icon: '🧪' },
  hero: { label: 'Hero', icon: '🛡' }
};
