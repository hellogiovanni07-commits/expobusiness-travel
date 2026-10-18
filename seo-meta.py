"""Adds social share + canonical tags to every page and keeps titles/descriptions within search limits.
Run after build-industries.py and sync-layout.py:  python seo-meta.py"""
import glob, html, re

BASE = "https://hellogiovanni07-commits.github.io/expobusiness-travel/"
DEFAULT_IMG = "https://images.unsplash.com/photo-1768396855393-42624b5f0be5?w=1200&h=630&fit=crop&q=72"
BRAND = "ExpoBusiness"

# Descriptions that ran past ~160 characters.
DESC = {
    "index.html": "Business travel and MICE for Philippine companies at China’s trade expos: Canton Fair trips by phase, expo planning, visas and itemised quotations.",
    "china-expos.html": "The 2027 China trade expo calendar for Philippine buyers: Canton Fair phases, Shanghai, Hong Kong and Shenzhen fairs, visa rules and planning notes.",
    "services.html": "Flights from Manila, hotels near the venue, buyer badges, China M visa assistance, interpreters, factory visits and group delegations for China expos.",
    "industry-horeca.html": "Hotel, restaurant and café supply expos in China for 2027: HOTELEX Shanghai, Canton Fair Phase 2 and the halls, dates and factory clusters to visit.",
}

for path in sorted(glob.glob("*.html")):
    s = open(path, encoding="utf8").read()
    o = s
    # Titles: "Page · ExpoBusiness Travel Services" -> "Page · ExpoBusiness" when that keeps it under 65 chars.
    m = re.search(r"<title>(.*?)</title>", s)
    title = html.unescape(m.group(1))
    if len(title) > 65:
        t2 = title.replace("ExpoBusiness Travel Services", BRAND)
        if len(t2) > 65 and " · " in t2:
            parts = t2.split(" · ")
            t2 = " · ".join(parts[-2:]) if len(" · ".join(parts[-2:])) <= 65 else parts[0]
        title = t2
        s = s.replace(m.group(0), f"<title>{html.escape(title, quote=False)}</title>")
    if path in DESC:
        s = re.sub(r'<meta name="description" content=".*?">', f'<meta name="description" content="{DESC[path]}">', s)
    desc = html.unescape(re.search(r'<meta name="description" content="(.*?)">', s).group(1))
    img = re.search(r'class="(?:phero-photo|hx-photo)[^"]*"[^>]*>\s*<img src="(https://images\.unsplash\.com/[^"?]+)', s)
    img = (img.group(1) + "?w=1200&h=630&fit=crop&q=72") if img else DEFAULT_IMG
    url = BASE + ("" if path == "index.html" else path)
    e = lambda v: html.escape(v, quote=True)
    block = f"""<!--SEO-->
  <link rel="canonical" href="{url}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="ExpoBusiness Travel Services">
  <meta property="og:title" content="{e(title)}">
  <meta property="og:description" content="{e(desc)}">
  <meta property="og:url" content="{url}">
  <meta property="og:image" content="{img}">
  <meta property="og:locale" content="en_PH">
  <meta name="twitter:card" content="summary_large_image">
  <!--/SEO-->"""
    if "<!--SEO-->" in s:
        s = re.sub(r"<!--SEO-->.*?<!--/SEO-->", block, s, flags=re.S)
    elif "  <!--HEAD-->" in s:
        s = s.replace("  <!--HEAD-->", "  " + block + "\n  <!--HEAD-->", 1)
    else:  # the home page is the layout source and has no HEAD marker
        d = re.search(r'<meta name="description" content=".*?">', s).group(0)
        s = s.replace(d, d + "\n  " + block, 1)
    if s != o:
        open(path, "w", encoding="utf8").write(s)
    print(f"{path:30} {len(title):3} {len(desc):3}")
