"""ExpoBusiness social library generator.

Builds every post in content.py as an HTML page (brand-kit/social/_html/), screenshots it with
headless Chrome/Edge, optimises the PNG (<400 KB) and writes manifest.json.

    python brand-kit/social/render.py            # build everything
    python brand-kit/social/render.py ex-01 tp-  # only ids starting with these prefixes
    python brand-kit/social/render.py --html     # write HTML only, no screenshots

A page that detects overflow paints a 60x60 pure-red square in its top-left corner; the run
reports those files as FAILED so nothing clipped ships.
"""
import html as H, json, os, pathlib, shutil, subprocess, sys, tempfile
from concurrent.futures import ThreadPoolExecutor

from PIL import Image

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parents[1]
OUT_HTML = HERE / "_html"
sys.path.insert(0, str(HERE))
import content  # noqa: E402

SITE = "https://hellogiovanni07-commits.github.io/expobusiness-travel/"
FMT = {"1080x1350": (1080, 1350), "1080x1080": (1080, 1080), "1080x1920": (1080, 1920), "1200x627": (1200, 627)}

# ------------------------------------------------------------------ assets
def _svg(name):
    s = (ROOT / "brand-kit/img/logo" / name).read_text(encoding="utf8")
    s = s.replace(' width="1876" height="400"', "")
    return s

LOGO = {"light": _svg("expobusiness-horizontal-colour.svg"), "dark": _svg("expobusiness-horizontal-reverse.svg"), "white": _svg("expobusiness-horizontal-white.svg")}
PARTNER_PNG = (ROOT / "assets/img/partner/immaculate-connections.png").as_uri()
PHOTO = {  # only images already used on the site
    "hall": "https://images.unsplash.com/photo-1775314054195-85f31de0c944?w=1600&q=65&auto=format&fit=crop",
    "stage": "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=1600&q=65&auto=format&fit=crop",
    "cabin": "https://images.unsplash.com/photo-1483450388369-9ed95738483c?w=1600&q=65&auto=format&fit=crop",
    "meeting": "https://images.unsplash.com/photo-1694253988732-816ab6e60caa?w=1600&q=65&auto=format&fit=crop",
    "passport": "https://images.unsplash.com/photo-1581553673739-c4906b5d0de8?w=1600&q=60&auto=format&fit=crop",
    "lobby": "https://images.unsplash.com/photo-1621293954908-907159247fc8?w=1200&q=65&auto=format&fit=crop",
}

ICON = {
    "plane": '<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>',
    "bed": '<path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20M6 8v9"/>',
    "passport": '<rect x="4" y="2" width="16" height="20" rx="2"/><circle cx="12" cy="10" r="3"/><path d="M8 17h8"/>',
    "users": '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    "receipt": '<path d="M5 2h14v20l-3-2-2 2-2-2-2 2-2-2-3 2z"/><path d="M9 7h6M9 11h6M9 15h4"/>',
    "calendar": '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    "pin": '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
    "check": '<path d="M20 6 9 17l-5-5"/>',
    "clock": '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    "globe": '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
    "bus": '<rect x="3" y="3" width="18" height="14" rx="2"/><path d="M3 10h18M7 21v-4M17 21v-4M7 13.5h.01M17 13.5h.01"/>',
    "chat": '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M8 9h8M8 13h5"/>',
    "factory": '<path d="M2 20h20V9l-6 4V9l-6 4V4H2z"/><path d="M6 16h2M12 16h2M17 16h2"/>',
    "box": '<path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="m3 8 9 5 9-5M12 13v8"/>',
    "file": '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h5"/>',
    "search": '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
    "map": '<path d="M9 3 3 6v15l6-3 6 3 6-3V3l-6 3z"/><path d="M9 3v15M15 6v15"/>',
    "user": '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    "glass": '<path d="M8 22h8M12 15v7M6 2h12l-1 7a5 5 0 0 1-10 0z"/>',
    "mic": '<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0M12 17v5"/>',
    "arrow": '<path d="M5 12h14M13 6l6 6-6 6"/>',
    "shield": '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
    "card": '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M6 10h6M6 14h9"/>',
    "plug": '<path d="M9 2v6M15 2v6M6 8h12v4a6 6 0 0 1-12 0zM12 18v4"/>',
    "camera": '<path d="M3 7h4l2-3h6l2 3h4v13H3z"/><circle cx="12" cy="13" r="4"/>',
    "mail": '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 6 10 7 10-7"/>',
    "swap": '<path d="m17 1 4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>',
    "list": '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
    "ticket": '<path d="M3 7V5h18v4a3 3 0 0 0 0 6v4H3v-2a3 3 0 0 0 0-6z"/><path d="M14 5v14" stroke-dasharray="2 3"/>',
    "seat": '<path d="M7 3v10h10M7 13l-2 8M17 13l2 8M7 17h10"/>',
    "briefcase": '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2M2 13h20"/>',
    "shoe": '<path d="M3 16v-5l4-1 3 3h4l7 2v3H3z"/><path d="M3 19h18"/>',
    "note": '<path d="M4 4h16v16H4z"/><path d="M8 8h8M8 12h8M8 16h5"/>',
}

def ic(name, cls="ic"):
    return f'<svg class="{cls}" viewBox="0 0 24 24" aria-hidden="true">{ICON[name]}</svg>'

def e(s):
    return H.escape(str(s), quote=False)

# ------------------------------------------------------------------ base css
BASE_CSS = r"""
*{box-sizing:border-box;margin:0;padding:0}
:root{--or:#f26a1b;--or2:#ff8a3d;--ink-or:#c9460b;--red:#d7261e;--navy:#16163a;--navy2:#2a2a5c;--off:#fff7f1;--ink:#34344f;--ink2:#5a5a72;--line:#ecebf1;--peach:#ffb27d;--mute:#c9c8db;
--h:"Plus Jakarta Sans",Inter,Arial,sans-serif;--b:Inter,Arial,sans-serif}
html,body{width:var(--W);height:var(--H);overflow:hidden;background:#fff}
body{font-family:var(--b);color:var(--ink);-webkit-font-smoothing:antialiased;text-rendering:geometricPrecision}
.cv{position:relative;width:var(--W);height:var(--H);overflow:hidden;display:flex;flex-direction:column;padding:var(--P);background:#fff}
.cv.dark{background:var(--navy)}
.ic{width:1em;height:1em;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round;flex:none}
.hd{display:flex;align-items:center;justify-content:space-between;gap:24px;position:relative;z-index:3;flex:none}
.logo{display:block;height:var(--LOGO);flex:none}.logo svg{height:100%;width:auto;display:block}
.tag{font:700 19px/1.2 var(--h);letter-spacing:.16em;text-transform:uppercase;color:var(--ink-or);white-space:nowrap}
.dark .tag{color:var(--peach)}
h1,h2,h3{font-family:var(--h);color:var(--navy);letter-spacing:-.03em;font-weight:800;line-height:1.04;text-wrap:balance}
.dark h1,.dark h2,.dark h3{color:#fff}
.kick{font:700 21px/1.25 var(--h);letter-spacing:.15em;text-transform:uppercase;color:var(--ink-or)}
.dark .kick{color:var(--peach)}
.lead{font:400 30px/1.42 var(--b);color:var(--ink2);text-wrap:pretty}
.dark .lead{color:var(--mute)}
.body{flex:1 1 auto;min-height:0;display:flex;flex-direction:column;position:relative;z-index:2}
.ft{flex:none;display:flex;align-items:center;justify-content:space-between;gap:24px;padding-top:26px;margin-top:24px;border-top:2px solid var(--line);position:relative;z-index:3}
.dark .ft{border-top-color:rgba(255,255,255,.16)}
.cta{display:flex;align-items:center;gap:16px;min-width:0}
.cta .pill{display:inline-flex;align-items:center;gap:10px;background:var(--ink-or);color:#fff;font:700 22px/1 var(--h);padding:15px 24px;border-radius:999px;white-space:nowrap}
.cta .pill .ic{font-size:24px;stroke-width:2.2}
.url{font:500 17px/1.35 var(--b);color:var(--ink2);word-break:break-all}
.dark .url{color:var(--mute)}
.url b{color:var(--navy);font-weight:600}.dark .url b{color:#fff}
.partner{display:flex;align-items:center;gap:14px;flex:none}
.cta.stack{flex-direction:column;align-items:flex-start;gap:10px}
.partner small{font:600 16px/1.25 var(--b);color:var(--ink2);text-align:right}
.partner img{height:86px;width:auto;display:block}
.deco{position:absolute;pointer-events:none}
.note{font:400 18px/1.4 var(--b);color:var(--ink2)}
.dark .note{color:var(--mute)}
.chip{display:inline-flex;align-items:center;gap:8px;font:600 20px/1 var(--b);padding:10px 16px;border-radius:999px;border:1.5px solid var(--line);color:var(--navy);white-space:nowrap}
.status{display:inline-flex;align-items:center;gap:10px;font:600 20px/1 var(--b);white-space:nowrap}
.status i{width:14px;height:14px;border-radius:50%;background:var(--or);display:block}
.status.exp i{background:transparent;border:2.5px solid var(--or)}
/* story safe zones */
.f-1080x1920 .cv{padding:150px 84px 210px}
.f-1200x627 .tag{font-size:15px}
"""

