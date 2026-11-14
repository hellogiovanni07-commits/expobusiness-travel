// Corporate proposal form: three steps, validation, prefill from the URL, then an email with the brief.
// There is no form server yet: the brief is sent from the visitor's own email app (mailto) and can be copied.
(() => {
  const form = document.getElementById("pform");
  if (!form) return;
  const steps = [...form.querySelectorAll(".fstep")], marks = [...document.querySelectorAll(".stepper li")];
  const back = form.querySelector("[data-back]"), next = form.querySelector("[data-next]"), submit = form.querySelector("[data-submit]");
  const target = document.getElementById("p-target"), expoWrap = document.getElementById("p-expo-wrap"), expo = document.getElementById("p-expo");
  const err = document.getElementById("p-error");
  const EMAIL = (window.SITE && SITE.contact.email) || "";
  let cur = 0;

  function show(i) {
    cur = i;
    steps.forEach((s, k) => s.classList.toggle("on", k === i));
    marks.forEach((m, k) => { m.classList.toggle("on", k === i); m.classList.toggle("done", k < i); });
    back.hidden = i === 0; next.hidden = i === steps.length - 1; submit.hidden = i !== steps.length - 1;
    err.textContent = "";
  }
  function check(i) {
    let ok = true, first = null;
    steps[i].querySelectorAll("[required]").forEach(f => {
      const wrap = f.closest(".field"), msg = wrap.querySelector(".msg");
      let m = "";
      if (!f.value.trim()) m = "Required";
      else if (f.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value)) m = "Enter a valid email";
      else if (f.type === "tel" && f.value.replace(/\D/g, "").length < 10) m = "Enter a full mobile number";
      wrap.classList.toggle("err", !!m); f.setAttribute("aria-invalid", !!m); if (msg) msg.textContent = m;
      if (m) { ok = false; first = first || f; }
    });
    if (first) first.focus();
    return ok;
  }
  const go = d => { if (d > 0 && !check(cur)) return; show(cur + d); form.scrollIntoView({ block: "start", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }); steps[cur].querySelector("input,select")?.focus({ preventScroll: true }); };
  next.addEventListener("click", () => go(1));
  back.addEventListener("click", () => go(-1));
  form.addEventListener("keydown", e => { if (e.key === "Enter" && e.target.tagName === "INPUT" && cur < steps.length - 1) { e.preventDefault(); go(1); } });

  const syncExpo = () => { expoWrap.hidden = target.value !== "expo"; };
  target.addEventListener("change", syncExpo);

  // prefill: ?target=<option value>  ?expo=<calendar slug>  ?pax=1-2|6-10|11+  ?need=visa
  const p = new URLSearchParams(location.search);
  const e = p.get("expo");
  if (e) {
    if (e.startsWith("canton-fair")) target.value = "canton";
    else if (e === "ciff-guangzhou") target.value = "ciff";
    else if ([...expo.options].some(o => o.value === e)) { target.value = "expo"; expo.value = e; }
  }
  const tg = p.get("target"); if (tg && [...target.options].some(o => o.value === tg)) target.value = tg;
  if (p.get("pax")) document.getElementById("p-pax").value = p.get("pax");
  if (p.get("need") === "visa") document.getElementById("need-visa").checked = true;
  syncExpo();

  let body = "", mailto = "";
  form.addEventListener("submit", ev => {
    ev.preventDefault();
    for (let i = 0; i < steps.length; i++) if (!check(i)) { show(i); check(i); return; }
    const fd = new FormData(form);
    const ref = "EB-" + new Date().toISOString().slice(2, 10).replace(/-/g, "") + "-" + Math.random().toString(36).slice(2, 6).toUpperCase();
    const label = sel => sel.options[sel.selectedIndex]?.text || "";
    const lines = [
      "Corporate proposal request " + ref, "",
      "Company: " + fd.get("Company"), "Contact: " + fd.get("Name") + ", " + fd.get("Designation"),
      "Email: " + fd.get("Email"), "Mobile: " + fd.get("Mobile"), "",
      "Target: " + label(target) + (target.value === "expo" && expo.value ? " · " + label(expo) : ""),
      "Destination: " + (fd.get("Destination") || "-"), "Departing from: " + fd.get("Departure"),
      "Headcount: " + fd.get("Headcount"), "Dates: " + (fd.get("Dates") || "-"), "",
      "Needs: " + (fd.getAll("Needs").join(", ") || "-"), "", "Notes: " + (fd.get("Notes") || "-")
    ];
    body = lines.join("\n");
    mailto = "mailto:" + EMAIL + "?subject=" + encodeURIComponent("Corporate proposal request " + ref + " · " + fd.get("Company")) + "&body=" + encodeURIComponent(body);
    document.getElementById("p-ref").textContent = ref;
    document.getElementById("p-mail").href = mailto;
    form.hidden = true; document.querySelector(".stepper").hidden = true;
    const ok = document.getElementById("p-success"); ok.classList.add("on"); ok.focus();
    location.href = mailto;
  });
  document.getElementById("p-copy").addEventListener("click", async ev => {
    try { await navigator.clipboard.writeText(body); ev.target.textContent = "Copied"; } catch (e) { ev.target.textContent = "Copy failed"; }
  });
  show(0);
})();
