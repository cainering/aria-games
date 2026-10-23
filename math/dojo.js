/* Math room screens: intro, 5-problem round, stuck helper, results. */
(function () {
  "use strict";
  var H = window.AriaHub, M = window.MathDojo, esc = H.esc, fmt = M.fmt;
  var app = document.getElementById("app"), $ = function (id) { return document.getElementById(id); };
  var game = new URLSearchParams(location.search).get("g");
  if (!M.GAMES[game]) game = "carry";
  var G = M.GAMES[game];
  $("gTitle").textContent = G.title; $("gSkill").textContent = G.skill;
  document.title = G.title + " · " + H.siteName();

  var GOOD = ["Yes.", "Exactly.", "That's it.", "Nice and steady.", "Right where it should be.", "Quietly correct."];
  var FIXED = ["Fixed it. Finding your own slip is the real skill.", "Found it and fixed it. That's the whole trick.", "There it is. Slip found, slip fixed."];
  var MISS = ["Not yet, and that's normal. ", "Close. Slips happen to everyone. ", "That's a fixable slip. ", "Good try. Let's look closer. "];
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }

  var R = null; // round state
  function newRound() {
    R = { problems: M.makeRound(game), pi: 0, xp: 0, asked: 0, fixed: 0, estimates: 0, clean: 0 };
    startProblem();
  }
  function prog() {
    var h = ""; for (var i = 0; i < 5; i++) h += '<i class="' + (R && i < R.pi ? "done" : R && i === R.pi ? "cur" : "") + '"></i>';
    $("prog").innerHTML = h; $("xpLive").textContent = "+" + (R ? R.xp : 0) + " xp";
  }
  function gain(n, el) {
    R.xp += n; prog();
    if (el && n > 0) { var r = el.getBoundingClientRect(), b = document.createElement("div"); b.className = "burst"; b.textContent = "+" + n + " xp"; b.style.left = (r.left + r.width / 2 - 30) + "px"; b.style.top = (r.top - 10) + "px"; document.body.appendChild(b); setTimeout(function () { b.remove(); }, 1000); }
  }

  /* ---------- intro ---------- */
  var TIPS = {
    carry: ["Estimate first so you know the target zone.", "Pick standard (carries shown) or the box method, which has no carrying at all.", "Check your answer against your estimate."],
    zeros: ["Cover the zeros to turn a big problem into a small fact.", "Count every zero you put back. That's where most slips happen.", "Multiply back to check. It takes two seconds."],
    order: ["( ) and [ ] first, innermost first.", "Then × and ÷, left to right.", "Then + and −, left to right. Watch for traps."],
    check: ["Round the numbers and make an estimate.", "Decide if someone else's answer is reasonable.", "If it isn't, find the slip and fix it."]
  };
  function intro() {
    R = null; prog();
    app.innerHTML = '<section class="panel intro"><div><div class="door-scene" aria-hidden="true"><div class="kj">' + G.kanji + '</div></div><div class="reading">' + esc(G.reading) + '</div></div><div><h1>' + esc(G.title) + '</h1><p class="sk">' + esc(G.skill) + "</p><p>" + esc(G.blurb) + "</p><ul>" + TIPS[game].map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") +
      '</ul><div class="calm">5 problems, easiest first, about 10 minutes. Slips never cost xp. Fixing one earns xp, and so does asking a precise question with <b>where am i stuck?</b></div><p class="whisper" style="margin:0 0 16px">' + esc(H.phrase()) + '</p><div class="row"><button type="button" class="btn primary" id="go">' + esc(H.lex().go) + '</button><a class="btn ghost" href="../index.html">' + esc(H.lex().back) + '</a></div></div></section>';
    $("go").onclick = newRound;
  }

  /* ---------- problem flow ---------- */
  var P, steps, si, st; // problem, step list, step index, per-step state
  function startProblem() {
    P = R.problems[R.pi]; steps = P.steps.slice(); si = 0; P._log = []; P._misses = 0;
    P._carriesShown = {}; P._rowsDone = {}; P._cells = {}; P._covered = { a: [], b: [] }; P._tokens = P.tokens ? P.tokens.slice() : null; P._history = []; P._lineFound = false;
    prog(); startStep();
  }
  function startStep() {
    st = { tries: 0, asked: {}, value: "", phase: "op", sel: null, revealed: false };
    var s = steps[si];
    if (s && s.type === "order") st.phase = "op";
    draw();
  }
  function cur() { return steps[si]; }

  function draw() {
    var s = cur();
    app.innerHTML = '<div class="play"><section class="panel board" id="board">' + boardHTML() + '</section><section class="panel ctrl" id="ctrl">' + ctrlHTML(s) + "</section></div>";
    wire(s);
  }

  /* --- board (left) --- */
  function boardHTML() {
    var s = cur(), h = '<div class="ptag">Problem ' + (R.pi + 1) + " / 5</div>";
    if (game === "check") h += '<div class="pdisplay story">' + esc(P.display) + "</div>";
    else if (game !== "order") h += '<div class="pdisplay">' + esc(P.display) + "</div>";
    if (game === "carry") h += carryBoard(s);
    if (game === "zeros") h += zerosBoard(s);
    if (game === "order") h += orderBoard(s);
    if (game === "check") h += checkBoard(s);
    if (P._log.length) h += '<ul class="log">' + P._log.map(function (l) { return "<li>" + esc(l) + "</li>"; }).join("") + "</ul>";
    return h;
  }
  function carryBoard(s) {
    var h = "";
    if (P._estDone) h += '<div class="est-chip">Target zone ≈ ' + fmt(P.estimate) + "</div>";
    if (P._method === "box") return h + boxBoard(s);
    if (!P._method) return h;
    var W = String(P.answer).length + 1, a = String(P.a), b = String(P.b);
    function line(str, cls, raw) { var arr = str.split(""); while (arr.length < W) arr.unshift(" "); return '<div class="ln ' + (cls || "") + '">' + arr.map(function (c) { return raw ? c : "<span" + (c === "?" ? ' class="q"' : "") + ">" + (c === " " ? "&nbsp;" : esc(c)) + "</span>"; }).join("") + "</div>"; }
    var rows = P.methods.standard.filter(function (x) { return x.row !== undefined; });
    var active = s && s.row !== undefined ? s : null;
    var cr = active ? active : rows.filter(function (r) { return P._rowsDone[r.row]; }).slice(-1)[0];
    var carryCells = [];
    if (cr) { var cs = cr.carries, show = P._carriesShown[cr.row] || P._rowsDone[cr.row]; for (var i = 0; i < W; i++) { var col = W - 1 - i, v = col < a.length ? cs[col] : 0; carryCells.push('<span class="' + (show && v ? "" : "hide") + '">' + (v || "&nbsp;") + "</span>"); } }
    var out = '<div class="cols" aria-label="Column multiplication">';
    out += '<div class="ln carry">' + (carryCells.join("") || "") + "</div>";
    out += line(a) + line("×" + " ".repeat(Math.max(0, W - b.length - 1)) + b) + '<div class="ln rule" style="grid-column:1/-1"></div>';
    rows.forEach(function (r) {
      var txt, cls;
      if (P._rowsDone[r.row]) { txt = String(r.answer); cls = "done"; }
      else if (active && active.row === r.row) { txt = st.value || "?"; cls = "cur"; }
      else { txt = "?"; cls = "pend"; }
      out += line(txt, cls);
    });
    if (rows.length > 1) {
      var sumStep = P.methods.standard[P.methods.standard.length - 1];
      out += '<div class="ln rule"></div>' + line(P._sumDone ? String(P.answer) : (s === sumStep ? (st.value || "?") : "?"), P._sumDone ? "done" : s === sumStep ? "cur" : "pend");
    }
    return h + out + "</div>";
  }
  function boxBoard(s) {
    var t = '<table class="boxgrid"><tr><th>×</th>' + P.aParts.map(function (x) { return "<th>" + fmt(x) + "</th>"; }).join("") + "</tr>";
    P.bParts.forEach(function (bp, r) {
      t += "<tr><th>" + fmt(bp) + "</th>" + P.aParts.map(function (ap, c) {
        var id = "cell" + r + "_" + c, done = P._cells[id] != null, isCur = s && s.id === id;
        return '<td class="' + (done ? "done" : isCur ? "cur" : "pend") + '">' + (done ? fmt(P._cells[id]) : isCur ? (st.value ? fmt(Number(st.value)) : "?") : "") + "</td>";
      }).join("") + "</tr>";
    });
    t += "</table>";
    if (P._sumDone) t += '<div class="simpl">Total = ' + fmt(P.answer) + "</div>";
    return t;
  }
  function zerosBoard(s) {
    var cover = s && s.type === "zeros";
    function num(v, side) {
      var str = String(v), tz = (str.match(/0+$/) || [""])[0].length, h = '<span class="znum">';
      var done = P._zeroDone;
      str.split("").forEach(function (ch, i) {
        var isTZ = i >= str.length - tz, idx = str.length - 1 - i;
        if (isTZ) { var cov = P._covered[side].indexOf(idx) >= 0; h += '<button type="button" class="z' + (cov ? " cov" : "") + '" data-z="' + side + '" data-i="' + idx + '"' + (cover && !done ? "" : " disabled") + ' aria-label="zero">0</button>'; }
        else h += '<span class="d">' + ch + "</span>";
      });
      return h + "</span>";
    }
    var h = '<div class="znums">' + num(P.a, "a") + '<span>' + (P.kind === "mul" ? "×" : "÷") + "</span>" + num(P.b, "b") + "</div>";
    var n = P._covered.a.length + P._covered.b.length;
    if (P.kind === "mul") h += '<div class="zbank">Zero Bank <b>' + ("0".repeat(n) || "—") + "</b></div>";
    if (P._zeroDone) {
      var ca = P.a / Math.pow(10, P._covered.a.length), cb = P.b / Math.pow(10, P._covered.b.length);
      h += '<div class="simpl">' + (P.kind === "mul" ? fmt(ca) + " × " + fmt(cb) + " , then add " + n + " zero" + (n === 1 ? "" : "s") : fmt(ca) + " ÷ " + fmt(cb)) + "</div>";
    }
    return h;
  }
  function orderBoard(s) {
    var t = P._tokens, valid = t.length > 1 ? M.validOps(t) : [], sel = st.sel;
    var h = '<div class="expr" aria-label="Expression">';
    t.forEach(function (tok, i) {
      var inSel = sel != null && (i === sel - 1 || i === sel || i === sel + 1);
      if (typeof tok === "number") h += '<span class="num' + (inSel ? " hl" : "") + '">' + tok + "</span>";
      else if (/[+\-×÷]/.test(tok) && tok.length === 1) h += '<button type="button" class="op' + (inSel ? " hl" : "") + '" data-op="' + i + '"' + (st.phase === "op" && t.length > 1 ? "" : " disabled") + ' aria-label="' + ({ "+": "plus", "-": "minus", "×": "times", "÷": "divided by" })[tok] + '">' + (tok === "-" ? "−" : tok) + "</button>";
      else h += '<span class="par">' + tok + "</span>";
    });
    h += "</div>";
    if (P._history.length) h += '<ul class="history">' + P._history.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>";
    if (t.length === 1) h += '<div class="simpl">= ' + t[0] + "</div>";
    return h;
  }
  function checkBoard(s) {
    var tapping = s && s.type === "line" && !P._lineFound;
    var h = "";
    if (P._estDone && !P.division) h += '<div class="est-chip">Estimate ≈ ' + fmt(P.estimate) + "</div>";
    h += '<div class="work"><div class="who">' + esc(P.who) + "'s work</div>" + P.work.map(function (l, i) {
      return '<button type="button" class="wl' + (tapping ? " tap" : "") + (P._lineFound && i === P.slipLine ? " found" : "") + '" data-line="' + i + '"' + (tapping ? "" : " disabled") + ">" + esc(l) + "</button>";
    }).join("") + "</div>";
    return h;
  }

  /* --- control (right) --- */
  function ctrlHTML(s) {
    if (!s) return "";
    var h = '<p class="prompt" id="prompt">' + esc(promptFor(s)) + "</p>";
    if (s.type === "choice") h += '<div class="choices">' + s.options.map(function (o, i) { return '<button type="button" data-c="' + i + '">' + esc(o.label) + "</button>"; }).join("") + "</div>";
    if (needsPad(s)) h += '<div class="entry" id="entry" aria-live="polite"><span id="ev">' + (st.value ? fmt(Number(st.value)) : "") + '</span><span class="cursor"></span></div><div class="pad" id="pad">' + [1, 2, 3, 4, 5, 6, 7, 8, 9].map(function (n) { return '<button type="button" data-k="' + n + '">' + n + "</button>"; }).join("") + '<button type="button" data-k="del" aria-label="Delete">⌫</button><button type="button" data-k="0">0</button><button type="button" data-k="ok" class="ok">Check</button></div>';
    if (s.type === "zeros") h += '<div class="row"><button type="button" class="btn primary" id="zDone">Done covering</button><button type="button" class="btn ghost" id="zReset">Reset</button></div>';
    h += '<div class="fb" id="fb" role="status"></div><div class="tools"><button type="button" class="btn ghost stuck-btn" id="stuckBtn">where am i stuck?</button>';
    if (s.row !== undefined) h += '<button type="button" class="btn ghost" id="carryBtn">show carries</button>';
    h += '<button type="button" class="btn ghost" id="revealBtn" hidden>show me this step</button></div>';
    return h;
  }
  function needsPad(s) { return s.type === "number" || (s.type === "order" && st.phase === "calc"); }
  function promptFor(s) {
    if (s.type === "order") {
      if (P._tokens.length === 1) return "Solved.";
      if (st.phase === "calc") { var t = P._tokens, i = st.sel; return "Now compute it: " + t[i - 1] + " " + (t[i] === "-" ? "−" : t[i]) + " " + t[i + 1] + " = ?"; }
      return P._history.length ? "Next: tap the operation that goes now." : "Tap the operation that goes first.";
    }
    return s.prompt;
  }

  function fb(kind, html) { var el = $("fb"); if (!el) return; el.className = "fb show " + kind; el.innerHTML = html; }

  function wire(s) {
    if (!s) return;
    var ctrl = $("ctrl"), board = $("board");
    ctrl.querySelectorAll("[data-c]").forEach(function (b) { b.onclick = function () { onChoice(s, Number(b.dataset.c), b); }; });
    if ($("pad")) $("pad").onclick = function (e) { var b = e.target.closest("[data-k]"); if (b) key(b.dataset.k, b); };
    if ($("zDone")) $("zDone").onclick = function () { onZerosDone(s); };
    if ($("zReset")) $("zReset").onclick = function () { P._covered = { a: [], b: [] }; redrawBoard(); };
    board.querySelectorAll("[data-z]").forEach(function (b) { b.onclick = function () { var side = b.dataset.z, i = Number(b.dataset.i), arr = P._covered[side], k = arr.indexOf(i); if (k >= 0) arr.splice(k, 1); else arr.push(i); redrawBoard(); }; });
    board.querySelectorAll("[data-op]").forEach(function (b) { b.onclick = function () { onOp(s, Number(b.dataset.op), b); }; });
    board.querySelectorAll("[data-line]").forEach(function (b) { b.onclick = function () { onLine(s, Number(b.dataset.line), b); }; });
    $("stuckBtn").onclick = openStuck;
    if ($("carryBtn")) $("carryBtn").onclick = function () { P._carriesShown[s.row] = true; redrawBoard(); fb("hint", "The little numbers above are the carries for × " + s.digit + ". Add each one after you multiply the digit below it."); };
    $("revealBtn").onclick = function () { reveal(s); };
    if (st.tries >= 2) $("revealBtn").hidden = false;
  }
  function redrawBoard() { var b = $("board"); b.innerHTML = boardHTML(); wire2(); }
  function wire2() {
    var s = cur(), board = $("board");
    board.querySelectorAll("[data-z]").forEach(function (b) { b.onclick = function () { var side = b.dataset.z, i = Number(b.dataset.i), arr = P._covered[side], k = arr.indexOf(i); if (k >= 0) arr.splice(k, 1); else arr.push(i); redrawBoard(); }; });
    board.querySelectorAll("[data-op]").forEach(function (b) { b.onclick = function () { onOp(s, Number(b.dataset.op), b); }; });
    board.querySelectorAll("[data-line]").forEach(function (b) { b.onclick = function () { onLine(s, Number(b.dataset.line), b); }; });
  }

  document.addEventListener("keydown", function (e) {
    if (!R || !$("pad") || !$("stuck").hidden) return;
    if (/^[0-9]$/.test(e.key)) key(e.key); else if (e.key === "Backspace") key("del"); else if (e.key === "Enter") key("ok");
  });
  function key(k, el) {
    var s = cur(); if (!s) return;
    if (k === "del") st.value = st.value.slice(0, -1);
    else if (k === "ok") { if (st.value) submitNumber(s, Number(st.value), el); return; }
    else if (st.value.length < 9) st.value = (st.value === "0" ? "" : st.value) + k;
    $("ev").textContent = st.value ? fmt(Number(st.value)) : "";
    if (game === "carry") redrawBoard();
  }

  /* ---------- answers ---------- */
  function correct(s, el, note) {
    var x = st.revealed ? 1 : st.tries === 0 ? 4 : 3;
    if (st.tries > 0 && !st.revealed) R.fixed++;
    if (st.tries === 0 && (s.id === "estimate" || s.id === "round")) R.estimates++;
    if (st.tries === 0 && !st.revealed) P._cleanSteps = (P._cleanSteps || 0) + 1; else P._hadSlip = true;
    gain(x, el);
    var msg = st.revealed ? "Got it. Now you've seen how it works." : st.tries ? pick(FIXED) : pick(GOOD);
    fb("good", esc(msg) + (note ? " " + esc(note) : ""));
  }
  function miss(s, text) {
    st.tries++; P._misses++;
    fb("miss", esc(pick(MISS)) + esc(text || ""));
    if (st.tries >= 2) $("revealBtn").hidden = false;
  }
  function advance(delay) {
    setTimeout(function () {
      si++;
      if (si >= steps.length) return problemDone();
      startStep();
    }, delay == null ? 900 : delay);
  }

  function onChoice(s, i, btn) {
    var o = s.options[i];
    if (!o.correct) { btn.classList.add("no"); btn.disabled = true; miss(s, explainChoice(s)); return; }
    btn.classList.add("ok"); $("ctrl").querySelectorAll("[data-c]").forEach(function (b) { b.disabled = true; });
    if (s.method) { P._method = o.value; steps = steps.concat(P.methods[o.value]); P._log.push("Method: " + (o.value === "box" ? "box (no carrying)" : "standard with carries")); fb("good", o.value === "box" ? "Box method: split by place value, fill each box, then add them up." : "Standard: one row per digit. Carries are shown above."); gain(1, btn); advance(700); return; }
    correct(s, btn, s.after || "");
    if (s.id === "estimate") P._estDone = true;
    if (s.id === "round") P._log.push("Rounded: " + o.label);
    if (s.after) P._log.push(s.after);
    advance(s.after ? 1500 : 900);
  }
  function explainChoice(s) {
    if (s.id === "estimate" || s.id === "round") return "Count the zeros in each option. Which one is the right size?";
    if (s.id === "reasonable") return "Compare the two numbers. Same number of digits? Similar first digits?";
    return "Try another one.";
  }

  function submitNumber(s, v, el) {
    if (s.type === "order") return submitOrderCalc(s, v, el);
    if (v === s.answer) {
      var note = "";
      if (s.row !== undefined) { P._rowsDone[s.row] = true; P._log.push("Row: " + fmt(P.a) + " × " + fmt(s.digit * Math.pow(10, s.row)) + " = " + fmt(s.answer)); }
      if (s.cell) P._cells[s.id] = v;
      if (s.id === "sum" || s.id === "boxsum") P._sumDone = true;
      if (game === "carry" && (s.id === "sum" || s.id === "boxsum" || (P.b < 10 && s.row === 0))) {
        P._sumDone = true;
        var ratio = s.answer / P.estimate;
        note = fmt(s.answer) + " vs target zone " + fmt(P.estimate) + ": " + (ratio > 0.75 && ratio < 1.33 ? "close, so it's reasonable. ✓" : "check it.");
        P._log.push("Answer " + fmt(s.answer) + ", near the estimate " + fmt(P.estimate) + " ✓");
      }
      if (game === "zeros") {
        if (s.id === "core") P._log.push((P.kind === "div" ? "Covered the same zeros: " : "Basic fact: ") + s.prompt.replace(/^.*?: /, "").replace(" = ?", "") + " = " + fmt(v) + (P.kind === "div" ? ", so " + P.display + " = " + fmt(v) : ""));
        if (s.id === "final") P._log.push(P.display + " = " + fmt(v));
        if (s.id === "checkback") { note = "Multiply-back matches. ✓ Checked."; P._log.push("Check: " + s.prompt.replace(/^.*?: /, "").replace(" = ?", "") + " = " + fmt(v) + " ✓"); }
      }
      if (game === "check" && s.id === "fix") { note = "You caught " + P.who + "'s slip and fixed it."; P._log.push("Correct answer: " + fmt(v)); }
      correct(s, el, note);
      st.value = "";
      if (game === "carry") redrawBoard();
      $("pad").querySelectorAll("button").forEach(function (b) { b.disabled = true; });
      advance(note ? 1600 : 900);
    } else {
      var d = s.diagnose ? s.diagnose(v) : "";
      st.value = "";
      $("ev").textContent = "";
      if (game === "carry") redrawBoard();
      miss(s, d || "Try this step again, slowly.");
    }
  }

  function onZerosDone(s) {
    var ca = P._covered.a.length, cb = P._covered.b.length;
    if (s.mode === "mul") {
      if (ca === s.need.a && cb === s.need.b) { P._zeroDone = true; P._log.push("Banked " + (ca + cb) + " zeros"); correct(s, $("zDone")); redrawBoard(); $("zDone").disabled = true; advance(1000); }
      else if (ca + cb < s.need.a + s.need.b) miss(s, "There are more zeros at the ends. Check both numbers.");
      else miss(s, "Only zeros at the very end count.");
    } else {
      if (ca === cb && cb === s.need.b) { P._zeroDone = true; P._log.push("Covered " + cb + " zero" + (cb === 1 ? "" : "s") + " on each side"); correct(s, $("zDone"), "Same zeros covered on both sides, so the answer doesn't change."); redrawBoard(); $("zDone").disabled = true; advance(1300); }
      else if (ca !== cb) miss(s, "Cover the same number of zeros on both numbers. Right now it's " + ca + " and " + cb + ".");
      else miss(s, "Cover all the zeros at the end of " + fmt(P.b) + ", and the same number on " + fmt(P.a) + ".");
    }
  }

  function onOp(s, i, btn) {
    if (st.phase !== "op") return;
    var v = M.validOps(P._tokens);
    if (v.indexOf(i) < 0) { btn.classList.add("miss"); st.tries++; P._misses++; P._hadSlip = true; fb("miss", esc(pick(MISS)) + esc(M.whyNot(P._tokens, i))); if (st.tries >= 2) $("revealBtn").hidden = false; return; }
    if (st.tries > 0) { R.fixed++; gain(2, btn); } else gain(2, btn);
    st.sel = i; st.phase = "calc"; st.tries = 0;
    var keepFb = "Right move. " + (P._tokens.some(function (t) { return t === "(" || t === "["; }) ? "Grouping first." : PREC(P._tokens[i]) === 2 ? "× and ÷ before + and −." : "Left to right.");
    draw(); fb("good", esc(keepFb));
  }
  function PREC(op) { return op === "×" || op === "÷" ? 2 : 1; }
  function submitOrderCalc(s, v, el) {
    var r = M.applyOp(P._tokens, st.sel);
    if (v === r.result) {
      if (st.tries > 0) R.fixed++;
      gain(st.tries ? 3 : 4, el);
      P._history.push(r.a + " " + (r.op === "-" ? "−" : r.op) + " " + r.b + " = " + r.result);
      P._tokens = r.tokens; st.sel = null; st.phase = "op"; st.tries = 0; st.value = "";
      if (P._tokens.length === 1) {
        P._log.push("Answer: " + P._tokens[0] + (P.leftToRight !== P.answer ? ". Straight left to right would have given " + P.leftToRight + ": that's the trap you dodged." : ""));
        draw(); fb("good", esc(pick(GOOD)) + " " + esc(P.trapNote || "")); advance(1800);
      } else { draw(); fb("good", esc(pick(GOOD)) + " Next move."); }
    } else { st.value = ""; $("ev").textContent = ""; miss(s, "Compute just " + r.a + " " + (r.op === "-" ? "−" : r.op) + " " + r.b + "."); }
  }

  function onLine(s, i, btn) {
    if (i === s.answer) { P._lineFound = true; P._log.push("Slip found: " + s.after); correct(s, btn, s.after); redrawBoard(); advance(1800); }
    else { btn.disabled = true; miss(s, "That line checks out. Look at the next one."); }
  }

  function reveal(s) {
    st.revealed = true; P._hadSlip = true;
    if (s.type === "choice") { var i = s.options.findIndex(function (o) { return o.correct; }); var b = $("ctrl").querySelector('[data-c="' + i + '"]'); fb("hint", "The answer is <b>" + esc(s.options[i].label) + "</b>. " + esc((s.hints && s.hints.here) || "")); setTimeout(function () { onChoice(s, i, b); }, 1600); return; }
    if (s.type === "number") { fb("hint", esc((s.hints && s.hints.here) || "") + " The answer is <b>" + fmt(s.answer) + "</b>. Type it in to lock it."); return; }
    if (s.type === "zeros") { P._covered = { a: [], b: [] }; for (var k = 0; k < s.need.a; k++) P._covered.a.push(k); for (k = 0; k < s.need.b; k++) P._covered.b.push(k); redrawBoard(); fb("hint", esc(s.hints.here) + " Now tap Done covering."); return; }
    if (s.type === "line") { var b2 = $("board").querySelector('[data-line="' + s.answer + '"]'); onLine(s, s.answer, b2); return; }
    if (s.type === "order") {
      if (st.phase === "op") { var v = M.validOps(P._tokens)[0]; fb("hint", "This one goes first: " + P._tokens[v - 1] + " " + (P._tokens[v] === "-" ? "−" : P._tokens[v]) + " " + P._tokens[v + 1] + ". Tap it."); var ob = $("board").querySelector('[data-op="' + v + '"]'); if (ob) ob.classList.add("hl"); }
      else { var r = M.applyOp(P._tokens, st.sel); fb("hint", "It's <b>" + r.result + "</b>. Type it in."); }
    }
  }

  /* ---------- stuck helper ---------- */
  function openStuck() { $("stuck").hidden = false; }
  $("stuckClose").onclick = function () { $("stuck").hidden = true; };
  $("stuck").addEventListener("click", function (e) { if (e.target.id === "stuck") $("stuck").hidden = true; });
  document.querySelectorAll(".phrases [data-k]").forEach(function (b) {
    b.onclick = function () {
      $("stuck").hidden = true;
      var s = cur(), k = b.dataset.k, said = b.querySelector("b").textContent, hint = hintFor(s, k);
      if (!st.asked[k]) { st.asked[k] = 1; R.asked++; gain(2, $("stuckBtn")); }
      if (s.row !== undefined && k === "here") { P._carriesShown[s.row] = true; redrawBoard(); }
      fb("hint", '<span class="said">' + esc(said) + "</span>" + esc(hint) + '<br><small style="color:var(--soft)">Asking exactly where you\'re stuck: +2 xp.</small>');
    };
  });
  function hintFor(s, k) {
    if (s.type === "order") {
      var t = P._tokens;
      if (st.phase === "calc") { var r = M.applyOp(t, st.sel); return { here: "Just this piece: " + r.a + " " + (r.op === "-" ? "−" : r.op) + " " + r.b + ". Ignore the rest for now.", start: "Look only at the highlighted numbers.", example: "Example: in 20 − 3 × 4, the piece 3 × 4 = 12.", check: "Does your number make sense? " + (r.op === "×" ? "Times makes it bigger." : r.op === "÷" ? "Divide makes it smaller." : r.op === "+" ? "Plus makes it bigger." : "Minus makes it smaller.") }[k]; }
      var hasG = t.some(function (x) { return x === "(" || x === "["; }), hasMD = t.some(function (x) { return x === "×" || x === "÷"; });
      if (k === "here") return hasG ? "There's a group in brackets. Anything inside ( ) or [ ] goes first. If there's a ( ) inside a [ ], start with the ( )." : hasMD ? "No brackets left. Look for × or ÷. They outrank + and −. If there are two, do the left one first." : "Only + and − are left. Go left to right.";
      return s.hints[k];
    }
    return (s.hints && s.hints[k]) || "Try the smallest piece of this step first.";
  }

  /* ---------- problem / round done ---------- */
  function problemDone() {
    R.xp += 10;
    if (!P._hadSlip) R.clean++;
    R.pi++;
    prog();
    var more = R.pi < 5;
    var msg = P._hadSlip ? "Done. You hit a slip and worked through it, which is exactly how this gets easier." : "Clean run on that one.";
    $("ctrl").innerHTML = '<p class="prompt">Problem ' + R.pi + " done. +10 xp</p><p style=\"color:var(--soft)\">" + esc(msg) + '</p><button type="button" class="btn primary" id="nextP">' + (more ? "next problem →" : "finish the round") + "</button>";
    $("nextP").onclick = function () { if (more) startProblem(); else roundDone(); };
    $("nextP").focus();
  }
  function roundDone() {
    R.xp += 25;
    var res = H.finishRound(game, { xp: R.xp, asked: R.asked, fixed: R.fixed, estimates: R.estimates, clean: R.clean });
    var ri = H.rankInfo(res.totalXp), story = window.ARIA_STORY;
    prog();
    var rw = "";
    if (res.chapter) rw += "<div><b>a chapter opened</b>null moon · chapter " + res.chapter + ": " + esc(story.chapters[res.chapter - 1].title) + "</div>";
    if (res.rankUp) rw += "<div><b>something shifted</b>you are " + esc(res.rankUp.jp) + " · " + esc(res.rankUp.name) + " now</div>";
    res.badges.forEach(function (b) { rw += "<div><b>keepsake found</b>" + b.icon + " " + esc(b.name) + ": " + esc(b.about) + "</div>"; });
    res.unlocks.forEach(function (u) { rw += "<div><b>drifted in</b>" + esc(u) + "</div>"; });
    if (R.fixed) rw += "<div><b>slips fixed</b>" + R.fixed + ". Every one of those is a skill you used.</div>";
    if (R.asked) rw += "<div><b>questions asked</b>" + R.asked + ". Precise questions are how experts learn.</div>";
    app.innerHTML = '<section class="panel done-card"><p class="ptag">' + esc(G.title) + ' · round finished</p><h1 class="big">' + esc(H.lex().done) + '</h1><div class="xpg">+' + res.xp + " xp</div>" +
      '<div class="xpbar" style="max-width:520px;margin:0 auto 22px"><div class="track"><div class="fill" id="dfill"></div></div><div class="lbl"><span>' + esc(ri.rank.jp + " · " + ri.rank.name) + " · " + res.totalXp + " xp</span><span>" + (ri.next ? ri.toNext + " xp to " + esc(ri.next.jp + " · " + ri.next.name) : "the last rank") + "</span></div></div>" +
      '<div class="rewards">' + rw + '</div><div class="row">' + (res.chapter ? '<a class="btn primary" href="../index.html?chapter=' + res.chapter + '">read chapter ' + res.chapter + "</a>" : "") +
      '<button type="button" class="btn' + (res.chapter ? " ghost" : " primary") + '" id="again">another round</button><a class="btn ghost" href="../index.html">' + esc(H.lex().back) + '</a></div></section>';
    requestAnimationFrame(function () { setTimeout(function () { $("dfill").style.width = ri.pct + "%"; }, 60); });
    $("again").onclick = newRound;
  }

  intro();
  window.__dojo = { state: function () { return { R: R, P: P, steps: steps, si: si, st: st }; }, key: key, submit: function (v) { submitNumber(cur(), v); } };
})();
