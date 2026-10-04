/**
 * quests.js — the Quests tab: today's daily/one-time quests, the "new
 * quest" form, and inline delete confirmation (with a keep-XP/wipe-XP
 * choice when a quest has already earned something).
 */

function questsView() {
  const openQuests = S.quests.filter((q) => !isDone(q));
  const doneQuests = S.quests.filter(isDone);

  let html = '<h2 class="sec">Daily Quests · ' + doneQuests.length + '/' + S.quests.length + '</h2><div class="grid">';
  if (!S.quests.length) html += '<div class="empty">No quests yet — add one below.</div>';

  openQuests.concat(doneQuests).forEach((q) => {
    html += ui.confirm === q.id ? questDeleteConfirmCard(q) : questCard(q);
  });

  html += '</div>';
  html += ui.form === 'q'
    ? newQuestForm()
    : '<button class="ghost" style="margin-top:12px" data-a="form" data-k="q">+ New Quest</button>';
  return html;
}

function questCard(q) {
  const done = isDone(q);
  const streakChip = q.streak > 1 && q.kind === 'daily' ? '<span class="chip hot">🔥' + q.streak + '</span>' : '';
  return (
    '<div class="card ' + (done ? 'done' : '') + '">' +
      '<div class="row">' +
        '<button class="gem ' + (done ? 'on' : '') + '" data-a="toggleq" data-i="' + q.id + '">' + (done ? '✓' : '') + '</button>' +
        '<div class="col">' +
          '<div class="qt">' + esc(q.t) + '</div>' +
          '<div class="meta">' +
            '<span class="chip xp">+' + q.xp + '</span>' +
            '<span class="chip">' + q.a + '</span>' +
            '<span class="chip">' + (q.kind === 'daily' ? 'Daily' : 'Once') + '</span>' +
            streakChip +
          '</div>' +
        '</div>' +
        '<button class="x" data-a="askq" data-i="' + q.id + '">×</button>' +
      '</div>' +
    '</div>'
  );
}

function questDeleteConfirmCard(q) {
  const hasHistory = S.log.some((e) => e.id === q.id);
  const body = hasHistory
    ? '<p class="mut" style="font-size:11.5px">Keep its XP, or remove it too?</p>' +
      '<div class="row wrap" style="margin-top:8px">' +
        '<button class="ghost" data-a="delq" data-i="' + q.id + '">Keep XP</button>' +
        '<button class="danger" data-a="wipeq" data-i="' + q.id + '">Remove XP</button>' +
        '<button class="ghost" data-a="cancel">Cancel</button>' +
      '</div>'
    : '<div class="row" style="margin-top:8px">' +
        '<button class="danger" data-a="delq" data-i="' + q.id + '">Delete</button>' +
        '<button class="ghost" data-a="cancel">Cancel</button>' +
      '</div>';
  return '<div class="card"><b class="qt">Delete "' + esc(q.t) + '"?</b>' + body + '</div>';
}

function newQuestForm() {
  const kindPicks = [['daily', 'Daily'], ['once', 'Once']]
    .map(([v, label]) => '<button data-a="pk" data-k="kind" data-v="' + v + '" class="' + (ui.nq.kind === v ? 'on' : '') + '">' + label + '</button>')
    .join('');
  const xpPicks = [10, 25, 50]
    .map((x) => '<button data-a="pk" data-k="xp" data-v="' + x + '" class="' + (ui.nq.xp == x ? 'on' : '') + '">' + x + ' XP</button>')
    .join('');
  const attrPicks = Object.keys(ATTRS)
    .map((a) => '<button data-a="pk" data-k="a" data-v="' + a + '" class="' + (ui.nq.a === a ? 'on' : '') + '">' + a + '</button>')
    .join('');

  return (
    '<div class="card" style="margin-top:12px;max-width:360px">' +
      '<input id="f1" placeholder="New quest" data-need="go">' +
      '<div class="pick">' + kindPicks + '</div>' +
      '<div class="pick">' + xpPicks + '</div>' +
      '<div class="pick">' + attrPicks + '</div>' +
      '<div class="row" style="margin-top:10px">' +
        '<button class="btn" id="go" data-a="addq" disabled>Add</button>' +
        '<button class="ghost" data-a="cancel">Cancel</button>' +
      '</div>' +
    '</div>'
  );
}