FIT_JS = r"""
<script>
function fitAll(){
 document.querySelectorAll('[data-fit]').forEach(el=>{let s=parseFloat(getComputedStyle(el).fontSize),min=s*.45;
  const hh=el.dataset.fit==='h';while((el.scrollWidth>el.clientWidth+1||(hh&&el.scrollHeight>el.clientHeight+1))&&s>min){s-=2;el.style.fontSize=s+'px'}});
 const cv=document.querySelector('.cv'),R=cv.getBoundingClientRect();let bad=[];
 cv.querySelectorAll('*').forEach(el=>{if(el.closest('.deco')||el.closest('svg'))return;const r=el.getBoundingClientRect();
  if(r.width&&(r.right>R.right+1||r.bottom>R.bottom+1||r.left<R.left-1||r.top<R.top-1))bad.push(el);
  const cs=getComputedStyle(el);if(el.clientWidth>0&&cs.display!=='inline'&&cs.overflow==='visible'&&el.scrollWidth>el.clientWidth+2&&!el.hasAttribute('data-clip'))bad.push(el);
  if(el.clientHeight>0&&cs.display!=='inline'&&cs.flexGrow!=='0'&&cs.overflow==='visible'&&el.scrollHeight>el.clientHeight+6&&!el.hasAttribute('data-clip'))bad.push(el);});
 document.querySelectorAll('.body').forEach(el=>{if(el.scrollHeight>el.clientHeight+2)bad.push(el)});
 if(bad.length){const b=document.createElement('div');b.style.cssText='position:absolute;left:0;top:0;width:60px;height:60px;background:#ff0000;z-index:999';cv.appendChild(b);
  document.title='OVERFLOW '+bad.slice(0,4).map(x=>x.className||x.tagName).join(',');}
}
document.fonts.ready.then(()=>setTimeout(fitAll,50));
</script>"""

FONTS = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700;800&display=block" rel="stylesheet">'

def page(fmt, inner, css="", theme="light"):
    w, h = FMT[fmt]
    pad = {"1080x1350": "68px 72px 60px", "1080x1080": "60px 64px 52px", "1080x1920": "150px 84px 210px", "1200x627": "40px 52px 34px"}[fmt]
    logo_h = {"1080x1350": "50px", "1080x1080": "46px", "1080x1920": "56px", "1200x627": "38px"}[fmt]
    return (f'<!doctype html><html lang="en-GB"><head><meta charset="utf-8">{FONTS}'
            f'<style>:root{{--W:{w}px;--H:{h}px;--P:{pad};--LOGO:{logo_h}}}{BASE_CSS}{css}</style></head>'
            f'<body class="f-{fmt}"><div class="cv {theme}">{inner}</div>{FIT_JS}</body></html>')

def header(theme, tag):
    return f'<div class="hd"><span class="logo">{LOGO["dark" if theme == "dark" else "light"]}</span><span class="tag">{e(tag)}</span></div>'

def footer(cta, path="", partner=False, short=False):
    url = SITE.replace("https://", "") + path
    base, _, tail = url.rpartition("expobusiness-travel/")
    url_html = f'{e(base)}<b>expobusiness-travel/{e(tail)}</b>'
    right = ""
    if partner:
        right = f'<div class="partner"><small>In partnership<br>with</small><img src="{PARTNER_PNG}" alt="Immaculate Connections"></div>'
    urlbit = "" if short else f'<span class="url">{url_html}</span>'
    return f'<div class="ft"><div class="cta{" stack" if partner else ""}"><span class="pill">{e(cta)} {ic("arrow")}</span>{urlbit}</div>{right}</div>'

def arc(cls="", color="#f26a1b", sw=3, op=.9):
    """The logo's rising flight arc, used as a decorative motif."""
    return (f'<svg class="deco {cls}" viewBox="0 0 400 200" preserveAspectRatio="none"><path d="M4 196 C 90 60, 230 10, 392 26" fill="none" '
            f'stroke="{color}" stroke-width="{sw}" stroke-linecap="round" opacity="{op}" vector-effect="non-scaling-stroke"/>'
            f'<circle cx="392" cy="26" r="7" fill="{color}" opacity="{op}"/></svg>')

def bars(cls=""):
    return (f'<svg class="deco {cls}" viewBox="0 0 30 26"><rect x="0" y="12" width="7" height="14" rx="1.5" fill="#ff8a3d"/>'
            f'<rect x="10" y="6" width="7" height="20" rx="1.5" fill="#f26a1b"/><rect x="20" y="0" width="7" height="26" rx="1.5" fill="#c9460b"/></svg>')

# ================================================================== layouts
# ---- A. expo spotlight ----------------------------------------------------
CSS_EXPO = r"""
.cv{background:var(--navy);padding:0}
.top{position:relative;padding:68px 72px 0;height:640px;display:flex;flex-direction:column;overflow:hidden}
.top .arcbig{right:-90px;top:96px;width:640px;height:250px}
.top .grid{inset:0;background-image:linear-gradient(rgba(255,255,255,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.05) 1px,transparent 1px);background-size:60px 60px}
.top .kick{margin-top:auto}
.top .full{margin-bottom:56px}
.big{font:800 172px/1 var(--h);color:#fff;letter-spacing:-.05em;margin-top:22px;white-space:nowrap;overflow:hidden;padding-bottom:.06em}
.full{font:600 30px/1.3 var(--h);color:var(--mute);margin-top:16px;max-width:860px;letter-spacing:-.01em}
.band{display:flex;align-items:stretch;flex:none;position:relative;z-index:2}
.band .date{background:var(--or);color:#fff;padding:30px 72px 28px;flex:1;min-width:0}
.band .date small{display:block;font:700 18px/1 var(--h);letter-spacing:.16em;text-transform:uppercase;opacity:.9}
.band .date b{display:block;font:800 52px/1.05 var(--h);letter-spacing:-.03em;margin-top:12px}
.band .st{background:var(--ink-or);color:#fff;padding:30px 44px;display:flex;flex-direction:column;justify-content:center;gap:10px;width:300px;flex:none}
.band .st small{font:600 18px/1.3 var(--b);opacity:.9}
.band .st .status{color:#fff;font-size:24px}.band .st .status i{background:#fff}.band .st .status.exp i{background:transparent;border-color:#fff}
.low{background:#fff;flex:1;display:flex;flex-direction:column;padding:40px 72px 56px;min-height:0}
.facts{display:grid;grid-template-columns:1fr 1.25fr;gap:34px 48px}
.fact{display:flex;gap:16px;align-items:flex-start;min-width:0}
.fact .ic{font-size:34px;color:var(--ink-or);margin-top:2px}
.fact small{display:block;font:700 16px/1 var(--h);letter-spacing:.14em;text-transform:uppercase;color:var(--ink2);margin-bottom:8px}
.fact b{display:block;font:700 27px/1.25 var(--h);color:var(--navy);letter-spacing:-.015em}
.fact span{display:block;font:400 21px/1.4 var(--b);color:var(--ink2);margin-top:4px}
.why{margin-top:30px;font:400 25px/1.45 var(--b);color:var(--ink);border-left:4px solid var(--or);padding-left:22px}
.low .ft{border-top-color:var(--line)}
.plan{margin-top:auto;display:grid;grid-template-columns:repeat(3,1fr);gap:0;border:1.5px solid var(--line);border-radius:14px}
.plan div{padding:18px 20px;display:flex;gap:12px;align-items:flex-start}
.plan div+div{border-left:1.5px solid var(--line)}
.plan .ic{font-size:30px;color:var(--ink-or)}
.plan b{display:block;font:700 19px/1.2 var(--h);color:var(--navy)}
.plan span{display:block;font:400 16px/1.35 var(--b);color:var(--ink2);margin-top:3px}
"""

