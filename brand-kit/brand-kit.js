// ExpoBusiness brand guidelines, Edition II. Reads the live tokens from ../assets/css/site.css and the
// live expo data from ../assets/js/data/*.js, so the guide always matches the site.
// Motion respects prefers-reduced-motion; loops only run while visible.
(function () {
  'use strict';
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var doc = document, root = doc.documentElement;
  function $(s, r) { return (r || doc).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || doc).querySelectorAll(s)); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function onSeen(el, fn, opts) {
    if (!el) return;
    if (!('IntersectionObserver' in window)) { fn(true); return; }
    new IntersectionObserver(function (es) { es.forEach(function (e) { fn(e.isIntersecting); }); }, opts || { threshold: .25 }).observe(el);
  }

  /* ---------- toast + copy ---------- */
  var toastEl = $('#toast'), toastT;
  function toast(msg) {
    toastEl.textContent = msg; toastEl.classList.add('on');
    clearTimeout(toastT); toastT = setTimeout(function () { toastEl.classList.remove('on'); }, 1800);
  }
  function copy(text, label) {
    var done = function () { toast('Copied ' + (label || text)); };
    if (navigator.clipboard && window.isSecureContext) { navigator.clipboard.writeText(text).then(done, fallback); } else fallback();
    function fallback() {
      var t = doc.createElement('textarea'); t.value = text; t.setAttribute('readonly', ''); t.style.position = 'fixed'; t.style.opacity = '0';
      doc.body.appendChild(t); t.select();
      try { doc.execCommand('copy'); done(); } catch (e) { toast('Copy is not available here'); }
      t.remove();
    }
  }

  /* ---------- rail: current chapter + progress ---------- */
  var links = $$('#railList a'), map = {};
  links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
  var current = null;
  function setCurrent(id) {
    if (id === current || !map[id]) return; current = id;
    links.forEach(function (a) { a.removeAttribute('aria-current'); });
    var a = map[id]; a.setAttribute('aria-current', 'true');
    var list = $('#railList');
    if (list.scrollWidth > list.clientWidth + 4) list.scrollTo({ left: a.parentNode.offsetLeft - 24, behavior: reduce ? 'auto' : 'smooth' });
  }
  var chapters = $$('main > section');
  var bar = $('#bkProgress'), ticking = false;
  function onScroll() {
    ticking = false;
    var y = scrollY, max = root.scrollHeight - innerHeight;
    bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, y / max) : 0) + ')';
    var line = innerHeight * .35, id = chapters[0].id;
    for (var i = 0; i < chapters.length; i++) { if (chapters[i].getBoundingClientRect().top <= line) id = chapters[i].id; }
    setCurrent(id);
  }
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();

  /* ---------- print ---------- */
  $$('[data-print]').forEach(function (b) { b.addEventListener('click', function () { window.print(); }); });

  /* ---------- replay the mark ---------- */
  function replay(el) {
    if (!el || reduce) return;
    el.classList.add('bk-replaying'); void el.offsetWidth; el.classList.remove('bk-replaying');
  }
  $$('[data-replay]').forEach(function (b) { b.addEventListener('click', function () { replay($(b.dataset.replay)); }); });

  /* ---------- click ripple on buttons (motion.js is not loaded here) ---------- */
  doc.addEventListener('pointerdown', function (e) {
    var b = e.target.closest('.btn'); if (!b || reduce) return;
    var r = b.getBoundingClientRect(), d = Math.max(r.width, r.height) * 2.2, s = doc.createElement('span');
    s.className = 'ripple'; s.style.cssText = 'width:' + d + 'px;height:' + d + 'px;left:' + (e.clientX - r.left - d / 2) + 'px;top:' + (e.clientY - r.top - d / 2) + 'px';
    b.appendChild(s); setTimeout(function () { s.remove(); }, 700);
  });

  /* ---------- V · audiences ---------- */
  var tabs = $$('.bk-aud-tabs [role=tab]');
  function showAud(i, focus) {
    tabs.forEach(function (t, k) {
      var on = k === i; t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1;
      $('#' + t.getAttribute('aria-controls')).classList.toggle('on', on);
    });
    if (focus) tabs[i].focus();
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { showAud(i); });
    t.addEventListener('keydown', function (e) {
      var n = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (e.key === 'Home') { e.preventDefault(); showAud(0, true); }
      else if (e.key === 'End') { e.preventDefault(); showAud(tabs.length - 1, true); }
      else if (n) { e.preventDefault(); showAud((i + n + tabs.length) % tabs.length, true); }
    });
  });

  /* ---------- VI · colourways ---------- */
  var CW = {
    colour: ['#ffffff', 'Colour on white: the house colourway. Use it whenever the ground is white or the light cloud tint.'],
    reverse: ['#16163a', 'Reverse on navy: white “Expo”, brighter orange “Business”, the mark unchanged. Footer, hero, social covers.'],
    navy: ['#fff7f1', 'Navy, one colour: for one-colour print, embossing and stamps on light paper.'],
    white: ['#c9460b', 'White, one colour: on deep orange or on a photo under the navy veil. Never the colour logo on orange.']
  };
  $$('#cw [data-cw]').forEach(function (b) {
    b.addEventListener('click', function () {
      var k = b.dataset.cw, st = $('#cwStage');
      $$('#cw [data-cw]').forEach(function (x) { x.setAttribute('aria-checked', x === b); });
      st.style.setProperty('--g', CW[k][0]);
      $$('img', st).forEach(function (img) {
        var lk = img.dataset.lk, v = (lk === 'mark' && (k === 'reverse')) ? 'colour' : (lk === 'mark' && k === 'navy') ? 'navy' : k;
        img.src = 'img/logo/expobusiness-' + lk + '-' + v + '.svg';
      });
      $('#cwNote').textContent = CW[k][1];
    });
  });

  /* ---------- VII · colour ---------- */
  var cs = getComputedStyle(root);
  function tok(name, fallback) { var v = name ? cs.getPropertyValue(name).trim() : ''; return (v && /^#/.test(v) ? v : fallback).toLowerCase(); }
  var PALETTE = [
    { g: 'Core' },
    { id: 'gold', t: '--gold', hex: '#f26a1b', name: 'Orange', role: 'The brand orange. Fills, chart bars, rules, outlined numbers, solid buttons on navy. Not for small text on white.' },
    { id: 'gold-ink', t: '--gold-ink', hex: '#c9460b', name: 'Deep orange', role: 'Orange for text and buttons on white (4.8:1). “Business” in the wordmark, labels, links.' },
    { id: 'navy', t: '--navy', hex: '#16163a', name: 'Navy', role: 'Headings, dark panels, the hero veil, “Expo” in the wordmark.' },
    { id: 'red', t: '--red', hex: '#d7261e', name: 'Red', role: 'The flight arc and dot in the mark, and error states. The second voice, used sparingly.' },
    { g: 'Supporting' },
    { id: 'gold-hot', t: '--gold-hot', hex: '#ff8a3d', name: 'Bright orange', role: 'First booth of the mark; start of every orange gradient.' },
    { id: 'gold-700', t: '--gold-700', hex: '#a83a08', name: 'Burnt orange', role: 'Button hover and pressed states.' },
    { id: 'navy-2', t: '--navy-2', hex: '#2a2a5c', name: 'Navy 2', role: 'Links, dark-button hover, gradients on navy.' },
    { id: 'ink', t: '--ink', hex: '#34344f', name: 'Ink', role: 'Body text.' },
    { id: 'ink-2', t: '--ink-2', hex: '#5a5a72', name: 'Ink 2', role: 'Secondary text, captions, the “Travel Services” line.' },
    { g: 'Grounds and tints' },
    { id: 'white', t: '', hex: '#ffffff', name: 'White', role: 'The page. Most of every layout.' },
    { id: 'cloud', t: '--cloud', hex: '#fff7f1', name: 'Cloud', role: 'Warm section tint, the top bar, the route card.' },
    { id: 'line', t: '--line', hex: '#ecebf1', name: 'Line', role: 'Rules, borders, chart grids.' },
    { id: 'tint', t: '--or-050', hex: '#fff1e7', name: 'Orange tint', role: 'The wipe inside ghost buttons on hover.' },
    { id: 'peach', t: '', hex: '#ffb27d', name: 'Peach', role: 'Labels and links on navy.' },
    { id: 'mist', t: '', hex: '#c9c8db', name: 'Mist', role: 'Body text on navy.' },
    { id: 'green', t: '--green', hex: '#2e7d32', name: 'Green', role: 'Ticks and success messages only.' }
  ];
  PALETTE.forEach(function (p) { if (p.hex) p.hex = tok(p.t, p.hex); });
  function hexRgb(h) { h = h.replace('#', ''); if (h.length === 3) h = h.replace(/./g, '$&$&'); return [0, 2, 4].map(function (i) { return parseInt(h.substr(i, 2), 16); }); }
  function lum(h) { return hexRgb(h).map(function (v) { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }).reduce(function (a, v, i) { return a + v * [.2126, .7152, .0722][i]; }, 0); }
  function ratio(a, b) { var x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); }
  function cmyk(rgb) { var r = rgb[0] / 255, g = rgb[1] / 255, b = rgb[2] / 255, k = 1 - Math.max(r, g, b); if (k >= 1) return [0, 0, 0, 100]; return [(1 - r - k) / (1 - k), (1 - g - k) / (1 - k), (1 - b - k) / (1 - k), k].map(function (v) { return Math.round(v * 100); }); }
  var html = '', open = false;
  PALETTE.forEach(function (p) {
    if (p.g) { if (open) html += '</ul>'; html += '<h3 class="bk-sw-group">' + p.g + '</h3><ul class="bk-sw">'; open = true; return; }
    var rgb = hexRgb(p.hex), on = ratio(p.hex, '#ffffff') > ratio(p.hex, '#16163a') ? '#ffffff' : '#16163a';
    var vals = [['HEX', p.hex.toUpperCase()], ['RGB', rgb.join(', ')], ['CMYK', cmyk(rgb).join(' / ')]];
    if (p.t) vals.push(['CSS', 'var(' + p.t + ')']);
    html += '<li><div class="bk-sw-chip" style="--c:' + p.hex + ';--on:' + on + '"><b>' + esc(p.name) + '</b><code>' + (p.t || 'no token') + '</code></div><div class="bk-sw-body"><p class="bk-sw-role">' + esc(p.role) + '</p><div class="bk-sw-vals">' +
      vals.map(function (v) { return '<button type="button" data-copy="' + esc(v[1]) + '" aria-label="Copy ' + esc(p.name) + ' ' + v[0] + ' ' + esc(v[1]) + '"><span class="bk-label">' + v[0] + '</span><span>' + esc(v[1]) + '</span></button>'; }).join('') + '</div></div></li>';
  });
  $('#swatches').innerHTML = html + '</ul>';
  $('#swatches').addEventListener('click', function (e) { var b = e.target.closest('[data-copy]'); if (b) copy(b.dataset.copy); });
  (function () {
    var P = {}; PALETTE.forEach(function (p) { if (p.id) P[p.id] = p; });
    var fg = ['navy', 'ink', 'ink-2', 'gold-ink', 'gold', 'red', 'peach', 'white'], bg = ['white', 'cloud', 'navy', 'gold-ink', 'gold'];
    var t = '<caption class="sr-only">Contrast ratio of each brand text colour on each brand ground</caption><thead><tr><th scope="col">Text on ground</th>' +
      bg.map(function (g) { return '<th scope="col">' + esc(P[g].name) + '<small>' + P[g].hex.toUpperCase() + '</small></th>'; }).join('') + '</tr></thead><tbody>';
    fg.forEach(function (f) {
      t += '<tr><th scope="row">' + esc(P[f].name) + '<small>' + P[f].hex.toUpperCase() + '</small></th>';
      bg.forEach(function (g) {
        var r = ratio(P[f].hex, P[g].hex), badge = r >= 7 ? 'AAA' : r >= 4.5 ? 'AA' : r >= 3 ? 'AA large' : 'Fail';
        t += '<td><div class="bk-ct-cell' + (r < 3 ? ' fail' : '') + '" style="background:' + P[g].hex + ';color:' + P[f].hex + '"><span class="aa" aria-hidden="true">Aa</span><span class="r">' + r.toFixed(2) + ':1</span><span class="bdg">' + badge + '</span></div></td>';
      });
      t += '</tr>';
    });
    $('#contrast').innerHTML = t + '</tbody>';
  })();

  /* ---------- VIII · type ---------- */
  function scaleMeta() {
    $$('#scale li').forEach(function (li) {
      var s = $('.s', li), st = getComputedStyle(s), px = Math.round(parseFloat(st.fontSize));
      $('.meta', li).innerHTML = '<b>' + esc($('.meta', li).dataset.t) + '</b><span>' + px + ' px · ' + st.fontWeight + '</span>';
    });
  }
  scaleMeta(); addEventListener('resize', scaleMeta);
  if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(scaleMeta);
  var tsOut = $('#tsOut'), tsFf = 'h';
  function tester() {
    tsOut.textContent = $('#tsText').value || ' ';
    tsOut.style.font = (tsFf === 'h' ? '800 ' : '400 ') + $('#tsSize').value + 'px/1.2 ' + (tsFf === 'h' ? 'var(--h)' : 'var(--b)');
    tsOut.style.letterSpacing = tsFf === 'h' ? '-.025em' : '-.01em';
  }
  $('#tsText').addEventListener('input', tester); $('#tsSize').addEventListener('input', tester);
  $$('[data-ff]').forEach(function (b) { b.addEventListener('click', function () { tsFf = b.dataset.ff; $$('[data-ff]').forEach(function (x) { x.setAttribute('aria-checked', x === b); }); tester(); }); });
  tester();

  /* ---------- IX · infographics, from the live expo data ---------- */
  var EXPOS = (window.EXPO_CN || []).map(function (e) { return { city: e.city, month: e.month, region: 'China and Hong Kong' }; })
    .concat((window.EXPO_WORLD || []).map(function (e) { return { city: e.city, month: e.month, region: e.region || 'Elsewhere' }; }));
  var nEx = EXPOS.length, cities = {}, months = {}, regions = {};
  EXPOS.forEach(function (e) {
    if (e.city) cities[e.city] = 1;
    if (e.month) months[e.month] = (months[e.month] || 0) + 1;
    regions[e.region] = (regions[e.region] || 0) + 1;
  });
  if (nEx) {
    $('#stExpos').dataset.count = nEx; $('#stExpos').textContent = nEx;
    $('#stCities').dataset.count = Object.keys(cities).length; $('#stCities').textContent = Object.keys(cities).length;
    $$('[data-expo-count]').forEach(function (s) { s.textContent = nEx; });
  } else {
    $('#stExpos').closest('.ig-stat').remove(); $('#stCities').closest('.ig-stat').remove();
  }
  var M = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], mx = 1;
  M.forEach(function (m, i) { var k = '2027-' + ('0' + (i + 1)).slice(-2); mx = Math.max(mx, months[k] || 0); });
  var mc = $('#igMonths'); mc.style.setProperty('--max', mx);
  mc.innerHTML = M.map(function (m, i) {
    var v = months['2027-' + ('0' + (i + 1)).slice(-2)] || 0;
    return '<a class="ig-mbar" href="../expos.html?month=2027-' + ('0' + (i + 1)).slice(-2) + '" style="--v:' + v + '" title="' + m + ' 2027: ' + v + ' expos"><i></i><b>' + v + '</b><span>' + m + '</span></a>';
  }).join('');
  var rs = Object.keys(regions).map(function (k) { return [k, regions[k]]; }).sort(function (a, b) { return b[1] - a[1]; }).slice(0, 6);
  var rh = $('#igRegions'); rh.style.setProperty('--max', rs.length ? rs[0][1] : 1);
  rh.innerHTML = rs.map(function (r) { return '<li style="--v:' + r[1] + '"><span>' + esc(r[0]) + '</span><i></i><b>' + r[1] + '</b></li>'; }).join('');
  $$('[data-copy-html]').forEach(function (b) {
    b.addEventListener('click', function () {
      var el = $(b.dataset.copyHtml).cloneNode(true);
      $$('[style*="--k"]', el).forEach(function (x) { x.style.removeProperty('--k'); if (!x.getAttribute('style')) x.removeAttribute('style'); });
      copy(el.outerHTML.replace(/\s(id|data-counted)="[^"]*"/g, ''), 'the HTML');
    });
  });
  var route = $('#route');
  onSeen(route, function (v) { if (v) route.classList.add('go'); }, { threshold: .6 });
  $('#routeReplay').addEventListener('click', function () { route.classList.remove('go'); void route.offsetWidth; requestAnimationFrame(function () { route.classList.add('go'); }); });

  /* ---------- X · photography ---------- */
  $('#phVeil').addEventListener('change', function () { $('#photos').classList.toggle('raw', !this.checked); });

  /* ---------- XI · motion demos ---------- */
  function loop(el, ms, step) {
    var t = null;
    onSeen(el, function (v) {
      if (reduce) return;
      if (v && !t) { step(); t = setInterval(step, ms); } else if (!v && t) { clearInterval(t); t = null; }
    });
  }
  var moHdr = $('#moHdr');
  $('#moHdrBtn').addEventListener('click', function () { moHdr.classList.toggle('scrolled'); });
  loop(moHdr, 2600, function () { if (!doc.hidden) moHdr.classList.toggle('scrolled'); });
  var sl = $('#moSlides'), dots = $$('.dots i', sl), txt = $$('.txt p', sl), si = -1;
  function slide() {
    if (doc.hidden || sl.matches(':hover')) return;
    si = (si + 1) % txt.length;
    txt.forEach(function (p, k) { p.classList.toggle('on', k === si); });
    dots.forEach(function (d, k) { d.classList.remove('on'); d.classList.toggle('done', k < si); });
    void sl.offsetWidth; dots[si].classList.add('on');
  }
  if (reduce) { txt[0].classList.add('on'); dots[0].classList.add('done'); } else loop(sl, 3200, slide);
  $('#moBarsBtn').addEventListener('click', function () {
    var b = $('#moBars'); b.classList.remove('ig-on', 'ig-done'); void b.offsetWidth;
    requestAnimationFrame(function () { b.classList.add('ig-on'); });
  });
  $('#moRevealBtn').addEventListener('click', function () {
    if (reduce || !Element.prototype.animate) return;
    $$('#moReveal i').forEach(function (i, k) {
      i.animate([{ opacity: 0, transform: 'translateY(24px)' }, { opacity: 1, transform: 'none' }], { duration: 800, delay: k * 80, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' });
    });
  });
  var ease = $('#ease');
  function easeW() { $$('.trk', ease).forEach(function (t) { t.style.setProperty('--tw', (t.clientWidth - 22) + 'px'); }); }
  easeW(); addEventListener('resize', easeW);
  onSeen(ease, function (v) { ease.classList.toggle('go', v && !reduce); });

  /* ---------- XII · icons ---------- */
  var ICONS = $$('symbol[id^="i-"]').filter(function (s) { return ['i-menu', 'i-x', 'i-ext'].indexOf(s.id) < 0; });
  var NAMES = { phone: 'Phone', mail: 'Email', check: 'Tick', 'check-circle': 'Done', arrow: 'Arrow', send: 'Send', receipt: 'Invoice', users: 'Group', shield: 'Visa', pin: 'Place', headset: 'Support', bell: 'Service', plane: 'Flight' };
  $('#iconGrid').innerHTML = ICONS.map(function (s) {
    var k = s.id.slice(2);
    return '<li><button type="button" data-ic="' + k + '" aria-label="Copy the ' + esc(NAMES[k] || k) + ' icon"><svg viewBox="0 0 24 24" aria-hidden="true"><use href="#' + s.id + '"/></svg><span>' + esc(NAMES[k] || k) + '</span></button></li>';
  }).join('');
  $('#iconGrid').addEventListener('click', function (e) {
    var b = e.target.closest('[data-ic]'); if (!b) return;
    var inner = $('#i-' + b.dataset.ic).innerHTML;
    copy('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#c9460b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + inner + '</svg>', 'the ' + (NAMES[b.dataset.ic] || b.dataset.ic) + ' icon');
  });
  (function () {
    var g = '';
    for (var i = 0; i <= 24; i += 2) g += '<line x1="' + i + '" y1="0" x2="' + i + '" y2="24" stroke="#ecebf1" stroke-width=".08"/><line x1="0" y1="' + i + '" x2="24" y2="' + i + '" stroke="#ecebf1" stroke-width=".08"/>';
    g += '<rect x="2" y="2" width="20" height="20" fill="rgba(242,106,27,.06)" stroke="#f26a1b" stroke-width=".08" stroke-dasharray=".4 .4"/>';
    g += '<g fill="none" stroke="#16163a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + $('#i-plane').innerHTML + '</g>';
    $('#icAnat').innerHTML = g;
  })();

  /* ---------- XIII · header demo ---------- */
  var hs = $('#hdrScroll'), hb = $('#hdrBar');
  hs.addEventListener('scroll', function () { hb.classList.toggle('scrolled', hs.scrollTop > 24); }, { passive: true });

  /* ---------- XIV · card flip by keyboard / tap ---------- */
  var card = $('#card');
  function flip() { var on = !card.classList.contains('flip'); card.classList.toggle('flip', on); card.setAttribute('aria-pressed', on); }
  card.addEventListener('click', flip);
  card.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); } });

  /* ---------- XVI · downloads ---------- */
  var SVGS = [
    ['expobusiness-horizontal-colour.svg', 'Horizontal, colour, for white grounds'], ['expobusiness-horizontal-reverse.svg', 'Horizontal, reverse, for navy grounds'],
    ['expobusiness-horizontal-navy.svg', 'Horizontal, navy, one colour'], ['expobusiness-horizontal-white.svg', 'Horizontal, white, one colour'],
    ['expobusiness-stacked-colour.svg', 'Stacked, colour'], ['expobusiness-stacked-reverse.svg', 'Stacked, reverse'],
    ['expobusiness-stacked-navy.svg', 'Stacked, navy'], ['expobusiness-stacked-white.svg', 'Stacked, white'],
    ['expobusiness-mark-colour.svg', 'Mark, colour'], ['expobusiness-mark-navy.svg', 'Mark, navy'], ['expobusiness-mark-white.svg', 'Mark, white'],
    ['expobusiness-avatar.svg', 'Avatar, navy square'], ['expobusiness-avatar-light.svg', 'Avatar, white square']
  ];
  var PNGS = [
    ['expobusiness-horizontal-colour.png', '1876 × 400, transparent'], ['expobusiness-horizontal-reverse.png', '1876 × 400, transparent, for navy'],
    ['expobusiness-horizontal-navy.png', '1876 × 400, transparent'], ['expobusiness-horizontal-white.png', '1876 × 400, transparent'],
    ['expobusiness-stacked-colour.png', '1396 × 1016, transparent'], ['expobusiness-stacked-reverse.png', '1396 × 1016, transparent, for navy'],
    ['expobusiness-mark-colour.png', '1100 × 1000, transparent'], ['expobusiness-mark-white.png', '1100 × 1000, transparent'],
    ['expobusiness-avatar.png', '1080 × 1080, navy'], ['expobusiness-avatar-light.png', '1080 × 1080, white']
  ];
  $('#dlSvg').innerHTML = SVGS.map(function (f) { return '<li><a class="bk-dl-item" href="img/logo/' + f[0] + '" download><span>' + f[0] + '</span><small>' + esc(f[1]) + '</small></a></li>'; }).join('');
  $('#dlPng').innerHTML = PNGS.map(function (f) { return '<li><a class="bk-dl-item" href="exports/' + f[0] + '" download><span>' + f[0] + '</span><small>' + esc(f[1]) + '</small></a></li>'; }).join('');

  var S = window.SITE || {}, C = S.contact || {}, L = S.legal || {}, SO = S.social || {};
  function isPh(v) { return !v || /^\[.*\]$/.test(v); }
  var FACTS = [
    ['Name', 'ExpoBusiness Travel Services'], ['Parent', 'Immaculate Connections', 'https://www.immaculateconnectionsph.com/'],
    ['Short line', (S.brand && S.brand.short) || 'Business travel, trade missions and delegations for Philippine companies.'],
    ['Email', C.email], ['Address', C.address], ['Phone', C.phone], ['Mobile', C.mobile], ['Hours', C.hours],
    ['Website', S.site && S.site.url], ['Facebook', SO.facebook], ['LinkedIn', SO.linkedin],
    ['DOT', L.dot], ['IATA', L.iata], ['PhilGEPS', L.philgeps], ['Registration', L.registration]
  ];
  $('#facts').innerHTML = FACTS.map(function (f) {
    var v = f[1] || '[not set]', ph = isPh(v);
    var dd = f[2] ? '<a href="' + f[2] + '" rel="noopener" target="_blank">' + esc(v) + '</a>' : esc(v);
    return '<div><dt>' + esc(f[0]) + '</dt><dd' + (ph ? ' class="ph"' : '') + '>' + dd + '</dd>' + (ph ? '<span></span>' : '<button type="button" data-copy="' + esc(v) + '" aria-label="Copy ' + esc(f[0]) + '">Copy</button>') + '</div>';
  }).join('');
  $('#facts').addEventListener('click', function (e) { var b = e.target.closest('[data-copy]'); if (b) copy(b.dataset.copy, b.getAttribute('aria-label').replace('Copy ', '').toLowerCase()); });

  function blob(name, type, text) {
    var a = doc.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: type })); a.download = name;
    doc.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
    toast('Saved ' + name);
  }
  var TOK = PALETTE.filter(function (p) { return p.id; });
  var FONTS = { heading: '"Plus Jakarta Sans", system-ui, sans-serif', body: 'Inter, system-ui, sans-serif', google: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Inter:wght@400;500;600&display=swap' };
  var EASE = { ease: 'cubic-bezier(.16, 1, .3, 1)', 'btn-spring': 'cubic-bezier(.34, 1.56, .64, 1)', 'btn-ease': 'cubic-bezier(.2, .8, .2, 1)' };
  $$('[data-blob]').forEach(function (b) {
    b.addEventListener('click', function () {
      var k = b.dataset.blob;
      if (k === 'tokens.css') {
        blob('expobusiness-tokens.css', 'text/css', '/* ExpoBusiness Travel Services brand tokens, Edition II (November 2026). */\n@import url("' + FONTS.google + '");\n:root {\n' +
          TOK.map(function (p) { return '  --eb-' + p.id + ': ' + p.hex + ';  /* ' + p.name + ' */'; }).join('\n') +
          '\n  --eb-font-heading: ' + FONTS.heading + ';\n  --eb-font-body: ' + FONTS.body + ';\n  --eb-radius: 10px;\n  --eb-radius-lg: 16px;\n  --eb-radius-pill: 999px;\n' +
          Object.keys(EASE).map(function (e) { return '  --eb-' + e + ': ' + EASE[e] + ';'; }).join('\n') + '\n}\n');
      } else if (k === 'tokens.json') {
        var o = { colour: {}, font: { heading: FONTS.heading, body: FONTS.body, url: FONTS.google }, radius: { base: '10px', large: '16px', pill: '999px' }, easing: EASE };
        TOK.forEach(function (p) { o.colour[p.id] = { value: p.hex, name: p.name, role: p.role, css: p.t || null }; });
        blob('expobusiness-tokens.json', 'application/json', JSON.stringify(o, null, 2));
      } else {
        var facts = {
          name: 'ExpoBusiness Travel Services', shortName: 'ExpoBusiness',
          parent: { name: 'Immaculate Connections', url: 'https://www.immaculateconnectionsph.com/', relationship: 'The business-travel arm of, and powered by, Immaculate Connections' },
          story: $$('.bk-story p').map(function (p) { return p.textContent.trim(); }),
          audiences: $$('.bk-aud').map(function (a) { return { label: $('.chip', a).textContent.trim(), headline: $('h3', a).textContent.trim(), line: $('p', a).textContent.trim(), cta: $('.btn', a).textContent.trim() }; }),
          primaryCta: 'Request Corporate Proposal', departures: ['Cebu', 'Manila', 'Clark', 'Davao'],
          contact: { email: C.email || null, address: C.address || null }, rules: $$('#voice .bk-rules b').map(function (b) { return b.textContent.replace(/\.$/, ''); })
        };
        blob('expobusiness-brand-facts.json', 'application/json', JSON.stringify(facts, null, 2));
      }
    });
  });
})();
