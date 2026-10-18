// Home: buyer-badge hero (lanyard physics), live fair label, animated visa booklet,
// animated visa booklet, scroll-linked process line and the itinerary rail.
const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
const FINE = matchMedia("(hover: hover) and (pointer: fine)").matches;
const fmt = d => d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "Asia/Manila" });
const rangeTxt = ([a, b]) => {
  const A = new Date(a + "T00:00:00+08:00"), B = new Date(b + "T00:00:00+08:00");
  return A.getMonth() === B.getMonth() ? `${fmt(A)}–${B.getDate()}` : `${fmt(A)}–${fmt(B)}`;
};
const now = new Date();
const curSession = FAIR.sessions.find(s => new Date(s.phases[2][1] + "T18:00:00+08:00") > now) || FAIR.sessions.at(-1);

/* ================= HERO: BUYER BADGE ON A LANYARD ================= */
(() => {
  const pend = document.getElementById("pend"), badge = document.getElementById("badge"), stage = document.getElementById("lanyard");
  if (!pend) return;
  // Session label + a deterministic QR-like pattern.
  const next = FAIR.sessions.find(s => new Date(s.phases[0][0] + "T00:00:00+08:00") > now) || curSession;
  document.getElementById("bfSession").textContent = `Next session · ${next.name}`;
  document.getElementById("bfNo").textContent = `EB-${next.num.replace(/\D/g, "")}-0418`;
  let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  document.getElementById("bfQr").innerHTML = Array.from({ length: 81 }, (_, i) => {
    const x = i % 9, y = Math.floor(i / 9);
    const finder = (x < 3 && y < 3) || (x > 5 && y < 3) || (x < 3 && y > 5);
    const on = finder ? !(x % 6 === 1 && y % 6 === 1) : rnd() > .5;
    return `<i class="${on ? "" : "o"}"></i>`;
  }).join("");

  // Buyer type types itself out, cycling through industries.
  const roles = ["Electronics buyer", "Furniture buyer", "Lighting buyer", "Hardware buyer", "Hotel supply buyer", "Garments buyer", "Toys & gifts buyer"];
  const who = document.getElementById("bfInd");
  if (!RM) {
    let r = 0, c = roles[0].length, del = true;
    setInterval(() => {
      if (del) { c--; if (c <= 0) { del = false; r = (r + 1) % roles.length; } }
      else { c++; if (c >= roles[r].length) { del = true; c = roles[r].length + 8; } }
      who.textContent = roles[r].slice(0, Math.max(0, Math.min(c, roles[r].length)));
    }, 85);
  }

  // Pendulum: angle th (rad), velocity w. The card adds its own lagging sway for a two-part swing.
  let th = RM ? 0 : -0.1, w = 0, card = 0, cardW = 0, dragging = false, moved = 0, last = 0, lastAng = 0, visible = true, raf = 0;
  const L = 520; // effective length in px
  const apply = () => {
    pend.style.transform = `rotate(${th}rad)`;
    badge.style.setProperty("--sway", (card * 57.3).toFixed(2) + "deg");
    badge.style.setProperty("--shine", (-120 + (th + card) * 260).toFixed(1) + "%");
  };
  const anchor = () => { const r = pend.getBoundingClientRect(); return { x: r.left, y: r.top }; };
  function step(t) {
    const dt = Math.min(0.033, (t - (last || t)) / 1000) || 0.016; last = t;
    if (!dragging) {
      const ambient = FINE ? 0 : Math.sin(t / 1400) * 0.0006;
      w += (-(9.8 * 120 / L) * Math.sin(th) - 2.4 * w) * dt + ambient;
      th += w * dt;
    }
    // card lags behind the strap and settles
    cardW += (-card * 42 - cardW * 9 - w * 3) * dt;
    card += cardW * dt;
    apply();
    const still = Math.abs(w) < 0.0008 && Math.abs(th) < 0.0008 && Math.abs(card) < 0.0008 && Math.abs(cardW) < 0.001;
    if (visible && (!still || dragging)) raf = requestAnimationFrame(step); else { raf = 0; last = 0; }
  }
  const kick = () => { if (!raf && !RM) raf = requestAnimationFrame(step); };
  const angTo = e => { const a = anchor(); return Math.max(-0.32, Math.min(0.32, Math.atan2(-(e.clientX - a.x), e.clientY - a.y))); };

  if (!RM) {
    badge.addEventListener("pointerdown", e => {
      dragging = true; moved = 0; badge.setPointerCapture(e.pointerId);
      lastAng = angTo(e); kick();
    });
    badge.addEventListener("pointermove", e => {
      if (!dragging) return;
      const a = angTo(e);
      moved += Math.abs(a - lastAng);
      w = (a - lastAng) * 60; th = a; lastAng = a;
    });
    const end = () => { if (!dragging) return; dragging = false; kick(); };
    badge.addEventListener("pointerup", end);
    badge.addEventListener("pointercancel", end);
    // A gentle push when the pointer passes near the badge.
    if (FINE) stage.addEventListener("pointermove", e => {
      if (dragging) return;
      const r = badge.getBoundingClientRect();
      if (e.clientY > r.top - 40 && e.clientY < r.bottom + 40 && Math.abs(e.clientX - (r.left + r.width / 2)) < r.width) { w += (e.movementX || 0) * 0.0012; kick(); }
    });
    new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) kick(); }).observe(stage);
    setTimeout(kick, 600);
  }
  badge.addEventListener("click", () => { if (moved > 0.06) return; badge.classList.toggle("flipped"); w += 0.2; kick(); });

  // The badge cycles through China's flagship expos; dots jump straight to one.
  const EVENTS = [
    { zh: "中国进出口商品交易会", name: "Canton Fair", sess: `Next session · ${next.name}`, l1: "Phase", v1: "1 · 2 · 3", venue: "Pazhou", no: "EB-141-0418", c: ["#16163a", "#c9460b", "#d7261e"] },
    { zh: "中国（广州）国际家具博览会", name: "CIFF Guangzhou", sess: "Guangzhou · March 2027", l1: "When", v1: "Mar 2027", venue: "Pazhou", no: "EB-CF27-0311", c: ["#3a1a0a", "#c9460b", "#e0790b"] },
    { zh: "香港电子产品展", name: "HK Electronics Fair", sess: "Hong Kong · Spring 2027", l1: "When", v1: "Apr 2027", venue: "HKCEC", no: "EB-HK27-0412", c: ["#2a0a18", "#7a1030", "#d7261e"] },
    { zh: "中国—东盟博览会", name: "China-ASEAN Expo", sess: "Nanning · September 2027", l1: "When", v1: "Sep 2027", venue: "Nanning", no: "EB-CA27-0916", c: ["#0e2a24", "#16463a", "#2f7f5f"] },
    { zh: "中国国际进口博览会", name: "CIIE", sess: "Shanghai · November 2027", l1: "When", v1: "Nov 2027", venue: "NECC", no: "EB-II27-1105", c: ["#0e1440", "#1f2a6b", "#3b4cc0"] },
  ];
  const dots = document.querySelector(".badge-dots");
  let ev = 0, cycleT = 0;
  dots.innerHTML = EVENTS.map((e, i) => `<button type="button" aria-label="${e.name}" aria-pressed="${i === 0}"><span>${e.name}</span></button>`).join("");
  const front = badge.querySelector(".front");
  function showEvent(i) {
    ev = (i + EVENTS.length) % EVENTS.length;
    const e = EVENTS[ev];
    badge.classList.add("swap");
    setTimeout(() => {
      document.getElementById("bfZh").textContent = e.zh;
      document.getElementById("bfName").textContent = e.name;
      document.getElementById("bfSession").textContent = e.sess;
      document.getElementById("bfL1").textContent = e.l1;
      document.getElementById("bfPhase").textContent = e.v1;
      document.getElementById("bfVenue").textContent = e.venue;
      document.getElementById("bfNo").textContent = e.no;
      front.style.setProperty("--b0", e.c[0]); front.style.setProperty("--b1", e.c[1]); front.style.setProperty("--b2", e.c[2]);
      badge.classList.remove("swap");
    }, RM ? 0 : 260);
    [...dots.children].forEach((d, j) => d.setAttribute("aria-pressed", String(j === ev)));
    w += RM ? 0 : 0.18; kick();
  }
  const autoCycle = () => { clearTimeout(cycleT); if (!RM) cycleT = setTimeout(() => { if (!dragging && !badge.classList.contains("flipped") && visible) showEvent(ev + 1); autoCycle(); }, 6500); };
  [...dots.children].forEach((d, j) => d.addEventListener("click", () => { showEvent(j); autoCycle(); }));
  autoCycle();
  badge.addEventListener("keydown", e => {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") { e.preventDefault(); w += e.key === "ArrowLeft" ? -1.2 : 1.2; kick(); }
  });
  apply();
})();

