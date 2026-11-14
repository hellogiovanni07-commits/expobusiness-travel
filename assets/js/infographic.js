// Infographic kit: .ig-anim blocks animate in once when seen (adds .ig-on, then .ig-done);
// [data-count] numbers count up from 0. Child order sets the stagger (--k).
// Safety net: if the observer is throttled, anything on or above the screen still shows.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  function countUp(el) {
    if (el.dataset.counted) return; el.dataset.counted = "1";
    const to = parseFloat(el.dataset.count), dec = (el.dataset.count.split(".")[1] || "").length;
    const out = el.querySelector("[data-count-n]") || el;
    const fmt = v => v.toLocaleString("en-PH", { minimumFractionDigits: dec, maximumFractionDigits: dec });
    if (reduce || !(to > 0)) { out.textContent = fmt(to || 0); return; }
    const t0 = performance.now(), dur = 1300;
    const step = now => { const p = Math.min(1, (now - t0) / dur); out.textContent = fmt(to * (1 - Math.pow(1 - p, 4))); if (p < 1) requestAnimationFrame(step); };
    out.textContent = fmt(0); requestAnimationFrame(step);
    setTimeout(() => { out.textContent = fmt(to); }, dur + 400); // land on the real number even if frames were throttled
  }

  function play(el) {
    if (el.classList.contains("ig-on")) return;
    // stagger children of every chart/list inside
    $$(".ig-mchart, .ig-hbars, .ig-flow, .ig-stats", el).concat(el.matches(".ig-mchart, .ig-hbars, .ig-flow, .ig-stats") ? [el] : [])
      .forEach(list => [...list.children].forEach((c, k) => c.style.setProperty("--k", k)));
    el.classList.add("ig-on");
    $$("[data-count]", el).forEach(countUp);
    setTimeout(() => el.classList.add("ig-done"), 1900);
  }

  $$("[data-count]").forEach(n => { if (!n.closest(".ig-anim")) { n.closest("section")?.classList.add("ig-anim"); } });
  window.IG = { play, countUp };
  const all = new Set($$(".ig-anim"));
  if (reduce || !("IntersectionObserver" in window)) { all.forEach(play); return; }
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { io.unobserve(e.target); all.delete(e.target); play(e.target); } }), { rootMargin: "0px 0px -10% 0px" });
  all.forEach(el => io.observe(el));
  let last = 0, trail = 0;
  const sweep = () => { last = Date.now(); all.forEach(el => { if (el.getBoundingClientRect().top < innerHeight) { all.delete(el); io.unobserve(el); play(el); } }); if (!all.size) removeEventListener("scroll", onS); };
  const onS = () => { clearTimeout(trail); if (Date.now() - last > 150) sweep(); else trail = setTimeout(sweep, 170); };
  addEventListener("scroll", onS, { passive: true });
  setTimeout(sweep, 1200);
})();
