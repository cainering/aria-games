/* Background motion for the hub: neon rain, sakura petals, embers, or stars.
   Reads data-fx on <html>. Calm and slow; static when reduce-motion is on. */
(function () {
  "use strict";
  var cv = document.createElement("canvas"); cv.className = "fx-canvas"; cv.setAttribute("aria-hidden", "true");
  function mount() { document.body.insertBefore(cv, document.body.firstChild); resize(); seed(); loop(); }
  var ctx = cv.getContext("2d"), W = 0, H = 0, dpr = 1, parts = [], mode = "", raf = 0;
  var still = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function css(n) { return getComputedStyle(document.documentElement).getPropertyValue(n).trim() || "#fff"; }
  function resize() { dpr = Math.min(2, window.devicePixelRatio || 1); W = window.innerWidth; H = window.innerHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function seed() {
    mode = document.documentElement.getAttribute("data-fx") || "stars";
    var n = mode === "rain" ? 70 : mode === "petals" ? 26 : mode === "embers" ? 40 : 140;
    if (W < 700) n = Math.round(n * 0.6);
    parts = [];
    for (var i = 0; i < n; i++) parts.push(make(true));
  }
  function make(any) {
    var p = { x: rnd(0, W), y: any ? rnd(0, H) : -20, s: rnd(0.4, 1), r: rnd(0, 6.28), t: rnd(0, 100) };
    if (mode === "embers" && !any) p.y = H + 20;
    return p;
  }
  function draw() {
    ctx.clearRect(0, 0, W, H);
    var a1 = css("--a1"), a2 = css("--a2");
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      if (mode === "rain") {
        if (!still) { p.y += 6 * p.s + 2; }
        ctx.strokeStyle = i % 4 === 0 ? a2 : a1; ctx.globalAlpha = 0.10 + 0.22 * p.s; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x, p.y + 18 * p.s + 6); ctx.stroke();
        if (p.y > H) parts[i] = make(false);
      } else if (mode === "petals") {
        if (!still) { p.y += 0.6 + 0.8 * p.s; p.x += Math.sin((p.t += 0.01)) * 0.6 + 0.3; p.r += 0.01; }
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.globalAlpha = 0.35 + 0.4 * p.s; ctx.fillStyle = a1;
        ctx.beginPath(); ctx.ellipse(0, 0, 7 * p.s + 2, 3.5 * p.s + 1, 0, 0, 6.28); ctx.fill(); ctx.restore();
        if (p.y > H + 20 || p.x > W + 20) parts[i] = make(false);
      } else if (mode === "embers") {
        if (!still) { p.y -= 0.5 + 1.1 * p.s; p.x += Math.sin((p.t += 0.02)) * 0.5; }
        ctx.globalAlpha = (0.25 + 0.6 * p.s) * (0.6 + 0.4 * Math.sin(p.t * 3)); ctx.fillStyle = i % 3 ? a1 : a2;
        ctx.beginPath(); ctx.arc(p.x, p.y, 1.2 + 1.8 * p.s, 0, 6.28); ctx.fill();
        if (p.y < -20) parts[i] = make(false);
      } else {
        if (!still) p.t += 0.02 * p.s;
        ctx.globalAlpha = 0.25 + 0.55 * Math.abs(Math.sin(p.t)) * p.s; ctx.fillStyle = i % 7 === 0 ? a2 : (i % 5 === 0 ? a1 : "#ffffff");
        ctx.beginPath(); ctx.arc(p.x, p.y, 0.5 + 1.3 * p.s, 0, 6.28); ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }
  function loop() { draw(); if (!still) raf = requestAnimationFrame(loop); }
  window.addEventListener("resize", function () { resize(); seed(); if (still) draw(); });
  new MutationObserver(function () { if ((document.documentElement.getAttribute("data-fx") || "") !== mode) { seed(); if (still) draw(); } })
    .observe(document.documentElement, { attributes: true, attributeFilter: ["data-fx", "style"] });
  document.addEventListener("visibilitychange", function () { if (document.hidden) cancelAnimationFrame(raf); else if (!still) { cancelAnimationFrame(raf); loop(); } });
  if (document.body) mount(); else document.addEventListener("DOMContentLoaded", mount);
})();
