/* ============================================================
 * card.js — OG 分享图（1200×630）数据填充
 * 用法：og/card.html?sign=aries  |  og/card.html?page=match  |  og/card.html
 * 说明：仅用于本地/CI 截图生成 og/*.png，页面本身已 noindex。
 * ============================================================ */
(function () {
  'use strict';

  var SIGNS = [
    { id: 'aries', name: '白羊座', en: 'Aries', symbol: '♈', range: '03.21 — 04.19', info: '火象 · 基本宫 · 守护星 火星', hue: 10 },
    { id: 'taurus', name: '金牛座', en: 'Taurus', symbol: '♉', range: '04.20 — 05.20', info: '土象 · 固定宫 · 守护星 金星', hue: 42 },
    { id: 'gemini', name: '双子座', en: 'Gemini', symbol: '♊', range: '05.21 — 06.21', info: '风象 · 变动宫 · 守护星 水星', hue: 190 },
    { id: 'cancer', name: '巨蟹座', en: 'Cancer', symbol: '♋', range: '06.22 — 07.22', info: '水象 · 基本宫 · 守护星 月亮', hue: 208 },
    { id: 'leo', name: '狮子座', en: 'Leo', symbol: '♌', range: '07.23 — 08.22', info: '火象 · 固定宫 · 守护星 太阳', hue: 30 },
    { id: 'virgo', name: '处女座', en: 'Virgo', symbol: '♍', range: '08.23 — 09.22', info: '土象 · 变动宫 · 守护星 水星', hue: 158 },
    { id: 'libra', name: '天秤座', en: 'Libra', symbol: '♎', range: '09.23 — 10.23', info: '风象 · 基本宫 · 守护星 金星', hue: 300 },
    { id: 'scorpio', name: '天蝎座', en: 'Scorpio', symbol: '♏', range: '10.24 — 11.22', info: '水象 · 固定宫 · 守护星 冥王星', hue: 348 },
    { id: 'sagittarius', name: '射手座', en: 'Sagittarius', symbol: '♐', range: '11.23 — 12.21', info: '火象 · 变动宫 · 守护星 木星', hue: 20 },
    { id: 'capricorn', name: '摩羯座', en: 'Capricorn', symbol: '♑', range: '12.22 — 01.19', info: '土象 · 基本宫 · 守护星 土星', hue: 168 },
    { id: 'aquarius', name: '水瓶座', en: 'Aquarius', symbol: '♒', range: '01.20 — 02.18', info: '风象 · 固定宫 · 守护星 天王星', hue: 196 },
    { id: 'pisces', name: '双鱼座', en: 'Pisces', symbol: '♓', range: '02.19 — 03.20', info: '水象 · 变动宫 · 守护星 海王星', hue: 272 }
  ];

  var el = {
    symbol: document.getElementById('symbol'),
    name: document.getElementById('name'),
    label: document.getElementById('label'),
    desc: document.getElementById('desc'),
    url: document.getElementById('url'),
    tag: document.getElementById('tag')
  };

  function setTheme(hue) {
    document.documentElement.style.setProperty('--hue', hue);
  }

  var params = new URLSearchParams(window.location.search);
  var signId = params.get('sign');
  var page = params.get('page');
  var sign = null;

  for (var i = 0; i < SIGNS.length; i++) {
    if (SIGNS[i].id === signId) sign = SIGNS[i];
  }

  if (sign) {
    setTheme(sign.hue);
    el.symbol.textContent = sign.symbol;
    el.name.textContent = sign.name;
    el.label.textContent = sign.en.toUpperCase() + ' · ' + sign.range;
    el.desc.textContent = sign.info;
    el.url.textContent = '2579902254.github.io/zodiac-query/' + sign.id + '/';
    el.tag.textContent = 'ZODIAC ARCHIVE · v1.1';
    document.title = sign.name + ' · OG CARD';
    return;
  }

  if (page === 'match') {
    setTheme(196);
    el.symbol.textContent = '✧';
    el.name.textContent = '星座配对矩阵';
    el.label.textContent = 'PAIRING MATRIX · 12 × 12';
    el.desc.textContent = '元素 × 三形态 · 144 组组合相性读数';
    el.url.textContent = '2579902254.github.io/zodiac-query/match/';
    el.tag.textContent = 'COMPATIBILITY GRID · v1.1';
    document.title = '配对矩阵 · OG CARD';
    return;
  }

  setTheme(190);
  el.symbol.textContent = '✦';
  el.name.textContent = '星轨星座查询终端';
  el.label.textContent = 'CELESTIAL QUERY · STAR-LINK';
  el.desc.textContent = '十二宫档案 · 12×12 配对矩阵 · 每日星象';
  el.url.textContent = '2579902254.github.io/zodiac-query/';
  el.tag.textContent = 'STAR-LINK TERMINAL · v1.1';
  document.title = '首页 · OG CARD';
})();
