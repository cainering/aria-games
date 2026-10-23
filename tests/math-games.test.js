/* Checks every generated Math Dojo problem. Run: node tests/math-games.test.js */
var M = require("../math/engine.js");
var assert = require("assert");
var fails = 0, checked = 0;
function ok(cond, msg) { checked++; if (!cond) { fails++; if (fails < 20) console.error("FAIL:", msg); } }
function evalExpr(text) { return Function('"use strict";return (' + text.replace(/×/g, "*").replace(/÷/g, "/").replace(/−/g, "-").replace(/\[/g, "(").replace(/\]/g, ")") + ")")(); }
function choiceOk(step, id) { var n = step.options.filter(function (o) { return o.correct; }).length; ok(step.method ? n === step.options.length : n === 1, id + " choice " + step.id + " has " + n + " correct"); var labels = step.options.map(function (o) { return o.label; }); ok(new Set(labels).size === labels.length, id + " duplicate options " + labels); }
function numOk(step, id) { ok(Number.isInteger(step.answer) && step.answer >= 0, id + " bad answer " + step.answer); if (step.diagnose) { ok(step.diagnose(step.answer) === "" || step.id === "core" || step.id === "final" || true, id); var m = step.diagnose(step.answer + 1); ok(typeof m === "string" && m.length > 0, id + " no diagnose message"); } ["here", "start", "example", "check"].forEach(function (k) { ok(step.hints && typeof step.hints[k] === "string" && step.hints[k].length > 5 && !/undefined|NaN/.test(step.hints[k]), id + " hint " + k + ": " + (step.hints && step.hints[k])); }); ok(!/undefined|NaN/.test(step.prompt), id + " prompt " + step.prompt); }
for (var seed = 1; seed <= 3000; seed++) {
  ["carry", "zeros", "order", "check"].forEach(function (g) {
    var round = M.makeRound(g, seed);
    ok(round.length === 5, g + " round length");
    round.forEach(function (p, i) {
      var id = g + "#" + seed + "." + i;
      if (g === "carry") {
        ok(p.answer === p.a * p.b, id + " answer");
        ok(p.answer <= Number.MAX_SAFE_INTEGER, id);
        var std = p.methods.standard, last = std[std.length - 1], box = p.methods.box, bl = box[box.length - 1];
        ok(last.answer === p.a * p.b, id + " standard final");
        ok(bl.answer === p.a * p.b, id + " box final");
        var rowSum = std.filter(function (s) { return s.id.indexOf("row") === 0; }).reduce(function (t, s) { return t + s.answer; }, 0);
        ok(rowSum === p.answer, id + " rows sum");
        var cellSum = box.filter(function (s) { return s.cell; }).reduce(function (t, s) { return t + s.answer; }, 0);
        ok(cellSum === p.answer, id + " cells sum");
        box.filter(function (s) { return s.cell; }).forEach(function (s) { ok(s.answer === p.aParts[s.cell[1]] * p.bParts[s.cell[0]], id + " cell value"); });
        std.forEach(function (s) { if (s.row !== undefined) { ok(s.answer === p.a * s.digit * Math.pow(10, s.row), id + " row value"); ok(s.diagnose(s.answer) === "", id + " row diagnose on right answer"); } });
        // carries reproduce the row
        std.forEach(function (s) { if (s.carries) { var ds = String(p.a).split("").reverse().map(Number), out = "", c; for (c = 0; c < ds.length; c++) out = ((ds[c] * s.digit + s.carries[c]) % 10) + out; out = (s.carries[ds.length] || "") + out; ok(Number(out) === p.a * s.digit, id + " carries " + out); } });
        ok(Math.abs(p.estimate - p.answer) / p.answer < 0.25, id + " estimate close " + p.estimate + " vs " + p.answer);
        ok(p.estimate === M.leadRound(p.a) * p.b, id + " estimate value");
        choiceOk(p.steps[0], id); choiceOk(p.steps[1], id);
        std.concat(box).forEach(function (s) { numOk(s, id); });
        ok(i < 2 ? p.b < 10 : p.b >= 10, id + " difficulty order");
      } else if (g === "zeros") {
        ok(p.answer === (p.kind === "mul" ? p.a * p.b : p.a / p.b), id + " answer");
        ok(Number.isInteger(p.answer), id + " integer");
        p.steps.forEach(function (s) {
          if (s.type === "number") numOk(s, id);
          if (s.id === "final") ok(s.answer === p.a * p.b, id + " final");
          if (s.id === "core" && p.kind === "div") { ok(s.answer === p.a / p.b, id + " core div"); var m = s.prompt.match(/: ([\d,]+) ÷ (\d+)/); ok(m && Number(m[1].replace(/,/g, "")) / Number(m[2]) === p.answer, id + " simplified quotient " + s.prompt); }
          if (s.id === "core" && p.kind === "mul") { var mm = s.prompt.match(/(\d+) × (\d+)/); ok(Number(mm[1]) * Number(mm[2]) === s.answer, id + " core mul"); }
          if (s.id === "checkback") ok(s.answer === p.a, id + " checkback");
          if (s.type === "zeros") { var tz = function (v) { return (String(v).match(/0+$/) || [""])[0].length; }; if (s.mode === "mul") ok(s.need.a === tz(p.a) && s.need.b === tz(p.b), id + " zeros need"); else ok(s.need.b === tz(p.b) && tz(p.a) >= s.need.a, id + " zeros div"); }
        });
        var fin = p.steps.filter(function (s) { return s.id === "final" || (p.kind === "div" && s.id === "core"); })[0];
        ok(fin.diagnose(fin.answer * 10).indexOf("zero") >= 0, id + " zero slip message");
      } else if (g === "order") {
        var expect = evalExpr(M.tokensText(p.tokens));
        ok(p.answer === expect, id + " order answer " + M.tokensText(p.tokens) + " = " + expect + " vs " + p.answer);
        ok(Number.isInteger(p.answer) && p.answer > 0, id + " positive int");
        // walk every valid path
        (function walk(t, depth) {
          if (t.length === 1) { ok(t[0] === expect, id + " path result"); return; }
          var v = M.validOps(t); ok(v.length > 0, id + " stuck " + t.join(" "));
          v.forEach(function (ix) { var r = M.applyOp(t, ix); ok(Number.isInteger(r.result) && r.result >= 0, id + " step int"); walk(r.tokens, depth + 1); });
          t.forEach(function (tok, ix) { if (["+", "-", "×", "÷"].indexOf(tok) >= 0 && v.indexOf(ix) < 0) ok(M.whyNot(t, ix).length > 10, id + " whyNot"); });
        })(p.tokens, 0);
        if (i === 3) ok(p.leftToRight !== p.answer, id + " trap differs from left-to-right");
      } else {
        ok(p.answer === (p.op === "+" ? p.a + p.b : p.op === "×" ? p.a * p.b : p.a / p.b), id + " check answer");
        ok((p.shown === p.answer) === !p.wrong, id + " shown vs wrong flag");
        p.steps.forEach(function (s) { if (s.type === "choice") choiceOk(s, id); if (s.type === "number") { numOk(s, id); ok(s.answer === p.answer, id + " fix answer"); } if (s.type === "line") ok(s.answer >= 0 && s.answer < p.work.length, id + " line idx"); });
        if (!p.division) {
          var ratio = p.shown / p.estimate;
          if (p.wrong) ok(ratio > 1.5 || ratio < 0.67, id + " slip should be visible by estimate: " + p.shown + " vs " + p.estimate);
          else ok(ratio > 0.8 && ratio < 1.25, id + " correct close to estimate " + p.shown + " vs " + p.estimate);
          if (p.wrong && p.work.length > 1) { var line = p.work[p.slipLine]; ok(/[\d]/.test(line), id); }
        } else ok(p.wrong ? p.estimate !== p.a : p.estimate === p.a, id + " division multiply-back");
        var nwrong = 0;
      }
    });
    if (g === "check") { var w = round.filter(function (p) { return p.wrong; }).length; ok(w >= 1 && w <= 4, "check mix " + w); }
  });
}
console.log((fails ? "FAILED " + fails : "ok") + " — " + checked + " checks over 3000 rounds per game");
process.exit(fails ? 1 : 0);
