/**
 * app.js — wires everything together. Loaded last, so every helper, the
 * page view functions, and the state are all already defined.
 *
 *  - PAGES combines config.js's PAGE_META (label/icon) with each tab's
 *    view() function from quests.js/story.js/lab.js/hero.js.
 *  - render() rebuilds the whole #root (sidebar + banner + current tab)
 *    from scratch on every state change — simple over clever, since this
 *    app never gets big enough for that to be slow.
 *  - A single delegated click listener dispatches every button press:
 *    a button carries data-a="actionName" and the handler lives in `A`.
 */

const PAGES = {
  quests: Object.assign({ view: questsView }, PAGE_META.quests),
  story: Object.assign({ view: storyView }, PAGE_META.story),
  lab: Object.assign({ view: labView }, PAGE_META.lab),
  hero: Object.assign({ view: heroView }, PAGE_META.hero)
};

function render() {
  document.documentElement.dataset.theme = S.theme === 'system' ? '' : S.theme;
  const root = $('#root');

  if (!S.hero) { root.innerHTML = onboardView(); return; }

  // Small red/gold badge per nav item showing what's still outstanding.
  const counts = {
    quests: S.quests.filter((q) => !isDone(q)).length,
    story: S.chapters.reduce((n, c) => n + c.objs.filter((o) => !o.done).length, 0) + S.side.filter((s) => !s.done).length,
    lab: S.exps.filter((e) => e.status !== 'done').length,
    hero: 0
  };

  const nav = Object.keys(PAGES).map((k) => {
    const count = counts[k];
    return (
      '<button class="navitem ' + (ui.tab === k ? 'on' : '') + '" data-a="tab" data-v="' + k + '">' +
        '<span class="ic">' + PAGES[k].icon + '</span><span class="lbl">' + PAGES[k].label + '</span>' +
        (count ? '<span class="cnt">' + count + '</span>' : '') +
      '</button>'
    );
  }).join('');

  const themeIcon = { light: '☀', dark: '🌙', system: '🖥' }[S.theme];

  root.innerHTML =
    '<div class="shell">' +
      '<div class="sidebar">' +
        '<div class="brand"><span class="dot"></span>QUEST LOG</div>' +
        nav + '<div class="navsp"></div>' +
        '<div class="profilecard">' +
          '<div class="av" title="' + esc(S.hero.name) + ' · Lv ' + lvl() + ' ' + title() + '">' + esc(S.hero.name[0].toUpperCase()) + '</div>' +
          '<div class="sp2"></div>' +
          '<button class="themebtn" data-a="theme" title="Theme: ' + S.theme + '">' + themeIcon + '</button>' +
        '</div>' +
      '</div>' +
      '<div class="main">' + banner() + PAGES[ui.tab].view() + '</div>' +
    '</div>';

  afterBannerRender(root);
}