/* ================= HERO LIVE LABEL + PLANNER COUNTDOWN ================= */
(() => {
  const all = FAIR.sessions.flatMap(s => s.phases.map(([a, b], i) => ({ s: s.name, p: i + 1, start: new Date(a + "T09:30:00+08:00"), end: new Date(b + "T18:00:00+08:00") })));
  const liveEl = document.getElementById("liveLabel"), days = document.getElementById("pcDays"), lab = document.getElementById("pcLabel");
  function tick() {
    const t0 = new Date(), live = all.find(x => t0 >= x.start && t0 <= x.end), ref = live || all.find(x => x.start > t0);
    if (!ref) return;
    if (liveEl) liveEl.textContent = live ? `Canton Fair Phase ${ref.p} is open now` : `Next Canton Fair: ${ref.s}, Phase ${ref.p}`;
    if (days) days.textContent = Math.max(0, Math.ceil(((live ? ref.end : ref.start) - t0) / 864e5));
    if (lab) lab.textContent = live ? `days left in Phase ${ref.p}, ${ref.s}` : `days to Canton Fair ${ref.s}, Phase ${ref.p}`;
  }
  tick(); setInterval(tick, 60000);
})();

/* ================= VISA BOOKLET ================= */
(() => {
  const book = document.getElementById("book");
  if (!book) return;
  const V = {
    china: { cover: "#6b1426", country: "CHINA", kind: "VISA · M", foot: "Business · Entries 1 · 30 days", city: "GUANGZHOU", s1: "Passport, invitation letter, company certificate", s2: "Online form, then the visa application center", s3: "About 4 working days, regular service" },
  };
  const steps = [...document.querySelectorAll("#vxSteps li")];
  const vtabs = [...document.querySelectorAll(".vx-tabs [role=tab]")];
  let cur = "china", timers = [], seen = false;
  const clear = () => { timers.forEach(clearTimeout); timers = []; };
  const at = (ms, fn) => timers.push(setTimeout(fn, RM ? 0 : ms));
  const setStep = n => steps.forEach((s, i) => { s.classList.toggle("on", i === n); s.classList.toggle("done", i < n); });
  function fill(c) {
    const d = V[c];
    book.dataset.c = c;
    document.getElementById("stCountry").textContent = d.country;
    document.getElementById("stKind").textContent = d.kind;
    document.getElementById("stFoot").textContent = d.foot;
    document.getElementById("stampCity").textContent = d.city;
    ["s1", "s2", "s3"].forEach((k, i) => (document.getElementById("vxS" + (i + 1)).textContent = d[k]));
  }
  function play(c) {
    clear();
    const restart = book.classList.contains("open");
    book.classList.remove("visa", "stamped");
    if (restart) book.classList.remove("open");
    const base = restart ? 900 : 0;
    at(base, () => { fill(c); setStep(0); });
    at(base + 200, () => book.classList.add("open"));
    at(base + 1100, () => setStep(1));
    at(base + 1500, () => { book.classList.add("visa"); setStep(2); });
    at(base + 2500, () => { book.classList.add("stamped"); setStep(3); });
  }
  vtabs.forEach((t, i) => {
    t.addEventListener("click", () => {
      if (cur === t.dataset.v && book.classList.contains("stamped")) return;
      cur = t.dataset.v;
      vtabs.forEach(x => { const on = x === t; x.setAttribute("aria-selected", String(on)); x.tabIndex = on ? 0 : -1; });
      play(cur);
    });
    t.addEventListener("keydown", e => {
      if (!["ArrowRight", "ArrowLeft"].includes(e.key)) return;
      const n = vtabs[(i + (e.key === "ArrowRight" ? 1 : 2)) % 3]; n.click(); n.focus();
    });
  });
  new IntersectionObserver(([en]) => { if (en.isIntersecting && !seen) { seen = true; play(cur); } }, { threshold: .45 }).observe(book);
  fill(cur);
})();

