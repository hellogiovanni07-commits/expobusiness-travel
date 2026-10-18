"""Build industries.html and one industry-<id>.html page per industry from the data below.

Edit the INDUSTRIES data, then run:  python build-industries.py && python sync-layout.py
Trips and 2027 expos on each page come from assets/js/data/itineraries-data.js at runtime.
"""
import pathlib, html

ROOT = pathlib.Path(__file__).parent
U = lambda pid, w=1400: f"https://images.unsplash.com/photo-{pid}?w={w}&q=72"
# Canton Fair dates come from assets/js/data/site-config.js (the single source).
import json as _json, datetime as _dt
_cfg = (pathlib.Path(__file__).parent / "assets/js/data/site-config.js").read_text(encoding="utf8")
SITE = _json.loads(_cfg[_cfg.index("{"):_cfg.rindex("}") + 1])
def _rng(a, b):
    A, B = _dt.date.fromisoformat(a), _dt.date.fromisoformat(b)
    return f"{A:%b} {A.day}–{B.day}, {B.year}" if A.month == B.month else f"{A:%b} {A.day}–{B:%b} {B.day}, {B.year}"
_S = SITE["canton"]["sessions"]
PHASE_DATES = {p + 1: (_rng(*_S[0]["phases"][p]), _rng(*_S[1]["phases"][p])) for p in range(3)}