def expo_spotlight(p, x):
    st = x["dates_status"]
    inner = f'''
<div class="top dark">{'<div class="deco grid"></div>'}{arc("arcbig", "#f26a1b", 3, .55)}
 {header("dark", "Expo spotlight")}
 <div class="kick">{e(p["kicker"])}</div>
 <div class="big" data-fit>{e(x["short"])}</div>
 <div class="full">{e(x["name"])}</div>
</div>
<div class="band"><div class="date"><small>2027 dates</small><b data-fit style="white-space:nowrap;overflow:hidden;padding-bottom:.08em">{e(fmt_dates(x))}</b></div>
 <div class="st"><span class="status{'' if st == 'confirmed' else ' exp'}"><i></i>{'Confirmed' if st == 'confirmed' else 'Expected'}</span><small>{'Published by the organiser' if st == 'confirmed' else 'Usual dates; check before booking'}</small></div></div>
<div class="low"><div class="body">
 <div class="facts">
  <div class="fact">{ic("pin")}<div><small>Where</small><b>{e(x["city"])}, {e(x["country"])}</b><span>{e(x.get("venue", ""))}</span></div></div>
  <div class="fact">{ic("briefcase")}<div><small>Sectors</small><b style="font-size:24px">{e(x["sectors"])}</b></div></div>
 </div>
 <p class="why">{e(x["why"])}</p>
 <div class="plan"><div>{ic("ticket")}<p><b>Register</b><span>As a buyer or visitor</span></p></div><div>{ic("bed")}<p><b>Hotel near the venue</b><span>Book early for fair weeks</span></p></div><div>{ic("passport")}<p><b>Visa</b><span>{e(VISA_SHORT.get(x["country"], "Check the rules early"))}</span></p></div></div>
 </div>{footer("See the 2027 calendar", "expos.html")}</div>'''
    return page(p["format"], inner, CSS_EXPO)

def fmt_dates(x, year=True):
    import re
    d = (x.get("dates_2027") or "").strip()
    if not d:
        m = int(x["month"][5:])
        return f'{MONTHS[m-1]} 2027 (usual month)' if year else f'{MONTHS[m-1][:3]} (usual month)'
    m = re.match(r"^([A-Z][a-z]{2}) (\d+)–(?:([A-Z][a-z]{2}) )?(\d+), 2027$", d)
    if m:
        a, d1, b, d2 = m.groups()
        d = f"{d1} {a} – {d2} {b}" if b else f"{d1}–{d2} {a}"
        return d + (" 2027" if year else "")
    return d if year else d.replace(" 2027", "")

VISA_SHORT = {"UAE": "Usually arranged before travel", "Germany": "Schengen; book the appointment early", "Italy": "Schengen; book the appointment early",
              "Japan": "Short-term business visa", "China": "Business (M) visa; allow 4–6 weeks", "Philippines": "Not needed: it is in Metro Manila",
              "USA": "B-1, with an embassy interview", "Hong Kong": "Visa-free for 14 days"}
MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

# ---- B. calendar month ----------------------------------------------------
CSS_CAL = r"""
.cv{background:#fff}
.mhead{display:flex;align-items:flex-end;gap:30px;margin-top:40px;flex:none}
.mnum{font:800 220px/.9 var(--h);color:var(--or);letter-spacing:-.06em;padding-right:.08em}
.mname h1{font-size:76px;line-height:.98}
.mname .kick{margin-bottom:12px}
.rows{margin-top:34px;border-top:3px solid var(--navy);flex:none}
.row{display:grid;grid-template-columns:200px 1fr auto;gap:22px;align-items:center;padding:13px 0;border-bottom:1.5px solid var(--line)}
.row .d{font:700 22px/1.2 var(--h);color:var(--ink-or);letter-spacing:-.01em}
.row .n{min-width:0}
.row .n b{display:block;font:700 25px/1.2 var(--h);color:var(--navy);letter-spacing:-.015em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.row .n span{display:block;font:400 19px/1.3 var(--b);color:var(--ink2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.row .status{font-size:0;gap:0}.row .status i{width:16px;height:16px}
.legend{display:flex;gap:30px;align-items:center;margin-top:20px;flex-wrap:wrap}
.legend .status{font-size:19px;color:var(--ink2)}
.legend .more{margin-left:auto;font:700 20px/1.2 var(--h);color:var(--navy)}
"""

def cal_rows(xs, limit):
    rows = "".join(
        f'<div class="row"><div class="d">{e(fmt_dates(x, False))}</div><div class="n"><b data-clip>{e(x.get("short") or x["name"])}</b><span data-clip>{e(x["city"])}{"" if x["city"] == x["country"] else ", " + e(x["country"])} · {e(x["sectors"].split(",")[0])}</span></div>'
        f'<span class="status{"" if x["dates_status"] == "confirmed" else " exp"}"><i></i></span></div>' for x in xs[:limit])
    return rows

def calendar_month(p, xs, total):
    more = total - len(xs)
    inner = f'''{header("light", "Trade-show calendar")}
<div class="body">
 <div class="mhead"><div class="mnum">{e(p["num"])}</div><div class="mname"><div class="kick">2027 trade expos</div><h1>{p["month_title"]}</h1></div></div>
 <div class="rows">{cal_rows(xs, 99)}</div>
 <div class="legend"><span class="status"><i></i>Dates confirmed</span><span class="status exp"><i></i>Dates expected</span>{f'<span class="more">+{more} more on the calendar</span>' if more > 0 else ''}</div>
</div>{footer("Full calendar", "expos.html")}'''
    return page(p["format"], inner, CSS_CAL)

CSS_GLANCE = r"""
.cv{background:var(--navy)}
.wrapg{display:grid;grid-template-columns:430px 1fr;gap:44px;flex:1;min-height:0;margin-top:18px}
.wrapg h1{font-size:50px;line-height:1.02}
.wrapg .lead{font-size:20px;margin-top:14px}
.nums{display:flex;gap:30px;margin-top:22px}
.nums b{display:block;font:800 58px/1 var(--h);color:var(--or);letter-spacing:-.04em}
.nums small{font:600 15px/1.2 var(--b);color:var(--mute)}
.chart{display:flex;align-items:flex-end;gap:10px;height:100%;padding-bottom:30px;position:relative}
.chart .c{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%;position:relative}
.chart .c i{display:block;width:100%;background:rgba(255,255,255,.18);border-radius:6px 6px 0 0}
.chart .c.hi i{background:var(--or)}
.chart .c b{font:700 17px/1 var(--h);color:#fff;margin-bottom:8px}
.chart .c span{position:absolute;bottom:-28px;font:600 14px/1 var(--b);color:var(--mute)}
.f-1200x627 .ft{padding-top:16px;margin-top:14px}
.f-1200x627 .cta .pill{font-size:17px;padding:11px 18px}
.f-1200x627 .url{font-size:14px}
"""

