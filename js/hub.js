/* Aria's hub page: first-run setup, My Hub customizer, missions, story reader, creations, badges. */
(function () {
  "use strict";
  var H = window.AriaHub, esc = H.esc, $ = function (id) { return document.getElementById(id); };
  var STORY = window.ARIA_STORY;
  var GAMES = [
    { id: "carry", title: "the carrying room", kj: "乗", about: "Big multiplication. Guess first, then carry carefully or use the box method." },
    { id: "zeros", title: "the room of zeros", kj: "零", about: "Multiply and divide with tens, hundreds, thousands. Set the zeros aside, then bring them back." },
    { id: "order", title: "which door first", kj: "順", about: "Tap which operation opens first. Some doors are traps." },
    { id: "check", title: "something feels off", kj: "検", about: "Round, estimate, and notice when someone's answer doesn't fit." }
  ];
  var TRAINING = [
    { title: "the language room", kj: "語", tag: "english · hebrew · thai · japanese · parsha", about: "Practice questions at your level, with voice.", href: "practice/index.html" },
    { title: "the map", kj: "地", tag: "find your level", about: "A quiet walk that finds your level in each subject.", href: "level-test/index.html" },
    { title: "the writing desk", kj: "筆", tag: "story studio", about: "Finish a story or start your own. Optional calm timer.", href: "story-studio/index.html" },
    { title: "the puzzle wall", kj: "謎", tag: "logic grid", about: "A crossword beside a Sudoku. Letters and digits.", href: "animal-puzzle/index.html" }
  ];
  var SITE_IDEAS = ["aria's room", "the watching house", "somewhere above the clouds", "the blue door", "pool after hours", "a house that remembers"];
  var HUB_IDEAS = ["the soft room", "my room", "the hallway", "the attic", "the window seat", "the quiet room"];
  var TITLE_IDEAS = ["dream walker", "keeper of doors", "keeper of lost songs", "cloud collector", "lucid dreamer", "the one who remembers"];
  function setText(id, t) { var el = $(id); if (el) el.textContent = t; }

  function render() {
    var s = H.get(), ri = H.rankInfo(s.xp);
    H.apply();
    var L = H.lex();
    $("logo").textContent = H.siteName();
    document.title = H.siteName();
    $("hubSub").textContent = s.hubName || L.hub;
    $("heroHub").textContent = (s.hubName || L.hub);
    setText("mHead", L.math); setText("mKj", L.mathJp); setText("sHead", L.story); setText("sKj", L.storyJp); setText("tHead", L.other); setText("tKj", L.otherJp);
    setText("cHead", L.made); setText("cKj", L.madeJp); setText("bHead", L.keep); setText("bKj", L.keepJp);
    var day = Math.floor(Date.now() / 864e5); setText("heroWhisper", H.phrase(day)); setText("footWhisper", H.phrase(day + 3));
    $("heroName").textContent = s.player || "Aria";
    $("heroTitle").textContent = s.title || "";
    $("heroAvatar").innerHTML = H.avatarSVG(s.avatar);
    $("rankChip").innerHTML = '<span class="jp">' + esc(ri.rank.jp) + "</span> " + esc(ri.rank.name);
    $("xpNow").textContent = s.xp + " xp";
    $("xpNext").textContent = ri.next ? ri.toNext + " xp to " + ri.next.jp + " · " + ri.next.name : "the last rank";
    requestAnimationFrame(function () { $("xpFill").style.width = ri.pct + "%"; });
    $("days").textContent = s.days.length;
    var run = H.runLength(); $("runWrap").hidden = run < 2; $("run").textContent = run + " days";

    $("missions").innerHTML = GAMES.map(function (g, gi) {
      var r = s.rounds[g.id] || {}, n = r.cleared || 0, pips = "";
      for (var i = 0; i < 5; i++) pips += '<i class="' + (i < Math.min(n, 5) ? "on" : "") + '"></i>';
      return '<a class="card" href="math/index.html?g=' + g.id + '"><div class="portal" aria-hidden="true"><span>' + g.kj + '</span></div><span class="tag">' + esc(L.room + " " + (gi + 1)) + '</span><h3>' + g.title + '</h3><p>' + g.about + '</p><div class="meta"><span class="pips" aria-label="' + n + ' rounds finished">' + pips + '</span><span>' + (n ? n + " visited" : "not yet") + '</span><span class="go">' + esc(L.go) + '</span></div></a>';
    }).join("");

    $("training").innerHTML = TRAINING.map(function (g) {
      return '<a class="card" href="' + g.href + '"><span class="kjs" aria-hidden="true">' + g.kj + '</span><span class="tag">' + g.tag + '</span><h3>' + g.title + '</h3><p>' + g.about + '</p></a>';
    }).join("");

    $("storyTitle").innerHTML = esc(STORY.title) + '<span class="jp">' + esc(STORY.jp) + "</span>";
    $("storySeason").textContent = STORY.season + " · " + Math.min(s.chapters, STORY.chapters.length) + " of " + STORY.chapters.length + " open";
    $("chapters").innerHTML = STORY.chapters.map(function (c, i) {
      var open = i < s.chapters, isNew = open && !s.readChapters[i + 1];
      return '<button type="button" class="chap' + (isNew ? " new" : "") + '" data-ch="' + i + '"' + (open ? "" : " disabled aria-label=\"Chapter " + (i + 1) + " locked\"") + '><span class="n">chapter ' + (i + 1) + (open ? "" : " · still closed") + '</span><span class="t">' + (open ? esc(c.title) : "finish a round") + "</span></button>";
    }).join("");

    $("shelf").innerHTML = s.creations.map(function (c, i) {
      return '<a class="creation" href="' + esc(c.url) + '" target="_blank" rel="noopener"><span class="k">' + esc(String(c.kind).toLowerCase()) + '</span><span class="t">' + esc(c.title) + '</span><button type="button" class="x" data-del="' + i + '" aria-label="Remove ' + esc(c.title) + '">✕</button></a>';
    }).join("") + '<button type="button" class="creation add" id="addCreation">＋ add a song, story, or visual novel</button>';

    var got = 0;
    $("badges").innerHTML = H.BADGES.map(function (b) {
      var have = !!s.badges[b.id]; if (have) got++;
      return '<div class="badge' + (have ? "" : " locked") + '" title="' + esc(b.about) + '"><span class="seal">' + b.icon + '</span><span class="bn">' + esc(b.name) + '</span><span class="ba">' + esc(b.about) + "</span></div>";
    }).join("");
    $("badgeCount").textContent = got + " of " + H.BADGES.length + " found";
  }

  /* ---------- overlay helpers ---------- */
  var ov = $("ov"), sheet = $("sheet");
  function open(html, cls) { sheet.className = "sheet" + (cls ? " " + cls : ""); sheet.innerHTML = html; ov.hidden = false; sheet.scrollTop = 0; }
  function close() { ov.hidden = true; sheet.innerHTML = ""; render(); }
  ov.addEventListener("click", function (e) { if (e.target === ov && H.get().setup) close(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !ov.hidden && H.get().setup) close(); });
  function toast(t) { var d = document.createElement("div"); d.className = "toast"; d.textContent = t; document.body.appendChild(d); setTimeout(function () { d.remove(); }, 2600); }

  /* ---------- pieces shared by setup and customize ---------- */
  function identityHTML(s) {
    function sugg(list, target) { return '<div class="suggest">' + list.map(function (x) { return '<button type="button" data-fill="' + target + '" data-v="' + esc(x) + '">' + esc(x) + "</button>"; }).join("") + "</div>"; }
    return '<label class="field"><span>name this place</span><input type="text" id="fSite" maxlength="32" placeholder="aria\'s room" value="' + esc(s.siteName) + '">' + sugg(SITE_IDEAS, "fSite") + "</label>" +
      '<label class="field"><span>name this room (the main screen)</span><input type="text" id="fHub" maxlength="28" placeholder="' + esc(H.lex().hub) + '" value="' + esc(s.hubName) + '">' + sugg(HUB_IDEAS, "fHub") + "</label>" +
      '<label class="field"><span>your name</span><input type="text" id="fPlayer" maxlength="24" placeholder="aria" value="' + esc(s.player) + '"></label>' +
      '<label class="field"><span>a few words under your name (optional)</span><input type="text" id="fTitle" maxlength="36" placeholder="dream walker" value="' + esc(s.title) + '">' + sugg(TITLE_IDEAS, "fTitle") + "</label>";
  }
  function readIdentity() {
    var v = function (id) { var el = $(id); return el ? el.value.trim() : null; };
    var p = {}; if ($("fSite")) { p.siteName = v("fSite"); p.hubName = v("fHub"); p.player = v("fPlayer"); p.title = v("fTitle"); }
    return p;
  }
  function themeHTML(s) {
    var cur = H.theme(s.theme).id;
    return '<div class="theme-grid">' + H.THEMES.map(function (t, i) {
      var ok = H.isUnlocked(t, s);
      return '<button type="button" class="theme-opt' + (i === 0 ? " featured" : "") + (t.dark ? " dark" : "") + (cur === t.id ? " sel" : "") + (ok ? "" : " lock") + '" data-theme="' + t.id + '" style="background-image:url(' + H.asset("assets/dream/" + t.img + "-thumb.jpg") + ')">' +
        (i === 0 ? '<span class="feat">featured · default</span>' : "") + '<div class="cap"><div><span class="tn">' + esc(t.name) + '</span><span class="tj">' + esc(t.jp) + '</span></div><div class="ta">' + esc(t.about) + "</div>" + (ok ? "" : '<div class="lk">🔒 ' + esc(H.unlockText(t)) + "</div>") + "</div></button>";
    }).join("") + "</div>" +
      '<div class="field" style="margin-top:18px"><span>accent color (optional)</span><div class="opt-row" id="accentRow">' +
      '<button type="button" class="opt txt' + (!s.accent ? " sel" : "") + '" data-accent="">mood default</button>' +
      H.COLORS.map(function (c) { return '<button type="button" class="swatch' + (s.accent === c ? " sel" : "") + '" data-accent="' + c + '" style="background:' + c + '" aria-label="Accent ' + c + '"></button>'; }).join("") +
      '<label class="opt txt">custom <input type="color" id="accentPick" value="' + (s.accent || H.theme(s.theme).a1) + '" style="width:36px;height:30px;border:0;background:none"></label></div></div>';
  }
  function avatarHTML(s) {
    var a = s.avatar, g = H.GLYPHS.filter(function (x) { return x.id === a.glyph; })[0] || H.GLYPHS[0];
    function group(label, list, key, render) {
      return '<div class="field"><span>' + label + '</span><div class="opt-row">' + list.map(function (it) {
        var ok = H.isUnlocked(it, s);
        return '<button type="button" class="opt' + (render ? "" : " txt") + (a[key] === it.id ? " sel" : "") + (ok ? "" : " lock") + '" data-av="' + key + '" data-id="' + it.id + '" title="' + esc(ok ? (it.mean || it.name) : "Locked: " + H.unlockText(it)) + '"' + (ok ? "" : " aria-disabled=\"true\"") + ">" + (render ? render(it) : esc(it.name)) + (ok ? "" : " 🔒") + "</button>";
      }).join("") + "</div></div>";
    }
    function colors(label, key) {
      return '<div class="field"><span>' + label + '</span><div class="opt-row">' + H.COLORS.map(function (c) { return '<button type="button" class="swatch' + (a[key] === c ? " sel" : "") + '" data-avc="' + key + '" data-c="' + c + '" style="background:' + c + '" aria-label="' + c + '"></button>'; }).join("") +
        '<input type="color" data-avpick="' + key + '" value="' + a[key] + '" style="width:44px;height:44px;border:0;background:none" aria-label="Custom color"></div></div>';
    }
    return '<div class="avatar-builder"><div><div class="preview" id="avPreview">' + H.avatarSVG(a) + '</div><div class="gmean" id="avMean">' + esc(g.sym ? g.mean : g.ch + " · " + g.mean) + '</div></div><div>' +
      group("symbol", H.GLYPHS, "glyph", function (it) { return it.sym ? '<svg viewBox="14 14 72 72" aria-hidden="true">' + H.symbolSVG(it.id, "#5b6f9c", "#ffffff") + "</svg>" : esc(it.ch); }) + group("frame", H.FRAMES, "frame") + colors("inside color", "c1") + colors("symbol color", "c2") + group("aura", H.AURAS, "aura") + "</div></div>";
  }
  function backgroundHTML(s) {
    var has = H.hasBackground();
    return '<p class="lead">Use your own art as the background instead of the mood\'s picture. It stays on this iPad only.</p><div class="row"><label class="btn primary">choose picture<input type="file" id="bgFile" accept="image/*" hidden></label>' + (has ? '<button type="button" class="btn ghost" id="bgClear">remove picture</button>' : "") + "</div>" +
      (has ? '<label class="field" style="margin-top:18px"><span>haze over picture</span><input type="range" id="bgDim" min="0" max="0.85" step="0.05" value="' + (s.bgDim == null ? 0.35 : s.bgDim) + '" style="width:100%"></label>' : "");
  }

  /* one delegated handler for all customizer controls */
  sheet.addEventListener("click", function (e) {
    var t = e.target.closest("button, [data-fill]"); if (!t) return;
    var s = H.get();
    if (t.dataset.fill) { var inp = $(t.dataset.fill); if (inp) { inp.value = t.dataset.v; inp.dispatchEvent(new Event("input")); } return; }
    if (t.dataset.theme) { var th = H.theme(t.dataset.theme); if (!H.isUnlocked(th, s)) { toast("🔒 " + H.unlockText(th) + " to find " + th.name); return; } H.set({ theme: th.id, accent: "" }); refreshPane(); return; }
    if (t.dataset.accent !== undefined && t.hasAttribute("data-accent")) { H.set({ accent: t.dataset.accent }); refreshPane(); return; }
    if (t.dataset.av) {
      var list = { glyph: H.GLYPHS, frame: H.FRAMES, aura: H.AURAS }[t.dataset.av], it = list.filter(function (x) { return x.id === t.dataset.id; })[0];
      if (!H.isUnlocked(it, s)) { toast("🔒 " + H.unlockText(it) + " to find this"); return; }
      var av = {}; av[t.dataset.av] = t.dataset.id; H.set({ avatar: av }); refreshPane(); return;
    }
    if (t.dataset.avc) { var av2 = {}; av2[t.dataset.avc] = t.dataset.c; H.set({ avatar: av2 }); refreshPane(); return; }
    if (t.id === "bgClear") { H.setBackground(null); refreshPane(); return; }
  });
  sheet.addEventListener("input", function (e) {
    var t = e.target;
    if (t.id === "accentPick") { H.set({ accent: t.value }); }
    if (t.dataset && t.dataset.avpick) { var av = {}; av[t.dataset.avpick] = t.value; H.set({ avatar: av }); var pv = $("avPreview"); if (pv) pv.innerHTML = H.avatarSVG(H.get().avatar); }
    if (t.id === "bgDim") { H.set({ bgDim: Number(t.value) }); }
    if (/^f(Site|Hub|Player|Title)$/.test(t.id) && H.get().setup) { H.set(readIdentity()); render(); }
  });
  sheet.addEventListener("change", function (e) {
    if (e.target.id !== "bgFile" || !e.target.files[0]) return;
    var file = e.target.files[0], rd = new FileReader();
    rd.onload = function () {
      var img = new Image();
      img.onload = function () {
        var max = 1600, sc = Math.min(1, max / Math.max(img.width, img.height)), c = document.createElement("canvas");
        c.width = Math.round(img.width * sc); c.height = Math.round(img.height * sc);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        var url = c.toDataURL("image/jpeg", 0.82);
        if (!H.setBackground(url)) { url = c.toDataURL("image/jpeg", 0.6); if (!H.setBackground(url)) { toast("That picture is too big to save. Try a smaller one."); return; } }
        toast("saved on this iPad"); refreshPane();
      };
      img.src = rd.result;
    };
    rd.readAsDataURL(file);
  });

  /* ---------- first-run setup ---------- */
  var wizStep = 0;
  var WIZ = [
    { h: "this place is yours", lead: "Nothing here is decided yet. Name it, pick a mood, choose a symbol. You can change anything later in my hub.", body: function (s) { return identityHTML(s); } },
    { h: "pick a mood", lead: "Dreamcore is the default. One more mood drifts in after your first round.", body: themeHTML },
    { h: "choose your symbol", lead: "Drawn symbols, or real Japanese words. More appear over time.", body: avatarHTML },
    { h: "you've been here before", lead: "", body: function (s) {
      return '<div style="display:grid;place-items:center;text-align:center;gap:10px"><div style="width:150px">' + H.avatarSVG(s.avatar) + '</div><h3 style="font-family:var(--display);font-style:var(--display-style);font-weight:600;font-size:40px;margin:6px 0 0;text-transform:lowercase">' + esc(s.player || "aria") + '</h3><div style="color:var(--soft);font-family:var(--display);font-style:italic;font-size:20px">' + esc(s.title || "") + '</div><p style="color:var(--soft);max-width:46ch">Welcome to <b>' + esc(H.siteName()) + "</b>. Finish a round in the math rooms to earn xp, drift through quiet ranks (眠り sleeper → 目覚め awake), find new moods and symbols, and open the next chapter of <i>null moon</i>.</p></div>";
    } }
  ];
  function wizard() {
    var s = H.get(), st = WIZ[wizStep], dots = WIZ.map(function (_, i) { return '<i class="' + (i <= wizStep ? "on" : "") + '"></i>'; }).join("");
    open('<div class="steps">' + dots + '</div><h2>' + st.h + '</h2>' + (st.lead ? '<p class="lead">' + st.lead + "</p>" : "") + '<div id="pane">' + st.body(s) + '</div><div class="sheet-foot">' +
      (wizStep ? '<button type="button" class="btn ghost" id="wBack">back</button>' : "<span></span>") + '<button type="button" class="btn primary" id="wNext">' + (wizStep === WIZ.length - 1 ? "come in" : "next") + "</button></div>");
    $("wNext").onclick = function () {
      if (wizStep === 0) { var p = readIdentity(); if (!p.siteName) p.siteName = "aria's room"; if (!p.player) p.player = "aria"; H.set(p); }
      if (wizStep < WIZ.length - 1) { wizStep++; wizard(); return; }
      H.set({ setup: true }); H.markDay(); H.save(); close(); toast("welcome, " + (H.get().player || "aria"));
    };
    if ($("wBack")) $("wBack").onclick = function () { if (wizStep === 0) return; if (wizStep === 1) {} wizStep--; wizard(); };
    paneRefresher = function () { $("pane").innerHTML = WIZ[wizStep].body(H.get()); };
  }

  /* ---------- customize ---------- */
  var tab = "theme", paneRefresher = null;
  var TABS = { theme: ["mood", themeHTML], you: ["names", identityHTML], avatar: ["symbol", avatarHTML], bg: ["background", backgroundHTML] };
  function customize(which) {
    tab = which || tab;
    open('<h2>my hub</h2><p class="lead">Change anything, anytime. Saved on this device.</p><div class="tabs">' + Object.keys(TABS).map(function (k) { return '<button type="button" data-tab="' + k + '" class="' + (k === tab ? "on" : "") + '">' + TABS[k][0] + "</button>"; }).join("") +
      '</div><div id="pane">' + TABS[tab][1](H.get()) + '</div><div class="sheet-foot"><button type="button" class="btn ghost" id="cReset">start over</button><button type="button" class="btn primary" id="cDone">done</button></div>');
    sheet.querySelectorAll("[data-tab]").forEach(function (b) { b.onclick = function () { customize(b.dataset.tab); }; });
    $("cDone").onclick = function () { var p = readIdentity(); if ($("fSite")) H.set(p); close(); };
    $("cReset").onclick = function () {
      if (!confirm("Start over? This clears your names, mood, symbol, xp, keepsakes, and story progress on this iPad.")) return;
      H.reset(); wizStep = 0; render(); wizard();
    };
    paneRefresher = function () { $("pane").innerHTML = TABS[tab][1](H.get()); };
  }
  function refreshPane() { if (paneRefresher) paneRefresher(); render(); }

  /* ---------- story reader ---------- */
  function readChapter(i) {
    var s = H.get(), c = STORY.chapters[i];
    if (!c || i >= s.chapters) return;
    s.readChapters[i + 1] = 1; H.save();
    open('<div class="ch-n">' + esc(STORY.title) + " · chapter " + (i + 1) + '</div><h2>' + esc(c.title) + '<span class="jp">' + esc(c.jp) + "</span></h2>" + c.body.map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("") +
      '<div class="sheet-foot">' + (i > 0 ? '<button type="button" class="btn ghost" id="rPrev">← chapter ' + i + "</button>" : "<span></span>") +
      (i + 1 < s.chapters ? '<button type="button" class="btn primary" id="rNext">chapter ' + (i + 2) + " →</button>" : (i + 1 < STORY.chapters.length ? '<a class="btn primary" href="#mHead" id="rTrain">the next chapter opens after a round</a>' : '<button type="button" class="btn primary" id="rClose">close</button>')) + "</div>", "reader");
    if ($("rPrev")) $("rPrev").onclick = function () { readChapter(i - 1); };
    if ($("rNext")) $("rNext").onclick = function () { readChapter(i + 1); };
    if ($("rTrain")) $("rTrain").onclick = function () { close(); };
    if ($("rClose")) $("rClose").onclick = close;
  }

  /* ---------- creations ---------- */
  function addCreation() {
    open('<h2>add something you made</h2><p class="lead">Link a song, story, visual novel, or art you made (for example a Google Drive, Docs, or SoundCloud link).</p>' +
      '<label class="field"><span>title</span><input type="text" id="crTitle" maxlength="48" placeholder="the watching house (demo)"></label>' +
      '<label class="field"><span>link</span><input type="url" id="crUrl" placeholder="https://…" inputmode="url" autocapitalize="off"></label>' +
      '<div class="field"><span>type</span><div class="opt-row" id="crKind">' + ["Song", "Story", "Visual novel", "Art", "Other"].map(function (k, i) { return '<button type="button" class="opt txt' + (i ? "" : " sel") + '" data-kind="' + k + '">' + k + "</button>"; }).join("") + "</div></div>" +
      '<div class="sheet-foot"><button type="button" class="btn ghost" id="crCancel">cancel</button><button type="button" class="btn primary" id="crSave">add to shelf</button></div>');
    var kind = "Song";
    $("crKind").onclick = function (e) { var b = e.target.closest("[data-kind]"); if (!b) return; kind = b.dataset.kind; this.querySelectorAll(".opt").forEach(function (o) { o.classList.toggle("sel", o === b); }); };
    $("crCancel").onclick = close;
    $("crSave").onclick = function () {
      var t = $("crTitle").value.trim(), u = $("crUrl").value.trim();
      if (!t) { $("crTitle").focus(); return; }
      if (u && !/^https?:\/\//i.test(u)) u = "https://" + u;
      if (!/^https?:\/\/[^\s]+\.[^\s]+/i.test(u)) { toast("Paste a full link, like https://…"); $("crUrl").focus(); return; }
      var s = H.get(); s.creations.push({ title: t, url: u, kind: kind }); var got = H.checkBadges(); H.save(); close();
      toast(got.length ? "keepsake found: maker" : "added to your shelf");
    };
  }

  document.addEventListener("click", function (e) {
    var del = e.target.closest("[data-del]");
    if (del) { e.preventDefault(); e.stopPropagation(); var s = H.get(), i = Number(del.dataset.del); if (confirm("Remove \"" + s.creations[i].title + "\" from your shelf?")) { s.creations.splice(i, 1); H.save(); render(); } return; }
    if (e.target.closest("#addCreation")) { addCreation(); return; }
    var ch = e.target.closest("[data-ch]"); if (ch && !ch.disabled) { readChapter(Number(ch.dataset.ch)); return; }
  });
  $("openCustomize").onclick = function () { customize("theme"); };
  $("heroAvatar").onclick = function () { customize("avatar"); };

  render();
  var s0 = H.get();
  if (!s0.setup) wizard();
  else { H.markDay(); H.save(); render(); }
  var q = new URLSearchParams(location.search);
  if (q.get("chapter") && s0.setup) readChapter(Number(q.get("chapter")) - 1);
})();
