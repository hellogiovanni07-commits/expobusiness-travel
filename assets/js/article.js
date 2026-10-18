// Expo article: event.html?e=<slug>. Builds the guide from the expo's data entry, so new data = new article.
(() => {
  const X = window.EXPOS; const root = document.getElementById("article"); if (!X || !root) return;
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const svg = id => `<svg class="icon" aria-hidden="true"><use href="#i-${id}"/></svg>`;
  const slug = new URLSearchParams(location.search).get("e");
  const e = slug && X.bySlug(slug);
  if (!e) return; // the static fallback in event.html lists the guides

  const isCN = e.cat === "China", isHK = e.cat === "Hong Kong";
  // "annual" / "Twice yearly (spring and autumn)" -> readable phrases
  const f0 = (e.frequency || "").toLowerCase();
  const freq = f0.replace(/^annual/, "every year").replace(/^twice yearly/, "twice a year").replace(/^biennial/, "every two years").replace(/^roughly biennial/, "roughly every two years");
  const cap = t => t ? t[0].toUpperCase() + t.slice(1) : t;
  const trip = (window.ITINERARIES || []).find(t => (e.canton && t.event === "canton") ? false : t.event === "expo" && (t.short === e.short || (t.title || "").toLowerCase().startsWith((e.short || "~").toLowerCase())));
  const cantonTrips = e.canton ? (window.ITINERARIES || []).filter(t => t.event === "canton") : [];

  // ---- head + meta
  const title = `${e.name}: 2027 guide for Philippine buyers`;
  document.title = `${e.short || e.name} 2027 guide · ExpoBusiness`;
  const md = document.querySelector('meta[name="description"]'); if (md) md.content = `${e.name}, ${e.when}, ${e.city}. ${e.why}`.slice(0, 160);
  document.getElementById("evPhoto").src = X.photo(e, 2000);
  document.getElementById("evCrumb").innerHTML = `<a href="index.html">Home</a><span>/</span><a href="world-expos.html">Expo articles</a><span>/</span><a href="world-expos.html?cat=${encodeURIComponent(e.cat)}">${esc(e.cat)}</a>`;
  document.getElementById("evKicker").textContent = `${e.cat}${e.cat !== e.city ? " · " + e.city : ""} · ${X.MONTHS[e.mi]} 2027`;
  document.getElementById("evTitle").textContent = title;
  document.getElementById("evDek").textContent = `${e.name} runs ${e.when} in ${e.city}${e.venue ? ", at " + e.venue : ""}. Who should go, what is on the floor and how to plan the trip from Manila.`;
  document.getElementById("evMeta").innerHTML = `<li>${svg("calendar")}${esc(e.when)}</li><li>${svg("pin")}${esc(e.city)}, ${esc(e.country)}</li><li>${svg("clock")}${e.read} min read</li><li class="ev-st ${e.dates_status === "confirmed" ? "ok" : ""}">${e.dates_status === "confirmed" ? "Dates confirmed" : "Expected dates"}</li>`;

  // ---- body sections
  const sectors = (e.sectors || "").split(/,|·/).map(s => s.trim().replace(/^P\d\s+/, "")).filter(Boolean).map(s => s[0].toUpperCase() + s.slice(1));
  const visa = isCN
    ? (e.city === "Haikou"
      ? `<p>Philippine passport holders can enter <b>Hainan visa-free for up to 30 days</b> for business visits, which covers this expo. Travelling on to the mainland needs a China visa.</p>`
      : `<p>Philippine passports need a <b>China M (business) visa</b>. The order is invitation letter first, then the visa application, so allow <b>4–6 weeks</b> before you fly. We check documents, file and track it. <a href="visa.html">How our visa help works</a>.</p>`)
    : isHK ? `<p>Philippine nationals can visit <b>Hong Kong visa-free for up to 14 days</b>. If you also go to Guangzhou or Shenzhen, get a <b>double or multiple-entry China visa</b>: re-entering the mainland after Hong Kong counts as a new entry.</p>`
    : `<p>Visa rules depend on the destination and change often. We confirm the current requirements for Philippine passports when we quote, and list official fees separately.</p>`;
  const canton = e.canton ? `<h2>Choosing a phase</h2><p>The fair runs in three phases of about five days, each with different halls. Most buyers need only one.</p>
      <ul class="ev-phases"><li><span class="tag-phase p1">Phase 1</span>Electronics, machinery, vehicles, lighting, hardware, new energy</li><li><span class="tag-phase p2">Phase 2</span>Housewares, gifts, furniture, building materials, ceramics</li><li><span class="tag-phase p3">Phase 3</span>Fashion, textiles, toys, food, health and personal care</li></ul>
      <p>Overseas buyers pre-register in the Canton Fair app or Buyer Service System; the invitation letter for your visa comes from the same system. See the <a href="china-expos.html#canton">Canton Fair guide</a> for the hall preview and countdown.</p>` : "";
  const near = X.all.filter(o => o !== e && Math.abs(o.mi - e.mi) <= 0 && (o.cat === e.cat || (isCN && o.cat === "Hong Kong") || (isHK && o.cat === "China"))).slice(0, 4);
  const related = X.all.filter(o => o !== e && (o.industries || [])[0] && (e.industries || []).includes(o.industries[0]) && !near.includes(o)).slice(0, 3);
  const mini = o => `<a class="ev-mini" href="${X.url(o)}"><span style="background-image:url('${X.photo(o, 400)}')"></span><div><small>${X.MON[o.mi]} 2027 · ${esc(o.city)}</small><b>${esc(o.name)}</b></div></a>`;

  document.getElementById("evBody").innerHTML = `
    <h2>Why Philippine companies go</h2>
    <p>${esc(e.why)} ${freq ? `The show runs ${esc(freq)}${e.organiser ? ` and is organised by ${esc(e.organiser)}` : ""}.` : ""}</p>
    <h2>What’s on the floor</h2>
    <ul class="ev-chips">${sectors.map(s => `<li>${esc(s)}</li>`).join("")}</ul>
    <h2>Who should go</h2>
    <p>Buyers, importers and distributors in these sectors get the most from a visit:</p>
    <p class="ev-ind">${X.industryLinks(e)}</p>
    ${canton}
    <h2>Planning the trip from Manila</h2>
    ${visa}
    <ul class="ev-steps">
      <li><b>${e.dates_status === "confirmed" ? "Dates are confirmed" : "Dates are expected"}</b>${e.dates_status === "confirmed" ? "The organiser has published them, so flights and hotels can be booked now." : "They follow the show’s usual timing. We hold options and confirm once the organiser publishes."}</li>
      <li><b>Book hotels early</b>Rooms near the venue go first in show week. Two to three months ahead is safe.</li>
      <li><b>Register as a visitor</b>Most trade shows want visitors to pre-register online; we do it for your whole group.</li>
    </ul>
    ${trip ? `<div class="ev-trip"><div><small>Ready-made trip</small><b>${esc(trip.title)}</b><span>${trip.days ? `${trip.days}D${trip.nights}N · ` : ""}${esc(trip.city || "")}</span></div><a class="btn btn-sm" href="itineraries.html?open=${trip.id}#${trip.id}">View itinerary ${svg("arrow")}</a></div>` : ""}
    ${cantonTrips.length ? `<div class="ev-trip"><div><small>Ready-made trips</small><b>One itinerary per Canton Fair phase</b><span>5D4N from Manila, Cebu, Clark or Davao</span></div><a class="btn btn-sm" href="itineraries.html?event=canton">See Canton Fair trips ${svg("arrow")}</a></div>` : ""}
    ${near.length ? `<h2>Combine it with</h2><p>Other shows the same month${isCN || isHK ? " in China and Hong Kong" : ` in ${esc(e.cat)}`}:</p><div class="ev-minis">${near.map(mini).join("")}</div>` : ""}
    <p class="ev-note">${e.dates_status === "confirmed" ? "Dates checked against the organiser." : "Expected dates are based on the show’s usual slot and listings; we recheck before selling a package."} Last researched October 2026.${e.url ? ` <a href="${esc(e.url)}" target="_blank" rel="noopener">Organiser’s site ${svg("arrow")}</a>` : ""}</p>`;

  // ---- sidebar facts
  const fact = (k, v) => v ? `<div><dt>${k}</dt><dd>${v}</dd></div>` : "";
  document.getElementById("evFacts").innerHTML = `
    <p class="ev-fh">At a glance</p>
    <dl>${fact("Dates", esc(e.when))}${fact("City", `${esc(e.city)}, ${esc(e.country)}`)}${fact("Venue", esc(e.venue))}${fact("Organiser", esc(e.organiser))}${fact("Runs", esc(cap(freq)))}${fact("Status", e.dates_status === "confirmed" ? "Confirmed" : "Expected")}</dl>
    <a class="btn" href="inquiry.html?expo=${encodeURIComponent(e.short || e.name)}">Plan this trip ${svg("arrow")}</a>
    ${e.url ? `<a class="btn btn-ghost" href="${esc(e.url)}" target="_blank" rel="noopener">Official site</a>` : ""}
    <button type="button" class="link-btn ev-share" id="evShare">${svg("send")}Copy link to this guide</button>`;
  document.getElementById("evShare").addEventListener("click", () => navigator.clipboard?.writeText(location.href).then(() => { document.getElementById("evShare").lastChild.textContent = "Link copied"; }));
  document.getElementById("evRelated").innerHTML = related.length ? `<h2 class="section-title">More ${esc(X.INDUSTRY[e.industries[0]] || "")} guides</h2><div class="ev-rel">${related.map(o => `<a class="ax-card ev-rcard" href="${X.url(o)}"><span class="ax-img"><span style="background-image:url('${X.photo(o, 700)}')"></span><i class="ax-date"><b>${X.MON[o.mi]}</b><small>2027</small></i></span><span class="ax-body"><span class="ax-kicker">${esc(o.cat)} · ${esc(o.city)}</span><b class="ev-rt">${esc(o.name)}</b><span class="ax-ex">${esc(o.why)}</span></span></a>`).join("")}</div>` : "";
  document.getElementById("evFallback")?.remove();
  root.hidden = false;

  // ---- structured data for search engines
  const ld = { "@context": "https://schema.org", "@type": "Event", name: e.name, description: e.why, eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode", startDate: e.month, image: X.photo(e, 1200),
    location: { "@type": "Place", name: e.venue || e.city, address: { "@type": "PostalAddress", addressLocality: e.city, addressCountry: e.country } },
    organizer: e.organiser ? { "@type": "Organization", name: e.organiser, url: e.url } : undefined, url: location.href };
  const s = document.createElement("script"); s.type = "application/ld+json"; s.textContent = JSON.stringify(ld); document.head.append(s);
})();
