// Sub-page behaviour. Each block checks for its own markup, so one file serves every page.
const RMp = matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* ---------- page hero: words rise out of a mask ---------- */
const ph = $(".phero");
if (ph) {
  const h1 = $("h1", ph);
  let i = 0;
  (function split(node) {
    [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const f = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(p => {
          if (!p) return;
          if (/^\s+$/.test(p)) return f.append(p);
          const w = document.createElement("span"); w.className = "w";
          w.innerHTML = `<span style="--i:${i++}">${p}</span>`; f.append(w);
        });
        n.replaceWith(f);
      } else if (n.nodeType === 1) split(n);
    });
  })(h1);
  (window.__intro || Promise.resolve()).then(() => requestAnimationFrame(() => requestAnimationFrame(() => ph.classList.add("is-ready"))));
}

/* ---------- images that open up from an inset clip ---------- */
const mediaIO = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("is-in"); mediaIO.unobserve(e.target); } }), { threshold: .2 });
$$(".itin-media").forEach(m => mediaIO.observe(m));

/* ================= INDUSTRY PAGES ================= */
const indMain = $("[data-industry]");
if (indMain && window.ITINERARIES) {
  const id = indMain.dataset.industry;
  const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const fits = t => t.industries.includes(id);
  const list = [...ITINERARIES.filter(t => t.event === "canton" && fits(t)), ...ITINERARIES.filter(t => t.event === "expo" && fits(t))].slice(0, 6);
  $("#indTrips").innerHTML = list.map(t => `
    <a class="mini" href="itineraries.html?open=${t.id}#${t.id}" data-reveal>
      <img src="${t.img}" alt="" loading="lazy" width="300" height="240">
      <div><div class="tags">${t.event === "canton" ? t.phases.map(p => `<span class="tag-phase p${p}">Phase ${p}</span>`).join("") : `<span class="tag-phase">${t.city} · ${MON[+t.month.slice(5) - 1]} 2027</span>`}</div><h4>${t.title}</h4><p>${t.days ? t.days + "D" + t.nights + "N · " : ""}${t.sum.split(". ")[0].replace(/\.$/, "")}.</p></div>
    </a>`).join("");
  const expos = ITINERARIES.filter(t => t.event === "expo" && fits(t)).sort((a, b) => a.month.localeCompare(b.month));
  $("#indExpos").innerHTML = expos.length ? expos.map(t => `
    <li><a href="itineraries.html?open=${t.id}#${t.id}"><span class="m"><b>${MON[+t.month.slice(5) - 1]}</b><small>2027</small></span><span><strong>${t.expo}</strong><span class="s">${t.city} · usual month, dates TBC</span></span><svg class="icon" aria-hidden="true"><use href="#i-arrow"/></svg></a></li>`).join("")
    : `<li class="label">No matching 2027 expos yet. Ask us about specialist shows.</li>`;
  $$("#indTrips [data-reveal]").forEach(el => revealLate(el));
}
function revealLate(el) {
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.disconnect(); } }), { threshold: .15 });
  io.observe(el);
}

