// Expo calendar: filter the pre-rendered rows by search text, region and month.
(() => {
  const q = document.getElementById("f-q"), region = document.getElementById("f-region"), month = document.getElementById("f-month");
  const rows = [...document.querySelectorAll("#expo-list .expo-row")];
  const count = document.getElementById("f-count"), empty = document.getElementById("f-empty");
  const params = new URLSearchParams(location.search);
  if (params.get("region")) region.value = params.get("region");
  if (params.get("month")) month.value = params.get("month");
  function run() {
    const t = q.value.trim().toLowerCase(), r = region.value, m = month.value;
    let n = 0;
    rows.forEach(row => {
      const ok = (!t || row.dataset.q.includes(t)) && (!r || row.dataset.region === r) && (!m || row.dataset.month === m);
      row.hidden = !ok; if (ok) n++;
    });
    count.textContent = n + (n === 1 ? " expo" : " expos");
    empty.hidden = n > 0;
  }
  [q, region, month].forEach(el => el.addEventListener("input", run));
  run();
})();
