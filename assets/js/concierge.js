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
  const COORD = "<p>To speak with a corporate travel coordinator, " + PROPOSAL + (email ? ` or email <a href="mailto:${email}">${email}</a>` : "") + ". We reply within one working day.</p>";

  const KB = [
    { k: ["hello", "hi", "good morning", "good afternoon", "hey"], a: "<p>Hello. How can I help with your business travel?</p>", q: ["China M visa timeline", "Canton Fair 2027 dates", "Speak to a coordinator"] },
    { k: ["visa", "m visa", "business visa", "china visa", "invitation", "processing", "timeline", "requirements", "documents"],
      a: "<p>For mainland China, Philippine passport holders need a <b>business (M) visa</b>:</p><ul><li>Passport valid 6+ months, blank pages</li><li>Online application approved before the visa centre visit</li><li>Photo, invitation letter, proof of business (DTI/SEC)</li></ul><p>Allow <b>four to six weeks</b> before departure. Fees and processing times are set by the visa centre and confirmed when we file. Hong Kong is visa-free for 14 days.</p><p>See <a href='visa.html'>business visas</a> for other countries.</p>",
      q: ["Canton Fair 2027 dates", "Speak to a coordinator"] },
    { k: ["canton", "fair", "dates", "when", "phase", "guangzhou", "2027", "schedule"],
      a: "<p>Canton Fair 2027, expected dates (the organiser has not published the official calendar yet):</p><ul>" + cantonDates + "</ul><p>Phase 1: electronics, machinery, lighting. Phase 2: home goods, furniture, gifts. Phase 3: textiles, fashion, toys. Hotels near Pazhou fill early, so book well ahead.</p>",
      q: ["China M visa timeline", "Other 2027 expos"] },
    { k: ["expo", "expos", "trade show", "calendar", "exhibition", "fair list", "other"],
      a: "<p>Our <a href='expos.html'>2027 expo calendar</a> lists major trade shows in Asia, Europe, the Middle East and the US, with dates and sectors. We plan trips to any of them, and to shows not on the list.</p>" },
    { k: ["price", "cost", "how much", "rate", "quote", "quotation", "budget", "package"],
      a: "<p>Every trip is quoted individually: the price depends on destination, dates, hotel class and headcount. You receive an <b>itemised proposal</b> with corporate rates where they apply, and official invoices in your company's name.</p>" + COORD },
    { k: ["group", "delegation", "chamber", "association", "mice", "conference", "incentive", "pax", "people", "team"],
      a: "<p>We handle teams of every size: <b>1–3</b> (lean sourcing trips), <b>4–9</b> (private van, bilingual coordinator) and <b>10+</b> delegations (group visas, seat blocks, coaches, business dinners, charter on request).</p>" + COORD },
    { k: ["invoice", "receipt", "or", "official receipt", "finance", "accounting", "payment", "pay", "terms"],
      a: "<p>Invoices and official receipts are issued in your company's name. Nothing is paid on the website: payment terms are agreed in writing before anything is booked.</p>" },
    { k: ["interpreter", "translator", "factory", "supplier", "audit", "visit", "transport", "van", "driver"],
      a: "<p>We book <b>bilingual interpreters</b> by the half or full day, plus private vans, drivers and routing for <b>factory visits</b> around the fair or your meetings.</p>" },
    { k: ["flight", "hotel", "airline", "cebu", "manila", "davao", "clark", "book"],
      a: "<p>We book flights and business hotels to your travel policy, with departures from Cebu, Manila, Clark and Davao, and handle changes for you.</p>" },
    { k: ["coordinator", "contact", "speak", "call", "human", "agent", "email", "phone", "talk"], a: COORD },
    { k: ["who", "about", "company", "immaculate", "office", "address", "where"],
      a: "<p>ExpoBusiness Travel Services is a subsidiary of <b>Immaculate Connections</b>, a travel company in Cebu City. Our office: " + ((S.contact && S.contact.address) || "Cebu City") + ".</p>" },
  ];
  const norm = s => s.toLowerCase().replace(/[^a-z0-9+ ]/g, " ");
  function answer(text) {
    const t = " " + norm(text) + " ";
    let best = null, score = 0;
    KB.forEach(item => {
      const s = item.k.reduce((n, k) => n + (t.includes(" " + k + " ") || (k.length > 4 && t.includes(k)) ? k.length : 0), 0);
      if (s > score) { score = s; best = item; }
    });
    return best || { a: "<p>I don't have a ready answer for that.</p>" + COORD, q: ["China M visa timeline", "Canton Fair 2027 dates"] };
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
    const perTick = Math.max(1, Math.ceil(total / 260)); // ~22 ms a letter, long answers capped near 6 s
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
    timer = setTimeout(() => { dots.replaceWith(m); m.classList.add("cc-typing-on"); tick(); }, 550 + Math.min(500, total * 2));
  }
  function ask(q) { if (typing) typing.finish(); add(q, "me"); const r = answer(q); add(r.a, "bot", r.q); }
  let started = false;
  function toggle(open) {
    panel.classList.toggle("on", open); fab.setAttribute("aria-expanded", open);
    if (open && !started) { started = true; add("<p>Welcome to ExpoBusiness. I can provide current M-Visa processing timelines, Canton Fair dates, or connect you with a corporate travel coordinator.</p>", "bot", ["China M visa timeline", "Canton Fair 2027 dates", "Speak to a coordinator"]); }
    if (open) input.focus(); else fab.focus();
  }
  fab.addEventListener("click", () => toggle(!panel.classList.contains("on")));
  panel.querySelector(".cc-x").addEventListener("click", () => toggle(false));
  addEventListener("keydown", e => { if (e.key === "Escape" && panel.classList.contains("on")) toggle(false); });
  form.addEventListener("submit", e => { e.preventDefault(); const v = input.value.trim(); if (v) { input.value = ""; ask(v); } });
})();
