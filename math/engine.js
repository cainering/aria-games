/* Math Dojo engine: builds 5-problem rounds for the four games.
   Pure logic, no DOM, so tests/math-games.test.js can check every answer.
   Games: carry (multi-digit multiplication), zeros (place value with 10s),
   order (order of operations), check (estimate and check a student's work). */
(function (root) {
  "use strict";

  function fmt(n) { return Number(n).toLocaleString("en-US"); }
  function mkRng(seed) {
    if (seed == null) return Math.random;
    var s = seed >>> 0;
    return function () { s = (s + 0x6D2B79F5) >>> 0; var t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  function ri(rng, lo, hi) { return lo + Math.floor(rng() * (hi - lo + 1)); }
  function pick(rng, arr) { return arr[Math.floor(rng() * arr.length)]; }
  function shuffle(rng, arr) { var a = arr.slice(), i, j, t; for (i = a.length - 1; i > 0; i--) { j = Math.floor(rng() * (i + 1)); t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function digits(n) { return String(n).split("").map(Number); }
  var PLACE = ["ones", "tens", "hundreds", "thousands", "ten-thousands", "hundred-thousands", "millions", "ten-millions"];

  /* carries when multiplying a by one digit d: carries[i] is the carry INTO column i (0 = ones). */
  function carriesFor(a, d) {
    var ds = digits(a).reverse(), out = [0], c = 0, i;
    for (i = 0; i < ds.length; i++) { var p = ds[i] * d + c; c = Math.floor(p / 10); out.push(c); }
    return out; // length ds.length+1; out[i] = carry into column i
  }
  function countCarries(a, d) { return carriesFor(a, d).slice(1, -1).filter(function (c) { return c > 0; }).length; }

  /* Compare a typed number to the right one, column by column from the ones place. */
  function firstWrongPlace(got, want) {
    var g = String(Math.max(0, Math.floor(got))).split("").reverse(), w = String(want).split("").reverse(), i;
    for (i = 0; i < Math.max(g.length, w.length); i++) if (g[i] !== w[i]) return i;
    return -1;
  }
  function zeroSlip(got, want) {
    if (want !== 0 && got === want * 10) return "So close: every digit is right, but there's one zero too many. Count the zeros again.";
    if (want !== 0 && got * 10 === want) return "So close: every digit is right, but one zero is missing. Count the zeros again.";
    if (want !== 0 && got === want * 100) return "The digits are right but there are two extra zeros. Count them again.";
    if (want !== 0 && got * 100 === want) return "The digits are right but two zeros went missing. Count them again.";
    return "";
  }

  /* Diagnose a multiplication row a x d (d one digit, shift = trailing zeros). */
  function rowDiagnose(a, d, shift) {
    var want = a * d * Math.pow(10, shift);
    return function (got) {
      var z = zeroSlip(got, want); if (z) return z;
      var col = firstWrongPlace(got, want);
      if (col < 0) return "";
      if (col < shift) return "Start with the placeholder zero" + (shift > 1 ? "s" : "") + " in the ones place, because you're multiplying by " + fmt(d * Math.pow(10, shift)) + ".";
      var k = col - shift, ds = digits(a).reverse(), cs = carriesFor(a, d);
      if (k >= ds.length) return "Everything up to the last column is right. Don't forget to write the final carry (" + cs[ds.length] + ") at the front.";
      var prod = ds[k] * d, carryIn = cs[k], tot = prod + carryIn;
      var msg = (col > 0 ? "Your digits up to the " + PLACE[col - 1] + " place are right. " : "") + "Check the " + PLACE[col] + " column: " + ds[k] + " × " + d + " = " + prod;
      if (carryIn) msg += ", plus the carried " + carryIn + " makes " + tot;
      msg += ". Write " + (tot % 10) + (Math.floor(tot / 10) ? " and carry " + Math.floor(tot / 10) : "") + ".";
      return msg;
    };
  }
  function sumDiagnose(want, parts) {
    return function (got) {
      var z = zeroSlip(got, want); if (z) return z;
      var col = firstWrongPlace(got, want);
      if (col < 0) return "";
      return "Line the numbers up by place value and add column by column from the right. Check the " + PLACE[col] + " column" + (col > 0 ? " and any carry coming in from the " + PLACE[col - 1] : "") + ".";
    };
  }
  function genericDiagnose(want) {
    return function (got) { var z = zeroSlip(got, want); if (z) return z; return "Not yet, and that's okay. Redo this one small step slowly."; };
  }

  function leadRound(a) { var p = Math.pow(10, String(a).length - 1); return Math.round(a / p) * p; }

  /* ---------------- (a) Carry Chain ---------------- */
  function carryProblem(rng, level) {
    var a, b, tries = 0;
    for (;;) {
      tries++;
      if (level === 0) { a = ri(rng, 120, 899); b = ri(rng, 4, 9); }
      else if (level === 1) { a = ri(rng, 1, 9) * 1000 + ri(rng, 0, 9) * 10 + ri(rng, 1, 9); if (rng() < 0.5) a += ri(rng, 1, 9) * 100; b = ri(rng, 4, 9); }
      else if (level === 2) { a = ri(rng, 120, 899); b = ri(rng, 12, 29); }
      else if (level === 3) { a = ri(rng, 1010, 4999); b = ri(rng, 11, 29); }
      else { a = ri(rng, 2100, 9899); b = ri(rng, 31, 89); }
      var ones = b % 10, ra = leadRound(a);
      if (b >= 10 && ones === 0) continue;
      if (countCarries(a, ones) < 2 && tries < 200) continue;
      if (Math.abs(ra - a) / a > 0.2 && tries < 200) continue;
      break;
    }
    var answer = a * b, ra2 = leadRound(a), est = ra2 * b;
    var bDigits = digits(b).reverse(); // [ones, tens]
    var p = {
      game: "carry", a: a, b: b, answer: answer, estimate: est, rounded: ra2,
      display: fmt(a) + " × " + b, steps: [], methods: {}
    };
    // Step 1: estimate first
    p.steps.push({
      type: "choice", id: "estimate",
      prompt: "Estimate first. " + fmt(a) + " is about " + fmt(ra2) + ", so " + fmt(a) + " × " + b + " is about…",
      options: shuffle(rng, [est, est * 10, est / 10]).map(function (v) { return { label: fmt(v), correct: v === est }; }),
      after: "Target zone: about " + fmt(est) + ". Your real answer should land near it.",
      hints: {
        here: "Multiply the easy numbers: " + fmt(ra2) + " × " + b + ". Do " + String(ra2).replace(/0+$/, "") + " × " + b + " = " + fmt(Number(String(ra2).replace(/0+$/, "")) * b) + ", then stick the " + (String(ra2).match(/0+$/) || [""])[0].length + " zero(s) back on.",
        start: "Round the big number to its first digit: " + fmt(a) + " → " + fmt(ra2) + ". Then multiply that by " + b + ".",
        example: "Example: 4,180 × 23. 4,180 is about 4,000. 4 × 23 = 92, add three zeros: about 92,000.",
        check: "Your estimate should have about the same number of digits as " + fmt(ra2) + " × " + b + ". Count the zeros."
      }
    });
    p.steps.push({
      type: "choice", id: "method", method: true,
      prompt: "Pick your method.",
      options: [{ label: "Standard (show carries)", value: "standard", correct: true }, { label: "Box method (no carrying)", value: "box", correct: true }],
      hints: {
        here: "Both work. The box method splits the numbers by place value, so there's nothing to carry.",
        start: "If carrying keeps tripping you up, try the box method this time.",
        example: "Box method: 24 × 6 = (20 × 6) + (4 × 6) = 120 + 24 = 144.",
        check: "Either method gives the same answer."
      }
    });
    // Standard
    var std = [];
    var rows = [];
    bDigits.forEach(function (d, shift) {
      var val = a * d * Math.pow(10, shift);
      rows.push(val);
      var mult = d * Math.pow(10, shift);
      std.push({
        type: "number", id: "row" + shift, row: shift, digit: d, answer: val,
        prompt: shift === 0 ? (bDigits.length > 1 ? "Row 1: " + fmt(a) + " × " + d + " (the ones digit of " + b + ")" : fmt(a) + " × " + d) : "Row 2: " + fmt(a) + " × " + fmt(mult) + ". Put a 0 in the ones place first, then multiply by " + d + ".",
        diagnose: rowDiagnose(a, d, shift),
        carries: carriesFor(a, d),
        hints: {
          here: "Go one column at a time from the right. Multiply the digit by " + d + ", add the little carry above it, write the ones digit, and carry the tens digit. Tap \"Show carries\" to see them.",
          start: shift === 0 ? "Start at the ones: " + (a % 10) + " × " + d + " = " + ((a % 10) * d) + ". Write " + ((a % 10) * d % 10) + (Math.floor((a % 10) * d / 10) ? " and carry " + Math.floor((a % 10) * d / 10) : "") + "." : "Write a 0 in the ones place first. Then " + (a % 10) + " × " + d + " = " + ((a % 10) * d) + " goes in the tens place.",
          example: "Example: 347 × 6. 7×6=42: write 2, carry 4. 4×6=24, +4 = 28: write 8, carry 2. 3×6=18, +2 = 20: write 20. Answer 2,082.",
          check: "Quick check: " + fmt(a) + " × " + d + " should be about " + fmt(leadRound(a) * d * Math.pow(10, shift)) + ". The last digit must be " + ((a % 10) * d % 10) + (shift ? " followed by the zero" : "") + "."
        }
      });
    });
    if (bDigits.length > 1) {
      std.push({
        type: "number", id: "sum", answer: answer,
        prompt: "Add the rows: " + fmt(rows[0]) + " + " + fmt(rows[1]),
        diagnose: sumDiagnose(answer, rows),
        hints: {
          here: "Add column by column from the right, carrying when a column passes 9.",
          start: "Ones first: " + (rows[0] % 10) + " + " + (rows[1] % 10) + ".",
          example: "Example: 2,082 + 6,940 = 9,022.",
          check: "The total should be near your estimate of " + fmt(est) + "."
        }
      });
    }
    p.methods.standard = std;
    // Box
    var aParts = digits(a).map(function (d, i, arr) { return d * Math.pow(10, arr.length - 1 - i); }).filter(function (v) { return v > 0; });
    var bParts = digits(b).map(function (d, i, arr) { return d * Math.pow(10, arr.length - 1 - i); }).filter(function (v) { return v > 0; });
    var box = [], cells = [];
    bParts.forEach(function (bp, r) {
      aParts.forEach(function (ap, c) {
        var v = ap * bp; cells.push(v);
        var core = Number(String(ap).replace(/0+$/, "")) * Number(String(bp).replace(/0+$/, ""));
        var z = (String(ap).match(/0+$/) || [""])[0].length + (String(bp).match(/0+$/) || [""])[0].length;
        box.push({
          type: "number", id: "cell" + r + "_" + c, cell: [r, c], answer: v,
          prompt: "Box: " + fmt(ap) + " × " + fmt(bp),
          diagnose: genericDiagnose(v),
          hints: {
            here: "Cover the zeros: " + String(ap).replace(/0+$/, "") + " × " + String(bp).replace(/0+$/, "") + " = " + core + ", then add back " + z + " zero" + (z === 1 ? "" : "s") + ".",
            start: "Multiply the first digits, then count the zeros in both numbers and write that many zeros at the end.",
            example: "Example: 400 × 30 → 4 × 3 = 12, three zeros → 12,000.",
            check: "Count zeros: your answer needs at least " + z + " zero" + (z === 1 ? "" : "s") + " at the end."
          }
        });
      });
    });
    box.push({
      type: "number", id: "boxsum", answer: answer,
      prompt: "Add every box: " + cells.map(fmt).join(" + "),
      diagnose: sumDiagnose(answer, cells),
      hints: {
        here: "Add two boxes at a time and keep a running total.",
        start: "Start with the biggest boxes: " + fmt(cells[0]) + " + " + fmt(cells[1] || 0) + ".",
        example: "Example: 6,000 + 400 + 30 + 2 = 6,432.",
        check: "The total should be close to your estimate of " + fmt(est) + "."
      }
    });
    p.methods.box = box;
    p.aParts = aParts; p.bParts = bParts; p.rows = rows;
    return p;
  }

  /* ---------------- (b) Zero Shift ---------------- */
  function zerosProblem(rng, level) {
    var kind, x, y, m, n, a, b, answer, core, tries = 0;
    for (;;) {
      tries++;
      if (level === 0) { kind = "mul"; x = ri(rng, 2, 9); y = ri(rng, 2, 9); if ((x * y) % 10 === 0) continue; m = ri(rng, 1, 2); n = ri(rng, 1, 2); if (m + n > 3) continue; }
      else if (level === 2) { kind = "mul"; var pr = pick(rng, [[5, 6], [4, 5], [5, 8], [2, 5], [5, 4], [6, 5], [8, 5], [5, 2]]); x = pr[0]; y = pr[1]; m = ri(rng, 1, 2); n = ri(rng, 1, 2); if (m + n > 3) continue; }
      else if (level === 4 && rng() < 0.35) { kind = "mul"; x = ri(rng, 12, 25); y = ri(rng, 2, 4); if (x % 10 === 0) continue; m = 1; n = 2; }
      else { kind = "div"; }
      if (kind === "mul") { a = x * Math.pow(10, m); b = y * Math.pow(10, n); answer = a * b; core = x * y; break; }
      // division: q = qx*10^k, d = y*10^n, dividend = q*d
      var qx = ri(rng, 2, 9), yy = ri(rng, 2, 9), k, nn;
      if (level === 1) { k = 1; nn = 1; }
      else if (level === 3) { k = 1; nn = 2; }
      else { k = 2; nn = 1; }
      var q = qx * Math.pow(10, k), d = yy * Math.pow(10, nn);
      if ((qx * yy) % 10 === 0 && level < 4) continue;
      a = q * d; b = d; answer = q; x = qx; y = yy; m = k; n = nn; break;
    }
    var tz = function (v) { return (String(v).match(/0+$/) || [""])[0].length; };
    var p = { game: "zeros", kind: kind, a: a, b: b, answer: answer, display: fmt(a) + (kind === "mul" ? " × " : " ÷ ") + fmt(b), steps: [] };
    if (kind === "mul") {
      var za = tz(a), zb = tz(b), total = za + zb, ca = a / Math.pow(10, za), cb = b / Math.pow(10, zb), cprod = ca * cb;
      p.cover = { need: total, a: za, b: zb, mode: "mul" };
      p.steps.push({
        type: "zeros", id: "cover", need: { a: za, b: zb }, mode: "mul",
        prompt: "Cover the zeros: tap every zero at the end of both numbers to move it to the Zero Bank.",
        hints: {
          here: "Only zeros at the END of a number count. " + fmt(a) + " has " + za + " and " + fmt(b) + " has " + zb + ".",
          start: "Tap the last digit of " + fmt(a) + " if it's a zero. Keep going until you reach a digit that isn't zero.",
          example: "Example: 300 × 40. Bank the 2 zeros from 300 and the 1 zero from 40. That's 3 zeros in the bank.",
          check: "Your bank should hold " + total + " zeros."
        }
      });
      p.steps.push({
        type: "number", id: "core", answer: cprod,
        prompt: "Multiply what's left: " + ca + " × " + cb,
        diagnose: genericDiagnose(cprod),
        hints: { here: "Just the basic fact: " + ca + " × " + cb + ".", start: "Ignore the bank for now. What is " + ca + " × " + cb + "?", example: "Example: in 300 × 40 you'd do 3 × 4 = 12.", check: ca + " × " + cb + " should be between " + (ca * cb - ca) + " and " + (ca * cb + ca) + "." }
      });
      var extraZero = cprod % 10 === 0;
      p.steps.push({
        type: "number", id: "final", answer: answer,
        prompt: "Now add the " + total + " banked zeros to " + cprod + ". So " + fmt(a) + " × " + fmt(b) + " = ?",
        diagnose: function (got) { var z = zeroSlip(got, answer); if (z) return z + (extraZero ? " Careful: " + cprod + " already ends in a 0. That zero is part of the fact, so you still add all " + total + " banked zeros after it." : ""); return "Write " + cprod + ", then exactly " + total + " zeros after it."; },
        trap: extraZero,
        hints: {
          here: "Write " + cprod + " and then " + total + " zero" + (total === 1 ? "" : "s") + "." + (extraZero ? " " + cprod + " already ends in zero; that one comes from the fact, and the bank zeros come after it." : ""),
          start: "Start by writing " + cprod + ".",
          example: "Example: 500 × 60 → 5 × 6 = 30, bank has 3 zeros → 30 + 000 = 30,000.",
          check: "Your answer should have " + (tz(answer)) + " zeros at the end."
        }
      });
      p.steps.push({
        type: "number", id: "checkback", answer: a, check: true,
        prompt: "Multiply-back check: " + fmt(answer) + " ÷ " + fmt(b) + " = ?",
        diagnose: genericDiagnose(a),
        hints: { here: "Cover the same number of zeros on both: " + fmt(answer) + " ÷ " + fmt(b) + " is the same as " + fmt(answer / Math.pow(10, zb)) + " ÷ " + cb + ".", start: "If your answer was right, this should give you back " + fmt(a) + ".", example: "Example: 12,000 ÷ 40 → 1,200 ÷ 4 = 300.", check: "You should get the first number in the problem." }
      });
    } else {
      var zd = tz(b), sa = a / Math.pow(10, zd), sb = b / Math.pow(10, zd);
      p.cover = { need: zd, mode: "div" };
      p.steps.push({
        type: "zeros", id: "cover", need: { a: zd, b: zd }, mode: "div",
        prompt: "Cover the zeros: cover every zero at the end of " + fmt(b) + ", and the same number at the end of " + fmt(a) + ".",
        hints: {
          here: fmt(b) + " has " + zd + " zero" + (zd === 1 ? "" : "s") + " at the end. Cover " + zd + " on each number. Covering the same amount on both sides doesn't change the answer.",
          start: "Tap the last 0 in " + fmt(b) + ", then the last 0 in " + fmt(a) + ".",
          example: "Example: 2,700 ÷ 90. Cover one zero on each: 270 ÷ 9.",
          check: "Both numbers should lose the same number of zeros: " + zd + "."
        }
      });
      p.steps.push({
        type: "number", id: "core", answer: answer,
        prompt: "Now solve the easier one: " + fmt(sa) + " ÷ " + sb + " = ?",
        diagnose: function (got) {
          var z = zeroSlip(got, answer); if (z) return z + " Use the check: does " + fmt(got) + " × " + sb + " make " + fmt(sa) + "?";
          return "Think: " + sb + " × ? = " + fmt(sa) + ". Start from the fact " + sb + " × " + x + " = " + (x * sb) + ".";
        },
        hints: {
          here: "Use a fact you know: " + sb + " × " + x + " = " + (x * sb) + ". Now compare " + (x * sb) + " with " + fmt(sa) + ". How many more zeros does " + fmt(sa) + " have?",
          start: "Ask: " + sb + " × ? = " + fmt(sa) + ".",
          example: "Example: 270 ÷ 9. 9 × 3 = 27, so 9 × 30 = 270. Answer: 30.",
          check: "Multiply your answer by " + sb + ". You should get " + fmt(sa) + "."
        }
      });
      p.steps.push({
        type: "number", id: "checkback", answer: a, check: true,
        prompt: "Multiply-back check: " + fmt(answer) + " × " + fmt(b) + " = ?",
        diagnose: genericDiagnose(a),
        hints: { here: "Cover the zeros: " + String(answer).replace(/0+$/, "") + " × " + y + " = " + (Number(String(answer).replace(/0+$/, "")) * y) + ", then add back all the zeros.", start: "If your answer was right, this gives back " + fmt(a) + ".", example: "Example: 30 × 90 → 3 × 9 = 27, two zeros → 2,700.", check: "It should match the first number, " + fmt(a) + "." }
      });
    }
    return p;
  }

  /* ---------------- (c) Order Protocol ---------------- */
  var PREC = { "+": 1, "-": 1, "×": 2, "÷": 2 };
  var OPEN = { "(": ")", "[": "]" };
  function isOp(t) { return t === "+" || t === "-" || t === "×" || t === "÷"; }
  function isNum(t) { return typeof t === "number"; }
  function calc(a, op, b) { return op === "+" ? a + b : op === "-" ? a - b : op === "×" ? a * b : a / b; }
  function stripSingles(tokens) {
    var t = tokens.slice(), changed = true, i;
    while (changed) {
      changed = false;
      for (i = 0; i + 2 < t.length; i++) if (OPEN[t[i]] && isNum(t[i + 1]) && t[i + 2] === OPEN[t[i]]) { t.splice(i, 3, t[i + 1]); changed = true; break; }
    }
    return t;
  }
  /* Indices of operators that are allowed next. */
  function validOps(tokens) {
    var groups = [], stack = [], i;
    for (i = 0; i < tokens.length; i++) {
      if (OPEN[tokens[i]]) stack.push(i);
      else if (tokens[i] === ")" || tokens[i] === "]") { var s = stack.pop(); groups.push([s, i]); }
    }
    var inner = groups.filter(function (g) { for (var j = g[0] + 1; j < g[1]; j++) if (OPEN[tokens[j]]) return false; return true; });
    var regions = inner.length ? inner.map(function (g) { return [g[0] + 1, g[1] - 1]; }) : [[0, tokens.length - 1]];
    var out = [];
    regions.forEach(function (r) {
      var ops = []; for (var j = r[0]; j <= r[1]; j++) if (isOp(tokens[j])) ops.push(j);
      if (!ops.length) return;
      var hasMD = ops.some(function (j) { return PREC[tokens[j]] === 2; });
      var want = hasMD ? 2 : 1;
      for (var k = 0; k < ops.length; k++) { if (PREC[tokens[ops[k]]] === want) { out.push(ops[k]); break; } }
    });
    return out;
  }
  function applyOp(tokens, idx) {
    var a = tokens[idx - 1], op = tokens[idx], b = tokens[idx + 1];
    var r = calc(a, op, b), t = tokens.slice();
    t.splice(idx - 1, 3, r);
    return { tokens: stripSingles(t), a: a, op: op, b: b, result: r };
  }
  function whyNot(tokens, idx) {
    var v = validOps(tokens);
    var anyGroup = tokens.some(function (t) { return OPEN[t]; });
    var op = tokens[idx];
    var inGroup = false, depth = 0, i;
    for (i = 0; i < idx; i++) { if (OPEN[tokens[i]]) depth++; else if (tokens[i] === ")" || tokens[i] === "]") depth--; }
    inGroup = depth > 0;
    if (anyGroup && v.indexOf(idx) < 0 && !inGroup) return "Grouping symbols come first. Solve what's inside the ( ) or [ ] before anything outside.";
    if (anyGroup && v.indexOf(idx) < 0 && inGroup) return "Start with the innermost group, the ( ) inside the [ ].";
    if (PREC[op] === 1) return "Not yet. × and ÷ outrank + and −, so they go first (after anything in parentheses).";
    return "× and ÷ are equal rank, so go left to right. Do the one further left first.";
  }
  function evalTokens(tokens) {
    var t = tokens.slice(), guard = 0;
    while (t.length > 1 && guard++ < 50) { var v = validOps(t); if (!v.length) return NaN; t = applyOp(t, v[0]).tokens; }
    return t[0];
  }
  function okTokens(tokens) {
    var t = tokens.slice(), guard = 0;
    while (t.length > 1 && guard++ < 50) {
      var v = validOps(t); if (!v.length) return false;
      for (var j = 0; j < v.length; j++) { var r = applyOp(t, v[j]); if (r.result < 0 || r.result !== Math.floor(r.result) || r.result > 999) return false; }
      t = applyOp(t, v[0]).tokens;
    }
    return t.length === 1;
  }
  function orderProblem(rng, level) {
    var tokens, tries = 0, trapNote = "";
    do {
      tries++;
      var a = ri(rng, 2, 9), b = ri(rng, 2, 9), c = ri(rng, 2, 9), d = ri(rng, 1, 9), e = ri(rng, 2, 4);
      if (level === 0) { tokens = [ri(rng, 3, 15), "+", b, "×", c]; trapNote = "Left to right would give the wrong answer here. × goes before +."; }
      else if (level === 1) { var q = ri(rng, 2, 6); tokens = [ri(rng, 10, 30), "-", q * c, "÷", c]; trapNote = "÷ goes before −."; }
      else if (level === 2) { tokens = ["(", a, "+", b, ")", "×", c, "-", d]; trapNote = "Parentheses first, then ×, then −."; }
      else if (level === 3) { var c2 = ri(rng, 4, 9), d2 = ri(rng, 1, c2 - 1); tokens = [ri(rng, 15, 40), "-", b, "×", "(", c2, "-", d2, ")"]; trapNote = "The trap: it's tempting to do " + "the − first. Multiply before you subtract."; }
      else if (rng() < 0.5) { var s = ri(rng, 2, 4), s2 = ri(rng, 1, 3); tokens = [(s + s2) * ri(rng, 2, 8), "÷", "(", s, "+", s2, ")", "×", c, "+", d]; trapNote = "× and ÷ tie, so go left to right."; }
      else { tokens = [a, "×", "[", ri(rng, 15, 30), "-", "(", c, "+", d, ")", "×", 2, "]"]; trapNote = "Work from the inside out: ( ) first, then [ ]."; }
    } while ((!okTokens(tokens) || evalTokens(tokens) === 0) && tries < 400);
    var answer = evalTokens(tokens);
    var ltr = leftToRight(tokens);
    return {
      game: "order", tokens: tokens, answer: answer, display: tokensText(tokens), trapNote: trapNote, leftToRight: ltr,
      steps: [{
        type: "order", id: "order",
        prompt: "Tap the operation that goes first.",
        hints: {
          here: "The rule: ( ) and [ ] first, innermost first. Then × and ÷ from left to right. Then + and − from left to right.",
          start: tokens.some(function (t) { return OPEN[t]; }) ? "Look for parentheses. Start inside them." : "Look for × or ÷. Do that before any + or −.",
          example: "Example: 20 − 3 × (6 − 2). First (6 − 2) = 4. Then 3 × 4 = 12. Then 20 − 12 = 8.",
          check: "After each step, the expression gets shorter. When one number is left, that's the answer."
        }
      }]
    };
  }
  function tokensText(tokens) { return tokens.map(function (t) { return t === "-" ? "−" : String(t); }).join(" ").replace(/\( /g, "(").replace(/ \)/g, ")").replace(/\[ /g, "[").replace(/ \]/g, "]"); }
  function leftToRight(tokens) {
    var t = tokens.filter(function (x) { return !OPEN[x] && x !== ")" && x !== "]"; });
    var v = t[0], i; for (i = 1; i < t.length; i += 2) v = calc(v, t[i], t[i + 1]);
    return v;
  }

  /* ---------------- (d) Reality Check ---------------- */
  var NAMES = ["Kaito", "Rin", "Sora", "Mika", "Jun"];
  var SCENES = [
    function (a, b) { return "The night market sells " + fmt(a) + " lanterns a week for " + b + " weeks. How many lanterns?"; },
    function (a, b) { return "A sky-ship burns " + fmt(a) + " units of fuel per jump and makes " + b + " jumps. How much fuel?"; },
    function (a, b) { return "A guild forges " + fmt(a) + " arrowheads a day for " + b + " days. How many arrowheads?"; },
    function (a, b) { return "A server farm logs " + fmt(a) + " signals an hour for " + b + " hours. How many signals?"; }
  ];
  function checkProblem(rng, level, wrong) {
    var who = pick(rng, NAMES), p, a, b, tries = 0;
    if (level === 0) {
      // addition with misaligned place value
      do { a = ri(rng, 12, 39) * 100 + ri(rng, 1, 9) * 10; b = ri(rng, 41, 89) * 10; tries++; } while ((b % 100 === 0 || (a + b * 10) / (Math.round(a / 100) * 100 + Math.round(b / 100) * 100) < 1.6) && tries < 100);
      var right = a + b, slip = a + b * 10, shown = wrong ? slip : right;
      var ra = Math.round(a / 100) * 100, rb = Math.round(b / 100) * 100, est = ra + rb;
      p = { story: "A crew hauls " + fmt(a) + " kg of steel, then " + fmt(b) + " kg more. How much in total?", op: "+", a: a, b: b, answer: right, shown: shown, estimate: est,
        work: [fmt(a) + " + " + fmt(b * (wrong ? 10 : 1)) + (wrong ? "   (lined up " + fmt(b) + " one place too far left)" : ""), "= " + fmt(shown)],
        slipLine: 0, slipWhy: "They lined up " + fmt(b) + " as if it were " + fmt(b * 10) + ".",
        roundPrompt: "Round both numbers to the nearest hundred.", roundOptions: [[ra, rb], [ra, rb * 10], [ra * 10, rb]], roundLabel: function (r) { return fmt(r[0]) + " + " + fmt(r[1]); }, estFrom: function (r) { return r[0] + r[1]; } };
    } else if (level === 1) {
      var q = ri(rng, 2, 9) * 10, d = ri(rng, 2, 9) * 10; a = q * d;
      var shownD = wrong ? q * 10 : q;
      p = { story: who + " has to split " + fmt(a) + " crystals evenly into " + d + " vaults.", op: "÷", a: a, b: d, answer: q, shown: shownD, estimate: null,
        work: [fmt(a) + " ÷ " + d + " = " + fmt(shownD)], slipLine: 0, slipWhy: "An extra zero snuck into the answer.", division: true };
    } else {
      do {
        a = level === 2 ? ri(rng, 210, 890) : ri(rng, 1100, 8900); b = ri(rng, 23, 89); tries++;
      } while ((Math.abs(leadRound(a) - a) / a > 0.15 || b % 10 === 0 || b / (Math.floor(b / 10) + b % 10) < 2.6) && tries < 300);
      var row1 = a * (b % 10), row2 = a * Math.floor(b / 10) * 10, ans = a * b;
      var slipKind = level === 4 && wrong ? "extrazero" : "placeholder";
      var shownM = !wrong ? ans : slipKind === "placeholder" ? row1 + row2 / 10 : ans * 10;
      var r2shown = wrong && slipKind === "placeholder" ? row2 / 10 : row2;
      p = { story: pick(rng, SCENES)(a, b), op: "×", a: a, b: b, answer: ans, shown: shownM, estimate: leadRound(a) * b,
        work: [fmt(a) + " × " + (b % 10) + " = " + fmt(row1), fmt(a) + " × " + (Math.floor(b / 10) * 10) + " = " + fmt(r2shown) + (wrong && slipKind === "placeholder" ? "" : ""), fmt(row1) + " + " + fmt(r2shown) + " = " + fmt(wrong && slipKind === "extrazero" ? ans : row1 + r2shown), "Answer: " + fmt(shownM)],
        slipLine: slipKind === "placeholder" ? 1 : 3,
        slipWhy: slipKind === "placeholder" ? "They multiplied by " + Math.floor(b / 10) + " instead of " + (Math.floor(b / 10) * 10) + ". The tens row needs a placeholder zero." : "The sum was right, but an extra zero got copied into the final answer.",
        roundPrompt: "Round " + fmt(a) + " to its first digit and keep " + b + ".",
        roundOptions: [[leadRound(a), b], [leadRound(a) / 10, b], [leadRound(a) * 10, b]], roundLabel: function (r) { return fmt(r[0]) + " × " + r[1]; }, estFrom: function (r) { return r[0] * r[1]; } };
    }
    p.game = "check"; p.who = who; p.wrong = !!wrong;
    p.display = p.story;
    var steps = [];
    if (p.division) {
      var guess = p.shown;
      steps.push({ type: "choice", id: "estimate", prompt: "Multiply back to test " + who + "'s answer: " + fmt(guess) + " × " + p.b + " is about…",
        options: shuffle(rng, [guess * p.b, guess * p.b * 10, guess * p.b / 10]).map(function (v) { return { label: fmt(v), correct: v === guess * p.b }; }),
        after: fmt(guess) + " × " + p.b + " = " + fmt(guess * p.b) + ". The vaults hold " + fmt(p.a) + " crystals.",
        hints: { here: "Cover the zeros: " + String(guess).replace(/0+$/, "") + " × " + String(p.b).replace(/0+$/, "") + ", then add the zeros back.", start: "If " + fmt(guess) + " is right, " + fmt(guess) + " × " + p.b + " should equal " + fmt(p.a) + ".", example: "Example: someone says 2,700 ÷ 90 = 300. Check: 300 × 90 = 27,000. That's not 2,700, so it's wrong.", check: "Count the zeros in each option." } });
      p.estimate = guess * p.b;
    } else {
      var correctRound = p.roundOptions[0];
      steps.push({ type: "choice", id: "round", prompt: p.roundPrompt,
        options: shuffle(rng, p.roundOptions.map(function (r, i) { return { label: p.roundLabel(r), correct: i === 0 }; })),
        hints: { here: p.op === "+" ? "Look at the tens digit. 5 or more rounds up." : "Keep only the first digit of " + fmt(p.a) + ", look at the next digit to round, and fill the rest with zeros.", start: "Round " + fmt(p.a) + " first.", example: p.op === "+" ? "Example: 4,260 → 4,300 and 380 → 400." : "Example: 6,452 → 6,000 (the 4 says round down). Keep 35.", check: "A rounded number should be close to the original." } });
      var est = p.estFrom(correctRound);
      steps.push({ type: "choice", id: "estimate", prompt: "So the estimate is about…",
        options: shuffle(rng, [est, est * 10, est / 10]).map(function (v) { return { label: fmt(v), correct: v === est }; }),
        after: "Estimate: about " + fmt(est) + ".",
        hints: { here: p.op === "+" ? "Add the rounded numbers." : "Multiply the first digit by " + p.b + ", then add the zeros back.", start: "Use the rounded numbers you just picked.", example: p.op === "+" ? "Example: 4,300 + 400 = 4,700." : "Example: 6,000 × 35 → 6 × 35 = 210, then three zeros: 210,000.", check: "Count the digits. Is it about the size you expect?" } });
      p.estimate = est;
    }
    steps.push({ type: "choice", id: "reasonable", prompt: who + " says the answer is " + fmt(p.shown) + ". Is that reasonable?",
      options: [{ label: "Yes, it's close", correct: !p.wrong }, { label: "No, something slipped", correct: p.wrong }],
      after: p.wrong ? "Right: " + fmt(p.shown) + " is nowhere near " + fmt(p.division ? p.a : p.estimate) + "." : "Yes. " + fmt(p.shown) + " is close to the estimate, so it's reasonable.",
      hints: { here: "Compare " + fmt(p.shown) + " with " + (p.division ? "what the multiply-back gave you vs " + fmt(p.a) : "your estimate, " + fmt(p.estimate)) + ". Are they about the same size?", start: "Put the two numbers side by side. Count their digits.", example: "Example: estimate 210,000, answer 225,820: close, reasonable. Answer 2,258,200: ten times too big.", check: "Close means the same number of digits and similar first digits." } });
    if (p.wrong) {
      if (p.work.length > 1) steps.push({ type: "line", id: "line", prompt: "Which line has the slip? Tap it.", answer: p.slipLine, after: p.slipWhy,
        hints: { here: "Check each line one by one. Is each number the right size?", start: "Start at the top line and check it.", example: "Example: 352 × 40 should end in 0. If that line doesn't, that's the slip.", check: "The slip is the first line where something goes wrong." } });
      steps.push({ type: "number", id: "fix", answer: p.answer, prompt: "Help " + who + ": what's the correct answer?", diagnose: p.op === "×" ? sumDiagnose(p.answer) : genericDiagnose(p.answer),
        hints: { here: p.op === "×" ? "Fix the slipped line, then add again: " + fmt(p.a) + " × " + (p.b % 10) + " + " + fmt(p.a) + " × " + (Math.floor(p.b / 10) * 10) + "." : p.op === "÷" ? "Cover one zero on each: " + fmt(p.a / 10) + " ÷ " + (p.b / 10) + "." : "Line up the ones place under the ones place and add again.", start: "Fix the line that slipped, then keep going.", example: p.op === "×" ? "Example: 352 × 24 = 352 × 4 + 352 × 20 = 1,408 + 7,040 = 8,448." : p.op === "÷" ? "Example: 2,700 ÷ 90 → 270 ÷ 9 = 30." : "Example: 4,250 + 380 = 4,630.", check: "Your answer should be close to " + fmt(p.division ? p.a / p.b : p.estimate) + (p.division ? " (check: it times " + p.b + " gives " + fmt(p.a) + ")" : "") + "." } });
    }
    p.steps = steps;
    return p;
  }

  var GAMES = {
    carry: { title: "Carry Chain", kanji: "乗", reading: "jō · multiply", skill: "Multi-digit multiplication", blurb: "Estimate first, then multiply with visible carries or the box method.", make: carryProblem },
    zeros: { title: "Zero Shift", kanji: "零", reading: "rei · zero", skill: "Place value with tens, hundreds, thousands", blurb: "Cover the zeros, solve the small fact, put the zeros back, and multiply back to check.", make: zerosProblem },
    order: { title: "Order Protocol", kanji: "順", reading: "jun · order", skill: "Order of operations", blurb: "Tap which operation fires first. Watch for the traps.", make: orderProblem },
    check: { title: "Reality Check", kanji: "検", reading: "ken · inspect", skill: "Estimate and check", blurb: "Round, estimate, and catch the slips in someone else's work.", make: checkProblem }
  };

  function makeRound(game, seed) {
    var rng = mkRng(seed), g = GAMES[game], out = [], i;
    var wrongPlan = null;
    if (game === "check") {
      // at least 2 slips, at least 1 correct; level 2 always correct for a calm middle.
      wrongPlan = [rng() < 0.6, rng() < 0.7, false, true, rng() < 0.5];
    }
    for (i = 0; i < 5; i++) out.push(game === "check" ? g.make(rng, i, wrongPlan[i]) : g.make(rng, i));
    return out;
  }

  var api = { GAMES: GAMES, makeRound: makeRound, validOps: validOps, applyOp: applyOp, whyNot: whyNot, evalTokens: evalTokens, tokensText: tokensText, carriesFor: carriesFor, fmt: fmt, leadRound: leadRound, mkRng: mkRng };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.MathDojo = api;
})(typeof window !== "undefined" ? window : globalThis);
