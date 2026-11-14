"""Build the whole site:   python build.py

Pages are written from src/<page>.html (main content only) wrapped in one shared layout
(top bar, header, footer, concierge chat). Contact and legal details come from
assets/js/data/site-config.js; a value still in [brackets] is left off the public pages
and listed at the end of the build so nobody publishes an unconfirmed claim.

Also writes: redirect stubs for retired pages, sitemap.xml, and the cache-busting ?v= stamp.
See CONTENT-GUIDE.md.
"""
import datetime, html, json, pathlib, re

ROOT = pathlib.Path(__file__).parent
SRC = ROOT / "src"
V = datetime.datetime.now().strftime("%Y%m%d%H%M")


def load_js(name, var):
    t = (ROOT / "assets/js/data" / name).read_text(encoding="utf8")
    start = re.search(rf"^{re.escape(var)}\s*=", t, re.M).end()
    body = t[start:].strip()
    dec = json.JSONDecoder()
    try:
        return dec.raw_decode(body)[0]
    except json.JSONDecodeError:
        # object literals with bare keys (expo-china.js): quote the keys, then parse the first value
        body = re.sub(r'([{,]\s*)([A-Za-z_]\w*)\s*:', r'\1"\2":', body)
        body = re.sub(r",\s*([}\]])", r"\1", body)
        return dec.raw_decode(body)[0]


SITE = load_js("site-config.js", "window.SITE")
EXPOS = load_js("expo-china.js", "window.EXPO_CN") + load_js("expo-world.js", "window.EXPO_WORLD")
BASE = SITE["site"]["url"]
missing = []


def val(path):
    """Config value, or '' when it is still a [placeholder]."""
    v = SITE
    for p in path.split("."):
        v = v[p]
    if isinstance(v, str) and v.startswith("["):
        missing.append(f"{path} = {v}")
        return ""
    return v


esc = lambda s: html.escape(str(s), quote=True)
PHONE, MOBILE, EMAIL = val("contact.phone"), val("contact.mobile"), val("contact.email")
ADDRESS, HOURS = val("contact.address"), val("contact.hours")
DOT, IATA, PHILGEPS, REG = val("legal.dot"), val("legal.iata"), val("legal.philgeps"), val("legal.registration")
FB, LI = val("social.facebook"), val("social.linkedin")
tel = lambda n: "tel:" + re.sub(r"[^+0-9]", "", n)

# ---------------------------------------------------------------- icons (one inline sprite)
ICONS = {
    "phone": '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
    "mail": '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
    "check": '<path d="M20 6 9 17l-5-5"/>',
    "check-circle": '<circle cx="12" cy="12" r="10"/><path d="m8 12 3 3 5-6"/>',
    "menu": '<path d="M3 6h18M3 12h18M3 18h18"/>',
    "x": '<path d="M18 6 6 18M6 6l12 12"/>',
    "arrow": '<path d="M5 12h14M13 6l6 6-6 6"/>',
    "send": '<path d="M22 2 11 13M22 2l-7 20-4-9-9-4z"/>',
    "receipt": '<path d="M4 2v20l3-2 3 2 2-2 2 2 3-2 3 2V2l-3 2-3-2-2 2-2-2-3 2z"/><path d="M8 8h8M8 12h8M8 16h5"/>',
    "users": '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
    "shield": '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
    "pin": '<path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
    "headset": '<path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1v-6h3zM3 19a2 2 0 0 0 2 2h1v-6H3z"/>',
    "bell": '<path d="M4 17h16"/><path d="M5 17a7 7 0 0 1 14 0"/><path d="M12 10V8M10 8h4"/><path d="M2 20h20"/>',
    "plane": '<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>',
    "ext": '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3"/>',
}
SPRITE = '<svg width="0" height="0" style="position:absolute" aria-hidden="true">' + "".join(
    f'<symbol id="i-{k}" viewBox="0 0 24 24">{v}</symbol>' for k, v in ICONS.items()) + "</svg>"
icon = lambda n, cls="icon": f'<svg class="{cls}" aria-hidden="true"><use href="#i-{n}"/></svg>'

