/* ============================================================
 * match.js — 星座配对矩阵
 * 12 × 12 矩阵渲染 / 元素相性评分 / 生日双输入 / 深链 #aries-leo
 * 依赖：data.js + render.js
 * ============================================================ */
(function () {
  'use strict';

  var ZQ = window.ZQ;
  var SIGNS = window.ZODIAC_SIGNS || [];
  if (!ZQ || !SIGNS.length) return;

  var matrix = document.getElementById('matrix');
  var readout = document.getElementById('pair-readout');
  var form = document.getElementById('pair-form');
  var inputA = document.getElementById('birth-a');
  var inputB = document.getElementById('birth-b');
  var note = document.getElementById('pair-note');

  /* ---------------- 矩阵 ---------------- */
  function buildMatrix() {
    var html = [
      '<div class="matrix__row matrix__row--head">',
      '<span class="matrix__corner">星座<em>PAIRING GRID</em></span>'
    ];

    SIGNS.forEach(function (s) {
      html.push(
        '<a class="matrix__col" href="../' + s.id + '/' +
          '" style="--cell-hue:' + s.hue + '" title="' + s.name + ' ' + s.en + '">' +
          '<i aria-hidden="true">' + s.symbol + '</i><em>' + s.name.slice(0, 2) + '</em></a>'
      );
    });

    html.push('</div>');

    SIGNS.forEach(function (row) {
      html.push('<div class="matrix__row">');
      html.push(
        '<a class="matrix__rowhead" href="../' + row.id + '/' +
          '" style="--cell-hue:' + row.hue + '">' +
          '<i aria-hidden="true">' + row.symbol + '</i><em>' + row.name + '</em></a>'
      );

      SIGNS.forEach(function (col) {
        var score = ZQ.pairScore(row, col);
        var band = ZQ.pairBand(score);
        html.push(
          '<button type="button" class="matrix__cell" data-a="' + row.id +
            '" data-b="' + col.id + '" data-band="' + band.min + '"' +
            ' aria-label="' + row.name + ' 与 ' + col.name + ' 配对指数 ' + score + '">' +
            '<b>' + score + '</b></button>'
        );
      });

      html.push('</div>');
    });

    matrix.innerHTML = html.join('');
    matrix.addEventListener('click', function (event) {
      var btn = event.target.closest ? event.target.closest('.matrix__cell') : null;
      if (!btn) return;
      show(btn.getAttribute('data-a'), btn.getAttribute('data-b'));
    });
  }

  function clearActive() {
    var prev = matrix.querySelectorAll('.matrix__cell.is-active');
    for (var i = 0; i < prev.length; i++) prev[i].classList.remove('is-active');
  }

  function markActive(aId, bId) {
    var el = matrix.querySelector(
      '.matrix__cell[data-a="' + aId + '"][data-b="' + bId + '"]'
    );
    if (el) el.classList.add('is-active');
  }

  /* ---------------- 读数面板 ---------------- */
  function side(sign) {
    return (
      '<a class="pair__side" href="../' + sign.id + '/" style="--cell-hue:' + sign.hue + '">' +
        '<i aria-hidden="true">' + sign.symbol + '</i>' +
        '<span><b>' + sign.name + '</b><em>' + sign.en + ' · ' + sign.range + '</em></span>' +
      '</a>'
    );
  }

  function meters(a, b, score) {
    var sameElement = a.element === b.element;
    var partnerElement = ZQ.ELEMENT_PARTNER[a.element] === b.element;
    var sameModality = a.modality === b.modality;
    var jitter = (score % 7) - 3;

    var items = [
      { name: '元素共鸣', latin: 'ELEMENT', value: sameElement ? 92 : partnerElement ? 84 : 58 },
      { name: '节奏同步', latin: 'TEMPO', value: sameModality ? 86 : 64 },
      {
        name: '沟通带宽',
        latin: 'COMMS',
        value: a.element === 'air' || b.element === 'air' ? 88 : 70
      },
      { name: '吸引力', latin: 'PULL', value: sameElement ? 90 : partnerElement ? 82 : 72 }
    ];

    return items
      .map(function (item) {
        var value = Math.max(40, Math.min(98, item.value + jitter));
        return (
          '<div class="pmeter">' +
            '<span class="pmeter__name">' + item.name + '<em>' + item.latin + '</em></span>' +
            '<span class="pmeter__track"><span class="pmeter__fill" style="width:' +
              value + '%"></span></span>' +
            '<span class="pmeter__val">' + value + '</span>' +
          '</div>'
        );
      })
      .join('');
  }

  function show(aId, bId, options) {
    options = options || {};

    var a = ZQ.byId(aId);
    var b = ZQ.byId(bId);
    if (!a || !b) return;

    clearActive();
    markActive(a.id, b.id);
    markActive(b.id, a.id);

    var score = ZQ.pairScore(a, b);
    var band = ZQ.pairBand(score);

    readout.style.setProperty('--hue', a.hue);
    readout.innerHTML =
      '<div class="pair__top">' +
        '<div class="pair__num"><b>' + score + '</b><span>配对指数 / SCORE</span></div>' +
        '<div class="pair__band"><b>' + band.label + '</b>' +
          '<em>' + band.latin + '</em><span>' + band.note + '</span></div>' +
      '</div>' +
      '<div class="pair__sides">' + side(a) +
        '<span class="pair__x" aria-hidden="true">×</span>' + side(b) +
      '</div>' +
      '<p class="pair__narrative">' + ZQ.pairNarrative(a, b) + '</p>' +
      '<div class="pair__meters">' + meters(a, b, score) + '</div>' +
      '<div class="pair__actions">' +
        (a.id === b.id
          ? '<span class="pair__same">同一星座 · 相似度高，也容易放大同一个盲点</span>'
          : '') +
        '<a class="btn btn--ghost" href="../' + a.id + '/">查看 ' + a.name + ' 档案 ⟶</a>' +
        '<a class="btn btn--ghost" href="../' + b.id + '/">查看 ' + b.name + ' 档案 ⟶</a>' +
      '</div>' +
      '<p class="pair__note">※ 评分由「元素（火土风水）+ 三形态（基本固定变动）」规则确定性演算，' +
        '同一对星座无论顺序得分一致；仅供娱乐，不构成关系建议。</p>';

    if (options.hash !== false && window.history && window.history.replaceState) {
      try {
        window.history.replaceState(null, '', '#' + a.id + '-' + b.id);
      } catch (err) {
        /* noop */
      }
    }

    if (options.scroll && window.innerWidth <= 1020) {
      readout.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  /* ---------------- 生日 → 配对 ---------------- */
  function parseDate(str) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(str || '').trim());
    if (!m) return null;

    var year = parseInt(m[1], 10);
    var month = parseInt(m[2], 10);
    var day = parseInt(m[3], 10);
    var date = new Date(year, month - 1, day);

    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      return null;
    }
    if (year < 1900 || year > 2100) return null;

    return date;
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    var dateA = parseDate(inputA.value);
    var dateB = parseDate(inputB.value);

    if (!dateA || !dateB) {
      note.textContent = '请输入两个有效日期（1900—2100 年）。';
      note.classList.add('is-error');
      return;
    }

    var signA = ZQ.findSign(dateA.getMonth() + 1, dateA.getDate());
    var signB = ZQ.findSign(dateB.getMonth() + 1, dateB.getDate());

    if (!signA || !signB) {
      note.textContent = '未能匹配星座，请检查日期是否完整。';
      note.classList.add('is-error');
      return;
    }

    note.classList.remove('is-error');
    note.textContent =
      ZQ.dateKey(dateA) + ' → ' + signA.name + '　×　' +
      ZQ.dateKey(dateB) + ' → ' + signB.name;

    show(signA.id, signB.id, { scroll: true });
  });

  [inputA, inputB].forEach(function (input) {
    input.addEventListener('input', function () {
      note.textContent = '两段日期均在本机解析，不会上传。';
      note.classList.remove('is-error');
    });
  });

  /* ---------------- 初始化 ---------------- */
  buildMatrix();

  var hash = String(window.location.hash || '').replace('#', '').trim();
  var matched = /^([a-z]+)-([a-z]+)$/.exec(hash);
  var first = matched ? matched[1] : '';
  var second = matched ? matched[2] : '';
  var fromHash = !!(ZQ.byId(first) && ZQ.byId(second));

  if (!fromHash) {
    var today = new Date();
    var todaySign =
      ZQ.findSign(today.getMonth() + 1, today.getDate()) || SIGNS[0];
    var partnerElement = ZQ.ELEMENT_PARTNER[todaySign.element];
    var partner =
      SIGNS.filter(function (s) {
        return s.element === partnerElement;
      })[0] || SIGNS[(ZQ.indexOfSign(todaySign) + 1) % SIGNS.length];

    first = todaySign.id;
    second = partner.id;

    inputA.value =
      today.getFullYear() + '-' + ZQ.pad(today.getMonth() + 1) + '-' + ZQ.pad(today.getDate());
  } else {
    inputA.value = '';
  }

  show(first, second, { hash: fromHash });

  window.addEventListener('hashchange', function () {
    var m = /^([a-z]+)-([a-z]+)$/.exec(String(window.location.hash || '').replace('#', ''));
    if (m && ZQ.byId(m[1]) && ZQ.byId(m[2])) show(m[1], m[2], { hash: false });
  });

  ZQ.startClock();
})();