/* ================= HERO ENTRANCE (Motion) ================= */
const title = document.querySelector("[data-split]");
(function split(node) {
  [...node.childNodes].forEach(n => {
    if (n.nodeType === 3) {
      const frag = document.createDocumentFragment();
      n.textContent.split(/(\s+)/).forEach(part => {
        if (!part) return;
        if (/^\s+$/.test(part)) frag.append(part);
        else { const w = document.createElement("span"); w.className = "w"; w.innerHTML = `<span>${part}</span>`; frag.append(w); }
      });
      n.replaceWith(frag);
    } else if (n.nodeType === 1) split(n);
  });
})(title);
addEventListener("DOMContentLoaded", () => (window.__intro || Promise.resolve()).then(() => {
  if (!window.Motion || RM) return;
  const { animate, stagger } = Motion;
  document.documentElement.classList.add("anim-on");
  animate(".hero-title .w > span", { transform: ["translateY(105%)", "translateY(0%)"] }, { delay: stagger(0.05, { startDelay: 0.1 }), duration: 0.8, ease: [0.16, 1, 0.3, 1] });
  animate("[data-in]", { opacity: [0, 1], transform: ["translateY(18px)", "translateY(0px)"] }, { delay: stagger(0.08, { startDelay: 0.25 }), duration: 0.7, ease: [0.16, 1, 0.3, 1] });
  animate("[data-in-visual]", { opacity: [0, 1], transform: ["translateY(-80px)", "translateY(0px)"] }, { delay: 0.2, type: "spring", bounce: 0.3, duration: 1.1 });
}));

