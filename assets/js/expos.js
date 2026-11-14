// Expo directory: sidebar filters (industry, region, country, month, keyword, confirmed dates),
// browse-by-industry list, live counts on every option and chart bar, removable filter chips,
// sort, 10-per-page pagination and shareable URLs. Cards are pre-rendered (work without JS).
(() => {
  const $ = id => document.getElementById(id), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const list = $("expo-list"), cards = $$(".xc", list), PER = 10;
  const F = { q: $("f-q"), ind: $("f-ind"), region: $("f-region"), country: $("f-country"), month: $("f-month"), ok: $("f-ok"), sort: $("f-sort") };
  const M = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const IND = Object.fromEntries([...F.ind.options].filter(o => o.value).map(o => [o.value, o.textContent]));
  const regions = [...new Set(cards.map(c => c.dataset.region))].sort();
  let page = 1;

  // region colour dots (index by sorted region name) on cards and region bars
  const rIdx = r => Math.max(0, regions.indexOf(r)) % 6;
  cards.forEach(c => c.style.setProperty("--rc", rIdx(c.dataset.region)));
  const rbars = $$("#rchart li"), mbars = $$("#mchart .ig-mbar");
  rbars.forEach(li => {
    const r = li.querySelector("span").textContent.trim(); li.dataset.r = r; li.style.setProperty("--rc", rIdx(r));
    li.setAttribute("role", "button"); li.tabIndex = 0;
  });

  /* ---------- state <-> URL ---------- */
  const P = new URLSearchParams(location.search);
  const setSel = (sel, v) => { if (v && [...sel.options].some(o => o.value === v)) sel.value = v; };
  F.q.value = P.get("q") || ""; setSel(F.ind, P.get("industry")); setSel(F.region, P.get("region")); setSel(F.country, P.get("country"));
  setSel(F.month, P.get("month")); setSel(F.sort, P.get("sort")); F.ok.checked = P.get("confirmed") === "1"; page = Math.max(1, +P.get("page") || 1);
  function writeURL() {
    const u = new URLSearchParams();
    if (F.q.value.trim()) u.set("q", F.q.value.trim()); if (F.ind.value) u.set("industry", F.ind.value);
    if (F.region.value) u.set("region", F.region.value); if (F.country.value) u.set("country", F.country.value);
    if (F.month.value) u.set("month", F.month.value); if (F.ok.checked) u.set("confirmed", "1");
    if (F.sort.value !== "date") u.set("sort", F.sort.value); if (page > 1) u.set("page", page);
    history.replaceState(null, "", location.pathname + (u.toString() ? "?" + u : "") + location.hash);
  }

  /* ---------- matching ---------- */
  const st = () => ({ q: F.q.value.trim().toLowerCase(), ind: F.ind.value, region: F.region.value, country: F.country.value, month: F.month.value, ok: F.ok.checked });
  const match = (c, s, skip) =>
    (skip === "q" || !s.q || s.q.split(/\s+/).every(w => c.dataset.q.includes(w))) &&
    (skip === "ind" || !s.ind || c.dataset.ind.split(" ").includes(s.ind)) &&
    (skip === "region" || !s.region || c.dataset.region === s.region) &&
    (skip === "country" || !s.country || c.dataset.country === s.country) &&
    (skip === "month" || !s.month || c.dataset.month === s.month) &&
    (!s.ok || c.dataset.ok === "1");

  const SORTS = {
    "date": (a, b) => a.dataset.i - b.dataset.i,
    "date-desc": (a, b) => b.dataset.i - a.dataset.i,
    "name": (a, b) => a.dataset.name.localeCompare(b.dataset.name),
    "ok": (a, b) => (b.dataset.ok - a.dataset.ok) || (a.dataset.i - b.dataset.i),
  };
  let order = cards.slice(), lastSort = "date";

  function run(opts = {}) {
    const s = st();
    // country list follows the region
    [...F.country.options].forEach(o => { if (!o.value) return; const hide = s.region && o.dataset.region !== s.region; o.hidden = hide; o.disabled = hide; });
    if (s.region && F.country.value && F.country.selectedOptions[0].disabled) { F.country.value = ""; s.country = ""; }

    const hits = cards.filter(c => match(c, s));
    if (F.sort.value !== lastSort) { lastSort = F.sort.value; order = cards.slice().sort(SORTS[lastSort]); order.forEach(c => list.appendChild(c)); }
    const shown = order.filter(c => hits.includes(c));
    const pages = Math.max(1, Math.ceil(shown.length / PER));
    if (opts.resetPage) page = 1;
    page = Math.min(page, pages);
    const from = (page - 1) * PER, to = Math.min(shown.length, from + PER);
    const visible = new Set(shown.slice(from, to));
    let k = 0;
    order.forEach(c => {
      const on = visible.has(c), was = !c.hidden;
      c.hidden = !on;
      if (on && opts.animate && !reduce && (!was || opts.animate === "all")) { c.classList.remove("pop"); void c.offsetWidth; c.style.setProperty("--d", k++); c.classList.add("pop"); }
    });

    // live counts: each control shows what you'd get if you picked it
    const cnt = (skip, test) => cards.filter(c => match(c, s, skip) && test(c)).length;
    mbars.forEach((b, i) => { const n = cnt("month", c => c.dataset.month === String(i + 1)); b.querySelector("b").textContent = n; b.classList.toggle("dim", n === 0 && s.month !== String(i + 1)); b.classList.toggle("on", s.month === String(i + 1)); b.setAttribute("aria-pressed", String(s.month === String(i + 1))); });
    rbars.forEach(li => { const n = cnt("region", c => c.dataset.region === li.dataset.r); li.querySelector("b").textContent = n; li.classList.toggle("dim", n === 0 && s.region !== li.dataset.r); li.classList.toggle("on", s.region === li.dataset.r); li.setAttribute("aria-pressed", String(s.region === li.dataset.r)); });
    $$("#f-inds button").forEach(b => { const n = cnt("ind", c => c.dataset.ind.split(" ").includes(b.dataset.ind)); b.querySelector("b").textContent = n; b.classList.toggle("dim", n === 0); b.setAttribute("aria-pressed", String(s.ind === b.dataset.ind)); });
    [...F.ind.options].forEach(o => { if (o.value) o.textContent = `${IND[o.value]} (${cnt("ind", c => c.dataset.ind.split(" ").includes(o.value))})`; });

    // header, chips, pagination
    const what = [s.ind && IND[s.ind], s.country || s.region, s.month && M[s.month - 1]].filter(Boolean).join(" · ");
    $("f-count").innerHTML = shown.length ? `Showing <b>${from + 1}–${to}</b> of <b>${shown.length}</b> expo${shown.length > 1 ? "s" : ""}${what ? ` <span>· ${what}</span>` : ""}` : "No expos match";
    $("xd-go-n").textContent = shown.length;
    $("f-empty").hidden = shown.length > 0;
    chips(s);
    pager(pages);
    const nf = ["ind", "region", "country", "month", "q"].filter(k => s[k]).length + (s.ok ? 1 : 0);
    $("xd-nf").hidden = !nf; $("xd-nf").textContent = nf;
    writeURL();
  }

  function chips(s) {
    const box = $("f-chips"); box.innerHTML = "";
    const add = (label, clear) => { const b = document.createElement("button"); b.type = "button"; b.className = "xd-chip"; b.innerHTML = `${label}<i aria-hidden="true">×</i>`; b.setAttribute("aria-label", "Remove filter: " + label); b.onclick = () => { clear(); run({ resetPage: true, animate: "all" }); }; box.appendChild(b); };
    if (s.ind) add(IND[s.ind], () => { F.ind.value = ""; });
    if (s.region) add(s.region, () => { F.region.value = ""; });
    if (s.country) add(s.country, () => { F.country.value = ""; });
    if (s.month) add(M[s.month - 1], () => { F.month.value = ""; });
    if (s.q) add(`“${s.q}”`, () => { F.q.value = ""; });
    if (s.ok) add("Confirmed dates", () => { F.ok.checked = false; });
    if (box.children.length > 1) { const r = document.createElement("button"); r.type = "button"; r.className = "xd-chip-clear"; r.textContent = "Clear all"; r.onclick = reset; box.appendChild(r); }
  }

  function pager(pages) {
    const nav = $("f-pages"); nav.innerHTML = ""; nav.hidden = pages < 2; if (pages < 2) return;
    const btn = (label, p, cls, aria) => { const b = document.createElement("button"); b.type = "button"; b.innerHTML = label; b.className = cls || ""; if (aria) b.setAttribute("aria-label", aria);
      if (p === page && !cls) b.setAttribute("aria-current", "page"); if (p < 1 || p > pages) b.disabled = true; else b.onclick = () => go(p); nav.appendChild(b); };
    btn("‹ Prev", page - 1, "pg-step", "Previous page");
    for (let p = 1; p <= pages; p++) {
      if (pages > 7 && p > 1 && p < pages && Math.abs(p - page) > 1) { if (nav.lastChild.className !== "pg-gap") { const g = document.createElement("span"); g.className = "pg-gap"; g.textContent = "…"; nav.appendChild(g); } continue; }
      btn(String(p), p, "", "Page " + p);
    }
    btn("Next ›", page + 1, "pg-step", "Next page");
  }
  function go(p) { page = p; run({ animate: "all" }); toResults(); }
  function toResults() { const top = $("results").getBoundingClientRect().top + scrollY - 96; if (scrollY > top + 40 || scrollY < top - innerHeight * .5) scrollTo({ top, behavior: reduce ? "auto" : "smooth" }); }
  function reset() { F.q.value = ""; F.ind.value = ""; F.region.value = ""; F.country.value = ""; F.month.value = ""; F.ok.checked = false; run({ resetPage: true, animate: "all" }); }

  /* ---------- wiring ---------- */
  let qt = 0;
  F.q.addEventListener("input", () => { clearTimeout(qt); qt = setTimeout(() => run({ resetPage: true, animate: true }), 160); });
  [F.ind, F.region, F.country, F.month, F.ok].forEach(el => el.addEventListener("change", () => run({ resetPage: true, animate: true })));
  F.sort.addEventListener("change", () => run({ resetPage: true, animate: "all" }));
  $("f-reset").addEventListener("click", reset);
  $$("[data-reset]").forEach(b => b.addEventListener("click", reset));
  $("xd-filters").addEventListener("submit", e => { e.preventDefault(); run({ animate: true }); closePanel(); toResults(); });
  const pickInd = k => { F.ind.value = F.ind.value === k ? "" : k; run({ resetPage: true, animate: "all" }); toResults(); };
  $$("#f-inds button").forEach(b => b.addEventListener("click", () => pickInd(b.dataset.ind)));
  list.addEventListener("click", e => { const b = e.target.closest(".xc-tags button"); if (b) pickInd(b.dataset.ind); });
  mbars.forEach((b, i) => b.addEventListener("click", e => { e.preventDefault(); const v = String(i + 1); F.month.value = F.month.value === v ? "" : v; run({ resetPage: true, animate: "all" }); }));
  mbars.forEach(b => { b.setAttribute("role", "button"); b.addEventListener("keydown", e => { if (e.key === " ") { e.preventDefault(); b.click(); } }); });
  const pickR = li => { F.region.value = F.region.value === li.dataset.r ? "" : li.dataset.r; run({ resetPage: true, animate: "all" }); };
  rbars.forEach(li => { li.addEventListener("click", () => pickR(li)); li.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pickR(li); } }); });

  // phone: filters fold into a toggle
  const tog = document.querySelector(".xd-toggle"), panel = $("xd-filters");
  function closePanel() { if (tog.offsetParent === null) return; panel.classList.remove("open"); tog.setAttribute("aria-expanded", "false"); }
  tog.addEventListener("click", () => { const o = panel.classList.toggle("open"); tog.setAttribute("aria-expanded", String(o)); if (o) F.ind.focus(); });

  run({});
})();
