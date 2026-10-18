// Shared behaviour: nav, reveals, pointer-aware buttons, magnetic CTAs.
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;

/* ---------- nav ---------- */
const nav = document.querySelector(".nav");
if (nav) {
  const toggle = nav.querySelector(".nav-toggle");
  const links = nav.querySelector(".nav-links");
  const pill = nav.querySelector(".nav-pill");

  toggle?.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });
  addEventListener("keydown", e => {
    if (e.key === "Escape" && nav.classList.contains("open")) { nav.classList.remove("open"); toggle.setAttribute("aria-expanded", "false"); toggle.focus(); }
  });

  // The cream pill glides to whichever link is hovered, then settles back on the current page.
  const current = links?.querySelector('[aria-current="page"]');
  const movePill = a => {
    if (!pill || !a) { if (pill) pill.style.opacity = 0; return; }
    pill.style.setProperty("--l", a.offsetLeft + "px");
    pill.style.setProperty("--r", (links.clientWidth - a.offsetLeft - a.offsetWidth) + "px");
    pill.style.opacity = 1;
  };
  links?.querySelectorAll("a").forEach(a => a.addEventListener("mouseenter", () => movePill(a)));
  links?.addEventListener("mouseleave", () => movePill(current));
  addEventListener("load", () => movePill(current));

  // Hide on scroll down, return on scroll up.
  let lastY = scrollY;
  addEventListener("scroll", () => {
    const y = scrollY;
    nav.classList.toggle("is-scrolled", y > 8);
    if (!nav.classList.contains("open")) nav.classList.toggle("is-hidden", y > 400 && y > lastY + 4);
    if (y < lastY - 4 || y < 400) nav.classList.remove("is-hidden");
    lastY = y;
  }, { passive: true });
}

/* ---------- reveals ---------- */
// [data-stagger] parents give their [data-reveal] children an increasing delay.
document.querySelectorAll("[data-stagger]").forEach(parent => {
  const step = parseFloat(parent.dataset.stagger) || 0.07;
  parent.querySelectorAll(":scope > [data-reveal]").forEach((el, i) => el.style.setProperty("--d", (i * step).toFixed(2) + "s"));
});
const revealIO = new IntersectionObserver(entries => entries.forEach(en => {
  if (en.isIntersecting) { en.target.classList.add("is-in"); revealIO.unobserve(en.target); }
}), { threshold: 0.15, rootMargin: "0px 0px -6% 0px" });
document.querySelectorAll("[data-reveal]").forEach(el => revealIO.observe(el));

/* ---------- buttons: red fill grows from where the pointer enters ---------- */
document.addEventListener("pointerover", e => {
  const b = e.target.closest?.(".btn");
  if (!b) return;
  const r = b.getBoundingClientRect();
  b.style.setProperty("--mx", ((e.clientX - r.left) / r.width * 100).toFixed(1) + "%");
  b.style.setProperty("--my", ((e.clientY - r.top) / r.height * 100).toFixed(1) + "%");
});

/* ---------- magnetic CTAs ---------- */
if (finePointer && !reduceMotion) {
  document.querySelectorAll("[data-magnetic]").forEach(el => {
    const strength = parseFloat(el.dataset.magnetic) || 0.25;
    el.addEventListener("pointermove", e => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * strength;
      const y = (e.clientY - r.top - r.height / 2) * strength;
      el.style.transform = `translate(${x}px, ${y}px)`;
    });
    el.addEventListener("pointerleave", () => { el.style.transform = ""; });
  });
}

/* ---------- CTA band as a boarding pass: the stub names this page's destination ---------- */
const STUB = { globe: ["MNL", "WORLD", "Any show, any city"], calendar: ["MNL", "CAN", "Canton Fair 2027"], passport: ["MNL", "PEK", "M visa filing"], plane: ["MNL", "CAN", "Door to door"], briefcase: ["MNL", "CAN", "Your quotation"], grid: ["MNL", "CAN", "Pick your phase"] };
document.querySelectorAll(".cta-band[data-art]").forEach(b => {
  const [from, to, note] = STUB[b.dataset.art] || ["MNL", "CAN", "Industry trip"];
  const acts = b.querySelector(".cta-actions");
  if (acts) acts.insertAdjacentHTML("afterbegin", `<p class="cta-stub" aria-hidden="true"><span>${from}</span><svg class="icon"><use href="#i-plane"/></svg><span>${to}</span><small>${note}</small></p>`);
});

/* ---------- small helpers ---------- */
document.querySelectorAll("[data-year]").forEach(el => (el.textContent = new Date().getFullYear()));
