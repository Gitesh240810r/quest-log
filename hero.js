/**
 * hero.js — the Hero tab: attribute bars, unlockable skills, the 12-week
 * activity heatmap, and a feed of recent deeds.
 */

function heroView() {
  let html = attributesCard();
  html += skillsCard();
  html += '<h2 class="sec">Activity · 12 weeks</h2>' + heatmapCard();
  html += '<h2 class="sec">Recent Deeds</h2>' + recentDeeds();
  return html;
}

function attributesCard() {
  const A = S.attrs;
  const max = Math.max(10, ...Object.values(A));
  const rows = Object.keys(ATTRS).map((k) => (
    '<div class="attr" style="margin-bottom:11px">' +
      '<div class="row sp"><b style="font-size:12px">' + k + '</b><b style="color:var(--gold)">' + A[k] + '</b></div>' +
      '<div class="bar"><i data-w="' + (A[k] / max) * 100 + '" style="width:0%"></i></div>' +
    '</div>'
  )).join('');
  return '<h2 class="sec">Attributes</h2><div class="card">' + rows + '</div>';
}

function skillsCard() {
  const skills = [
    ['Iron Will', '7-day streak', streak() >= 7],
    ['Uncommon', 'Reach level 5', lvl() >= 5],
    ['Legend', 'Reach level 6', lvl() >= 6]
  ];
  const rows = skills.map(([name, requirement, unlocked]) => (
    '<div class="skillrow ' + (unlocked ? '' : 'locked') + '">' +
      '<div class="col"><div class="qt" style="font-size:12.5px">' + name + '</div><div class="mut" style="font-size:11px">' + requirement + '</div></div>' +
      (unlocked ? '<span class="badge">UNLOCKED</span>' : '<span>🔒</span>') +
    '</div>'
  )).join('');
  return '<h2 class="sec">Skills</h2><div class="card">' + rows + '</div>';
}

function heatmapCard() {
  const cells = Array.from({ length: 84 }, (_, i) => {
    const d = ago(83 - i);
    const xp = S.days[d] || 0;
    const level = xp ? 'l' + (xp < 15 ? 1 : xp < 30 ? 2 : xp < 60 ? 3 : 4) : '';
    return '<i class="' + level + '" title="' + d + '"></i>';
  }).join('');
  return '<div class="card"><div class="heat">' + cells + '</div></div>';
}

function recentDeeds() {
  if (!S.log.length) return '<div class="empty">No deeds yet.</div>';
  const rows = S.log.slice(-8).reverse().map((e) => (
    '<div class="row sp" style="padding:6px 0;border-bottom:1px solid var(--line)">' +
      '<span style="font-size:12px">' + esc(e.t) + '</span><span class="chip xp">+' + e.xp + '</span>' +
    '</div>'
  )).join('');
  return '<div class="card">' + rows + '</div>';
}
