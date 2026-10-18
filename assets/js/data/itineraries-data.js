// Itinerary catalogue (2027): the single source for the Itineraries page, home, industry pages and inquiry form.
// Canton Fair: one itinerary per phase, both 2027 sessions. Other expos: major China trade shows by city.
// Prices are quoted per group (no public price), so there is no price filter.
// Exact 2027 dates are confirmed when each organiser publishes them; until then we show the show's usual timing.

window.FAIR = {
  // Canton Fair dates live in data/site-config.js (SITE.canton.sessions).
  sessions: window.SITE.canton.sessions,
  industries: {
    electronics: "Electronics & appliances", machinery: "Machinery & industrial", lighting: "Lighting & electrical",
    construction: "Construction & hardware", furniture: "Furniture & home living", horeca: "Hotel, restaurant & café",
    fashion: "Fashion & textiles", retail: "Retail, toys & gifts",
  },
  inclusions: {
    airfare: "Airfare", hotel: "Hotel", badge: "Buyer badge", visa: "Visa assistance", transfers: "Transfers",
    interpreter: "Interpreter (optional)", coordinator: "On-site coordinator",
  },
  cities: ["Guangzhou", "Shanghai", "Hong Kong", "Shenzhen", "Yiwu", "Nanning"],
  // Event-banner palettes by city (Canton Fair phases use their own).
  palette: {
    Guangzhou: ["#c9460b", "#d7261e"], Shanghai: ["#1f2a6b", "#3b4cc0"], "Hong Kong": ["#7a1030", "#d7261e"],
    Shenzhen: ["#0f4c5c", "#1f8a8a"], Yiwu: ["#8a3a06", "#e0790b"], Nanning: ["#16463a", "#2f7f5f"],
  },
};

