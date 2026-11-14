// Shared behaviour: sticky header shadow, mobile menu, fade-in on scroll.
(() => {
  const header = document.querySelector(".site-header");
  const burger = document.querySelector(".burger");
  const topbar = document.querySelector(".topbar");
  // transparent header over the hero; frosted once scrolled, and the top bar tucks away
  const onScroll = () => { const s = scrollY > 8; if (header) header.classList.toggle("scrolled", s); if (topbar) topbar.classList.toggle("tucked", s || (header && header.classList.contains("open"))); };
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  if (burger) burger.addEventListener("click", () => {
    const open = header.classList.toggle("open");
    if (topbar) topbar.classList.toggle("tucked", open || scrollY > 8);
    burger.setAttribute("aria-expanded", open);
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });
  addEventListener("keydown", e => { if (e.key === "Escape" && header.classList.contains("open")) burger.click(); });

  const els = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0, rootMargin: "0px 0px -40px 0px" });
    els.forEach(el => io.observe(el));
  } else els.forEach(el => el.classList.add("in"));
})();
