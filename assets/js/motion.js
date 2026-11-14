// Motion and interaction. Rules for smoothness:
// - only transform / opacity change per frame; one rAF-throttled scroll handler;
// - layout is read once per interaction, never inside a loop of writes;
// - loops pause off-screen and in hidden tabs; reduced-motion skips all of it.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ---------- scroll: progress bar + header hide/show ---------- */
  const bar = $(".progress"), header = $(".site-header");
  let lastY = scrollY, ticking = false;
  function onFrame() {
    ticking = false;
    const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
    if (bar) bar.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
    if (header && !reduce && !header.classList.contains("open")) {
      if (y > 420 && y > lastY + 4) header.classList.add("away");
      else if (y < lastY - 4 || y < 420) header.classList.remove("away");
    }
    lastY = y;
  }
  addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onFrame); } }, { passive: true });
  onFrame();
  // keyboard users tabbing into the header always see it
  header && header.addEventListener("focusin", () => header.classList.remove("away"));

  /* ---------- headline words ---------- */
  $$(".hero h1, .page-hero h1").forEach(h => {
    if (reduce) return;
    h.classList.add("split-words");
    let i = 0;
    const walk = node => [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
          const s = document.createElement("span"); s.className = "w"; s.style.setProperty("--i", i++); s.textContent = part; frag.appendChild(s);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1) walk(n);
    });
    walk(h);
  });
  // start once the fonts are in (so words do not jump), but never wait more than 350 ms;
  // setTimeout, not rAF, so a background tab still shows the hero
  let started = false;
  const start = () => {
    if (started) return; started = true;
    void document.body.offsetWidth; // commit the hidden state so the transition runs
    $$(".split-words").forEach(h => h.classList.add("go"));
    const hero = $(".hero"); if (hero) hero.classList.add("go");
    setTimeout(flyRoute, reduce ? 0 : 900);
  };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => setTimeout(start, 20));
  setTimeout(start, 350);

  /* ---------- count-up: days to the Canton Fair ---------- */
  $$("[data-countdown]").forEach(el => {
    const d = Math.ceil((new Date(el.dataset.countdown + "T09:00:00+08:00") - Date.now()) / 864e5);
    const b = el.querySelector("b");
    if (!(d > 0)) { el.hidden = true; return; }
    if (reduce) { b.textContent = d; return; }
    b.textContent = "0";
    const t0 = performance.now() + 500, dur = 1400;
    const step = now => {
      const p = Math.min(1, Math.max(0, (now - t0) / dur)), e = 1 - Math.pow(1 - p, 4);
      b.textContent = Math.round(d * e);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
    setTimeout(() => { b.textContent = d; }, 500 + dur + 300); // land on the real number even if frames were throttled
  });

  /* ---------- flight route CEB -> CAN ---------- */
  let flown = false;
  function flyRoute() {
    const route = $(".route"); if (!route || flown) return; flown = true;
    const svg = $(".route-svg", route), line = $(".route-line", route), plane = $(".route-plane", route);
    if (reduce) { line.style.strokeDashoffset = 0; return; }
    const path = line, len = path.getTotalLength();
    const sb = svg.getBoundingClientRect(), rb = route.getBoundingClientRect(); // read once
    const sx = sb.width / 200, sy = sb.height / 50, ox = sb.left - rb.left, oy = sb.top - rb.top;
    const pt = l => { const p = path.getPointAtLength(l); return [ox + p.x * sx, oy + p.y * sy]; };
    const run = () => {
      const t0 = performance.now(), dur = 2400;
      plane.style.opacity = 1;
      const frame = now => {
        const p = Math.min(1, (now - t0) / dur), e = p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
        const [x, y] = pt(len * e), [x2, y2] = pt(Math.min(len, len * e + 1));
        const ang = Math.atan2(y2 - y, x2 - x) * 180 / Math.PI + 45; // icon points to the top-right
        plane.style.transform = `translate3d(${x - 11}px, ${y - 11}px, 0) rotate(${ang}deg)`;
        line.style.strokeDashoffset = 1 - e;
        if (p < 1) requestAnimationFrame(frame);
        else setTimeout(() => { if (!document.hidden && inView(route)) { line.style.transition = "stroke-dashoffset .6s"; line.style.strokeDashoffset = 1; setTimeout(() => { line.style.transition = ""; run(); }, 700); } else setTimeout(run, 4000); }, 5000);
      };
      requestAnimationFrame(frame);
    };
    run();
  }
  const inView = el => { const r = el.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight; };

  /* ---------- pause loops that are off-screen ---------- */
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle("paused", !e.isIntersecting)));
    $$(".hero, .page-hero, .marquee, .cc-fab").forEach(el => io.observe(el));
  }
  document.addEventListener("visibilitychange", () => document.documentElement.classList.toggle("paused", document.hidden));

  /* ---------- 3D tilt on service cards (mouse only) ---------- */
  if (fine && !reduce) $$(".tilt").forEach(card => {
    let rect = null, raf = 0, mx = 0, my = 0;
    card.addEventListener("pointerenter", () => { rect = card.getBoundingClientRect(); card.classList.remove("untilt"); card.classList.add("tilting"); });
    card.addEventListener("pointermove", e => {
      if (!rect) return; mx = (e.clientX - rect.left) / rect.width; my = (e.clientY - rect.top) / rect.height;
      if (!raf) raf = requestAnimationFrame(() => {
        raf = 0;
        card.style.transform = `perspective(900px) rotateX(${(.5 - my) * 7}deg) rotateY(${(mx - .5) * 9}deg) translateY(-4px)`;
        card.style.setProperty("--mx", mx * 100 + "%"); card.style.setProperty("--my", my * 100 + "%");
      });
    });
    card.addEventListener("pointerleave", () => { rect = null; cancelAnimationFrame(raf); raf = 0; card.classList.remove("tilting"); card.classList.add("untilt"); card.style.transform = ""; });
  });

  /* ---------- headcount slider -> highlights the right setup ---------- */
  const range = $("#pax-range");
  if (range) {
    const out = $("#pax-out"), unit = $("#pax-unit"), tip = $("#pax-tip"), segs = $$(".seg[data-min]");
    const TIPS = [
      [3, "A lean sourcing trip: quick bookings and a shared interpreter by the half day."],
      [9, "A corporate group: private van, a dedicated bilingual coordinator and a hall map per buyer."],
      [999, "A delegation: group visa filing, seat blocks, coaches, rooming lists and business dinners."]];
    const set = () => {
      const v = +range.value;
      out.textContent = v >= 40 ? "40+" : v; unit.textContent = v === 1 ? "traveller" : "travellers";
      range.style.setProperty("--p", ((v - 1) / 39 * 100) + "%");
      tip.textContent = TIPS.find(t => v <= t[0])[1];
      segs.forEach(s => { const on = v >= +s.dataset.min && v <= +s.dataset.max; s.classList.toggle("seg-on", on); s.classList.toggle("seg-dim", !on); });
    };
    range.addEventListener("input", set); set();
  }
})();