INDUSTRIES = [
    dict(id="electronics", name="Electronics & appliances", short="Electronics", icon="chip", m="pop", phases=[1],
         h1="Electronics and appliance expos in China",
         lede="Consumer electronics, home appliances and smart devices fill Phase 1. We plan the halls, the supplier meetings and a Shenzhen extension for components and factories.",
         img="1716191300020-b52dec5b70a8", alt="Electrical equipment on a production line", tile="1515940175183-6798529cb860",
         cats=[("Consumer electronics", "Audio, mobile accessories, wearables"), ("Home appliances", "Kitchen, cooling, cleaning and personal care"), ("Smart home & IT", "Connected devices, security, computing"),
               ("Electronic components", "Cables, power supplies, batteries"), ("New energy", "Solar, storage and power equipment"), ("Electrical products", "Switches, sockets, wiring accessories")],
         clusters=[("Shenzhen", "Consumer electronics, components and the Huaqiangbei markets"), ("Dongguan", "Electronics manufacturing and assembly"), ("Foshan · Shunde", "Household appliance makers")],
         checks=["Ask for certification reports (CE, RoHS, FCC) for your exact model", "Confirm 220V/60Hz operation and the plug type for the Philippines", "Request a pre-production sample before the bulk order", "Agree warranty and spare-parts terms in writing", "Check MOQ per model and per colour", "Plan a third-party inspection before shipment"],
         note="Many electrical and electronic products need a DTI Philippine Standard (PS) mark or Import Commodity Clearance (ICC) before they can be sold. Check your product category before you order."),
    dict(id="machinery", name="Machinery & industrial", short="Machinery", icon="gear", m="spin", phases=[1],
         h1="Machinery and industrial expos in China",
         lede="Phase 1 covers manufacturing, processing and power equipment. We add a factory day so your engineers see the machine running before you commit.",
         img="1717386255773-1e3037c81788", alt="Large industrial machine in a factory hall", tile="1717386255767-52643970d483",
         cats=[("Processing & packaging", "Food, plastics and packaging lines"), ("Industrial automation", "Robotics, controls, conveyors"), ("Power & electrical equipment", "Generators, motors, transformers"),
               ("Construction machinery", "Compact equipment and attachments"), ("Agricultural machinery", "Tillers, pumps, processing"), ("Vehicles & parts", "Commercial vehicles, two-wheelers, spare parts")],
         clusters=[("Foshan", "Machinery, metalworking and equipment makers"), ("Dongguan", "Industrial manufacturing and automation"), ("Guangzhou", "Equipment suppliers close to the fair")],
         checks=["Confirm voltage, phase and frequency match your site", "Ask for a running demo or video of your exact configuration", "Get installation, training and after-sales terms in writing", "Check spare-parts availability and lead times", "Clarify crating, shipping size and port of loading", "Request operator manuals in English"],
         note="Heavy equipment often needs special shipping and import documents. Bring your freight forwarder into the conversation early. We can introduce one."),
    dict(id="lighting", name="Lighting & electrical", short="Lighting", icon="bulb", m="glow", phases=[1],
         h1="Lighting and electrical expos in China",
         lede="LED, commercial, outdoor and solar lighting in Phase 1, then a day in Guzhen, Zhongshan, China's lighting town. In June, GILE in Guangzhou is the specialist show.",
         img="1532007271951-c487760934ae", alt="Light bulb", tile="1561794919-75618574e915",
         cats=[("LED & indoor lighting", "Panels, downlights, tubes, strips"), ("Commercial & architectural", "Track, linear and project lighting"), ("Outdoor & solar", "Street, flood and solar lights"),
               ("Decorative lighting", "Pendants, lamps, festive lights"), ("Smart lighting", "Controls, sensors, app-based systems"), ("Electrical accessories", "Drivers, wires, switches")],
         clusters=[("Zhongshan · Guzhen", "Lighting showrooms and factories"), ("Foshan", "Lighting and electrical makers"), ("Shenzhen", "LED chips, drivers and smart controls")],
         checks=["Ask for lumen output and colour temperature test reports", "Check driver quality and warranty period", "Confirm 220V operation and certifications", "Order samples of each fixture before bulk", "Ask about project pricing for large orders", "Check packaging strength for sea freight"],
         note="Lamps, ballasts and wiring products may fall under DTI mandatory product standards. Confirm PS or ICC requirements for your category before ordering."),
    dict(id="construction", name="Construction & hardware", short="Construction", icon="helmet", m="bob", phases=[1, 2],
         h1="Construction, hardware and building-material expos in China",
         lede="Tools and hardware sit in Phase 1, while tiles, sanitary ware and building materials are in Phase 2. We can book both phases back to back for buyers who need them.",
         img="1426927308491-6380b6a9936f", alt="Hand tools hanging on a workshop rack", tile="1581783898377-1c85bf937427",
         cats=[("Hardware & tools", "Hand and power tools, fasteners, locks"), ("Tiles & ceramics", "Floor and wall tiles, mosaics"), ("Sanitary & bathroom", "Fixtures, faucets, fittings"),
               ("Building materials", "Panels, boards, roofing, doors, windows"), ("Stone & ironwork", "Stone, metal and decorative products"), ("Plumbing & electrical", "Pipes, valves, cables")],
         clusters=[("Foshan", "Ceramic tiles, sanitary ware and aluminium profiles"), ("Guangzhou", "Building-material wholesale"), ("Dongguan", "Hardware and metal products")],
         checks=["Ask for test reports for strength, water absorption or fire rating", "Check tile batch and shade consistency on samples", "Confirm dimensions and standards used in the Philippines", "Agree breakage allowance and packing method", "Plan container loading by weight, not just volume", "Book a pre-shipment inspection"],
         note="Several construction materials, such as cement, steel bars, tiles and wires, are covered by DTI mandatory standards. Check PS or ICC requirements before you order."),
    dict(id="furniture", name="Furniture & home living", short="Furniture", icon="sofa", m="bob", phases=[2],
         h1="Furniture and home living expos in China",
         lede="Phase 2 brings furniture, home decor and household goods together. Add Foshan's furniture malls, and in March 2027 the CIFF furniture fair in the same complex.",
         img="1687180498602-5a1046defaa4", alt="Living room furnished with modern furniture", tile="1680503146454-0fe569cef4eb",
         cats=[("Living & bedroom furniture", "Sofas, beds, storage"), ("Office & contract", "Desks, seating, hotel furniture"), ("Outdoor furniture", "Garden, patio and resort"),
               ("Home decor", "Lighting, mirrors, wall decor"), ("Household goods", "Storage, organisation, cleaning"), ("Ceramics & glassware", "Tableware, vases, decor")],
         clusters=[("Foshan · Lecong & Shunde", "Furniture malls and factories"), ("Chaozhou", "Ceramics and tableware"), ("Guangzhou", "Home decor and household goods")],
         checks=["Inspect materials: solid wood, veneer, board grade", "Ask about finishes suited to humid climates", "Confirm knock-down vs assembled shipping", "Request a sample with your fabric or colour", "Check packing for sea freight and handling", "Agree inspection before loading"],
         note="Furniture is bulky, so plan container loads early. We can arrange a consolidation forwarder for mixed suppliers."),
    dict(id="horeca", name="Hotel, restaurant & café", short="Hotel & restaurant", icon="cutlery", m="swing", phases=[2, 3],
         h1="Hotel, restaurant and café supply expos in China",
         lede="Tableware and kitchenware in Phase 2, linens and textiles in Phase 3, lighting in Phase 1. We plan multi-phase trips for hotel, restaurant and café buyers, plus HOTELEX Shanghai in 2027.",
         img="1621293954908-907159247fc8", alt="Modern hotel lobby with designer furniture", tile="1785068540682-6917367db28e",
         cats=[("Tableware & glassware", "Porcelain, cutlery, glass"), ("Kitchenware", "Cookware, utensils, storage"), ("Hotel furniture", "Guest-room and lobby furniture"),
               ("Home textiles & linens", "Bedding, towels, table linen"), ("Lighting", "Decorative and commercial fixtures"), ("Guest amenities", "Bathroom and room accessories")],
         clusters=[("Chaozhou", "Porcelain, ceramics and stainless steel"), ("Foshan", "Hotel and contract furniture"), ("Guangzhou", "Textiles, linens and hospitality suppliers")],
         checks=["Ask for food-contact safety reports for tableware", "Check replacement availability for future reorders", "Confirm commercial-grade durability and warranties", "Request samples in your branding or colours", "Plan delivery by project phase", "Agree packing that protects glass and porcelain"],
         note="Food-contact items and some appliances may need FDA or DTI clearance in the Philippines. Confirm requirements with your importer or broker."),
    dict(id="fashion", name="Fashion & textiles", short="Fashion", icon="shirt", m="swing", phases=[3],
         h1="Fashion, textile, shoe and bag expos in China",
         lede="Phase 3 covers garments, fabrics, shoes and bags. Add a day in Guangzhou's fabric and garment wholesale districts for smaller, faster orders.",
         img="1771098206650-81d713e2e2b9", alt="Stacked fabric rolls in many colours", tile="1532453288672-3a27e9be9efd",
         cats=[("Men's & women's wear", "Casual, formal, uniforms"), ("Children's wear", "Kids and baby clothing"), ("Sportswear", "Activewear and outdoor"),
               ("Fabrics & textiles", "Woven, knit, trims"), ("Shoes", "Casual, safety, sports"), ("Bags & accessories", "Luggage, handbags, belts")],
         clusters=[("Guangzhou · Zhongda", "Fabric and trims wholesale"), ("Guangzhou · garment markets", "Wholesale clothing districts"), ("Dongguan · Humen", "Garment manufacturing")],
         checks=["Check fabric composition and weight on the sample", "Ask for size charts and grading", "Confirm MOQ per style, colour and size", "Request a pre-production sample in your fabric", "Agree labelling and care-label requirements", "Plan inspection for measurements and finishing"],
         note="Textile labelling rules apply in the Philippines. Agree fibre content and care labels with your supplier before production."),
    dict(id="retail", name="Retail, toys & gifts", short="Retail & gifts", icon="gift", m="pop", phases=[2, 3],
         h1="Retail, toy, gift and e-commerce expos in China",
         lede="Gifts and decor in Phase 2, toys, baby and stationery in Phase 3. Add Yiwu for low-MOQ small commodities, or the Yiwu Fair in October 2027.",
         img="1766090503766-623b62f0da26", alt="Large collection of colourful stuffed toys", tile="1779684998897-ce5de594a5ac",
         cats=[("Gifts & premiums", "Corporate gifts, promotional items"), ("Festival & seasonal", "Christmas and holiday products"), ("Toys", "Educational, plush, outdoor"),
               ("Baby & maternity", "Feeding, care, accessories"), ("Stationery & office", "Paper, writing, school supplies"), ("Personal care & pets", "Grooming, pet accessories")],
         clusters=[("Yiwu", "International Trade City, small commodities"), ("Shantou · Chenghai", "Toy manufacturing"), ("Guangzhou", "Gifts and stationery wholesale")],
         checks=["Ask for safety test reports for toys and baby products", "Confirm age grading and warning labels", "Check retail packaging and barcodes", "Start with mixed-SKU, low-MOQ orders", "Consolidate small suppliers through one forwarder", "Photograph every sample with its booth number"],
         note="Toys in the Philippines need proper safety labelling under the Toy and Game Safety Labeling Act, and some products need FDA clearance. Check before you order."),
]


