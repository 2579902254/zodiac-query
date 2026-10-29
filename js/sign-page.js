/* ============================================================
 * sign-page.js — 星座独立页
 * 单星座详情 + 今日星象，供 /<sign-id>/index.html 使用
 * 依赖：data.js + render.js
 * ============================================================ */
(function () {
  'use strict';

  var ZQ = window.ZQ;
  var SIGNS = window.ZODIAC_SIGNS || [];
  if (!ZQ || !SIGNS.length) return;

  var id = String(document.body.getAttribute('data-sign') || '').trim();
  var sign = ZQ.byId(id);

  if (!sign) {
    window.location.replace('../');
    return;
  }

  var detail = document.getElementById('detail');
  var transmission = document.getElementById('transmission');

  document.documentElement.style.setProperty('--hue', sign.hue);

  if (detail) {
    detail.style.setProperty('--hue', sign.hue);
    detail.innerHTML = ZQ.detailTemplate(sign, {});
    window.requestAnimationFrame(function () {
      ZQ.animateStats(detail);
    });
  }

  if (transmission) {
    transmission.style.setProperty('--hue', sign.hue);
    transmission.innerHTML = ZQ.transmissionTemplate(sign, new Date());
  }

  // 配对入口：链接到「本星座 × 元素互补星座」
  var partnerElement = ZQ.ELEMENT_PARTNER[sign.element];
  var partner = ZQ.signs().filter(function (s) {
    return s.element === partnerElement;
  })[0];

  if (partner) {
    var pairHref = '../match/#' + sign.id + '-' + partner.id;
    var pairLinks = document.querySelectorAll('[data-pair-link]');
    for (var i = 0; i < pairLinks.length; i++) {
      pairLinks[i].href = pairHref;
    }
  }

  ZQ.startClock();
})();
