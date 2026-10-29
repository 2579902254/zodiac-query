/* ============================================================
 * render.js — 共享渲染层
 * 主站 / 12 个星座独立页 / 星座配对矩阵共同依赖
 * 星图 SVG · 星座详情模板 · 日期→星座 · 配对评分 · 今日星象
 * ============================================================ */
(function () {
  'use strict';

  var STAT_LATIN = {
    能量: 'ENERGY',
    情感: 'EMOTION',
    直觉: 'INTUITION',
    理性: 'REASON'
  };

  var ELEMENT_LATIN = { fire: 'FIRE', earth: 'EARTH', air: 'AIR', water: 'WATER' };

  var ELEMENT_NAMES = { fire: '火象', earth: '土象', air: '风象', water: '水象' };

  /* 元素互补：火 ↔ 风，土 ↔ 水 */
  var ELEMENT_PARTNER = { fire: 'air', air: 'fire', earth: 'water', water: 'earth' };

  var BANDS = [
    {
      min: 90,
      label: '同频共振',
      latin: 'RESONANCE',
      note: '几乎不需要解释就能彼此理解，节奏天然对齐。'
    },
    {
      min: 82,
      label: '高度契合',
      latin: 'HARMONY',
      note: '共鸣与互补并存，分歧也能被快速消化。'
    },
    {
      min: 74,
      label: '顺畅互补',
      latin: 'FLOW',
      note: '差异恰好拼成完整拼图，稍加磨合即顺畅。'
    },
    {
      min: 66,
      label: '需要磨合',
      latin: 'FRICTION',
      note: '表达节奏不同，需要主动建立共同语言。'
    },
    {
      min: 0,
      label: '差异显著',
      latin: 'DIVERGENCE',
      note: '底层驱动力相差较大，留出各自空间反而更稳。'
    }
  ];

  var NARRATIVE = {
    same:
      '同属{el}，共享同一套情绪语言：理解来得很快，也容易一起把某个特质放大到极致。',
    partner:
      '{a}遇上{b}，一个负责点火，一个负责扩音：你们在对方身上看到自己缺的那一半。',
    other:
      '{a}与{b}的底层驱动力不同，节奏、表达方式与安全感来源都需要重新对齐。'
  };

  var DAILY_WORDS = {
    fire: ['推进', '热度', '果断', '显形', '启动'],
    earth: ['落地', '沉淀', '秩序', '手感', '兑现'],
    air: ['对话', '灵感', '连接', '视角', '交换'],
    water: ['共感', '直觉', '修复', '沉浸', '边界']
  };

  var DAILY_GOOD = [
    '把最想说的话一次说清',
    '先做五分钟，再决定要不要继续',
    '整理一个角落，让秩序回来',
    '给很久没联系的人发一条消息',
    '把想法写下来，而不是反复想',
    '允许自己慢半拍',
    '为一件小事认真庆祝',
    '离开屏幕走十分钟',
    '接受一个不完美的方案',
    '把注意力放回身体的感觉'
  ];

  var DAILY_AVOID = [
    '在情绪高点做决定',
    '用沉默代替沟通',
    '把别人的评价当成结论',
    '同时开启太多条战线',
    '在深夜回复那条消息',
    '拿自己的时间线和别人比较',
    '为了合群修改自己的边界',
    '把疲惫误判成不够努力',
    '一次性答应所有请求',
    '在没弄懂规则前先下注'
  ];

  /* ---------------- 基础工具 ---------------- */
  function signs() {
    return window.ZODIAC_SIGNS || [];
  }

  function byId(id) {
    var list = signs();
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) return list[i];
    }
    return null;
  }

  function indexOfSign(sign) {
    return signs().indexOf(sign);
  }

  function pad(n) {
    return n < 10 ? '0' + n : String(n);
  }

  function accent(hue) {
    return 'hsl(' + hue + ' 92% 66%)';
  }

  function fact(label, value) {
    return '<div class="fact"><dt>' + label + '</dt><dd>' + value + '</dd></div>';
  }

  function dateKey(date) {
    return date.getFullYear() + '.' + pad(date.getMonth() + 1) + '.' + pad(date.getDate());
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

  /* ---------------- 详情模板 ---------------- */
  function detailTemplate(sign, options) {
    options = options || {};

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

    var queryLine = options.queryDate
      ? ' · 查询 ' + pad(options.queryDate.getMonth() + 1) + '.' + pad(options.queryDate.getDate())
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

  /* 参数条入场动画（切换星座时重播） */
  function animateStats(root) {
    var fills = root.querySelectorAll('.stat__fill');
    for (var i = 0; i < fills.length; i++) {
      fills[i].style.width = fills[i].getAttribute('data-value') + '%';
    }
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
    var list = signs();
    for (var i = 0; i < list.length; i++) {
      if (inRange(month, day, list[i].start, list[i].end)) return list[i];
    }
    return null;
  }

  /* ---------------- 确定性伪随机 ---------------- */
  function hash32(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function seeded(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* ---------------- 星座配对评分 ---------------- */
  function pairScore(a, b) {
    if (!a || !b) return 0;
    if (a.id === b.id) return 93;

    var base;
    if (a.element === b.element) base = 85;
    else if (ELEMENT_PARTNER[a.element] === b.element) base = 79;
    else base = 63;

    if (a.modality === b.modality) base += 3;

    // 对称抖动：同一对星座无论顺序如何得分一致
    var key = [a.id, b.id].sort().join('|');
    base += (hash32(key) % 11) - 5;

    return Math.max(52, Math.min(98, base));
  }

  function pairBand(score) {
    for (var i = 0; i < BANDS.length; i++) {
      if (score >= BANDS[i].min) return BANDS[i];
    }
    return BANDS[BANDS.length - 1];
  }

  function pairNarrative(a, b) {
    var text;
    if (a.element === b.element) text = NARRATIVE.same;
    else if (ELEMENT_PARTNER[a.element] === b.element) text = NARRATIVE.partner;
    else text = NARRATIVE.other;

    return text
      .replace('{el}', a.elementName)
      .replace('{a}', a.name + '（' + a.elementName + '）')
      .replace('{b}', b.name + '（' + b.elementName + '）');
  }

  /* ---------------- 今日星象（日期 + 星座 确定性生成） ---------------- */
  function daily(sign, date) {
    date = date || new Date();
    var key =
      date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate());
    var rnd = seeded(hash32(key + '|' + sign.id));

    var pool = DAILY_WORDS[sign.element] || DAILY_WORDS.water;
    var first = sign.keyword.split(' · ')[0];
    var second = pool[Math.floor(rnd() * pool.length)];
    if (second === first) second = pool[(pool.indexOf(second) + 1) % pool.length];

    var good = DAILY_GOOD[Math.floor(rnd() * DAILY_GOOD.length)];
    var avoid = DAILY_AVOID[Math.floor(rnd() * DAILY_AVOID.length)];
    var score = 54 + Math.floor(rnd() * 45);
    var band =
      score >= 86 ? '高能日' : score >= 72 ? '平稳日' : score >= 62 ? '起伏日' : '低电量';

    return {
      key: key,
      label: dateKey(date),
      words: [first, second],
      good: good,
      avoid: avoid,
      score: score,
      band: band,
      line:
        '今日主旋律「' + first + ' · ' + second + '」。与其等待状态，不如' + good + '。'
    };
  }

  function transmissionTemplate(sign, date) {
    var d = daily(sign, date);
    return (
      '<div class="panel__label"><span aria-hidden="true">◆</span> TODAY&rsquo;S TRANSMISSION · 今日星象</div>' +
      '<div class="tst__head">' +
        '<span class="tst__sign"><i aria-hidden="true">' + sign.symbol + '</i>' +
          sign.name + '<em>' + sign.en + '</em></span>' +
        '<span class="tst__date">' + d.label + '</span>' +
        '<span class="tst__band">' + d.band + ' · ' + d.score + '</span>' +
      '</div>' +
      '<p class="tst__line">' + d.line + '</p>' +
      '<div class="tst__grid">' +
        '<div class="tst__cell"><span>关键词 / KEYWORDS</span><b>' +
          d.words.join(' · ') + '</b></div>' +
        '<div class="tst__cell"><span>宜 / DO</span><b>' + d.good + '</b></div>' +
        '<div class="tst__cell"><span>忌 / AVOID</span><b>' + d.avoid + '</b></div>' +
      '</div>' +
      '<p class="tst__note">※ 文案由「日期 + 星座」哈希确定性生成，每日一换；纯属娱乐，不构成任何建议。</p>'
    );
  }

  /* ---------------- 系统时钟 ---------------- */
  function startClock(el) {
    var target = el || document.getElementById('sys-clock');
    if (!target) return;

    function tick() {
      var now = new Date();
      target.textContent =
        pad(now.getHours()) + ':' + pad(now.getMinutes()) + ':' + pad(now.getSeconds());
    }

    tick();
    window.setInterval(tick, 1000);
  }

  /* ---------------- 导出 ---------------- */
  window.ZQ = {
    STAT_LATIN: STAT_LATIN,
    ELEMENT_LATIN: ELEMENT_LATIN,
    ELEMENT_NAMES: ELEMENT_NAMES,
    ELEMENT_PARTNER: ELEMENT_PARTNER,
    BANDS: BANDS,
    pad: pad,
    accent: accent,
    fact: fact,
    dateKey: dateKey,
    signs: signs,
    byId: byId,
    indexOfSign: indexOfSign,
    buildStarmap: buildStarmap,
    detailTemplate: detailTemplate,
    animateStats: animateStats,
    inRange: inRange,
    findSign: findSign,
    pairScore: pairScore,
    pairBand: pairBand,
    pairNarrative: pairNarrative,
    daily: daily,
    transmissionTemplate: transmissionTemplate,
    startClock: startClock
  };
})();