# Schematic Pearl River Delta map: approximate positions, approximate road times from the Pazhou complex.
PRD = {"Guangzhou": (205, 92, ""), "Foshan": (150, 112, "~1 h by road"), "Dongguan": (268, 128, "~1 h by road"),
       "Zhongshan": (178, 196, "~1.5 h by road"), "Shenzhen": (292, 206, "~2 h by road"), "Hong Kong": (318, 250, "~2.5 h by road or rail")}
FAR = {"Chaozhou": "High-speed rail, about 3 h", "Shantou": "High-speed rail, about 3 h", "Yiwu": "Domestic flight or rail"}

def prd_map(clusters):
    keys = []
    for c, t in clusters:
        k = next((n for n in list(PRD) + list(FAR) if c.startswith(n)), None)
        keys.append((k, c, t))
    near = [x for x in keys if x[0] in PRD]
    far = [x for x in keys if x[0] in FAR]
    gx, gy, _ = PRD["Guangzhou"]
    routes = "".join(f'<path class="route-ln" d="M{gx} {gy} Q {(gx + PRD[k][0]) / 2 + 18} {(gy + PRD[k][1]) / 2 - 10} {PRD[k][0]} {PRD[k][1]}" style="--i:{i}"/>' for i, (k, c, t) in enumerate(near) if k != "Guangzhou")
    dots = ""
    for n, (x, y, tm) in PRD.items():
        on = any(k == n for k, _, _ in near) or n == "Guangzhou"
        lab = "Pazhou Complex" if n == "Guangzhou" else n
        dots += f'<g class="pin{" on" if on else ""}{" home" if n == "Guangzhou" else ""}" transform="translate({x} {y})"><circle r="{7 if n == "Guangzhou" else 5}"/><text x="10" y="4">{lab}</text></g>'
    svgmap = f"""<svg class="prd" viewBox="0 0 400 290" role="img" aria-label="Map of the Pearl River Delta showing factory clusters near Guangzhou">
      <path class="water" d="M190 150 C 205 170, 225 185, 240 215 C 250 240, 262 262, 268 290 L 230 290 C 222 262, 212 238, 200 214 C 188 192, 176 176, 168 158 Z"/>
      <path class="water" d="M228 98 C 236 120, 236 138, 230 152 L 220 150 C 224 136, 224 120, 218 100 Z"/>
      {routes}{dots}
      <text class="sea" x="250" y="282">Pearl River Estuary</text>
    </svg>"""
    items = "".join(f'<li data-reveal><span class="t">{html.escape(PRD[k][2]) if k in PRD and PRD[k][2] else "Close to the fair"}</span><b>{html.escape(c)}</b><small>{html.escape(t)}</small></li>' for k, c, t in near)
    items += "".join(f'<li data-reveal><span class="t far">{html.escape(FAR[k])}</span><b>{html.escape(c)}</b><small>{html.escape(t)}</small></li>' for k, c, t in far)
    return f'<div class="map-wrap" data-reveal>{svgmap}<ul class="map-list" data-stagger=".07">{items}</ul></div><p class="map-note">Positions are schematic and travel times approximate; they vary with traffic and the exact factory address.</p>'


