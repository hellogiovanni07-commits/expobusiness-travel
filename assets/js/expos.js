// Expo calendar: filter the pre-rendered rows by search text, region and month, with a month bar.
(() => {
  const q = document.getElementById("f-q"), region = document.getElementById("f-region"), month = document.getElementById("f-month");
  const rows = [...document.querySelectorAll("#expo-list .expo-row")];
  const count = document.getElementById("f-count"), empty = document.getElementById("f-empty"), barEl = document.getElementById("month-bar");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const M = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const params = new URLSearchParams(location.search);
  if (params.get("region")) region.value = params.get("region");
  if (params.get("month")) month.value = params.get("month");

  const all = document.createElement("button"); all.type = "button"; all.innerHTML = "All<small>2027</small>"; all.dataset.m = "";
  const btns = [all, ...M.map((m, i) => { const b = document.createElement("button"); b.type = "button"; b.dataset.m = String(i + 1); b.innerHTML = m + "<small>0</small>"; return b; })];
  btns.forEach(b => { barEl.appendChild(b); b.addEventListener("click", () => { month.value = b.dataset.m; run(true); }); });

  function run(animate) {
    const t = q.value.trim().toLowerCase(), r = region.value, m = month.value;
    const per = Array(13).fill(0);
    let n = 0, k = 0;
    rows.forEach(row => {
      const base = (!t || row.dataset.q.includes(t)) && (!r || row.dataset.region === r);
      if (base) per[+row.dataset.month]++;
      const ok = base && (!m || row.dataset.month === m);
      const was = !row.hidden;
      row.hidden = !ok;
      if (ok) {
        n++;
        if (animate && !reduce && (!was || animate === true) && k < 24) { row.classList.remove("pop"); void row.offsetWidth; row.style.setProperty("--d", k++); row.classList.add("pop"); }
      }
    });
    btns.forEach(b => {
      const mm = b.dataset.m;
      if (mm) { b.querySelector("small").textContent = per[+mm]; b.disabled = per[+mm] === 0 && m !== mm; }
      b.setAttribute("aria-pressed", String(mm === m));
    });
    count.textContent = n + (n === 1 ? " expo" : " expos") + (m ? " in " + M[m - 1] : "");
    empty.hidden = n > 0;
  }
  q.addEventListener("input", () => run(false));
  [region, month].forEach(el => el.addEventListener("input", () => run(true)));
  run(false);
})();