LOGO_MARK = ('<svg viewBox="0 0 44 40" aria-hidden="true"><rect x="7" y="24" width="7" height="13" rx="1.5" fill="#ff8a3d"/>'
             '<rect x="17" y="18" width="7" height="19" rx="1.5" fill="#f26a1b"/><rect x="27" y="12" width="7" height="25" rx="1.5" fill="#c9460b"/>'
             '<path class="logo-arc" d="M3 26 C 12 8, 28 2, 41 6" fill="none" stroke="#d7261e" stroke-width="2.6" stroke-linecap="round"/>'
             '<circle cx="41" cy="6" r="3.2" fill="#d7261e"/></svg>')
LOGO = (f'<a class="logo" href="index.html" aria-label="ExpoBusiness Travel Services, home">{LOGO_MARK}'
        '<span class="logo-text"><b>Expo<span>Business</span></b><small>Travel Services</small></span></a>')

NAV = [("index.html", "home", "Home"), ("expos.html", "expos", "2027 Expos"),
       ("services.html", "services", "Corporate Services"), ("visa.html", "visa", "Visa"), ("about.html", "about", "About")]


def topbar():
    bits = []
    if PHONE: bits.append(f'<a href="{tel(PHONE)}">{icon("phone")}{esc(PHONE)}</a>')
    if EMAIL: bits.append(f'<a href="mailto:{esc(EMAIL)}">{icon("mail")}{esc(EMAIL)}</a>')
    sub = 'Powered by <a href="https://www.immaculateconnectionsph.com/" rel="noopener" target="_blank">Immaculate Connections</a>' + (" (DOT Accredited)" if DOT else "")
    return f'<div class="topbar"><div class="wrap"><div class="tb-contact">{"".join(bits)}</div><div class="tb-sub">{sub}</div></div></div>'


def header(cur):
    cur_attr = ' aria-current="page"'
    links = "".join(f'<a href="{h}"{cur_attr if k == cur else ""}>{t}</a>' for h, k, t in NAV)
    return (f'<header class="site-header" id="top"><div class="wrap">{LOGO}'
            f'<nav class="nav" id="nav" aria-label="Main">{links}<a class="btn nav-cta" href="proposal.html">Request Corporate Proposal</a></nav>'
            f'<a class="btn btn-sm header-cta" href="proposal.html">Request Corporate Proposal</a>'
            f'<button class="burger" type="button" aria-controls="nav" aria-expanded="false" aria-label="Open menu">{icon("menu")}</button>'
            '</div></header>')


def footer():
    # compact: row 1 = logo + links, row 2 = powered-by / address / contact, row 3 = © + accreditation
    badges = [f'<span class="badge"><b>{code}</b> No. {esc(num)}</span>' for code, num in (("DOT", DOT), ("IATA", IATA), ("PhilGEPS", PHILGEPS)) if num]
    accred = " ".join(badges) if badges else "Accreditation and registration details come with every proposal."
    contact = []
    if PHONE: contact.append(f'<a href="{tel(PHONE)}">{esc(PHONE)}</a>')
    if MOBILE: contact.append(f'<a href="{tel(MOBILE)}">{esc(MOBILE)}</a>')
    if EMAIL: contact.append(f'<a href="mailto:{esc(EMAIL)}">{esc(EMAIL)}</a>')
    if HOURS: contact.append(esc(HOURS))
    contact += [f'<a href="{esc(u)}" rel="noopener">{n}</a>' for n, u in (("Facebook", FB), ("LinkedIn", LI)) if u]
    reg = f" Reg. no. {esc(REG)}." if REG else ""
    year = datetime.date.today().year
    links = (("services.html#corporate", "Corporate travel"), ("services.html#missions", "Trade missions"), ("services.html#mice", "Delegations &amp; MICE"),
             ("visa.html", "Business visas"), ("expos.html", "2027 Expos"), ("about.html", "About"), ("about.html#faq", "FAQ"))
    nav = "".join(f'<a href="{h}">{t}</a>' for h, t in links)
    meta = "".join(f'<span>{c}</span>' for c in [f'Powered by <a class="ic-link" href="https://www.immaculateconnectionsph.com/" rel="noopener" target="_blank">Immaculate Connections</a>', esc(ADDRESS)] + contact)
    return f'''<footer class="site-footer"><div class="wrap">
<div class="f-top">{LOGO}<nav class="f-links" aria-label="Footer">{nav}</nav></div>
<p class="f-meta">{meta}</p>
<div class="f-bottom"><span>© {year} ExpoBusiness Travel Services.{reg}</span><span>{accred}</span></div>
</div></footer>'''


