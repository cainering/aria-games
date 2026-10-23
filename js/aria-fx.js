/* Ambient layer for the dreamcore family of themes.
   Reads data-fx on <html>: dream | sky | pool | night | weird.
   Slow and soft; a single still frame when reduce-motion is on. */
(function () {
  "use strict";
  var cv = document.createElement("canvas"); cv.className = "fx-canvas"; cv.setAttribute("aria-hidden", "true");
  var ctx = cv.getContext("2d"), W = 0, H = 0, dpr = 1, raf = 0, mode = "", clouds = [], eyes = [], dots = [], words = [], t0 = Date.now();
  var still = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function resize() { dpr = Math.min(2, window.devicePixelRatio || 1); W = window.innerWidth; H = window.innerHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
  function phrases() { try { return (window.AriaHub && window.AriaHub.lex().phrases) || []; } catch (e) { return []; } }
  function seed() {
    mode = document.documentElement.getAttribute("data-fx") || "dream";
    var small = W < 700;
    var nc = { dream: 5, sky: 8, pool: 0, night: 2, weird: 3 }[mode] || 0;
    var ne = { dream: 2, sky: 0, pool: 0, night: 1, weird: 5 }[mode] || 0;
    var nd = { dream: 0, sky: 0, pool: 14, night: 60, weird: 0 }[mode] || 0;
    if (small) { nc = Math.ceil(nc * .6); nd = Math.ceil(nd * .6); ne = Math.min(ne, 3); }
    clouds = []; eyes = []; dots = []; words = [];
    for (var i = 0; i < nc; i++) clouds.push({ x: rnd(-200, W), y: rnd(H * .04, H * .7), s: rnd(.6, 1.5), v: rnd(.05, .16), a: mode === "night" ? .08 : rnd(.35, .6) });
    for (i = 0; i < ne; i++) eyes.push({ x: rnd(W * .06, W * .94), y: rnd(H * .1, H * .9), s: rnd(10, 18) * (mode === "weird" ? 1.2 : 1), ph: rnd(0, 20), per: rnd(6, 11), look: rnd(-1, 1), a: mode === "weird" ? .55 : .3 });
    for (i = 0; i < nd; i++) dots.push({ x: rnd(0, W), y: rnd(0, mode === "night" ? H * .8 : H), r: mode === "night" ? rnd(.5, 1.6) : rnd(40, 110), ph: rnd(0, 6.28), v: rnd(.2, .7) });
    if (mode === "weird") { var p = phrases(); for (i = 0; i < Math.min(3, p.length); i++) words.push({ text: p[(i * 2) % p.length], x: rnd(W * .05, W * .7), y: rnd(H * .15, H * .9), ph: rnd(0, 6.28) }); }
  }
  function cloud(c) {
    var s = c.s * 60; ctx.save(); ctx.globalAlpha = c.a; ctx.fillStyle = "#fff";
    ctx.shadowColor = "rgba(255,255,255,.9)"; ctx.shadowBlur = 30;
    [[0, 0, 1], [.9, -.35, .8], [1.8, 0, .9], [.9, .2, 1.05], [2.5, .15, .6]].forEach(function (b) { ctx.beginPath(); ctx.arc(c.x + b[0] * s, c.y + b[1] * s, b[2] * s * .6, 0, 6.29); ctx.fill(); });
    ctx.restore();
  }
  function eye(e, t) {
    var cyc = ((t + e.ph) % e.per) / e.per, open = 1;
    if (cyc > .9) open = Math.abs(Math.cos((cyc - .9) / .1 * Math.PI)); // slow blink
    var s = e.s, h = s * .55 * Math.max(.06, open);
    ctx.save(); ctx.globalAlpha = e.a; ctx.translate(e.x, e.y);
    ctx.beginPath(); ctx.moveTo(-s, 0); ctx.quadraticCurveTo(0, -h * 2, s, 0); ctx.quadraticCurveTo(0, h * 2, -s, 0); ctx.closePath();
    ctx.fillStyle = "rgba(255,255,255,.92)"; ctx.fill(); ctx.lineWidth = 1.4; ctx.strokeStyle = mode === "night" ? "rgba(230,220,255,.9)" : "rgba(70,80,120,.75)"; ctx.stroke();
    if (open > .3) { ctx.save(); ctx.clip(); var lx = Math.sin(t * .3 + e.ph) * s * .3 * e.look; ctx.beginPath(); ctx.arc(lx, 0, s * .42, 0, 6.29); ctx.fillStyle = mode === "weird" ? "#5b8fd6" : "#7fa8d8"; ctx.fill(); ctx.beginPath(); ctx.arc(lx, 0, s * .18, 0, 6.29); ctx.fillStyle = "#283048"; ctx.fill(); ctx.beginPath(); ctx.arc(lx - s * .12, -s * .12, s * .07, 0, 6.29); ctx.fillStyle = "#fff"; ctx.fill(); ctx.restore(); }
    ctx.restore();
  }
  function draw() {
    var t = (Date.now() - t0) / 1000;
    ctx.clearRect(0, 0, W, H);
    if (mode === "pool") {
      ctx.save(); ctx.globalCompositeOperation = "lighter";
      dots.forEach(function (d) { var r = d.r * (1 + .15 * Math.sin(t * d.v + d.ph)); var g = ctx.createRadialGradient(d.x, d.y, r * .2, d.x, d.y, r); g.addColorStop(0, "rgba(220,255,250,.10)"); g.addColorStop(1, "rgba(220,255,250,0)"); ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(d.x + Math.sin(t * .2 + d.ph) * 20, d.y, r * 1.4, r * .7, 0, 0, 6.29); ctx.fill(); });
      ctx.restore();
    }
    if (mode === "night") dots.forEach(function (d) { ctx.globalAlpha = .35 + .5 * (0.5 + 0.5 * Math.sin(t * d.v * 2 + d.ph)); ctx.fillStyle = "#fffbe8"; ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, 6.29); ctx.fill(); });
    ctx.globalAlpha = 1;
    clouds.forEach(function (c) { if (!still) { c.x += c.v; if (c.x > W + 50) { c.x = -260 * c.s; c.y = rnd(H * .04, H * .7); } } cloud(c); });
    eyes.forEach(function (e) { eye(e, still ? 0 : t); });
    if (words.length) { ctx.save(); ctx.font = "italic 18px 'Times New Roman', serif"; words.forEach(function (w) { ctx.globalAlpha = .12 + .1 * Math.sin(t * .4 + w.ph); ctx.fillStyle = "#3a3320"; ctx.fillText(w.text, w.x, w.y); }); ctx.restore(); }
  }
  var last = 0;
  function loop(ts) { if (!ts || ts - last > 33) { last = ts || 0; draw(); } if (!still) raf = requestAnimationFrame(loop); }
  function mount() { document.body.insertBefore(cv, document.body.firstChild); resize(); seed(); loop(); }
  if (document.body) mount(); else document.addEventListener("DOMContentLoaded", mount);
  window.addEventListener("resize", function () { resize(); seed(); if (still) draw(); });
  new MutationObserver(function () { if ((document.documentElement.getAttribute("data-fx") || "") !== mode) { seed(); if (still) draw(); } })
    .observe(document.documentElement, { attributes: true, attributeFilter: ["data-fx"] });
  document.addEventListener("visibilitychange", function () { if (document.hidden) cancelAnimationFrame(raf); else if (!still) { cancelAnimationFrame(raf); loop(); } });
})();
