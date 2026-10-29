/* ============================================================
 * app.js — 主站交互逻辑
 * 轮盘生成 / 星座切换 / 生日解析 / 今日星象
 * 依赖：data.js（数据） + render.js（渲染与算法）
 * ============================================================ */
(function () {
  'use strict';

  var ZQ = window.ZQ;
  var SIGNS = window.ZODIAC_SIGNS || [];
  if (!ZQ || !SIGNS.length) return;

  var DEFAULT_HINT = '支持 1900—2100 年任意日期；未选择日期时按今日解析。';

  var wheel = document.getElementById('wheel');
  var detail = document.getElementById('detail');
  var coreSymbol = document.getElementById('core-symbol');
  var coreName = document.getElementById('core-name');
  var form = document.getElementById('query-form');
  var input = document.getElementById('birthdate');
  var hint = document.getElementById('query-hint');
  var transmission = document.getElementById('transmission');

  var buttons = [];
  var currentIndex = 0;

  /* ---------------- 提示条 ---------------- */
  function setHint(text, isError) {
    hint.textContent = text;
    hint.classList.toggle('is-error', !!isError);
  }

  /* ---------------- 渲染 ---------------- */
  function renderDetail(sign, options) {
    detail.style.setProperty('--hue', sign.hue);
    detail.innerHTML = ZQ.detailTemplate(sign, options);

    // 重播面板入场动画
    detail.style.animation = 'none';
    void detail.offsetWidth;
    detail.style.animation = '';

    window.requestAnimationFrame(function () {
      ZQ.animateStats(detail);
    });
  }

  function renderTransmission(sign, date) {
    if (!transmission) return;
    transmission.style.setProperty('--hue', sign.hue);
    transmission.innerHTML = ZQ.transmissionTemplate(sign, date);
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
      btn.style.setProperty('--btn-accent', ZQ.accent(sign.hue));
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
    renderTransmission(sign, options && options.queryDate ? options.queryDate : new Date());

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

    var sign = ZQ.findSign(date.getMonth() + 1, date.getDate());
    if (!sign) {
      setHint('未能匹配黄道星座，请重试。', true);
      return;
    }

    select(ZQ.indexOfSign(sign), { queryDate: date });

    setHint(
      '解析完成：' + ZQ.dateKey(date) + ' → ' + sign.name + ' · ' + sign.en +
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

  /* ---------------- 初始化 ---------------- */
  buildWheel();

  var today = new Date();
  input.value =
    today.getFullYear() + '-' + ZQ.pad(today.getMonth() + 1) + '-' + ZQ.pad(today.getDate());

  var todaySign = ZQ.findSign(today.getMonth() + 1, today.getDate());
  var todayIndex = todaySign ? ZQ.indexOfSign(todaySign) : 0;

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
      SIGNS[startIndex].name + ' · ' + SIGNS[startIndex].range + ' · 通过链接定位',
      false
    );
  }

  window.addEventListener('hashchange', applyHash);
  ZQ.startClock();
})();
