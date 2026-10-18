// China guide page: expo-season bars in the hero, next-up list, and the planning brief.
(() => {
  const data = window.EXPO_CN, B = window.CN_BRIEF;
  if (!data || !B) return;
  const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const svg = id => `<svg class="icon" aria-hidden="true"><use href="#i-${id}"/></svg>`;

  // Hero: one bar per month, height = number of China expos. Canton Fair months carry a marker.
  const season = document.getElementById("season");
  if (season) {
    const counts = MON.map((_, i) => data.filter(e => +e.month.slice(5) === i + 1));
    const max = Math.max(...counts.map(c => c.length));
    season.innerHTML = `<div class="ss-bars">${counts.map((c, i) => {
      const canton = c.some(e => e.canton);
      return `<button type="button" class="ss-bar${canton ? " is-canton" : ""}" style="--h:${(c.length / max).toFixed(3)};--i:${i}" data-m="${String(i + 1).padStart(2, "0")}" ${c.length ? "" : "disabled"} aria-label="${MON[i]} 2027: ${c.length} expos${canton ? ", Canton Fair" : ""}">
        <span class="ss-col"><b class="tnum">${c.length || ""}</b>${canton && c.length / max >= .6 ? `<i>Canton Fair</i>` : ""}</span><small>${MON[i]}</small></button>`;
    }).join("")}</div>
      <p class="ss-cap">${svg("calendar")}<span><b>${data.length}</b> China expos in 2027 by month. Tap a month to filter the planner.</span><span class="ss-key"><i></i>Canton Fair month</span></p>`;
    season.querySelectorAll(".ss-bar").forEach(b => b.addEventListener("click", () => {
      document.getElementById("planner").scrollIntoView({ behavior: RM ? "auto" : "smooth" });
      setTimeout(() => { const m = document.querySelector(`.pl-months button[data-m="${b.dataset.m}"]`); if (m && !m.classList.contains("is-on")) m.click(); }, RM ? 0 : 500);
    }));
    const io = new IntersectionObserver(([en], o) => { if (en.isIntersecting) { season.classList.add("is-in"); o.disconnect(); } }, { threshold: .3 });
    (window.__intro || Promise.resolve()).then(() => io.observe(season));
  }

  // Stats + brief cards.
  const fill = (id, html) => { const el = document.getElementById(id); if (el) el.innerHTML = html; };
  const cities = new Set(data.map(e => e.city)).size;
  fill("cnStats", [[data.length, "expos picked for 2027"], [cities, "cities, Beijing to Haikou"], [data.filter(e => e.dates_status === "confirmed").length, "dates already confirmed"], ["2", "Canton Fair sessions"]]
    .map(([n, l], i) => `<li><b class="tnum">${n}</b><span>${l}</span></li>`).join(""));
  fill("cantonScale", B.scale.map(([n, l]) => `<li><b class="tnum">${n}</b><span>${l}</span></li>`).join(""));
  fill("cantonNotes", B.canton.map(([h, p], i) => `<li><span class="bn">${String(i + 1).padStart(2, "0")}</span><div><h3>${esc(h)}</h3><p>${esc(p)}</p></div></li>`).join(""));
  const notes = (arr, ic) => arr.map(([h, p], i) => `<details class="brief-item"${i === 0 ? " open" : ""}><summary><b>${esc(h)}</b>${svg("plus")}</summary><p>${esc(p)}</p></details>`).join("");
  fill("visaNotes", notes(B.visa, "passport"));
  fill("planNotes", notes(B.planning, "calendar"));
  fill("cnSources", B.sources.map(([t, u]) => `<li><a href="${esc(u)}" target="_blank" rel="noopener">${esc(t)} ${svg("arrow")}</a></li>`).join(""));
})();