def svg(i):
    return f'<svg class="icon" aria-hidden="true"><use href="#i-{i}"/></svg>'


def head(title, desc):
    return f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>{html.escape(title)}</title>
  <meta name="description" content="{html.escape(desc)}">
  <!--HEAD--><!--/HEAD-->
  <link rel="stylesheet" href="assets/css/pages.css?v=202610180255">
</head>
<body class="nav-over">
  <!--SPRITE--><!--/SPRITE-->
  <!--NAV--><!--/NAV-->
"""


TAIL = """
  <!--FOOTER--><!--/FOOTER-->
  <script src="assets/js/data/itineraries-data.js?v=202610180255" defer></script>
  <script src="assets/js/pages.js?v=202610180255" defer></script>
</body>
</html>
"""


def phase_tags(ps):
    return "".join(f'<span class="tag-phase p{p}">Phase {p}</span>' for p in ps)


def industry_page(d):
    autumn = " · ".join(PHASE_DATES[p][0] for p in d["phases"])
    spring = " · ".join(PHASE_DATES[p][1] for p in d["phases"])
    cats = "".join(f'<div class="cat" data-reveal>{svg("check")}<div><b>{html.escape(a)}</b><small>{html.escape(b)}</small></div></div>' for a, b in d["cats"])
    clusters = prd_map(d["clusters"])
    half = (len(d["checks"]) + 1) // 2
    checks = lambda xs: "".join(f"<li>{svg('check')}<span>{html.escape(x)}</span></li>" for x in xs)
    return head(f"{d['name']} expos in China 2027 · ExpoBusiness Travel Services", d["lede"]) + f"""
  <main data-industry="{d['id']}">
    <section class="phero">
      <div class="phero-photo" aria-hidden="true"><img src="https://images.unsplash.com/photo-1632383380175-812d44ec112b?w=2000&q=72" alt="" width="2000" height="1333" fetchpriority="high"></div>
      <div class="wrap phero-grid">
        <div>
          <nav class="crumbs" aria-label="Breadcrumb"><a href="index.html">Home</a><span>/</span><a href="industries.html">Industries</a><span>/</span>{html.escape(d['short'])}</nav>
          <span class="ind-icon ico-host is-active" data-in style="--k:0"><span class="ico" data-m="{d['m']}">{svg(d['icon'])}</span>{html.escape(d['name'])}</span>
          <h1>{html.escape(d['h1'])}</h1>
          <p class="lede" data-in style="--k:1">{html.escape(d['lede'])}</p>
          <div class="phero-actions" data-in style="--k:2">
            <a class="btn" href="itineraries.html?industry={d['id']}">See {html.escape(d['short'].lower())} itineraries {svg('arrow')}</a>
            <a class="btn btn-ghost" href="inquiry.html">Request a quotation</a>
          </div>
        </div>
        <div class="ind-hero-media" data-in style="--k:1">
          <img src="{U(d['img'])}" alt="{html.escape(d['alt'])}" width="1400" height="1120" fetchpriority="high">
          <div class="ind-hero-badge">{phase_tags(d['phases'])}</div>
          <div class="ind-hero-card">
            <span class="label">Best time at the Canton Fair</span>
            <b>{'Phases ' + ' + '.join(map(str, d['phases'])) if len(d['phases']) > 1 else 'Phase ' + str(d['phases'][0])}</b>
            <div class="row2"><div><span class="label">Spring 2027</span><b class="tnum">{autumn}</b></div><div><span class="label">Autumn 2027</span><b class="tnum">{spring}</b></div></div>
          </div>
        </div>
      </div>
    </section>

    <section class="section" aria-labelledby="catsT">
      <div class="wrap">
        <div class="section-head"><div><h2 id="catsT" class="section-title" data-reveal>What you'll find on the expo floor</h2><p class="section-sub" data-reveal>Main product groups for this industry at the fair. We map your exact products to halls before you fly.</p></div></div>
        <div class="cats" data-stagger=".05">{cats}</div>
      </div>
    </section>

    <section class="section tinted" aria-labelledby="planT">
      <div class="wrap">
        <div class="section-head"><div><h2 id="planT" class="section-title" data-reveal>When to go</h2><p class="section-sub" data-reveal>Canton Fair timing for this industry, plus the China expos of 2027 that suit it.</p></div></div>
        <div class="plan-grid">
          <div class="plan-card" data-reveal>
            <h3>{svg('calendar')}Canton Fair</h3>
            <table>
              <tr><th>Phase</th><td>{phase_tags(d['phases'])}</td></tr>
              <tr><th>Spring 2027 (expected)</th><td class="tnum">{autumn}</td></tr>
              <tr><th>Autumn 2027 (expected)</th><td class="tnum">{spring}</td></tr>
              <tr><th>Venue</th><td>Pazhou Complex, Guangzhou</td></tr>
              <tr><th>Itinerary</th><td>5 days, 4 nights · three fair days</td></tr>
              <tr><th>Departing from</th><td>Manila, Cebu, Clark, Davao</td></tr>
            </table>
            <div class="plan-cta">{"".join(f'<a class="btn btn-sm" href="itineraries.html?open=phase-{p}#phase-{p}">Phase {p} itinerary {svg("arrow")}</a>' for p in d["phases"])}</div>
          </div>
          <div class="plan-card" data-reveal style="--d:.08s">
            <h3>{svg('globe')}China expos 2027</h3>
            <ul class="expo-list" id="indExpos"><li class="label">Loading…</li></ul>
          </div>
        </div>
      </div>
    </section>

    <section class="section" aria-labelledby="clT">
      <div class="wrap">
        <div class="section-head"><div><h2 id="clT" class="section-title" data-reveal>Factory clusters worth a visit</h2><p class="section-sub" data-reveal>Add a factory day before or after the fair. We schedule the visit, the van and the interpreter.</p></div></div>
        {clusters}
      </div>
    </section>

    <section class="section tinted" aria-labelledby="ckT">
      <div class="wrap">
        <div class="section-head"><div><h2 id="ckT" class="section-title" data-reveal>Buyer checklist</h2><p class="section-sub" data-reveal>Questions our coordinators help you ask at the booth and the factory.</p></div></div>
        <div class="checklist-2" data-reveal><ul>{checks(d['checks'][:half])}</ul><ul>{checks(d['checks'][half:])}</ul></div>
        <p class="note" data-reveal style="margin-top:28px">{svg('shield')}<span>{html.escape(d['note'])}</span></p>
      </div>
    </section>

    <section class="section" aria-labelledby="trT">
      <div class="wrap">
        <div class="section-head"><div><h2 id="trT" class="section-title" data-reveal>Recommended itineraries</h2><p class="section-sub" data-reveal>Trips that fit this industry. Every one can be adjusted to your dates and team.</p></div><a class="link-arrow" href="itineraries.html?industry={d['id']}" data-reveal>All matching trips {svg('arrow')}</a></div>
        <div class="mini-rows" id="indTrips"></div>
      </div>
    </section>

    <section class="wrap" aria-labelledby="ctaTitle">
      <div class="cta-band" data-art="{d['icon']}" data-reveal="scale">
        <div><h2 id="ctaTitle">Planning {'an' if d['short'].lower()[0] in 'aeiou' else 'a'} {html.escape(d['short'].lower())} buying trip?</h2><p>Tell us your products and headcount. We'll match the phase, halls and factory visits, then send an itemised quotation.</p></div>
        <div class="cta-actions"><a href="inquiry.html" class="btn">Request a quotation {svg('arrow')}</a><a href="#" class="btn btn-ghost on-dark" data-open-bot="which phase for {d['short'].lower()}">Ask Expo</a></div>
      </div>
    </section>
  </main>