CHAT = f'''<button class="cc-fab" type="button" aria-controls="cc" aria-expanded="false"><span class="cc-ava">{icon("bell")}</span><span class="cc-label">Ask Expo</span></button>
<section class="cc-panel" id="cc" role="dialog" aria-label="Ask Expo, ExpoBusiness concierge"><div class="cc-head"><span class="cc-ava">{icon("bell")}</span><span><b>Ask Expo</b><small>ExpoBusiness travel concierge</small></span><button class="cc-x" type="button" aria-label="Close chat">{icon("x")}</button></div>
<div class="cc-log" aria-live="polite"></div><form class="cc-form"><label class="sr-only" for="cc-in">Your question</label><input id="cc-in" type="text" autocomplete="off" placeholder="Ask about visas, dates or delegations"><button class="btn" type="submit" aria-label="Send">{icon("send")}</button></form></section>'''

FONTS = ('<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
         '<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">')

ORG = {
    "@context": "https://schema.org", "@type": "TravelAgency", "name": "ExpoBusiness Travel Services",
    "url": BASE, "description": SITE["brand"]["short"], "areaServed": "PH",
    "parentOrganization": {"@type": "TravelAgency", "name": "Immaculate Connections", "url": "https://www.immaculateconnectionsph.com/"},
    "address": {"@type": "PostalAddress", "streetAddress": "Unit 4E, 4th Floor, JL Millennium Building, Don Jose Avila Street",
                "addressLocality": "Cebu City", "addressRegion": "Cebu", "addressCountry": "PH"},
}
if EMAIL: ORG["email"] = EMAIL
if PHONE: ORG["telephone"] = PHONE


def page(slug, meta, main):
    url = BASE + ("" if slug == "index" else slug + ".html")
    title, desc = meta["title"], meta["desc"]
    img = meta.get("og", "https://images.unsplash.com/photo-1775314054195-85f31de0c944?w=1200&h=630&fit=crop&q=70")
    ld = [ORG] if slug == "index" else []
    if slug != "index":
        ld.append({"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Home", "item": BASE},
            {"@type": "ListItem", "position": 2, "name": meta["crumb"], "item": url}]})
    ld += meta.get("ld", [])
    ld_html = "".join(f'<script type="application/ld+json">{json.dumps(x, ensure_ascii=False)}</script>' for x in ld)
    scripts = "".join(f'<script src="assets/js/{s}?v={V}" defer></script>' for s in meta.get("scripts", []))
    preload = f'<link rel="preload" as="image" href="{meta["preload"]}" fetchpriority="high">' if meta.get("preload") else ""
    return f'''<!doctype html>
<html lang="en-PH" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{esc(title)}</title>
<meta name="description" content="{esc(desc)}">
<link rel="canonical" href="{url}">
<meta property="og:type" content="website"><meta property="og:site_name" content="ExpoBusiness Travel Services">
<meta property="og:title" content="{esc(title)}"><meta property="og:description" content="{esc(desc)}">
<meta property="og:url" content="{url}"><meta property="og:image" content="{esc(img)}"><meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#c9460b">
<link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
{FONTS}{preload}
<link rel="stylesheet" href="assets/css/site.css?v={V}">
<link rel="stylesheet" href="assets/css/motion.css?v={V}">
<link rel="stylesheet" href="assets/css/buttons.css?v={V}">
<script>document.documentElement.classList.replace("no-js","js")</script>
{ld_html}
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<div class="progress" aria-hidden="true"></div>
{SPRITE}
{topbar()}
{header(meta["nav"])}
<main id="main">
{main}
</main>
{footer()}
{CHAT}
<script src="assets/js/data/site-config.js?v={V}"></script>
<script src="assets/js/site.js?v={V}" defer></script>
<script src="assets/js/motion.js?v={V}" defer></script>
<script src="assets/js/concierge.js?v={V}" defer></script>
{scripts}
</body>
</html>
'''


