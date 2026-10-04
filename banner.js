/**
 * banner.js — the hero HUD shown above every tab: level ring, segmented XP
 * bar, streak/deeds pills, and the 7-day XP trend strip.
 *
 * The fill/grow animations only work because the markup starts in a "zero"
 * state and afterBannerRender() nudges it to the real value a frame later —
 * see the comment on that function.
 */

let _lastInto = null;
let _bannerCtx = { into: 0, circumference: 0 };

function banner() {
  const level = lvl();
  const into = S.xp % 100;
  const circumference = 2 * Math.PI * 27;
  const offset = circumference - (circumference * into) / 100;
  const litSegments = Math.floor(into / 10);

  _bannerCtx = { into, circumference };

  const segments = Array.from({ length: 10 }, (_, i) => {
    const on = i < litSegments || (i === litSegments && into % 10 > 0);
    return '<i class="' + (on ? 'on' : '') + '" data-i="' + i + '" style="--i:' + i + '"></i>';
  }).join('');

  const history = Array.from({ length: 7 }, (_, i) => {
    const d = ago(6 - i);
    return { d, v: S.days[d] || 0 };
  });
  const maxHistory = Math.max(20, ...history.map((h) => h.v));
  const trend = history.map((h, i) => {
    const heightPct = Math.max(6, Math.round((h.v / maxHistory) * 100));
    return '<i class="tb' + (i === 6 ? ' today' : '') + '" style="--h:' + heightPct + '%" title="' + h.d + ' · ' + h.v + ' XP"></i>';
  }).join('');

  return (
    '<div class="banner">' +
      '<div class="ring' + (into >= 90 ? ' near' : '') + '">' +
        '<svg viewBox="0 0 64 64">' +
          '<circle class="trk" cx="32" cy="32" r="27" fill="none" stroke="var(--line)" stroke-width="4"/>' +
          '<circle class="fill" cx="32" cy="32" r="27" fill="none" stroke="var(--gold)" stroke-width="4" ' +
            'stroke-linecap="round" stroke-dasharray="' + circumference + '" stroke-dashoffset="' + offset + '"/>' +
        '</svg>' +
        '<div class="lv"><small>LV</small><b>' + level + '</b></div>' +
      '</div>' +
      '<div class="bstat">' +
        '<h1>' + esc(S.hero.name) + '</h1>' +
        '<div class="mut">' + title() + ' · ' + into + '/100 XP</div>' +
        '<div class="xpbar">' + segments + '</div>' +
      '</div>' +
      '<div class="pillrow">' +
        '<div class="pill"><b>' + streak() + '🔥</b><span>STREAK</span></div>' +
        '<div class="pill"><b>' + S.log.length + '</b><span>DEEDS</span></div>' +
      '</div>' +
      '<div class="trendwrap"><div class="cap">XP · Last 7 Days</div><div class="trend">' + trend + '</div></div>' +
    '</div>'
  );
}

/**
 * Called right after render() injects the banner markup. It:
 *  - tweens the level ring from its previous fill to the current one
 *    (or from empty, on first paint) via stroke-dashoffset
 *  - "pops" the newest lit XP segment when crossing into it
 *  - grows in every `.bar[data-w]` fill (chapters/experiments/attributes)
 *  - staggers in the 7-day trend bars
 * All of it relies on requestAnimationFrame so the browser paints the
 * "before" state first and the transition actually has something to animate.
 */
function afterBannerRender(root) {
  const { into, circumference } = _bannerCtx;
  const offset = circumference - (circumference * into) / 100;

  const ringFill = root.querySelector('.ring .fill');
  if (ringFill) {
    if (_lastInto === null) {
      ringFill.style.strokeDashoffset = circumference;
      requestAnimationFrame(() => requestAnimationFrame(() => {
        ringFill.style.strokeDashoffset = offset;
      }));
    } else if (_lastInto !== into) {
      ringFill.style.strokeDashoffset = circumference - (circumference * _lastInto) / 100 + '';
      void ringFill.getBoundingClientRect(); // force a reflow before animating again
      requestAnimationFrame(() => { ringFill.style.strokeDashoffset = offset; });
    } else {
      ringFill.style.strokeDashoffset = offset;
    }
  }

  const headOf = (v) => (v % 10 > 0 ? Math.floor(v / 10) : Math.floor(v / 10) - 1);
  const currentHead = headOf(into);
  const previousHead = _lastInto === null ? null : headOf(_lastInto);
  if (previousHead !== null && currentHead > previousHead && currentHead >= 0) {
    const seg = root.querySelector('.xpbar i[data-i="' + currentHead + '"]');
    if (seg) requestAnimationFrame(() => seg.classList.add('pop'));
  }
  _lastInto = into;

  root.querySelectorAll('.bar>i[data-w]').forEach((i) => {
    requestAnimationFrame(() => requestAnimationFrame(() => { i.style.width = i.dataset.w + '%'; }));
  });

  const trendBars = root.querySelectorAll('.trend .tb');
  if (trendBars.length) {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      trendBars.forEach((b, i) => setTimeout(() => b.classList.add('on'), i * 70));
    }));
  }
}
