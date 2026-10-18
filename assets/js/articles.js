// Expo articles hub: featured guide, region chips, month and search filters, guides grouped by month.
(() => {
  const X = window.EXPOS; if (!X || !document.getElementById("axList")) return;
  const $ = s => document.querySelector(s);
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const svg = id => `<svg class="icon" aria-hidden="true"><use href="#i-${id}"/></svg>`;
  const P = new URLSearchParams(location.search);
  const S = { cat: P.get("cat") || "", m: P.get("m") || "", q: P.get("q") || "" };
  const norm = s => String(s).toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "");

  $("#axCount").textContent = `${X.all.length} expo guides`;

  // Featured: the next Canton Fair, the flagship trip.
  const f = X.all.find(e => e.canton) || X.all[0];
  const feat = $("#axFeature");
  feat.href = X.url(f);
  feat.innerHTML = `<span class="axf-img" style="background-image:url('${X.photo(f, 900)}')"></span>
    <span class="axf-body"><span class="ax-kicker">Featured guide · ${esc(f.cat)}</span><b>${esc(f.name)}</b><span class="axf-when">${svg("calendar")}${esc(f.when)}</span><span class="axf-why">${esc(f.why)}</span><span class="link-arrow">Read the guide ${svg("arrow")}</span></span>`;

  // Filters
  const cats = X.CATEGORIES.filter(c => X.all.some(e => e.cat === c));
  $("#axCats").innerHTML = [["", "All"], ...cats.map(c => [c, c])].map(([v, l]) => `<button type="button" data-cat="${esc(v)}"><span>${esc(l)}</span><small>${v ? X.all.filter(e => e.cat === v).length : X.all.length}</small></button>`).join("");
  $("#axM").insertAdjacentHTML("beforeend", X.MONTHS.map((m, i) => `<option value="${String(i + 1).padStart(2, "0")}">${m} 2027</option>`).join(""));
  $("#axQ").value = S.q; $("#axM").value = S.m;

  const card = e => `<article class="ax-card">
      <a class="ax-img" href="${X.url(e)}" tabindex="-1" aria-hidden="true"><span style="background-image:url('${X.photo(e, 700)}')"></span><i class="ax-date"><b>${X.MON[e.mi]}</b><small>2027</small></i></a>
      <div class="ax-body">
        <p class="ax-kicker">${esc(e.cat)}${e.cat !== e.city ? ` · ${esc(e.city)}` : ""}<span class="ax-st ${e.dates_status === "confirmed" ? "ok" : ""}">${e.dates_status === "confirmed" ? "Dates confirmed" : "Expected dates"}</span></p>
        <h3><a href="${X.url(e)}">${esc(e.name)}</a></h3>
        <p class="ax-when">${esc(e.when)}${e.venue ? ` · ${esc(e.venue)}` : ""}</p>
        <p class="ax-ex">${esc(e.why)}</p>
        <p class="ax-foot"><span>${e.read} min read</span><a class="link-arrow" href="${X.url(e)}">Read the guide ${svg("arrow")}</a></p>
      </div>
    </article>`;

  function render() {
    const q = norm(S.q.trim());
    const items = X.all.filter(e => (!S.cat || e.cat === S.cat) && (!S.m || e.month.slice(5) === S.m) &&
      (!q || norm([e.name, e.short, e.city, e.country, e.sectors, e.cat].join(" ")).includes(q)));
    document.querySelectorAll("#axCats button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.cat === S.cat)));
    const bits = [S.cat, S.m && X.MONTHS[+S.m - 1], S.q && `“${S.q}”`].filter(Boolean);
    $("#axStatus").innerHTML = `<b>${items.length}</b> guide${items.length === 1 ? "" : "s"}${bits.length ? " · " + esc(bits.join(" · ")) + ` <button type="button" class="link-btn" id="axClear">Clear</button>` : ""}`;
    const months = [...new Set(items.map(e => e.mi))];
    $("#axList").innerHTML = months.map(mi => {
      const list = items.filter(e => e.mi === mi);
      return `<section class="ax-month-block" aria-label="${X.MONTHS[mi]} 2027"><h3 class="ax-mh"><b>${X.MONTHS[mi]}</b><span>2027 · ${list.length} expo${list.length === 1 ? "" : "s"}</span></h3><div class="ax-grid">${list.map(card).join("")}</div></section>`;
    }).join("") || `<p class="ax-empty">No guides match. Try another region or month, or <a href="inquiry.html">ask us about a show</a>.</p>`;
    $("#axClear")?.addEventListener("click", () => { S.cat = S.m = S.q = ""; $("#axQ").value = ""; $("#axM").value = ""; render(); });
    const u = new URLSearchParams(); Object.entries(S).forEach(([k, v]) => v && u.set(k, v));
    history.replaceState(null, "", u.toString() ? "?" + u : location.pathname);
  }
  document.getElementById("axCats").addEventListener("click", e => { const b = e.target.closest("button"); if (!b) return; S.cat = S.cat === b.dataset.cat ? "" : b.dataset.cat; render(); });
  $("#axM").addEventListener("change", e => { S.m = e.target.value; render(); });
  let t; $("#axQ").addEventListener("input", e => { clearTimeout(t); t = setTimeout(() => { S.q = e.target.value; render(); }, 180); });
  render();
})();