def calendar_glance(p, allx):
    counts = [sum(1 for x in allx if int(x["month"][5:]) == m) for m in range(1, 13)]
    mx = max(counts)
    cols = "".join(f'<div data-clip class="c{" hi" if c == mx else ""}"><b>{c or ""}</b><i style="height:{max(c / mx * 72, 1.5):.1f}%"></i><span>{MONTHS[i][:3]}</span></div>' for i, c in enumerate(counts))
    countries = len({x["country"] for x in allx})
    inner = f'''{header("dark", "Trade-show calendar")}
<div class="body"><div class="wrapg"><div><div class="kick" style="margin-top:6px">2027 at a glance</div><h1>{p["title_html"]}</h1>
 <p class="lead">Trade expos per month on our 2027 calendar. {MONTHS[counts.index(mx)]} is the busiest.</p>
 <div class="nums"><div><b>{len(allx)}</b><small>trade expos</small></div><div><b>{countries}</b><small>countries</small></div></div></div>
 <div class="chart">{cols}</div></div></div>{footer("Plan your year", "expos.html")}'''
    return page(p["format"], inner, CSS_GLANCE + CSS_LI, "dark")

# ---- C. destination guide -------------------------------------------------
CSS_DEST = r"""
.cv{background:#fff}
.route{right:-120px;top:120px;width:900px;height:520px}
.dots{right:40px;top:110px;width:420px;height:420px;background-image:radial-gradient(rgba(22,22,58,.14) 2px,transparent 2.4px);background-size:28px 28px;-webkit-mask-image:radial-gradient(circle at 60% 40%,#000 30%,transparent 72%)}
.country{padding-bottom:.08em;font:800 128px/.95 var(--h);color:var(--navy);letter-spacing:-.05em;margin-top:44px;white-space:nowrap;overflow:hidden}
.sub{font:600 26px/1.3 var(--h);color:var(--ink2);margin-top:14px;letter-spacing:-.01em}
.dgrid{display:grid;grid-template-columns:290px 1fr;gap:44px;margin:auto 0;align-items:center;padding:24px 0}
.stat b{display:block;font:800 210px/.9 var(--h);color:var(--or);letter-spacing:-.06em}
.stat small{display:block;font:600 21px/1.3 var(--b);color:var(--ink2);margin-top:14px}
.ex{display:flex;flex-direction:column;gap:12px}
.ex div{display:flex;justify-content:space-between;align-items:baseline;gap:16px;border-bottom:1.5px solid var(--line);padding-bottom:13px}
.ex{gap:15px}
.ex b{font:700 27px/1.2 var(--h);color:var(--navy);letter-spacing:-.01em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ex span{font:500 21px/1.25 var(--b);color:var(--ink2);white-space:nowrap}
.visa{display:flex;gap:20px;align-items:flex-start;background:var(--off);border-radius:14px;padding:22px 26px}
.visa .ic{font-size:38px;color:var(--ink-or);margin-top:4px}
.visa b{display:block;font:700 24px/1.2 var(--h);color:var(--navy)}
.visa span{display:block;font:400 20px/1.4 var(--b);color:var(--ink);margin-top:4px}
.visa em{display:block;font:400 italic 16px/1.3 var(--b);color:var(--ink2);margin-top:6px}
"""

def destination(p, xs):
    shown = sorted(xs, key=sort_key)[:p.get("show", 6)]
    cities = []
    for x in sorted(xs, key=sort_key):
        if x["city"] not in cities:
            cities.append(x["city"])
    ex = "".join(f'<div><b data-clip>{e(x.get("short") or x["name"])}</b><span>{e(x["city"])} · {MONTHS[int(x["month"][5:])-1][:3]}</span></div>' for x in shown)
    inner = f'''<div class="deco dots"></div>{arc("route", "#f26a1b", 2.5, .35)}
{header("light", "Destination guide")}
<div class="body">
 <div class="country" data-fit>{e(p["country_title"])}</div>
 <div class="sub">for Philippine business travellers · {e(", ".join(cities[:4]))}</div>
 <div class="dgrid"><div class="stat"><b>{len(xs)}</b><small>trade expo{"s" if len(xs) != 1 else ""} on our 2027 calendar</small></div><div class="ex">{ex}</div></div>
 <div class="visa">{ic("passport")}<div><b>Visa: {e(p["visa_status"])}</b><span>{e(p["visa_note"])}</span><em>Philippine ordinary passport, short business visit. Checked Nov 2026; rules change, so we confirm each case.</em></div></div>
</div>{footer("Plan a trip", p["path"])}'''
    return page(p["format"], inner, CSS_DEST)

def sort_key(x):
    import re
    m = re.search(r"\d+", x.get("dates_2027") or "")
    d = x.get("dates_2027") or ""
    day = int(m.group()) if m and int(m.group()) < 32 else (25 if "Late" in d else 12 if "Mid" in d or "Second" in d else 1)
    return (x["month"], day)

# ---- D. visa tips ---------------------------------------------------------
CSS_VISA = r"""
.cv{background:#fff}
.rule{left:0;top:0;bottom:0;width:14px;background:linear-gradient(var(--or),var(--red))}
.vt{margin-top:52px}
.vt h1{font-size:74px;margin-top:16px}
.vt .lead{margin-top:22px;max-width:880px}
.split{display:grid;grid-template-columns:1.35fr 1fr;gap:26px;margin-top:44px}
.col{border-radius:16px;padding:26px 28px}
.col.req{background:var(--navy);color:#fff}
.col.req h3{color:#fff}
.split{flex:1;min-height:0;margin-bottom:28px}.col{display:flex;flex-direction:column}.col ul{flex:1;display:flex;flex-direction:column;justify-content:space-around}
.col.free{background:var(--off)}
.col h3{font-size:26px;display:flex;justify-content:space-between;align-items:baseline}
.col h3 em{font:800 52px/1 var(--h);font-style:normal;color:var(--or)}
.col ul{list-style:none;margin-top:16px}
.col li{font:600 25px/1.3 var(--b);padding:12px 0;border-top:1px solid rgba(255,255,255,.14)}
.col.free li{border-top-color:#f2dccb;color:var(--navy)}
.col li small{display:block;font:400 19px/1.35 var(--b);color:var(--mute);margin-top:2px}
.col.free li small{color:var(--ink2)}
.stats{display:grid;grid-template-columns:1fr 1fr;gap:0;margin-top:50px;border-top:3px solid var(--navy)}
.stats div{padding:30px 0 0}
.stats div+div{border-left:1.5px solid var(--line);padding-left:40px}
.stats b{display:block;font:800 190px/.85 var(--h);color:var(--or);letter-spacing:-.06em}
.stats b sup{font-size:34px;letter-spacing:0;color:var(--navy);vertical-align:top;margin-left:6px;position:relative;top:18px}
.stats span{display:block;font:700 34px/1.2 var(--h);color:var(--navy);margin-top:16px}
.stats small{display:block;font:400 21px/1.4 var(--b);color:var(--ink2);margin-top:6px}
.points{margin-top:42px;display:flex;flex-direction:column;gap:24px;flex:1;justify-content:space-evenly;margin-bottom:24px}
.pt{display:grid;grid-template-columns:76px 1fr;gap:20px;align-items:start}
.pt .n{font:800 46px/1 var(--h);color:var(--or);letter-spacing:-.04em}
.pt b{display:block;font:700 34px/1.2 var(--h);color:var(--navy);letter-spacing:-.015em}
.pt span{display:block;font:400 25px/1.42 var(--b);color:var(--ink2);margin-top:6px}
.callout{margin-top:auto;display:flex;gap:18px;align-items:center;font:500 19px/1.4 var(--b);color:var(--ink2);border-top:1.5px solid var(--line);padding-top:20px}
.callout .ic{font-size:30px;color:var(--ink-or)}
"""
DISCLAIMER = "The embassy or consulate decides every application. We prepare and file; we do not guarantee approval. Checked Nov 2026."

