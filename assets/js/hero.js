// Home hero: 4 audience slides with autoplay, tabs, swipe, keyboard, pointer tilt and
// one interactive infographic per slide. Timers are setTimeout-based so a background tab never
// strands a half-shown slide; every loop pauses off-screen; reduced motion = no autoplay, no motion.
(() => {
  const hx = document.querySelector(".hx"); if (!hx) return;
  const $ = (s, r = hx) => r.querySelector(s), $$ = (s, r = hx) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const slides = $$(".hx-slide"), tabs = $$(".hx-tabs [role=tab]"), bgs = $$(".hx-bg");
  const playBtn = $(".hx-play"), DUR = 9000;
  let settleT = 0, cur = 0, timer = 0, startAt = 0, remain = DUR, userPaused = reduce;
  const holds = new Set();
  hx.style.setProperty("--dur", DUR + "ms");

  /* split each slide headline into words for the staggered entrance */
  if (!reduce) $$(".hx-h").forEach(h => {
    let i = 0;
    const walk = node => [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const f = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(p => { if (!p) return; if (/^\s+$/.test(p)) { f.appendChild(document.createTextNode(p)); return; } const s = document.createElement("span"); s.className = "w"; s.style.setProperty("--i", i++); s.textContent = p; f.appendChild(s); });
        n.replaceWith(f);
      } else if (n.nodeType === 1) walk(n);
    });
    walk(h);
  });

  /* ---------- slide switching ---------- */
  slides.forEach((s, i) => { if (i) { s.setAttribute("aria-hidden", "true"); s.inert = true; } s.setAttribute("aria-labelledby", tabs[i].id); });
  bgs[0] && bgs[0].classList.add("on");
  function go(n, fromUser) {
    n = (n + slides.length) % slides.length;
    if (n === cur) return;
    const prev = slides[cur], next = slides[n];
    prev.classList.remove("is-on"); prev.setAttribute("aria-hidden", "true"); prev.inert = true;
    if (!reduce) { next.classList.add("is-pre"); void next.offsetWidth; next.classList.remove("is-pre"); }
    next.classList.add("is-on"); next.removeAttribute("aria-hidden"); next.inert = false;
    bgs.forEach((b, i) => { if (i === n) { b.classList.remove("on", "out"); void b.offsetWidth; b.classList.add("on"); } else if (i === cur) { b.classList.remove("on"); b.classList.add("out"); } else b.classList.remove("on", "out"); });
    // pointer tilt only takes over once the new panel has finished entering
    slides.forEach(s => s.classList.remove("settled")); clearTimeout(settleT); settleT = setTimeout(() => next.classList.add("settled"), reduce ? 0 : 1150);
    tabs.forEach((t, i) => { const on = i === n; t.setAttribute("aria-selected", on); t.tabIndex = on ? 0 : -1; });
    if (fromUser !== "auto") tabs[n].scrollIntoView({ block: "nearest", inline: "nearest", behavior: reduce ? "auto" : "smooth" });
    cur = n;
    onShow[n] && onShow[n]();
    restart();
  }

  /* ---------- autoplay with holds (hover, focus, off-screen, hidden tab) ---------- */
  const paused = () => userPaused || holds.size > 0;
  function restart() {
    clearTimeout(timer); remain = DUR;
    hx.classList.remove("run"); void hx.offsetWidth;
    if (!userPaused) hx.classList.add("run");
    sync();
  }
  function sync() {
    clearTimeout(timer);
    hx.classList.toggle("is-paused", paused());
    playBtn.setAttribute("aria-pressed", String(userPaused));
    playBtn.setAttribute("aria-label", userPaused ? "Play slides" : "Pause slides");
    if (!paused()) { startAt = performance.now(); timer = setTimeout(() => go(cur + 1, "auto"), remain); }
  }
  function hold(k, on) {
    const was = paused();
    if (on) holds.add(k); else holds.delete(k);
    if (was && !paused()) sync();
    else if (!was && paused()) { remain = Math.max(400, remain - (performance.now() - startAt)); sync(); }
  }
  function stopForGood() { if (userPaused) return; remain = Math.max(400, remain - (performance.now() - startAt)); userPaused = true; hx.classList.remove("run"); sync(); }

  playBtn.addEventListener("click", () => {
    if (userPaused) { userPaused = false; remain = DUR; hx.classList.remove("run"); void hx.offsetWidth; hx.classList.add("run"); sync(); }
    else stopForGood();
  });
  $(".hx-prev").addEventListener("click", () => go(cur - 1));
  $(".hx-next").addEventListener("click", () => go(cur + 1));
  tabs.forEach((t, i) => {
    t.addEventListener("click", () => go(i));
    t.addEventListener("keydown", e => {
      const k = { ArrowRight: cur + 1, ArrowLeft: cur - 1, Home: 0, End: slides.length - 1 }[e.key];
      if (k === undefined) return; e.preventDefault(); go(k); tabs[cur].focus();
    });
  });
  if (fine) { hx.addEventListener("pointerenter", () => hold("hover", true)); hx.addEventListener("pointerleave", () => hold("hover", false)); }
  hx.addEventListener("focusin", () => hold("focus", true));
  hx.addEventListener("focusout", e => { if (!hx.contains(e.relatedTarget)) hold("focus", false); });
  // using a slide's own widget means the visitor is reading it: stop the autoplay
  $$(".hx-panel").forEach(p => p.addEventListener("pointerdown", stopForGood));
  $$(".hx-panel input, .hx-panel button").forEach(el => el.addEventListener("keydown", stopForGood));
  if ("IntersectionObserver" in window) new IntersectionObserver(es => es.forEach(e => { hx.classList.toggle("is-off", !e.isIntersecting); hold("off", !e.isIntersecting); }), { threshold: .2 }).observe(hx);
  document.addEventListener("visibilitychange", () => hold("hidden", document.hidden));

  /* swipe on touch screens (not when dragging a slider) */
  let sx = 0, sy = 0, sw = false;
  hx.addEventListener("pointerdown", e => { sw = e.pointerType !== "mouse" && !e.target.closest("input, .hx-tabs"); sx = e.clientX; sy = e.clientY; }, { passive: true });
  hx.addEventListener("pointerup", e => {
    if (!sw) return; sw = false;
    const dx = e.clientX - sx, dy = e.clientY - sy;
    if (Math.abs(dx) > 56 && Math.abs(dx) > Math.abs(dy) * 1.4) go(cur + (dx < 0 ? 1 : -1));
  }, { passive: true });

  /* pointer: glow follows, background parallax, panel tilt (mouse only, one write per frame) */
  if (fine && !reduce) {
    let rect = null, raf = 0, px = 0, py = 0;
    const measure = () => { rect = hx.getBoundingClientRect(); };
    hx.addEventListener("pointerenter", () => { measure(); hx.classList.add("tilting"); });
    addEventListener("resize", () => { rect = null; }, { passive: true });
    addEventListener("scroll", () => { rect = null; }, { passive: true });
    hx.addEventListener("pointermove", e => {
      if (!rect) measure(); px = e.clientX - rect.left; py = e.clientY - rect.top;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0; if (!rect) measure(); const nx = px / rect.width - .5, ny = py / rect.height - .5;
        hx.style.setProperty("--gx", px + "px"); hx.style.setProperty("--gy", py + "px");
        hx.style.setProperty("--bx", (-nx * 14).toFixed(1) + "px"); hx.style.setProperty("--by", (-ny * 10).toFixed(1) + "px");
        const p = slides[cur].querySelector(".hx-panel");
        if (p) { p.style.setProperty("--ry", (nx * 7).toFixed(2) + "deg"); p.style.setProperty("--rx", (-ny * 5).toFixed(2) + "deg"); }
      });
    });
    hx.addEventListener("pointerleave", () => {
      cancelAnimationFrame(raf); raf = 0; hx.classList.remove("tilting");
      $$(".hx-panel").forEach(p => { p.style.removeProperty("--rx"); p.style.removeProperty("--ry"); });
      hx.style.removeProperty("--bx"); hx.style.removeProperty("--by");
    });
  }

  /* ---------- 01 Canton: phase timeline ---------- */
  const phs = $$(".hx-ph"), phOut = $(".hx-ph-detail");
  const showPh = b => { phs.forEach(x => x.setAttribute("aria-pressed", String(x === b))); phOut.innerHTML = `<b>${b.querySelector("b").textContent} · ${b.dataset.when}</b><br>${b.dataset.what}`; };
  phs.forEach(b => { b.addEventListener("click", () => showPh(b)); if (fine) b.addEventListener("pointerenter", () => showPh(b)); });
  phs[0] && showPh(phs[0]);

  /* ---------- 02 Invoice: toggle services ---------- */
  const items = $$(".hx-items button"), wires = $$(".hx-wires path"), lines = $$(".hx-doc-lines li"), doc = $(".hx-doc"), nItems = $('[data-n="items"]');
  function syncInv(bump) {
    let n = 0;
    items.forEach(b => { const on = b.getAttribute("aria-pressed") === "true", k = +b.dataset.k; n += on; wires[k].classList.toggle("on", on); lines[k].classList.toggle("on", on); });
    nItems.textContent = n;
    if (bump && !reduce) { doc.classList.remove("bump"); void doc.offsetWidth; doc.classList.add("bump"); }
  }
  items.forEach(b => b.addEventListener("click", () => {
    const on = b.getAttribute("aria-pressed") === "true";
    if (on && items.filter(x => x.getAttribute("aria-pressed") === "true").length === 1) { b.classList.remove("nope"); void b.offsetWidth; b.classList.add("nope"); return; }
    b.setAttribute("aria-pressed", String(!on)); syncInv(true);
  }));
  syncInv(false);

  /* ---------- 03 Delegation planner ---------- */
  const pax = $("#hx-pax"), seatsEl = $(".hx-seats"), paxOut = $("#hx-pax-out");
  const seats = Array.from({ length: +pax.max }, (_, i) => { const s = document.createElement("span"); s.style.setProperty("--d", (reduce ? 0 : Math.min(i, 30) * 8) + "ms"); seatsEl.appendChild(s); return s; });
  const out = k => $(`[data-o="${k}"]`);
  const setNum = (el, v) => { if (el.textContent === String(v)) return; el.textContent = v; if (!reduce && el.tagName === "DD") { el.classList.remove("bump"); void el.offsetWidth; el.classList.add("bump"); } };
  function setPax(n) {
    paxOut.textContent = n; pax.style.setProperty("--p", ((n - pax.min) / (pax.max - pax.min) * 100) + "%");
    seats.forEach((s, i) => s.classList.toggle("on", i < n));
    setNum(out("visa"), n); setNum(out("rooms"), Math.ceil(n / 2));
    const van = n <= 12, veh = van ? 1 : Math.ceil(n / 45);
    setNum(out("veh"), veh); out("vehk").textContent = van ? "Van" : veh === 1 ? "Coach" : "Coaches";
  }
  const delegCta = document.getElementById("hx-deleg-cta");
  pax.addEventListener("input", () => { setPax(+pax.value); if (delegCta) delegCta.href = "proposal.html?pax=" + (+pax.value <= 24 ? "10-24" : "25%2B") + "&target=mice"; });
  setPax(+pax.value);

  /* ---------- 04 Calendar: month detail ---------- */
  const chart = $(".hx-p-cal .ig-mchart"), calOut = $(".hx-cal-detail");
  let months = []; try { months = JSON.parse(chart.dataset.months); } catch (e) { /* bars still work as links */ }
  const mbars = $$(".ig-mbar", chart);
  const showM = i => {
    const d = months[i]; if (!d) return;
    mbars.forEach((b, k) => b.classList.toggle("on", k === i));
    calOut.innerHTML = d.n ? `<b>${d.label} 2027 · ${d.n} expo${d.n > 1 ? "s" : ""}</b>${d.top ? "<br>Including " + d.top + ". Tap the bar to see them all." : ""}` : `<b>${d.label} 2027</b><br>No major shows on our list yet.`;
  };
  mbars.forEach((b, i) => { b.addEventListener("pointerenter", () => showM(i)); b.addEventListener("focus", () => showM(i)); });
  if (months.length) showM(months.reduce((a, d, i) => d.n > months[a].n ? i : a, 0));

  /* per-slide entrances that replay each time the slide is shown */
  const replayIG = el => { if (!el || reduce || !window.IG) return; el.classList.remove("ig-on", "ig-done"); el.classList.add("ig-anim"); void el.offsetWidth; window.IG.play(el); };
  const onShow = [
    null,
    () => { if (reduce) return; lines.forEach(l => l.classList.remove("on")); setTimeout(() => syncInv(true), 900); },
    () => { if (reduce) return; const v = +pax.value; setPax(+pax.min); setTimeout(() => setPax(v), 900); },
    () => replayIG($(".hx-p-cal")),
  ];

  setTimeout(() => slides[cur].classList.add("settled"), reduce ? 0 : 1500);
  restart();
})();