""" + TAIL


def hub():
    tiles = "".join(f'<a href="industry-{d["id"]}.html" style="--i:{i}"><img src="{U(d["tile"], 600)}" alt="" width="600" height="600"><small>{"Phase " + " + ".join(map(str, d["phases"]))}</small><b>{html.escape(d["name"])}</b></a>' for i, d in enumerate(INDUSTRIES))
    rows = "".join(f'''
        <a class="hub-row ico-host" href="industry-{d["id"]}.html" data-reveal>
          <img src="{U(d["img"], 600)}" alt="" loading="lazy" width="600" height="450">
          <div><h2 class="h3"><span class="ico" data-m="{d["m"]}">{svg(d["icon"])}</span>{html.escape(d["name"])}</h2><p>{html.escape(d["lede"])}</p>
          <div class="hub-tags">{phase_tags(d["phases"])}{"".join(f'<span class="c">{html.escape(c[0])}</span>' for c in d["cats"][:4])}</div></div>
          <span class="hub-go">Explore {svg("arrow")}</span>
        </a>''' for d in INDUSTRIES)
    return head("Industries · China trade expos by industry · ExpoBusiness Travel Services", "Canton Fair business trips by industry: electronics, machinery, lighting, construction, furniture, hospitality, fashion and retail.") + f"""
  <main>
    <section class="phero">
      <div class="phero-photo" aria-hidden="true"><img src="https://images.unsplash.com/photo-1711390811937-1b061eaf28ea?w=2000&q=72" alt="" width="2000" height="1333" fetchpriority="high"></div>
      <div class="wrap phero-grid">
        <div>
          <nav class="crumbs" aria-label="Breadcrumb"><a href="index.html">Home</a><span>/</span>Industries</nav>
          <h1>China’s expos, sorted by industry</h1>
          <p class="lede" data-in style="--k:0">Each industry has its own shows, Canton Fair phase, factory clusters and import rules. Pick yours to see which 2027 expos fit, what to check and which itineraries to book.</p>
          <ul class="proof-row" data-in style="--k:1"><li>{svg("calendar")}Phase and dates per industry</li><li>{svg("factory")}Factory clusters to visit</li><li>{svg("shield")}Philippine import notes</li></ul>
        </div>
        <div class="mosaic">{tiles}</div>
      </div>
    </section>
    <section class="wrap" aria-label="Industries"><div class="hub-list" data-stagger=".05">{rows}</div></section>
    <section class="wrap section" aria-labelledby="ctaTitle">
      <div class="cta-band" data-art="grid" data-reveal="scale">
        <div><h2 id="ctaTitle">Industry not listed?</h2><p>The Canton Fair covers far more than these eight. Tell us what you buy and we'll find the right phase and halls.</p></div>
        <div class="cta-actions"><a href="inquiry.html" class="btn">Send an inquiry {svg("arrow")}</a></div>
      </div>
    </section>
  </main>
""" + TAIL


for d in INDUSTRIES:
    (ROOT / f"industry-{d['id']}.html").write_text(industry_page(d), encoding="utf8")
(ROOT / "industries.html").write_text(hub(), encoding="utf8")
print("built", len(INDUSTRIES), "industry pages + hub")