def visa_post(p):
    k = p["kind"]
    if k == "split":
        req = "".join(f"<li>{e(a)}<small>{e(b)}</small></li>" for a, b in p["required"])
        free = "".join(f"<li>{e(a)}<small>{e(b)}</small></li>" for a, b in p["free"])
        mid = f'''<div class="split"><div class="col req"><h3>Visa required <em>{len(p["required"])}</em></h3><ul>{req}</ul></div>
<div class="col free"><h3>Visa-free <em>{len(p["free"])}</em></h3><ul>{free}</ul></div></div>'''
    elif k == "stats":
        mid = "<div class=\"stats\">" + "".join(f'<div><b>{a}<sup>days</sup></b><span>{e(b)}</span><small>{e(c)}</small></div>' for a, b, c in p["stats"]) + "</div>"
    else:
        mid = '<div class="points">' + "".join(f'<div class="pt"><div class="n">{i:02d}</div><div><b>{e(a)}</b><span>{e(b)}</span></div></div>' for i, (a, b) in enumerate(p["points"], 1)) + "</div>"
    inner = f'''<div class="deco rule"></div>{header("light", "Visa & documents")}
<div class="body"><div class="vt"><div class="kick">{e(p["kicker"])}</div><h1>{p["title_html"]}</h1>{f'<p class="lead">{p["lead"]}</p>' if p.get("lead") else ""}</div>
{mid}
<div class="callout">{ic("shield")}<span>{DISCLAIMER}</span></div></div>{footer("Visa help", "visa.html")}'''
    return page(p["format"], inner, CSS_VISA)

# ---- E. services ----------------------------------------------------------
CSS_SVC = r"""
.cv{background:#fff}
.corner{right:-180px;top:-200px;width:620px;height:620px;border-radius:50%;border:2px solid #f9d4bd}
.corner2{right:-90px;top:-110px;width:440px;height:440px;border-radius:50%;border:2px solid #fbe3d4}
.sv h1{font-size:86px;margin-top:16px;max-width:920px}
.sv{margin-top:46px}
.sv .lead{margin-top:18px;max-width:860px;font-size:27px}
.items{display:grid;grid-template-columns:1fr 1fr;gap:34px 46px;margin-top:auto;padding:38px 40px;background:var(--off);border-radius:20px;border-top:5px solid var(--or)}
.items .it{padding-top:4px}
.it .ic{font-size:58px;color:var(--ink-or);stroke-width:1.6}
.it b{display:block;font:700 29px/1.2 var(--h);color:var(--navy);margin-top:14px;letter-spacing:-.015em}
.it span{display:block;font:400 22px/1.4 var(--b);color:var(--ink2);margin-top:6px}
.items.three{grid-template-columns:1fr 1fr 1fr}
"""

def service_post(p):
    items = "".join(f'<div class="it">{ic(i)}<b>{e(a)}</b><span>{e(b)}</span></div>' for i, a, b in p["items"])
    inner = f'''<div class="deco corner"></div><div class="deco corner2"></div>{header("light", "How we work")}
<div class="body"><div class="sv"><div class="kick">{e(p["kicker"])}</div><h1>{p["title_html"]}</h1><p class="lead">{p["lead"]}</p></div>
<div class="items{" three" if len(p["items"]) == 3 else ""}">{items}</div></div>{footer(p.get("cta", "Our services"), p["path"])}'''
    return page(p["format"], inner, CSS_SVC)

CSS_STATEMENT = r"""
.cv{background:var(--or)}
.cv .tag{color:#fff}
.st-big{font:800 104px/.98 var(--h);color:#fff;letter-spacing:-.045em;margin-top:auto;text-wrap:balance}
.st-big em{font-style:normal;color:var(--navy)}
.st-sub{font:500 29px/1.42 var(--b);color:#fff;margin-top:30px;max-width:860px;opacity:.95}
.ft{border-top-color:rgba(255,255,255,.35)}
.cta .pill{background:var(--navy)}
.url,.url b{color:#fff}
.ring{right:-220px;bottom:-260px;width:760px;height:760px;border-radius:50%;border:2px solid rgba(255,255,255,.25)}
"""

def statement(p):
    inner = f'''<div class="deco ring"></div>
<div class="hd"><span class="logo">{LOGO["dark" if p.get("navy") else "white"]}</span><span class="tag">{e(p["tag"])}</span></div>
<div class="body"><div class="st-big">{p["title_html"]}</div><p class="st-sub">{p["lead"]}</p></div>{footer(p.get("cta", "Request a proposal"), p["path"])}'''
    css = CSS_STATEMENT.replace("var(--or)}", "var(--navy)}", 1) if p.get("navy") else CSS_STATEMENT
    if p.get("navy"):
        css += ".st-big em{color:var(--or)}.cta .pill{background:var(--ink-or)}"
    return page(p["format"], inner, css)

# ---- LinkedIn wide (shared base) ---------------------------------------------
CSS_LI = r"""
.f-1200x627 .ft{padding-top:16px;margin-top:14px}
.f-1200x627 .cta .pill{font-size:17px;padding:11px 18px}
.f-1200x627 .url{font-size:14px}
.f-1200x627 .partner img{height:64px}.f-1200x627 .partner small{font-size:13px}
"""
CSS_LISVC = r"""
.cv{background:var(--off)}
.lw{display:grid;grid-template-columns:1fr 1.05fr;gap:50px;flex:1;min-height:0;margin-top:20px}
.lw h1{font-size:50px;line-height:1.02;margin-top:10px}
.lw .lead{font-size:20px;margin-top:14px}
.lw .kick{font-size:16px}
.lst{display:flex;flex-direction:column;gap:14px;justify-content:center}
.lst div{display:grid;grid-template-columns:44px 1fr;gap:14px;align-items:start;background:#fff;border-radius:12px;padding:16px 20px}
.lst .ic{font-size:30px;color:var(--ink-or)}
.lst b{display:block;font:700 21px/1.2 var(--h);color:var(--navy)}
.lst span{display:block;font:400 16px/1.35 var(--b);color:var(--ink2);margin-top:2px}
"""

def li_list(p):
    lst = "".join(f'<div>{ic(i)}<p><b>{e(a)}</b><span>{e(b)}</span></p></div>' for i, a, b in p["items"])
    inner = f'''{header("light", p["tag"])}
<div class="body"><div class="lw"><div><div class="kick">{e(p["kicker"])}</div><h1>{p["title_html"]}</h1><p class="lead">{p["lead"]}</p></div><div class="lst">{lst}</div></div></div>
{footer(p.get("cta", "Our services"), p["path"], partner=p.get("partner", False))}'''
    return page(p["format"], inner, CSS_LISVC + CSS_LI)

