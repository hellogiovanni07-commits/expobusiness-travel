"""Copy the shared header, nav and footer from index.html into every other page.

Edit the nav or footer in index.html, then run:  python sync-layout.py
Blocks live between <!--NAV-->...<!--/NAV--> and <!--FOOTER-->...<!--/FOOTER--> markers.
"""
import re, pathlib

root = pathlib.Path(__file__).parent
HEAD = """
  <meta name="theme-color" content="#c9460b">
  <link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="assets/css/site.css?v=202610180255">
  <script>document.documentElement.classList.add("js");try{if(sessionStorage.getItem("introSeen")!=="1"&&!matchMedia("(prefers-reduced-motion: reduce)").matches){document.documentElement.classList.add("intro-pending");setTimeout(function(){if(!document.querySelector(".intro"))document.documentElement.classList.remove("intro-pending")},6000)}}catch(e){}</script>
  """

# Contact details etc. come from assets/js/data/site-config.js: every <a|span data-site="contact.phone"> gets the value.
import json, html as _h
_cfg = (root / "assets/js/data/site-config.js").read_text(encoding="utf8")
SITE = json.loads(_cfg[_cfg.index("{"):_cfg.rindex("}") + 1])

def fill_site(text):
    def one(m):
        tag, attrs, key = m.group(1), m.group(2), m.group(3)
        val = SITE
        for part in key.split("."): val = val[part]
        ph = val.startswith("[")
        attrs = re.sub(r'\s(class="placeholder"|href="[^"]*")', "", attrs)
        if ph: attrs += ' class="placeholder"'
        elif tag == "a" and ("phone" in key or "mobile" in key): attrs += f' href="tel:{re.sub(r"[^+0-9]", "", val)}"'
        elif tag == "a" and "email" in key: attrs += f' href="mailto:{val}"'
        return f'<{tag}{attrs}>{_h.escape(val, quote=False)}</{tag}>'
    return re.sub(r'<(a|span)((?:\s[^>]*?)?\sdata-site="([\w.]+)"[^>]*)>.*?</\1>', one, text)

index = (root / "index.html").read_text(encoding="utf8")
block = lambda name, text: re.search(rf"<!--{name}-->(.*?)<!--/{name}-->", text, re.S).group(1)
nav, footer, sprite = block("NAV", index), block("FOOTER", index), block("SPRITE", index)

for page in sorted(root.glob("*.html")):
    if page.name == "index.html":
        continue
    html = page.read_text(encoding="utf8")
    current = "industries.html" if page.name.startswith("industry-") else "world-expos.html" if page.name == "event.html" else page.name
    page_nav = nav.replace(' aria-current="page"', "")
    page_nav = page_nav.replace(f'<a href="{current}">', f'<a href="{current}" aria-current="page">', 1)
    if "<!--SPRITE-->" not in html:
        html = re.sub(r"(<body[^>]*>)", r"\1\n  <!--SPRITE--><!--/SPRITE-->", html, count=1)
    for name, value in (("HEAD", HEAD), ("NAV", page_nav), ("FOOTER", footer), ("SPRITE", sprite)):
        html = re.sub(rf"<!--{name}-->.*?<!--/{name}-->", lambda m: f"<!--{name}-->{value}<!--/{name}-->", html, flags=re.S)
    page.write_text(fill_site(html), encoding="utf8")
    print("synced", page.name)

(root / "index.html").write_text(fill_site(index), encoding="utf8")