# ---------------------------------------------------------------- expo data helpers
def slugify(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")


def sort_key(e):
    m = re.search(r"\d{1,2}", e["dates_2027"])
    return (e["month"], int(m.group()) if m else 99)


def norm_dates(s):
    s = re.sub(r"^([A-Z][a-z]{2}) (\d+)–(\d+), (\d{4})$", r"\2–\3 \1 \4", s)
    s = re.sub(r"^([A-Z][a-z]{2}) (\d+)–([A-Z][a-z]{2}) (\d+), (\d{4})$", r"\2 \1 – \4 \3 \5", s)
    return re.sub(r"^([A-Z][a-z]{2}) (\d+), (\d{4})$", r"\2 \1 \3", s)


for e in EXPOS:
    e["dates_2027"] = norm_dates(e["dates_2027"])
    if not e["dates_2027"].strip():
        e["dates_2027"] = ["January","February","March","April","May","June","July","August","September","October","November","December"][int(e["month"][5:7]) - 1] + " 2027, dates TBC"
        e["dates_status"] = "expected"
    e.setdefault("country", "Hong Kong" if e["city"] == "Hong Kong" else "China")
    e.setdefault("region", "East Asia")
    e["slug"] = slugify(e["short"])
EXPOS.sort(key=sort_key)
MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]


def expo_row(e):
    m = int(e["month"][5:7])
    status = e.get("dates_status", "expected")
    tag = '<span class="tag tag-ok">Dates confirmed</span>' if status == "confirmed" else '<span class="tag tag-exp">Dates expected</span>'
    link = (f'<a class="link small" href="{esc(e["url"])}" rel="noopener" target="_blank">Organiser {icon("ext")}'
            '<span class="sr-only"> (opens in a new tab)</span></a>') if e.get("url") else ""
    q = (e["name"] + " " + e["city"] + " " + e["country"] + " " + e["sectors"]).lower()
    return (f'<li class="expo-row" data-region="{esc(e["region"])}" data-month="{m}" data-q="{esc(q)}">'
            f'<div class="date">{esc(e["dates_2027"])}<small>{tag}</small></div>'
            f'<div><h3>{esc(e["name"])}</h3><div class="meta">{esc(e["city"])}, {esc(e["country"])} · {esc(e["sectors"])}</div></div>'
            f'<div class="acts">{link}<a class="btn btn-sm btn-ghost" href="proposal.html?expo={e["slug"]}">Plan this trip</a></div></li>')


def expo_rows(items): return "\n".join(expo_row(e) for e in items)


def fmt_range(a, b):
    da, db = datetime.date.fromisoformat(a), datetime.date.fromisoformat(b)
    return f"{da.day}–{db.day} {MONTHS[db.month-1]}" if da.month == db.month else f"{da.day} {MONTHS[da.month-1]} – {db.day} {MONTHS[db.month-1]}"