/* ================= ROUTE (scroll-linked) ================= */
const route = document.getElementById("route");
if (route) {
  const stops = [...route.querySelectorAll(".stop")];
  const line = route.querySelector(".route-line");
  const update = () => {
    const r = line.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (innerHeight * .55 - r.top) / r.height));
    route.style.setProperty("--p", RM ? (p > 0 ? 1 : 0) : p.toFixed(4));
    const planeY = r.top + r.height * p;
    stops.forEach(s => {
      const was = s.classList.contains("passed");
      const on = s.getBoundingClientRect().top + 14 <= planeY + 1 || p >= .999;
      s.classList.toggle("passed", on);
      if (on && !was) { s.classList.add("is-active"); setTimeout(() => s.classList.remove("is-active"), 900); }
    });
  };
  addEventListener("scroll", () => requestAnimationFrame(update), { passive: true });
  addEventListener("resize", update);
  update();
}

/* ================= RAIL (from the catalogue) ================= */
const rail = document.getElementById("rail");
if (rail && window.ITINERARIES) {
  const len = t => t.days ? `${t.days}D${t.nights}N` : "Custom";
  const card = t => `
    <a class="trip" href="itineraries.html?open=${t.id}#${t.id}">
      <figure>${eventBanner(t)}<span class="tags">${t.event === "expo" ? `<span class="tag-phase p2">${t.city} · ${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][+t.month.slice(5) - 1]} 2027</span>` : t.phases.map(p => `<span class="tag-phase p${p}">Phase ${p}</span>`).join("")}</span></figure>
      <div class="trip-body"><div class="trip-meta"><span>${len(t)}</span><span>${t.event === "expo" ? t.city : "Guangzhou"}</span></div><h3>${t.title}</h3><p>${t.sum}</p>
      <span class="link-arrow">View itinerary <svg class="icon" aria-hidden="true"><use href="#i-arrow"/></svg></span></div>
    </a>`;
  const render = ev => {
    const list = ITINERARIES.filter(t => t.event === ev).sort((a, b) => a.rank - b.rank).slice(0, 8);
    const total = ITINERARIES.filter(t => t.event === ev).length;
    const more = ev === "canton"
      ? { h: "Plan by phase, or add an expo", p: "All three Canton Fair phases plus upcoming expos in Guangzhou, Shanghai and Hong Kong.", href: "itineraries.html", icon: "calendar" }
      : { h: `See all ${total} China expos`, p: "Filter by city, month and industry: Guangzhou, Shanghai, Hong Kong, Shenzhen, Yiwu, Nanning.", href: "itineraries.html?event=expo", icon: "globe" };
    rail.innerHTML = list.map(card).join("") + `<a class="trip trip-all ico-host" href="${more.href}"><span class="ico" data-m="pop"><svg class="icon" aria-hidden="true"><use href="#i-${more.icon}"/></svg></span><h3>${more.h}</h3><p>${more.p}</p><span class="link-arrow">Open the catalogue <svg class="icon" aria-hidden="true"><use href="#i-arrow"/></svg></span></a>`;
    rail.scrollLeft = 0;
    bindTilt();
  };
  document.querySelectorAll(".rail-tabs [role=tab]").forEach(t => t.addEventListener("click", () => {
    document.querySelectorAll(".rail-tabs [role=tab]").forEach(x => x.setAttribute("aria-selected", String(x === t)));
    render(t.dataset.ev);
  }));
  document.querySelectorAll(".rail-btn").forEach(b => b.addEventListener("click", () => {
    const c = rail.querySelector(".trip");
    rail.scrollBy({ left: (+b.dataset.dir) * (c.offsetWidth + 18), behavior: RM ? "auto" : "smooth" });
  }));
  let down = false, sx = 0, sl = 0, moved = 0;
  rail.addEventListener("pointerdown", e => { if (e.pointerType !== "mouse") return; down = true; moved = 0; sx = e.clientX; sl = rail.scrollLeft; });
  addEventListener("pointermove", e => { if (!down) return; const dx = e.clientX - sx; moved = Math.max(moved, Math.abs(dx)); if (moved > 6) rail.classList.add("dragging"); rail.scrollLeft = sl - dx; });
  addEventListener("pointerup", () => { down = false; setTimeout(() => rail.classList.remove("dragging"), 0); });
  rail.addEventListener("click", e => { if (moved > 6) e.preventDefault(); }, true);
  function bindTilt() {
    if (!FINE || RM) return;
    rail.querySelectorAll(".trip").forEach(c => {
      c.addEventListener("pointermove", e => {
        const r = c.getBoundingClientRect();
        c.style.setProperty("--ry", (((e.clientX - r.left) / r.width - .5) * 7).toFixed(2) + "deg");
        c.style.setProperty("--rx", ((.5 - (e.clientY - r.top) / r.height) * 5).toFixed(2) + "deg");
      });
      c.addEventListener("pointerleave", () => { c.style.setProperty("--rx", "0deg"); c.style.setProperty("--ry", "0deg"); });
    });
  }
  render("canton");
}
