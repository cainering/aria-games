# Aria's Web

A small static site of learning games for Aria, adapted from Evan Goldberg's open-source
joyce-games project (fork of the structure; Goldberg family content removed).

* `settings.js` is the per-child file (name, age, grade, subjects, languages, quiz behavior).
* No backend: `functionsUrl` is empty, so chat, stars, Homework, and Book Club are hidden.
* Languages: English, Hebrew, Thai (`questions/thai.js`). Russian is turned off.
* Thai words must be checked by a native speaker; see `../thai-review.md`.

Tests:

```bash
node brain-break/test.js
node level-test/test.js
node questions/validate.js
node questions/no-repeat.test.js
node tests/client-safety.test.js
node tests/style-level.test.js
```

## Safety rules

Stars and prices are enforced on a server only, and this copy has no server
(`functionsUrl` is empty). Editing `settings.js` or browser storage cannot create stars.
Only a parent changes settings, by editing `settings.js`. No passwords or keys are in this project.

## Publish

Push this folder to its own GitHub repo, turn on Pages (branch main, root).
`CNAME` points at aria.cainhq.com; add a DNS CNAME record for that host to `<username>.github.io`.

## 2026 makeover: aria's room (dreamcore hub) + the math rooms

- `index.html` + `js/hub.js` + `css/hub.css`: dreamcore-style hub (Aria asked for dreamcore). First visit runs a setup (site name, room name, player name, mood/theme, avatar symbol). Everything is saved in localStorage (`aria-hub-v1`, background picture in `aria-hub-bg`) and can be changed in **My Hub**. Nothing is uploaded anywhere.
- `js/aria-core.js`: moods/themes (dreamcore default, cloudcore, liminal pool, night dreamcore; weirdcore unlocks after the first round), quiet ranks (眠り sleeper → 目覚め awake), old-save migration (unknown theme → dreamcore), XP, badges, unlocks, daily-run tracking (no penalty for missed days). `js/aria-fx.js`: drifting clouds, slow-blinking eyes, stars, pool light (respects reduced motion). Scene pictures in `assets/dream/` are original generated art with no people.
- `math/`: four games (the carrying room, the room of zeros, which door first, something feels off). `math/engine.js` generates rounds of 5, easiest first; `math/dojo.js` runs them, with "Where am I stuck?" hints.
- `story/chapters.js`: NULL MOON, an original 10-chapter story; each finished round unlocks the next chapter.
- Rainbow Cats, Spa Salon, and Ice Cream Scoop are retired from the hub (folders kept).
- Test: `node tests/math-games.test.js` re-checks every generated answer over 3,000 rounds per game.
