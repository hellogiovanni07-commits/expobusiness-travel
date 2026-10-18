// One list of every 2027 expo (China guide data + world data) with the helpers the articles pages share:
// slugs, categories, photos and industry labels. Data files stay the single source; nothing is copied here.
(() => {
  const CN = window.EXPO_CN || [], WORLD = window.EXPO_WORLD || [];
  const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  // Category = where the article files under. Mainland China and Hong Kong get their own; everything else uses its region.
  const T = window.TAXONOMY;
  const CATEGORIES = T.regions;
  const category = e => e.city === "Hong Kong" ? "Hong Kong" : e._src === "cn" ? "China" : (e.region || "Other");

  // Industry labels, which industries have a page, and article photos all come from data/taxonomy.js.
  const INDUSTRY = Object.fromEntries(Object.entries(T.industries).map(([k, v]) => [k, v.short]));
  const PAGES = Object.keys(T.industries).filter(k => T.industries[k].page);

  const U = id => `https://images.unsplash.com/photo-${id}?w=1400&q=72`;
  const PHOTO = { ...Object.fromEntries(Object.entries(T.industries).map(([k, v]) => [k, v.photo])), ...T.photos };
  const photo = (e, w = 1400) => U(e.canton ? PHOTO.canton : PHOTO[(e.industries || [])[0]] || PHOTO.expo).replace("w=1400", "w=" + w);

  const slugify = s => String(s).toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const all = [...CN.map(e => ({ ...e, _src: "cn", country: e.city === "Hong Kong" ? "Hong Kong SAR" : "China" })), ...WORLD.map(e => ({ ...e, _src: "world" }))];
  const seen = {};
  all.forEach(e => {
    let s = slugify(e.short || e.name);
    if (seen[s]) s += "-" + slugify(e.city);
    seen[s] = 1; e.slug = s; e.cat = category(e);
    e.mi = +e.month.slice(5) - 1;
    e.when = e.dates_2027 || `${MONTHS[e.mi]} 2027`;
    // Start day for ordering within a month: first 1–2 digit number in the date text ("Jan 6–9" or "11–14 Jan"), else mid-month.
    const d = (e.dates_2027 || "").match(/\b(\d{1,2})\b/); e.day = d ? +d[1] : 15;
    // Rough read time from the article's text length.
    e.read = Math.max(3, Math.round(((e.why || "").length + (e.sectors || "").length) / 90) + 2);
  });
  all.sort((a, b) => a.month.localeCompare(b.month) || a.day - b.day || a.name.localeCompare(b.name));

  const url = e => `event.html?e=${e.slug}`;
  const industryLinks = e => (e.industries || []).map(k => PAGES.includes(k) ? `<a href="industry-${k}.html">${INDUSTRY[k]}</a>` : `<span>${INDUSTRY[k] || k}</span>`).join("");

  window.EXPOS = { all, MON, MONTHS, CATEGORIES, INDUSTRY, PAGES, photo, url, slugify, industryLinks, bySlug: s => all.find(e => e.slug === s) };
})();
