/* ============================================================
 * starfield.js — 深空星场背景
 * 视差 / 闪烁 / 偶发流星；支持 DPR、可见性暂停、
 * prefers-reduced-motion 降级为静态星空
 * ============================================================ */
(function () {
  'use strict';

  var canvas = document.getElementById('starfield');
  if (!canvas || !canvas.getContext) return;

  var ctx = canvas.getContext('2d');
  var TAU = Math.PI * 2;
  var mql = window.matchMedia('(prefers-reduced-motion: reduce)');
  var reduce = mql.matches;

  var W = 0;
  var H = 0;
  var stars = [];
  var meteors = [];
  var pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  var last = 0;
  var cooldown = 3;
  var rafId = null;

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    var count = Math.max(90, Math.min(300, Math.round((W * H) / 6800)));
    stars = [];
    for (var i = 0; i < count; i++) {
      var depth = rand(0.28, 1);
      stars.push({
        x: rand(0, W),
        y: rand(0, H),
        depth: depth,
        r: rand(0.3, 1.25) * depth + 0.22,
        base: rand(0.22, 0.9),
        phase: rand(0, TAU),
        twinkle: rand(0.5, 2.1),
        drift: rand(0.5, 1.8) * depth
      });
    }

    if (reduce) {
      ctx.clearRect(0, 0, W, H);
      paintStars(0, 0, true);
    }
  }

  function paintStars(time, dt, still) {
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      if (!still) {
        s.y -= s.drift * dt;
        if (s.y < -4) {
          s.y = H + 4;
          s.x = rand(0, W);
        }
      }

      var px = s.x + pointer.x * s.depth * 20;
      var py = s.y + pointer.y * s.depth * 20;
      var alpha = still
        ? s.base
        : s.base * (0.58 + 0.42 * Math.sin(time * s.twinkle + s.phase));

      if (s.r > 1.05) {
        ctx.beginPath();
        ctx.arc(px, py, s.r * 3.4, 0, TAU);
        ctx.fillStyle = 'rgba(110, 195, 255, ' + (alpha * 0.1).toFixed(3) + ')';
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(px, py, s.r, 0, TAU);
      ctx.fillStyle = 'rgba(226, 244, 255, ' + alpha.toFixed(3) + ')';
      ctx.fill();
    }
  }

  function spawnMeteor() {
    var angle = rand(Math.PI * 0.63, Math.PI * 0.79);
    var speed = rand(520, 880);
    meteors.push({
      x: rand(W * 0.12, W * 1.05),
      y: rand(-80, H * 0.45),
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      len: rand(90, 190)
    });
  }

  function paintMeteors(dt) {
    for (var i = meteors.length - 1; i >= 0; i--) {
      var m = meteors[i];
      m.x += m.vx * dt;
      m.y += m.vy * dt;
      m.life -= dt * 0.5;

      if (m.life <= 0 || m.x < -260 || m.y > H + 260) {
        meteors.splice(i, 1);
        continue;
      }

      var tx = m.x - (m.vx / speedOfMeteor(m)) * m.len;
      var ty = m.y - (m.vy / speedOfMeteor(m)) * m.len;
      var grad = ctx.createLinearGradient(m.x, m.y, tx, ty);
      grad.addColorStop(0, 'rgba(214, 247, 255, ' + (0.9 * m.life).toFixed(3) + ')');
      grad.addColorStop(0.42, 'rgba(110, 215, 255, ' + (0.36 * m.life).toFixed(3) + ')');
      grad.addColorStop(1, 'rgba(110, 215, 255, 0)');

      ctx.beginPath();
      ctx.moveTo(m.x, m.y);
      ctx.lineTo(tx, ty);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.3;
      ctx.lineCap = 'round';
      ctx.stroke();
    }
  }

  function speedOfMeteor(m) {
    return Math.sqrt(m.vx * m.vx + m.vy * m.vy) || 1;
  }

  function loop(now) {
    var dt = last ? Math.min((now - last) / 1000, 0.05) : 0.016;
    var time = now / 1000;
    last = now;

    pointer.x += (pointer.tx - pointer.x) * 0.055;
    pointer.y += (pointer.ty - pointer.y) * 0.055;

    ctx.clearRect(0, 0, W, H);
    paintStars(time, dt, false);

    cooldown -= dt;
    if (cooldown <= 0) {
      cooldown = rand(3.2, 8.5);
      spawnMeteor();
    }
    paintMeteors(dt);

    rafId = window.requestAnimationFrame(loop);
  }

  function start() {
    if (rafId !== null) return;
    last = 0;
    rafId = window.requestAnimationFrame(loop);
  }

  function stop() {
    if (rafId === null) return;
    window.cancelAnimationFrame(rafId);
    rafId = null;
  }

  var resizeTimer = null;
  window.addEventListener(
    'resize',
    function () {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(resize, 160);
    },
    { passive: true }
  );

  window.addEventListener(
    'pointermove',
    function (e) {
      pointer.tx = e.clientX / W - 0.5;
      pointer.ty = e.clientY / H - 0.5;
    },
    { passive: true }
  );

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      stop();
    } else if (!reduce) {
      start();
    }
  });

  if (typeof mql.addEventListener === 'function') {
    mql.addEventListener('change', function (e) {
      reduce = e.matches;
      stop();
      if (reduce) {
        ctx.clearRect(0, 0, W, H);
        paintStars(0, 0, true);
      } else {
        start();
      }
    });
  }

  resize();
  if (!reduce) start();
})();
