// "Expo" — the built-in Canton Fair assistant.
// Runs fully in the browser: no API key, no data leaves the page.
// Tolerant by design: typos (edit distance), word stems, Taglish, run-together questions,
// follow-ups ("how much?" after "visa") and two-topic questions ("dates and hotels?").

(() => {
  /* ---------------- knowledge base ---------------- */
  const INQ = '<a href="inquiry.html">send an inquiry</a>';
  const KB = [
    { id: "greet", k: ["hi", "hello", "hey", "good morning", "good afternoon", "good evening", "kumusta", "musta", "yo", "sup"], small: true,
      a: "<p>Hi! I'm Expo, the Canton Fair assistant. Ask me about dates, phases, buyer badges, visas, hotels, packages or first-timer tips.</p>",
      q: ["When is the next Canton Fair?", "What's sold in each phase?", "How do I get a buyer badge?"] },
    { id: "thanks", k: ["thanks", "thank you", "ty", "salamat", "appreciate", "great", "nice", "awesome", "ok thanks"], small: true,
      a: "<p>You're welcome! Anything else about the trip? When you're ready, " + INQ + " and our team will prepare a quotation.</p>" },
    { id: "bye", k: ["bye", "goodbye", "see you", "later", "paalam"], small: true,
      a: "<p>Thanks for chatting. See you in Guangzhou!</p>" },

    { id: "what", k: ["what is canton fair", "canton fair", "china import export fair", "about the fair", "what fair", "explain fair", "trade fair"],
      a: "<p>The <b>Canton Fair</b> (China Import and Export Fair) is China's largest trade fair, running since 1957 in <b>Guangzhou</b>. Thousands of Chinese manufacturers and exporters exhibit to buyers from around the world.</p><p>It runs twice a year, spring (April–May) and autumn (October–November), and each session is split into <b>three phases</b> by product category.</p>",
      q: ["What's sold in each phase?", "When is the next session?"] },
    { id: "dates", k: ["when", "date", "dates", "schedule", "next fair", "next session", "spring", "autumn", "kailan", "calendar", "session", "upcoming"],
      a: "<p>The fair runs twice a year in three phases of about 5 days each:</p><ul><li><b>Autumn 2026</b> (140th): Phase 1 Oct 15–19 · Phase 2 Oct 23–27 · Phase 3 Oct 31–Nov 4</li><li><b>Spring 2027</b> (141st, expected): Phase 1 Apr 15–19 · Phase 2 Apr 23–27 · Phase 3 May 1–5</li></ul><p class='msg-note'>The organiser confirms the exact dates every session. We check them before we book anything.</p>",
      q: ["What's sold in each phase?", "How early should I book?"] },
    { id: "phases", k: ["phase", "phases", "category", "categories", "products", "what sold", "what can i buy", "which phase", "electronics", "furniture", "textile", "garments", "toys", "machinery", "lighting", "hardware", "gifts", "kitchen", "home decor", "building materials", "food", "shoes", "bags", "phase 1", "phase 2", "phase 3"],
      a: "<p>Each phase covers different industries:</p><ul><li><b>Phase 1</b>: electronics and appliances, lighting, machinery, hardware and tools, vehicles and new energy, building and industrial products.</li><li><b>Phase 2</b>: daily consumer goods, kitchenware, gifts, home decor, furniture, building and garden products.</li><li><b>Phase 3</b>: textiles and garments, shoes and bags, toys and baby products, office supplies, health, recreation and food.</li></ul><p>Tell us what you buy and we'll match you to the right phase.</p>",
      q: ["Can I attend two phases?", "Can you arrange factory visits?"] },
    { id: "multi", k: ["two phases", "multiple phases", "all phases", "whole session", "both phases", "stay longer", "extend"],
      a: "<p>Yes. Many buyers book two phase itineraries back to back, for example Phase 1 lighting and Phase 2 furniture. Tell us your product range and we'll combine the right phases. See <a href='itineraries.html?event=canton'>phase itineraries</a>.</p>" },
    { id: "venue", k: ["where", "venue", "location", "address", "complex", "pazhou", "guangzhou", "hall", "saan", "how to get there", "metro", "subway", "transport", "taxi", "didi", "getting around", "sasakyan"],
      a: "<p>The fair is held at the <b>China Import and Export Fair Complex</b> in <b>Pazhou, Haizhu District, Guangzhou</b>. Metro Line 8 stops right at the complex (Xingangdong and Pazhou stations).</p><p>Our packages include airport transfers. During the fair we arrange hotel shuttles or private vans for groups, so you're not queueing for taxis.</p>",
      q: ["Where should I stay?", "Do you provide transfers?"] },
    { id: "badge", k: ["badge", "buyer badge", "register", "registration", "entry", "ticket", "pass", "admission", "pre register", "id", "access card", "buyer registration"],
      a: "<p>You need a <b>buyer badge</b> to enter. Overseas buyers pre-register online with their passport details and a photo, then collect the badge with their passport at the badge counters (or at partner hotels).</p><p>We handle pre-registration for everyone in your group and walk you through collecting the badge, so day one starts in the halls, not in a queue.</p>",
      q: ["Do I need an invitation letter?", "What do I need for a China visa?"] },
    { id: "invite", k: ["invitation", "invitation letter", "invite", "letter"],
      a: "<p>An <b>invitation letter</b> supports your China business visa. Registered buyers can get one through the fair's buyer system, or a Chinese supplier can issue it. We arrange this as part of our visa service.</p>" },
    { id: "visa-china", k: ["visa", "china visa", "chinese visa", "m visa", "business visa", "visa requirements", "visa free", "transit", "embassy", "consulate", "requirements", "documents", "papers", "kailangan"],
      a: "<p>Philippine passport holders need a <b>China visa</b>. For the fair it's usually the <b>M (business) visa</b>. Typical requirements:</p><ul><li>Passport valid 6+ months with blank pages</li><li>Online application form and a recent photo</li><li>Invitation letter (fair or Chinese company)</li><li>Company or employment certificate</li><li>Flight and hotel details, bank statement if asked</li></ul><p>Regular processing is about 4 working days after submission, with express options. See the full checklist on our <a href='visa.html#china'>visa page</a>.</p><p class='msg-note'>Rules change. We confirm the current requirements before you apply.</p>",
      q: ["How much is the visa?", "How early should I apply?"] },
    { id: "visa-japan", k: ["japan", "japan visa", "japanese visa", "tokyo", "osaka"],
      a: "<p>Philippine passport holders need a visa for Japan, filed through <b>embassy-accredited agencies</b>. For business trips you'll usually need an invitation or guarantee letter from the Japanese company, plus your PSA birth certificate, bank certificate and ITR. Processing is roughly 5–7 working days after filing. Details are on our <a href='visa.html#japan'>visa page</a>.</p>" },
    { id: "visa-usa", k: ["usa", "us visa", "america", "american visa", "b1", "b2", "ds160", "ds 160", "united states", "interview"],
      a: "<p>A <b>B1/B2 visa</b> covers US business events and trade shows. The steps: fill in the DS-160 online, pay the visa fee, book the interview at the US Embassy in Manila, then attend with proof of strong ties (business, employment, finances). We help with the forms, appointment booking and interview prep. See our <a href='visa.html#usa'>visa page</a>.</p>" },
    { id: "price", k: ["price", "cost", "how much", "rate", "rates", "fee", "fees", "budget", "magkano", "presyo", "expensive", "cheap", "package price", "quotation", "quote", "estimate"],
      a: "<p>The price depends on the <b>phase and dates</b>, your <b>departure city</b>, <b>hotel class</b> and <b>group size</b>. Hotels near the venue cost much more during fair weeks, so booking early saves the most.</p><p>Quotations are free and we never take payment on the website. " + INQ + " and we'll reply with a full breakdown.</p>",
      q: ["What's included in a package?", "Group discounts?"] },
    { id: "packages", k: ["package", "packages", "itinerary", "itineraries", "tour", "tours", "include", "included", "inclusions", "what included", "days", "how many days", "ilang araw", "duration", "how long", "trip", "trips"],
      a: "<p>We run one itinerary per Canton Fair phase, each 5 days 4 nights: arrive the day before, three full fair days, fly home. Each includes return flights, a hotel near the venue, transfers, buyer badge registration, visa assistance and an on-site coordinator, with interpreters on request.</p><p>We also plan trips to other China trade expos in Guangzhou, Shanghai, Hong Kong, Shenzhen, Yiwu and Nanning. See <a href='itineraries.html'>Itineraries</a>.</p>" },
    { id: "hotel", k: ["hotel", "hotels", "stay", "accommodation", "where to stay", "room", "tutuluyan", "lodging", "tianhe", "near venue"],
      a: "<p>We book hotels near the <b>Pazhou complex</b> (walk or short shuttle) or in <b>Tianhe / Zhujiang New Town</b> (more dining and nightlife, one metro line away). Rooms sell out and prices jump during fair weeks, so the earlier we lock them in, the better.</p>" },
    { id: "flight", k: ["flight", "flights", "fly", "airline", "airport", "manila", "cebu", "clark", "davao", "ticket", "plane", "baggage"],
      a: "<p>There are direct flights from <b>Manila</b> to Guangzhou Baiyun. From <b>Cebu, Clark or Davao</b> we route you through Manila or another connecting city, whichever fits your dates and budget. We can also book extra baggage for samples.</p>" },
    { id: "interpreter", k: ["interpreter", "translator", "translation", "language", "english", "mandarin", "chinese language", "cantonese", "speak", "communicate"],
      a: "<p>Many exhibitors speak some English, but for serious negotiation an <b>English–Mandarin interpreter or sourcing assistant</b> makes a big difference. We book them by half or full day, and they can also join factory visits. Book early, since good ones are reserved fast during the fair.</p>" },
    { id: "factory", k: ["factory", "factories", "factory visit", "supplier", "suppliers", "manufacturer", "verify", "audit", "foshan", "dongguan", "zhongshan", "shenzhen", "yiwu", "sourcing", "market"],
      a: "<p>We arrange <b>factory visits</b> before or after the fair. Some common clusters near Guangzhou:</p><ul><li><b>Foshan</b>: furniture and ceramics</li><li><b>Zhongshan</b>: lighting</li><li><b>Dongguan / Shenzhen</b>: electronics and manufacturing</li><li><b>Yiwu</b>: small commodities wholesale market</li></ul><p>Send us the supplier's name and address and we'll plan the transport and an interpreter.</p>" },
    { id: "payment", k: ["payment", "pay", "money", "cash", "currency", "rmb", "yuan", "alipay", "wechat pay", "credit card", "card", "atm", "exchange", "peso", "gcash", "maya", "visa card", "mastercard"],
      a: "<p>China runs on mobile payments. <b>Alipay</b> and <b>WeChat Pay</b> both accept international cards now, so set them up before you fly. Bring some <b>RMB cash</b> as a backup. Don't count on GCash or Maya being accepted.</p><p>For supplier orders, terms are usually a deposit plus a balance before shipment. Never pay 100% upfront to a supplier you haven't verified.</p>" },
    { id: "internet", k: ["internet", "wifi", "sim", "esim", "data", "roaming", "facebook", "google", "whatsapp", "messenger", "gmail", "vpn", "blocked", "wechat", "apps"],
      a: "<p>Google, Facebook, Messenger and WhatsApp are blocked on local Chinese networks. Most travellers use <b>international roaming or a travel eSIM</b> (data routes outside China) and install <b>WeChat</b> before flying. Suppliers will ask for your WeChat.</p>" },
    { id: "bring", k: ["bring", "pack", "packing", "prepare", "checklist", "what to bring", "needs", "plug", "adapter", "voltage", "business card", "business cards", "dala"],
      a: "<p>A practical packing list:</p><ul><li>Passport, visa, badge confirmation</li><li>Lots of <b>business cards</b> (or a WeChat QR code)</li><li>Comfortable shoes, since the halls are huge</li><li>Power bank and a plug adapter (China uses 220V, types A/C/I)</li><li>Product photos, specs and target prices</li><li>A notebook or phone app to log booth numbers</li></ul>" },
    { id: "weather", k: ["weather", "temperature", "climate", "rain", "hot", "cold", "panahon", "wear", "clothes"],
      a: "<p>Guangzhou is subtropical. <b>Spring</b> (Apr–May) is warm and humid, often rainy, around 22–30°C. <b>Autumn</b> (Oct–Nov) is the most pleasant, around 18–28°C and drier. Light business wear and an umbrella are enough.</p>" },
    { id: "time", k: ["timezone", "time zone", "time difference", "oras"],
      a: "<p>No jet lag: Guangzhou is <b>GMT+8</b>, the same time as the Philippines.</p>" },
    { id: "tips", k: ["tips", "tip", "first time", "first timer", "advice", "beginner", "newbie", "how to", "strategy", "negotiate", "negotiation", "moq", "minimum order", "paano"],
      a: "<p>First-timer tips from our coordinators:</p><ul><li>Pick the right <b>phase</b> and map your halls the night before</li><li>Arrive early. Mornings are calmer.</li><li>Photograph each booth number with the supplier's card</li><li>Compare at least 3 suppliers before you commit</li><li>Ask for the <b>MOQ</b>, lead time, payment terms and samples</li><li>Never pay in full upfront. Verify the supplier first.</li></ul>" },
    { id: "shipping", k: ["shipping", "ship", "cargo", "freight", "forwarder", "logistics", "import", "customs", "door to door", "consolidation", "padala", "samples", "sample", "send samples"],
      a: "<p>We work with freight forwarders to coordinate <b>sample and cargo shipping</b> from China to the Philippines, by air for samples or by sea for bulk. Tell us the supplier and the volume and we'll connect you with a forwarder for a quote.</p>" },
    { id: "group", k: ["group", "groups", "delegation", "company trip", "team", "corporate", "employees", "members", "association", "chamber", "discount", "group discount", "pax", "people", "minimum"],
      a: "<p>Groups are our speciality. For company, association and chamber delegations we arrange charter-style coordination, a group visa filing, a dedicated coordinator and interpreters. Larger groups get better rates on hotels and transfers. " + INQ + " with your headcount.</p>" },
    { id: "ciie", k: ["ciie", "import expo", "shanghai", "hong kong", "hongkong", "hk", "shenzhen", "expo", "expos", "other expo", "other fairs", "exhibition", "trade show", "east china fair", "2027", "next year", "ciff", "furniture fair", "gile", "lighting fair", "hotelex", "auto shanghai", "auto show", "yiwu fair", "china asean", "caexpo", "nanning", "ciif", "furniture china", "hktdc", "electronics fair", "toys fair", "gifts fair", "beauty expo", "hi-tech fair"],
      a: "<p>Besides the Canton Fair, we plan trips to upcoming China trade expos:</p><ul><li><b>Hong Kong</b>: Toys &amp; Games Fair (Jan), Electronics Fair, Lighting Fair and Gifts &amp; Premium Fair (spring)</li><li><b>Guangzhou</b>: CIFF furniture and the Beauty Expo (Mar), GILE lighting (Jun)</li><li><b>Shanghai</b>: East China Fair (Mar), HOTELEX and Auto Shanghai (spring), CIIF and Furniture China (Sep), CIIE (Nov)</li><li><b>Shenzhen</b>: China Hi-Tech Fair (Nov)</li><li><b>Yiwu and Nanning</b>: Yiwu Fair (Oct), China-ASEAN Expo (Sep)</li></ul><p>Months follow each show's usual slot; exact dates are confirmed when organisers publish them. Philippine passport holders can visit Hong Kong visa-free. See <a href='itineraries.html?event=expo'>China expos</a>.</p>",
      q: ["Hong Kong fairs", "Canton Fair dates"] },
    { id: "industry", k: ["industry", "industries", "my industry", "which phase for", "my products", "what phase", "sector", "hall", "halls", "hardware", "construction", "hotel supply", "restaurant", "horeca", "retail", "ecommerce", "e-commerce"],
      a: "<p>Each industry has its own phase, halls and factory clusters. Our industry guides cover electronics, machinery, lighting, construction, furniture, hotel and restaurant supply, fashion and retail. Start at <a href='industries.html'>Industries</a>, or filter <a href='itineraries.html'>itineraries</a> by industry.</p>",
      q: ["What's sold in each phase?", "Factory visits"] },
    { id: "booking", k: ["book", "booking", "reserve", "how to book", "when to book", "how early", "deadline", "advance", "process", "steps", "start"],
      a: "<p>Book <b>2–3 months ahead</b> for the best hotels and fares, and allow at least <b>3–4 weeks</b> for the visa. The process:</p><ul><li>Send an inquiry</li><li>Get a free quotation</li><li>Confirm, then submit visa documents</li><li>Fly. We meet you in Guangzhou.</li></ul><p><a href='inquiry.html'>Start your inquiry</a></p>" },
    { id: "cancel", k: ["cancel", "cancellation", "refund", "change", "rebook", "reschedule", "insurance"],
      a: "<p>Changes and refunds depend on the airline and hotel rules for each booking. We explain them clearly in your quotation <b>before</b> you confirm. Travel insurance is strongly recommended and we can include it.</p>" },
    { id: "safety", k: ["safe", "safety", "security", "scam", "danger", "crime"],
      a: "<p>Guangzhou is generally safe for business travellers. The main risk is commercial, not physical: verify suppliers, use written contracts and avoid paying everything upfront. Our coordinator is reachable 24/7 during your trip.</p>" },
    { id: "food", k: ["food", "eat", "restaurant", "halal", "vegetarian", "pagkain", "lunch", "dimsum", "dim sum"],
      a: "<p>The complex has food courts and cafés, and Guangzhou is the home of Cantonese cuisine and dim sum. Tell us about dietary needs (halal, vegetarian, allergies) and we'll suggest places near your hotel.</p>" },
    { id: "who", k: ["who are you", "company", "about you", "expobusiness", "legit", "accredited", "office", "contact", "phone", "email", "call", "human", "agent", "person", "talk to someone", "viber", "whatsapp number"],
      a: "<p><b>ExpoBusiness Travel Services</b> is a B2B travel team for the Canton Fair and China trade expos. To talk to a person, use the <a href='inquiry.html'>inquiry page</a>. Our contact details are listed there.</p>" },
    { id: "services", k: ["services", "service", "what do you do", "offer", "help with", "assist"],
      a: "<p>We handle the whole business trip: buyer badge registration, invitation letters, visas (China, Japan, USA), flights, hotels near the venue, transfers, interpreters, factory visits and shipping coordination. See <a href='services.html'>Services</a>.</p>" },
  ];

  // Taglish + shorthand → canonical words.
  const SYN = {
    kailan: "when", kelan: "when", magkano: "price", presyo: "price", halaga: "price", bayad: "payment",
    saan: "where", san: "where", nasaan: "where", paano: "how", pano: "how", kailangan: "requirements",
    reqs: "requirements", req: "requirements", reqts: "requirements", requirment: "requirements",
    tutuluyan: "hotel", hotell: "hotel", htl: "hotel", araw: "days", ilang: "how many", pwede: "can", puwede: "can",
    sasakyan: "transport", pagkain: "food", panahon: "weather", dala: "bring", padala: "shipping",
    cantonfair: "canton fair", cf: "canton fair", canton: "canton fair", gz: "guangzhou", ph: "philippines",
    pls: "please", plz: "please", u: "you", ur: "your", r: "are", hw: "how", wen: "when", wat: "what", wht: "what",
    visas: "visa", vissa: "visa", vsa: "visa", dates: "date", hotels: "hotel", flights: "flight", phases: "phase",
    ty: "thanks", tnx: "thanks", thx: "thanks", salamat: "thanks", hm: "how much", hmm: "", ok: "ok",
    "1st": "first", p1: "phase 1", p2: "phase 2", p3: "phase 3", us: "usa", jp: "japan", cn: "china",
  };
  const STOP = new Set("a an the is are am be to of for in on at and or i me my we our you your it this that do does can could would should will please about with from there what which any some get got have has need want know tell".split(" "));

  /* ---------------- matching ---------------- */
  const norm = s => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/(.)\1{2,}/g, "$1$1").replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
  const expand = s => norm(s).split(" ").map(w => (w in SYN ? SYN[w] : w)).join(" ").split(" ").filter(Boolean);
  const stem = w => w.length > 4 ? w.replace(/(ings|ing|ies|es|s|ed)$/, "") : w;

  function dist(a, b) { // Damerau-Levenshtein (optimal string alignment)
    const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
    for (let j = 1; j <= b.length; j++) d[0][j] = j;
    for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) {
      const c = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + c);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
    }
    return d[a.length][b.length];
  }
  function wordSim(u, k) {
    if (u === k) return 1;
    const su = stem(u), sk = stem(k);
    if (su === sk) return .95;
    if (u.length >= 4 && k.length >= 4 && (k.startsWith(u) || u.startsWith(k))) return .85;
    const max = Math.max(u.length, k.length);
    if (max < 4) return 0;
    const dd = dist(su, sk);
    if (dd === 1) return .8;
    if (dd === 2 && max >= 7) return .65;
    return 0;
  }

  // Pre-tokenise keywords once.
  KB.forEach(e => (e.kt = e.k.map(p => expand(p))));

  function score(tokens, entry) {
    const content = tokens.filter(t => !STOP.has(t));
    const useTokens = content.length ? content : tokens;
    let best = 0, hits = new Set();
    for (const phrase of entry.kt) {
      const words = phrase.filter(w => !STOP.has(w));
      const ws = words.length ? words : phrase;
      let sum = 0, all = true;
      for (const w of ws) {
        let m = 0, at = -1;
        useTokens.forEach((t, i) => { const s = wordSim(t, w); if (s > m) { m = s; at = i; } });
        if (m < .6) all = false; else { sum += m; hits.add(at); }
      }
      const s = all ? sum * (1 + .35 * (ws.length - 1)) : sum * .4;
      best = Math.max(best, s);
    }
    // Reward covering more of what the user typed, so specific topics beat generic ones.
    return best + hits.size * .15 - (entry.small && useTokens.length > 3 ? .6 : 0);
  }

  // Question words say what kind of answer is wanted: "when" wants dates, "how much" wants a price.
  function hint(tokens, id) {
    const has = w => tokens.includes(w);
    if (id === "dates" && has("when") && !has("visa") && !has("book")) return 2.2;
    if (id === "visa-china" && has("visa") && !has("japan") && !has("usa")) return .5;
    if (id === "price" && (has("price") || (has("how") && has("much")))) return .8;
    if (id === "weather" && (has("weather") || has("temperature"))) return .6;
    return 0;
  }

  let lastTopic = null;
  function answer(text) {
    const tokens = expand(text);
    if (!tokens.length) return { a: "<p>Type a question about the Canton Fair, for example <i>when is phase 2?</i></p>" };
    const ranked = KB.map(e => ({ e, s: score(tokens, e) + hint(tokens, e.id) })).sort((a, b) => b.s - a.s);
    const [top, second] = ranked;

    // Short follow-ups like "how much?" or "requirements?" lean on the last topic.
    if (lastTopic && tokens.length <= 4 && top.s < 1.6) {
      const t = lastTopic;
      if (top.e.id === "price" && t.startsWith("visa"))
        return { e: top.e, a: "<p>Visa fees depend on the visa type, entry count and processing speed, and embassies revise them. We give you the current official fee plus our service fee in your quotation. " + INQ + ".</p>" };
      if (top.e.id === "visa-china" && (t === "visa-japan" || t === "visa-usa")) return { e: KB.find(x => x.id === t), a: KB.find(x => x.id === t).a };
    }
    if (top.s < .75) return null;
    const out = [top.e];
    if (second && second.s >= .9 && second.s >= top.s * .7 && !second.e.small && !top.e.small) out.push(second.e);
    lastTopic = top.e.id;
    return { e: top.e, a: out.map(x => x.a).join(""), q: top.e.q, near: ranked.slice(1, 4).map(r => r.e) };
  }

  const LABEL = { industry: "Industry guides", ciie: "China expos 2027", dates: "Fair dates", phases: "Phases & products", badge: "Buyer badge", "visa-china": "China visa", price: "Prices", packages: "Packages", hotel: "Hotels", venue: "Venue & transport", factory: "Factory visits", tips: "First-timer tips", interpreter: "Interpreters", payment: "Paying in China", internet: "Internet & apps", group: "Group trips", shipping: "Shipping", bring: "What to bring" };

  /* ---------------- UI ---------------- */
  const SVG = id => `<svg class="icon" aria-hidden="true"><use href="#i-${id}"/></svg>`;
  const launch = document.createElement("button");
  launch.className = "bot-launch"; launch.type = "button";
  launch.setAttribute("aria-label", "Open the Canton Fair assistant");
  launch.innerHTML = `<span class="bot-face">${SVG("chat")}</span><span class="bot-label">Ask about the fair</span>`;

  const panel = document.createElement("section");
  panel.className = "bot"; panel.setAttribute("aria-label", "Canton Fair assistant"); panel.setAttribute("role", "dialog");
  panel.innerHTML = `
    <header class="bot-head">
      <span class="bot-face">${SVG("spark")}</span>
      <div><b>Expo · Canton Fair assistant</b><small>Answers instantly, typos welcome</small></div>
      <button type="button" class="bot-close" aria-label="Close assistant">${SVG("close")}</button>
    </header>
    <div class="bot-log" aria-live="polite"></div>
    <div class="bot-quick"></div>
    <form class="bot-form">
      <label class="sr-only" for="botInput">Your question</label>
      <input id="botInput" autocomplete="off" placeholder="e.g. kailan phase 2? visa reqs?" maxlength="300">
      <button type="submit" aria-label="Send">${SVG("send")}</button>
    </form>`;
  document.body.append(launch, panel);

  const log = panel.querySelector(".bot-log");
  const quick = panel.querySelector(".bot-quick");
  const input = panel.querySelector("input");
  let history = [];
  try { history = JSON.parse(sessionStorage.getItem("expoBot") || "[]"); } catch { history = []; }
  const save = () => { try { sessionStorage.setItem("expoBot", JSON.stringify(history.slice(-30))); } catch {} };

  function bubble(html, who, store = true) {
    const div = document.createElement("div");
    div.className = "msg msg-" + who;
    if (who === "user") div.textContent = html; else div.innerHTML = html;
    log.append(div);
    log.scrollTop = log.scrollHeight;
    if (store) { history.push({ who, html }); save(); }
  }
  function setQuick(list) {
    quick.innerHTML = "";
    (list || []).forEach(t => {
      const b = document.createElement("button");
      b.type = "button"; b.textContent = t;
      b.addEventListener("click", () => ask(t));
      quick.append(b);
    });
  }
  const DEFAULT_Q = ["When is the next fair?", "What's in each phase?", "China visa requirements", "How much is a package?", "First-timer tips"];

  function ask(text) {
    text = text.trim();
    if (!text) return;
    bubble(text, "user");
    input.value = "";
    const typing = document.createElement("div");
    typing.className = "msg msg-bot typing"; typing.innerHTML = "<i></i><i></i><i></i>";
    log.append(typing); log.scrollTop = log.scrollHeight;
    const res = answer(text);
    setTimeout(() => {
      typing.remove();
      if (res) {
        bubble(res.a, "bot");
        setQuick(res.q || DEFAULT_Q);
      } else {
        const near = KB.map(e => ({ e, s: score(expand(text), e) })).filter(r => !r.e.small && LABEL[r.e.id]).sort((a, b) => b.s - a.s).slice(0, 3);
        bubble("<p>I'm not 100% sure I got that. Did you mean one of these? You can also " + INQ + " and a coordinator will answer personally.</p>", "bot");
        setQuick(near.map(r => LABEL[r.e.id]).concat(["Talk to a person"]));
      }
    }, reduceMotionBot ? 0 : 450 + Math.min(900, (res?.a.length || 120) * 1.2));
  }
  const reduceMotionBot = matchMedia("(prefers-reduced-motion: reduce)").matches;

  function open() {
    panel.classList.add("is-open"); launch.classList.add("is-open");
    if (!log.childElementCount) {
      if (history.length) history.forEach(h => bubble(h.html, h.who, false));
      else bubble(KB[0].a, "bot");
      setQuick(DEFAULT_Q);
    }
    setTimeout(() => input.focus(), 250);
  }
  function close() { panel.classList.remove("is-open"); launch.classList.remove("is-open"); launch.focus(); }

  launch.addEventListener("click", open);
  panel.querySelector(".bot-close").addEventListener("click", close);
  panel.addEventListener("keydown", e => { if (e.key === "Escape") close(); });
  panel.querySelector("form").addEventListener("submit", e => { e.preventDefault(); ask(input.value); });
  document.querySelectorAll("[data-open-bot]").forEach(b => b.addEventListener("click", e => {
    e.preventDefault(); open();
    if (b.dataset.openBot) setTimeout(() => ask(b.dataset.openBot), 300);
  }));

  const foot = document.querySelector(".footer");
  if (foot) new IntersectionObserver(([en]) => launch.classList.toggle("is-away", en.isIntersecting), { rootMargin: "0px 0px -40% 0px" }).observe(foot);

  window.ExpoBot = { answer, open, ask }; // handy for testing in the console
})();
