"""Render the ExpoBusiness collateral set: HTML source -> PNG preview (+ per-page PNGs) and PDF.

Usage:  python render.py            (all items)
        python render.py card poster (only items whose id starts with one of the words)

Drives headless Chrome over the DevTools protocol (needs `websocket-client`).
Each HTML file is a stack of `.page` elements. Screen CSS shows trimmed pages on a grey board
(the PNG preview); print CSS gives one page per `.page` at the @page size with bleed (the PDF).
Also writes manifest.json (paths relative to brand-kit/).
"""
import json, os, shutil, subprocess, sys, tempfile, time, urllib.request, base64
import websocket

HERE = os.path.dirname(os.path.abspath(__file__))
PORT = 9339
CHROME = [r"C:\Program Files\Google\Chrome\Application\chrome.exe",
          r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"]

# id, html, title, category, size label, pdf?, notes
# kind: "print" (mm, preview scaled to ~2000px long side) | "digital" (px, PNG at 1x) | "email" (full-height HTML)
ITEMS = [
 # ---- documents & stationery
 dict(id="letterhead", html="letterhead.html", title="Letterhead", cat="documents", size="A4 210x297mm", kind="print",
      notes="Office-printable A4, no bleed. Partnership lockup in header, details in footer."),
 dict(id="business-card", html="business-card.html", title="Business card (front + back)", cat="documents", size="90x54mm + 3mm bleed", kind="print",
      notes="PDF pages are 96x60mm incl. 3mm bleed; trim to 90x54mm. Name, title and phone are placeholders."),
 dict(id="compliment-slip", html="compliment-slip.html", title="Compliment slip", cat="documents", size="DL 210x99mm + 3mm bleed", kind="print",
      notes="One-third A4. Trim to 210x99mm."),
 dict(id="envelope-dl", html="envelope-dl.html", title="Envelope DL (front)", cat="documents", size="DL 220x110mm", kind="print",
      notes="Front face artwork for a window-less DL envelope; return details top left."),
 dict(id="email-signature", html="email-signature.html", title="Email signature", cat="documents", size="HTML, 600px max", kind="email",
      notes="Table-based, inline styles. Swap image src for hosted PNG URLs before pasting into Gmail/Outlook."),
 dict(id="proposal", html="proposal.html", title="Corporate proposal / quotation (cover + inside page)", cat="documents", size="A4 210x297mm, 2 pages", kind="print",
      notes="Cover + itemised quotation page. Every value is a [placeholder]; no prices are pre-filled."),
 dict(id="itinerary", html="itinerary.html", title="Travel itinerary", cat="documents", size="A4 210x297mm", kind="print",
      notes="Day-by-day trip itinerary with flights, hotel and coordinator blocks; example uses a real 2027 show."),
 dict(id="pre-departure-checklist", html="pre-departure-checklist.html", title="Pre-departure checklist", cat="documents", size="A4 210x297mm", kind="print",
      notes="Tick-box checklist issued with the itinerary at the pre-departure briefing."),
 dict(id="trip-request-form", html="trip-request-form.html", title="Trip brief / rate-request form", cat="documents", size="A4 210x297mm", kind="print",
      notes="Fill-in brief a client completes so we can prepare an itemised proposal."),
 dict(id="invoice", html="invoice.html", title="Invoice / official receipt layout", cat="documents", size="A4 210x297mm", kind="print",
      notes="Design layout only, blank fields. BIR-required details (TIN, ATP, serial) to be printed by an accredited printer."),
 # ---- print marketing
 dict(id="company-profile", html="company-profile.html", title="Company profile / capability one-pager", cat="print", size="A4 210x297mm + 3mm bleed", kind="print",
      notes="Capability statement: who we serve, services, how it works, facts from site data."),
 dict(id="trifold", html="trifold.html", title="Trifold brochure (outside + inside)", cat="print", size="A4 landscape 297x210mm + 3mm bleed, roll fold", kind="print",
      notes="Panels 100/100/97mm; inside right panel folds in. Page 1 = outside, page 2 = inside."),
 dict(id="expo-flyer", html="expo-flyer.html", title="2027 expo calendar flyer (front + back)", cat="print", size="A5 148x210mm + 3mm bleed", kind="print",
      notes="Trade-mission leave-behind: expos per month chart (site data) and a selection of real 2027 shows."),
 dict(id="poster-a3", html="poster-a3.html", title="Poster A3", cat="print", size="A3 297x420mm + 3mm bleed", kind="print",
      notes="Event / office poster built on the expo-hall photo used on the website."),
 dict(id="rollup-banner", html="rollup-banner.html", title="Roll-up banner", cat="print", size="850x2000mm + 5mm bleed", kind="print",
      notes="Full-size vector PDF. Keep the bottom 150mm free of key content (it sits in the cassette)."),
 dict(id="booth-backdrop", html="booth-backdrop.html", title="Trade-booth backdrop", cat="print", size="3000x2400mm + 10mm bleed", kind="print",
      notes="Full-size PDF for a 3x2.4m pop-up wall. Logo and message sit above table height (1000mm)."),
 dict(id="postcard", html="postcard.html", title="Postcard (front + back)", cat="print", size="A6 148x105mm + 3mm bleed", kind="print",
      notes="Mailer / handout. Back has message area and address lines."),
 dict(id="name-badge", html="name-badge.html", title="Delegation name badge", cat="print", size="90x120mm + 3mm bleed", kind="print",
      notes="Fits a standard 90x120mm lanyard sleeve. Name, company and trip are placeholders."),
 dict(id="luggage-tag", html="luggage-tag.html", title="Luggage tag (front + back)", cat="print", size="55x110mm + 3mm bleed", kind="print",
      notes="Delegation bag tag; punch hole marked. Back carries owner and trip fields."),
 # ---- digital
 dict(id="newsletter", html="newsletter.html", title="Email newsletter template", cat="digital", size="600px wide HTML", kind="email",
      notes="Table-based 600px email. Replace relative image paths with hosted URLs before sending."),
 dict(id="banner-300x250", html="banner-300x250.html", title="Web banner, medium rectangle", cat="digital", size="300x250px", kind="digital",
      notes="Display ad / partner site banner."),
 dict(id="banner-728x90", html="banner-728x90.html", title="Web banner, leaderboard", cat="digital", size="728x90px", kind="digital",
      notes="Display ad leaderboard."),
 dict(id="banner-1200x628", html="banner-1200x628.html", title="Link / social share banner", cat="digital", size="1200x628px", kind="digital",
      notes="Link-share and LinkedIn/Facebook single-image post size."),
 dict(id="linkedin-banner", html="linkedin-banner.html", title="LinkedIn company page banner", cat="digital", size="1128x191px", kind="digital",
      notes="Left 300px kept quiet: the page logo overlaps it on mobile."),
 dict(id="presentation", html="presentation.html", title="Presentation title + content slide", cat="digital", size="1920x1080px, 2 slides", kind="digital",
      notes="16:9 master slides; PDF has both slides at 1920x1080."),
]

def find_chrome():
    for c in CHROME:
        if os.path.exists(c):
            return c
    sys.exit("Chrome/Edge not found")

class CDP:
    def __init__(self, ws_url):
        self.ws = websocket.create_connection(ws_url, max_size=None, timeout=120)
        self.i = 0
    def call(self, method, **params):
        self.i += 1
        my = self.i
        self.ws.send(json.dumps({"id": my, "method": method, "params": params}))
        while True:
            msg = json.loads(self.ws.recv())
            if msg.get("id") == my:
                if "error" in msg:
                    raise RuntimeError(f"{method}: {msg['error']}")
                return msg.get("result", {})
    def wait_event(self, name, timeout=60):
        end = time.time() + timeout
        while time.time() < end:
            msg = json.loads(self.ws.recv())
            if msg.get("method") == name:
                return msg
        raise TimeoutError(name)
    def js(self, expr):
        r = self.call("Runtime.evaluate", expression=expr, awaitPromise=True, returnByValue=True)
        return r.get("result", {}).get("value")

READY = """(async () => {
  await document.fonts.ready;
  await Promise.all([...document.images].map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; })));
  await new Promise(r => setTimeout(r, 150));
  const b = document.body;
  const pages = [...document.querySelectorAll('.page')].map(p => {
    const r = p.getBoundingClientRect(), bl = parseFloat(getComputedStyle(p).paddingTop) || 0;
    return {x: r.left + bl, y: r.top + bl, w: r.width - 2*bl, h: r.height - 2*bl};
  });
  const br = b.getBoundingClientRect();
  return {w: Math.ceil(br.width), h: Math.ceil(br.height), pages};
})()"""

def shot(cdp, path, x, y, w, h, scale):
    r = cdp.call("Page.captureScreenshot", format="png", captureBeyondViewport=True,
                 clip={"x": x, "y": y, "width": w, "height": h, "scale": scale})
    with open(path, "wb") as f:
        f.write(base64.b64decode(r["data"]))

def render(cdp, item):
    src = os.path.join(HERE, item["html"])
    base = os.path.splitext(item["html"])[0]
    url = "file:///" + src.replace("\\", "/")
    cdp.call("Emulation.setDeviceMetricsOverride", width=1600, height=1000, deviceScaleFactor=1, mobile=False)
    cdp.call("Page.navigate", url=url)
    cdp.wait_event("Page.loadEventFired")
    info = cdp.js(READY)
    # resize viewport to the full board so nothing reflows on capture
    cdp.call("Emulation.setDeviceMetricsOverride", width=info["w"], height=min(info["h"], 16000), deviceScaleFactor=1, mobile=False)
    info = cdp.js(READY)
    files, kind, pages = [], item["kind"], info["pages"]
    if kind == "email":
        shot(cdp, os.path.join(HERE, base + ".png"), 0, 0, info["w"], info["h"], 1.5)
        files.append({"label": "HTML", "href": "collateral/" + item["html"]})
        return base + ".png", files
    if kind == "digital":
        scale = 1
    else:
        longest = max(max(p["w"], p["h"]) for p in pages)
        scale = min(2.0, 2000 / longest)
    if len(pages) == 1:
        p = pages[0]
        shot(cdp, os.path.join(HERE, base + ".png"), p["x"], p["y"], p["w"], p["h"], scale)
    else:
        bs = min(1 if kind == "digital" else 2, 2600 / max(info["w"], info["h"]))
        shot(cdp, os.path.join(HERE, base + ".png"), 0, 0, info["w"], info["h"], bs)
        for n, p in enumerate(pages, 1):
            fn = f"{base}-p{n}.png"
            shot(cdp, os.path.join(HERE, fn), p["x"], p["y"], p["w"], p["h"], scale)
            files.append({"label": f"PNG page {n}", "href": "collateral/" + fn})
    if kind == "digital" and len(pages) == 1:
        files.insert(0, {"label": "PNG", "href": "collateral/" + base + ".png"})
    pdf = cdp.call("Page.printToPDF", printBackground=True, preferCSSPageSize=True,
                   marginTop=0, marginBottom=0, marginLeft=0, marginRight=0)
    if kind == "print" or len(pages) > 1:
        with open(os.path.join(HERE, base + ".pdf"), "wb") as f:
            f.write(base64.b64decode(pdf["data"]))
        files.insert(0, {"label": "PDF", "href": "collateral/" + base + ".pdf"})
    files.append({"label": "HTML", "href": "collateral/" + item["html"]})
    return base + ".png", files

def main():
    only = sys.argv[1:]
    profile = tempfile.mkdtemp(prefix="eb-collateral-")
    proc = subprocess.Popen([find_chrome(), "--headless=new", f"--remote-debugging-port={PORT}",
                             "--remote-allow-origins=*", f"--user-data-dir={profile}", "--hide-scrollbars",
                             "--no-first-run", "--disable-extensions", "--allow-file-access-from-files",
                             "--force-color-profile=srgb", "about:blank"],
                            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    try:
        for _ in range(50):
            try:
                tabs = json.load(urllib.request.urlopen(f"http://127.0.0.1:{PORT}/json/list"))
                page = next(t for t in tabs if t["type"] == "page")
                break
            except Exception:
                time.sleep(0.2)
        cdp = CDP(page["webSocketDebuggerUrl"])
        cdp.call("Page.enable"); cdp.call("Runtime.enable")
        man_path = os.path.join(HERE, "manifest.json")
        old = {m["id"]: m for m in json.load(open(man_path, encoding="utf8"))} if os.path.exists(man_path) else {}
        manifest = []
        for it in ITEMS:
            if only and not any(it["id"].startswith(o) for o in only):
                if it["id"] in old:
                    manifest.append(old[it["id"]])
                continue
            t = time.time()
            preview, files = render(cdp, it)
            print(f"{it['id']:28s} {time.time()-t:5.1f}s  {preview}")
            manifest.append({"id": it["id"], "title": it["title"], "category": it["cat"], "size": it["size"],
                             "preview": "collateral/" + preview, "files": files, "notes": it["notes"]})
        with open(man_path, "w", encoding="utf8") as f:
            json.dump(manifest, f, indent=2, ensure_ascii=False)
    finally:
        proc.terminate()
        try: proc.wait(10)
        except Exception: proc.kill()
        shutil.rmtree(profile, ignore_errors=True)

if __name__ == "__main__":
    main()
