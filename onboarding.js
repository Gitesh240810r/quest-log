/**
 * onboarding.js — the first-run "create your hero" flow, shown instead of
 * the sidebar/tabs whenever S.hero is still null.
 */

function onboardView() {
  return (
    '<div class="ob"><h1>Begin your Quest Log</h1>' +
    '<p class="mut">Name your hero, write the opening of your story, and set the first goal you\'re chasing.</p>' +
    '<div class="card" style="margin-top:14px">' +
      '<input id="hn" placeholder="Hero name" data-need="go">' +
      '<textarea id="hs" rows="4" placeholder="Your origin — why start now?" data-need="go"></textarea>' +
      '<input id="hg" placeholder="Main Quest — your big goal" data-need="go">' +
      '<input id="ho" placeholder="First objective toward it" data-need="go">' +
      '<div class="row" style="margin-top:12px">' +
        '<button class="btn" id="go" data-a="startHero" disabled>Begin the Journey</button>' +
      '</div>' +
    '</div></div>'
  );
}

function startHero() {
  const name = $('#hn').value.trim();
  const story = $('#hs').value.trim();
  const goal = $('#hg').value.trim();
  const objective = $('#ho').value.trim();
  if (!name || !story || !goal || !objective) return;

  S.hero = { name };
  S.chapters = [{
    id: uid(),
    t: goal,
    txt: story,
    objs: [{ id: uid(), t: objective, xp: 20, done: false }]
  }];
  save();
  render();
  toast('Your story begins, ' + name);
}
