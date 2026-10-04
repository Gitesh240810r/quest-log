/**
 * lab.js — the Lab tab: self-experiments (a hypothesis plus a check-in and
 * review cycle over N days) and the rolling "Field Notes" feed built from them.
 */

function labView() {
  const active = S.exps.filter((e) => e.status !== 'done');
  let html = '<h2 class="sec">Active Experiments</h2><div class="grid">';
  if (!active.length) html += '<div class="empty">Nothing running. Test a habit on yourself.</div>';
  active.forEach((e) => { html += experimentCard(e); });
  html += '</div>';
  html += ui.form === 'e'
    ? newExperimentForm()
    : '<button class="ghost" style="margin-top:12px" data-a="form" data-k="e">+ New Experiment</button>';
  html += fieldNotes();
  return html;
}

function experimentCard(e) {
  const day = Math.max(1, Math.round((new Date(today() + 'T12:00') - new Date(e.start + 'T12:00')) / 864e5) + 1);
  const ready = day > e.days || e.entries.length >= e.days;
  const checkedInToday = e.entries.some((x) => x.d === today());

  const actionButton = ready
    ? '<button class="btn" data-a="opene" data-i="' + e.id + '">Review · +50</button>'
    : checkedInToday
      ? '<span class="chip xp">Checked in</span>'
      : '<button class="btn" data-a="opene" data-i="' + e.id + '">Check in · +15</button>';

  let openPanel = '';
  if (ui.open === e.id) {
    openPanel = ready
      ? '<textarea id="f2" rows="2" placeholder="What did you learn?" style="margin-top:8px"></textarea>' +
        '<div class="row wrap" style="margin-top:8px">' +
          ['Keep', 'Tweak', 'Drop'].map((v, i) => '<button class="' + (i ? 'ghost' : 'btn') + '" data-a="reviewe" data-i="' + e.id + '" data-v="' + v + '">' + v + '</button>').join('') +
        '</div>'
      : '<textarea id="f2" rows="2" placeholder="What happened today?" style="margin-top:8px"></textarea>' +
        '<div class="row" style="margin-top:8px">' +
          '<button class="btn" data-a="checkine" data-i="' + e.id + '">Save</button>' +
          '<button class="ghost" data-a="cancel">Cancel</button>' +
        '</div>';
  }

  return (
    '<div class="card">' +
      '<div class="row sp"><b class="qt">' + esc(e.name) + '</b><button class="x" data-a="dele" data-i="' + e.id + '">×</button></div>' +
      '<div class="mut" style="font-size:11.5px;margin-top:4px">' + esc(e.hyp || '') + '</div>' +
      '<div class="bar"><i data-w="' + Math.min(100, (e.entries.length / e.days) * 100) + '" style="width:0%"></i></div>' +
      '<div class="mut" style="font-size:11px;margin:6px 0">Day ' + Math.min(day, e.days) + '/' + e.days + '</div>' +
      actionButton + openPanel +
    '</div>'
  );
}

function newExperimentForm() {
  const dayPicks = [7, 14, 21, 30]
    .map((d) => '<button data-a="pk" data-k="days" data-v="' + d + '" class="' + ((ui.nx && ui.nx.days == d) ? 'on' : d == 7 ? 'on' : '') + '">' + d + 'd</button>')
    .join('');
  return (
    '<div class="card" style="margin-top:12px;max-width:360px">' +
      '<input id="f1" placeholder="What are you testing?" data-need="go">' +
      '<textarea id="f2" rows="2" placeholder="Hypothesis"></textarea>' +
      '<div class="pick">' + dayPicks + '</div>' +
      '<div class="row" style="margin-top:8px">' +
        '<button class="btn" id="go" data-a="adde" disabled>Start</button>' +
        '<button class="ghost" data-a="cancel">Cancel</button>' +
      '</div>' +
    '</div>'
  );
}

function fieldNotes() {
  const notes = [];
  S.exps.forEach((e) => {
    e.entries.forEach((x) => notes.push({ d: x.d, t: e.name, n: x.note }));
    if (e.reflection) notes.push({ d: e.end, t: e.name + ' · ' + e.verdict, n: e.reflection });
  });
  notes.sort((a, b) => b.d.localeCompare(a.d));

  const body = notes.length
    ? '<div class="card">' + notes.slice(0, 10).map((n) => (
        '<div class="obj" style="display:block">' +
          '<div class="row sp"><b style="font-size:12px">' + esc(n.t) + '</b><span class="mut" style="font-size:10.5px">' + n.d + '</span></div>' +
          (n.n ? '<div style="font-size:12px;margin-top:4px">' + esc(n.n) + '</div>' : '') +
        '</div>'
      )).join('') + '</div>'
    : '<div class="empty">Notes from your experiments appear here.</div>';

  return '<h2 class="sec">Field Notes</h2>' + body;
}
