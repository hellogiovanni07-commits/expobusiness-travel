// Intro: a short "boarding" sequence shown once per visit.
// Booth-dot floor reacts to the pointer, the brand mark builds, a plane flies MNL -> CAN as the page loads,
// then the visitor drags to board (or it boards itself) and the screen splits open.
// Pages wait on window.__intro (a Promise) before running their own entrance animations.
(() => {
  const root = document.documentElement;
  let seen = false;
  try { seen = sessionStorage.getItem("introSeen") === "1"; } catch {}
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (seen || reduce || !root.classList.contains("intro-pending")) {
    root.classList.remove("intro-pending");
    window.__intro = Promise.resolve();
    return;
  }
  let done;
  window.__intro = new Promise(r => (done = r));

  const el = document.createElement("div");
  el.className = "intro";
  el.setAttribute("role", "dialog");
  el.setAttribute("aria-label", "ExpoBusiness Travel Services intro");
  el.innerHTML = `
    <canvas class="intro-floor" aria-hidden="true"></canvas>
    <div class="intro-half top" aria-hidden="true"></div><div class="intro-half bottom" aria-hidden="true"></div>
    <button type="button" class="intro-skip">Skip intro</button>
    <div class="intro-stage">
      <svg class="intro-mark" viewBox="0 0 44 40" aria-hidden="true">
        <rect class="im-bar b1" x="7" y="24" width="7" height="13" rx="1.5" fill="#ff8a3d"/>
        <rect class="im-bar b2" x="17" y="18" width="7" height="19" rx="1.5" fill="#f26a1b"/>
        <rect class="im-bar b3" x="27" y="12" width="7" height="25" rx="1.5" fill="#e04e0b"/>
        <path class="im-arc" d="M3 26 C 12 8, 28 2, 41 6" fill="none" stroke="#ff5a4f" stroke-width="2.2" stroke-linecap="round"/>
        <circle class="im-dot" r="2.6" fill="#ff5a4f"/>
      </svg>
      <div class="intro-word" aria-hidden="true">${"ExpoBusiness".split("").map((c, i) => `<span style="--i:${i}">${c}</span>`).join("")}</div>
      <p class="intro-tag">Business travel to China's trade expos · Philippines → China</p>
      <div class="intro-route" aria-hidden="true">
        <span class="ir-city"><b>MNL</b><small>Manila</small></span>
        <span class="ir-track"><i class="ir-fill"></i><span class="ir-plane"><svg class="icon"><use href="#i-plane"/></svg></span></span>
        <span class="ir-city r"><b>CAN</b><small>Guangzhou</small></span>
      </div>
      <p class="intro-status" aria-live="polite"><span class="tnum" id="introPct">0</span>% · <span id="introMsg">Checking in</span></p>
      <div class="intro-board" role="slider" tabindex="0" aria-label="Drag to board" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
        <span class="ib-fill"></span>
        <span class="ib-label">Drag to board</span>
        <span class="ib-knob"><svg class="icon" aria-hidden="true"><use href="#i-plane"/></svg></span>
      </div>
    </div>`;
  document.body.append(el);
  const $ = s => el.querySelector(s);

  /* ---------- booth-dot floor that lifts around the pointer ---------- */
  const cv = $(".intro-floor"), ctx = cv.getContext("2d");
  let W = 0, H = 0, dpr = Math.min(2, devicePixelRatio || 1), px = -999, py = -999, tx = -999, ty = -999, alive = true, t0 = performance.now();
  const size = () => { W = innerWidth; H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + "px"; cv.style.height = H + "px"; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
  size(); addEventListener("resize", size);
  el.addEventListener("pointermove", e => { tx = e.clientX; ty = e.clientY; });
  el.addEventListener("pointerleave", () => { tx = ty = -999; });
  function draw(now) {
    if (!alive) return;
    const t = (now - t0) / 1000;
    px += (tx - px) * .12; py += (ty - py) * .12;
    ctx.clearRect(0, 0, W, H);
    const gap = W < 600 ? 26 : 34, cx = W / 2, cy = H / 2;
    for (let y = gap / 2; y < H; y += gap) for (let x = gap / 2; x < W; x += gap) {
      const dc = Math.hypot(x - cx, y - cy), wave = Math.max(0, 1 - Math.abs(dc - t * 520) / 120);       // opening ripple
      const dp = Math.hypot(x - px, y - py), near = Math.max(0, 1 - dp / 170);                         // pointer glow
      const k = Math.min(1, wave * .9 + near);
      const s = 1.4 + k * 3.2;
      ctx.fillStyle = k > .02 ? `rgba(${242}, ${106 + 40 * (1 - k) | 0}, ${27}, ${.18 + k * .7})` : "rgba(255,255,255,.08)";
      ctx.fillRect(x - s / 2, y - s / 2 - k * 6, s, s);
    }
    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);

  /* ---------- the mark leans toward the pointer ---------- */
  const stage = $(".intro-stage");
  el.addEventListener("pointermove", e => {
    const rx = (e.clientY / H - .5) * -8, ry = (e.clientX / W - .5) * 10;
    stage.style.setProperty("--rx", rx.toFixed(2) + "deg"); stage.style.setProperty("--ry", ry.toFixed(2) + "deg");
  });

  /* ---------- boarding progress: real page load, never faster than the choreography ---------- */
  const pctEl = $("#introPct"), msgEl = $("#introMsg"), fill = $(".ir-fill"), plane = $(".ir-plane");
  const msgs = [[0, "Checking in"], [30, "Visa ready"], [60, "Badge printed"], [85, "Boarding"], [100, "Ready to board"]];
  let loaded = document.readyState === "complete", pct = 0, readyAt = 0;
  addEventListener("load", () => (loaded = true));
  setTimeout(() => (loaded = true), 4000); // never wait on a slow image forever
  const start = performance.now() + 700;
  function progress(now) {
    if (!alive) return;
    const time = Math.max(0, Math.min(1, (now - start) / 1500));
    const target = loaded ? time * 100 : Math.min(time * 100, 88);
    pct += (target - pct) * .18;
    if (target >= 100 && pct > 99.5) pct = 100;
    const p = Math.round(pct);
    pctEl.textContent = p;
    msgEl.textContent = msgs.filter(m => p >= m[0]).at(-1)[1];
    fill.style.transform = `scaleX(${pct / 100})`;
    plane.style.left = pct + "%";
    if (p >= 100) { if (!readyAt) { readyAt = now; el.classList.add("is-ready"); armAuto(); } }
    else requestAnimationFrame(progress);
    if (p < 100) return;
  }
  requestAnimationFrame(progress);

  /* ---------- drag to board ---------- */
  const board = $(".intro-board"), knob = $(".ib-knob"), bfill = $(".ib-fill");
  let dragging = false, startX = 0, val = 0, autoTimer = 0, finished = false;
  const maxX = () => board.clientWidth - knob.offsetWidth - 8;
  const setVal = v => {
    val = Math.max(0, Math.min(1, v));
    knob.style.transform = `translateX(${(val * maxX()).toFixed(1)}px)`;
    bfill.style.transform = `scaleX(${(val * maxX() + knob.offsetWidth / 2 + 4) / board.clientWidth})`;
    board.setAttribute("aria-valuenow", Math.round(val * 100));
    board.style.setProperty("--v", val);
  };
  function armAuto() { autoTimer = setTimeout(() => { if (!dragging && !finished) autoBoard(); }, 1500); }
  function autoBoard() {
    const s = val, t1 = performance.now();
    const step = now => { const k = Math.min(1, (now - t1) / 520); setVal(s + (1 - s) * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); else finish(); };
    requestAnimationFrame(step);
  }
  knob.addEventListener("pointerdown", e => {
    if (!el.classList.contains("is-ready")) return;
    dragging = true; clearTimeout(autoTimer); startX = e.clientX - val * maxX(); knob.setPointerCapture(e.pointerId); board.classList.add("dragging");
  });
  knob.addEventListener("pointermove", e => { if (dragging) setVal((e.clientX - startX) / maxX()); });
  const release = () => {
    if (!dragging) return; dragging = false; board.classList.remove("dragging");
    if (val > .62) autoBoard();
    else { const s = val, t1 = performance.now(); const back = now => { const k = Math.min(1, (now - t1) / 380); setVal(s * (1 - (1 - Math.pow(1 - k, 3)))); if (k < 1) requestAnimationFrame(back); else armAuto(); }; requestAnimationFrame(back); }
  };
  knob.addEventListener("pointerup", release); knob.addEventListener("pointercancel", release);
  board.addEventListener("click", e => { if (e.target === knob || knob.contains(e.target)) return; if (el.classList.contains("is-ready")) { clearTimeout(autoTimer); autoBoard(); } });
  board.addEventListener("keydown", e => { if (["Enter", " ", "ArrowRight"].includes(e.key) && el.classList.contains("is-ready")) { e.preventDefault(); clearTimeout(autoTimer); autoBoard(); } });

  /* ---------- skip + exit ---------- */
  $(".intro-skip").addEventListener("click", () => finish(true));
  const onKey = e => { if (e.key === "Escape" || (e.key === "Enter" && e.target === document.body)) finish(true); };
  addEventListener("keydown", onKey);
  function finish(skip) {
    if (finished) return; finished = true; clearTimeout(autoTimer);
    try { sessionStorage.setItem("introSeen", "1"); } catch {}
    el.classList.add(skip ? "is-skip" : "is-out");
    root.classList.remove("intro-pending");
    removeEventListener("keydown", onKey);
    done();
    setTimeout(() => { alive = false; el.remove(); }, skip ? 450 : 1150);
  }
  setTimeout(() => board.focus({ preventScroll: true }), 900);
})();
