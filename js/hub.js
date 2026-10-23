/* Aria's hub page: first-run setup, My Hub customizer, missions, story reader, creations, badges. */
(function () {
  "use strict";
  var H = window.AriaHub, esc = H.esc, $ = function (id) { return document.getElementById(id); };
  var STORY = window.ARIA_STORY;
  var GAMES = [
    { id: "carry", title: "Carry Chain", kj: "乗", tag: "Mission 01", about: "Big multiplication. Estimate first, then carry clean or use the box method." },
    { id: "zeros", title: "Zero Shift", kj: "零", tag: "Mission 02", about: "Multiply and divide with tens, hundreds, thousands. Cover the zeros." },
    { id: "order", title: "Order Protocol", kj: "順", tag: "Mission 03", about: "Tap which operation fires first. Dodge the traps." },
    { id: "check", title: "Reality Check", kj: "検", tag: "Mission 04", about: "Round, estimate, and catch the slips in someone else's work." }
  ];
  var TRAINING = [
    { title: "Language Lab", kj: "語", tag: "English · Hebrew · Thai · Japanese · Parsha", about: "Practice questions at your level, with voice.", href: "practice/index.html" },
    { title: "Placement Quest", kj: "地", tag: "Treasure Map", about: "Finds your level in each subject and saves it.", href: "level-test/index.html" },
    { title: "Story Studio", kj: "筆", tag: "Write", about: "Finish a story or start your own. Optional calm timer.", href: "story-studio/index.html" },
    { title: "Logic Grid", kj: "謎", tag: "Puzzle", about: "A crossword beside a Sudoku. Letters and digits.", href: "animal-puzzle/index.html" }
  ];
  var SITE_IDEAS = ["Nightglass Station", "Neon Shrine", "Moonblade Archive", "Signal//Aria", "The Ink Tower", "Starfall Terminal"];
  var HUB_IDEAS = ["Command Deck", "Hideout", "Sanctum", "Dojo", "Control Room", "Observatory"];
  var TITLE_IDEAS = ["The Silent Blade", "Starfall Composer", "Seam Walker", "Keeper of Lost Songs", "Night Shift Strategist", "Ink Witch"];

  function render() {
    var s = H.get(), ri = H.rankInfo(s.xp);
    H.apply();
    $("logo").textContent = H.siteName();
    document.title = H.siteName();
    $("hubSub").textContent = s.hubName || "Command Deck";
    $("heroHub").textContent = (s.hubName || "Command Deck");
    $("heroName").textContent = s.player || "Aria";
    $("heroTitle").textContent = s.title || "";
    $("heroAvatar").innerHTML = H.avatarSVG(s.avatar);
    $("rankChip").innerHTML = esc(ri.rank.name) + ' <span class="jp">' + esc(ri.rank.jp) + "</span>";
    $("xpNow").textContent = s.xp + " XP";
    $("xpNext").textContent = ri.next ? ri.toNext + " XP to " + ri.next.name : "Max rank";
    requestAnimationFrame(function () { $("xpFill").style.width = ri.pct + "%"; });
    $("days").textContent = s.days.length;
    var run = H.runLength(); $("runWrap").hidden = run < 2; $("run").textContent = run + " days";

    $("missions").innerHTML = GAMES.map(function (g) {
      var r = s.rounds[g.id] || {}, n = r.cleared || 0, pips = "";
      for (var i = 0; i < 5; i++) pips += '<i class="' + (i < Math.min(n, 5) ? "on" : "") + '"></i>';
      return '<a class="card" href="math/index.html?g=' + g.id + '"><span class="big-kj" aria-hidden="true">' + g.kj + '</span><span class="tag">' + g.tag + '</span><h3>' + g.title + '</h3><p>' + g.about + '</p><div class="meta"><span class="pips" aria-label="' + n + ' rounds cleared">' + pips + '</span><span>' + (n ? n + " cleared" : "New") + '</span><span class="go">Start</span></div></a>';
    }).join("");

    $("training").innerHTML = TRAINING.map(function (g) {
      return '<a class="card" href="' + g.href + '"><span class="big-kj" aria-hidden="true">' + g.kj + '</span><span class="tag">' + g.tag + '</span><h3>' + g.title + '</h3><p>' + g.about + '</p></a>';
    }).join("");

    $("storyTitle").innerHTML = esc(STORY.title) + '<span class="jp">' + esc(STORY.jp) + "</span>";
    $("storySeason").textContent = STORY.season + " · " + Math.min(s.chapters, STORY.chapters.length) + " / " + STORY.chapters.length + " unlocked";
    $("chapters").innerHTML = STORY.chapters.map(function (c, i) {
      var open = i < s.chapters, isNew = open && !s.readChapters[i + 1];
      return '<button type="button" class="chap' + (isNew ? " new" : "") + '" data-ch="' + i + '"' + (open ? "" : " disabled aria-label=\"Chapter " + (i + 1) + " locked\"") + '><span class="n">CH ' + String(i + 1).padStart(2, "0") + (open ? "" : " · LOCKED") + '</span><span class="t">' + (open ? esc(c.title) : "Finish a round") + "</span></button>";
    }).join("");

    $("shelf").innerHTML = s.creations.map(function (c, i) {
      return '<a class="creation" href="' + esc(c.url) + '" target="_blank" rel="noopener"><span class="k">' + esc(c.kind) + '</span><span class="t">' + esc(c.title) + '</span><button type="button" class="x" data-del="' + i + '" aria-label="Remove ' + esc(c.title) + '">✕</button></a>';
    }).join("") + '<button type="button" class="creation add" id="addCreation">＋ Add a song, story, or VN link</button>';

    var got = 0;
    $("badges").innerHTML = H.BADGES.map(function (b) {
      var have = !!s.badges[b.id]; if (have) got++;
      return '<div class="badge' + (have ? "" : " locked") + '" title="' + esc(b.about) + '"><span class="seal">' + b.icon + '</span><span class="bn">' + esc(b.name) + '</span><span style="font-size:12px;color:var(--soft)">' + esc(b.about) + "</span></div>";
    }).join("");
    $("badgeCount").textContent = got + " / " + H.BADGES.length;
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
    return '<label class="field"><span>Name your site</span><input type="text" id="fSite" maxlength="32" placeholder="Make it yours" value="' + esc(s.siteName) + '">' + sugg(SITE_IDEAS, "fSite") + "</label>" +
      '<label class="field"><span>Name your hub (this screen)</span><input type="text" id="fHub" maxlength="28" placeholder="Command Deck" value="' + esc(s.hubName) + '">' + sugg(HUB_IDEAS, "fHub") + "</label>" +
      '<label class="field"><span>Player name</span><input type="text" id="fPlayer" maxlength="24" placeholder="Aria" value="' + esc(s.player) + '"></label>' +
      '<label class="field"><span>Your title</span><input type="text" id="fTitle" maxlength="36" placeholder="The Silent Blade" value="' + esc(s.title) + '">' + sugg(TITLE_IDEAS, "fTitle") + "</label>";
  }
  function readIdentity() {
    var v = function (id) { var el = $(id); return el ? el.value.trim() : null; };
    var p = {}; if ($("fSite")) { p.siteName = v("fSite"); p.hubName = v("fHub"); p.player = v("fPlayer"); p.title = v("fTitle"); }
    return p;
  }
  function themeHTML(s) {
    return '<div class="theme-grid">' + H.THEMES.map(function (t) {
      var ok = H.isUnlocked(t, s);
      return '<button type="button" class="theme-opt' + (s.theme === t.id ? " sel" : "") + (ok ? "" : " lock") + '" data-theme="' + t.id + '" style="background:radial-gradient(120% 90% at 100% 0,' + t.a2 + '55,transparent 60%),radial-gradient(90% 90% at 0 100%,' + t.a1 + '55,transparent 60%),linear-gradient(160deg,' + t.bg2 + ',' + t.bg + ');border-color:' + (s.theme === t.id ? "#fff" : t.a1 + "66") + '">' +
        '<div class="tn" style="color:' + t.a1 + '">' + esc(t.name) + '</div><div class="tj">' + esc(t.jp) + "</div>" + (ok ? "" : '<div class="lk">🔒 ' + esc(H.unlockText(t)) + "</div>") + "</button>";
    }).join("") + "</div>" +
      '<div class="field" style="margin-top:16px"><span>Accent color (optional)</span><div class="opt-row" id="accentRow">' +
      '<button type="button" class="opt txt' + (!s.accent ? " sel" : "") + '" data-accent="">Theme default</button>' +
      H.COLORS.map(function (c) { return '<button type="button" class="swatch' + (s.accent === c ? " sel" : "") + '" data-accent="' + c + '" style="background:' + c + '" aria-label="Accent ' + c + '"></button>'; }).join("") +
      '<label class="opt txt">Custom <input type="color" id="accentPick" value="' + (s.accent || H.theme(s.theme).a1) + '" style="width:36px;height:30px;border:0;background:none"></label></div></div>';
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
    return '<div class="avatar-builder"><div><div class="preview" id="avPreview">' + H.avatarSVG(a) + '</div><div class="gmean" id="avMean">' + esc(g.ch + " · " + g.mean) + '</div></div><div>' +
      group("Sigil", H.GLYPHS, "glyph", function (it) { return esc(it.ch); }) + group("Frame", H.FRAMES, "frame") + colors("Color 1", "c1") + colors("Color 2", "c2") + group("Aura", H.AURAS, "aura") + "</div></div>";
  }
  function backgroundHTML(s) {
    var has = H.hasBackground();
    return '<p class="lead">Use your own art as the background. It stays on this iPad only.</p><div class="row"><label class="btn primary">Choose picture<input type="file" id="bgFile" accept="image/*" hidden></label>' + (has ? '<button type="button" class="btn ghost" id="bgClear">Remove picture</button>' : "") + "</div>" +
      (has ? '<label class="field" style="margin-top:18px"><span>Darkness over picture</span><input type="range" id="bgDim" min="0" max="0.85" step="0.05" value="' + (s.bgDim == null ? 0.55 : s.bgDim) + '" style="width:100%"></label>' : "");
  }

  /* one delegated handler for all customizer controls */
  sheet.addEventListener("click", function (e) {
    var t = e.target.closest("button, [data-fill]"); if (!t) return;
    var s = H.get();
    if (t.dataset.fill) { var inp = $(t.dataset.fill); if (inp) { inp.value = t.dataset.v; inp.dispatchEvent(new Event("input")); } return; }
    if (t.dataset.theme) { var th = H.theme(t.dataset.theme); if (!H.isUnlocked(th, s)) { toast("🔒 " + H.unlockText(th) + " to unlock " + th.name); return; } H.set({ theme: th.id, accent: "" }); refreshPane(); return; }
    if (t.dataset.accent !== undefined && t.hasAttribute("data-accent")) { H.set({ accent: t.dataset.accent }); refreshPane(); return; }
    if (t.dataset.av) {
      var list = { glyph: H.GLYPHS, frame: H.FRAMES, aura: H.AURAS }[t.dataset.av], it = list.filter(function (x) { return x.id === t.dataset.id; })[0];
      if (!H.isUnlocked(it, s)) { toast("🔒 " + H.unlockText(it) + " to unlock this"); return; }
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
        toast("Background saved on this iPad"); refreshPane();
      };
      img.src = rd.result;
    };
    rd.readAsDataURL(file);
  });

  /* ---------- first-run setup ---------- */
  var wizStep = 0;
  var WIZ = [
    { h: "This place is yours", lead: "Nothing here is decided yet. Name it, style it, build your sigil. You can change anything later in My Hub.", body: function (s) { return identityHTML(s); } },
    { h: "Pick your world", lead: "Four themes to start. More unlock as you rank up.", body: themeHTML },
    { h: "Forge your sigil", lead: "Your avatar is a sigil. The kanji are real Japanese words, and new ones unlock as you train.", body: avatarHTML },
    { h: "Ready", lead: "", body: function (s) {
      return '<div style="display:grid;place-items:center;text-align:center;gap:10px"><div style="width:150px">' + H.avatarSVG(s.avatar) + '</div><h3 style="font-family:var(--display);font-size:28px;margin:6px 0 0">' + esc(s.player || "Aria") + '</h3><div style="color:var(--a2);font-family:var(--ui);letter-spacing:.14em;text-transform:uppercase">' + esc(s.title || "") + '</div><p style="color:var(--soft);max-width:44ch">Welcome to <b>' + esc(H.siteName()) + "</b>. Clear Math Dojo missions to earn XP, climb from Initiate to Master, unlock themes and sigils, and open the next chapter of <b>NULL MOON</b>.</p></div>";
    } }
  ];
  function wizard() {
    var s = H.get(), st = WIZ[wizStep], dots = WIZ.map(function (_, i) { return '<i class="' + (i <= wizStep ? "on" : "") + '"></i>'; }).join("");
    open('<div class="steps">' + dots + '</div><h2>' + st.h + '</h2>' + (st.lead ? '<p class="lead">' + st.lead + "</p>" : "") + '<div id="pane">' + st.body(s) + '</div><div class="sheet-foot">' +
      (wizStep ? '<button type="button" class="btn ghost" id="wBack">Back</button>' : "<span></span>") + '<button type="button" class="btn primary" id="wNext">' + (wizStep === WIZ.length - 1 ? "Enter" : "Next") + "</button></div>");
    $("wNext").onclick = function () {
      if (wizStep === 0) { var p = readIdentity(); if (!p.siteName) p.siteName = "Aria's Web"; if (!p.hubName) p.hubName = "Command Deck"; if (!p.player) p.player = "Aria"; H.set(p); }
      if (wizStep < WIZ.length - 1) { wizStep++; wizard(); return; }
      H.set({ setup: true }); H.markDay(); H.save(); close(); toast("Welcome, " + (H.get().player || "Aria"));
    };
    if ($("wBack")) $("wBack").onclick = function () { if (wizStep === 0) return; if (wizStep === 1) {} wizStep--; wizard(); };
    paneRefresher = function () { $("pane").innerHTML = WIZ[wizStep].body(H.get()); };
  }

  /* ---------- customize ---------- */
  var tab = "you", paneRefresher = null;
  var TABS = { you: ["Identity", identityHTML], theme: ["Theme", themeHTML], avatar: ["Avatar", avatarHTML], bg: ["Background", backgroundHTML] };
  function customize(which) {
    tab = which || tab;
    open('<h2>My Hub</h2><p class="lead">Change anything, anytime. Saved on this device.</p><div class="tabs">' + Object.keys(TABS).map(function (k) { return '<button type="button" data-tab="' + k + '" class="' + (k === tab ? "on" : "") + '">' + TABS[k][0] + "</button>"; }).join("") +
      '</div><div id="pane">' + TABS[tab][1](H.get()) + '</div><div class="sheet-foot"><button type="button" class="btn ghost" id="cReset">Start over</button><button type="button" class="btn primary" id="cDone">Done</button></div>');
    sheet.querySelectorAll("[data-tab]").forEach(function (b) { b.onclick = function () { customize(b.dataset.tab); }; });
    $("cDone").onclick = function () { var p = readIdentity(); if ($("fSite")) H.set(p); close(); };
    $("cReset").onclick = function () {
      if (!confirm("Start over? This clears your names, theme, avatar, XP, badges, and story progress on this iPad.")) return;
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
    open('<div class="ch-n">' + esc(STORY.title) + " · Chapter " + (i + 1) + '</div><h2>' + esc(c.title) + '<span class="jp">' + esc(c.jp) + "</span></h2>" + c.body.map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("") +
      '<div class="sheet-foot">' + (i > 0 ? '<button type="button" class="btn ghost" id="rPrev">← Ch ' + i + "</button>" : "<span></span>") +
      (i + 1 < s.chapters ? '<button type="button" class="btn primary" id="rNext">Ch ' + (i + 2) + " →</button>" : (i + 1 < STORY.chapters.length ? '<a class="btn primary" href="#mHead" id="rTrain">Next chapter: clear a round</a>' : '<button type="button" class="btn primary" id="rClose">Close</button>')) + "</div>", "reader");
    if ($("rPrev")) $("rPrev").onclick = function () { readChapter(i - 1); };
    if ($("rNext")) $("rNext").onclick = function () { readChapter(i + 1); };
    if ($("rTrain")) $("rTrain").onclick = function () { close(); };
    if ($("rClose")) $("rClose").onclick = close;
  }

  /* ---------- creations ---------- */
  function addCreation() {
    open('<h2>Add to My Creations</h2><p class="lead">Link a song, story, visual novel, or art you made (for example a Google Drive, Docs, or SoundCloud link).</p>' +
      '<label class="field"><span>Title</span><input type="text" id="crTitle" maxlength="48" placeholder="Midnight Signal (demo)"></label>' +
      '<label class="field"><span>Link</span><input type="url" id="crUrl" placeholder="https://…" inputmode="url" autocapitalize="off"></label>' +
      '<div class="field"><span>Type</span><div class="opt-row" id="crKind">' + ["Song", "Story", "Visual novel", "Art", "Other"].map(function (k, i) { return '<button type="button" class="opt txt' + (i ? "" : " sel") + '" data-kind="' + k + '">' + k + "</button>"; }).join("") + "</div></div>" +
      '<div class="sheet-foot"><button type="button" class="btn ghost" id="crCancel">Cancel</button><button type="button" class="btn primary" id="crSave">Add to shelf</button></div>');
    var kind = "Song";
    $("crKind").onclick = function (e) { var b = e.target.closest("[data-kind]"); if (!b) return; kind = b.dataset.kind; this.querySelectorAll(".opt").forEach(function (o) { o.classList.toggle("sel", o === b); }); };
    $("crCancel").onclick = close;
    $("crSave").onclick = function () {
      var t = $("crTitle").value.trim(), u = $("crUrl").value.trim();
      if (!t) { $("crTitle").focus(); return; }
      if (u && !/^https?:\/\//i.test(u)) u = "https://" + u;
      if (!/^https?:\/\/[^\s]+\.[^\s]+/i.test(u)) { toast("Paste a full link, like https://…"); $("crUrl").focus(); return; }
      var s = H.get(); s.creations.push({ title: t, url: u, kind: kind }); var got = H.checkBadges(); H.save(); close();
      toast(got.length ? "Badge earned: Creator" : "Added to your shelf");
    };
  }

  document.addEventListener("click", function (e) {
    var del = e.target.closest("[data-del]");
    if (del) { e.preventDefault(); e.stopPropagation(); var s = H.get(), i = Number(del.dataset.del); if (confirm("Remove \"" + s.creations[i].title + "\" from your shelf?")) { s.creations.splice(i, 1); H.save(); render(); } return; }
    if (e.target.closest("#addCreation")) { addCreation(); return; }
    var ch = e.target.closest("[data-ch]"); if (ch && !ch.disabled) { readChapter(Number(ch.dataset.ch)); return; }
  });
  $("openCustomize").onclick = function () { customize("you"); };
  $("heroAvatar").onclick = function () { customize("avatar"); };

  render();
  var s0 = H.get();
  if (!s0.setup) wizard();
  else { H.markDay(); H.save(); render(); }
  var q = new URLSearchParams(location.search);
  if (q.get("chapter") && s0.setup) readChapter(Number(q.get("chapter")) - 1);
})();
