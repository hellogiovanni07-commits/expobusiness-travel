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
# one expo per line in both files; pull the fields the sitemap and feed need
def field(line, k):
    m = re.search(rf'"?{k}"?:\s*"([^"]*)"', line); return m.group(1) if m else ""
rows = [l for l in cn.splitlines() if "short:" in l] + [l for l in world.splitlines() if '"short":' in l]
seen, slugs, items = set(), [], []
for line in rows:
    short, city = field(line, "short"), field(line, "city")
    s = slugify(short)
    if s in seen: s += "-" + slugify(city)
    seen.add(s); slugs.append(s)
    items.append((s, field(line, "name"), city, field(line, "why"), field(line, "month")))
today = datetime.date.today().isoformat()
pages = sorted(p.name for p in ROOT.glob("*.html") if p.name != "event.html")
urls = [base + ("" if p == "index.html" else p) for p in pages] + [f"{base}event.html?e={s}" for s in slugs]
(ROOT / "sitemap.xml").write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    "".join(f"  <url><loc>{u.replace('&', '&amp;')}</loc><lastmod>{today}</lastmod></url>\n" for u in urls) + "</urlset>\n", encoding="utf8")
(ROOT / "robots.txt").write_text(f"User-agent: *\nAllow: /\nDisallow: /brand-kit/\nSitemap: {base}sitemap.xml\n", encoding="utf8")
# RSS feed of expo guides, soonest first
from xml.sax.saxutils import escape as x
feed = "".join(f"<item><title>{x(n)} · 2027 guide</title><link>{base}event.html?e={sl}</link><guid>{base}event.html?e={sl}</guid><category>{x(c)}</category><description>{x(w)}</description></item>\n"
               for sl, n, c, w, mo in sorted(items, key=lambda r: r[4]))
head = f'<rss version="2.0"><channel><title>{x(SITE["brand"]["name"])} expo guides</title><link>{base}world-expos.html</link><description>One guide per 2027 trade show for Philippine buyers.</description><language>en-ph</language>'
(ROOT / "feed.xml").write_text(f'<?xml version="1.0" encoding="UTF-8"?>\n{head}\n{feed}</channel></rss>\n', encoding="utf8")
print(f"sitemap.xml: {len(pages)} pages + {len(slugs)} expo articles · assets v={v}")
