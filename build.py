"""One command after any content change:   python build.py

1. build-industries.py  regenerates industries.html and industry-*.html
2. sync-layout.py       copies nav/footer/icons from index.html and fills contact details from site-config.js
3. seo-meta.py          share tags, canonical URLs, title/description lengths
4. sitemap.xml          every page plus one URL per expo article (event.html?e=slug)
5. cache version        bumps ?v= on every CSS/JS link so browsers load the new files

See CONTENT-GUIDE.md for where each piece of content lives.
"""
import datetime, json, pathlib, re, subprocess, sys, unicodedata

ROOT = pathlib.Path(__file__).parent
run = lambda f: subprocess.run([sys.executable, str(ROOT / f)], cwd=ROOT, check=True, stdout=subprocess.DEVNULL)

# 5 first, so the copied layout carries the new version
v = datetime.datetime.now().strftime("%Y%m%d%H%M")
for f in [*ROOT.glob("*.html"), ROOT / "sync-layout.py", ROOT / "build-industries.py"]:
    t = f.read_text(encoding="utf8")
    n = re.sub(r"\?v=\w+", f"?v={v}", t)
    if n != t: f.write_text(n, encoding="utf8")

for step in ("build-industries.py", "sync-layout.py", "seo-meta.py"):
    run(step); print("ran", step)

# sitemap: same slug rule as assets/js/expos.js (China list first, world list second)
cfg = (ROOT / "assets/js/data/site-config.js").read_text(encoding="utf8")
SITE = json.loads(cfg[cfg.index("{"):cfg.rindex("}") + 1])
base = SITE["site"]["url"]
def slugify(s):
    s = unicodedata.normalize("NFKD", s.lower()); s = "".join(c for c in s if not unicodedata.combining(c))
    return re.sub(r"[^a-z0-9]+", "-", s.replace("&", " and ")).strip("-")
cn = (ROOT / "assets/js/data/expo-china.js").read_text(encoding="utf8")
world = (ROOT / "assets/js/data/expo-world.js").read_text(encoding="utf8")
rows = [(m.group(1), m.group(2)) for m in re.finditer(r'short: "([^"]+)", city: "([^"]+)"', cn)]
rows += [(m.group(1), m.group(2)) for m in re.finditer(r'"short":"([^"]+)","city":"([^"]+)"', world)]
seen, slugs = set(), []
for short, city in rows:
    s = slugify(short)
    if s in seen: s += "-" + slugify(city)
    seen.add(s); slugs.append(s)
today = datetime.date.today().isoformat()
pages = sorted(p.name for p in ROOT.glob("*.html") if p.name != "event.html")
urls = [base + ("" if p == "index.html" else p) for p in pages] + [f"{base}event.html?e={s}" for s in slugs]
(ROOT / "sitemap.xml").write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    "".join(f"  <url><loc>{u.replace('&', '&amp;')}</loc><lastmod>{today}</lastmod></url>\n" for u in urls) + "</urlset>\n", encoding="utf8")
(ROOT / "robots.txt").write_text(f"User-agent: *\nAllow: /\nDisallow: /brand-kit/\nSitemap: {base}sitemap.xml\n", encoding="utf8")
print(f"sitemap.xml: {len(pages)} pages + {len(slugs)} expo articles · assets v={v}")
