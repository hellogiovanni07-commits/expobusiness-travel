// Canton Fair module: 3D hall preview, countdown, phase timeline and schedule table. Used on the China guide page.
(() => {
if (!document.getElementById("countdown") || !window.FAIR) return;
const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
const FINE = matchMedia("(hover: hover) and (pointer: fine)").matches;
const fmt = d => d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "Asia/Manila" });
const rangeTxt = ([a, b]) => {
  const A = new Date(a + "T00:00:00+08:00"), B = new Date(b + "T00:00:00+08:00");
  return A.getMonth() === B.getMonth() ? `${fmt(A)}–${B.getDate()}` : `${fmt(A)}–${fmt(B)}`;
};
const now = new Date();
const curSession = FAIR.sessions.find(s => new Date(s.phases[2][1] + "T18:00:00+08:00") > now) || FAIR.sessions.at(-1);
const liveEl = document.getElementById("liveLabel");
// Schedule table cells follow SITE.canton.sessions too.
document.querySelectorAll("#sched tbody tr").forEach((tr, p) => { const tds = tr.querySelectorAll("td.tnum"); FAIR.sessions.forEach((s, i) => { if (tds[i]) tds[i].textContent = rangeTxt(s.phases[p]); }); });
document.querySelectorAll("#sched thead th small").forEach((sm, i) => { const s = FAIR.sessions[i]; if (s) sm.textContent = s.expected ? "expected" : "confirmed"; });
/* ================= LIVE LABEL + COUNTDOWN ================= */
const all = FAIR.sessions.flatMap(s => s.phases.map(([a, b], i) => ({ s: s.name, p: i + 1, start: new Date(a + "T09:30:00+08:00"), end: new Date(b + "T18:00:00+08:00") })));
const cd = document.getElementById("countdown");
const units = Object.fromEntries([...cd.querySelectorAll("[data-u]")].map(b => [b.dataset.u, b]));
const prev = {};
function tick() {
  const t0 = new Date();
  const live = all.find(x => t0 >= x.start && t0 <= x.end);
  const nx = all.find(x => x.start > t0);
  const ref = live || nx;
  if (!ref) return;
  cd.classList.toggle("is-live", !!live);
  document.getElementById("cdLabel").textContent = live ? `${ref.s} · Phase ${ref.p} is open now` : `Next: ${ref.s} · Phase ${ref.p}`;
  document.getElementById("cdNote").textContent = live ? "until this phase closes. The next phases are still bookable." : `until Phase ${ref.p} opens in Guangzhou`;
  if (liveEl) liveEl.textContent = live ? `Canton Fair Phase ${ref.p} is open now` : `Next Canton Fair: ${ref.s}, Phase ${ref.p}`;
  const t = Math.max(0, (live ? ref.end : ref.start) - t0) / 1000;
  const v = { d: Math.floor(t / 86400), h: Math.floor(t % 86400 / 3600), m: Math.floor(t % 3600 / 60), s: Math.floor(t % 60) };
  for (const k in v) {
    const str = String(v[k]).padStart(2, "0");
    if (prev[k] !== str) {
      units[k].innerHTML = `<span>${str}</span>`;
      if (prev[k] !== undefined && !RM) { units[k].classList.remove("tick"); void units[k].offsetWidth; units[k].classList.add("tick"); }
      prev[k] = str;
    }
  }
}
tick(); setInterval(tick, 1000);

/* ================= CALENDAR: 3D HALL synced with timeline + table ================= */
const PHASES = [
  { items: "Electronics, machinery, lighting, hardware, vehicles, new energy", tone: "#c9460b", tags: { 9: "Electronics", 24: "Machinery", 30: "Lighting", 40: "New energy" } },
  { items: "Consumer goods, kitchenware, gifts, home decor, building materials, furniture", tone: "#d7261e", tags: { 8: "Furniture", 18: "Kitchenware", 33: "Building", 44: "Gifts" } },
  { items: "Garments, textiles, toys, shoes and bags, stationery, health, food", tone: "#a8380a", tags: { 10: "Garments", 22: "Toys", 36: "Shoes & bags", 43: "Food" } },
];
const N = 7;
const floor = document.getElementById("floor");
const booths = [];
const rand = seed => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
const layouts = PHASES.map((p, pi) => {
  const r = rand(97 + pi * 131);
  return Array.from({ length: N * N }, (_, i) => {
    const x = i % N, y = Math.floor(i / N);
    const bias = [x / N, y / N, 1 - (x + y) / (2 * N)][pi];
    const v = r() * .75 + bias * .45;
    if (p.tags[i]) return { cls: "hot", h: 44 + r() * 20 };
    if (v > .78) return { cls: "on", h: 28 + r() * 28 };
    if (v > .55) return { cls: "lit", h: 10 + r() * 14 };
    return { cls: "", h: 3 };
  });
});
for (let i = 0; i < N * N; i++) {
  const b = document.createElement("div");
  b.className = "booth"; b.dataset.x = i % N; b.dataset.y = Math.floor(i / N);
  b.innerHTML = '<span class="tag"><span></span></span>';
  floor.append(b); booths.push(b);
}
let phase = 0, shownSession = FAIR.sessions.indexOf(curSession);
const caption = document.getElementById("phaseCaption");
const datesEl = document.getElementById("phaseDates");
const tabs = [...document.querySelectorAll(".phase-switch [role=tab]")];
const ind = document.querySelector(".phase-ind");
const segs = [...document.querySelectorAll(".tl-seg")];
const rows = [...document.querySelectorAll("#sched tbody tr")];
function setPhase(p, origin = { x: 0, y: N - 1 }) {
  phase = p;
  layouts[p].forEach((cell, i) => {
    const b = booths[i];
    const d = Math.hypot(+b.dataset.x - origin.x, +b.dataset.y - origin.y);
    b.style.setProperty("--delay", RM ? "0s" : (d * 0.045).toFixed(3) + "s");
    b.classList.remove("on", "hot", "lit", "show-tag");
    if (cell.cls) b.classList.add(cell.cls);
    b.style.setProperty("--base", (RM ? Math.min(cell.h, 30) : cell.h).toFixed(0) + "px");
    const tag = PHASES[p].tags[i];
    b.querySelector(".tag span").textContent = tag || "";
    if (tag) b.classList.add("show-tag");
  });
  tabs.forEach((t, i) => { t.setAttribute("aria-selected", String(i === p)); t.tabIndex = i === p ? 0 : -1; });
  segs.forEach((s, i) => s.classList.toggle("is-picked", i === p));
  rows.forEach((r, i) => r.classList.toggle("is-picked", i === p));
  moveInd();
  caption.textContent = PHASES[p].items;
  datesEl.textContent = rangeTxt(FAIR.sessions[shownSession].phases[p]);
}
function moveInd() {
  const t = tabs[phase], w = ind.parentElement.clientWidth - 8;
  ind.style.setProperty("--l", (t.offsetLeft - 4) + "px");
  ind.style.setProperty("--r", (w - (t.offsetLeft - 4) - t.offsetWidth) + "px");
  ind.style.background = PHASES[phase].tone;
}