/* ================= SERVICES ================= */
const svcList = $("#svcList");
if (svcList) {
  const items = $$(".svc-item", svcList);
  const panel = $("#svcPanel");
  const fig = $("figure", panel), body = $(".svc-panel-body", panel);
  const show = (item, focus) => {
    if (item.classList.contains("is-active") && !focus) return;
    items.forEach(i => { const on = i === item; i.classList.toggle("is-active", on); $(".svc-btn", i).classList.toggle("is-active", on); $(".svc-btn", i).setAttribute("aria-expanded", String(on)); });
    const d = item.dataset;
    // New photo wipes in over the old one.
    const next = document.createElement("img");
    next.src = d.img; next.alt = d.alt; next.width = 1200; next.height = 750; next.classList.add("enter");
    fig.append(next);
    next.addEventListener("animationend", () => { $$("img", panel).slice(0, -1).forEach(o => o.remove()); next.classList.remove("enter"); }, { once: true });
    if (RMp) $$("img", panel).slice(0, -1).forEach(o => o.remove());
    body.innerHTML = $(".svc-detail-m .inner", item).innerHTML.replace(/^\s*<p>/, `<h3>${$("h3", item).textContent}</h3><p>`);
    body.classList.remove("swap"); void body.offsetWidth; body.classList.add("swap");
  };
  items.forEach(item => {
    const btn = $(".svc-btn", item);
    btn.addEventListener("click", () => show(item, true));
    if (matchMedia("(hover: hover)").matches) btn.addEventListener("mouseenter", () => { if (innerWidth > 980) show(item); });
  });
  show(items[0], true);
  $$(".svc-strip a").forEach(a => a.addEventListener("click", e => {
    const item = document.querySelector(a.getAttribute("href"));
    if (!item) return;
    e.preventDefault(); show(item, true);
    item.scrollIntoView({ behavior: RMp ? "auto" : "smooth", block: "center" });
  }));
  const fromHash = location.hash && document.querySelector(location.hash + ".svc-item");
  if (fromHash) show(fromHash, true);
}

/* ================= VISA ================= */
const visaTabs = $("#visaTabs");
if (visaTabs) {
  const tabs = $$("[role=tab]", visaTabs);
  const ind = $(".visa-ind", visaTabs);
  const moveInd = t => {
    const w = ind.parentElement.clientWidth - 10;
    ind.style.setProperty("--l", (t.offsetLeft - 5) + "px");
    ind.style.setProperty("--r", (w - (t.offsetLeft - 5) - t.offsetWidth) + "px");
  };
  const select = (id, push) => {
    tabs.forEach(t => {
      const on = t.dataset.tab === id;
      t.setAttribute("aria-selected", String(on)); t.tabIndex = on ? 0 : -1;
      const p = document.getElementById("panel-" + t.dataset.tab);
      p.hidden = !on;
      if (on) { p.classList.remove("enter"); void p.offsetWidth; p.classList.add("enter"); moveInd(t); }
    });
    if (push) history.replaceState(null, "", "#" + id);
    const order = [id, ...["china", "japan", "usa"].filter(x => x !== id)];
    $$(".pp-card").forEach(c => (c.dataset.pos = order.indexOf(c.dataset.c)));
  };
  $$(".pp-card").forEach(c => c.addEventListener("click", () => {
    select(c.dataset.c, true);
    if (c.dataset.pos === "0") document.getElementById("panel-" + c.dataset.c).scrollIntoView({ behavior: RMp ? "auto" : "smooth", block: "start" });
  }));
  $$("[data-goto]").forEach(a => a.addEventListener("click", e => { e.preventDefault(); select(a.dataset.goto, true); document.getElementById("visaTabs").scrollIntoView({ behavior: RMp ? "auto" : "smooth", block: "center" }); }));
  const track = $$("#trackSteps span");
  if (track.length) {
    let k = 0;
    const tickT = () => { track.forEach((t, i) => t.classList.toggle("on", i <= k)); k = (k + 1) % (track.length + 1); };
    tickT();
    if (!RMp) setInterval(tickT, 1100); else track.forEach(t => t.classList.add("on"));
  }
  tabs.forEach((t, i) => {
    t.addEventListener("click", () => select(t.dataset.tab, true));
    t.addEventListener("keydown", e => {
      if (!["ArrowRight", "ArrowLeft"].includes(e.key)) return;
      const n = tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
      select(n.dataset.tab, true); n.focus();
    });
  });
  const start = ["china", "japan", "usa"].includes(location.hash.slice(1)) ? location.hash.slice(1) : "china";
  select(start);
  addEventListener("resize", () => moveInd(tabs.find(t => t.getAttribute("aria-selected") === "true")));
  document.fonts?.ready.then(() => moveInd(tabs.find(t => t.getAttribute("aria-selected") === "true")));

  // Checklists remember ticks in this browser only.
  $$(".visa-panel").forEach(panel => {
    const key = "visa-" + panel.id;
    const boxes = $$(".check input", panel);
    let saved = [];
    try { saved = JSON.parse(localStorage.getItem(key) || "[]"); } catch {}
    boxes.forEach((b, i) => (b.checked = !!saved[i]));
    const out = $("[data-progress]", panel), bar = $(".bar i", panel), msg = $("[data-msg]", panel);
    const update = () => {
      const n = boxes.filter(b => b.checked).length;
      out.innerHTML = `${n}<span>/${boxes.length}</span>`;
      bar.style.setProperty("--v", (n / boxes.length).toFixed(3));
      msg.textContent = n === boxes.length ? "All set. Send them to us for a document check." : n ? `${boxes.length - n} documents to go.` : "Tick what you already have.";
      try { localStorage.setItem(key, JSON.stringify(boxes.map(b => b.checked))); } catch {}
    };
    boxes.forEach(b => b.addEventListener("change", update));
    $("[data-reset]", panel)?.addEventListener("click", () => { boxes.forEach(b => (b.checked = false)); update(); });
    $("[data-print]", panel)?.addEventListener("click", () => print());
    update();
  });
}

