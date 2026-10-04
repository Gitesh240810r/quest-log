/**
 * story.js — the Story tab: the prologue, main-quest chapters (each with
 * objectives and an inline "add objective"/"add chapter" form), and side
 * quests.
 */

function storyView() {
  const prologue = S.chapters[0];
  let html =
    '<h2 class="sec">Prologue</h2>' +
    '<div class="card"><p class="prolog">' + esc(prologue ? prologue.txt : '') + '</p></div>' +
    '<h2 class="sec">Main Quest</h2><div class="grid">';

  S.chapters.forEach((c, i) => {
    html += ui.confirm === c.id ? chapterDeleteConfirmCard(c) : chapterCard(c, i);
  });

  html += '</div>';
  html += ui.form === 'c'
    ? newChapterForm()
    : '<button class="ghost" style="margin-top:12px" data-a="form" data-k="c">+ New Chapter</button>';

  html += '<h2 class="sec">Side Quests</h2><div class="grid">';
  if (!S.side.length) html += '<div class="empty">No side quests yet.</div>';
  S.side.forEach((s) => { html += sideQuestCard(s); });
  html += '</div>';
  html += ui.form === 's'
    ? newSideQuestForm()
    : '<button class="ghost" style="margin-top:12px" data-a="form" data-k="s">+ Side Quest</button>';

  return html;
}

function chapterCard(c, index) {
  const total = c.objs.length;
  const done = c.objs.filter((o) => o.done).length;
  const complete = total && done === total;

  const objectives = c.objs.map((o) => (
    '<div class="obj">' +
      '<button class="gem sm ' + (o.done ? 'on' : '') + '" data-a="toggleo" data-c="' + c.id + '" data-i="' + o.id + '">' + (o.done ? '✓' : '') + '</button>' +
      '<span class="qt col" style="font-size:12px">' + esc(o.t) + '</span>' +
      '<span class="chip xp">+' + o.xp + '</span>' +
    '</div>'
  )).join('');

  const addObjective = ui.form === 'o' + c.id
    ? '<input id="f1" placeholder="Objective" data-need="go">' +
      '<div class="row" style="margin-top:8px">' +
        '<button class="btn" id="go" data-a="addo" data-i="' + c.id + '" disabled>Add</button>' +
        '<button class="ghost" data-a="cancel">Cancel</button>' +
      '</div>'
    : '<button class="ghost" style="margin-top:8px" data-a="form" data-k="o' + c.id + '">+ Objective</button>';

  return (
    '<div class="card" style="' + (complete ? 'border-color:var(--gold)' : '') + '">' +
      '<div class="row sp">' +
        '<b class="qt">Ch.' + (index + 1) + ' ' + esc(c.t) + '</b>' +
        (complete ? '<span class="badge">DONE</span>' : '<button class="x" data-a="askc" data-i="' + c.id + '">×</button>') +
      '</div>' +
      '<div class="bar"><i data-w="' + (total ? (done / total) * 100 : 0) + '" style="width:0%"></i></div>' +
      '<div class="mut" style="margin:6px 0;font-size:11px">' + done + '/' + total + ' objectives</div>' +
      objectives + addObjective +
    '</div>'
  );
}

function chapterDeleteConfirmCard(c) {
  return (
    '<div class="card"><b class="qt">Delete chapter?</b>' +
      '<div class="row" style="margin-top:8px">' +
        '<button class="danger" data-a="delc" data-i="' + c.id + '">Delete</button>' +
        '<button class="ghost" data-a="cancel">Cancel</button>' +
      '</div>' +
    '</div>'
  );
}

function newChapterForm() {
  return (
    '<div class="card" style="margin-top:12px;max-width:360px">' +
      '<input id="f1" placeholder="Chapter title" data-need="go">' +
      '<textarea id="f2" placeholder="What happens?" rows="3"></textarea>' +
      '<div class="row" style="margin-top:8px">' +
        '<button class="btn" id="go" data-a="addc" disabled>Add</button>' +
        '<button class="ghost" data-a="cancel">Cancel</button>' +
      '</div>' +
    '</div>'
  );
}

function sideQuestCard(s) {
  return (
    '<div class="card ' + (s.done ? 'done' : '') + '">' +
      '<div class="row">' +
        '<button class="gem ' + (s.done ? 'on' : '') + '" data-a="toggles" data-i="' + s.id + '">' + (s.done ? '✓' : '') + '</button>' +
        '<div class="col"><div class="qt">' + esc(s.t) + '</div><span class="chip xp">+' + s.xp + '</span></div>' +
        '<button class="x" data-a="dels" data-i="' + s.id + '">×</button>' +
      '</div>' +
    '</div>'
  );
}

function newSideQuestForm() {
  return (
    '<div class="card" style="margin-top:12px;max-width:360px">' +
      '<input id="f1" placeholder="Side quest" data-need="go">' +
      '<div class="row" style="margin-top:8px">' +
        '<button class="btn" id="go" data-a="adds" disabled>Add</button>' +
        '<button class="ghost" data-a="cancel">Cancel</button>' +
      '</div>' +
    '</div>'
  );
}