const A = {
  tab: (e) => { ui.tab = e.dataset.v; ui.form = ui.confirm = ui.open = null; render(); },
  theme: () => cycleTheme(),
  form: (e) => { ui.form = e.dataset.k; render(); const f = $('#f1'); if (f) f.focus(); },
  cancel: () => { ui.form = ui.confirm = ui.open = null; render(); },
  pk: (e) => {
    ui.nq[e.dataset.k] = isNaN(+e.dataset.v) ? e.dataset.v : +e.dataset.v;
    if (e.dataset.k === 'days') { ui.nx = ui.nx || {}; ui.nx.days = +e.dataset.v; }
    const typed = ($('#f1') || {}).value;
    render();
    const f = $('#f1');
    if (f) { f.value = typed; f.focus(); const go = $('#go'); if (go) go.disabled = !typed.trim(); }
  },

  startHero,

  // --- Quests ---
  addq: () => {
    const t = $('#f1').value.trim(); if (!t) return;
    S.quests.push({ id: uid(), t, kind: ui.nq.kind, xp: ui.nq.xp, a: ui.nq.a, streak: 0 });
    ui.form = null; save(); render();
  },
  toggleq: (e) => {
    const q = find(S.quests, e.dataset.i);
    if (isDone(q)) {
      revoke(q.id); q.last = q.prevLast; q.streak = q.prevStreak || 0; q.done = false;
      save(); render(); return;
    }
    q.prevLast = q.last; q.prevStreak = q.streak;
    q.streak = q.last === ago(1) ? q.streak + 1 : 1;
    q.last = today(); q.done = q.kind === 'once';
    const streakBonus = q.kind === 'daily' ? Math.min(q.streak - 1, 5) * 2 : 0;
    e.classList.add('on');
    award(q.id, q.t, q.xp + streakBonus, q.a, e);
  },
  askq: (e) => { ui.confirm = e.dataset.i; render(); },
  delq: (e) => { S.quests = S.quests.filter((q) => q.id !== e.dataset.i); ui.confirm = null; save(); render(); },
  wipeq: (e) => { wipeAll(e.dataset.i); S.quests = S.quests.filter((q) => q.id !== e.dataset.i); ui.confirm = null; save(); render(); },

  // --- Story: chapters & objectives ---
  addc: () => {
    const t = $('#f1').value.trim(); if (!t) return;
    S.chapters.push({ id: uid(), t, txt: $('#f2').value.trim(), objs: [] });
    ui.form = null; save(); render();
  },
  askc: (e) => { ui.confirm = e.dataset.i; render(); },
  delc: (e) => { S.chapters = S.chapters.filter((c) => c.id !== e.dataset.i); ui.confirm = null; save(); render(); },
  addo: (e) => {
    const t = $('#f1').value.trim(); if (!t) return;
    find(S.chapters, e.dataset.i).objs.push({ id: uid(), t, xp: 20, done: false });
    ui.form = null; save(); render();
  },
  toggleo: (e) => {
    const c = find(S.chapters, e.dataset.c), o = find(c.objs, e.dataset.i);
    if (o.done) { o.done = false; revoke(o.id); save(); render(); return; }
    o.done = true; e.classList.add('on');
    const chapterComplete = c.objs.every((x) => x.done);
    award(o.id, o.t, o.xp, null, e);
    if (chapterComplete) setTimeout(() => overlay('CHAPTER COMPLETE', '📜', c.t), 1100);
  },

  // --- Story: side quests ---
  adds: () => {
    const t = $('#f1').value.trim(); if (!t) return;
    S.side.push({ id: uid(), t, xp: 30, done: false });
    ui.form = null; save(); render();
  },
  toggles: (e) => {
    const s = find(S.side, e.dataset.i);
    if (s.done) { s.done = false; revoke(s.id); save(); render(); return; }
    s.done = true; e.classList.add('on'); award(s.id, s.t, s.xp, null, e);
  },
  dels: (e) => { S.side = S.side.filter((s) => s.id !== e.dataset.i); save(); render(); },

  // --- Lab: experiments ---
  adde: () => {
    const n = $('#f1').value.trim(); if (!n) return;
    S.exps.unshift({ id: uid(), name: n, hyp: $('#f2').value.trim(), days: (ui.nx && ui.nx.days) || 7, start: today(), entries: [], status: 'active' });
    ui.form = null; save(); render();
  },
  dele: (e) => { wipeAll(e.dataset.i); S.exps = S.exps.filter((x) => x.id !== e.dataset.i); save(); render(); },
  opene: (e) => { ui.open = ui.open === e.dataset.i ? null : e.dataset.i; render(); },
  checkine: (e) => {
    const ex = find(S.exps, e.dataset.i);
    ex.entries.push({ d: today(), note: $('#f2').value.trim() });
    ui.open = null; award(ex.id, 'Check-in: ' + ex.name, 15, null, e);
  },
  reviewe: (e) => {
    const ex = find(S.exps, e.dataset.i);
    ex.status = 'done'; ex.verdict = e.dataset.v; ex.reflection = $('#f2').value.trim(); ex.end = today();
    ui.open = null; award(ex.id, 'Closed: ' + ex.name, 50, null, e);
  }
};

document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-a]');
  if (btn && A[btn.dataset.a]) A[btn.dataset.a](btn);
});

document.addEventListener('input', (e) => {
  if (!e.target.dataset.need) return;
  const go = $('#go');
  if (!go) return;
  go.disabled = !(S.hero
    ? $('#f1').value.trim()
    : $('#hn').value.trim() && $('#hs').value.trim() && $('#hg').value.trim() && $('#ho').value.trim());
});

// --- Boot ---
document.documentElement.dataset.theme = S.theme === 'system' ? '' : S.theme;
render();