# ---- F. planning tips -----------------------------------------------------
CSS_TIPS = r"""
.cv{background:var(--off)}
.tp{margin-top:44px}
.tp h1{font-size:76px;margin-top:14px}
.tp .lead{margin-top:18px;font-size:27px}
.checks{margin-top:38px;display:flex;flex-direction:column;flex:1;justify-content:space-evenly;background:#fff;border-radius:18px;padding:12px 34px;box-shadow:0 18px 40px -26px rgba(22,22,58,.35)}
.ck{display:grid;grid-template-columns:48px 1fr;gap:20px;align-items:start;padding:19px 0;border-bottom:1.5px solid var(--line)}
.ck:last-child{border-bottom:0}
.ck .box{width:38px;height:38px;border:2.5px solid var(--or);border-radius:8px;display:flex;align-items:center;justify-content:center;color:var(--ink-or);margin-top:1px}
.ck .box .ic{font-size:26px;stroke-width:2.6}
.ck b{display:block;font:700 29px/1.2 var(--h);color:var(--navy);letter-spacing:-.01em}
.ck span{display:block;font:400 22px/1.4 var(--b);color:var(--ink2);margin-top:4px}
.tl{margin-top:44px;position:relative;padding-left:64px;display:flex;flex-direction:column;gap:30px;flex:1;justify-content:space-evenly}
.tl:before{content:"";position:absolute;left:17px;top:14px;bottom:14px;width:3px;background:linear-gradient(var(--or),var(--red))}
.tl .s{position:relative}
.tl .s:before{content:"";position:absolute;left:-58px;top:5px;width:22px;height:22px;border-radius:50%;background:#fff;border:4px solid var(--or)}
.tl .s small{display:block;font:700 18px/1 var(--h);letter-spacing:.14em;text-transform:uppercase;color:var(--ink-or)}
.tl .s b{display:block;font:700 30px/1.2 var(--h);color:var(--navy);margin-top:8px;letter-spacing:-.015em}
.tl .s span{display:block;font:400 21px/1.4 var(--b);color:var(--ink2);margin-top:4px}
.qs{margin-top:40px;display:grid;grid-template-columns:1fr 1fr;gap:22px;flex:1;align-content:stretch}
.q{display:flex;flex-direction:column;justify-content:center}
.q{background:#fff;border-radius:16px;padding:24px 26px;border-top:5px solid var(--or)}
.q em{font:800 22px/1 var(--h);font-style:normal;color:var(--ink-or)}
.q b{display:block;font:700 26px/1.2 var(--h);color:var(--navy);margin-top:10px;letter-spacing:-.015em}
.q span{display:block;font:400 19px/1.4 var(--b);color:var(--ink2);margin-top:6px}
.tipnote{margin-top:auto;padding-top:20px;font:400 18px/1.4 var(--b);color:var(--ink2)}
"""

def tips_post(p):
    k = p["kind"]
    if k == "check":
        mid = '<div class="checks">' + "".join(f'<div class="ck"><span class="box">{ic("check")}</span><div><b>{e(a)}</b><span>{e(b)}</span></div></div>' for a, b in p["items"]) + "</div>"
    elif k == "timeline":
        mid = '<div class="tl">' + "".join(f'<div class="s"><small>{e(w)}</small><b>{e(a)}</b><span>{e(b)}</span></div>' for w, a, b in p["items"]) + "</div>"
    else:
        mid = '<div class="qs">' + "".join(f'<div class="q"><em>Q{i}</em><b>{e(a)}</b><span>{e(b)}</span></div>' for i, (a, b) in enumerate(p["items"], 1)) + "</div>"
    inner = f'''{header("light", "Planning tips")}
<div class="body"><div class="tp"><div class="kick">{e(p["kicker"])}</div><h1>{p["title_html"]}</h1>{f'<p class="lead">{p["lead"]}</p>' if p.get("lead") else ""}</div>
{mid}{f'<p class="tipnote">{e(p["note"])}</p>' if p.get("note") else ""}</div>{footer(p.get("cta", "Plan a trip"), p["path"])}'''
    return page(p["format"], inner, CSS_TIPS)

# ---- G. delegations & MICE ------------------------------------------------
CSS_MICE = r"""
.cv{background:var(--navy)}
.ph{left:0;right:0;top:0;height:640px;background-size:cover;background-position:center}
.ph:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(22,22,58,.82) 0%,rgba(22,22,58,.45) 30%,rgba(22,22,58,.92) 78%,var(--navy) 100%)}
.mc{margin-top:auto}
.mc h1{font-size:74px;margin-top:14px}
.mc .lead{margin-top:20px;font-size:27px}
.ml{margin-top:40px;display:grid;grid-template-columns:1fr 1fr;gap:26px 40px;border-top:1.5px solid rgba(255,255,255,.16);padding-top:32px}
.ml div{display:grid;grid-template-columns:52px 1fr;gap:16px}
.ml .ic{font-size:42px;color:var(--or);stroke-width:1.6}
.ml b{display:block;font:700 25px/1.2 var(--h);color:#fff;letter-spacing:-.01em}
.ml span{display:block;font:400 19px/1.4 var(--b);color:var(--mute);margin-top:4px}
.mnum{font:800 300px/.8 var(--h);color:transparent;-webkit-text-stroke:2px rgba(242,106,27,.55);letter-spacing:-.06em;right:40px;top:120px}
"""

def mice_post(p):
    ph = f'<div class="deco ph" style="background-image:url({PHOTO[p["photo"]]})"></div>' if p.get("photo") else f'<div class="deco mnum">{e(p.get("bignum", ""))}</div>'
    ml = "".join(f'<div>{ic(i)}<p><b>{e(a)}</b><span>{e(b)}</span></p></div>' for i, a, b in p["items"])
    inner = f'''{ph}{header("dark", "Delegations & MICE")}
<div class="body"><div class="mc"><div class="kick">{e(p["kicker"])}</div><h1>{p["title_html"]}</h1><p class="lead">{p["lead"]}</p></div>
<div class="ml">{ml}</div></div>{footer(p.get("cta", "Plan a delegation"), p["path"])}'''
    return page(p["format"], inner, CSS_MICE, "dark")

# ---- H. partnership & brand -----------------------------------------------
CSS_PART = r"""
.cv{background:#fff}
.lock{margin:auto 0;display:flex;flex-direction:column;align-items:center;text-align:center}
.lock .row2{display:flex;align-items:center;gap:56px;margin-top:40px}
.lock .eb{height:110px}.lock .eb svg{height:100%;width:auto;display:block}
.lock .sep{width:2px;height:150px;background:var(--line)}
.lock img{height:170px;width:auto;display:block}
.lock h1{font-size:62px;max-width:860px}
.lock .lead{margin-top:34px;max-width:820px;font-size:26px}
.lock .kick{margin-bottom:16px}
.pr{margin-top:40px}
.pr h1{font-size:74px;margin-top:14px}
.plist{margin-top:34px;display:flex;flex-direction:column;flex:1;justify-content:space-evenly}
.plist div{display:grid;grid-template-columns:60px 1fr;gap:18px;align-items:center;padding:16px 0;border-bottom:1.5px solid var(--line)}
.plist .ic{font-size:40px;color:var(--ink-or);stroke-width:1.6}
.plist b{font:700 30px/1.25 var(--h);color:var(--navy);letter-spacing:-.015em}
.plist b span{display:block;font:400 22px/1.35 var(--b);color:var(--ink2);margin-top:3px;letter-spacing:0}
.bigs{display:grid;grid-template-columns:repeat(3,1fr);margin-top:auto;border-top:3px solid var(--navy)}
.bigs div{padding:26px 24px 0 0}
.bigs div+div{padding-left:26px;border-left:1.5px solid var(--line)}
.bigs b{display:block;font:800 150px/.9 var(--h);color:var(--or);letter-spacing:-.06em}
.bigs span{display:block;font:600 22px/1.3 var(--b);color:var(--navy);margin-top:12px}
"""

def partner_post(p):
    k = p["kind"]
    if k == "lockup":
        mid = f'''<div class="lock"><div class="kick">{e(p["kicker"])}</div><h1>{p["title_html"]}</h1>
<div class="row2"><span class="eb">{LOGO["light"]}</span><span class="sep"></span><img src="{PARTNER_PNG}" alt="Immaculate Connections"></div>
<p class="lead">{p["lead"]}</p></div>'''
    elif k == "numbers":
        mid = f'''<div class="pr"><div class="kick">{e(p["kicker"])}</div><h1>{p["title_html"]}</h1><p class="lead" style="margin-top:18px">{p["lead"]}</p></div>
<div class="bigs">{"".join(f'<div><b>{a}</b><span>{e(b)}</span></div>' for a, b in p["nums"])}</div>'''
    else:
        mid = f'''<div class="pr"><div class="kick">{e(p["kicker"])}</div><h1>{p["title_html"]}</h1>{f'<p class="lead" style="margin-top:16px">{p["lead"]}</p>' if p.get("lead") else ""}</div>
<div class="plist">{"".join(f'<div>{ic(i)}<b>{e(a)}<span>{e(b)}</span></b></div>' for i, a, b in p["items"])}</div>'''
    inner = f'''{header("light", "ExpoBusiness")}<div class="body">{mid}</div>{footer(p.get("cta", "About us"), p["path"], partner=(k != "lockup"))}'''
    return page(p["format"], inner, CSS_PART)

