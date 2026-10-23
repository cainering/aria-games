/* Aria's hub core: profile, themes, avatar, XP, ranks, badges, unlocks.
   Everything is saved on this device in localStorage (key "aria-hub-v1").
   Load this in <head> so the chosen theme paints before the page shows. */
(function (root) {
  "use strict";
  var KEY = "aria-hub-v1", BGKEY = "aria-hub-bg";

  var THEMES = [
    { id: "cyber", name: "Midnight Cyberpunk", jp: "真夜中", fx: "rain", bg: "#06060d", bg2: "#120a24", panel: "rgba(16,14,34,.78)", line: "rgba(0,240,255,.28)", text: "#e9f7ff", soft: "#8fa6c4", a1: "#00f0ff", a2: "#ff2bd6", display: "'Orbitron', 'Rajdhani', system-ui, sans-serif" },
    { id: "sakura", name: "Ink & Sakura", jp: "墨と桜", fx: "petals", bg: "#0d0a0e", bg2: "#1c1218", panel: "rgba(28,20,26,.80)", line: "rgba(255,138,178,.30)", text: "#f6eee4", soft: "#b9a6a8", a1: "#ff7aa8", a2: "#f3e6d0", display: "'Shippori Mincho', 'Hiragino Mincho ProN', serif" },
    { id: "fantasy", name: "Dark Fantasy", jp: "闇の王国", fx: "embers", bg: "#0a0607", bg2: "#1d0c0e", panel: "rgba(26,12,14,.82)", line: "rgba(212,169,74,.30)", text: "#f3e9dc", soft: "#b49c8a", a1: "#e0233f", a2: "#d9b05a", display: "'Cinzel', 'Times New Roman', serif" },
    { id: "starfield", name: "Starfield", jp: "星の海", fx: "stars", bg: "#040616", bg2: "#0c1236", panel: "rgba(12,16,44,.78)", line: "rgba(139,123,255,.32)", text: "#eef0ff", soft: "#9ea6d6", a1: "#9b8cff", a2: "#3ee6c8", display: "'Exo 2', 'Rajdhani', system-ui, sans-serif" },
    { id: "storm", name: "Storm Ronin", jp: "嵐", fx: "rain", bg: "#090b0f", bg2: "#141a22", panel: "rgba(20,24,32,.80)", line: "rgba(255,212,0,.30)", text: "#f2f4f7", soft: "#9aa4b2", a1: "#ffd400", a2: "#5aa9ff", display: "'Rajdhani', system-ui, sans-serif", unlock: { rank: 1 } },
    { id: "tide", name: "Abyssal Tide", jp: "深淵", fx: "stars", bg: "#02100f", bg2: "#06222a", panel: "rgba(6,28,32,.80)", line: "rgba(0,255,163,.28)", text: "#e6fff7", soft: "#8ab7ad", a1: "#00ffa3", a2: "#2b8cff", display: "'Exo 2', system-ui, sans-serif", unlock: { rank: 2 } },
    { id: "ghost", name: "Ghost Signal", jp: "幽霊信号", fx: "rain", bg: "#070707", bg2: "#151515", panel: "rgba(22,22,22,.84)", line: "rgba(255,59,59,.35)", text: "#f5f5f5", soft: "#a3a3a3", a1: "#ff3b3b", a2: "#f5f5f5", display: "'Orbitron', system-ui, sans-serif", unlock: { badge: "phoenix" } },
    { id: "eclipse", name: "Eclipse", jp: "日食", fx: "embers", bg: "#000000", bg2: "#140b00", panel: "rgba(20,12,2,.84)", line: "rgba(255,176,0,.34)", text: "#fff6e6", soft: "#c2a982", a1: "#ffb000", a2: "#ff4d00", display: "'Cinzel', serif", unlock: { rank: 4 } }
  ];

  var RANKS = [
    { xp: 0, name: "Initiate", jp: "見習い" },
    { xp: 100, name: "Apprentice", jp: "弟子" },
    { xp: 280, name: "Adept", jp: "熟練" },
    { xp: 520, name: "Vanguard", jp: "先鋒" },
    { xp: 850, name: "Sentinel", jp: "守護者" },
    { xp: 1300, name: "Ace", jp: "エース" },
    { xp: 2000, name: "Sage", jp: "賢者" },
    { xp: 3000, name: "Master", jp: "達人" }
  ];

  var GLYPHS = [
    { id: "yoru", ch: "夜", mean: "night (yoru)" }, { id: "hoshi", ch: "星", mean: "star (hoshi)" }, { id: "yaiba", ch: "刃", mean: "blade (yaiba)" },
    { id: "kage", ch: "影", mean: "shadow (kage)" }, { id: "tsuki", ch: "月", mean: "moon (tsuki)" }, { id: "yume", ch: "夢", mean: "dream (yume)" },
    { id: "oto", ch: "音", mean: "sound, music (oto)" }, { id: "spark", ch: "✦", mean: "spark" },
    { id: "honoo", ch: "炎", mean: "flame (honoo)", unlock: { rank: 1 } }, { id: "kaminari", ch: "雷", mean: "thunder (kaminari)", unlock: { rank: 2 } },
    { id: "hikari", ch: "光", mean: "light (hikari)", unlock: { badge: "sharp" } }, { id: "tamashii", ch: "魂", mean: "soul (tamashii)", unlock: { rank: 3 } },
    { id: "ryu", ch: "龍", mean: "dragon (ryū)", unlock: { rank: 4 } }, { id: "kaze", ch: "風", mean: "wind (kaze)", unlock: { badge: "days3" } },
    { id: "ken", ch: "剣", mean: "sword (ken)", unlock: { badge: "four" } }, { id: "ou", ch: "王", mean: "ruler (ō)", unlock: { rank: 7 } }
  ];
  var FRAMES = [
    { id: "hex", name: "Hex" }, { id: "circle", name: "Ring" }, { id: "diamond", name: "Diamond" },
    { id: "shield", name: "Shield", unlock: { badge: "first" } }, { id: "star", name: "Star Seal", unlock: { rank: 3 } }, { id: "crest", name: "Master Crest", unlock: { rank: 7 } }
  ];
  var AURAS = [
    { id: "none", name: "None" }, { id: "glow", name: "Glow" },
    { id: "pulse", name: "Pulse", unlock: { rank: 1 } }, { id: "orbit", name: "Orbit", unlock: { badge: "four" } }, { id: "flare", name: "Flare", unlock: { badge: "days7" } }
  ];
  var COLORS = ["#00f0ff", "#ff2bd6", "#ff7aa8", "#e0233f", "#d9b05a", "#9b8cff", "#3ee6c8", "#ffd400", "#00ffa3", "#f5f5f5"];

  var BADGES = [
    { id: "first", name: "First Mission", icon: "壱", about: "Finish any math round." },
    { id: "carry", name: "Chain Breaker", icon: "乗", about: "Clear a Carry Chain round." },
    { id: "zeros", name: "Zero Walker", icon: "零", about: "Clear a Zero Shift round." },
    { id: "order", name: "Protocol Keeper", icon: "順", about: "Clear an Order Protocol round." },
    { id: "check", name: "Truth Seeker", icon: "検", about: "Clear a Reality Check round." },
    { id: "four", name: "Four Disciplines", icon: "四", about: "Clear all four math games." },
    { id: "sharp", name: "Sharp Question", icon: "問", about: "Use \"Where am I stuck?\" 5 times. Precise questions are a power." },
    { id: "phoenix", name: "Phoenix", icon: "鳳", about: "Fix 10 slips. Every master makes them." },
    { id: "oracle", name: "Oracle's Eye", icon: "眼", about: "Make 10 good estimates." },
    { id: "veteran", name: "Veteran", icon: "十", about: "Finish 10 rounds." },
    { id: "days3", name: "Three Nights", icon: "三", about: "Train on 3 different days." },
    { id: "days7", name: "Seven Moons", icon: "七", about: "Train on 7 different days." },
    { id: "story5", name: "Deep in the Story", icon: "章", about: "Unlock 5 story chapters." },
    { id: "story10", name: "Season Finale", icon: "終", about: "Unlock the whole first season." },
    { id: "creator", name: "Creator", icon: "創", about: "Add your first creation to your shelf." },
    { id: "master", name: "Master", icon: "達", about: "Reach Master rank." }
  ];

  function defaults() {
    return {
      v: 1, setup: false, siteName: "", hubName: "", player: "", title: "", theme: "cyber", accent: "",
      avatar: { frame: "hex", glyph: "yoru", c1: "#00f0ff", c2: "#ff2bd6", aura: "glow" },
      bgDim: 0.55, creations: [], xp: 0, rounds: {}, roundsTotal: 0, chapters: 1, readChapters: {},
      badges: {}, stats: { asked: 0, fixed: 0, estimates: 0 }, days: []
    };
  }
  function merge(base, extra) {
    var k; for (k in extra) if (Object.prototype.hasOwnProperty.call(extra, k)) {
      if (extra[k] && typeof extra[k] === "object" && !Array.isArray(extra[k]) && base[k] && typeof base[k] === "object" && !Array.isArray(base[k])) base[k] = merge(base[k], extra[k]);
      else base[k] = extra[k];
    }
    return base;
  }
  var state = null;
  function load() {
    var s = defaults();
    try { var raw = root.localStorage && localStorage.getItem(KEY); if (raw) s = merge(s, JSON.parse(raw)); } catch (e) {}
    state = s; return s;
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }
  function get() { return state || load(); }
  function set(patch) { merge(get(), patch); save(); apply(); return state; }

  function rankIndex(xp) { var i, r = 0; for (i = 0; i < RANKS.length; i++) if (xp >= RANKS[i].xp) r = i; return r; }
  function rankInfo(xp) {
    var i = rankIndex(xp), cur = RANKS[i], next = RANKS[i + 1];
    return { index: i, rank: cur, next: next, pct: next ? Math.round(100 * (xp - cur.xp) / (next.xp - cur.xp)) : 100, toNext: next ? next.xp - xp : 0 };
  }
  function isUnlocked(item, s) {
    s = s || get();
    if (!item.unlock) return true;
    if (item.unlock.rank != null && rankIndex(s.xp) >= item.unlock.rank) return true;
    if (item.unlock.badge && s.badges[item.unlock.badge]) return true;
    return false;
  }
  function unlockText(item) {
    if (!item.unlock) return "";
    if (item.unlock.rank != null) return "Reach " + RANKS[item.unlock.rank].name;
    var b = BADGES.filter(function (x) { return x.id === item.unlock.badge; })[0];
    return "Earn the " + (b ? b.name : "") + " badge";
  }
  function theme(id) { return THEMES.filter(function (t) { return t.id === id; })[0] || THEMES[0]; }

  function apply() {
    var s = get(), t = theme(s.theme), de = document.documentElement;
    if (!isUnlocked(t, s)) t = THEMES[0];
    var a1 = s.accent || t.a1;
    var vars = { "--bg": t.bg, "--bg2": t.bg2, "--panel": t.panel, "--line": t.line, "--text": t.text, "--soft": t.soft, "--a1": a1, "--a2": t.a2, "--display": t.display };
    Object.keys(vars).forEach(function (k) { de.style.setProperty(k, vars[k]); });
    de.setAttribute("data-theme", t.id);
    de.setAttribute("data-fx", t.fx);
    var bg = null; try { bg = localStorage.getItem(BGKEY); } catch (e) {}
    if (bg) { de.style.setProperty("--user-bg", "url(" + bg + ")"); de.style.setProperty("--user-dim", String(s.bgDim == null ? 0.55 : s.bgDim)); de.setAttribute("data-userbg", "1"); }
    else { de.style.removeProperty("--user-bg"); de.removeAttribute("data-userbg"); }
    var meta = document.querySelector('meta[name="theme-color"]'); if (meta) meta.setAttribute("content", t.bg);
    fillNames();
  }
  function siteName() { var s = get(); return s.siteName || "Aria's Web"; }
  function fillNames() {
    if (!document.body) return;
    var name = siteName();
    var links = document.querySelectorAll("[data-site-link], a.home-link, a.back");
    for (var i = 0; i < links.length; i++) links[i].textContent = "\u2190 " + name;
    if (!document.body.classList.contains("hub")) {
      var page = document.body.getAttribute("data-page");
      if (page) document.title = page + " · " + name;
    }
  }

  function setBackground(dataUrl) { try { if (dataUrl) localStorage.setItem(BGKEY, dataUrl); else localStorage.removeItem(BGKEY); } catch (e) { return false; } apply(); return true; }
  function hasBackground() { try { return !!localStorage.getItem(BGKEY); } catch (e) { return false; } }

  function esc(t) { return String(t == null ? "" : t).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }

  var FRAME_PATH = {
    hex: "M50 4 L90 27 L90 73 L50 96 L10 73 L10 27 Z",
    circle: "M50 6 A44 44 0 1 1 49.9 6 Z",
    diamond: "M50 3 L95 50 L50 97 L5 50 Z",
    shield: "M50 4 L88 16 L86 56 C84 76 68 89 50 97 C32 89 16 76 14 56 L12 16 Z",
    star: "M50 3 L61 20 L81 14 L80 35 L97 46 L83 61 L89 81 L68 82 L58 97 L50 84 L42 97 L32 82 L11 81 L17 61 L3 46 L20 35 L19 14 L39 20 Z",
    crest: "M50 2 L66 14 L92 12 L88 40 L98 62 L74 72 L62 96 L50 84 L38 96 L26 72 L2 62 L12 40 L8 12 L34 14 Z"
  };
  var uid = 0;
  function avatarSVG(av, opts) {
    av = av || get().avatar; opts = opts || {};
    var g = GLYPHS.filter(function (x) { return x.id === av.glyph; })[0] || GLYPHS[0];
    var path = FRAME_PATH[av.frame] || FRAME_PATH.hex, id = "av" + (++uid), c1 = av.c1 || "#00f0ff", c2 = av.c2 || "#ff2bd6";
    var aura = av.aura || "none";
    var s = '<svg class="avatar-svg aura-' + aura + '" viewBox="-10 -10 120 120" role="img" aria-label="Avatar ' + esc(g.mean) + '">' +
      '<defs><linearGradient id="' + id + 'g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + c1 + '"/><stop offset="1" stop-color="' + c2 + '"/></linearGradient>' +
      '<radialGradient id="' + id + 'r" cx=".5" cy=".38" r=".7"><stop offset="0" stop-color="' + c1 + '" stop-opacity=".35"/><stop offset="1" stop-color="#000" stop-opacity=".9"/></radialGradient>' +
      '<filter id="' + id + 'f" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>';
    if (aura === "orbit") s += '<g class="orbit"><circle cx="50" cy="50" r="56" fill="none" stroke="' + c2 + '" stroke-width="1" stroke-dasharray="2 9" opacity=".8"/><circle cx="106" cy="50" r="3" fill="' + c1 + '"/><circle cx="-6" cy="50" r="2" fill="' + c2 + '"/></g>';
    if (aura === "flare") s += '<g class="flare" opacity=".75">' + [0, 45, 90, 135].map(function (r) { return '<rect x="48.5" y="-8" width="3" height="116" rx="1.5" fill="url(#' + id + 'g)" transform="rotate(' + r + ' 50 50)"/>'; }).join("") + '</g>';
    s += '<path d="' + path + '" fill="url(#' + id + 'r)" stroke="url(#' + id + 'g)" stroke-width="3.5"' + (aura !== "none" ? ' filter="url(#' + id + 'f)"' : "") + '/>';
    s += '<path d="' + path + '" fill="none" stroke="' + c1 + '" stroke-opacity=".35" stroke-width="1" transform="translate(50 50) scale(.86) translate(-50 -50)"/>';
    s += '<text x="50" y="52" text-anchor="middle" dominant-baseline="central" font-size="' + (g.ch.length > 1 || /[✦]/.test(g.ch) ? 44 : 48) + '" font-family="\'Shippori Mincho\', \'Hiragino Mincho ProN\', \'Noto Serif JP\', serif" font-weight="800" fill="url(#' + id + 'g)"' + (aura !== "none" ? ' filter="url(#' + id + 'f)"' : "") + '>' + esc(g.ch) + '</text>';
    s += "</svg>";
    return s;
  }

  function today() { var d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
  function markDay() { var s = get(), t = today(); if (s.days.indexOf(t) < 0) { s.days.push(t); if (s.days.length > 400) s.days = s.days.slice(-400); } }
  function runLength() {
    var s = get(), set = {}, n = 0, d = new Date();
    s.days.forEach(function (x) { set[x] = 1; });
    var key = function (dt) { return dt.getFullYear() + "-" + String(dt.getMonth() + 1).padStart(2, "0") + "-" + String(dt.getDate()).padStart(2, "0"); };
    if (!set[key(d)]) d.setDate(d.getDate() - 1);
    while (set[key(d)]) { n++; d.setDate(d.getDate() - 1); }
    return n;
  }

  function checkBadges() {
    var s = get(), got = [];
    function give(id) { if (!s.badges[id]) { s.badges[id] = today(); got.push(id); } }
    var r = s.rounds || {};
    if (s.roundsTotal >= 1) give("first");
    ["carry", "zeros", "order", "check"].forEach(function (g) { if (r[g] && r[g].cleared) give(g); });
    if (["carry", "zeros", "order", "check"].every(function (g) { return r[g] && r[g].cleared; })) give("four");
    if (s.stats.asked >= 5) give("sharp");
    if (s.stats.fixed >= 10) give("phoenix");
    if (s.stats.estimates >= 10) give("oracle");
    if (s.roundsTotal >= 10) give("veteran");
    if (s.days.length >= 3) give("days3");
    if (s.days.length >= 7) give("days7");
    if (s.chapters >= 5) give("story5");
    if (s.chapters >= CHAPTER_COUNT()) give("story10");
    if (s.creations.length >= 1) give("creator");
    if (rankIndex(s.xp) >= RANKS.length - 1) give("master");
    return got;
  }
  function CHAPTER_COUNT() { return (root.ARIA_STORY && root.ARIA_STORY.chapters.length) || 10; }

  function snapshotUnlocks(s) {
    var out = {};
    THEMES.concat(GLYPHS, FRAMES, AURAS).forEach(function (x) { if (x.unlock && isUnlocked(x, s)) out[x.id] = 1; });
    return out;
  }
  function describeNew(before, after) {
    var names = [];
    THEMES.forEach(function (x) { if (after[x.id] && !before[x.id]) names.push("Theme: " + x.name); });
    GLYPHS.forEach(function (x) { if (after[x.id] && !before[x.id]) names.push("Avatar glyph: " + x.ch + " " + x.mean); });
    FRAMES.forEach(function (x) { if (after[x.id] && !before[x.id]) names.push("Avatar frame: " + x.name); });
    AURAS.forEach(function (x) { if (after[x.id] && !before[x.id]) names.push("Avatar aura: " + x.name); });
    return names;
  }

  /* Stats for the round: { xp, asked, fixed, estimates, clean } */
  function finishRound(game, r) {
    var s = get(), beforeRank = rankIndex(s.xp), beforeUnlocks = snapshotUnlocks(s);
    s.xp += r.xp;
    s.stats.asked += r.asked || 0; s.stats.fixed += r.fixed || 0; s.stats.estimates += r.estimates || 0;
    var g = s.rounds[game] || (s.rounds[game] = { played: 0, cleared: 0, best: 0 });
    g.played++; g.cleared++; g.best = Math.max(g.best || 0, r.clean || 0);
    s.roundsTotal++;
    var chapter = null;
    if (s.chapters < CHAPTER_COUNT()) { s.chapters++; chapter = s.chapters; }
    markDay();
    var badges = checkBadges();
    var unlocks = describeNew(beforeUnlocks, snapshotUnlocks(s));
    save();
    var afterRank = rankIndex(s.xp);
    return { xp: r.xp, totalXp: s.xp, rankUp: afterRank > beforeRank ? RANKS[afterRank] : null, chapter: chapter, badges: badges.map(function (id) { return BADGES.filter(function (b) { return b.id === id; })[0]; }), unlocks: unlocks };
  }
  function addXp(n) { get().xp += n; save(); }

  function reset() { try { localStorage.removeItem(KEY); localStorage.removeItem(BGKEY); } catch (e) {} state = null; load(); apply(); }

  load();
  if (typeof document !== "undefined") {
    apply();
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fillNames);
    root.addEventListener && root.addEventListener("storage", function (e) { if (e.key === KEY || e.key === BGKEY) { load(); apply(); } });
  }

  root.AriaHub = {
    THEMES: THEMES, RANKS: RANKS, GLYPHS: GLYPHS, FRAMES: FRAMES, AURAS: AURAS, COLORS: COLORS, BADGES: BADGES,
    get: get, set: set, save: save, load: load, apply: apply, theme: theme, rankInfo: rankInfo, rankIndex: rankIndex,
    isUnlocked: isUnlocked, unlockText: unlockText, avatarSVG: avatarSVG, setBackground: setBackground, hasBackground: hasBackground,
    finishRound: finishRound, addXp: addXp, checkBadges: checkBadges, markDay: markDay, runLength: runLength, siteName: siteName, esc: esc, reset: reset, today: today
  };
})(window);
