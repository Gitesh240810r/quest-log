# Quest Log

An RPG-styled habit/quest tracker: daily and one-time quests, a main story
told in chapters with objectives, side quests, self-experiments (a "Lab" for
testing habits on yourself), and a Hero page with attributes, unlockable
skills, and a 12-week activity heatmap. Everything is saved to your
browser's `localStorage` — no account, no server, no build step.

## Files

Everything lives flat in this one folder on purpose — no `src/`, no `js/`,
no build tooling. Open `index.html` and read down; each file does one job:

| File             | What it does                                              |
|-------------------|------------------------------------------------------------|
| `index.html`      | Page shell; loads `style.css` and the scripts below in order |
| `style.css`       | All styling (dark/light theme, layout, animations)        |
| `config.js`       | Constants: storage key, level titles, attributes, nav tabs |
| `util.js`         | Small helpers: `$`, `uid`, date formatting, HTML-escaping  |
| `state.js`        | `S` (saved state) and `ui` (transient view state) + `save()` |
| `game.js`         | XP/level math, streaks, awarding/reversing XP, theme toggle |
| `onboarding.js`   | First-run "create your hero" screen                        |
| `banner.js`       | The hero HUD (level ring, XP bar, streak, 7-day trend) + its animations |
| `quests.js`       | Quests tab                                                 |
| `story.js`        | Story tab (chapters/objectives, side quests)                |
| `lab.js`          | Lab tab (self-experiments, field notes)                     |
| `hero.js`         | Hero tab (attributes, skills, heatmap, recent deeds)         |
| `app.js`          | Wires it all together: `render()`, the action dispatch table, boot |

Script load order matters — each file uses plain top-level `function`s and
`const`s from the ones above it (no bundler, no modules). If you rename or
reorder files, update the `<script src>` list in `index.html` to match.

## Running it locally

Just open `index.html` in a browser — it's fully static. If your browser
blocks `file://` scripts from loading each other, serve the folder instead:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Hosting it on GitHub Pages

1. Create a new repo on GitHub (public, so Pages is free) and push this
   folder's contents to its root — no subfolder:
   ```bash
   cd quest-log
   git init
   git add .
   git commit -m "Quest Log"
   git branch -M main
   git remote add origin https://github.com/<you>/<repo>.git
   git push -u origin main
   ```
2. On GitHub: **Settings → Pages → Build and deployment → Source** → "Deploy
   from a branch" → branch `main`, folder `/ (root)` → **Save**.
3. GitHub gives you a URL like `https://<you>.github.io/<repo>/` within a
   minute or two — that's your live app.

Your save data lives in that site's `localStorage`, so it's per-browser —
visiting from a different device/browser starts a fresh hero. Use your own
backup method (or ask for an export/import feature) if you want to carry
progress across devices.
