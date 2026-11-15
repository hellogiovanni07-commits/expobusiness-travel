// "Ask Expo": the ExpoBusiness concierge. Runs in the browser from the answers below; no data leaves the page.
(() => {
  const fab = document.querySelector(".cc-fab"), panel = document.getElementById("cc");
  if (!fab || !panel) return;
  const log = panel.querySelector(".cc-log"), form = panel.querySelector(".cc-form"), input = panel.querySelector("input");
  const S = window.SITE || {}, email = S.contact && !S.contact.email.startsWith("[") ? S.contact.email : "";
  const M = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const rng = ([a, b]) => { const x = new Date(a), y = new Date(b); return x.getMonth() === y.getMonth() ? `${x.getDate()}–${y.getDate()} ${M[y.getMonth()]}` : `${x.getDate()} ${M[x.getMonth()]} – ${y.getDate()} ${M[y.getMonth()]}`; };
  const sessions = (S.canton && S.canton.sessions) || [];
  const cantonDates = sessions.map(s => `<li><b>${s.name}</b> (${s.num}): ${s.phases.map((p, i) => "Phase " + (i + 1) + " " + rng(p)).join(" · ")}</li>`).join("");
  const PROPOSAL = '<a href="proposal.html">request a corporate proposal</a>';
  const COORD = "<p>To speak with a travel coordinator, " + PROPOSAL + (email ? ` or email <a href="mailto:${email}">${email}</a>` : "") + ".</p>";
  const IC = '<a href="https://www.immaculateconnectionsph.com/" rel="noopener" target="_blank">Immaculate Connections</a>';
  const START = ["Business visa requirements", "2027 expo calendar", "Speak to a coordinator"];

  const KB = [
    { k: ["hello", "hi", "good morning", "good afternoon", "hey"], a: "<p>Hello. How can I help with your business travel?</p>", q: START },
    { k: ["visa", "visas", "business visa", "requirements", "documents", "processing", "timeline", "invitation", "japan", "korea", "schengen", "uk", "us", "usa", "dubai", "uae"],
      a: "<p>Philippine passport holders need a business visa for Japan, South Korea, the UAE, the Schengen area, the UK, the US and mainland China. ASEAN countries, Hong Kong and Macao are visa-free for short visits.</p><p>We check documents, complete the forms, book appointments and track each application. Approval is always the embassy's decision.</p><p>See <a href='visa.html'>business visas</a> for the full table.</p>",
      q: ["China M visa", "Speak to a coordinator"] },
    { k: ["china", "m visa", "china visa", "chinese visa"],
      a: "<p>For mainland China, Philippine passport holders need a <b>business (M) visa</b>:</p><ul><li>Passport valid 6+ months, with blank pages</li><li>Online application approved before the visa centre visit</li><li>Photo, invitation letter and proof of business (DTI/SEC)</li></ul><p>Allow <b>four to six weeks</b> before departure. Fees and processing times are set by the visa centre. Hong Kong is visa-free for 14 days.</p>",
      q: ["Canton Fair 2027 dates", "Speak to a coordinator"] },
    { k: ["canton", "canton fair", "canton fair 2027", "phase", "guangzhou", "pazhou"],
      a: "<p>Canton Fair 2027, expected dates (the organiser has not published the official calendar yet):</p><ul>" + cantonDates + "</ul><p>Phase 1: electronics, machinery, lighting. Phase 2: home goods, furniture, gifts. Phase 3: textiles, fashion, toys. Hotels near the venue fill early.</p>",
      q: ["China M visa", "2027 expo calendar"] },
    { k: ["expo", "expos", "trade show", "trade fair", "fair", "calendar", "exhibition", "dates", "2027", "frankfurt", "las vegas", "mission"],
      a: "<p>Our <a href='expos.html'>2027 expo calendar</a> lists major trade shows in Asia, Europe, the Middle East and the US, with dates and sectors. We plan trips to any of them, and to shows not on the list.</p>",
      q: ["Canton Fair 2027 dates", "Speak to a coordinator"] },
    { k: ["price", "cost", "how much", "rate", "quote", "quotation", "budget", "package"],
      a: "<p>Every trip is quoted individually. Cost depends on destination, dates, hotel class and headcount. You receive an <b>itemised proposal</b> and official invoices in your company's name.</p>" + COORD },
    { k: ["group", "delegation", "chamber", "association", "mice", "conference", "incentive", "pax", "people", "team", "lgu"],
      a: "<p>We plan for teams of every size: <b>1–3</b> (short sourcing trips), <b>4–9</b> (private van, bilingual coordinator) and <b>10+</b> delegations (group visas, seat blocks, coaches, business dinners, charter on request).</p>" + COORD },
    { k: ["invoice", "receipt", "or", "official receipt", "finance", "accounting", "payment", "pay", "terms"],
      a: "<p>Invoices and official receipts are issued in your company's name. Nothing is paid on the website; payment terms are agreed in writing before anything is booked.</p>" },
    { k: ["interpreter", "translator", "factory", "supplier", "audit", "visit", "transport", "van", "driver"],
      a: "<p>We book <b>bilingual interpreters</b> by the half or full day, plus private vans, drivers and routing for <b>factory and supplier visits</b>.</p>" },
    { k: ["flight", "hotel", "airline", "manila", "cebu", "davao", "clark", "book", "depart", "departure"],
      a: "<p>We book flights and business hotels to your travel policy, from Manila, and handle changes for you. We can also arrange departures from Cebu, Clark and Davao.</p>" },
    { k: ["coordinator", "contact", "speak", "call", "human", "agent", "email", "phone", "talk"], a: COORD },
    { k: ["who", "about", "company", "immaculate", "partner", "office", "address", "where", "based"],
      a: "<p>ExpoBusiness Travel Services plans business travel for Philippine companies. We are based in <b>Metro Manila</b> and work in partnership with " + IC + ", a Philippine travel and tour services company.</p>" },
  ];
  const norm = s => s.toLowerCase().replace(/[^a-z0-9+ ]/g, " ");
  function answer(text) {
    const t = " " + norm(text) + " ";
    let best = null, score = 0;
    KB.forEach(item => {
      const s = item.k.reduce((n, k) => n + (t.includes(" " + k + " ") || (k.length > 4 && t.includes(k)) ? k.length : 0), 0);
      if (s > score) { score = s; best = item; }
    });
    return best || { a: "<p>I don't have a ready answer for that.</p>" + COORD, q: START };
  }
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let typing = null; // { finish } while a reply is being typed
  const toBottom = () => { log.scrollTop = log.scrollHeight; };
  function chipsRow(chips) {
    if (!chips || !chips.length) return;
    const c = document.createElement("div"); c.className = "cc-chips";
    chips.forEach(q => { const b = document.createElement("button"); b.type = "button"; b.textContent = q; b.onclick = () => ask(q); c.appendChild(b); });
    log.appendChild(c); toBottom();
  }
  function add(html, who, chips) {
    const m = document.createElement("div");
    m.className = "cc-msg " + (who === "me" ? "cc-me" : "cc-bot");
    if (who === "me") { m.textContent = html; log.appendChild(m); toBottom(); chipsRow(chips); return; }
    m.innerHTML = html;
    if (reduceMotion) { log.appendChild(m); toBottom(); chipsRow(chips); return; }
    // bot reply: "typing" dots first, then the text types out letter by letter (links and bold kept)
    const dots = document.createElement("div"); dots.className = "cc-msg cc-bot cc-typing"; dots.setAttribute("aria-label", "Ask Expo is typing");
    dots.innerHTML = "<i></i><i></i><i></i>"; log.appendChild(dots); toBottom();
    const texts = [], walker = document.createTreeWalker(m, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) texts.push([walker.currentNode, walker.currentNode.textContent]);
    const total = texts.reduce((n, t) => n + t[1].length, 0);
    texts.forEach(t => { t[0].textContent = ""; });
    const perTick = Math.max(1, Math.ceil(total / 140)); // still letter by letter, long answers capped near 3 s
    let ti = 0, ci = 0, timer = 0, done = false;
    const finish = () => {
      if (done) return; done = true; clearTimeout(timer); if (dots.isConnected) dots.replaceWith(m);
      texts.forEach(t => { t[0].textContent = t[1]; });
      m.classList.remove("cc-typing-on"); log.removeAttribute("aria-busy"); typing = null; toBottom(); chipsRow(chips);
    };
    const tick = () => {
      let n = perTick;
      while (n > 0 && ti < texts.length) {
        const [node, full] = texts[ti], take = Math.min(n, full.length - ci);
        ci += take; n -= take; node.textContent = full.slice(0, ci);
        if (ci >= full.length) { ti++; ci = 0; }
      }
      toBottom();
      if (ti >= texts.length) finish(); else timer = setTimeout(tick, 22);
    };
    typing = { finish };
    log.setAttribute("aria-busy", "true"); // screen readers hear the whole reply once, not letter by letter
    timer = setTimeout(() => { dots.replaceWith(m); m.classList.add("cc-typing-on"); tick(); }, 450);
    m.addEventListener("click", finish, { once: true }); // tap the bubble to show the whole reply
  }
  function ask(q) { if (typing) typing.finish(); add(q, "me"); const r = answer(q); add(r.a, "bot", r.q); }
  let started = false;
  function toggle(open) {
    panel.classList.toggle("on", open); fab.setAttribute("aria-expanded", open);
    if (open && !started) { started = true; add("<p>Welcome to ExpoBusiness. I can answer questions on business visas, 2027 trade expos and group travel, or connect you with a travel coordinator in Metro Manila.</p>", "bot", START); }
    if (open) input.focus(); else fab.focus();
  }
  fab.addEventListener("click", () => toggle(!panel.classList.contains("on")));
  panel.querySelector(".cc-x").addEventListener("click", () => toggle(false));
  addEventListener("keydown", e => { if (e.key === "Escape" && panel.classList.contains("on")) toggle(false); });
  form.addEventListener("submit", e => { e.preventDefault(); const v = input.value.trim(); if (v) { input.value = ""; ask(v); } });
})();
