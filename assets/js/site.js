// Shared behaviour: sticky header shadow, mobile menu, fade-in on scroll.
(() => {
  const header = document.querySelector(".site-header");
  const burger = document.querySelector(".burger");
  const onScroll = () => header && header.classList.toggle("scrolled", scrollY > 8);
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  if (burger) burger.addEventListener("click", () => {
    const open = header.classList.toggle("open");
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