let auto = !RM, timer = null, hallVisible = false;
const loop = () => { clearTimeout(timer); if (auto && hallVisible && !document.hidden) timer = setTimeout(() => { setPhase((phase + 1) % 3); loop(); }, 5200); };
const takeOver = () => { auto = false; clearTimeout(timer); };
tabs.forEach((t, i) => {
  t.addEventListener("click", () => { takeOver(); setPhase(i, { x: N - 1, y: 0 }); });
  t.addEventListener("keydown", e => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const n = (i + (e.key === "ArrowRight" ? 1 : 2)) % 3; takeOver(); setPhase(n); tabs[n].focus();
  });
});
segs.forEach((s, i) => s.addEventListener("click", () => { takeOver(); setPhase(i); }));
rows.forEach((r, i) => r.addEventListener("mouseenter", () => { if (FINE) { takeOver(); setPhase(i); } }));
addEventListener("resize", moveInd);
document.fonts?.ready.then(moveInd);

if (FINE && !RM) {
  let raf = 0, lastB = null;
  floor.addEventListener("pointermove", e => {
    const b = e.target.closest(".booth");
    if (!b || b === lastB) return;
    lastB = b; cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const cx = +b.dataset.x, cy = +b.dataset.y;
      booths.forEach(o => o.style.setProperty("--hov", Math.max(0, 32 - Math.hypot(+o.dataset.x - cx, +o.dataset.y - cy) * 12).toFixed(0) + "px"));
    });
  });
  floor.addEventListener("pointerleave", () => { lastB = null; booths.forEach(o => o.style.setProperty("--hov", "0px")); });
  floor.addEventListener("click", takeOver);
  const hall = document.getElementById("hall");
  hall.addEventListener("pointermove", e => {
    const r = hall.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5;
    floor.style.transform = `rotateX(${58 - py * 8}deg) rotateZ(${-40 + px * 10}deg)`;
  });
  hall.addEventListener("pointerleave", () => { floor.style.transform = ""; });
}
// The hall rises when it scrolls into view.
let raised = false;
new IntersectionObserver(([en]) => {
  hallVisible = en.isIntersecting;
  if (hallVisible && !raised) { raised = true; setTimeout(() => setPhase(0), RM ? 0 : 250); }
  loop();
}, { threshold: .35 }).observe(floor);
document.addEventListener("visibilitychange", loop);

// Timeline bars fill with how much of each phase has passed; "Today" marks the position.
const tlNow = document.getElementById("tlNow");
const swBtns = [...document.querySelectorAll(".tl-switch button")];
function showSession(i) {
  shownSession = i;
  const s = FAIR.sessions[i];
  document.getElementById("tlSession").textContent = `${s.name} · ${s.num} session${s.expected ? " (expected dates)" : ""}`;
  swBtns.forEach((b, j) => { b.classList.toggle("is-on", i === j); b.setAttribute("aria-pressed", String(i === j)); });
  let marker = null;
  segs.forEach((seg, p) => {
    const [a, b] = s.phases[p];
    const A = new Date(a + "T09:30:00+08:00"), B = new Date(b + "T18:00:00+08:00");
    const fill = now <= A ? 0 : now >= B ? 1 : (now - A) / (B - A);
    seg.querySelector("[data-dates]").textContent = rangeTxt([a, b]);
    seg.style.setProperty("--fill", fill.toFixed(3));
    seg.classList.toggle("is-now", fill > 0 && fill < 1);
    if (fill > 0 && fill < 1) marker = (p + fill) / 3;
  });
  tlNow.hidden = marker === null;
  if (marker !== null) tlNow.style.left = (marker * 100).toFixed(2) + "%";
  datesEl.textContent = rangeTxt(s.phases[phase]);
}
swBtns.forEach((b, i) => b.addEventListener("click", () => showSession(i)));
segs.forEach(s => s.style.setProperty("--fill", 0));
const tlIO = new IntersectionObserver(([en]) => { if (en.isIntersecting) { showSession(shownSession); tlIO.disconnect(); } }, { threshold: .3 });
tlIO.observe(document.getElementById("timeline"));
})();