CSS_LIPART = r"""
.cv{background:#fff}
.lp{display:grid;grid-template-columns:1.1fr 1fr;gap:40px;align-items:center;flex:1;min-height:0}
.lp h1{font-size:44px;line-height:1.06;margin-top:12px}
.lp .lead{font-size:21px!important}
.lp .lead{font-size:19px;margin-top:14px}
.lp .kick{font-size:15px}
.lp .lk{display:flex;align-items:center;justify-content:center;gap:34px;background:var(--off);border-radius:18px;height:100%;max-height:360px}
.lp .lk{padding:0 34px}.lp .lk .eb{height:50px}.lp .lk .eb svg{height:100%;width:auto}
.lp .lk img{height:112px}
.lp .lk .sep{width:2px;height:110px;background:#f2dccb}
"""

def li_partner(p):
    inner = f'''{header("light", "Partnership")}
<div class="body"><div class="lp"><div><div class="kick">{e(p["kicker"])}</div><h1>{p["title_html"]}</h1><p class="lead">{p["lead"]}</p></div>
<div class="lk"><span class="eb">{LOGO["light"]}</span><span class="sep"></span><img src="{PARTNER_PNG}" alt="Immaculate Connections"></div></div></div>
{footer("About us", "about.html")}'''
    return page(p["format"], inner, CSS_LIPART + CSS_LI)

# ---- carousels ------------------------------------------------------------
CSS_CAR = r"""
.cv.cover{background:var(--navy)}
.cover .ch1{font:800 100px/.98 var(--h);color:#fff;letter-spacing:-.045em;margin-top:auto;text-wrap:balance}
.cover .ch1 em{font-style:normal;color:var(--or)}
.cover .lead{margin-top:28px;font-size:29px}
.swipe{display:inline-flex;align-items:center;gap:14px;font:700 24px/1 var(--h);color:var(--peach);margin-top:40px}
.swipe .ic{font-size:34px;stroke-width:2.2}
.cbig{right:-140px;top:180px;width:820px;height:460px}
.pg{font:700 20px/1 var(--h);color:var(--ink2);letter-spacing:.1em}
.dark .pg{color:var(--mute)}
.sl .num{font:800 280px/.9 var(--h);color:var(--or);letter-spacing:-.07em;margin-top:auto;padding-right:.08em}
.sl h2{font-size:80px;margin-top:34px}
.sl .lead{margin-top:24px;font-size:31px}
.sl ul{list-style:none;margin-top:36px;border-top:3px solid var(--navy)}
.sl li{display:grid;grid-template-columns:56px 1fr;gap:20px;padding:24px 0;border-bottom:1.5px solid var(--line);font:500 29px/1.35 var(--b);color:var(--navy);align-items:center}
.sl li .ic{font-size:40px;color:var(--ink-or);stroke-width:2}
.slcal .rows{margin-top:30px}
.prog{display:flex;gap:8px;margin-top:22px}
.prog i{height:6px;flex:1;border-radius:3px;background:var(--line)}
.prog i.on{background:var(--or)}
.dark .prog i{background:rgba(255,255,255,.15)}.dark .prog i.on{background:var(--or)}
.cv.endc{background:var(--or)}
.endc .tag{color:#fff}
.endc h2{font-size:92px;color:#fff;margin-top:auto;letter-spacing:-.045em}
.endc .lead{color:#fff;opacity:.95;margin-top:24px}
.endc .ft{border-top-color:rgba(255,255,255,.35)}.endc .cta .pill{background:var(--navy)}.endc .url,.endc .url b{color:#fff}
"""

def prog(i, n):
    return '<div class="prog">' + "".join(f'<i class="{"on" if j <= i else ""}"></i>' for j in range(n)) + "</div>"

def car_slide(p, s, i, n):
    t = s["type"]
    hd_tag = p["tag"]
    if t == "cover":
        inner = f'''{arc("cbig", "#f26a1b", 3, .5)}{header("dark", hd_tag)}<div class="body"><div class="ch1">{s["title_html"]}</div><p class="lead">{s["lead"]}</p>
<span class="swipe">Swipe {ic("arrow")}</span>{prog(i, n)}</div>{footer(p["cta"], p["path"], short=True)}'''
        return page(p["format"], inner, CSS_CAR + CSS_CAL, "dark cover")
    if t == "end":
        inner = f'''<div class="hd"><span class="logo">{LOGO["white"]}</span><span class="tag">{e(hd_tag)}</span></div><div class="body"><h2>{s["title_html"]}</h2><p class="lead">{s["lead"]}</p>{prog(i, n)}</div>{footer(p["cta"], p["path"])}'''
        return page(p["format"], inner, CSS_CAR, "endc")
    if t == "cal":
        inner = f'''{header("light", hd_tag)}<div class="body slcal"><div class="mhead" style="margin-top:34px"><div class="mnum" style="font-size:180px;line-height:.9">{e(s["num"])}</div><div class="mname"><div class="kick">{e(s["kicker"])}</div><h1>{s["title_html"]}</h1></div></div>
<div class="rows">{cal_rows(s["xs"], 99)}</div><div class="legend"><span class="status"><i></i>Confirmed</span><span class="status exp"><i></i>Expected</span>{f'<span class="more">+{s["more"]} more on the calendar</span>' if s.get("more") else ""}</div>{prog(i, n)}</div>{footer(p["cta"], p["path"], short=True)}'''
        return page(p["format"], inner, CSS_CAR + CSS_CAL)
    lis = "".join(f'<li>{ic(a)}<span>{e(b)}</span></li>' for a, b in s.get("items", []))
    inner = f'''{header("light", hd_tag)}<div class="body sl"><div class="num">{e(s["num"])}</div><h2>{s["title_html"]}</h2>{f'<p class="lead">{s["lead"]}</p>' if s.get("lead") else ""}
{f"<ul>{lis}</ul>" if lis else ""}<div style="margin-top:auto">{prog(i, n)}</div></div>{footer(p["cta"], p["path"], short=True)}'''
    return page(p["format"], inner, CSS_CAR)

# ---- stories (1080x1920) --------------------------------------------------
CSS_STORY = r"""
.f-1080x1920 .ft{flex-direction:column;align-items:flex-start;gap:18px}
.f-1080x1920 .cta{flex-direction:column;align-items:flex-start;gap:14px}
.f-1080x1920 .cta .pill{font-size:28px;padding:20px 32px}
.f-1080x1920 .url{font-size:20px}
.sk{margin-top:90px}
.sk h1{font-size:104px;line-height:.98;margin-top:20px;letter-spacing:-.045em}
.sk .lead{font-size:33px;margin-top:28px}
.slist{margin-top:60px;display:flex;flex-direction:column;gap:0}
.slist div{display:grid;grid-template-columns:72px 1fr;gap:22px;align-items:center;padding:24px 0;border-top:1.5px solid var(--line)}
.dark .slist div{border-top-color:rgba(255,255,255,.16)}
.slist .ic{font-size:50px;color:var(--or);stroke-width:1.6}
.slist b{display:block;font:700 34px/1.2 var(--h);color:var(--navy);letter-spacing:-.015em}
.dark .slist b{color:#fff}
.slist span{display:block;font:400 24px/1.35 var(--b);color:var(--ink2);margin-top:4px}
.dark .slist span{color:var(--mute)}
.sbig{display:flex;flex-direction:column;gap:34px;margin-top:70px}
.sbig div{border-top:3px solid var(--or);padding-top:20px}
.sbig b{display:block;font:800 150px/.85 var(--h);color:var(--or);letter-spacing:-.06em}
.sbig span{display:block;font:700 36px/1.2 var(--h);color:var(--navy);margin-top:12px}
.dark .sbig span{color:#fff}
.sbig small{display:block;font:400 24px/1.35 var(--b);color:var(--ink2);margin-top:6px}
.dark .sbig small{color:var(--mute)}
.sarc{right:-160px;top:280px;width:980px;height:600px}
.sph{left:0;right:0;top:0;height:1000px;background-size:cover;background-position:center}
.sph:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(22,22,58,.8),rgba(22,22,58,.35) 35%,var(--navy) 96%)}
.slock{margin:auto 0;display:flex;flex-direction:column;align-items:center;text-align:center;gap:50px}
.slock .eb{height:150px}.slock .eb svg{height:100%;width:auto}
.slock img{height:300px}
.slock .plus{font:600 26px/1 var(--b);color:var(--ink2);letter-spacing:.1em;text-transform:uppercase}
.slock h1{font-size:110px}
"""

