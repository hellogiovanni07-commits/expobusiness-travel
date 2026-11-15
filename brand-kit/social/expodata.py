"""Load the site's expo data (assets/js/data/*.js) into Python lists."""
import json, re, pathlib
ROOT = pathlib.Path(__file__).resolve().parents[2]

def _js_array(path, var):
    t = (ROOT / path).read_text(encoding="utf8")
    st = t.index("[", t.index(var)); d = 0; q = None; i = st
    while True:
        c = t[i]
        if q:
            if c == "\\": i += 2; continue
            if c == q: q = None
        elif c in "\"'": q = c
        elif c == "[": d += 1
        elif c == "]":
            d -= 1
            if d == 0: break
        i += 1
    t = t[st:i + 1]
    try:
        return json.loads(t)
    except json.JSONDecodeError:
        # object literal with bare keys -> quote keys outside strings
        out, i, n, instr = [], 0, len(t), None
        while i < n:
            c = t[i]
            if instr:
                out.append(c)
                if c == "\\": out.append(t[i+1]); i += 2; continue
                if c == instr: instr = None
                i += 1; continue
            if c in "\"'":
                instr = c; out.append(c); i += 1; continue
            m = re.match(r"([A-Za-z_]\w*)\s*:", t[i:])
            if m and re.search(r"[{,]\s*$", "".join(out[-40:])):
                out.append('"%s":' % m.group(1)); i += m.end(); continue
            out.append(c); i += 1
        s = "".join(out)
        s = re.sub(r",\s*([}\]])", r"\1", s)
        return json.loads(s)

def load():
    world = _js_array("assets/js/data/expo-world.js", "EXPO_WORLD")
    cn = _js_array("assets/js/data/expo-china.js", "EXPO_CN")
    for e in cn:
        e.setdefault("country", {"Hong Kong": "Hong Kong", "Macao": "Macao", "Macau": "Macao"}.get(e["city"], "China"))
    return world + cn

if __name__ == "__main__":
    allx = load()
    print(len(allx), len({e["country"] for e in allx}))
    for e in sorted(allx, key=lambda e: (e["month"], e["dates_2027"])):
        print(e["month"], "|", e.get("short"), "|", e["city"], "|", e["country"], "|", e["dates_2027"], "|", e["dates_status"], "|", e["sectors"][:50])
