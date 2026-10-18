// Expo planner: schematic city network + 12-month strip + live list.
// <div data-planner="china" data-limit="6"></div>  reads window.EXPO_CN
// <div data-planner="world"></div>                 reads window.EXPO_WORLD
(() => {
  const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const svg = id => `<svg class="icon" aria-hidden="true"><use href="#i-${id}"/></svg>`;

  // Schematic positions (not to scale). Manila sits off the south-east coast.
  const CN = {
    Beijing: [262, 70], Tianjin: [290, 92], Qingdao: [338, 146], Shanghai: [392, 214], Ningbo: [398, 240], Hangzhou: [372, 228], Yiwu: [356, 252],
    Xiamen: [348, 318], Guangzhou: [282, 350], Foshan: [266, 356], Dongguan: [302, 356], Shenzhen: [312, 372], "Hong Kong": [324, 390],
    Nanning: [206, 352], Haikou: [246, 412], Chengdu: [150, 232], Chongqing: [182, 252], Wuhan: [288, 236], Kunming: [126, 330],
  };
  const MANILA = [470, 420];
  const REGION_ORDER = ["East Asia", "Southeast Asia", "South Asia", "Middle East", "Europe", "North America"];

  // Same slug rule as expos.js, so planner rows link to their article (event.html?e=slug).
  const slugify = s => String(s).toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const findTrip = e => (window.ITINERARIES || []).find(t => t.event === "expo" && (t.short === e.short || e.name.toLowerCase().includes((t.short || "~").toLowerCase()) || (t.title && t.title.toLowerCase().startsWith((e.short || "~").toLowerCase()))));

  function mount(el) {
    const scope = el.dataset.planner;
    const data = (scope === "world" ? window.EXPO_WORLD : window.EXPO_CN) || [];
    if (!data.length) { el.innerHTML = ""; return; }
    const limit = +el.dataset.limit || 0;
    const S = { month: "", place: "", more: 0 };
    const PAGE = 8;
    const placeOf = e => scope === "world" ? (e.region || "Other") : e.city;
    const places = scope === "world" ? REGION_ORDER.filter(r => data.some(e => placeOf(e) === r)) : [...new Set(data.map(placeOf))].filter(c => CN[c]);

    el.classList.add("planner", "pl-" + scope);
    el.innerHTML = `
      <div class="pl-map">${scope === "world" ? worldChips() : cnMap() + cityChips()}</div>
      <div class="pl-side">
        <div class="pl-months" role="group" aria-label="Filter by month">${MON.map((m, i) => `<button type="button" data-m="${String(i + 1).padStart(2, "0")}"><b>${m}</b><i></i><small></small></button>`).join("")}</div>
        <div class="pl-head"><p class="pl-title" aria-live="polite"></p><button type="button" class="pl-reset link-btn">Show all</button></div>
        <ul class="pl-list"></ul>
        ${limit ? `<a class="link-arrow pl-more" href="${scope === "world" ? "world-expos.html" : "china-expos.html"}">See all ${data.length} expos ${svg("arrow")}</a>` : ""}
      </div>`;

    function cnMap() {
      const arcs = places.map((c, i) => { const [x, y] = CN[c]; const mx = (x + MANILA[0]) / 2 + 30, my = (y + MANILA[1]) / 2 + 40; return `<path class="pl-arc" data-p="${esc(c)}" d="M${MANILA[0]} ${MANILA[1]} Q ${mx} ${my} ${x} ${y}" style="--i:${i}"/>`; }).join("");
      const pins = places.map(c => {
        const [x, y] = CN[c]; const n = data.filter(e => e.city === c).length; const r = 5 + Math.min(9, n * 1.1);
        const left = ["Nanning", "Chengdu", "Kunming", "Foshan", "Chongqing", "Haikou"].includes(c);
        return `<g class="pl-pin" data-p="${esc(c)}" transform="translate(${x} ${y})" tabindex="0" role="button" aria-label="${esc(c)}, ${n} expos"><circle class="halo" r="${r + 8}"/><circle r="${r}"/><text x="${left ? -(r + 6) : r + 6}" y="4" text-anchor="${left ? "end" : "start"}">${esc(c)} <tspan>${n}</tspan></text></g>`;
      }).join("");
      return `<svg viewBox="0 0 520 450" class="pl-svg" role="group" aria-label="Expo cities, schematic map">
        <path class="pl-coast" d="M250 40 C 300 60, 330 110, 360 150 C 385 185, 410 205, 415 235 C 405 270, 380 300, 352 330 C 330 360, 320 385, 300 395 C 270 405, 240 400, 210 380 C 170 370, 120 350, 100 300 C 80 240, 110 160, 160 110 C 190 80, 220 50, 250 40 Z"/>
        <g class="pl-manila" transform="translate(${MANILA[0]} ${MANILA[1]})"><circle r="6"/><text x="-10" y="-12" text-anchor="end">Manila</text></g>
        ${arcs}${pins}
        <text class="pl-note" x="10" y="440">Schematic, not to scale</text>
      </svg>`;
    }
    // On phones the schematic map gets too dense around the Pearl River Delta, so cities also come as chips.
    function cityChips() {
      const byCount = [...places].sort((a, b) => data.filter(e => e.city === b).length - data.filter(e => e.city === a).length);
      return `<div class="pl-cities" role="group" aria-label="Filter by city">${byCount.map(c => `<button type="button" class="pl-city" data-p="${esc(c)}">${esc(c)} <small>${data.filter(e => e.city === c).length}</small></button>`).join("")}</div>`;
    }
    function worldChips() {
      return `<div class="pl-regions" role="group" aria-label="Filter by region">${places.map(r => { const n = data.filter(e => placeOf(e) === r).length; return `<button type="button" class="pl-region" data-p="${esc(r)}"><b>${esc(r)}</b><small>${n} expo${n === 1 ? "" : "s"}</small></button>`; }).join("")}</div>`;
    }

    const list = el.querySelector(".pl-list"), title = el.querySelector(".pl-title"), months = [...el.querySelectorAll(".pl-months button")];
    function render() {
      const items = data.filter(e => (!S.month || e.month.slice(5) === S.month) && (!S.place || placeOf(e) === S.place));
      months.forEach(b => {
        const n = data.filter(e => e.month.slice(5) === b.dataset.m && (!S.place || placeOf(e) === S.place)).length;
        b.querySelector("small").textContent = n || "";
        b.querySelector("i").style.setProperty("--h", Math.min(1, n / 5).toFixed(2));
        b.classList.toggle("is-on", b.dataset.m === S.month); b.disabled = !n && b.dataset.m !== S.month;
        b.setAttribute("aria-pressed", String(b.dataset.m === S.month));
      });
      el.querySelectorAll("[data-p]").forEach(p => { p.classList.toggle("is-on", p.dataset.p === S.place); p.classList.toggle("is-dim", !!S.place && p.dataset.p !== S.place); });
      const what = [S.month && MONTHS[+S.month - 1] + " 2027", S.place].filter(Boolean).join(" · ") || "All of 2027";
      title.innerHTML = `<b>${items.length}</b> expo${items.length === 1 ? "" : "s"} · ${esc(what)}`;
      el.querySelector(".pl-reset").hidden = !S.month && !S.place;
      const cap = limit && !S.month && !S.place ? limit : limit ? items.length : PAGE + S.more;
      const shown = items.slice(0, cap);
      list.innerHTML = shown.map((e, i) => {
        const trip = findTrip(e);
        const pal = (window.FAIR && FAIR.palette[e.city]) || ["#1f1f3d", "#c9460b"];
        const date = e.dates_2027 || `${MONTHS[+e.month.slice(5) - 1]} 2027`;
        return `<li class="pl-item" style="--i:${i};--c1:${pal[0]};--c2:${pal[1]}">
          <span class="pl-date"><b>${MON[+e.month.slice(5) - 1]}</b><small>${e.dates_status === "confirmed" ? "2027" : "TBC"}</small></span>
          <div class="pl-body"><h3>${esc(e.name)}</h3><p class="pl-meta">${svg("pin")}${esc(scope === "world" ? `${e.city}, ${e.country}` : e.city)}${e.venue ? " · " + esc(e.venue) : ""}</p>
            <p class="pl-sect">${esc(e.sectors || "")}</p>
            <p class="pl-why">${esc(e.why || "")}</p>
            <div class="pl-tags"><span>${esc(date)}${e.dates_status === "confirmed" ? "" : " · expected"}</span>${e.frequency && e.frequency !== "annual" ? `<span>${esc(e.frequency)}</span>` : ""}</div></div>
          <div class="pl-act">${trip ? `<a class="btn btn-sm" href="itineraries.html?open=${trip.id}#${trip.id}">View trip</a>` : `<a class="btn btn-sm btn-ghost" href="inquiry.html?expo=${encodeURIComponent(e.short || e.name)}">Plan a trip</a>`}<a class="pl-site" href="event.html?e=${slugify(e.short || e.name)}">Read the guide ${svg("arrow")}</a></div>
        </li>`;
      }).join("") || `<li class="pl-empty">No expos for that combination. Try another month.</li>`;
      if (!limit && items.length > shown.length) list.insertAdjacentHTML("beforeend", `<li class="pl-showmore"><button type="button" class="btn btn-ghost on-dark">Show ${Math.min(PAGE * 2, items.length - shown.length)} more of ${items.length - shown.length}</button></li>`);
    }
    months.forEach(b => b.addEventListener("click", () => { S.month = S.month === b.dataset.m ? "" : b.dataset.m; S.more = 0; render(); }));
    list.addEventListener("click", e => { if (e.target.closest(".pl-showmore button")) { S.more += PAGE * 2; render(); } });
    el.querySelectorAll(".pl-pin, .pl-region, .pl-city").forEach(p => {
      const go = () => { S.place = S.place === p.dataset.p ? "" : p.dataset.p; S.more = 0; render(); };
      p.addEventListener("click", go);
      p.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } });
    });
    el.querySelector(".pl-reset").addEventListener("click", () => { S.month = ""; S.place = ""; S.more = 0; render(); });
    new IntersectionObserver(([en], o) => { if (en.isIntersecting) { el.classList.add("is-live"); o.disconnect(); } }, { threshold: .25 }).observe(el);
    if (RM) el.classList.add("is-live");
    render();
  }
  document.querySelectorAll("[data-planner]").forEach(mount);
})();
