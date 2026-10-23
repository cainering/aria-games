/* Aria's hub core: profile, themes, avatar, XP, ranks, badges, unlocks.
   Everything is saved on this device in localStorage (key "aria-hub-v1").
   Load this in <head> so the chosen theme paints before the page shows. */
(function (root) {
  "use strict";
  var KEY = "aria-hub-v1", BGKEY = "aria-hub-bg";

  var SCRIPT = (typeof document !== "undefined" && document.currentScript && document.currentScript.src) || "";
  function asset(path) { try { return new URL("../" + path, SCRIPT || location.href).href; } catch (e) { return path; } }

  /* Five themes from the dreamcore family. Each one also brings its own words (lex) so labels match the mood. */
  var SERIF = "'Cormorant Garamond', 'Iowan Old Style', Georgia, serif", MONO = "'IBM Plex Mono', ui-monospace, Menlo, monospace",
      ROUND = "'Quicksand', 'Nunito', system-ui, sans-serif", BODY = "'Nunito', -apple-system, 'Segoe UI', system-ui, sans-serif";
  var THEMES = [
    { id: "dreamcore", name: "dreamcore", jp: "夢の部屋", about: "faded floral wallpaper, a door that opens onto sky, something that blinks", fx: "dream", img: "dreamcore", dark: false,
      bg: "#e9eef6", wash: "linear-gradient(180deg, rgba(232,242,253,.30), rgba(252,236,243,.46))", panel: "rgba(255,251,250,.52)", sheet: "#fbf7f6", line: "rgba(120,130,170,.28)",
      text: "#3c4566", soft: "#7b83a3", a1: "#8bb8e8", a2: "#e7a3bd", a3: "#a9dcc6", onA: "#26304d", well: "rgba(255,255,255,.55)", display: SERIF, ui: MONO, italic: true,
      lex: { hub: "the soft room", math: "the math rooms", mathJp: "部屋", room: "room", go: "enter", story: "the story", storyJp: "物語", other: "other rooms", otherJp: "廊下", made: "things i made", madeJp: "作品", keep: "keepsakes", keepJp: "宝物", done: "the room is quiet now", back: "back to the room",
        phrases: ["you've been here before", "the door was always open", "it's okay to stay a while", "someone left the light on for you", "the water is still warm", "this hallway remembers your name"] } },
    { id: "cloudcore", name: "cloudcore", jp: "雲の上", about: "bright, airy, always a summer afternoon above the clouds", fx: "sky", img: "sky", dark: false,
      bg: "#dcebfb", wash: "linear-gradient(180deg, rgba(214,233,252,.20), rgba(255,255,255,.48))", panel: "rgba(255,255,255,.50)", sheet: "#f7fbff", line: "rgba(110,150,200,.30)",
      text: "#35506f", soft: "#7891ad", a1: "#9ccaf3", a2: "#f6c9b4", a3: "#ffffff", onA: "#20384f", well: "rgba(255,255,255,.6)", display: ROUND, ui: MONO, italic: false,
      lex: { hub: "above the clouds", math: "sky lessons", mathJp: "空", room: "cloud", go: "float up", story: "the story", storyJp: "物語", other: "elsewhere", otherJp: "遠く", made: "things i made", madeJp: "作品", keep: "collected things", keepJp: "宝物", done: "the sky cleared", back: "back up",
        phrases: ["the sky remembers you", "nothing here is in a hurry", "it's always 4pm in summer", "you can see the whole town from here", "the clouds are moving slowly", "you're right on time"] } },
    { id: "pool", name: "liminal pool", jp: "誰もいないプール", about: "tiled pool rooms, still water, fluorescent hum, nobody else here", fx: "pool", img: "pool", dark: false,
      bg: "#dff3f1", wash: "linear-gradient(180deg, rgba(225,246,244,.28), rgba(240,250,250,.50))", panel: "rgba(248,255,255,.54)", sheet: "#f4fbfb", line: "rgba(80,150,150,.30)",
      text: "#2f5458", soft: "#6e9599", a1: "#86d3cf", a2: "#b9e4f0", a3: "#f3f8f7", onA: "#173b3e", well: "rgba(255,255,255,.6)", display: MONO, ui: MONO, italic: false,
      lex: { hub: "the pool room", math: "the lanes", mathJp: "水", room: "lane", go: "wade in", story: "the story", storyJp: "物語", other: "other rooms", otherJp: "部屋", made: "things i made", madeJp: "作品", keep: "lost & found", keepJp: "忘れ物", done: "the water settles", back: "back to the pool",
        phrases: ["the lights hum softly", "nobody else is swimming", "the water is always 78°", "lane 4 is open", "your footsteps echo a little", "the pool never closes"] } },
    { id: "night", name: "night dreamcore", jp: "夜の夢", about: "dusky violet, stars at the window, a quiet room after everyone's asleep", fx: "night", img: "night", dark: true,
      bg: "#1d1830", wash: "linear-gradient(180deg, rgba(28,22,52,.34), rgba(22,18,40,.62))", panel: "rgba(40,32,70,.55)", sheet: "#231d3a", line: "rgba(200,185,255,.22)",
      text: "#ece6ff", soft: "#a9a0cc", a1: "#c3b2ff", a2: "#f3c6dc", a3: "#ffe9a8", onA: "#1d1830", well: "rgba(10,8,24,.35)", display: SERIF, ui: MONO, italic: true,
      lex: { hub: "the quiet room", math: "night lessons", mathJp: "夜", room: "window", go: "open", story: "the story", storyJp: "物語", other: "other rooms", otherJp: "部屋", made: "things i made", madeJp: "作品", keep: "keepsakes", keepJp: "宝物", done: "the house is asleep now", back: "back to the quiet room",
        phrases: ["the house is quiet now", "the porch light is still on", "the stars are listening", "everyone else is asleep", "you can stay up a little longer", "the moon left the window open"] } },
    { id: "weird", name: "weirdcore", jp: "へんな夢", about: "stranger and glitchier: too many doors, eyes, text that wants to tell you something", fx: "weird", img: "weird", dark: false,
      bg: "#efe9cf", wash: "linear-gradient(180deg, rgba(244,238,208,.34), rgba(240,232,200,.56))", panel: "rgba(255,252,236,.66)", sheet: "#fbf8e9", line: "rgba(120,110,70,.32)",
      text: "#3b3a2c", soft: "#7d7a60", a1: "#9fc3ea", a2: "#e6a19a", a3: "#f4e9a4", onA: "#2a2a1e", well: "rgba(255,255,255,.55)", display: "'Times New Roman', Times, serif", ui: "'VT323', " + MONO, italic: false, unlock: { rank: 1 },
      lex: { hub: "ROOM ?", math: "the rooms (all of them)", mathJp: "扉", room: "door", go: "go in", story: "a story that keeps going", storyJp: "物語", other: "more doors", otherJp: "扉", made: "proof i was here", madeJp: "証拠", keep: "found objects", keepJp: "拾い物", done: "you finished. the wallpaper noticed.", back: "go back",
        phrases: ["are you still there?", "this is not the first time", "you blinked. that's okay.", "the hallway is longer today", "everything is fine :)", "remember to come back"] } }
  ];

  /* Rank names stay Japanese and quiet. */
  var RANKS = [
    { xp: 0, name: "sleeper", jp: "眠り" },
    { xp: 100, name: "dreamer", jp: "夢見" },
    { xp: 280, name: "wanderer", jp: "旅人" },
    { xp: 520, name: "lucid", jp: "明晰" },
    { xp: 850, name: "door keeper", jp: "扉守" },
    { xp: 1300, name: "cloud walker", jp: "雲歩き" },
    { xp: 2000, name: "star reader", jp: "星読み" },
    { xp: 3000, name: "awake", jp: "目覚め" }
  ];

  /* Avatar symbols: drawn ones (sym) and real Japanese words (ch). */
  var GLYPHS = [
    { id: "eye", sym: 1, ch: "👁", mean: "eye" }, { id: "cloud", sym: 1, ch: "☁", mean: "cloud" }, { id: "door", sym: 1, ch: "🚪", mean: "door" },
    { id: "star", sym: 1, ch: "✦", mean: "star" }, { id: "moon", sym: 1, ch: "☾", mean: "moon" }, { id: "duck", sym: 1, ch: "🦆", mean: "rubber duck" },
    { id: "flower", sym: 1, ch: "✿", mean: "flower" },
    { id: "yume", ch: "夢", mean: "dream (yume)" }, { id: "sora", ch: "空", mean: "sky (sora)" }, { id: "kumo", ch: "雲", mean: "cloud (kumo)" },
    { id: "tsuki", ch: "月", mean: "moon (tsuki)" }, { id: "hoshi", ch: "星", mean: "star (hoshi)" }, { id: "oto", ch: "音", mean: "sound, music (oto)" }, { id: "yoru", ch: "夜", mean: "night (yoru)" },
    { id: "key", sym: 1, ch: "⚿", mean: "key", unlock: { badge: "four" } },
    { id: "tobira", ch: "扉", mean: "door (tobira)", unlock: { rank: 1 } }, { id: "hikari", ch: "光", mean: "light (hikari)", unlock: { badge: "sharp" } },
    { id: "kaze", ch: "風", mean: "wind (kaze)", unlock: { badge: "days3" } }, { id: "nemuri", ch: "眠", mean: "sleep (nemuri)", unlock: { rank: 3 } },
    { id: "mezame", ch: "覚", mean: "waking up (mezameru)", unlock: { rank: 7 } }
  ];
  var FRAMES = [
    { id: "circle", name: "bubble" }, { id: "arch", name: "arch" }, { id: "tile", name: "tile" },
    { id: "window", name: "window", unlock: { badge: "first" } }, { id: "cloudf", name: "cloud", unlock: { rank: 2 } }, { id: "tv", name: "old tv", unlock: { rank: 4 } }
  ];
  var AURAS = [
    { id: "none", name: "none" }, { id: "glow", name: "haze" },
    { id: "pulse", name: "breathe", unlock: { rank: 1 } }, { id: "orbit", name: "drift", unlock: { badge: "four" } }, { id: "flare", name: "halo", unlock: { badge: "days7" } }
  ];
  var COLORS = ["#cfe6fb", "#8bb8e8", "#f6d3df", "#e7a3bd", "#cdeedd", "#a9dcc6", "#e3dbff", "#c3b2ff", "#fff1c1", "#ffffff", "#5b6f9c", "#8a5f7a", "#4f7a6e", "#3c4566"];

  var BADGES = [
    { id: "first", name: "first door", icon: "壱", about: "Finish any math round." },
    { id: "carry", name: "carried", icon: "乗", about: "Finish a round in the carrying room." },
    { id: "zeros", name: "nothing, counted", icon: "零", about: "Finish a round in the room of zeros." },
    { id: "order", name: "the right door", icon: "順", about: "Finish a round of which door first." },
    { id: "check", name: "it felt off", icon: "検", about: "Finish a round of something feels off." },
    { id: "four", name: "every room", icon: "四", about: "Finish a round in all four rooms." },
    { id: "sharp", name: "a clear question", icon: "問", about: "Use \"Where am I stuck?\" 5 times. Precise questions are a power." },
    { id: "phoenix", name: "mended", icon: "繕", about: "Fix 10 slips. Everyone makes them." },
    { id: "oracle", name: "the knowing eye", icon: "眼", about: "Make 10 good estimates." },
    { id: "veteran", name: "ten visits", icon: "十", about: "Finish 10 rounds." },
    { id: "days3", name: "three nights", icon: "三", about: "Visit on 3 different days." },
    { id: "days7", name: "seven moons", icon: "七", about: "Visit on 7 different days." },
    { id: "story5", name: "deep in the story", icon: "章", about: "Unlock 5 story chapters." },
    { id: "story10", name: "end of season one", icon: "終", about: "Unlock the whole first season." },
    { id: "creator", name: "maker", icon: "創", about: "Add your first creation to your shelf." },
    { id: "master", name: "awake", icon: "覚", about: "Reach the last rank." }
  ];

  /* Old (v1) names and ids that should quietly move to the new look. */
  var OLD_NAMES = ["Nightglass Station", "Neon Shrine", "Moonblade Archive", "Signal//Aria", "The Ink Tower", "Starfall Terminal", "Command Deck", "Hideout", "Sanctum", "Dojo", "Control Room", "Observatory",
    "The Silent Blade", "Starfall Composer", "Seam Walker", "Night Shift Strategist"];
  var OLD_COLORS = ["#00f0ff", "#ff2bd6", "#ff7aa8", "#e0233f", "#d9b05a", "#9b8cff", "#3ee6c8", "#ffd400", "#00ffa3", "#f5f5f5"];
  function find(list, id) { return list.filter(function (x) { return x.id === id; })[0]; }
  function migrate(s) {
    if (!find(THEMES, s.theme)) { s.theme = "dreamcore"; s.accent = ""; }
    if (s.accent && OLD_COLORS.indexOf(s.accent.toLowerCase()) >= 0) s.accent = "";
    ["siteName", "hubName", "title"].forEach(function (k) { if (OLD_NAMES.indexOf(s[k]) >= 0) s[k] = ""; });
    var a = s.avatar || (s.avatar = {});
    if (!find(GLYPHS, a.glyph)) a.glyph = "eye";
    if (!find(FRAMES, a.frame)) a.frame = a.frame === "hex" || a.frame === "diamond" ? "arch" : "circle";
    if (!find(AURAS, a.aura)) a.aura = "glow";
    if (!a.c1 || OLD_COLORS.indexOf(String(a.c1).toLowerCase()) >= 0) a.c1 = "#cfe6fb";
    if (!a.c2 || OLD_COLORS.indexOf(String(a.c2).toLowerCase()) >= 0) a.c2 = "#5b6f9c";
    s.v = 2;
    return s;
  }

  function defaults() {
    return {
      v: 2, setup: false, siteName: "", hubName: "", player: "", title: "", theme: "dreamcore", accent: "",
      avatar: { frame: "arch", glyph: "eye", c1: "#cfe6fb", c2: "#5b6f9c", aura: "glow" },
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
    migrate(s);
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
    if (item.unlock.rank != null) return "reach " + RANKS[item.unlock.rank].jp + " · " + RANKS[item.unlock.rank].name;
    var b = BADGES.filter(function (x) { return x.id === item.unlock.badge; })[0];
    return "find the keepsake \u201c" + (b ? b.name : "") + "\u201d";
  }
  function theme(id) { return THEMES.filter(function (t) { return t.id === id; })[0] || THEMES[0]; }

  function apply() {
    var s = get(), t = theme(s.theme), de = document.documentElement;
    if (!isUnlocked(t, s)) t = THEMES[0];
    var a1 = s.accent || t.a1;
    var vars = { "--bg": t.bg, "--wash": t.wash, "--panel": t.panel, "--sheet": t.sheet, "--line": t.line, "--text": t.text, "--soft": t.soft, "--a1": a1, "--a2": t.a2, "--a3": t.a3, "--on-a": t.onA, "--well": t.well,
      "--display": t.display, "--ui": t.ui, "--body": BODY, "--scene": "url(" + asset("assets/dream/" + t.img + ".jpg") + ")", "--display-style": t.italic ? "italic" : "normal" };
    Object.keys(vars).forEach(function (k) { de.style.setProperty(k, vars[k]); });
    de.setAttribute("data-theme", t.id);
    de.setAttribute("data-fx", t.fx);
    de.setAttribute("data-mode", t.dark ? "dark" : "light");
    var bg = null; try { bg = localStorage.getItem(BGKEY); } catch (e) {}
    if (bg) { de.style.setProperty("--user-bg", "url(" + bg + ")"); de.style.setProperty("--user-dim", String(s.bgDim == null ? 0.35 : s.bgDim)); de.setAttribute("data-userbg", "1"); }
    else { de.style.removeProperty("--user-bg"); de.removeAttribute("data-userbg"); }
    var meta = document.querySelector('meta[name="theme-color"]'); if (meta) meta.setAttribute("content", t.bg);
    fillNames();
  }
  function lex() { var s = get(), t = theme(s.theme); if (!isUnlocked(t, s)) t = THEMES[0]; return t.lex; }
  function phrase(seed) { var p = lex().phrases; return p[(seed == null ? Math.floor(Math.random() * p.length) : seed) % p.length]; }
  function siteName() { var s = get(); return s.siteName || "aria's room"; }
  function fillNames() {
    if (!document.body) return;
    var name = siteName();
    var links = document.querySelectorAll("[data-site-link], a.home-link, a.back");
    for (var i = 0; i < links.length; i++) links[i].textContent = "\u2190 " + name.toLowerCase();
    if (!document.body.classList.contains("hub")) {
      var page = document.body.getAttribute("data-page");
      if (page) document.title = page + " · " + name;
    }
  }

  function setBackground(dataUrl) { try { if (dataUrl) localStorage.setItem(BGKEY, dataUrl); else localStorage.removeItem(BGKEY); } catch (e) { return false; } apply(); return true; }
  function hasBackground() { try { return !!localStorage.getItem(BGKEY); } catch (e) { return false; } }

  function esc(t) { return String(t == null ? "" : t).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }

  var FRAME_PATH = {
    circle: "M50 6 A44 44 0 1 1 49.9 6 Z",
    arch: "M16 96 L16 44 A34 34 0 0 1 84 44 L84 96 Z",
    tile: "M16 8 H84 Q92 8 92 16 V84 Q92 92 84 92 H16 Q8 92 8 84 V16 Q8 8 16 8 Z",
    window: "M14 96 L14 42 A36 36 0 0 1 86 42 L86 96 Z",
    cloudf: "M24 86 C8 86 4 66 16 58 C8 42 24 26 40 32 C46 14 74 14 80 34 C96 34 100 56 90 64 C98 78 86 90 74 86 Z",
    tv: "M12 30 Q12 24 18 24 H82 Q88 24 88 30 V84 Q88 90 82 90 H18 Q12 90 12 84 Z"
  };
  /* Simple drawn symbols, sized for a 100x100 box. ink = main color, paper = light fill. */
  function symbolSVG(id, ink, paper) {
    var st = ' fill="none" stroke="' + ink + '" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"';
    switch (id) {
      case "eye": return '<g class="sym-eye"><path d="M20 52 Q50 24 80 52 Q50 80 20 52 Z" fill="' + paper + '"' + st.replace(' fill="none"', "") + '/><g class="iris"><circle cx="50" cy="52" r="12" fill="' + ink + '" opacity=".9"/><circle cx="50" cy="52" r="5" fill="' + paper + '" opacity=".35"/><circle cx="54.5" cy="47.5" r="2.6" fill="#fff"/></g>' +
        '<path d="M30 38 L27 32 M40 33 L39 26 M50 31 V24 M60 33 L61 26 M70 38 L73 32"' + st + ' stroke-width="2.4"/></g>';
      case "cloud": return '<path d="M30 68 C18 68 16 54 26 50 C24 38 38 32 46 38 C50 28 66 28 70 40 C82 40 86 54 78 60 C82 66 76 70 70 68 Z" fill="' + paper + '"' + st.replace(' fill="none"', "") + '/>';
      case "door": return '<path d="M34 78 V36 A16 16 0 0 1 66 36 V78 Z" fill="#cfe6fb" stroke="' + ink + '" stroke-width="3.2" stroke-linejoin="round"/><path d="M40 60 C36 60 36 54 40 53 C40 49 46 47 48 51 C52 49 56 52 54 56 C57 57 56 60 53 60 Z" fill="#fff"/><path d="M34 78 V36 A16 16 0 0 1 50 20" fill="none" stroke="' + ink + '" stroke-width="1.6" opacity=".4"/><circle cx="60" cy="58" r="2.4" fill="' + ink + '"/><path d="M26 78 H74"' + st + '/>';
      case "star": return '<path d="M50 20 C53 42 58 47 80 50 C58 53 53 58 50 80 C47 58 42 53 20 50 C42 47 47 42 50 20 Z" fill="' + paper + '"' + st.replace(' fill="none"', "") + '/><circle cx="74" cy="28" r="3" fill="' + ink + '" opacity=".6"/><circle cx="28" cy="74" r="2" fill="' + ink + '" opacity=".5"/>';
      case "moon": return '<path d="M60 22 A30 30 0 1 0 74 72 A24 24 0 1 1 60 22 Z" fill="' + paper + '"' + st.replace(' fill="none"', "") + '/><circle cx="72" cy="34" r="2.2" fill="' + ink + '" opacity=".6"/>';
      case "duck": return '<path d="M26 60 C26 50 34 48 42 52 C40 40 46 30 57 30 C68 30 72 42 66 50 C76 50 80 56 76 64 C72 76 56 78 44 76 C32 75 26 70 26 60 Z" fill="#ffe27a" stroke="' + ink + '" stroke-width="3" stroke-linejoin="round"/><path d="M68 38 L80 41 L68 45 Z" fill="#f7a35c" stroke="' + ink + '" stroke-width="2" stroke-linejoin="round"/><circle cx="60" cy="38" r="2.6" fill="' + ink + '"/><path d="M40 62 C46 66 54 66 60 62"' + st + ' stroke-width="2.2"/>';
      case "flower": return '<g fill="' + paper + '" stroke="' + ink + '" stroke-width="2.8">' + [0, 72, 144, 216, 288].map(function (r) { return '<ellipse cx="50" cy="33" rx="10" ry="15" transform="rotate(' + r + ' 50 51)"/>'; }).join("") + '</g><circle cx="50" cy="51" r="8" fill="' + ink + '"/>';
      case "key": return '<circle cx="36" cy="50" r="12"' + st + '/><circle cx="36" cy="50" r="4" fill="' + ink + '" opacity=".5"/><path d="M48 50 H80 M70 50 V60 M78 50 V58"' + st + '/>';
    }
    return "";
  }
  var uid = 0;
  function avatarSVG(av, opts) {
    av = av || get().avatar; opts = opts || {};
    var g = find(GLYPHS, av.glyph) || GLYPHS[0];
    var path = FRAME_PATH[av.frame] || FRAME_PATH.circle, id = "av" + (++uid), c1 = av.c1 || "#cfe6fb", c2 = av.c2 || "#5b6f9c";
    var aura = av.aura || "none";
    var s = '<svg class="avatar-svg aura-' + aura + '" viewBox="-12 -12 124 124" role="img" aria-label="Avatar: ' + esc(g.mean) + '">' +
      '<defs><radialGradient id="' + id + 'r" cx=".42" cy=".32" r=".8"><stop offset="0" stop-color="#ffffff"/><stop offset=".55" stop-color="' + c1 + '"/><stop offset="1" stop-color="' + c1 + '" stop-opacity=".85"/></radialGradient>' +
      '<filter id="' + id + 'f" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="5"/></filter>' +
      '<clipPath id="' + id + 'c"><path d="' + path + '"/></clipPath></defs>';
    if (aura !== "none") s += '<path class="haze" d="' + path + '" fill="' + c1 + '" opacity=".9" filter="url(#' + id + 'f)" transform="translate(50 50) scale(1.08) translate(-50 -50)"/>';
    if (aura === "orbit") s += '<g class="orbit">' + [0, 120, 240].map(function (r, i) { return '<circle cx="50" cy="-4" r="' + (4 - i) + '" fill="#fff" stroke="' + c2 + '" stroke-width="1" opacity=".9" transform="rotate(' + r + ' 50 50)"/>'; }).join("") + '</g>';
    if (aura === "flare") s += '<ellipse class="halo" cx="50" cy="-2" rx="26" ry="6" fill="none" stroke="' + c2 + '" stroke-width="2" opacity=".55"/>';
    if (av.frame === "tv") s += '<path d="M36 22 L26 6 M64 22 L74 6" stroke="' + c2 + '" stroke-width="2.4" stroke-linecap="round"/>';
    s += '<path d="' + path + '" fill="url(#' + id + 'r)" stroke="' + c2 + '" stroke-width="2.6" stroke-linejoin="round"/>';
    s += '<g clip-path="url(#' + id + 'c)"><rect x="-10" y="-10" width="120" height="120" fill="url(#' + id + 'r)" opacity="0"/>';
    if (av.frame === "window") s += '<path d="M50 6 V96 M14 58 H86" stroke="' + c2 + '" stroke-width="1.6" opacity=".35"/>';
    if (av.frame === "tv") s += '<path d="M12 40 H88 M12 56 H88 M12 72 H88" stroke="' + c2 + '" stroke-width=".8" opacity=".18"/>';
    s += '</g>';
    var cy = av.frame === "arch" || av.frame === "window" ? 4 : av.frame === "tv" ? 6 : 0;
    s += '<g transform="translate(0 ' + cy + ')">';
    if (g.sym) s += '<g transform="translate(50 52) scale(.82) translate(-50 -52)">' + symbolSVG(g.id, c2, "#ffffff") + "</g>";
    else s += '<text x="50" y="53" text-anchor="middle" dominant-baseline="central" font-size="46" font-family="\'Shippori Mincho\', \'Hiragino Mincho ProN\', \'Noto Serif JP\', serif" font-weight="600" fill="' + c2 + '">' + esc(g.ch) + "</text>";
    s += "</g></svg>";
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
    THEMES.forEach(function (x) { if (after[x.id] && !before[x.id]) names.push("theme: " + x.name); });
    GLYPHS.forEach(function (x) { if (after[x.id] && !before[x.id]) names.push("avatar symbol: " + x.mean); });
    FRAMES.forEach(function (x) { if (after[x.id] && !before[x.id]) names.push("avatar frame: " + x.name); });
    AURAS.forEach(function (x) { if (after[x.id] && !before[x.id]) names.push("avatar aura: " + x.name); });
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
    finishRound: finishRound, addXp: addXp, checkBadges: checkBadges, markDay: markDay, runLength: runLength, siteName: siteName, esc: esc, reset: reset, today: today, lex: lex, phrase: phrase, asset: asset, symbolSVG: symbolSVG, migrate: migrate
  };
})(window);
