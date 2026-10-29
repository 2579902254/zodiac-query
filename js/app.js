/* ============================================================
 * app.js — 交互逻辑
 * 轮盘生成 / 星图绘制 / 生日解析（含跨年边界） / 详情渲染
 * ============================================================ */
(function () {
  'use strict';

  var SIGNS = window.ZODIAC_SIGNS || [];
  if (!SIGNS.length) return;

  var STAT_LATIN = {
    能量: 'ENERGY',
    情感: 'EMOTION',
    直觉: 'INTUITION',
    理性: 'REASON'
  };

  var ELEMENT_LATIN = {
    fire: 'FIRE',
    earth: 'EARTH',
    air: 'AIR',
    water: 'WATER'
  };

  var DEFAULT_HINT = '支持 1900—2100 年任意日期；未选择日期时按今日解析。';

  var wheel = document.getElementById('wheel');
  var detail = document.getElementById('detail');
  var coreSymbol = document.getElementById('core-symbol');
  var coreName = document.getElementById('core-name');
  var clock = document.getElementById('sys-clock');
  var form = document.getElementById('query-form');
  var input = document.getElementById('birthdate');
  var hint = document.getElementById('query-hint');

  var buttons = [];
  var currentIndex = 0;

  /* ---------------- 工具 ---------------- */
  function pad(n) {
    return n < 10 ? '0' + n : String(n);
  }

  function accent(hue) {
    return 'hsl(' + hue + ' 92% 66%)';
  }

  function fact(label, value) {
    return '<div class="fact"><dt>' + label + '</dt><dd>' + value + '</dd></div>';
  }

  /* ---------------- 星图 ---------------- */
  function buildStarmap(sign) {
    var pts = sign.stars;
    var out = [
      '<svg viewBox="0 0 100 100" role="img" aria-label="' +
        sign.name + ' 星图连线示意图">'
    ];

    // 背景碎星（固定伪随机，保证每次渲染一致）
    for (var i = 0; i < 28; i++) {
      var bx = ((i * 37 + 13) % 94) + 3;
      var by = ((i * 53 + 29) % 90) + 4;
      var br = i % 6 === 0 ? 0.6 : 0.32;
      var bo = 0.1 + (i % 4) * 0.055;
      out.push(
        '<circle cx="' + bx + '" cy="' + by + '" r="' + br +
          '" fill="#cfe9ff" opacity="' + bo.toFixed(2) + '"/>'
      );
    }

    out.push('<g class="map-group">');

    sign.links.forEach(function (link, idx) {
      var a = pts[link[0]];
      var b = pts[link[1]];
      if (!a || !b) return;
      var len = Math.sqrt(
        Math.pow(b[0] - a[0], 2) + Math.pow(b[1] - a[1], 2)
      ).toFixed(2);
      out.push(
        '<line class="map-line" x1="' + a[0] + '" y1="' + a[1] +
          '" x2="' + b[0] + '" y2="' + b[1] + '"' +
          ' style="stroke-dasharray:' + len + ';stroke-dashoffset:' + len +
          ';animation-delay:' + (idx * 0.07).toFixed(2) + 's"/>'
      );
    });

    pts.forEach(function (p, i) {
      out.push(
        '<circle class="map-halo" cx="' + p[0] + '" cy="' + p[1] +
          '" r="' + (i === 0 ? 3 : 2.4) + '"/>'
      );
      out.push(
        '<circle class="map-star" cx="' + p[0] + '" cy="' + p[1] +
          '" r="' + (i === 0 ? 1.55 : 1.1) + '"/>'
      );
    });

    out.push('</g></svg>');
    return out.join('');
  }

  /* ---------------- 详情渲染 ---------------- */
  function template(sign, queryDate) {
    var stats = Object.keys(sign.stats)
      .map(function (key) {
        var val = sign.stats[key];
        return (
          '<div class="stat">' +
            '<span class="stat__name" title="' + (STAT_LATIN[key] || '') + '">' +
              key +
            '</span>' +
            '<span class="stat__track">' +
              '<span class="stat__fill" data-value="' + val + '"></span>' +
            '</span>' +
            '<span class="stat__val">' + val + '</span>' +
          '</div>'
        );
      })
      .join('');

    var traits = sign.traits
      .map(function (t) {
        return '<li>' + t + '</li>';
      })
      .join('');

    var queryLine = queryDate
      ? ' · 查询 ' + pad(queryDate.getMonth() + 1) + '.' + pad(queryDate.getDate())
      : '';

    return (
      '<div class="detail__head">' +
        '<div class="detail__badge" aria-hidden="true">' + sign.symbol + '</div>' +
        '<div class="detail__id">' +
          '<h2 class="detail__name">' + sign.name +
            '<em>' + sign.en + '</em>' +
          '</h2>' +
          '<p class="detail__range">' + sign.range + ' · ' + sign.house +
            queryLine +
          '</p>' +
        '</div>' +
        '<div class="detail__chip">' + sign.elementName + ' · ' + sign.modality + '</div>' +
      '</div>' +
      '<div class="detail__grid">' +
        '<figure class="starmap">' +
          buildStarmap(sign) +
          '<figcaption>' + sign.en + ' · 星图连线示意</figcaption>' +
        '</figure>' +
        '<div class="detail__body">' +
          '<p class="detail__keyword">' + sign.keyword + '</p>' +
          '<p class="detail__intro">' + sign.intro + '</p>' +
          '<ul class="traits">' + traits + '</ul>' +
          '<dl class="facts">' +
            fact('守护星 / RULER', sign.ruler) +
            fact('宫位 / HOUSE', sign.house) +
            fact('幸运色 / COLOR', sign.luckyColor) +
            fact('幸运石 / STONE', sign.luckyStone) +
          '</dl>' +
          '<div class="stats">' + stats + '</div>' +
          '<p class="detail__foot">ELEMENT ' +
            (ELEMENT_LATIN[sign.element] || '') +
            ' // DATA SOURCE: TRADITIONAL ASTROLOGY<br>' +
            '星图连线为形状示意，非精确星表坐标' +
          '</p>' +
        '</div>' +
      '</div>'
    );
  }

  function renderDetail(sign, options) {
    options = options || {};
    detail.style.setProperty('--hue', sign.hue);
    detail.innerHTML = template(sign, options.queryDate);

    // 重播面板入场动画
    detail.style.animation = 'none';
    void detail.offsetWidth;
    detail.style.animation = '';

    window.requestAnimationFrame(function () {
      var fills = detail.querySelectorAll('.stat__fill');
      for (var i = 0; i < fills.length; i++) {
        fills[i].style.width = fills[i].getAttribute('data-value') + '%';
      }
    });
  }

  /* ---------------- 轮盘 ---------------- */
  function buildWheel() {
    SIGNS.forEach(function (sign, index) {
      var angle = (index / SIGNS.length) * Math.PI * 2 - Math.PI / 2;
      var btn = document.createElement('button');

      btn.type = 'button';
      btn.className = 'wheel__btn';
      btn.style.left = (50 + Math.cos(angle) * 41.5).toFixed(2) + '%';
      btn.style.top = (50 + Math.sin(angle) * 41.5).toFixed(2) + '%';
      btn.style.setProperty('--btn-accent', accent(sign.hue));
      btn.textContent = sign.symbol;
      btn.title = sign.name + ' ' + sign.en;
      btn.setAttribute('aria-label', sign.name + ' ' + sign.en + '，' + sign.range);
      btn.setAttribute('aria-pressed', 'false');

      btn.addEventListener('click', function () {
        select(index, {});
        setHint(sign.range + ' · ' + sign.elementName + ' · 守护星 ' + sign.ruler, false);
      });

      buttons.push(btn);
      wheel.appendChild(btn);
    });

    wheel.addEventListener('keydown', function (event) {
      var delta = 0;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') delta = 1;
      else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') delta = -1;
      else return;

      event.preventDefault();
      var next = (currentIndex + delta + SIGNS.length) % SIGNS.length;
      select(next, {});
      buttons[next].focus();
    });
  }

  function select(index, options) {
    var sign = SIGNS[index];
    if (!sign) return;

    currentIndex = index;

    // 全局色相：面板角标、光晕随之变化
    document.documentElement.style.setProperty('--hue', sign.hue);
    coreSymbol.textContent = sign.symbol;
    coreName.textContent = sign.name;

    buttons.forEach(function (btn, i) {
      var active = i === index;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });

    renderDetail(sign, options);

    // 深度链接：便于直接分享某个星座（file:// 下可能受限，忽略异常）
    if (window.history && window.history.replaceState) {
      try {
        window.history.replaceState(null, '', '#' + sign.id);
      } catch (err) {
        /* noop */
      }
    }
  }

  function applyHash() {
    var id = String(window.location.hash || '').replace('#', '').trim();
    if (!id) return false;
    for (var i = 0; i < SIGNS.length; i++) {
      if (SIGNS[i].id === id) {
        select(i, {});
        return true;
      }
    }
    return false;
  }

  /* ---------------- 日期 → 星座 ---------------- */
  function inRange(month, day, start, end) {
    var value = month * 100 + day;
    var from = start[0] * 100 + start[1];
    var to = end[0] * 100 + end[1];
    // 摩羯座跨年：12.22 — 次年 01.19
    return from <= to ? value >= from && value <= to : value >= from || value <= to;
  }

  function findSign(month, day) {
    for (var i = 0; i < SIGNS.length; i++) {
      if (inRange(month, day, SIGNS[i].start, SIGNS[i].end)) return SIGNS[i];
    }
    return null;
  }

  /* ---------------- 提示条 ---------------- */
  function setHint(text, isError) {
    hint.textContent = text;
    hint.classList.toggle('is-error', !!isError);
  }

  /* ---------------- 查询表单 ---------------- */
  form.addEventListener('submit', function (event) {
    event.preventDefault();

    var raw = input.value.trim();
    var date;

    if (!raw) {
      date = new Date();
    } else {
      var parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);
      if (!parts) {
        setHint('日期无法解析，请使用日期选择器重新选择。', true);
        return;
      }

      var year = parseInt(parts[1], 10);
      var month = parseInt(parts[2], 10);
      var day = parseInt(parts[3], 10);
      date = new Date(year, month - 1, day);

      if (
        date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day
      ) {
        setHint('该日期不存在，请检查年 / 月 / 日。', true);
        return;
      }

      if (year < 1900 || year > 2100) {
        setHint('仅支持 1900—2100 年之间的日期。', true);
        return;
      }
    }

    var sign = findSign(date.getMonth() + 1, date.getDate());
    if (!sign) {
      setHint('未能匹配黄道星座，请重试。', true);
      return;
    }

    select(SIGNS.indexOf(sign), { queryDate: date });

    setHint(
      '解析完成：' +
        date.getFullYear() + '.' + pad(date.getMonth() + 1) + '.' + pad(date.getDate()) +
        ' → ' + sign.name + ' · ' + sign.en +
        (raw ? '' : '（今日星象）'),
      false
    );

    if (window.innerWidth <= 1020) {
      detail.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  input.addEventListener('input', function () {
    if (hint.classList.contains('is-error')) setHint(DEFAULT_HINT, false);
  });

  /* ---------------- 时钟 ---------------- */
  function tickClock() {
    var now = new Date();
    clock.textContent =
      pad(now.getHours()) + ':' + pad(now.getMinutes()) + ':' + pad(now.getSeconds());
  }

  /* ---------------- 初始化 ---------------- */
  buildWheel();

  var today = new Date();
  input.value =
    today.getFullYear() + '-' + pad(today.getMonth() + 1) + '-' + pad(today.getDate());

  var todaySign = findSign(today.getMonth() + 1, today.getDate());
  var todayIndex = todaySign ? SIGNS.indexOf(todaySign) : 0;

  // 先读取深链，避免首次渲染的 replaceState 覆盖地址栏 hash
  var hashId = String(window.location.hash || '').replace('#', '').trim();
  var startIndex = todayIndex;
  var fromHash = false;
  for (var h = 0; h < SIGNS.length; h++) {
    if (SIGNS[h].id === hashId) {
      startIndex = h;
      fromHash = true;
      break;
    }
  }

  select(startIndex, fromHash ? {} : { queryDate: today });

  if (fromHash) {
    setHint(
      SIGNS[startIndex].name + ' · ' + SIGNS[startIndex].range +
        ' · 通过链接定位',
      false
    );
  }

  window.addEventListener('hashchange', applyHash);

  tickClock();
  window.setInterval(tickClock, 1000);
})();

