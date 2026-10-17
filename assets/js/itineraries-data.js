// Itinerary catalogue: the single source for the Itineraries page, home rail, industry pages and inquiry form.
// Canton Fair: one itinerary per phase. Expos: upcoming China trade shows by city.
// Prices are quoted per group (no public price), so there is no price filter.

window.FAIR = {
  sessions: [
    { name: "Autumn 2026", num: "140th", phases: [["2026-10-15", "2026-10-19"], ["2026-10-23", "2026-10-27"], ["2026-10-31", "2026-11-04"]] },
    { name: "Spring 2027", num: "141st", expected: true, phases: [["2027-04-15", "2027-04-19"], ["2027-04-23", "2027-04-27"], ["2027-05-01", "2027-05-05"]] },
  ],
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
};

const IMG = id => `https://images.unsplash.com/photo-${id}?w=900&q=70`;
const INC = ["airfare", "hotel", "badge", "visa", "transfers", "interpreter", "coordinator"];

window.ITINERARIES = [
  /* ---------------- Canton Fair: one trip per phase ---------------- */
  {
    id: "phase-1", event: "canton", title: "Canton Fair Phase 1", days: 5, nights: 4, phases: [1], city: "Guangzhou", rank: 1,
    depart: ["Manila", "Cebu", "Clark", "Davao"], industries: ["electronics", "machinery", "lighting", "construction"], inc: INC,
    img: IMG("1752155222944-675c2c3bfafd"),
    sum: "Advanced manufacturing: electronics and appliances, machinery, vehicles, lighting and electrical, hardware and tools, new energy. Three full fair days in Guangzhou.",
    plan: [["Manila – Guangzhou", "Arrival, transfer to a hotel near the Pazhou complex, badge collection, evening hall briefing."], ["Canton Fair · Phase 1", "Electronics, appliances and lighting halls."], ["Canton Fair · Phase 1", "Machinery, hardware, tools and new energy halls."], ["Canton Fair · Phase 1", "Follow-up meetings, quote comparison and sample requests."], ["Guangzhou – Manila", "Transfer to Guangzhou Baiyun airport."]],
  },
  {
    id: "phase-2", event: "canton", title: "Canton Fair Phase 2", days: 5, nights: 4, phases: [2], city: "Guangzhou", rank: 2,
    depart: ["Manila", "Cebu", "Clark", "Davao"], industries: ["furniture", "construction", "horeca", "retail"], inc: INC,
    img: IMG("1785123463585-1ba21ff9ff57"),
    sum: "Quality home living: daily consumer goods, kitchenware and tableware, gifts and decorations, building materials and furniture. Three full fair days in Guangzhou.",
    plan: [["Manila – Guangzhou", "Arrival, transfer to a hotel near the Pazhou complex, badge collection, evening hall briefing."], ["Canton Fair · Phase 2", "Furniture and building-materials halls."], ["Canton Fair · Phase 2", "Kitchenware, tableware, gifts and home decor halls."], ["Canton Fair · Phase 2", "Follow-up meetings, quote comparison and sample requests."], ["Guangzhou – Manila", "Transfer to Guangzhou Baiyun airport."]],
  },
  {
    id: "phase-3", event: "canton", title: "Canton Fair Phase 3", days: 5, nights: 4, phases: [3], city: "Guangzhou", rank: 3,
    depart: ["Manila", "Cebu", "Clark", "Davao"], industries: ["fashion", "retail", "horeca"], inc: INC,
    img: IMG("1711390811937-1b061eaf28ea"),
    sum: "Better life: toys and baby products, fashion and garments, home textiles, stationery, health, recreation and food. Three full fair days in Guangzhou.",
    plan: [["Manila – Guangzhou", "Arrival, transfer to a hotel near the Pazhou complex, badge collection, evening hall briefing."], ["Canton Fair · Phase 3", "Fashion, shoes, bags and home textiles halls."], ["Canton Fair · Phase 3", "Toys, baby products, stationery and food halls."], ["Canton Fair · Phase 3", "Follow-up meetings, quote comparison and sample requests."], ["Guangzhou – Manila", "Transfer to Guangzhou Baiyun airport."]],
  },
];

