// Home: days until the next Canton Fair phase in the hero promotion.
(() => {
  const el = document.querySelector("[data-countdown]");
  if (!el) return;
  const d = Math.ceil((new Date(el.dataset.countdown + "T09:00:00+08:00") - Date.now()) / 864e5);
  if (d > 0) el.querySelector("b").textContent = d; else el.hidden = true;
})();