# ---------------------------------------------------------------- tokens available to src pages
spring = SITE["canton"]["sessions"][0]
PHASE_WHAT = ["Electronics, machinery, lighting, hardware", "Home goods, furniture, gifts, building materials", "Textiles, fashion, toys, health, food"]
world = [e for e in EXPOS if e["region"] != "East Asia" and e["month"] >= "2027-02"]
TOKENS = {
    "PHASES": "".join(f'<li><span class="ph">Phase {i+1}</span><span class="what">{PHASE_WHAT[i]}</span><span class="when">{fmt_range(*p)}</span></li>'
                      for i, p in enumerate(spring["phases"])),
    "CANTON_START": spring["phases"][0][0],
    "EXPO_ROWS": expo_rows(EXPOS),
    "EXPO_COUNT": str(len(EXPOS)),
    "EXPO_NEXT": expo_rows(sorted(world[:3] + [e for e in EXPOS if e["region"] == "East Asia" and e["month"] >= "2027-03"][:1], key=sort_key)),
    "REGION_OPTIONS": "".join(f'<option>{r}</option>' for r in sorted({e["region"] for e in EXPOS})),
    "EXPO_OPTIONS": "".join(f'<option value="{e["slug"]}">{esc(e["short"])} · {esc(e["city"])}</option>' for e in EXPOS),
    "EMAIL": esc(EMAIL), "ADDRESS": esc(ADDRESS),
    "ICON_CHECK": icon("check"), "ICON_ARROW": icon("arrow"), "ICON_OK": icon("check-circle"),
    "ICON_RECEIPT": icon("receipt"), "ICON_USERS": icon("users"), "ICON_SHIELD": icon("shield"),
    "ICON_PIN": icon("pin"), "ICON_HEADSET": icon("headset"), "ICON_SEND": icon("send"), "ICON_PLANE": icon("plane"), "IC_URL": "https://www.immaculateconnectionsph.com/",
    "CONTACT_LINES": "".join(x for x in (
        f'<li>{icon("mail")} <a href="mailto:{esc(EMAIL)}">{esc(EMAIL)}</a></li>' if EMAIL else "",
        f'<li>{icon("phone")} <a href="{tel(PHONE)}">{esc(PHONE)}</a></li>' if PHONE else "",
        f'<li>{icon("pin")} {esc(ADDRESS)}</li>' if ADDRESS else "")),
    "CLIENT_LOGOS": ('<div class="logos">' + "".join(f'<img src="{esc(c["logo"])}" alt="{esc(c["name"])}" loading="lazy">' for c in SITE["clients"]) + "</div>") if SITE["clients"] else "",
}


def fill(text):
    return re.sub(r"\{\{(\w+)\}\}", lambda m: TOKENS[m.group(1)], text)


# ---------------------------------------------------------------- write pages
written = []
for f in sorted(SRC.glob("*.html")):
    t = f.read_text(encoding="utf8")
    m = re.match(r"\s*<!--meta\s*(\{.*?\})\s*-->", t, re.S)
    meta = json.loads(m.group(1))
    main = fill(t[m.end():].strip())
    (ROOT / f.name).write_text(page(f.stem, meta, main), encoding="utf8")
    written.append(f.stem)

# retired pages: keep the old URLs working
REDIRECTS = {
    "inquiry": "proposal.html", "itineraries": "expos.html", "china-expos": "expos.html", "world-expos": "expos.html",
    "event": "expos.html", "industries": "expos.html", **{f"industry-{k}": "expos.html" for k in
    ("construction", "electronics", "fashion", "furniture", "horeca", "lighting", "machinery", "retail")},
}
for old, new in REDIRECTS.items():
    (ROOT / f"{old}.html").write_text(
        f'<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Moved · ExpoBusiness</title>'
        f'<meta name="robots" content="noindex"><link rel="canonical" href="{BASE}{new}">'
        f'<meta http-equiv="refresh" content="0; url={new}"><script>location.replace("{new}"+location.search)</script></head>'
        f'<body><p>This page has moved to <a href="{new}">{new}</a>.</p></body></html>\n', encoding="utf8")

today = datetime.date.today().isoformat()
order = ["index", "services", "expos", "visa", "about", "proposal"]
(ROOT / "sitemap.xml").write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + "".join(
    f'  <url><loc>{BASE}{"" if s == "index" else s + ".html"}</loc><lastmod>{today}</lastmod></url>\n' for s in order if s in written) + "</urlset>\n", encoding="utf8")

print("pages:", ", ".join(written))
print("redirects:", len(REDIRECTS), "· expos:", len(EXPOS))
if missing:
    print("\nNOT ON THE SITE YET (fill in assets/js/data/site-config.js):")
    for x in sorted(set(missing)): print("  -", x)