def story(p):
    k = p["kind"]
    theme = p.get("theme", "light")
    deco = ""
    if p.get("photo"):
        deco = f'<div class="deco sph" style="background-image:url({PHOTO[p["photo"]]})"></div>'
    elif theme == "dark":
        deco = arc("sarc", "#f26a1b", 3, .45)
    if k == "list":
        mid = f'''<div class="sk" {'style="margin-top:auto"' if p.get("photo") else ""}><div class="kick">{e(p["kicker"])}</div><h1>{p["title_html"]}</h1>{f'<p class="lead">{p["lead"]}</p>' if p.get("lead") else ""}</div>
<div class="slist">{"".join(f'<div>{ic(i)}<p><b>{e(a)}</b><span>{e(b)}</span></p></div>' for i, a, b in p["items"])}</div>'''
    elif k == "stats":
        mid = f'''<div class="sk"><div class="kick">{e(p["kicker"])}</div><h1>{p["title_html"]}</h1></div>
<div class="sbig">{"".join(f'<div><b>{a}</b><span>{e(b)}</span><small>{e(c)}</small></div>' for a, b, c in p["stats"])}</div>
<p class="note" style="margin-top:auto;padding-top:30px;font-size:21px">{e(p.get("note", ""))}</p>'''
    else:  # partner lockup
        mid = f'''<div class="slock"><div class="kick">{e(p["kicker"])}</div><h1>{p["title_html"]}</h1><span class="eb">{LOGO["light"]}</span><span class="plus">in partnership with</span>
<img src="{PARTNER_PNG}" alt="Immaculate Connections"><p class="lead" style="font-size:30px">{p["lead"]}</p></div>'''
    inner = f'''{deco}{header(theme, p["tag"])}<div class="body">{mid}</div>{footer(p["cta"], p["path"])}'''
    return page("1080x1920", inner, CSS_STORY, theme)

# ================================================================== build
RENDERERS = {"expo": expo_spotlight, "cal": calendar_month, "glance": calendar_glance, "dest": destination, "visa": visa_post,
             "svc": service_post, "statement": statement, "li_list": li_list, "tips": tips_post, "mice": mice_post,
             "partner": partner_post, "li_partner": li_partner, "story": story}

def find_browser():
    for c in [r"C:\Program Files\Google\Chrome\Application\chrome.exe", r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
              r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe", r"C:\Program Files\Microsoft\Edge\Application\msedge.exe"]:
        if os.path.exists(c):
            return c
    return shutil.which("chrome") or shutil.which("msedge")

BROWSER = find_browser()

def shoot(job):
    html_path, png_path, fmt = job
    w, h = FMT[fmt]
    prof = tempfile.mkdtemp(prefix="ebsoc-")
    try:
        subprocess.run([BROWSER, "--headless=new", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=1",
                        "--no-first-run", "--no-default-browser-check", "--disable-extensions", f"--user-data-dir={prof}",
                        f"--window-size={w},{h}", "--virtual-time-budget=9000", f"--screenshot={png_path}", html_path.as_uri()],
                       check=True, capture_output=True, timeout=120)
    finally:
        shutil.rmtree(prof, ignore_errors=True)
    im = Image.open(png_path).convert("RGB")
    if im.size != (w, h):
        im = im.crop((0, 0, w, h))
    flagged = im.getpixel((20, 20)) == (255, 0, 0) and im.getpixel((50, 50)) == (255, 0, 0)
    why = ""
    if flagged:  # ask the page what overflowed
        prof2 = tempfile.mkdtemp(prefix="ebsoc-")
        try:
            r = subprocess.run([BROWSER, "--headless=new", "--disable-gpu", f"--user-data-dir={prof2}", f"--window-size={w},{h}",
                                "--virtual-time-budget=9000", "--dump-dom", html_path.as_uri()], capture_output=True, timeout=120)
            import re
            m = re.search(rb"<title>(OVERFLOW[^<]*)</title>", r.stdout)
            why = m.group(1).decode() if m else ""
        finally:
            shutil.rmtree(prof2, ignore_errors=True)
    im.save(png_path, optimize=True)
    for colors, dither in ((256, Image.Dither.FLOYDSTEINBERG), (256, Image.Dither.NONE), (128, Image.Dither.NONE), (64, Image.Dither.NONE)):
        if png_path.stat().st_size <= 390_000:
            break
        im.quantize(colors=colors, method=Image.Quantize.MEDIANCUT, dither=dither).save(png_path, optimize=True)
    return png_path, (why or flagged), png_path.stat().st_size

def build(only=(), html_only=False):
    OUT_HTML.mkdir(exist_ok=True)
    allx = content.EXPOS
    jobs, manifest_posts = [], []
    for p in content.posts():
        if p.get("slides"):
            pngs = []
            for i, s in enumerate(p["slides"]):
                name = f'{p["id"]}-{i + 1}'
                (OUT_HTML / f"{name}.html").write_text(car_slide(p, s, i, len(p["slides"])), encoding="utf8")
                jobs.append((OUT_HTML / f"{name}.html", HERE / f"{name}.png", p["format"]))
                pngs.append(f"social/{name}.png")
            rec_png, slides = pngs[0], pngs
        else:
            r = RENDERERS[p["layout"]]
            args = p.get("_args", ())
            (OUT_HTML / f'{p["id"]}.html').write_text(r(p, *args), encoding="utf8")
            jobs.append((OUT_HTML / f'{p["id"]}.html', HERE / f'{p["id"]}.png', p["format"]))
            rec_png, slides = f'social/{p["id"]}.png', None
        rec = {"id": p["id"], "category": p["category"], "title": p["title"], "format": p["format"], "png": rec_png}
        if slides:
            rec["slides"] = slides
        rec.update({"caption": p["caption"], "hashtags": p["hashtags"], "link": SITE + p.get("path", ""), "platforms": p["platforms"]})
        manifest_posts.append(rec)
    manifest = {"generated": "2026-11-15", "site": SITE, "categories": content.CATEGORIES, "posts": manifest_posts,
                "calendar": content.calendar(manifest_posts)}
    (HERE / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf8")
    if only:
        jobs = [j for j in jobs if any(j[0].stem.startswith(o) for o in only)]
    print(f"{len(manifest_posts)} posts, {len(jobs)} images to render")
    if html_only:
        return
    bad = []
    with ThreadPoolExecutor(max_workers=5) as ex:
        for png, flagged, size in ex.map(shoot, jobs):
            print(f'{"FAILED " + str(flagged) + " " if flagged else ""}{png.name} {size // 1024} KB')
            if flagged or size > 400_000:
                bad.append(png.name)
    print("ALL OK" if not bad else "PROBLEMS: " + ", ".join(bad))

if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    build(tuple(args), "--html" in sys.argv)
