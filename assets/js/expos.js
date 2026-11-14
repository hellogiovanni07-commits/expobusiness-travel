// Expo calendar: month chart + region bars are the filters; search and selects stay in sync.
(() => {
  const q = document.getElementById("f-q"), region = document.getElementById("f-region"), month = document.getElementById("f-month");
  const rows = [...document.querySelectorAll("#expo-list .expo-row")];
  const count = document.getElementById("f-count"), empty = document.getElementById("f-empty");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const M = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const params = new URLSearchParams(location.search);
  if (params.get("region")) region.value = params.get("region");
  if (params.get("month")) month.value = params.get("month");

  const mbars = [...document.querySelectorAll("#mchart .ig-mbar")];
  const rbars = [...document.querySelectorAll("#rchart li")];
  // region colour index, set once so CSS can colour the legend dots
  const names = rbars.map(li => li.querySelector("span").textContent.trim());
  rows.forEach(row => { const i = names.indexOf(row.dataset.region); row.style.setProperty("--rc", i < 0 ? 0 : i); });
  rbars.forEach((li, i) => li.style.setProperty("--rc", i));

  mbars.forEach((a, i) => {
    a.dataset.m = String(i + 1);
    a.setAttribute("role", "button");
    a.addEventListener("click", e => { e.preventDefault(); month.value = month.value === a.dataset.m ? "" : a.dataset.m; run(true); });
    a.addEventListener("keydown", e => { if (e.key === " ") { e.preventDefault(); a.click(); } });
  });
  rbars.forEach((li, i) => {
    li.dataset.r = names[i];
    li.setAttribute("role", "button"); li.tabIndex = 0;
    const toggle = () => { region.value = region.value === names[i] ? "" : names[i]; run(true); };
    li.addEventListener("click", toggle);
    li.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); } });
  });

  function run(animate) {
    const t = q.value.trim().toLowerCase(), r = region.value, m = month.value;
    const perM = Array(13).fill(0), perR = {};
    let n = 0, k = 0;
    rows.forEach(row => {
      const text = !t || row.dataset.q.includes(t);
      const regOk = !r || row.dataset.region === r, monOk = !m || row.dataset.month === m;
      if (text && regOk) perM[+row.dataset.month]++;
      if (text && monOk) perR[row.dataset.region] = (perR[row.dataset.region] || 0) + 1;
      const ok = text && regOk && monOk;
      const was = !row.hidden;
      row.hidden = !ok;
      if (ok) {
        n++;
        if (animate && !reduce && (!was || animate === true) && k < 24) { row.classList.remove("pop"); void row.offsetWidth; row.style.setProperty("--d", k++); row.classList.add("pop"); }
      }
    });
    mbars.forEach(a => {
      const mm = a.dataset.m, c = perM[+mm];
      a.querySelector("b").textContent = c;
      a.classList.toggle("on", mm === m);
      a.classList.toggle("dim", c === 0 && mm !== m);
      a.setAttribute("aria-pressed", String(mm === m));
      a.setAttribute("aria-label", M[mm - 1] + " 2027: " + c + (c === 1 ? " expo" : " expos"));
    });
    rbars.forEach(li => {
      const rr = li.dataset.r, c = perR[rr] || 0;
      li.querySelector("b").textContent = c;
      li.classList.toggle("on", rr === r);
      li.classList.toggle("dim", c === 0 && rr !== r);
      li.setAttribute("aria-pressed", String(rr === r));
      li.setAttribute("aria-label", rr + ": " + c + (c === 1 ? " expo" : " expos"));
    });
    count.textContent = n + (n === 1 ? " expo" : " expos") + (m ? " in " + M[m - 1] : "") + (r ? " · " + r : "");
    empty.hidden = n > 0;
  }
  q.addEventListener("input", () => run(false));
  [region, month].forEach(el => el.addEventListener("input", () => run(true)));
  run(false);
})();
