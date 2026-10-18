// Brand kit: one set of details fills every material; materials scale to fit and export as PNG.
(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const KEY = "ebBrandKit";
  const inputs = $$("[data-k]");
  // Real details from the website's site-config.js replace the kit's placeholders.
  if (window.SITE) {
    const C = SITE.contact, L = SITE.legal, B = SITE.brand, map = { company: B.name, sub: B.descriptor, tagline: B.tagline, phone: C.phone, mobile: C.mobile, chat: C.mobile, email: C.email, address: C.address, hours: C.hours, fb: SITE.social.facebook, ig: SITE.social.instagram, li: SITE.social.linkedin, dot: L.dot, reg: L.registration };
    inputs.forEach(i => { const v = map[i.dataset.k]; if (v && !/^\[/.test(v)) i.value = v; });
  }
  const DEFAULTS = Object.fromEntries(inputs.map(i => [i.dataset.k, i.value]));
  let S = { ...DEFAULTS };
  try { Object.assign(S, JSON.parse(localStorage.getItem(KEY) || "{}")); } catch (e) {}

  const toast = msg => { const t = $("#toast"); t.textContent = msg; t.classList.add("on"); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove("on"), 1800); };
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); $("#saved").textContent = "Saved in this browser"; } catch (e) { $("#saved").textContent = "Not saved: storage is unavailable here"; } };

  /* ---------- materials: wrap each .art in a card with tools, scale to fit ---------- */
  const arts = $$(".art");
  arts.forEach(a => {
    const card = document.createElement("article"); card.className = "item"; card.id = "m-" + a.dataset.name;
    card.innerHTML = `<div class="item-head"><div><b>${a.dataset.title}</b><small>${a.dataset.size}</small></div><div class="item-tools">
      <button class="tool" type="button" data-dl title="Download PNG" aria-label="Download ${a.dataset.title} as PNG">↓</button>
      ${a.id === "sig" ? `<button class="tool" type="button" data-sig title="Copy signature HTML" aria-label="Copy email signature HTML">⧉</button>` : ""}</div></div>
      <div class="stage${a.dataset.stage === "dark" ? " dark" : ""}"><div class="fit"></div></div>`;
    a.replaceWith(card);
    card.querySelector(".fit").append(a);
    a.style.width = a.dataset.w + "px"; a.style.height = a.dataset.h + "px";
  });
  const fitAll = () => $$(".fit").forEach(f => {
    const a = f.firstElementChild, w = +a.dataset.w, h = +a.dataset.h;
    const max = Math.min(f.parentElement.clientWidth - 36, w); // never upscale
    const cap = h * (max / w) > 760 ? 760 / h : max / w;       // keep very tall pieces readable in the grid
    f.style.height = (h * cap) + "px"; f.style.width = (w * cap) + "px";
    a.style.transform = `scale(${cap})`;
  });
  new ResizeObserver(fitAll).observe($(".main"));
  $("#countItems").textContent = arts.length + 0;

  /* ---------- apply details ---------- */
  function apply() {
    $$("[data-f]").forEach(el => { const v = S[el.dataset.f]; if (v != null && document.activeElement !== el) el.textContent = v; });
    inputs.forEach(i => { if (document.activeElement !== i) i.value = S[i.dataset.k] ?? ""; });
    const root = document.documentElement.style;
    root.setProperty("--photo", `url("${S.photoData || S.photo}")`);
    root.setProperty("--photo2", `url("${S.photo2}")`);
    root.setProperty("--photo3", `url("${S.photo3}")`);
    const incl = (S.incl || "").split("\n").map(s => s.trim()).filter(Boolean);
    const tick = `<svg class="icon" style="color:var(--orange-600);flex:none;margin-top:.2em"><use href="#i-check"/></svg>`;
    $("#flyerIncl").innerHTML = incl.map(t => `<div style="display:flex;gap:12px">${tick}<span>${esc(t)}</span></div>`).join("");
    $("#storyIncl").innerHTML = incl.slice(0, 5).map(t => `<div style="display:flex;gap:16px;align-items:flex-start"><svg class="icon" style="color:var(--orange-hot);flex:none;margin-top:.15em"><use href="#i-check"/></svg><span>${esc(t)}</span></div>`).join("");
    $("#quoteRows").innerHTML = incl.map(t => `<div style="display:grid;grid-template-columns:1fr 160px 200px;padding:20px 0;border-bottom:1px solid var(--line);color:var(--ink-2)"><span>${esc(t)}</span><span>1</span><span style="text-align:right;color:var(--muted)">Itemised</span></div>`).join("");
    $("#lanyard").innerHTML = Array.from({ length: 6 }, () => `<span style="display:inline-flex;align-items:center;gap:16px;font:800 40px var(--display);letter-spacing:-.02em"><span class="mk" style="width:58px;height:53px;color:#fff"><svg><use href="#mark-mono"/></svg></span>${esc(S.company)}</span><span style="font:700 22px var(--text);letter-spacing:.14em;text-transform:uppercase;opacity:.85">${esc(S.event)}</span>`).join("");
    applyLogo();
  }
  // Your own logo replaces the drawn mark everywhere.
  function applyLogo() {
    $$(".mk").forEach(m => {
      if (!m._orig) m._orig = m.innerHTML;
      m.innerHTML = S.logo ? `<img src="${S.logo}" alt="">` : m._orig;
    });
  }

  inputs.forEach(i => i.addEventListener("input", () => { S[i.dataset.k] = i.value; if (i.dataset.k === "photo") delete S.photoData; apply(); save(); }));
  // Editing bound text directly on a material updates the panel and every other copy.
  document.addEventListener("input", e => {
    const el = e.target.closest?.("[contenteditable][data-f]"); if (!el) return;
    S[el.dataset.f] = el.textContent; apply(); save();
  });
  $$("[data-file]").forEach(inp => inp.addEventListener("change", () => {
    const f = inp.files[0]; if (!f) return;
    if (f.size > 2.5e6) { toast("Please use an image under 2.5 MB"); return; }
    const r = new FileReader();
    r.onload = () => { if (inp.dataset.file === "logo") S.logo = r.result; else S.photoData = r.result; apply(); save(); toast("Image applied"); };
    r.readAsDataURL(f);
  }));

  /* ---------- static content ---------- */
  const SW = [
    ["Orange 600", "#c9460b", "Primary · buttons, text on white"], ["Orange", "#f26a1b", "Fills, the middle bar"], ["Orange hot", "#ff8a3d", "Accents on navy"],
    ["Red", "#d7261e", "Arc, urgency chips"], ["Navy", "#16163a", "Panels, headers"], ["Ink", "#1f1f3d", "Headlines, body text"],
    ["Muted", "#5a5a72", "Secondary text"], ["Tint", "#fff7f1", "Warm sections"], ["Peach", "#ffe1cc", "Borders on tint"], ["Line", "#ecebf1", "Rules, dividers"],
  ];
  const cmyk = hex => { const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.substr(i, 2), 16) / 255), k = 1 - Math.max(r, g, b); return k === 1 ? "0 0 0 100" : [r, g, b].map(c => Math.round((1 - c - k) / (1 - k) * 100)).concat(Math.round(k * 100)).join(" "); };
  const rgb = hex => [1, 3, 5].map(i => parseInt(hex.substr(i, 2), 16)).join(" ");
  const lum = hex => { const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.substr(i, 2), 16)); return (r * 299 + g * 587 + b * 114) / 1000; };
  $("#swatches").innerHTML = SW.map(([n, h, u]) => `<button class="sw" type="button" data-hex="${h}"><i class="${lum(h) > 180 ? "lt" : ""}" style="background:${h}" data-r="${u.split(" · ")[0]}"></i><div><b>${n}</b><code>${h.toUpperCase()}</code><code>RGB ${rgb(h)}</code><code>CMYK ${cmyk(h)}</code><code style="font-family:var(--text)">${u}</code></div></button>`).join("");
  $$(".sw").forEach(b => b.addEventListener("click", () => navigator.clipboard?.writeText(b.dataset.hex).then(() => toast(b.dataset.hex + " copied"))));

  const icons = $$("symbol[id^='i-']");
  $("#icons").innerHTML = icons.map(s => `<button type="button" data-ic="${s.id}"><svg class="icon"><use href="#${s.id}"/></svg><span>${s.id.slice(2)}</span></button>`).join("");
  $$("#icons button").forEach(b => b.addEventListener("click", () => {
    const s = document.getElementById(b.dataset.ic);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${s.getAttribute("viewBox")}" fill="none" stroke="#c9460b" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${s.innerHTML}</svg>`;
    navigator.clipboard?.writeText(svg).then(() => toast(b.dataset.ic.slice(2) + " SVG copied"));
  }));

  // Deterministic QR-like pattern (decorative; replace with a real QR before printing).
  $$("[data-qr]").forEach((q, n) => {
    let seed = 7 + n * 31;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    q.innerHTML = Array.from({ length: 81 }, (_, i) => { const x = i % 9, y = (i / 9) | 0; const corner = (x < 3 && y < 3) || (x > 5 && y < 3) || (x < 3 && y > 5); const on = corner ? !(x % 2 === 1 && y % 2 === 1 && (x === 1 || x === 7) && (y === 1 || y === 7)) : rnd() > .5; return `<i class="${on ? "" : "o"}"></i>`; }).join("");
  });

  // Countdown post: days to the spring Canton Fair (Apr 15, 2027, Guangzhou).
  const days = Math.max(0, Math.ceil((new Date("2027-04-15T09:30:00+08:00") - new Date()) / 864e5));
  $("#cdDays").textContent = days;

  $$("[data-copy]").forEach(b => b.addEventListener("click", () => navigator.clipboard?.writeText($("#" + b.dataset.copy).textContent.trim()).then(() => toast("Copied"))));

  /* ---------- export ---------- */
  // The exporter can't follow <use href="#..."> into the page sprite or read Google's font CSS,
  // so symbols are inlined for the capture and the Latin font files are embedded as data URLs.
  let fontCSS;
  async function getFontCSS() {
    if (fontCSS !== undefined) return fontCSS;
    try {
      const link = $("link[href*='fonts.googleapis.com/css2']");
      let css = await (await fetch(link.href)).text();
      css = css.split("}").filter(b => b.includes("U+0000-00FF")).map(b => b + "}").join("\n");
      const urls = [...new Set(css.match(/https:[^)]+\.woff2/g) || [])];
      for (const u of urls) {
        const blob = await (await fetch(u)).blob();
        const data = await new Promise(r => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(blob); });
        css = css.split(u).join(data);
      }
      fontCSS = css;
    } catch (e) { fontCSS = ""; }
    return fontCSS;
  }
  function inlineUses(root) {
    const undo = [];
    root.querySelectorAll("svg").forEach(svg => {
      const use = svg.querySelector(":scope > use"); if (!use) return;
      const sym = document.getElementById((use.getAttribute("href") || "").slice(1)); if (!sym) return;
      undo.push([svg, svg.innerHTML, svg.getAttribute("viewBox")]);
      svg.setAttribute("viewBox", sym.getAttribute("viewBox"));
      svg.innerHTML = sym.innerHTML;
    });
    return () => undo.forEach(([svg, html, vb]) => { svg.innerHTML = html; vb ? svg.setAttribute("viewBox", vb) : svg.removeAttribute("viewBox"); });
  }
  async function render(a) {
    const fontEmbedCSS = await getFontCSS();
    const restore = inlineUses(a);
    let dataUrl;
    try { dataUrl = await htmlToImage.toPng(a, { width: +a.dataset.w, height: +a.dataset.h, pixelRatio: 1, cacheBust: true, fontEmbedCSS, style: { transform: "none", left: "0", top: "0", boxShadow: "none" } }); }
    finally { restore(); }
    return dataUrl;
  }
  window.__kitRender = render;
  async function png(a) {
    if (!window.htmlToImage) { toast("Export needs an internet connection (html-to-image)"); return; }
    const dataUrl = await render(a);
    const l = document.createElement("a"); l.download = `${(S.company || "brand").toLowerCase().replace(/\W+/g, "-")}-${a.dataset.name}.png`; l.href = dataUrl; l.click();
  }
  document.addEventListener("click", async e => {
    const dl = e.target.closest("[data-dl]");
    if (dl) { dl.classList.add("busy"); try { await png(dl.closest(".item").querySelector(".art")); } catch (err) { toast("Export failed: " + (err.message || "image blocked")); } dl.classList.remove("busy"); }
    if (e.target.closest("[data-sig]")) {
      const html = $("#sig").innerHTML.replace(/<span class="mk"[^]*?<\/span>/, `<b style="font:800 20px Arial;color:#c9460b">${esc(S.company)}</b>`);
      try { await navigator.clipboard.write([new ClipboardItem({ "text/html": new Blob([html], { type: "text/html" }), "text/plain": new Blob([$("#sig").innerText], { type: "text/plain" }) })]); toast("Signature copied, paste into your mail settings"); }
      catch { navigator.clipboard?.writeText(html); toast("Signature HTML copied"); }
    }
  });
  $("#dlAll").addEventListener("click", async () => {
    const all = $$(".item .art");
    for (let i = 0; i < all.length; i++) { toast(`Exporting ${i + 1} of ${all.length}`); try { await png(all[i]); } catch (e) {} await new Promise(r => setTimeout(r, 350)); }
    toast("All materials exported");
  });
  $("#exportJson").addEventListener("click", () => {
    const { logo, photoData, ...rest } = S;
    const l = document.createElement("a"); l.download = "brand-details.json"; l.href = URL.createObjectURL(new Blob([JSON.stringify(rest, null, 2)], { type: "application/json" })); l.click();
  });
  $("#importJson").addEventListener("change", e => {
    const f = e.target.files[0]; if (!f) return;
    f.text().then(t => { try { Object.assign(S, JSON.parse(t)); apply(); save(); toast("Details imported"); } catch { toast("That file isn't valid JSON"); } });
  });
  $("#reset").addEventListener("click", () => { if (!confirm("Reset every field to the defaults?")) return; S = { ...DEFAULTS }; try { localStorage.removeItem(KEY); } catch (e) {} apply(); toast("Reset to defaults"); });

  /* ---------- navigation ---------- */
  $("#menuBtn").addEventListener("click", e => { e.preventDefault(); $("#kit").classList.toggle("panel-open"); });
  document.addEventListener("click", e => { if ($("#kit").classList.contains("panel-open") && !e.target.closest(".panel, #menuBtn")) $("#kit").classList.remove("panel-open"); });
  const links = $$(".top a[href^='#s-']");
  const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) links.forEach(l => l.classList.toggle("is-on", l.getAttribute("href") === "#" + en.target.id)); }), { rootMargin: "-40% 0px -55% 0px" });
  $$(".sec").forEach(s => io.observe(s));
  apply();
  fitAll();
})();
