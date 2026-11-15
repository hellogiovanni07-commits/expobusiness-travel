// ExpoBusiness brand guidelines, Edition III. Reads the live tokens from ../assets/css/site.css, the live expo
// data from ../assets/js/data/*.js and, at runtime, collateral/manifest.json and social/manifest.json.
// Motion respects prefers-reduced-motion; loops only run while visible.
(function () {
  'use strict';
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var doc = document, root = doc.documentElement;
  function $(s, r) { return (r || doc).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || doc).querySelectorAll(s)); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
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
      (doc.querySelector('dialog[open]') || doc.body).appendChild(t); t.select();
      try { doc.execCommand('copy'); done(); } catch (e) { toast('Copy is not available here'); }
      t.remove();
    }
  }
  // one handler for every [data-copy] on the page (swatches, tints, tokens, facts, lightbox)
  doc.addEventListener('click', function (e) {
    var b = e.target.closest('[data-copy]'); if (!b) return;
    copy(b.dataset.copy, b.dataset.copyLabel);
  });

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
    else if (list.scrollHeight > list.clientHeight + 4) { var t = a.parentNode.offsetTop; if (t < list.scrollTop || t > list.scrollTop + list.clientHeight - 30) list.scrollTo({ top: t - 60 }); }
  }
  var chapters = $$('main > section');
  var bar = $('#bkProgress'), ticking = false;
  function onScroll() {
    ticking = false;
    var y = scrollY, max = root.scrollHeight - innerHeight;
    bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, y / max) : 0) + ')';
    var line = innerHeight * .3, id = chapters[0].id;
    for (var i = 0; i < chapters.length; i++) { if (chapters[i].getBoundingClientRect().top <= line) id = chapters[i].id; }
    if (max - y < 4) id = chapters[chapters.length - 1].id;
    setCurrent(id);
  }
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();

  /* ---------- print ---------- */
  $$('[data-print]').forEach(function (b) { b.addEventListener('click', function () { window.print(); }); });
  addEventListener('beforeprint', function () { $$('img[loading="lazy"]').forEach(function (i) { i.loading = 'eager'; }); });

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

  /* ---------- tabs (WAI-ARIA, arrow keys) ---------- */
  function initTabs(list, onChange) {
    var tabs = $$('[role=tab]', list);
    function show(i, focus) {
      tabs.forEach(function (t, k) {
        var on = k === i; t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1;
        var p = t.getAttribute('aria-controls'); if (p && $('#' + p)) $('#' + p).hidden = !on;
      });
      if (focus) tabs[i].focus();
      if (onChange) onChange(i, tabs[i]);
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { show(i); });
      t.addEventListener('keydown', function (e) {
        var n = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (e.key === 'Home') { e.preventDefault(); show(0, true); }
        else if (e.key === 'End') { e.preventDefault(); show(tabs.length - 1, true); }
        else if (n) { e.preventDefault(); show((i + n + tabs.length) % tabs.length, true); }
      });
    });
    return show;
  }
  $$('.bk-tabs[role=tablist]').forEach(function (l) { if (!l.closest('#soc')) initTabs(l); });

  /* ---------- radio segments ---------- */
  function seg(group, fn) {
    var bs = $$('[role=radio]', group);
    bs.forEach(function (b) {
      b.addEventListener('click', function () { bs.forEach(function (x) { x.setAttribute('aria-checked', x === b); }); fn(b); });
    });
  }

  /* ---------- II · descriptions ---------- */
  function words(t) { return t.trim().split(/\s+/).filter(Boolean).length; }
  var bpOn = '25';
  function bpShow(k) {
    bpOn = k;
    $$('[data-bp-text]').forEach(function (p) { p.hidden = p.id !== 'bp-' + k; });
    $('#bpCount').textContent = words($('#bp-' + k).textContent) + ' words';
  }
  seg($('#bpSeg'), function (b) { bpShow(b.dataset.bp); });
  bpShow('25');
  $('#bpCopy').addEventListener('click', function () { copy($('#bp-' + bpOn).textContent.trim(), 'the ' + bpOn + '-word description'); });

  /* ---------- V · colourways ---------- */
  var CW = {
    colour: ['#ffffff', 'Colour on white: the house colourway, on white or the cloud tint.'],
    reverse: ['#16163a', 'Reverse on navy: white “Expo”, brighter orange “Business”, the mark unchanged. Footer, hero, covers.'],
    navy: ['#fff7f1', 'Navy, one colour: one-colour print, embossing and stamps on light paper.'],
    white: ['#c9460b', 'White, one colour: on deep orange or on a photo under the navy veil. Never the colour logo on orange.']
  };
  seg($('#cw .bk-seg'), function (b) {
    var k = b.dataset.cw, st = $('#cwStage');
    st.style.setProperty('--g', CW[k][0]);
    $$('img', st).forEach(function (img) {
      var lk = img.dataset.lk, v = (lk === 'mark' && k === 'reverse') ? 'colour' : k;
      img.src = 'img/logo/expobusiness-' + lk + '-' + v + '.svg';
    });
    $('#cwNote').textContent = CW[k][1];
  });

  /* ---------- VI · partnership ---------- */
  var PT = {
    horizontal: ['Horizontal: proposals, letterhead footers, website footer and About page, event backdrops.', 'ExpoBusiness logo, a divider, then In partnership with and the Immaculate Connections logo', 2745, 400],
    stacked: ['Stacked: square spaces, booth panels, proposal back covers. Partner logo 43% of the ExpoBusiness height.', 'Stacked ExpoBusiness logo above a rule, In partnership with, and the Immaculate Connections logo', 1396, 1780],
    'reverse-text': ['Navy, text only: hero panels, social covers and any dark or photo ground. The partner logo is never placed on navy.', 'Reverse ExpoBusiness logo on navy with the words In partnership with Immaculate Connections', 3149, 400]
  };
  seg($('#ptSeg'), function (b) {
    var k = b.dataset.pt, p = PT[k], img = $('#ptImg'), base = 'img/partner/expobusiness-partnership-' + k;
    img.src = base + '.svg'; img.alt = p[1]; img.width = p[2]; img.height = p[3];
    img.className = k === 'stacked' ? 'stacked' : '';
    $('#ptStage').classList.toggle('navy', k === 'reverse-text');
    $('#ptNote').textContent = p[0];
    var a = $$('#ptLinks a'); a[0].href = base + '.svg'; a[1].href = base + '.png';
  });

  /* ---------- VII · colour ---------- */
  var cs = getComputedStyle(root);
  function tok(name, fallback) { var v = name ? cs.getPropertyValue(name).trim() : ''; return (v && /^#/.test(v) ? v : fallback).toLowerCase(); }
  // cmyk: print starting values, proofed against the screen colour (not a mechanical conversion). pms: nearest Pantone, to be proofed.
  var PALETTE = [
    { g: 'Core' },
    { id: 'gold', t: '--gold', hex: '#f26a1b', name: 'Orange', cmyk: '0 / 70 / 95 / 0', pms: '1585 C', role: 'The brand orange. Fills, chart bars, rules, solid buttons on navy. Not for text on white.' },
    { id: 'gold-ink', t: '--gold-ink', hex: '#c9460b', name: 'Deep orange', cmyk: '5 / 80 / 100 / 15', pms: '7598 C', role: 'Orange for text and buttons on white (4.8 : 1). “Business” in the wordmark, labels, links.' },
    { id: 'navy', t: '--navy', hex: '#16163a', name: 'Navy', cmyk: '100 / 95 / 35 / 45', pms: '5255 C', role: 'Headings, dark panels, the photo veil, “Expo” in the wordmark.' },
    { id: 'red', t: '--red', hex: '#d7261e', name: 'Red', cmyk: '0 / 95 / 100 / 5', pms: '485 C', role: 'The flight arc and dot in the mark, and error states. Used sparingly.' },
    { g: 'Supporting and grounds', small: true },
    { id: 'gold-hot', t: '--gold-hot', hex: '#ff8a3d', name: 'Bright orange', cmyk: '0 / 55 / 80 / 0', pms: '1575 C', role: 'First booth; start of every orange gradient.' },
    { id: 'gold-700', t: '--gold-700', hex: '#a83a08', name: 'Burnt orange', cmyk: '15 / 85 / 100 / 30', pms: '7599 C', role: 'Button hover and pressed.' },
    { id: 'navy-2', t: '--navy-2', hex: '#2a2a5c', name: 'Navy 2', cmyk: '95 / 90 / 30 / 25', role: 'Links, dark-button hover.' },
    { id: 'ink', t: '--ink', hex: '#34344f', name: 'Ink', cmyk: '80 / 75 / 45 / 40', role: 'Body text.' },
    { id: 'ink-2', t: '--ink-2', hex: '#5a5a72', name: 'Ink 2', cmyk: '65 / 60 / 35 / 20', pms: '5275 C', role: 'Secondary text, captions.' },
    { id: 'green', t: '--green', hex: '#2e7d32', name: 'Green', cmyk: '85 / 25 / 100 / 15', pms: '356 C', role: 'Ticks and success only.' },
    { id: 'white', t: '', hex: '#ffffff', name: 'White', cmyk: '0 / 0 / 0 / 0', role: 'The page.' },
    { id: 'cloud', t: '--cloud', hex: '#fff7f1', name: 'Cloud', cmyk: '0 / 3 / 5 / 0', role: 'Warm section tint.' },
    { id: 'line', t: '--line', hex: '#ecebf1', name: 'Line', cmyk: '6 / 5 / 2 / 0', role: 'Rules, borders, grids.' },
    { id: 'tint', t: '--or-050', hex: '#fff1e7', name: 'Orange tint', cmyk: '0 / 6 / 9 / 0', role: 'Ghost-button wipe.' },
    { id: 'peach', t: '', hex: '#ffb27d', name: 'Peach', cmyk: '0 / 35 / 50 / 0', role: 'Labels and links on navy.' },
    { id: 'mist', t: '', hex: '#c9c8db', name: 'Mist', cmyk: '20 / 18 / 5 / 0', role: 'Body text on navy.' }
  ];
  PALETTE.forEach(function (p) { if (p.hex) p.hex = tok(p.t, p.hex); });
  function hexRgb(h) { h = h.replace('#', ''); if (h.length === 3) h = h.replace(/./g, '$&$&'); return [0, 2, 4].map(function (i) { return parseInt(h.substr(i, 2), 16); }); }
  function rgbHex(c) { return '#' + c.map(function (v) { return ('0' + Math.round(v).toString(16)).slice(-2); }).join(''); }
  function lum(h) { return hexRgb(h).map(function (v) { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }).reduce(function (a, v, i) { return a + v * [.2126, .7152, .0722][i]; }, 0); }
  function ratio(a, b) { var x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); }
  function onCol(h) { return ratio(h, '#ffffff') > ratio(h, '#16163a') ? '#ffffff' : '#16163a'; }
  var html = '', open = false;
  PALETTE.forEach(function (p) {
    if (p.g) { if (open) html += '</ul>'; html += '<h3 class="bk-sw-group">' + p.g + '</h3><ul class="bk-sw' + (p.small ? ' small' : '') + '">'; open = true; return; }
    var rgb = hexRgb(p.hex);
    var vals = [['HEX', p.hex.toUpperCase()], ['RGB', rgb.join(', ')], ['CMYK', p.cmyk]];
    if (p.pms) vals.push(['PMS <em>≈</em>', p.pms + ' (nearest)']);
    if (p.t) vals.push(['CSS', 'var(' + p.t + ')']);
    html += '<li><div class="bk-sw-chip" style="--c:' + p.hex + ';--on:' + onCol(p.hex) + '"><b>' + esc(p.name) + '</b><code>' + (p.t || p.hex.toUpperCase()) + '</code></div><div class="bk-sw-body"><p class="bk-sw-role">' + esc(p.role) + '</p><div class="bk-sw-vals">' +
      vals.map(function (v) { var plain = v[1].replace(' (nearest)', ''); return '<button type="button" data-copy="' + esc(plain) + '" aria-label="Copy ' + esc(p.name) + ' ' + v[0].replace(/<[^>]+>/g, '') + ' ' + esc(v[1]) + '"><span class="k">' + v[0] + '</span><span>' + esc(v[0].indexOf('PMS') === 0 ? p.pms : v[1]) + '</span></button>'; }).join('') + '</div></div></li>';
  });
  $('#swatches').innerHTML = html + '</ul>';
  var P = {}; PALETTE.forEach(function (p) { if (p.id) P[p.id] = p; });
  // tints, mixed with white
  $('#tints').innerHTML = '<div class="bk-tint-row hd" aria-hidden="true"><span>Tint</span>' + [100, 80, 60, 40, 20, 10].map(function (pc) { return '<span>' + pc + '%</span>'; }).join('') + '</div>' + ['gold', 'gold-ink', 'navy', 'red'].map(function (k) {
    var c = hexRgb(P[k].hex);
    return '<div class="bk-tint-row"><span>' + esc(P[k].name) + '</span>' + [100, 80, 60, 40, 20, 10].map(function (pc) {
      var h = rgbHex(c.map(function (v) { return 255 - (255 - v) * pc / 100; }));
      return '<button type="button" style="--c:' + h + ';--on:' + onCol(h) + '" data-copy="' + h.toUpperCase() + '" aria-label="Copy ' + esc(P[k].name) + ' ' + pc + '% ' + h.toUpperCase() + '">' + h.slice(1).toUpperCase() + '</button>';
    }).join('') + '</div>';
  }).join('');
  (function () {
    var fg = ['navy', 'ink', 'ink-2', 'gold-ink', 'gold', 'red', 'peach', 'white'], bg = ['white', 'cloud', 'navy', 'gold-ink', 'gold'];
    var t = '<caption class="sr-only">Contrast ratio of each brand text colour on each brand ground</caption><thead><tr><th scope="col">Text on ground</th>' +
      bg.map(function (g) { return '<th scope="col">' + esc(P[g].name) + '<small>' + P[g].hex.toUpperCase() + '</small></th>'; }).join('') + '</tr></thead><tbody>';
    fg.forEach(function (f) {
      t += '<tr><th scope="row">' + esc(P[f].name) + '<small>' + P[f].hex.toUpperCase() + '</small></th>';
      bg.forEach(function (g) {
        var r = ratio(P[f].hex, P[g].hex), badge = r >= 7 ? 'AAA' : r >= 4.5 ? 'AA' : r >= 3 ? 'AA large' : 'Fail';
        t += '<td><div class="bk-ct-cell' + (r < 3 ? ' fail' : '') + '" style="background:' + P[g].hex + ';color:' + P[f].hex + '"><span class="aa" aria-hidden="true">Aa</span><span class="r">' + r.toFixed(2) + ' : 1</span><span class="bdg">' + badge + '</span></div></td>';
      });
      t += '</tr>';
    });
    $('#contrast').innerHTML = t + '</tbody>';
  })();

  /* ---------- VIII · type ---------- */
  seg($('#tsMedium'), function (b) { $$('#scale tbody').forEach(function (tb) { tb.hidden = tb.dataset.medium !== b.dataset.medium; }); });
  var tsOut = $('#tsOut'), tsFf = 'h';
  function tester() {
    tsOut.textContent = $('#tsText').value || ' ';
    tsOut.style.font = (tsFf === 'h' ? '800 ' : '400 ') + $('#tsSize').value + 'px/1.2 ' + (tsFf === 'h' ? 'var(--h)' : 'var(--b)');
    tsOut.style.letterSpacing = tsFf === 'h' ? '-.025em' : '-.01em';
  }
  $('#tsText').addEventListener('input', tester); $('#tsSize').addEventListener('input', tester);
  seg($('.bk-tester .bk-seg'), function (b) { tsFf = b.dataset.ff; tester(); });
  tester();

  /* ---------- IX · spacing ---------- */
  var SPACE = [[1, 4, 'icon to label'], [2, 8, 'inside chips, tight lists'], [3, 12, 'card padding, phones'], [4, 16, 'card padding'], [5, 24, 'grid gap'], [6, 32, 'between blocks'], [7, 48, 'section, phones'], [8, 64, 'section'], [9, 96, 'hero, large sections']];
  $('#spaceScale').innerHTML = SPACE.map(function (s) {
    return '<li><button type="button" data-copy="' + s[1] + 'px" aria-label="Copy --space-' + s[0] + ', ' + s[1] + ' pixels"><span>--space-' + s[0] + '</span><span>' + s[1] + '</span><span style="display:grid;gap:2px"><i style="--w:' + Math.min(100, s[1]) + '%"></i><small>' + s[2] + '</small></span></button></li>';
  }).join('');

  /* ---------- X · infographics, from the live expo data ---------- */
  var EXPOS = (window.EXPO_CN || []).map(function (e) { return { city: e.city, month: e.month, region: 'China and Hong Kong', country: 'China' }; })
    .concat((window.EXPO_WORLD || []).map(function (e) { return { city: e.city, month: e.month, region: e.region || 'Elsewhere', country: /hong kong|macau|macao/i.test(e.country || '') ? 'China' : e.country }; }));
  var nEx = EXPOS.length, cities = {}, months = {}, regions = {}, countries = {};
  EXPOS.forEach(function (e) {
    if (e.city) cities[e.city] = 1;
    if (e.country) countries[e.country] = 1;
    if (e.month) months[e.month] = (months[e.month] || 0) + 1;
    regions[e.region] = (regions[e.region] || 0) + 1;
  });
  var nCo = Object.keys(countries).length, nCi = Object.keys(cities).length;
  if (window.EXPO_STATS) { nEx = window.EXPO_STATS.expos; nCo = window.EXPO_STATS.countries; nCi = window.EXPO_STATS.cities; } // same numbers as the site
  if (nEx) {
    [['#stExpos', nEx], ['#stCountries', nCo], ['#stCities', nCi]].forEach(function (x) { $(x[0]).dataset.count = x[1]; $(x[0]).textContent = x[1]; });
    $$('[data-expo-count]').forEach(function (s) { s.textContent = nEx; });
    $$('[data-country-count]').forEach(function (s) { s.textContent = nCo; });
  } else {
    ['#stExpos', '#stCountries', '#stCities'].forEach(function (s) { $(s).closest('.ig-stat').remove(); });
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

  /* ---------- XI · photos + icons ---------- */
  $('#phVeil').addEventListener('change', function () { $('#photos').classList.toggle('raw', !this.checked); });
  var ICONS = $$('symbol[id^="i-"]').filter(function (s) { return ['i-menu', 'i-x', 'i-ext', 'i-dl', 'i-copy', 'i-replay'].indexOf(s.id) < 0; });
  var NAMES = { phone: 'Phone', mail: 'Email', check: 'Tick', 'check-circle': 'Done', arrow: 'Arrow', send: 'Send', receipt: 'Invoice', users: 'Group', shield: 'Visa', pin: 'Place', headset: 'Support', bell: 'Service', plane: 'Flight' };
  $('#iconGrid').innerHTML = ICONS.map(function (s) {
    var k = s.id.slice(2);
    return '<li><button type="button" data-ic="' + k + '" aria-label="Copy the ' + esc(NAMES[k] || k) + ' icon"><svg viewBox="0 0 24 24" aria-hidden="true"><use href="#' + s.id + '"/></svg><span>' + esc(NAMES[k] || k) + '</span></button></li>';
  }).join('');
  $('#iconGrid').addEventListener('click', function (e) {
    var b = e.target.closest('[data-ic]'); if (!b) return;
    copy('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#c9460b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + $('#i-' + b.dataset.ic).innerHTML + '</svg>', 'the ' + (NAMES[b.dataset.ic] || b.dataset.ic) + ' icon');
  });
  (function () {
    var g = '';
    for (var i = 0; i <= 24; i += 2) g += '<line x1="' + i + '" y1="0" x2="' + i + '" y2="24" stroke="#ecebf1" stroke-width=".08"/><line x1="0" y1="' + i + '" x2="24" y2="' + i + '" stroke="#ecebf1" stroke-width=".08"/>';
    g += '<rect x="2" y="2" width="20" height="20" fill="rgba(242,106,27,.06)" stroke="#f26a1b" stroke-width=".08" stroke-dasharray=".4 .4"/>';
    g += '<g fill="none" stroke="#16163a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + $('#i-plane').innerHTML + '</g>';
    $('#icAnat').innerHTML = g;
  })();

  /* ---------- XII · motion demos ---------- */
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
  function easeW() { $$('.trk', ease).forEach(function (t) { t.style.setProperty('--tw', (t.clientWidth - 16) + 'px'); }); }
  easeW(); addEventListener('resize', easeW);
  onSeen(ease, function (v) { ease.classList.toggle('go', v && !reduce); });

  /* ---------- XIII · header demo ---------- */
  var hs = $('#hdrScroll'), hb = $('#hdrBar');
  hs.addEventListener('scroll', function () { hb.classList.toggle('scrolled', hs.scrollTop > 16); }, { passive: true });

  /* ---------- XIV · card flip by keyboard / tap ---------- */
  var card = $('#card');
  function flip() { var on = !card.classList.contains('flip'); card.classList.toggle('flip', on); card.setAttribute('aria-pressed', on); }
  card.addEventListener('click', flip);
  card.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); } });

  /* ---------- lightbox (collaterals + social) ---------- */
  var lb = $('#lb'), lbImg = $('#lbImg'), lbSlides = [], lbI = 0, lbOpener = null, lbAlt = '';
  function lbSet(i) {
    lbI = (i + lbSlides.length) % lbSlides.length;
    lbImg.hidden = !lbSlides[lbI];
    if (lbSlides[lbI]) lbImg.src = lbSlides[lbI];
    lbImg.alt = lbAlt + (lbSlides.length > 1 ? ', slide ' + (lbI + 1) + ' of ' + lbSlides.length : '');
    $('#lbCount').textContent = lbSlides.length > 1 ? (lbI + 1) + ' / ' + lbSlides.length : '';
    $('#lbPrev').hidden = $('#lbNext').hidden = lbSlides.length < 2;
    var cur = $('#lbBody [data-cur-dl]'); if (cur) cur.href = lbSlides[lbI];
  }
  function lbOpen(o, opener) {
    lbOpener = opener || doc.activeElement; lbSlides = o.slides.length ? o.slides : ['']; lbAlt = o.title;
    $('#lbMeta').textContent = o.meta || ''; $('#lbTitle').textContent = o.title; $('#lbBody').innerHTML = o.body;
    lbSet(0);
    if (lb.showModal) { if (!lb.open) lb.showModal(); } else lb.setAttribute('open', '');
    $('#lbClose').focus();
  }
  function lbClose() { if (lb.close) lb.close(); else lb.removeAttribute('open'); }
  lb.addEventListener('close', function () { lbImg.removeAttribute('src'); if (lbOpener && lbOpener.focus) lbOpener.focus(); });
  $('#lbClose').addEventListener('click', lbClose);
  $('#lbPrev').addEventListener('click', function () { lbSet(lbI - 1); });
  $('#lbNext').addEventListener('click', function () { lbSet(lbI + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) lbClose(); });
  lb.addEventListener('keydown', function (e) {
    if (e.target.matches('input, textarea')) return;
    if (e.key === 'ArrowRight' && lbSlides.length > 1) { e.preventDefault(); lbSet(lbI + 1); }
    if (e.key === 'ArrowLeft' && lbSlides.length > 1) { e.preventDefault(); lbSet(lbI - 1); }
  });
  var DL = '<svg aria-hidden="true"><use href="#i-dl"/></svg>', CP = '<svg aria-hidden="true"><use href="#i-copy"/></svg>';
  function fileName(h) { return String(h).split('/').pop().split('?')[0]; }

  /* ---------- manifests ---------- */
  function resolver(dir) {
    return function (p) {
      if (!p) return '';
      p = String(p);
      if (/^([a-z]+:)?\/\//i.test(p) || p.charAt(0) === '/' || /^data:/.test(p)) return p;
      if (p.indexOf('brand-kit/') === 0) return p.slice(10);
      if (p.indexOf('collateral/') === 0 || p.indexOf('social/') === 0) return p;
      return dir + p.replace(/^\.\//, '');
    };
  }
  function loadManifest(box, render) {
    var url = box.dataset.manifest, dir = url.replace(/[^/]+$/, ''), soon = $('.bk-soon', box);
    function go() {
      return fetch(url, { cache: 'no-store' }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
        .then(function (m) { soon.hidden = true; render(m, resolver(dir)); box.classList.add('ready'); })
        .catch(function () { soon.hidden = false; box.classList.remove('ready'); });
    }
    $('[data-recheck]', soon).addEventListener('click', function () { toast('Checking…'); go(); });
    go();
  }

  /* XVI · collaterals */
  var CAT = { documents: 'Documents', print: 'Print', digital: 'Digital' };
  loadManifest($('#coll'), function (m, R) {
    var items = Array.isArray(m) ? m : (m.items || m.collaterals || m.assets || []);
    var box = $('#coll'), grid = $('.bk-gal-grid', box), chips = $('.bk-chips-f', box);
    if (!items.length) { $('.bk-soon', box).hidden = false; grid.innerHTML = ''; chips.hidden = true; return; }
    var counts = {}; items.forEach(function (it) { var c = it.category || 'other'; counts[c] = (counts[c] || 0) + 1; });
    var order = ['documents', 'print', 'digital'].filter(function (c) { return counts[c]; }).concat(Object.keys(counts).filter(function (c) { return !CAT[c]; }));
    chips.innerHTML = '<button type="button" aria-pressed="true" data-f="*">All<small>' + items.length + '</small></button>' +
      order.map(function (c) { return '<button type="button" aria-pressed="false" data-f="' + esc(c) + '">' + esc(CAT[c] || c.charAt(0).toUpperCase() + c.slice(1)) + '<small>' + counts[c] + '</small></button>'; }).join('');
    chips.hidden = false;
    grid.innerHTML = items.map(function (it, i) {
      var pv = R(it.preview), files = (it.files || []);
      return '<figure class="bk-gi" data-cat="' + esc(it.category || 'other') + '"><button type="button" class="bk-gi-open" data-i="' + i + '" aria-label="Preview ' + esc(it.title) + '">' +
        (pv ? '<img src="' + esc(pv) + '" alt="" loading="lazy" decoding="async">' : '<span class="noimg">No preview</span>') + '</button>' +
        '<figcaption class="bk-gi-cap"><b title="' + esc(it.title) + '">' + esc(it.title) + '</b><span class="m" title="' + esc(it.size || '') + '">' + esc(it.size || CAT[it.category] || '') + '</span>' +
        (files.length ? '<span class="bk-gi-dl">' + files.slice(0, 2).map(function (f) { return '<a href="' + esc(R(f.href)) + '" download>' + esc(f.label || fileName(f.href)) + '</a>'; }).join('') + (files.length > 2 ? '<span>+' + (files.length - 2) + ' in preview</span>' : '') + '</span>' : '') + '</figcaption></figure>';
    }).join('');
    $$('img', grid).forEach(function (img) { img.addEventListener('error', function () { var s = doc.createElement('span'); s.className = 'noimg'; s.textContent = 'Preview unavailable'; img.replaceWith(s); }); });
    chips.onclick = function (e) {
      var b = e.target.closest('[data-f]'); if (!b) return;
      $$('[data-f]', chips).forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
      $$('.bk-gi', grid).forEach(function (g) { g.hidden = b.dataset.f !== '*' && g.dataset.cat !== b.dataset.f; });
    };
    grid.onclick = function (e) {
      var b = e.target.closest('.bk-gi-open'); if (!b) return;
      var it = items[+b.dataset.i], files = it.files || [];
      lbOpen({
        title: it.title, meta: [CAT[it.category] || it.category, it.size].filter(Boolean).join(' · '), slides: it.preview ? [R(it.preview)] : [],
        body: (it.notes ? '<p class="bk-lb-meta">' + esc(it.notes) + '</p>' : '') +
          (files.length ? '<div class="bk-lb-dl">' + files.map(function (f) { return '<a href="' + esc(R(f.href)) + '" download>' + DL + esc(f.label || fileName(f.href)) + '</a>'; }).join('') + '</div>' : '')
      }, b);
    };
  });

  /* XVII · social */
  function tagStr(h) { if (!h) return ''; if (typeof h === 'string') return h.trim(); return h.map(function (t) { t = String(t).trim(); return t.charAt(0) === '#' ? t : '#' + t; }).join(' '); }
  function listStr(v) { return Array.isArray(v) ? v.join(', ') : (v || ''); }
  function slidesOf(p, R) {
    var s = Array.isArray(p.slides) && p.slides.length ? p.slides.map(function (x) { return R(typeof x === 'string' ? x : (x.png || x.src || x.href)); }) : [];
    return s.length ? s : (p.png ? [R(p.png)] : []);
  }
  loadManifest($('#soc'), function (m, R) {
    var box = $('#soc'), cats = m.categories || [], posts = m.posts || [], cal = m.calendar || [];
    var tabsEl = $('.bk-soc-tabs', box), grid = $('.bk-gal-grid', box), desc = $('.bk-cat-desc', box);
    if (!posts.length) { $('.bk-soon', box).hidden = false; return; }
    var byId = {}; posts.forEach(function (p, i) { byId[p.id] = i; });
    var catById = {}; cats.forEach(function (c) { catById[c.id] = c; });
    var count = function (id) { return posts.filter(function (p) { return p.category === id; }).length; };
    tabsEl.innerHTML = '<button role="tab" aria-selected="true" data-cat="*">All<small>' + posts.length + '</small></button>' +
      cats.map(function (c) { return '<button role="tab" aria-selected="false" tabindex="-1" data-cat="' + esc(c.id) + '">' + esc(c.title || c.id) + '<small>' + count(c.id) + '</small></button>'; }).join('');
    tabsEl.hidden = false;
    grid.innerHTML = posts.map(function (p, i) {
      var sl = slidesOf(p, R), c = catById[p.category];
      return '<figure class="bk-gi" data-cat="' + esc(p.category) + '"><button type="button" class="bk-gi-open" data-i="' + i + '" aria-label="Open ' + esc(p.title) + '">' +
        (sl[0] ? '<img src="' + esc(sl[0]) + '" alt="" loading="lazy" decoding="async">' : '<span class="noimg">No image</span>') +
        (sl.length > 1 ? '<span class="badge">' + sl.length + ' slides</span>' : '') + '</button>' +
        '<figcaption class="bk-gi-cap"><b title="' + esc(p.title) + '">' + esc(p.title.replace(/^[^:]{3,24}:\s*/, '')) + '</b><span class="m">' + esc(p.format || '') + '</span></figcaption></figure>';
    }).join('');
    $$('img', grid).forEach(function (img) { img.addEventListener('error', function () { var s = doc.createElement('span'); s.className = 'noimg'; s.textContent = 'Image unavailable'; img.replaceWith(s); }); });
    var showCat = initTabs(tabsEl, function (i, t) {
      var k = t.dataset.cat, c = catById[k];
      $$('.bk-gi', grid).forEach(function (g) { g.hidden = k !== '*' && g.dataset.cat !== k; });
      desc.hidden = !c; desc.textContent = c ? [c.description, c.cadence ? 'Cadence: ' + c.cadence : ''].filter(Boolean).join(' · ') : '';
    });
    showCat(cats.length ? 1 : 0); // open on the first category: compact; "All" is one tab away
    function openPost(i, opener) {
      var p = posts[i], c = catById[p.category], sl = slidesOf(p, R), tags = tagStr(p.hashtags);
      lbOpen({
        title: p.title, meta: [c ? c.title : p.category, p.format].filter(Boolean).join(' · '), slides: sl,
        body: (p.platforms ? '<p class="bk-lb-meta">Platforms: ' + esc(listStr(p.platforms)) + '</p>' : '') +
          (p.caption ? '<div class="bk-lb-block"><div class="hd"><span class="bk-label">Caption</span><button class="bk-chipbtn" type="button" data-copy="' + esc(p.caption) + '" data-copy-label="the caption">' + CP + 'Copy</button></div><p>' + esc(p.caption) + '</p></div>' : '') +
          (tags ? '<div class="bk-lb-block"><div class="hd"><span class="bk-label">Hashtags</span><button class="bk-chipbtn" type="button" data-copy="' + esc(tags) + '" data-copy-label="the hashtags">' + CP + 'Copy</button></div><p>' + esc(tags) + '</p></div>' : '') +
          (sl.length ? '<div class="bk-lb-dl"><a href="' + esc(sl[0]) + '" download data-cur-dl>' + DL + (sl.length > 1 ? 'Download this slide' : 'Download image') + '</a>' +
            (sl.length > 1 ? sl.map(function (s, k) { return '<a href="' + esc(s) + '" download style="background:#fff;color:var(--gold-ink);border:1px solid #f3dfd0">' + (k + 1) + '</a>'; }).join('') : '') + '</div>' : '')
      }, opener);
    }
    grid.onclick = function (e) { var b = e.target.closest('.bk-gi-open'); if (b) openPost(+b.dataset.i, b); };
    // four-week calendar
    if (cal.length) {
      var DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'], weeks = [], days = [], cells = {};
      cal.forEach(function (c) {
        var w = String(c.week), d = String(c.day);
        if (weeks.indexOf(w) < 0) weeks.push(w);
        if (days.indexOf(d) < 0) days.push(d);
        (cells[w + '|' + d] = cells[w + '|' + d] || []).push(c.post);
      });
      var di = function (d) { var k = DAYS.indexOf(d.slice(0, 3).toLowerCase()); return k < 0 ? 99 : k; };
      if (days.every(function (d) { return di(d) < 99; })) {
        // weekday names (also "Wed (story)"): merge into one column per weekday, Mon to Sun
        var merged = {};
        Object.keys(cells).forEach(function (k) { var p = k.split('|'), d2 = p[1].slice(0, 1).toUpperCase() + p[1].slice(1, 3).toLowerCase(); merged[p[0] + '|' + d2] = (merged[p[0] + '|' + d2] || []).concat(cells[k]); });
        cells = merged;
        days = DAYS.filter(function (d) { return days.some(function (x) { return di(x) === DAYS.indexOf(d); }); }).map(function (d) { return d.charAt(0).toUpperCase() + d.slice(1); });
      }
      weeks.sort(function (a, b) { return (parseFloat(a) || 0) - (parseFloat(b) || 0); });
      var t = '<thead><tr><th scope="col"><span class="sr-only">Week</span></th>' + days.map(function (d) { return '<th scope="col">' + esc(d.length <= 3 ? d : d.slice(0, 3)) + '</th>'; }).join('') + '</tr></thead><tbody>';
      weeks.forEach(function (w) {
        t += '<tr><th scope="row">' + (/^\d+$/.test(w) ? 'Week ' + esc(w) : esc(w)) + '</th>' + days.map(function (d) {
          return '<td>' + (cells[w + '|' + d] || []).map(function (pid) {
            var i = typeof pid === 'number' && !(pid in byId) ? pid : byId[pid]; var p = posts[i]; if (!p) return '<span class="muted">' + esc(pid) + '</span>';
            var s = slidesOf(p, R)[0];
            return '<button type="button" data-i="' + i + '" aria-label="Open ' + esc(p.title) + '">' + (s ? '<img src="' + esc(s) + '" alt="" loading="lazy">' : '<i></i>') + '<span>' + esc(p.title) + '</span></button>';
          }).join('') + '</td>';
        }).join('') + '</tr>';
      });
      var calT = $('.bk-cal', box); calT.innerHTML = t + '</tbody>';
      calT.onclick = function (e) { var b = e.target.closest('button[data-i]'); if (b) openPost(+b.dataset.i, b); };
      $('.bk-cal-wrap', box).hidden = false;
    }
  });

  /* ---------- XVIII · downloads ---------- */
  var LM = [
    ['Horizontal', { colour: ['horizontal-colour', 1], reverse: ['horizontal-reverse', 1], navy: ['horizontal-navy', 1], white: ['horizontal-white', 1] }, '1876 × 400'],
    ['Stacked', { colour: ['stacked-colour', 1], reverse: ['stacked-reverse', 1], navy: ['stacked-navy', 0], white: ['stacked-white', 0] }, '1396 × 1016'],
    ['Mark', { colour: ['mark-colour', 1], reverse: ['mark-colour', 0], navy: ['mark-navy', 0], white: ['mark-white', 1] }, '1100 × 1000'],
    ['Avatar', { colour: ['avatar-light', 1], reverse: ['avatar', 1] }, '1080 × 1080']
  ];
  $('#logoMatrix').innerHTML = '<thead><tr><th scope="col">Lockup</th><th scope="col">Colour, on white</th><th scope="col">Reverse, on navy</th><th scope="col">Navy, one colour</th><th scope="col">White, one colour</th></tr></thead><tbody>' +
    LM.map(function (r) {
      return '<tr><th scope="row">' + r[0] + '<small>' + r[2] + ' PNG</small></th>' + ['colour', 'reverse', 'navy', 'white'].map(function (k) {
        var f = r[1][k]; if (!f) return '<td class="muted">—</td>';
        var n = 'expobusiness-' + f[0];
        return '<td><a href="img/logo/' + n + '.svg" download aria-label="' + r[0] + ', ' + k + ', SVG">SVG</a>' + (f[1] ? ' <a href="exports/' + n + '.png" download aria-label="' + r[0] + ', ' + k + ', PNG">PNG</a>' : '') + '</td>';
      }).join('') + '</tr>';
    }).join('') + '</tbody>';

  var S = window.SITE || {}, C = S.contact || {}, L = S.legal || {}, SO = S.social || {};
  function isPh(v) { return !v || /^\[.*\]$/.test(v); }
  var addr = C.address && !/cebu/i.test(C.address) ? C.address : 'Metro Manila, Philippines'; // BRAND-FACTS: Metro Manila only
  var FACTS = [
    ['Name', 'ExpoBusiness Travel Services'], ['Partner', 'Immaculate Connections', 'https://www.immaculateconnectionsph.com/'],
    ['Partner line', 'In partnership with Immaculate Connections'],
    ['Short line', 'Business travel, trade missions and delegations for Philippine companies.'],
    ['Base', addr], ['Email', C.email ? C.email + ' (planned)' : ''], ['Phone', C.phone], ['Hours', C.hours],
    ['Website', S.site && S.site.url], ['Facebook', SO.facebook], ['LinkedIn', SO.linkedin],
    ['DOT', L.dot], ['IATA', L.iata], ['PhilGEPS', L.philgeps], ['Registration', L.registration]
  ];
  $('#facts').innerHTML = FACTS.map(function (f) {
    var v = f[1] || '[not set]', ph = isPh(v);
    var dd = f[2] ? '<a href="' + f[2] + '" rel="noopener" target="_blank">' + esc(v) + '</a>' : esc(v);
    return '<div><dt>' + esc(f[0]) + '</dt><dd' + (ph ? ' class="ph"' : '') + '>' + dd + '</dd>' + (ph ? '<span></span>' : '<button type="button" data-copy="' + esc(v.replace(' (planned)', '')) + '" data-copy-label="' + esc(f[0].toLowerCase()) + '" aria-label="Copy ' + esc(f[0]) + '">Copy</button>') + '</div>';
  }).join('');

  function blob(name, type, text) {
    var a = doc.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: type })); a.download = name;
    doc.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
    toast('Saved ' + name);
  }
  var TOK = PALETTE.filter(function (p) { return p.id; });
  var FONTS = { heading: '"Plus Jakarta Sans", Arial, system-ui, sans-serif', body: 'Inter, Arial, system-ui, sans-serif', google: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Inter:wght@400;500;600&display=swap' };
  var EASE = { ease: 'cubic-bezier(.16, 1, .3, 1)', 'btn-spring': 'cubic-bezier(.34, 1.56, .64, 1)', 'btn-ease': 'cubic-bezier(.2, .8, .2, 1)' };
  $$('[data-blob]').forEach(function (b) {
    b.addEventListener('click', function () {
      var k = b.dataset.blob;
      if (k === 'tokens.css') {
        blob('expobusiness-tokens.css', 'text/css', '/* ExpoBusiness Travel Services brand tokens, Edition III (November 2026). */\n@import url("' + FONTS.google + '");\n:root {\n' +
          TOK.map(function (p) { return '  --eb-' + p.id + ': ' + p.hex + ';  /* ' + p.name + (p.pms ? ', Pantone ' + p.pms + ' nearest' : '') + ' */'; }).join('\n') +
          '\n  --eb-font-heading: ' + FONTS.heading + ';\n  --eb-font-body: ' + FONTS.body + ';\n' +
          SPACE.map(function (s) { return '  --eb-space-' + s[0] + ': ' + s[1] + 'px;'; }).join('\n') +
          '\n  --eb-wrap: 1240px;\n  --eb-gutter: clamp(16px, 4vw, 40px);\n  --eb-radius: 10px;\n  --eb-radius-lg: 16px;\n  --eb-radius-pill: 999px;\n' +
          Object.keys(EASE).map(function (e) { return '  --eb-' + e + ': ' + EASE[e] + ';'; }).join('\n') + '\n}\n');
      } else if (k === 'tokens.json') {
        var o = { colour: {}, font: { heading: FONTS.heading, body: FONTS.body, url: FONTS.google }, space: {}, layout: { wrap: '1240px', gutter: 'clamp(16px, 4vw, 40px)' }, radius: { base: '10px', large: '16px', pill: '999px' }, easing: EASE };
        TOK.forEach(function (p) { o.colour[p.id] = { value: p.hex, name: p.name, role: p.role, cmyk: p.cmyk, pantoneNearest: p.pms || null, css: p.t || null }; });
        SPACE.forEach(function (s) { o.space['space-' + s[0]] = s[1] + 'px'; });
        blob('expobusiness-tokens.json', 'application/json', JSON.stringify(o, null, 2));
      } else {
        var facts = {
          name: 'ExpoBusiness Travel Services', shortName: 'ExpoBusiness', base: 'Metro Manila, Philippines',
          partner: { name: 'Immaculate Connections', url: 'https://www.immaculateconnectionsph.com/', relationship: 'Partner', approvedLine: 'In partnership with Immaculate Connections', neverSay: ['subsidiary', 'powered by', 'business-travel arm of', 'a division of', 'part of', 'owned by'] },
          positioning: $('.bk-roof').childNodes[1].textContent.trim(),
          pillars: $$('.bk-pillars > li').map(function (li) { return { title: $('b', li).textContent, line: $('span', li).textContent, proof: $$('ul li', li).map(function (x) { return x.textContent; }) }; }),
          story: $$('.bk-story p').map(function (p) { return p.textContent.trim(); }),
          descriptions: { words25: $('#bp-25').textContent.trim(), words50: $('#bp-50').textContent.trim(), words100: $('#bp-100').textContent.trim() },
          audiences: $$('.bk-aud').map(function (a) { return { label: $('.chip', a).textContent.trim(), headline: $('h4', a).textContent.trim(), line: $('p', a).textContent.trim() }; }),
          primaryCta: 'Request Corporate Proposal',
          contact: { email: C.email || null, emailStatus: 'planned, domain not yet registered', phone: null, address: null },
          rules: $$('#vo-2 .bk-rules b').map(function (b) { return b.textContent.replace(/\.$/, ''); })
        };
        blob('expobusiness-brand-facts.json', 'application/json', JSON.stringify(facts, null, 2));
      }
    });
  });
})();
