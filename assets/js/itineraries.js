// Itinerary catalogue: faceted filtering with live counts, URL state, sorting, expandable rows, departure board.
(() => {
  const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const NOW = new Date();
  const T = window.ITINERARIES, F = window.FAIR;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const ymFmt = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Manila", year: "numeric", month: "2-digit" });
  const ym = d => ymFmt.format(d).slice(0, 7);
  const monthLabel = k => { const [y, m] = k.split("-"); return `${["January","February","March","April","May","June","July","August","September","October","November","December"][+m - 1]} ${y}`; };
  const dateTxt = d => d.tbc ? `${MON[d.date.getUTCMonth()]} ${d.date.getUTCFullYear()}` : d.date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "Asia/Manila" });
  const ICON = { airfare: "plane", hotel: "hotel", badge: "badge", visa: "passport", transfers: "truck", interpreter: "translate", coordinator: "headset" };
  const svg = id => `<svg class="icon" aria-hidden="true"><use href="#i-${id}"/></svg>`;

  // Upcoming departures only.
  T.forEach(t => { t.upcoming = t.departures.filter(d => d.date > NOW); t.next = t.upcoming[0]; });
  const searchText = t => [t.title, t.sum, t.expo, t.city, t.depart.join(" "), t.industries.map(i => F.industries[i]).join(" "),
    t.plan.map(p => p.join(" ")).join(" "), t.event === "canton" ? "canton fair guangzhou pazhou" : "expo 2027 " + t.city].join(" ").toLowerCase();
  T.forEach(t => (t.text = searchText(t)));

  /* ---------- facets ---------- */
  const LENGTHS = { "4-5": ["4–5 days", t => t.days >= 4 && t.days <= 5], "6-7": ["6–7 days", t => t.days >= 6 && t.days <= 7], "8+": ["8 days or more", t => t.days >= 8], custom: ["Custom length", t => !t.days] };
  const FACETS = {
    event: { single: true, test: (t, v) => v === "all" || t.event === v },
    phase: { opts: [1, 2, 3].map(p => [String(p), `Phase ${p}`]), test: (t, vs) => vs.some(v => t.phases.includes(+v)) },
    industry: { opts: Object.entries(F.industries), test: (t, vs) => vs.some(v => t.industries.includes(v)) },
    length: { single: true, opts: Object.entries(LENGTHS).map(([k, [l]]) => [k, l]), test: (t, v) => LENGTHS[v][1](t) },
    city: { opts: F.cities.map(c => [c, c]), test: (t, vs) => vs.includes(t.city) },
    month: { single: true, test: (t, v) => t.upcoming.some(d => ym(d.date) === v) },
    depart: { single: true, test: (t, v) => t.depart.includes(v) },
    q: { single: true, test: (t, v) => v.toLowerCase().split(/\s+/).filter(Boolean).every(w => t.text.includes(w) || t.text.includes(w.replace(/s$/, ""))) },
  };

  /* ---------- state <-> URL ---------- */
  const P = new URLSearchParams(location.search);
  const listParam = k => (P.get(k) ? P.get(k).split(",").filter(Boolean) : []);
  const S = {
    event: P.get("event") || "all", q: P.get("q") || "", phase: listParam("phase"), industry: listParam("industry"),
    length: P.get("length") || "", city: listParam("city"), month: P.get("month") || "",
    depart: P.get("depart") || "", sort: P.get("sort") || "rec", open: P.get("open") || location.hash.slice(1) || "",
  };
  const isOn = (k, s = S) => Array.isArray(s[k]) ? s[k].length > 0 : !!s[k] && !(k === "event" && s[k] === "all") && k !== "sort" && k !== "open";
  function writeURL() {
    const u = new URLSearchParams();
    Object.entries(S).forEach(([k, v]) => {
      if (k === "open") return;
      if (Array.isArray(v) ? v.length : v && !(k === "event" && v === "all") && !(k === "sort" && v === "rec")) u.set(k, Array.isArray(v) ? v.join(",") : v);
    });
    history.replaceState(null, "", (u.toString() ? "?" + u : location.pathname) + (S.open ? "#" + S.open : ""));
  }
  const matches = (t, except) => Object.keys(FACETS).every(k => k === except || !isOn(k) || FACETS[k].test(t, S[k]));
  const countWith = (k, v) => T.filter(t => matches(t, k) && FACETS[k].test(t, FACETS[k].single ? v : [v])).length;

  /* ---------- filter controls ---------- */
  function buildGroup(k) {
    const box = $(`[data-facet="${k}"] .opts`);
    const f = FACETS[k];
    const name = "f-" + k;
    box.innerHTML = (f.single ? `<label class="opt"><input type="radio" name="${name}" value=""><span class="box"></span><span class="t">Any length</span><span class="c"></span></label>` : "") +
      f.opts.map(([v, l]) => k === "inc"
        ? `<label class="chip"><input type="checkbox" name="${name}" value="${v}">${svg(ICON[v])}<span class="t">${l}</span><span class="c"></span></label>`
        : `<label class="opt"><input type="${f.single ? "radio" : "checkbox"}" name="${name}" value="${v}"><span class="box">${f.single ? "" : svg("check")}</span><span class="t">${l}</span><span class="c"></span></label>`).join("");
    box.addEventListener("change", e => {
      const inp = e.target;
      if (f.single) S[k] = inp.value;
      else S[k] = $$(`input[name="${name}"]:checked`, box).map(i => i.value);
      update(true);
    });
  }
  ["phase", "industry", "length", "city"].forEach(buildGroup);

  const monthSel = $("#month"), departSel = $("#depart"), qInp = $("#heroQ"), sortSel = $("#sort");
  const months = [...new Set(T.flatMap(t => t.upcoming.map(d => ym(d.date))))].sort();
  const departs = ["Manila", "Cebu", "Clark", "Davao"];
  monthSel.addEventListener("change", () => { S.month = monthSel.value; update(true); });
  departSel.addEventListener("change", () => { S.depart = departSel.value; update(true); });
  sortSel.addEventListener("change", () => { S.sort = sortSel.value; update(true); });
  let qTimer;
  qInp.addEventListener("input", () => { clearTimeout(qTimer); qTimer = setTimeout(() => { S.q = qInp.value.trim(); update(true); }, 220); });
  $("#heroSearch").addEventListener("submit", e => {
    e.preventDefault(); S.q = qInp.value.trim(); update(true);
    $("#catalogue").scrollIntoView({ behavior: RM ? "auto" : "smooth" });
  });
  $$("#heroQuick a").forEach(a => a.addEventListener("click", e => {
    e.preventDefault(); clearAll(false);
    const [k, v] = a.dataset.q.split("=");
    S[k] = Array.isArray(S[k]) ? [v] : v; update(true);
    $("#catalogue").scrollIntoView({ behavior: RM ? "auto" : "smooth" });
  }));

  // Event tabs with a sliding indicator.
  const tabs = $$("#eventTabs [role=tab]"), tabInd = $(".cat-tab-ind");
  const moveTab = () => { const t = tabs.find(x => x.dataset.event === S.event) || tabs[0]; tabInd.style.transform = `translateX(${t.offsetLeft}px) scaleX(${(t.offsetWidth / 100).toFixed(3)})`; };
  tabs.forEach((t, i) => {
    t.addEventListener("click", () => { S.event = t.dataset.event; update(true); });
    t.addEventListener("keydown", e => {
      if (!["ArrowRight", "ArrowLeft"].includes(e.key)) return;
      const n = tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length]; n.click(); n.focus();
    });
  });
  addEventListener("resize", moveTab);
  document.fonts?.ready.then(moveTab);

  function clearAll(render = true) {
    Object.assign(S, { event: "all", q: "", phase: [], industry: [], length: "", city: [], month: "", depart: "" });
    if (render) update(true);
  }
  $("#clearAll").addEventListener("click", () => clearAll());
  $("#emptyClear").addEventListener("click", () => clearAll());

  /* ---------- sync controls + counts ---------- */
  function syncControls() {
    tabs.forEach(t => {
      const on = t.dataset.event === S.event;
      t.setAttribute("aria-selected", String(on)); t.tabIndex = on ? 0 : -1;
      $(".n", t).textContent = countWith("event", t.dataset.event);
    });
    moveTab();
    ["phase", "industry", "length", "city"].forEach(k => {
      $$(`[data-facet="${k}"] input`).forEach(inp => {
        const v = inp.value;
        inp.checked = FACETS[k].single ? (S[k] || "") === v : S[k].includes(v);
        const n = v ? countWith(k, v) : T.filter(t => matches(t, k)).length;
        const lab = inp.closest("label");
        $(".c", lab).textContent = n;
        lab.classList.toggle("is-zero", n === 0 && !inp.checked);
      });
    });
    // Phase only applies to Canton Fair trips.
    $('[data-facet="phase"]').classList.toggle("is-muted", S.event === "expo");
    monthSel.innerHTML = `<option value="">Any month (${T.filter(t => matches(t, "month")).length})</option>` + months.map(m => `<option value="${m}">${monthLabel(m)} (${countWith("month", m)})</option>`).join("");
    monthSel.value = S.month;
    departSel.innerHTML = `<option value="">Any city (${T.filter(t => matches(t, "depart")).length})</option>` + departs.map(d => `<option value="${d}">${d} (${countWith("depart", d)})</option>`).join("");
    departSel.value = S.depart;
    sortSel.value = S.sort;
    if (document.activeElement !== qInp) qInp.value = S.q;

    // Active filter chips.
    const chips = [];
    if (S.event !== "all") chips.push(["event", null, S.event === "canton" ? "Canton Fair" : "China expos"]);
    if (S.q) chips.push(["q", null, `"${S.q}"`]);
    S.phase.forEach(v => chips.push(["phase", v, `Phase ${v}`]));
    S.industry.forEach(v => chips.push(["industry", v, F.industries[v]]));
    if (S.month) chips.push(["month", null, monthLabel(S.month)]);
    if (S.length) chips.push(["length", null, LENGTHS[S.length][0]]);
    if (S.depart) chips.push(["depart", null, `From ${S.depart}`]);
    S.city.forEach(v => chips.push(["city", v, v]));
    $("#activeChips").innerHTML = chips.map(([k, v, l]) => `<button type="button" class="achip" data-k="${k}" data-v="${v ?? ""}">${esc(l)}${svg("close")}</button>`).join("") + (chips.length > 1 ? `<button type="button" class="link-btn" data-clear>Clear all</button>` : "");
    const n = chips.length;
    $("#filterBadge").hidden = !n; $("#filterBadge").textContent = n;
  }
  $("#activeChips").addEventListener("click", e => {
    if (e.target.closest("[data-clear]")) return clearAll();
    const c = e.target.closest(".achip"); if (!c) return;
    const k = c.dataset.k, v = c.dataset.v;
    if (Array.isArray(S[k])) S[k] = S[k].filter(x => x !== v); else S[k] = k === "event" ? "all" : "";
    update(true);
  });

  /* ---------- rows ---------- */
  const len = t => t.days ? `${t.days} days ${t.nights} nights` : "Custom length";
  function rowHTML(t) {
    const nx = t.next;
    const eventLine = t.event === "canton"
      ? `<span class="ev ev-canton">Canton Fair</span>${t.phases.map(p => `<span class="tag-phase p${p}">Phase ${p}</span>`).join("")}`
      : `<span class="ev ev-expo">China expo</span><span class="tag-phase">${esc(t.city)}</span>`;
    const nextTxt = nx ? dateTxt(nx) : "On request";
    const nextSub = !nx ? "" : nx.tbc ? "Dates to be confirmed" : `Phase ${nx.phase} · ${nx.session}${nx.expected ? " (expected)" : ""}`;
    return `
    <article class="row${S.open === t.id ? " open" : ""}" id="${t.id}" style="view-transition-name: r-${t.id}">
      <figure class="row-media"><img src="${t.img}" alt="" loading="lazy" width="900" height="600"><span class="row-len">${t.days ? `${t.days}D${t.nights}N` : "Custom"}</span></figure>
      <div class="row-main">
        <div class="row-ev">${eventLine}</div>
        <h3>${esc(t.title)}</h3>
        <ul class="row-meta">
          <li>${svg("clock")}${len(t)}</li>
          <li>${svg("plane")}From ${t.depart.join(", ")}</li>
          <li>${svg("calendar")}${t.upcoming.length} upcoming departure${t.upcoming.length === 1 ? "" : "s"}</li>
        </ul>
        <p class="row-sum">${esc(t.sum)}</p>
        <ol class="row-days">${t.plan.slice(0, 5).map((d, i) => `<li><b>${t.days ? "Day " + (i + 1) : "Step " + (i + 1)}</b>${esc(d[0])}</li>`).join("")}${t.plan.length > 5 ? `<li class="more">+${t.plan.length - 5} more</li>` : ""}</ol>
      </div>
      <div class="row-side">
        <div><span class="label">Next departure</span><b class="tnum">${nextTxt}</b><small>${nextSub}</small></div>
        <div><span class="label">Price</span><b>Quotation per group</b><small>Itemised, no web payment</small></div>
        <div class="row-btns">
          <button type="button" class="btn btn-ghost btn-sm" data-toggle aria-expanded="${S.open === t.id}" aria-controls="d-${t.id}">${S.open === t.id ? "Hide details" : "Details"}</button>
          <a class="btn btn-sm" href="inquiry.html?trip=${t.id}">Get a quote</a>
        </div>
      </div>
      <div class="row-details" id="d-${t.id}"><div><div class="rd-inner">
        <div class="rd-plan"><h4>${t.days ? "Day by day" : "How it runs"}</h4><ol>${t.plan.map((d, i) => `<li><b>${t.days ? "Day " + (i + 1) : "Step " + (i + 1)}</b><div><strong>${esc(d[0])}</strong><p>${esc(d[1])}</p></div></li>`).join("")}</ol></div>
        <div class="rd-side">
          <h4>Included</h4><ul class="rd-inc">${t.inc.map(i => `<li>${svg(ICON[i])}${F.inclusions[i]}</li>`).join("")}</ul>
          <h4>Upcoming departures</h4><div class="rd-deps">${t.upcoming.length ? t.upcoming.map(d => `<span>${dateTxt(d)}${d.tbc ? " · TBC" : ` · P${d.phase}`}${d.expected && !d.tbc ? "*" : ""}</span>`).join("") : "<span>On request</span>"}</div>
          ${t.upcoming.some(d => d.expected) ? `<p class="rd-note">${t.event === "expo" ? "Usual month for this show. Exact dates are confirmed when the organiser publishes them." : "* Spring 2027 dates are expected until the organiser confirms them."}</p>` : ""}
          <h4>Best for</h4><div class="rd-ind">${t.industries.length === 8 ? "<span>All industries</span>" : t.industries.map(i => `<a href="industry-${i}.html">${F.industries[i]}</a>`).join("")}</div>
        </div>
      </div></div></div>
    </article>`;
  }

  const rowsEl = $("#rows");
  function sortList(list) {
    const by = {
      rec: (a, b) => (a.event === b.event ? (a.next?.date ?? Infinity) - (b.next?.date ?? Infinity) : a.event === "canton" ? -1 : 1),
      next: (a, b) => (a.next?.date ?? Infinity) - (b.next?.date ?? Infinity),
      short: (a, b) => (a.days || 99) - (b.days || 99) || a.rank - b.rank,
      long: (a, b) => (b.days || 0) - (a.days || 0) || a.rank - b.rank,
      az: (a, b) => a.title.localeCompare(b.title),
    }[S.sort];
    return [...list].sort(by);
  }
  function render() {
    const list = sortList(T.filter(t => matches(t)));
    rowsEl.innerHTML = list.map(rowHTML).join("");
    $("#empty").hidden = list.length > 0;
    animateCount(list.length);
    $("#resLabel").textContent = list.length === 1 ? "itinerary" : "itineraries";
  }
  let shown = 0;
  function animateCount(n) {
    const el = $("#resN"), from = shown; shown = n;
    if (RM || from === n) { el.textContent = n; return; }
    const t0 = performance.now();
    const step = t => { const k = Math.min(1, (t - t0) / 400); el.textContent = Math.round(from + (n - from) * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
    setTimeout(() => (el.textContent = n), 500);
  }

  rowsEl.addEventListener("click", e => {
    const b = e.target.closest("[data-toggle]"); if (!b) return;
    const row = b.closest(".row");
    const open = !row.classList.contains("open");
    row.classList.toggle("open", open);
    b.setAttribute("aria-expanded", String(open));
    b.textContent = open ? "Hide details" : "Details";
    S.open = open ? row.id : ""; writeURL();
  });

  function update(user) {
    writeURL();
    syncControls();
    if (user && document.startViewTransition && !RM) document.startViewTransition(render);
    else render();
  }

  /* ---------- mobile filter drawer ---------- */
  const filtersEl = $("#filters"), scrim = $("#scrim");
  const openF = () => { filtersEl.classList.add("open"); scrim.hidden = false; requestAnimationFrame(() => scrim.classList.add("on")); document.body.style.overflow = "hidden"; $("#closeFilters").focus(); };
  const closeF = () => { filtersEl.classList.remove("open"); scrim.classList.remove("on"); setTimeout(() => (scrim.hidden = true), 300); document.body.style.overflow = ""; $("#openFilters").focus(); };
  $("#openFilters").addEventListener("click", openF);
  $("#closeFilters").addEventListener("click", closeF);
  $("#applyFilters").addEventListener("click", closeF);
  scrim.addEventListener("click", closeF);
  addEventListener("keydown", e => { if (e.key === "Escape" && filtersEl.classList.contains("open")) closeF(); });

  /* ---------- departure board ---------- */
  const deps = T.flatMap(t => t.upcoming.map(d => ({ t, d }))).sort((a, b) => a.d.date - b.d.date);
  const seen = new Set();
  const top = deps.filter(x => (seen.has(x.d.date.getTime() + x.t.event) ? false : seen.add(x.d.date.getTime() + x.t.event))).slice(0, 6);
  $("#boardRows").innerHTML = top.map(({ t, d }, i) => {
    const yy = "\u2019" + String(d.date.getUTCFullYear()).slice(2);
    const day = d.tbc ? MON[d.date.getUTCMonth()] : d.date.toLocaleDateString("en-US", { day: "2-digit", timeZone: "Asia/Manila" });
    const mon = d.tbc ? `${yy} TBC` : `${d.date.toLocaleDateString("en-US", { month: "short", timeZone: "Asia/Manila" })} ${yy}`;
    const ev = t.event === "canton" ? `Phase ${d.phase}` : t.city;
    const st = d.tbc ? ["TBC", "tbc"] : d.expected ? ["Expected", "exp"] : ["Open", "open"];
    return `<li style="--i:${i}"><a href="?open=${t.id}#${t.id}" data-open="${t.id}"><span class="bd-date"><b>${day}</b><small>${mon}</small></span><span class="bd-trip">${esc(t.event === "canton" ? t.title : t.expo)}</span><span class="bd-ev">${esc(ev)}</span><span class="bd-st ${st[1]}">${st[0]}</span></a></li>`;
  }).join("");
  $("#boardRows").addEventListener("click", e => {
    const a = e.target.closest("[data-open]"); if (!a) return;
    e.preventDefault(); clearAll(false); S.open = a.dataset.open; update(false);
    setTimeout(() => document.getElementById(S.open)?.scrollIntoView({ behavior: RM ? "auto" : "smooth", block: "start" }), 50);
  });
  const clock = () => { $("#boardClock").textContent = "Manila " + new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Manila" }) + " · GMT+8"; };
  clock(); setInterval(clock, 15000);

  /* ---------- go ---------- */
  update(false);
  if (S.open && document.getElementById(S.open)) setTimeout(() => document.getElementById(S.open).scrollIntoView({ behavior: RM ? "auto" : "smooth", block: "start" }), 300);
})();