const IMG = id => `https://images.unsplash.com/photo-${id}?w=1000&q=72`;
const INC = ["airfare", "hotel", "badge", "visa", "transfers", "interpreter", "coordinator"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const CANTON = (p, title, industries, icon, img, sum, halls, highlights) => ({
  id: "phase-" + p, event: "canton", title, short: "Canton Fair", edition: `Phase ${p}`, phases: [p], city: "Guangzhou", rank: p,
  days: 5, nights: 4, depart: ["Manila", "Cebu", "Clark", "Davao"], industries, inc: INC, icon, img: IMG(img), sum,
  venue: "China Import and Export Fair Complex, Pazhou", org: "China Foreign Trade Centre",
  timing: "Spring: mid-April to early May · Autumn: mid-October to early November",
  highlights, who: "Importers, distributors, retailers and company buying teams in these categories.",
  plan: [["Manila – Guangzhou", "Arrival, transfer to a hotel near the Pazhou complex, badge collection, evening hall briefing."], [`Canton Fair · Phase ${p}`, halls[0]], [`Canton Fair · Phase ${p}`, halls[1]], [`Canton Fair · Phase ${p}`, "Follow-up meetings, quote comparison and sample requests."], ["Guangzhou – Manila", "Transfer to Guangzhou Baiyun airport."]],
});

window.ITINERARIES = [
  CANTON(1, "Canton Fair Phase 1 · Advanced manufacturing", ["electronics", "machinery", "lighting", "construction"], "chip", "1752155222944-675c2c3bfafd",
    "Electronics and appliances, machinery, vehicles, lighting and electrical, hardware and tools, and new energy. Three full fair days in Guangzhou.",
    ["Electronics, appliances and lighting halls.", "Machinery, hardware, tools and new energy halls."],
    ["The fair's largest phase for industrial and electrical buyers", "Hardware and tools in the same week as electronics", "Pairs with HK Electronics and Lighting Fairs in April"]),
  CANTON(2, "Canton Fair Phase 2 · Quality home living", ["furniture", "construction", "horeca", "retail"], "sofa", "1785123463585-1ba21ff9ff57",
    "Daily consumer goods, kitchenware and tableware, gifts and decorations, building materials and furniture. Three full fair days in Guangzhou.",
    ["Furniture and building-materials halls.", "Kitchenware, tableware, gifts and home decor halls."],
    ["Furniture, tiles, sanitary ware and decor under one roof", "Strong for hotel, restaurant and property projects", "Gift and seasonal suppliers for retail"]),
  CANTON(3, "Canton Fair Phase 3 · Better life", ["fashion", "retail", "horeca"], "shirt", "1711390811937-1b061eaf28ea",
    "Toys and baby products, fashion and garments, home textiles, stationery, health, recreation and food. Three full fair days in Guangzhou.",
    ["Fashion, shoes, bags and home textiles halls.", "Toys, baby products, stationery and food halls."],
    ["Garments, textiles, shoes and bags for apparel buyers", "Toys, baby and stationery for retail and e-commerce", "Home textiles and linens for hospitality"]),
];

// ---- Major China trade expos, 2027. Each recurs on a regular cycle (Auto Shanghai every odd year).
const E = o => Object.assign({ event: "expo", phases: [], inc: INC, nights: o.days - 1, img: IMG(o.img), depart: o.city === "Hong Kong" ? ["Manila", "Cebu", "Clark", "Davao"] : ["Manila", "Cebu"] }, o, { img: IMG(o.img) });
const d = (a, b) => [a, b];
const EXPO_TRIPS = [
  E({ id: "hk-toys", short: "HK Toys & Games Fair", edition: "January", title: "Hong Kong Toys & Games Fair", city: "Hong Kong", month: "2027-01", days: 4, industries: ["retail"], icon: "gift", img: "1596068587619-e4b11c7a3488",
    venue: "Hong Kong Convention and Exhibition Centre, Wan Chai", org: "Hong Kong Trade Development Council (HKTDC)", timing: "Usually the second week of January",
    sum: "Asia's big January toy fair, held alongside the Baby Products and Stationery fairs. Philippine passport holders can enter Hong Kong visa-free.",
    highlights: ["Toys, games, licensing and hobby products", "Baby Products and Stationery fairs in the same venue", "No China visa needed for Hong Kong"], who: "Toy importers, retailers and e-commerce sellers.",
    plan: [d("Manila – Hong Kong", "Arrival and fair briefing."), d("Toys & Games Fair", "Toys, games and licensing halls."), d("Baby & stationery fairs", "Baby products and stationery halls next door."), d("Hong Kong – Manila", "Morning meetings, then the airport.")] }),
  E({ id: "ciff-gz", short: "CIFF Guangzhou", edition: "March", title: "CIFF Guangzhou · China International Furniture Fair", city: "Guangzhou", month: "2027-03", days: 5, industries: ["furniture", "horeca", "construction"], icon: "sofa", img: "1687180497278-ca4d736ecc99",
    venue: "China Import and Export Fair Complex, Pazhou", org: "China Foreign Trade Centre", timing: "Two phases in March: home furniture, then office and commercial",
    sum: "Asia's leading furniture fair, held at the Canton Fair complex: home and office furniture, outdoor, materials and fittings.",
    highlights: ["Home, outdoor and hotel furniture", "Office and commercial furniture phase", "Add a day in Foshan's furniture malls"], who: "Furniture retailers, hotel and office fit-out buyers, interior firms.",
    plan: [d("Manila – Guangzhou", "Arrival, registration and briefing."), d("CIFF", "Home furniture and outdoor halls."), d("CIFF", "Office and hotel furniture."), d("Foshan", "Furniture malls and a factory visit."), d("Guangzhou – Manila", "Transfer to the airport.")] }),
  E({ id: "cibe", short: "CIBE Guangzhou", edition: "March", title: "China International Beauty Expo · Guangzhou", city: "Guangzhou", month: "2027-03", days: 4, industries: ["retail"], icon: "spark", img: "1598528738936-c50861cc75a9",
    venue: "China Import and Export Fair Complex, Pazhou", org: "CIBE organising committee", timing: "Usually March",
    sum: "One of China's largest beauty and cosmetics expos: skincare, cosmetics, salon equipment, packaging and OEM manufacturers.",
    highlights: ["Private-label skincare and cosmetics makers", "Packaging and raw-material suppliers", "Salon and spa equipment"], who: "Beauty brands, salons, distributors and private-label sellers.",
    plan: [d("Manila – Guangzhou", "Arrival and expo briefing."), d("Beauty Expo", "Skincare, cosmetics and private label."), d("Beauty Expo", "Packaging, salon equipment and OEM meetings."), d("Guangzhou – Manila", "Transfer to the airport.")] }),
  E({ id: "ecf", short: "East China Fair", edition: "March", title: "East China Fair · Shanghai", city: "Shanghai", month: "2027-03", days: 5, industries: ["fashion", "retail", "furniture"], icon: "shirt", img: "1558769132-cb1aea458c5e",
    venue: "Shanghai (venue confirmed by the organiser)", org: "East China Fair organising committee", timing: "Usually early March",
    sum: "Eastern China's largest import and export fair: garments, textiles, home goods, gifts and daily consumer products from Shanghai, Zhejiang and Jiangsu exporters.",
    highlights: ["Garments and textiles from the Yangtze River Delta", "Home goods and gifts", "Good warm-up before the Canton Fair"], who: "Apparel, home-goods and gift importers.",
    plan: [d("Manila – Shanghai", "Arrival and briefing."), d("East China Fair", "Garments and textiles halls."), d("East China Fair", "Home goods, gifts and consumer products."), d("East China Fair", "Follow-up meetings."), d("Shanghai – Manila", "Transfer to the airport.")] }),
  E({ id: "hotelex", short: "HOTELEX Shanghai", edition: "Spring", title: "HOTELEX Shanghai · Hotel & Foodservice Expo", city: "Shanghai", month: "2027-04", days: 4, industries: ["horeca"], icon: "cutlery", img: "1622021142947-da7dedc7c39a",
    venue: "National Exhibition and Convention Center (Shanghai)", org: "HOTELEX organisers", timing: "Usually late March to early April",
    sum: "The hospitality supply show: commercial kitchen equipment, tableware, coffee and bakery, hotel supplies and furnishings.",
    highlights: ["Commercial kitchen and bakery equipment", "Coffee, tea and beverage equipment", "Hotel supplies, linens and tableware"], who: "Hotels, restaurants, cafés and catering groups.",
    plan: [d("Manila – Shanghai", "Arrival and expo briefing."), d("HOTELEX", "Kitchen equipment, coffee and bakery halls."), d("HOTELEX", "Tableware, hotel supplies and furnishings."), d("Shanghai – Manila", "Transfer to the airport.")] }),
  E({ id: "hk-electronics", short: "HK Electronics Fair", edition: "Spring Edition", title: "Hong Kong Electronics Fair · Spring", city: "Hong Kong", month: "2027-04", days: 4, industries: ["electronics"], icon: "chip", img: "1518770660439-4636190af475",
    venue: "Hong Kong Convention and Exhibition Centre, Wan Chai", org: "Hong Kong Trade Development Council (HKTDC)", timing: "Usually mid-April, just before Canton Fair Phase 1",
    sum: "HKTDC's spring electronics fair, timed around Canton Fair Phase 1 so buyers can do both in one trip. Visa-free entry to Hong Kong.",
    highlights: ["Consumer electronics, smart home and accessories", "Easy to combine with Canton Fair Phase 1", "No China visa needed for Hong Kong"], who: "Electronics importers, retailers and distributors.",
    plan: [d("Manila – Hong Kong", "Arrival and fair briefing."), d("Electronics Fair", "Consumer electronics and smart home."), d("Electronics Fair", "Supplier meetings and samples."), d("Hong Kong – Manila", "Home, or on to Guangzhou for Phase 1.")] }),
  E({ id: "hk-lighting", short: "HK Lighting Fair", edition: "Spring Edition", title: "Hong Kong International Lighting Fair · Spring", city: "Hong Kong", month: "2027-04", days: 4, industries: ["lighting", "construction", "horeca"], icon: "bulb", img: "1771888703722-ee7ad9143a67",
    venue: "Hong Kong Convention and Exhibition Centre, Wan Chai", org: "Hong Kong Trade Development Council (HKTDC)", timing: "Usually mid-April",
    sum: "HKTDC's spring lighting fair: LED, commercial, decorative and smart lighting. Pairs well with Canton Fair Phase 1.",
    highlights: ["Commercial, architectural and decorative lighting", "LED and smart-lighting controls", "Combine with Canton Fair Phase 1"], who: "Lighting importers, contractors and project buyers.",
    plan: [d("Manila – Hong Kong", "Arrival and fair briefing."), d("Lighting Fair", "Commercial and architectural lighting."), d("Lighting Fair", "Decorative, LED and smart lighting."), d("Hong Kong – Manila", "Home, or on to Guangzhou.")] }),
  E({ id: "hk-gifts", short: "HK Gifts & Premium Fair", edition: "Spring", title: "Hong Kong Gifts & Premium Fair", city: "Hong Kong", month: "2027-04", days: 4, industries: ["retail", "horeca"], icon: "gift", img: "1598305762558-328f599df683",
    venue: "Hong Kong Convention and Exhibition Centre, Wan Chai", org: "Hong Kong Trade Development Council (HKTDC)", timing: "Usually late April",
    sum: "One of Asia's largest gifts and premiums fairs: corporate gifts, promotional items, giftware and festive products.",
    highlights: ["Corporate gifts and promotional items", "Giftware, festive and lifestyle products", "Visa-free entry to Hong Kong"], who: "Corporate-gift suppliers, retailers and marketing teams.",
    plan: [d("Manila – Hong Kong", "Arrival and fair briefing."), d("Gifts & Premium Fair", "Premiums and corporate gift halls."), d("Gifts & Premium Fair", "Giftware, festive and lifestyle products."), d("Hong Kong – Manila", "Transfer to the airport.")] }),
  E({ id: "autoshanghai", short: "Auto Shanghai", edition: "2027", title: "Auto Shanghai 2027 · Automotive Industry Exhibition", city: "Shanghai", month: "2027-04", days: 4, industries: ["machinery", "electronics"], icon: "gear", img: "1789733558148-fc8e2fec019b",
    venue: "National Exhibition and Convention Center (Shanghai)", org: "Auto Shanghai organisers", timing: "Every odd year, usually late April",
    sum: "China's major auto show: electric vehicles, auto parts, batteries and mobility technology, with trade days before public days.",
    highlights: ["New energy vehicles and batteries", "Auto parts and aftermarket suppliers", "Trade days for business visitors"], who: "Dealers, fleet buyers and parts distributors.",
    plan: [d("Manila – Shanghai", "Arrival and show briefing."), d("Auto Shanghai", "Manufacturers and new energy vehicles."), d("Auto Shanghai", "Parts, batteries and supplier meetings."), d("Shanghai – Manila", "Transfer to the airport.")] }),
  E({ id: "gile", short: "GILE", edition: "June", title: "GILE · Guangzhou International Lighting Exhibition", city: "Guangzhou", month: "2027-06", days: 5, industries: ["lighting", "construction", "horeca"], icon: "bulb", img: "1545164415-0fae860defbd",
    venue: "China Import and Export Fair Complex, Pazhou", org: "Messe Frankfurt and Guangzhou Guangya", timing: "Usually the second week of June",
    sum: "One of the world's largest lighting and LED shows, held every June at the Canton Fair complex.",
    highlights: ["Architectural, commercial and decorative lighting", "LED components, drivers and controls", "Add a day in Guzhen, Zhongshan"], who: "Lighting importers, designers and contractors.",
    plan: [d("Manila – Guangzhou", "Arrival, registration and briefing."), d("GILE", "Architectural and commercial lighting."), d("GILE", "Decorative and smart lighting."), d("GILE", "LED components, controls and follow-ups."), d("Guangzhou – Manila", "Transfer to the airport.")] }),
  E({ id: "caexpo", short: "China-ASEAN Expo", edition: "September", title: "China-ASEAN Expo · Nanning", city: "Nanning", month: "2027-09", days: 5, industries: Object.keys(FAIR.industries), icon: "globe", img: "1587825140708-dfaf72ae4b04",
    venue: "Nanning International Convention and Exhibition Center", org: "China and the ten ASEAN governments", timing: "Usually mid-September",
    sum: "The annual expo for China–ASEAN trade, with country pavilions including the Philippines. Strong for exporters and trade missions.",
    highlights: ["Philippine and ASEAN country pavilions", "Business matching and forums", "Good for exporters as well as buyers"], who: "Exporters, chambers, trade missions and buyers.",
    plan: [d("Manila – Nanning", "Arrival via a connecting city."), d("China-ASEAN Expo", "Country pavilions and business matching."), d("China-ASEAN Expo", "Sector halls and forums."), d("Business meetings", "Partner and supplier visits."), d("Nanning – Manila", "Return via a connecting city.")] }),
  E({ id: "ciif", short: "CIIF", edition: "September", title: "CIIF · China International Industry Fair", city: "Shanghai", month: "2027-09", days: 5, industries: ["machinery", "electronics", "construction"], icon: "gear", img: "1717386255767-52643970d483",
    venue: "National Exhibition and Convention Center (Shanghai)", org: "CIIF organising committee", timing: "Usually mid to late September",
    sum: "Shanghai's flagship industrial show: automation, robotics, machine tools, energy and industrial IT.",
    highlights: ["Industrial automation and robotics", "Machine tools and metalworking", "Energy and new materials"], who: "Manufacturers, engineers and industrial distributors.",
    plan: [d("Manila – Shanghai", "Arrival and briefing."), d("CIIF", "Industrial automation and robotics."), d("CIIF", "Machine tools and metalworking."), d("CIIF", "Energy, materials and follow-ups."), d("Shanghai – Manila", "Transfer to the airport.")] }),
  E({ id: "furniturechina", short: "Furniture China", edition: "September", title: "Furniture China & Maison Shanghai", city: "Shanghai", month: "2027-09", days: 5, industries: ["furniture", "horeca"], icon: "sofa", img: "1680503146476-abb8c752e1f4",
    venue: "Shanghai New International Expo Centre, Pudong", org: "Furniture China organisers", timing: "Usually mid-September",
    sum: "Shanghai's September furniture and home-design week, with Maison Shanghai for decor and lifestyle.",
    highlights: ["Furniture, outdoor and contract furniture", "Maison Shanghai for decor and lifestyle", "Good second chance after CIFF in March"], who: "Furniture retailers, hotel projects and interior firms.",
    plan: [d("Manila – Shanghai", "Arrival and briefing."), d("Furniture China", "Furniture and outdoor halls."), d("Furniture China", "Hotel and contract furniture."), d("Maison Shanghai", "Home decor and lifestyle."), d("Shanghai – Manila", "Transfer to the airport.")] }),
  E({ id: "yiwufair", short: "Yiwu Fair", edition: "October", title: "China Yiwu International Commodities Fair", city: "Yiwu", month: "2027-10", days: 5, industries: ["retail", "horeca", "fashion"], icon: "box", img: "1748406144100-e2f1c470e1ae",
    venue: "Yiwu International Expo Center", org: "Yiwu Fair organising committee", timing: "Usually late October",
    sum: "The Yiwu Fair next to the permanent Yiwu International Trade City: small commodities, gifts, stationery and household goods at low MOQs.",
    highlights: ["Small commodities at low minimum orders", "Permanent Trade City market next door", "Consolidated shipping for many small suppliers"], who: "Retailers, e-commerce sellers and gift importers.",
    plan: [d("Manila – Yiwu", "Arrival via Hangzhou or Shanghai."), d("Yiwu Fair", "Exhibition halls."), d("Trade City", "Market districts with an interpreter."), d("Trade City", "Orders and a forwarder meeting."), d("Yiwu – Manila", "Return via Hangzhou or Shanghai.")] }),
  E({ id: "ciie", short: "CIIE", edition: "November", title: "CIIE · China International Import Expo", city: "Shanghai", month: "2027-11", days: 5, industries: Object.keys(FAIR.industries), icon: "globe", img: "1545893835-abaa50cbe628",
    venue: "National Exhibition and Convention Center (Shanghai)", org: "Ministry of Commerce of China and Shanghai government", timing: "Usually early November",
    sum: "China's import expo: for Philippine exporters meeting Chinese buyers and companies scouting partners, with country pavilions and matchmaking.",
    highlights: ["Country pavilions and matchmaking", "Food, consumer goods and services halls", "For exporters selling into China"], who: "Philippine exporters, chambers and trade missions.",
    plan: [d("Manila – Shanghai", "Arrival and expo briefing."), d("CIIE", "Exhibition halls and scheduled meetings."), d("CIIE", "Matchmaking sessions."), d("CIIE", "Follow-ups and partner visits."), d("Shanghai – Manila", "Transfer to the airport.")] }),
  E({ id: "chtf", short: "China Hi-Tech Fair", edition: "November", title: "China Hi-Tech Fair · Shenzhen", city: "Shenzhen", month: "2027-11", days: 4, industries: ["electronics", "machinery"], icon: "chip", img: "1522614288668-a697127e9b21",
    venue: "Shenzhen World Exhibition and Convention Center", org: "CHTF organising committee", timing: "Usually mid-November",
    sum: "Shenzhen's annual technology fair: electronics, smart devices, robotics, new energy and innovation pavilions.",
    highlights: ["Smart devices and consumer tech", "Robotics and new energy", "Shenzhen's factories and markets nearby"], who: "Tech buyers, distributors and innovation teams.",
    plan: [d("Manila – Shenzhen", "Arrival and fair briefing."), d("Hi-Tech Fair", "Electronics, smart devices and robotics."), d("Hi-Tech Fair", "New energy and supplier meetings."), d("Shenzhen – Manila", "Transfer to the airport.")] }),
];
EXPO_TRIPS.forEach((t, i) => { t.rank = 10 + i; ITINERARIES.push(t); });

// Departures: Canton trips leave the day before their phase opens (both 2027 sessions); expos sit in their usual month.
(function () {
  ITINERARIES.forEach(t => {
    t.departures = [];
    if (t.event === "expo") { t.departures.push({ date: new Date(t.month + "-15T12:00:00+08:00"), session: "2027", expected: true, tbc: true }); return; }
    FAIR.sessions.forEach(s => {
      const dt = new Date(s.phases[t.phases[0] - 1][0] + "T12:00:00+08:00");
      dt.setUTCDate(dt.getUTCDate() - 1);
      t.departures.push({ date: dt, phase: t.phases[0], session: s.name, expected: !!s.expected });
    });
    t.departures.sort((a, b) => a.date - b.date);
  });
})();

// Event banner: a designed key visual per event that always fills its frame (used in the catalogue, home and industry pages).
window.eventBanner = function (t, size = "") {
  const pal = t.event === "canton" ? [["#c9460b", "#ff8a3d"], ["#b51d16", "#e0590b"], ["#7a2a0a", "#c9460b"]][t.phases[0] - 1] : (FAIR.palette[t.city] || ["#1f1f3d", "#3b3b63"]);
  const when = t.event === "canton" ? "Spring & Autumn 2027" : `${MONTHS[+t.month.slice(5) - 1]} 2027`;
  const kicker = t.event === "canton" ? "Canton Fair · Guangzhou" : `${t.city} · ${when}`;
  const name = t.event === "canton" ? `Phase ${t.phases[0]}` : t.short;
  const sub = t.event === "canton" ? t.title.split(" · ")[1] : (t.edition && t.edition !== when.split(" ")[0] ? t.edition : t.venue.split(",")[0]);
  return `<div class="ebanner ${size}" style="--c1:${pal[0]};--c2:${pal[1]}">
    <img src="${t.img}" alt="" loading="lazy" width="1000" height="667">
    <span class="eb-grid" aria-hidden="true"></span>
    <svg class="eb-ic" aria-hidden="true"><use href="#i-${t.icon || "globe"}"/></svg>
    <span class="eb-top">${kicker}</span>
    <b class="eb-name">${name}</b>
    <span class="eb-sub">${sub}</span>
    <span class="eb-when">${t.event === "canton" ? "5D4N · 3 fair days" : when}</span>
  </div>`;
};