/* ================= INQUIRY ================= */
const inq = $("#inqForm");
if (inq) {
  const steps = $$(".inq-step", inq);
  const stepBtns = $$(".stepper button");
  const bar = $(".stepper-bar");
  let cur = 0;
  const params = new URLSearchParams(location.search);
  const tripSel = $("#trip");
  if (tripSel && window.ITINERARIES) {
    const opt = t => `<option value="${t.id}">${t.title}${t.days ? " · " + t.days + "D" + t.nights + "N" : ""}</option>`;
    const sorted = [...ITINERARIES].sort((a, b) => a.rank - b.rank);
    tripSel.innerHTML = `<option value="unsure">Help me choose</option>
      <optgroup label="Canton Fair">${sorted.filter(t => t.event === "canton").map(opt).join("")}</optgroup>
      <optgroup label="China expos 2027">${sorted.filter(t => t.event === "expo").map(opt).join("")}</optgroup>
      <option value="services">Services only (no package)</option>`;
  }
  if (params.get("trip") && tripSel) tripSel.value = params.get("trip");
  if (params.get("visa")) { const c = $(`input[name=services][value="visa-${params.get("visa")}"]`); if (c) c.checked = true; }

  const validate = i => {
    let ok = true, first = null;
    $$("[required]", steps[i]).forEach(el => {
      const v = el.type === "checkbox" ? el.checked : el.value.trim();
      let bad = !v;
      if (!bad && el.type === "email") bad = !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(el.value.trim());
      if (!bad && el.type === "tel") bad = el.value.replace(/\D/g, "").length < 10;
      el.classList.toggle("is-invalid", bad);
      el.setAttribute("aria-invalid", String(bad));
      const err = document.getElementById(el.id + "-err");
      if (err) err.textContent = bad ? (el.dataset.err || "Please fill this in.") : "";
      if (bad && !first) first = el;
      if (bad) ok = false;
    });
    first?.focus();
    return ok;
  };
  const go = n => {
    if (n > cur && !validate(cur)) return;
    const back = n < cur;
    steps[cur].hidden = true;
    cur = n;
    const s = steps[cur];
    s.hidden = false; s.classList.remove("enter", "enter-back"); void s.offsetWidth; s.classList.add(back ? "enter-back" : "enter");
    stepBtns.forEach((b, i) => { b.toggleAttribute("aria-current", i === cur); if (i === cur) b.setAttribute("aria-current", "step"); b.classList.toggle("done", i < cur); b.disabled = i > cur; });
    bar.style.setProperty("--s", ((cur + 1) / steps.length).toFixed(4));
    if (cur === steps.length - 1) buildReview();
    const top = $(".inq-card").getBoundingClientRect().top + scrollY - 100;
    if (scrollY > top) scrollTo({ top, behavior: RMp ? "auto" : "smooth" });
    $("h2", s).focus({ preventScroll: true });
  };
  $$("[data-next]", inq).forEach(b => b.addEventListener("click", () => go(cur + 1)));
  $$("[data-back]", inq).forEach(b => b.addEventListener("click", () => go(cur - 1)));
  stepBtns.forEach((b, i) => b.addEventListener("click", () => { if (i < cur) go(i); }));
  $$("input, select, textarea", inq).forEach(el => el.addEventListener("input", () => {
    if (el.classList.contains("is-invalid")) { el.classList.remove("is-invalid"); const err = document.getElementById(el.id + "-err"); if (err) err.textContent = ""; }
  }));

  const label = el => el.tagName === "SELECT" ? el.options[el.selectedIndex]?.text : el.value;
  function data() {
    const fd = new FormData(inq);
    return {
      Company: fd.get("company"), Industry: label($("#industry")), "Contact person": fd.get("name") + (fd.get("role") ? ` (${fd.get("role")})` : ""),
      Email: fd.get("email"), Mobile: fd.get("phone"), City: fd.get("city") || "—",
      Event: label($("#event")), Session: label($("#session")), Trip: label($("#trip")),
      Travellers: fd.get("pax"), "Departing from": label($("#depart")), Hotel: label($("#hotelClass")),
      Services: fd.getAll("services").map(v => $(`input[value="${v}"]`).dataset.label).join(", ") || "—",
      "Products to buy": fd.get("products") || "—", Notes: fd.get("notes") || "—",
    };
  }
  function buildReview() {
    const d = data();
    $("#review").innerHTML = Object.entries(d).map(([k, v]) => `<div><dt>${k}</dt><dd></dd></div>`).join("");
    $$("#review dd").forEach((dd, i) => (dd.textContent = Object.values(d)[i]));
  }
  inq.addEventListener("submit", e => {
    e.preventDefault();
    if (!validate(cur)) return;
    const d = data();
    const ref = "EB-" + new Date().toISOString().slice(2, 10).replace(/-/g, "") + "-" + Math.random().toString(36).slice(2, 6).toUpperCase();
    const body = Object.entries(d).map(([k, v]) => `${k}: ${v}`).join("\n");
    $("#doneRef").textContent = ref;
    $("#mailLink").href = `mailto:inquiry@example.com?subject=${encodeURIComponent("Canton Fair inquiry " + ref + " · " + d.Company)}&body=${encodeURIComponent(body)}`;
    $(".stepper").hidden = true;
    $(".inq-steps").hidden = true;
    const done = $("#donePanel"); done.hidden = false;
    $("h2", done).focus({ preventScroll: true });
    try { sessionStorage.removeItem("inqDraft"); } catch {}
  });

  // Keep a draft while the visitor moves between pages (this browser only).
  try {
    const draft = JSON.parse(sessionStorage.getItem("inqDraft") || "null");
    if (draft) Object.entries(draft).forEach(([n, v]) => {
      const els = inq.elements[n];
      if (!els) return;
      if (els instanceof RadioNodeList && els[0]?.type === "checkbox") [...els].forEach(c => (c.checked = v.includes(c.value)));
      else if (els.type === "checkbox") els.checked = v.includes(els.value);
      else if (!params.get(n)) els.value = v;
    });
  } catch {}
  inq.addEventListener("input", () => {
    const fd = new FormData(inq), o = {};
    for (const [k, v] of fd) { if (k === "services") (o[k] ||= []).push(v); else o[k] = v; }
    try { sessionStorage.setItem("inqDraft", JSON.stringify(o)); } catch {}
  });
}
