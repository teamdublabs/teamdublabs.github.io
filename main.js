// Oscilloscope hero: an orange phosphor trace sweeping a "W" waveform.
(() => {
  const canvas = document.getElementById("scope");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let w = 0, h = 0, dpr = 1;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // The signal: flat baseline with one "W" letterform per sweep.
  // Keypoints as [fraction of width, amplitude] where -1 is the top peak.
  const KEYS = [
    [0.00, 0], [0.30, 0],
    [0.36, -1], [0.46, 1], [0.55, -0.30], [0.64, 1], [0.74, -1],
    [0.80, 0], [1.00, 0],
  ];

  function signal(t) {
    for (let i = 1; i < KEYS.length; i++) {
      if (t <= KEYS[i][0]) {
        const [t0, v0] = KEYS[i - 1];
        const [t1, v1] = KEYS[i];
        const u = (t - t0) / (t1 - t0);
        const s = (1 - Math.cos(u * Math.PI)) / 2; // cosine ease between keys
        return v0 + (v1 - v0) * s;
      }
    }
    return 0;
  }

  function pointAt(t, jitter) {
    const cy = h * 0.40;          // trace rides the upper-middle of the hero
    const amp = h * 0.16;
    let y = cy + signal(t) * amp;
    if (jitter) y += (Math.random() - 0.5) * 1.4;
    return { x: t * w, y };
  }

  // --- static fallback: draw the full trace once, no animation ---
  function drawStatic() {
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = "#ff6b1a";
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";
    ctx.shadowColor = "rgba(255, 107, 26, 0.8)";
    ctx.shadowBlur = 10;
    ctx.beginPath();
    for (let px = 0; px <= w; px += 3) {
      const p = pointAt(px / w, false);
      px === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();
  }

  // --- animated phosphor sweep ---
  const SWEEP_MS = 5200;   // one pass across the screen
  const DECAY_MS = 2400;   // how long the phosphor glows behind the beam
  let trail = [];          // { x, y, born }
  let sweepStart = null;

  function frame(now) {
    if (sweepStart === null) sweepStart = now;
    let t = (now - sweepStart) / SWEEP_MS;
    if (t >= 1) {          // retrace: restart sweep, keep fading trail
      sweepStart = now;
      t = 0;
    }

    const head = pointAt(t, true);
    trail.push({ x: head.x, y: head.y, born: now });
    trail = trail.filter((p) => now - p.born < DECAY_MS && !(p.x > head.x && t < 0.05));

    ctx.clearRect(0, 0, w, h);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // glow pass, then core pass
    for (const pass of [
      { width: 5, blur: 18, alphaScale: 0.35 },
      { width: 1.8, blur: 0, alphaScale: 1 },
    ]) {
      ctx.lineWidth = pass.width;
      ctx.shadowBlur = pass.blur;
      ctx.shadowColor = "rgba(255, 107, 26, 0.9)";
      for (let i = 1; i < trail.length; i++) {
        const a = trail[i - 1], b = trail[i];
        if (b.x < a.x) continue; // don't connect across the retrace jump
        const age = (now - b.born) / DECAY_MS;
        ctx.strokeStyle = `rgba(255, 107, 26, ${(1 - age) * pass.alphaScale})`;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }

    // the beam head
    ctx.shadowBlur = 22;
    ctx.shadowColor = "#ff6b1a";
    ctx.fillStyle = "#ffd9bf";
    ctx.beginPath();
    ctx.arc(head.x, head.y, 2.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    requestAnimationFrame(frame);
  }

  resize();
  window.addEventListener("resize", () => {
    resize();
    if (reduceMotion) drawStatic();
  });

  if (reduceMotion) {
    drawStatic();
  } else {
    requestAnimationFrame(frame);
  }
})();
