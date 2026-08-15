/* ============================================================
   Team Dub Labs LTD. — presentation layer ("fancy")
   Companion to assets/fancy.css. Adds the `fx` class to <html>,
   builds the decorative nodes (dust canvas, grain, sweep,
   cursor), and drives reveals, parallax, and the occasional
   hero glitch.

   · No dependencies, no network requests.
   · Does nothing structural: content, layout, and the site's
     own behaviour (copy button, anchors, analytics) are
     untouched.
   · Honours prefers-reduced-motion (static site) and coarse
     pointers (no cursor/parallax).
   ============================================================ */
(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;
  var prm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(pointer: fine)').matches;

  root.classList.add('fx');

  /* ---------- scroll reveal ----------
     Groups are the direct children of each panel's .wrap.
     Long-form prose reveals only its structural blocks. */
  if (!prm && 'IntersectionObserver' in window) {
    var PROSE_BLOCK = /^(H1|H2|H3|UL|OL|FIGURE|TABLE)$/;
    var groups = Array.prototype.slice.call(
      doc.querySelectorAll('main .panel > .wrap'));

    var targets = [];

    /* Stronger masked entrance, first panel only, on the display
       elements themselves (not every block in a long article). */
    function heroLike(el) {
      return el.tagName === 'H1' ||
        el.classList.contains('mega') ||
        el.classList.contains('tag') ||
        el.classList.contains('sub') ||
        el.classList.contains('btn') ||
        el.classList.contains('headline') ||
        el.classList.contains('dek') ||
        el.classList.contains('byline');
    }

    groups.forEach(function (wrap, gi) {
      var kids;
      if (wrap.classList.contains('prose')) {
        kids = Array.prototype.filter.call(wrap.children, function (el) {
          return PROSE_BLOCK.test(el.tagName) ||
            el.classList.contains('prim') ||
            el.classList.contains('note') ||
            el.classList.contains('dek') ||
            el.classList.contains('byline');
        });
      } else {
        kids = Array.prototype.slice.call(wrap.children);
      }
      kids.forEach(function (el, i) {
        el.classList.add('fxr');
        if (gi === 0 && heroLike(el)) el.classList.add('fx-hero');
        el.style.setProperty('--fxd', Math.min(i * 90, 360) + 'ms');
        targets.push(el);
      });
    });

    if (targets.length) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          var el = en.target;
          io.unobserve(el);
          el.classList.add('fx-in');
          var delay = parseFloat(el.style.getPropertyValue('--fxd')) || 0;
          /* Drop the reveal classes once done so the element's
             original hover transitions come back unchanged. */
          window.setTimeout(function () {
            el.classList.remove('fxr', 'fx-in', 'fx-hero');
            el.style.removeProperty('--fxd');
          }, delay + 1000);
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });

      targets.forEach(function (el) { io.observe(el); });
    }
  }

  /* ---------- occasional hero glitch ---------- */
  if (!prm) {
    var hero = doc.querySelector('main .panel .mega');
    if (hero) {
      (function glitchLoop() {
        window.setTimeout(function () {
          hero.classList.add('fx-glitch');
          window.setTimeout(function () {
            hero.classList.remove('fx-glitch');
          }, 240);
          glitchLoop();
        }, 7000 + Math.random() * 8000);
      })();
    }
  }

  /* ---------- decorative nodes ---------- */
  var canvas = null, ctx = null, W = 0, H = 0, P = [];
  var orb = null, ring = null;

  function makeDecor() {
    var grain = doc.createElement('div');
    grain.className = 'fx-grain';
    grain.setAttribute('aria-hidden', 'true');
    doc.body.appendChild(grain);

    var sweep = doc.createElement('div');
    sweep.className = 'fx-sweep';
    sweep.setAttribute('aria-hidden', 'true');
    doc.body.appendChild(sweep);

    canvas = doc.createElement('canvas');
    canvas.id = 'fx-dust';
    canvas.setAttribute('aria-hidden', 'true');
    doc.body.appendChild(canvas);
    ctx = canvas.getContext('2d');

    if (fine) {
      orb = doc.createElement('div');
      orb.id = 'fx-orb';
      orb.setAttribute('aria-hidden', 'true');
      doc.body.appendChild(orb);

      ring = doc.createElement('div');
      ring.id = 'fx-ring';
      ring.setAttribute('aria-hidden', 'true');
      doc.body.appendChild(ring);
    }
    resize();
    seed();
  }

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function seed() {
    var n = Math.min(60, Math.floor(W / 22));
    P = [];
    for (var i = 0; i < n; i++) {
      var orange = Math.random() < 0.22;
      P.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.1 + 0.5,
        s: Math.random() * 0.2 + 0.06,
        w: Math.random() * 2 * Math.PI,
        ws: Math.random() * 0.004 + 0.001,
        o: orange ? 0.10 + Math.random() * 0.10 : 0.05 + Math.random() * 0.09,
        c: orange ? '255,95,21' : '29,29,31'
      });
    }
  }

  /* ---------- pointer: orb, ring, parallax ---------- */
  var mx = window.innerWidth / 2, my = window.innerHeight / 2;
  var ox = mx, oy = my;
  var px = 0, py = 0; /* lerped pointer offset from centre */

  var parallax = [];
  if (fine && !prm) {
    Array.prototype.forEach.call(
      doc.querySelectorAll('.slab .n'), function (el, i) {
        parallax.push({ el: el, d: Math.min(0.018 + i * 0.008, 0.045) });
      });
    var hero = doc.querySelector('main .panel .mega');
    if (hero) parallax.push({ el: hero, d: -0.012 });

    window.addEventListener('pointermove', function (e) {
      mx = e.clientX; my = e.clientY;
      ring.classList.remove('idle');
    }, { passive: true });

    doc.addEventListener('pointerover', function (e) {
      var t = e.target;
      ring.classList.toggle('hot',
        !!(t && t.closest && t.closest('a,button,.art')));
    });

    /* Dim the ring after a while of stillness. */
    var idleTimer = null;
    window.addEventListener('pointermove', function () {
      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(function () {
        ring.classList.add('idle');
      }, 2600);
    }, { passive: true });
  }

  /* ---------- single animation loop ---------- */
  var raf = null;

  function frame() {
    /* dust */
    ctx.clearRect(0, 0, W, H);
    for (var i = 0; i < P.length; i++) {
      var p = P[i];
      p.y -= p.s;
      p.w += p.ws;
      p.x += Math.sin(p.w) * 0.12;
      if (p.y < -4) { p.y = H + 4; p.x = Math.random() * W; }
      if (p.x < -4) p.x = W + 4; else if (p.x > W + 4) p.x = -4;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, 7);
      ctx.fillStyle = 'rgba(' + p.c + ',' + p.o + ')';
      ctx.fill();
    }

    if (fine) {
      /* orb + ring */
      ox += (mx - ox) * 0.08;
      oy += (my - oy) * 0.08;
      if (orb) orb.style.transform =
        'translate(' + ox + 'px,' + oy + 'px) translate(-50%,-50%)';
      if (ring) ring.style.transform =
        'translate(' + mx + 'px,' + my + 'px) translate(-50%,-50%)';

      /* parallax */
      px += ((mx - W / 2) - px) * 0.09;
      py += ((my - H / 2) - py) * 0.09;
      for (var j = 0; j < parallax.length; j++) {
        var t = parallax[j];
        t.el.style.transform =
          'translate3d(' + px * t.d + 'px,' + py * t.d + 'px,0)';
      }
    }

    raf = window.requestAnimationFrame(frame);
  }

  function start() {
    if (raf === null && !doc.hidden) {
      raf = window.requestAnimationFrame(frame);
    }
  }
  function stop() {
    if (raf !== null) {
      window.cancelAnimationFrame(raf);
      raf = null;
    }
  }

  if (!prm) {
    makeDecor();
    window.addEventListener('resize', resize, { passive: true });
    doc.addEventListener('visibilitychange', function () {
      if (doc.hidden) stop(); else start();
    });
    start();
  }
})();