// ---- Upcoming China trade expos by city. Each recurs on a regular cycle (Auto Shanghai every odd year);
// months follow each show's usual slot and exact dates are confirmed when the organiser publishes them.
const E = (id, expo, title, city, month, days, industries, img, sum, plan) => ({
  id, expo, title, city, month, days, nights: days - 1, industries, img: IMG(img), sum, plan,
  event: "expo", phases: [], inc: INC, depart: city === "Hong Kong" ? ["Manila", "Cebu", "Clark", "Davao"] : ["Manila", "Cebu"],
});
const day = (a, b) => [a, b];
const EXPOS = [
  // Hong Kong
  E("hk-toys", "HK Toys & Games Fair", "Hong Kong Toys & Games Fair", "Hong Kong", "2027-01", 4, ["retail"], "1596068587619-e4b11c7a3488",
    "HKTDC's January toy fair at the Hong Kong Convention and Exhibition Centre, alongside the baby products and stationery fairs. Philippine passport holders can visit Hong Kong visa-free.",
    [day("Manila – Hong Kong", "Arrival and fair briefing."), day("Toys & Games Fair", "Toys, games and licensing halls."), day("Baby & stationery fairs", "Baby products and stationery halls next door."), day("Hong Kong – Manila", "Morning meetings, then the airport.")]),
  E("hk-electronics", "HK Electronics Fair", "Hong Kong Electronics Fair · Spring", "Hong Kong", "2027-04", 4, ["electronics"], "1518770660439-4636190af475",
    "HKTDC's spring electronics fair in April, around the same time as Canton Fair Phase 1, so many buyers combine both. Visa-free entry for Philippine passport holders.",
    [day("Manila – Hong Kong", "Arrival and fair briefing."), day("Electronics Fair", "Consumer electronics, smart home and accessories."), day("Electronics Fair", "Supplier meetings and samples."), day("Hong Kong – Manila", "Transfer to the airport, or continue to Guangzhou for Phase 1.")]),
  E("hk-lighting", "HK Lighting Fair", "Hong Kong International Lighting Fair · Spring", "Hong Kong", "2027-04", 4, ["lighting", "construction", "horeca"], "1771888703722-ee7ad9143a67",
    "HKTDC's spring lighting fair in April: LED, commercial, decorative and smart lighting. Pairs well with Canton Fair Phase 1 in Guangzhou.",
    [day("Manila – Hong Kong", "Arrival and fair briefing."), day("Lighting Fair", "Commercial and architectural lighting."), day("Lighting Fair", "Decorative, LED and smart lighting."), day("Hong Kong – Manila", "Transfer to the airport, or continue to Guangzhou.")]),
  E("hk-gifts", "HK Gifts & Premium Fair", "Hong Kong Gifts & Premium Fair", "Hong Kong", "2027-04", 4, ["retail", "horeca"], "1598305762558-328f599df683",
    "One of Asia's largest gifts and premiums fairs, held by HKTDC each spring: corporate gifts, promotional items, giftware and festive products.",
    [day("Manila – Hong Kong", "Arrival and fair briefing."), day("Gifts & Premium Fair", "Premiums and corporate gift halls."), day("Gifts & Premium Fair", "Giftware, festive and lifestyle products."), day("Hong Kong – Manila", "Transfer to the airport.")]),
  // Guangzhou
  E("ciff-gz", "CIFF Guangzhou", "CIFF Guangzhou · China International Furniture Fair", "Guangzhou", "2027-03", 5, ["furniture", "horeca", "construction"], "1687180497278-ca4d736ecc99",
    "Asia's big furniture show, held every March at the Canton Fair complex in Pazhou: home and office furniture, outdoor, materials and fittings.",
    [day("Manila – Guangzhou", "Arrival, registration and briefing."), day("CIFF", "Home furniture and outdoor halls."), day("CIFF", "Office and hotel furniture."), day("CIFF", "Materials, fittings and follow-ups."), day("Guangzhou – Manila", "Transfer to the airport.")]),
  E("cibe", "CIBE Guangzhou", "China International Beauty Expo · Guangzhou", "Guangzhou", "2027-03", 4, ["retail"], "1598528738936-c50861cc75a9",
    "Guangzhou's large beauty and cosmetics expo: skincare, cosmetics, salon equipment, packaging and OEM manufacturers. Usually held in March.",
    [day("Manila – Guangzhou", "Arrival and expo briefing."), day("Beauty Expo", "Skincare, cosmetics and private label."), day("Beauty Expo", "Packaging, salon equipment and OEM meetings."), day("Guangzhou – Manila", "Transfer to the airport.")]),
  E("gile", "GILE", "GILE · Guangzhou International Lighting Exhibition", "Guangzhou", "2027-06", 5, ["lighting", "construction", "horeca"], "1545164415-0fae860defbd",
    "One of the world's largest lighting and LED shows, held every June at the Canton Fair complex.",
    [day("Manila – Guangzhou", "Arrival, registration and briefing."), day("GILE", "Architectural and commercial lighting."), day("GILE", "Decorative and smart lighting."), day("GILE", "LED components, controls and follow-ups."), day("Guangzhou – Manila", "Transfer to the airport.")]),
  // Shanghai
  E("ecf", "East China Fair", "East China Fair · Shanghai", "Shanghai", "2027-03", 5, ["fashion", "retail", "furniture"], "1558769132-cb1aea458c5e",
    "Eastern China's largest import and export fair, each March: garments, textiles, home goods, gifts and daily consumer products.",
    [day("Manila – Shanghai", "Arrival and briefing."), day("East China Fair", "Garments and textiles halls."), day("East China Fair", "Home goods, gifts and consumer products."), day("East China Fair", "Follow-up meetings."), day("Shanghai – Manila", "Transfer to the airport.")]),
  E("hotelex", "HOTELEX Shanghai", "HOTELEX Shanghai · Hotel & Foodservice Expo", "Shanghai", "2027-04", 4, ["horeca"], "1622021142947-da7dedc7c39a",
    "For hotels, restaurants and cafés: commercial kitchen equipment, tableware, coffee and bakery, hotel supplies and furnishings. Usually late March to early April.",
    [day("Manila – Shanghai", "Arrival and expo briefing."), day("HOTELEX", "Kitchen equipment, coffee and bakery halls."), day("HOTELEX", "Tableware, hotel supplies and furnishings."), day("Shanghai – Manila", "Transfer to the airport.")]),
  E("autoshanghai", "Auto Shanghai", "Auto Shanghai 2027 · Automotive Industry Exhibition", "Shanghai", "2027-04", 4, ["machinery", "electronics"], "1789733558148-fc8e2fec019b",
    "China's major auto show, held every odd year in Shanghai: electric vehicles, auto parts, batteries and mobility technology.",
    [day("Manila – Shanghai", "Arrival and show briefing."), day("Auto Shanghai", "Manufacturers and new energy vehicles."), day("Auto Shanghai", "Parts, batteries and supplier meetings."), day("Shanghai – Manila", "Transfer to the airport.")]),
  E("ciif", "CIIF", "CIIF · China International Industry Fair", "Shanghai", "2027-09", 5, ["machinery", "electronics", "construction"], "1717386255767-52643970d483",
    "Shanghai's flagship industrial show each September: automation, robotics, machine tools, energy and industrial IT.",
    [day("Manila – Shanghai", "Arrival and briefing."), day("CIIF", "Industrial automation and robotics."), day("CIIF", "Machine tools and metalworking."), day("CIIF", "Energy, materials and follow-ups."), day("Shanghai – Manila", "Transfer to the airport.")]),
  E("furniturechina", "Furniture China", "Furniture China & Maison Shanghai", "Shanghai", "2027-09", 5, ["furniture", "horeca"], "1680503146476-abb8c752e1f4",
    "September's furniture and home-design week in Shanghai, with Maison Shanghai for decor and lifestyle.",
    [day("Manila – Shanghai", "Arrival and briefing."), day("Furniture China", "Furniture and outdoor halls."), day("Furniture China", "Hotel and contract furniture."), day("Maison Shanghai", "Home decor and lifestyle."), day("Shanghai – Manila", "Transfer to the airport.")]),
  E("ciie", "CIIE", "CIIE · China International Import Expo", "Shanghai", "2027-11", 5, Object.keys(FAIR.industries), "1545893835-abaa50cbe628",
    "China's import expo every November: for Philippine exporters meeting Chinese buyers, with country pavilions and matchmaking.",
    [day("Manila – Shanghai", "Arrival and expo briefing."), day("CIIE", "Exhibition halls and scheduled meetings."), day("CIIE", "Matchmaking sessions."), day("CIIE", "Follow-ups and partner visits."), day("Shanghai – Manila", "Transfer to the airport.")]),
  // Shenzhen
  E("chtf", "China Hi-Tech Fair", "China Hi-Tech Fair · Shenzhen", "Shenzhen", "2027-11", 4, ["electronics", "machinery"], "1522614288668-a697127e9b21",
    "Shenzhen's annual technology fair each November: electronics, smart devices, robotics, new energy and innovation pavilions.",
    [day("Manila – Shenzhen", "Arrival and fair briefing."), day("Hi-Tech Fair", "Electronics, smart devices and robotics."), day("Hi-Tech Fair", "New energy and supplier meetings."), day("Shenzhen – Manila", "Transfer to the airport.")]),
  // Yiwu
  E("yiwufair", "Yiwu Fair", "China Yiwu International Commodities Fair", "Yiwu", "2027-10", 5, ["retail", "horeca", "fashion"], "1748406144100-e2f1c470e1ae",
    "The Yiwu Fair each October, next to the permanent Yiwu International Trade City: small commodities, gifts, stationery and household goods at low MOQs.",
    [day("Manila – Yiwu", "Arrival via Hangzhou or Shanghai."), day("Yiwu Fair", "Exhibition halls."), day("Trade City", "Market districts with an interpreter."), day("Trade City", "Orders and a forwarder meeting."), day("Yiwu – Manila", "Return via Hangzhou or Shanghai.")]),
  // Nanning
  E("caexpo", "China-ASEAN Expo", "China-ASEAN Expo · Nanning", "Nanning", "2027-09", 5, Object.keys(FAIR.industries), "1587825140708-dfaf72ae4b04",
    "The annual expo for China–ASEAN trade each September, with country pavilions including the Philippines. Strong for exporters and trade missions.",
    [day("Manila – Nanning", "Arrival via a connecting city."), day("China-ASEAN Expo", "Country pavilions and business matching."), day("China-ASEAN Expo", "Sector halls and forums."), day("Business meetings", "Partner and supplier visits."), day("Nanning – Manila", "Return via a connecting city.")]),
];
EXPOS.sort((a, b) => a.month.localeCompare(b.month)).forEach((t, i) => { t.rank = 10 + i; ITINERARIES.push(t); });

// Departures: Canton trips leave the day before their phase opens, each session; expos sit in their usual month.
(function () {
  ITINERARIES.forEach(t => {
    t.departures = [];
    if (t.event === "expo") { t.departures.push({ date: new Date(t.month + "-15T12:00:00+08:00"), session: "2027", expected: true, tbc: true }); return; }
    FAIR.sessions.forEach(s => {
      const d = new Date(s.phases[t.phases[0] - 1][0] + "T12:00:00+08:00");
      d.setUTCDate(d.getUTCDate() - 1);
      t.departures.push({ date: d, phase: t.phases[0], session: s.name, expected: !!s.expected });
    });
    t.departures.sort((a, b) => a.date - b.date);
  });
})();
