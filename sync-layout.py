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
  <link rel="stylesheet" href="assets/css/site.css?v=20261017b">
  <script>document.documentElement.classList.add("js");try{if(sessionStorage.getItem("introSeen")!=="1"&&!matchMedia("(prefers-reduced-motion: reduce)").matches){document.documentElement.classList.add("intro-pending");setTimeout(function(){if(!document.querySelector(".intro"))document.documentElement.classList.remove("intro-pending")},6000)}}catch(e){}</script>
  """

index = (root / "index.html").read_text(encoding="utf8")
block = lambda name, text: re.search(rf"<!--{name}-->(.*?)<!--/{name}-->", text, re.S).group(1)
nav, footer, sprite = block("NAV", index), block("FOOTER", index), block("SPRITE", index)

for page in sorted(root.glob("*.html")):
    if page.name == "index.html":
        continue
    html = page.read_text(encoding="utf8")
    current = "industries.html" if page.name.startswith("industry-") else page.name
    page_nav = nav.replace(' aria-current="page"', "")
    page_nav = page_nav.replace(f'<a href="{current}">', f'<a href="{current}" aria-current="page">', 1)
    if "<!--SPRITE-->" not in html:
        html = re.sub(r"(<body[^>]*>)", r"\1\n  <!--SPRITE--><!--/SPRITE-->", html, count=1)
    for name, value in (("HEAD", HEAD), ("NAV", page_nav), ("FOOTER", footer), ("SPRITE", sprite)):
        html = re.sub(rf"<!--{name}-->.*?<!--/{name}-->", lambda m: f"<!--{name}-->{value}<!--/{name}-->", html, flags=re.S)
    page.write_text(html, encoding="utf8")
    print("synced", page.name)
