# Content guide

ExpoBusiness Travel Services: corporate travel for Philippine companies, a subsidiary of Immaculate Connections.
Rule of thumb: **edit the source, then run `python build.py`.** Never edit the generated root `*.html` pages.

## Pages

| Page | Source | Notes |
|---|---|---|
| Home | `src/index.html` | The hero is the ONLY place for the niche promotion (currently Canton Fair 2027). Change the promo there. |
| 2027 Expos | `src/expos.html` | Rows are built from `assets/js/data/expo-china.js` + `expo-world.js`. Filters in `assets/js/expos.js`. |
| Corporate Services | `src/services.html` | |
| Visa | `src/visa.html` | Visa table checked November 2026. Re-check before changing claims. |
| About | `src/about.html` | FAQ text is duplicated in the page's FAQPage JSON-LD (meta line): change both. |
| Request Corporate Proposal | `src/proposal.html` | Form logic in `assets/js/proposal.js`. Sends via the visitor's email app (mailto) to `contact.email`. |

Shared layout (top bar, header, footer, chat button) lives in `build.py`. Styles: `assets/css/site.css` (navy #0B2545, gold #D4AF37, Inter + Roboto).
Chat answers ("Ask Expo"): `assets/js/concierge.js` → `KB`.

Old URLs (inquiry, itineraries, china-expos, world-expos, event, industries, industry-*) are redirect stubs written by the build. Do not delete them.

## Site details: `assets/js/data/site-config.js`

Any value still in `[brackets]` is NOT shown on the site; the build lists them at the end. Fill in a real value and rebuild to show it:
- `contact.phone`, `contact.mobile`, `contact.hours`
- `legal.dot` → shows "(DOT Accredited)" in the top bar and the DOT badge in the footer
- `legal.iata`, `legal.philgeps` → footer badges (only if the company really holds them)
- `legal.registration`, `social.*`
- `clients` → client logo row under the hero. Only real clients, with their permission.

Canton Fair dates: `canton.sessions`. Set `"expected": false` once the organiser publishes the official calendar, and update the note in `src/index.html`.

## Expos

Add a show to `expo-china.js` (China/Hong Kong) or `expo-world.js` (elsewhere), run the build. `dates_status: "confirmed"` only after checking the organiser's site.

## Photos

Photos are Unsplash (free licence), loaded from images.unsplash.com. Replace with the company's own trip photos when available.
