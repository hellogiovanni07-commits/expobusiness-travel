"""Content for the ExpoBusiness social library: categories, posts, captions, calendar.

Facts only from BRAND-FACTS.md, the site's expo data (assets/js/data), src/services.html and src/visa.html.
No prices, client names, testimonials, badges or superlatives about ExpoBusiness. British English.
"""
import expodata

EXPOS = expodata.load()
for _x in EXPOS:
    if _x["country"] == "Hong Kong SAR":
        _x["country"] = "Hong Kong"

def X(short):
    return dict(next(x for x in EXPOS if x["short"] == short))

def month(*ms):
    from render import sort_key
    return sorted([x for x in EXPOS if int(x["month"][5:]) in ms], key=sort_key)

def pick(xs, n):
    """Up to n expos, confirmed first, kept in date order."""
    from render import sort_key
    ranked = sorted(xs, key=lambda x: (x["dates_status"] != "confirmed", sort_key(x)))
    chosen = []
    for m in sorted({x["month"] for x in xs}):  # every month represented
        chosen.append(next(x for x in ranked if x["month"] == m))
    for x in ranked:
        if len(chosen) >= n: break
        if x not in chosen: chosen.append(x)
    chosen = chosen[:n]
    return sorted(chosen, key=sort_key)

ALL3 = ["LinkedIn", "Facebook", "Instagram"]
LIFB = ["LinkedIn", "Facebook"]
IGFB = ["Instagram", "Facebook"]

CATEGORIES = [
    {"id": "expo-spotlight", "title": "Expo spotlight", "description": "One 2027 trade expo per post: dates (confirmed or expected), city, venue, sectors and who should go. Drives visits to the expo calendar.", "cadence": "weekly, Monday"},
    {"id": "trade-calendar", "title": "Trade-show calendar", "description": "Month-by-month list of 2027 trade expos from the site calendar, plus the year at a glance. Saveable reference content.", "cadence": "fortnightly, Wednesday (first week of each month)"},
    {"id": "destination-guides", "title": "Destination business guides", "description": "Country cards for Philippine business travellers: expos on the calendar, host cities and the visa position from our visa page.", "cadence": "fortnightly, Thursday"},
    {"id": "visa-documents", "title": "Visa & documents", "description": "Plain-English visa pointers for Philippine passport holders on short business trips, with the standing disclaimer that embassies decide.", "cadence": "fortnightly, Thursday (alternates with destination guides)"},
    {"id": "how-we-work", "title": "How we work", "description": "Our services and working terms: one coordinator, itemised proposals, official invoices, nothing booked until the client approves.", "cadence": "weekly, Tuesday"},
    {"id": "planning-tips", "title": "Planning checklists & tips", "description": "Practical, general trade-show and business-trip checklists that buyers and admin teams can save and reuse.", "cadence": "weekly, Friday"},
    {"id": "delegations-mice", "title": "Delegations & MICE", "description": "For chambers, associations, LGUs and companies running group missions, conferences and incentive trips.", "cadence": "fortnightly, Wednesday"},
    {"id": "partnership-brand", "title": "Partnership & brand", "description": "Who we are, our promise and our partnership with Immaculate Connections. Every post carries the partner lockup.", "cadence": "fortnightly, Friday (alternates with tips)"},
]

def posts():
    P = []
    add = P.append

    # ================= A. Expo spotlight (layout expo) =================
    spot = [
        ("ex-01-gulfood", "Gulfood", "Food & beverage · Dubai", "Philippine food and halal exporters can reach GCC buyers and the Filipino diaspora market.",
         "Gulfood runs 15 to 19 March 2027 in Dubai, across Dubai World Trade Centre and Expo City Dubai.\nFor food and halal exporters looking at GCC buyers, it is the date to plan around.\nUAE business visas are usually arranged before travel. Full 2027 calendar on our site.",
         ["#Gulfood", "#FoodExport", "#Halal", "#Dubai", "#TradeShow", "#BusinessTravel"]),
        ("ex-02-hannover", "Hannover Messe", "Industrial · Hannover", None,
         "Hannover Messe 2027: 5 to 8 April, Hannover Exhibition Grounds.\nAutomation, robotics and energy tech for Philippine factories and economic zones.\nGermany is in the Schengen area, so book visa appointments early. Calendar link in bio.",
         ["#HannoverMesse", "#Manufacturing", "#Automation", "#Germany", "#TradeShow"]),
        ("ex-03-canton", "Canton Fair Spring", "Multi-sector · Guangzhou", "China's largest trade fair, run in three phases, and the flagship sourcing trip in most product categories.",
         "The Spring Canton Fair is expected in three phases from mid-April to early May 2027. Dates are the usual pattern, not yet published.\nPick the phase that matches your product category.\nThe China business (M) visa needs four to six weeks. Start early.",
         ["#CantonFair", "#Sourcing", "#Guangzhou", "#Importers", "#TradeShow", "#BusinessTravel"]),
        ("ex-04-foodex", "FOODEX", "Food & beverage · Tokyo", None,
         "FOODEX Japan 2027: 9 to 12 March at Tokyo Big Sight.\nA route to Japanese importers for Philippine food exporters, and a place for food buyers to source Japanese products.\nJapan needs a short-term business visa through accredited agencies.",
         ["#FOODEX", "#FoodExport", "#Japan", "#Tokyo", "#TradeShow"]),
        ("ex-05-salone", "Salone", "Furniture & design · Milan", "For high-end furniture exporters, interior designers and hotel fit-out buyers. Lighting shows at Euroluce in 2027.",
         "Salone del Mobile.Milano runs 13 to 18 April 2027 at Fiera Milano Rho, with Euroluce for lighting.\nUseful for furniture exporters, designers and hotel fit-out teams.\nItaly is Schengen: apply to the country of your main stay.",
         ["#SaloneDelMobile", "#Furniture", "#InteriorDesign", "#Milan", "#TradeShow"]),
        ("ex-06-ifex", "IFEX", "Food export · Metro Manila", None,
         "Closer to home: IFEX Philippines 2027, 20 to 22 May at the World Trade Center Metro Manila.\nLocal producers meet foreign buyers, and retailers find new suppliers.\nHosting overseas buyers or visitors? We can handle their hotels and transfers.",
         ["#IFEXPhilippines", "#FoodExport", "#MetroManila", "#TradeShow", "#PhilippineBusiness"]),
    ]
    for pid, short, kick, why, cap, tags in spot:
        x = X(short)
        if why:
            x["why"] = why
        x["country"] = "Philippines" if x["country"] == "Philippines" else x["country"]
        add({"id": pid, "category": "expo-spotlight", "layout": "expo", "format": "1080x1350", "title": f'Expo spotlight: {x["name"]}',
             "kicker": kick, "_args": (x,), "caption": cap, "hashtags": tags, "platforms": ALL3, "path": "expos.html"})

    # ================= B. Trade-show calendar =================
    cal = [
        ("tc-01-jan-feb", "01", "January &amp; February", (1, 2), 9,
         "January and February 2027 on one page: CES, NRF, Heimtextil, Ambiente, MAGIC and more.\nA filled dot means the organiser has published dates; an open dot means expected.\nSave this for planning. Full calendar on our site.", ["#TradeShow2027", "#ExpoCalendar", "#BusinessTravel", "#Importers"]),
        ("tc-02-march", "03", "March", (3,), 9,
         "March is the busiest month on our 2027 calendar, with 21 trade expos.\nHere are ten with confirmed dates, from Frankfurt to Tokyo and Dubai.\nSave it and check the rest on the site.", ["#TradeShow2027", "#ExpoCalendar", "#Gulfood", "#ProWein", "#BusinessTravel"]),
        ("tc-03-april", "04", "April", (4,), 9,
         "April 2027: Hannover Messe, Salone del Mobile, the Hong Kong spring fairs and the first phase of the Canton Fair.\nNine highlights here; the full list is on our calendar.\nVisas for April trips should start in February.", ["#TradeShow2027", "#CantonFair", "#HannoverMesse", "#ExpoCalendar"]),
        ("tc-04-may", "05", "May", (5,), 9,
         "May 2027: food shows in Singapore, Bangkok, Chicago and Amsterdam, and IFEX here in Metro Manila.\nSave this list for the food and hospitality team.\nFull calendar on our site.", ["#TradeShow2027", "#FoodShow", "#IFEXPhilippines", "#ExpoCalendar"]),
        ("tc-05-jun-aug", "06", "June to August", (6, 7, 8), 9,
         "Mid-year 2027 is quieter: Computex, Seoul Food, GILE, the Summer Fancy Food Show and Hong Kong's Food Expo.\nA good window to plan the busy autumn season.\nFull calendar on our site.", ["#TradeShow2027", "#Computex", "#ExpoCalendar", "#BusinessTravel"]),
        ("tc-06-september", "09", "September", (9,), 9,
         "September 2027: IFA Berlin, IAA Mobility, Big 5 Saudi and a run of Shanghai and Shenzhen fairs.\nSeveral China dates are expected rather than confirmed; we check them before booking.\nSave this list.", ["#TradeShow2027", "#IFA", "#ExpoCalendar", "#BusinessTravel"]),
    ]
    for pid, num, mt, ms, n, cap, tags in cal:
        xs = month(*ms)
        add({"id": pid, "category": "trade-calendar", "layout": "cal", "format": "1080x1350", "title": f"2027 trade-show calendar: {mt.replace('&amp;', '&')}",
             "num": num, "month_title": mt, "_args": (pick(xs, n), len(xs)), "caption": cap, "hashtags": tags, "platforms": ALL3, "path": "expos.html"})
    countries = len({x["country"] for x in EXPOS})
    add({"id": "tc-07-year-glance", "category": "trade-calendar", "layout": "glance", "format": "1200x627", "title": "2027 trade expos at a glance",
         "title_html": f"{len(EXPOS)} trade expos.<br>{countries} countries.<br>One calendar.", "_args": (EXPOS,),
         "caption": f"Our 2027 calendar lists {len(EXPOS)} trade expos in {countries} countries, with dates marked confirmed or expected.\nMarch and April are the busiest months; mid-year is quieter.\nFilter it by sector and month on our site.",
         "hashtags": ["#TradeShow2027", "#ExpoCalendar", "#B2B", "#BusinessTravel"], "platforms": LIFB, "path": "expos.html"})
    # carousel: autumn calendar
    oc, nv = month(10), month(11)
    add({"id": "tc-08-autumn-carousel", "category": "trade-calendar", "format": "1080x1350", "title": "Carousel: autumn 2027 trade-show calendar",
         "tag": "Trade-show calendar", "cta": "Full calendar", "path": "expos.html",
         "slides": [
             {"type": "cover", "title_html": "Autumn 2027:<br><em>the trade-show season</em> to plan now", "lead": "October and November hold 22 expos on our calendar, from the Canton Fair to MEDICA and Big 5 Global."},
             {"type": "cal", "num": "10", "kicker": "2027 trade expos", "title_html": "October", "xs": pick(oc, 8), "more": max(len(oc) - 8, 0)},
             {"type": "cal", "num": "11", "kicker": "2027 trade expos", "title_html": "November", "xs": pick(nv, 8), "more": max(len(nv) - 8, 0)},
             {"type": "point", "num": "!", "title_html": "Most autumn dates are still expected", "lead": "Organisers publish many autumn dates later in the year. We check each one before anything is booked.",
              "items": [("calendar", "Pencil in the usual month now"), ("passport", "Start visas once dates are firm"), ("bed", "Book hotels near the venue early for fair weeks")]},
             {"type": "end", "title_html": "Planning an autumn trip?", "lead": "Tell us the fair, dates and headcount. We reply with an itemised proposal."},
         ],
         "caption": "Autumn 2027 in five slides: October and November trade expos, and what to do while dates are still expected.\nSave it for your planning meeting.\nFull calendar on our site.",
         "hashtags": ["#TradeShow2027", "#CantonFair", "#ExpoCalendar", "#BusinessTravel", "#Importers"], "platforms": ALL3})

    # ================= C. Destination guides =================
    dest = [
        ("dg-01-germany", "Germany", "required (Schengen)", "Apply to the country of the trade fair or main stay; book appointments early in peak season.",
         "Germany has 12 trade expos on our 2027 calendar, in Frankfurt, Cologne, Düsseldorf, Hannover, Berlin and Munich.\nPhilippine passport holders need a Schengen visa for business visits.\nBook the appointment early in peak season.", ["#Germany", "#Messe", "#BusinessTravel", "#SchengenVisa", "#TradeShow"]),
        ("dg-02-uae", "UAE", "required", "Usually arranged before travel, often through the host or hotel.",
         "Dubai on the 2027 calendar: Intersec, WHX, Gulfood, Big 5 Global and Automechanika.\nThe UAE business visa is usually arranged before travel, often through the host or hotel.\nWe confirm each case when we prepare your proposal.", ["#Dubai", "#UAE", "#BusinessTravel", "#TradeShow", "#Gulfood"]),
        ("dg-03-japan", "Japan", "required", "Short-term business visa through accredited agencies.",
         "Japan on our 2027 calendar: FOODEX, GREEN×EXPO, CEATEC and the Japan Mobility Show.\nPhilippine passport holders apply for a short-term business visa through accredited agencies.\nAllow time for the paperwork.", ["#Japan", "#Tokyo", "#BusinessTravel", "#FOODEX", "#TradeShow"]),
        ("dg-04-usa", "USA", "required (B-1)", "B-1 business visa with an embassy interview; waiting times can be long.",
         "The USA on our 2027 calendar: CES, NRF, MAGIC, High Point, the NRA Show and the Summer Fancy Food Show.\nA B-1 business visa needs an embassy interview, and waiting times can be long.\nPlan well ahead.", ["#USA", "#CES2027", "#BusinessTravel", "#B1Visa", "#TradeShow"]),
        ("dg-05-hongkong", "Hong Kong", "visa-free, 14 days", "Crossing to Shenzhen or Guangzhou still needs a mainland China visa.",
         "Hong Kong hosts the HKTDC fairs through the year: toys, jewellery, electronics, lighting, gifts and food.\nPhilippine passport holders can visit visa-free for 14 days.\nCrossing to Shenzhen or Guangzhou still needs a mainland China visa.", ["#HongKong", "#HKTDC", "#BusinessTravel", "#Sourcing", "#TradeShow"]),
        ("dg-06-vietnam", "Vietnam", "visa-free (ASEAN)", "Short visits are visa-free within ASEAN; length of stay differs by country.",
         "Vietnam on our 2027 calendar: VIFA EXPO in Ho Chi Minh City and Vietnam Expo in Hanoi.\nShort business visits are visa-free for Philippine passport holders, as across ASEAN.\nLength of stay differs by country, so we confirm before you fly.", ["#Vietnam", "#ASEAN", "#BusinessTravel", "#VIFA", "#TradeShow"]),
    ]
    for pid, c, vs, vn, cap, tags in dest:
        xs = [x for x in EXPOS if x["country"] == c]
        add({"id": pid, "category": "destination-guides", "layout": "dest", "format": "1080x1080", "title": f"Destination guide: {c}",
             "country_title": c, "visa_status": vs, "visa_note": vn, "_args": (xs,), "caption": cap, "hashtags": tags, "platforms": ALL3, "path": "expos.html"})

    # ================= D. Visa & documents =================
    add({"id": "vd-01-overview", "category": "visa-documents", "layout": "visa", "kind": "split", "format": "1080x1350", "title": "Visa required or visa-free: 10 destinations",
         "kicker": "Philippine passport · business visit", "title_html": "Visa required or visa-free?",
         "required": [("Mainland China", "Business (M) visa, usually with an invitation letter"), ("Japan", "Short-term business visa via accredited agencies"),
                      ("South Korea", "Short-term business visa"), ("United Arab Emirates", "Usually arranged before travel"),
                      ("Schengen area", "Apply to the country of the fair or main stay"), ("United States", "B-1 visa with an embassy interview"),
                      ("United Kingdom", "Standard Visitor visa")],
         "free": [("Hong Kong", "14 days"), ("Macao", "30 days"), ("ASEAN countries", "Short visits; stay differs by country")],
         "caption": "Ten common business destinations for Philippine ordinary passport holders, at a glance.\nRules change, so we confirm each case when we prepare your proposal.\nFull table on our visa page.",
         "hashtags": ["#BusinessVisa", "#PhilippinePassport", "#BusinessTravel", "#VisaTips"], "platforms": ALL3, "path": "visa.html"})
    add({"id": "vd-02-hk-macao", "category": "visa-documents", "layout": "visa", "kind": "stats", "format": "1080x1350", "title": "Hong Kong 14 days, Macao 30 days visa-free",
         "kicker": "Visa-free short visits", "title_html": "No visa needed. But check the border.",
         "lead": "Philippine ordinary passport holders can visit Hong Kong and Macao for short business trips without a visa.",
         "stats": [("14", "Hong Kong", "Crossing to Shenzhen or Guangzhou still needs a mainland China visa."), ("30", "Macao", "Separate from mainland China rules.")],
         "caption": "Hong Kong: visa-free for 14 days. Macao: 30 days.\nThe catch: a day trip to Shenzhen or Guangzhou still needs a mainland China visa.\nPlanning a fair-and-factory trip? We sort both.",
         "hashtags": ["#HongKong", "#Macao", "#BusinessVisa", "#BusinessTravel", "#VisaTips"], "platforms": ALL3, "path": "visa.html"})
    add({"id": "vd-03-schengen", "category": "visa-documents", "layout": "visa", "kind": "points", "format": "1080x1350", "title": "Schengen visa for European trade fairs",
         "kicker": "Germany, Italy, France and more", "title_html": "Going to a European trade fair?",
         "lead": "Most European fairs on our calendar are in the Schengen area, and Philippine passport holders need a visa.",
         "points": [("Apply to the right country", "The country of the trade fair, or of your main stay if the trip covers several."), ("Book the appointment early", "Peak season fills appointment slots, so do not leave it late."), ("Match the dates", "Every visa is checked against travel dates and entries before departure.")],
         "caption": "Frankfurt, Milan, Paris, Cologne: most European fairs sit inside the Schengen area.\nApply to the country of the fair or your main stay, and book the appointment early in peak season.\nWe prepare and file; the embassy decides.",
         "hashtags": ["#SchengenVisa", "#Messe", "#BusinessTravel", "#VisaTips", "#Europe"], "platforms": ALL3, "path": "visa.html"})
    add({"id": "vd-04-us-b1", "category": "visa-documents", "layout": "visa", "kind": "points", "format": "1080x1350", "title": "US B-1 business visa: start early",
         "kicker": "United States", "title_html": "CES, NRF or a US buyer visit? Start the B-1 early.",
         "points": [("It is a B-1 business visa", "The category for meetings, trade shows and business visits."), ("There is an embassy interview", "Every applicant attends in person."), ("Waiting times can be long", "Check the current wait before you commit to dates.")],
         "caption": "Heading to a US trade show? Philippine passport holders need a B-1 business visa, with an embassy interview.\nWaiting times can be long, so start well ahead of the show.\nWe check documents and track the application.",
         "hashtags": ["#B1Visa", "#USA", "#BusinessVisa", "#BusinessTravel", "#TradeShow"], "platforms": ALL3, "path": "visa.html"})
    add({"id": "vd-05-uk", "category": "visa-documents", "layout": "visa", "kind": "points", "format": "1080x1350", "title": "UK Standard Visitor visa for business",
         "kicker": "United Kingdom", "title_html": "One visa for UK meetings and trade fairs",
         "lead": "Going to IFE London or meeting UK suppliers? The Standard Visitor visa covers business meetings and trade fairs.",
         "points": [("Standard Visitor visa", "Covers business meetings and trade fairs."), ("Documents checked first", "Passport, photos, company certificates and invitation letters against the official list."), ("Tracked to the end", "We follow the application until the passport is back.")],
         "caption": "The UK Standard Visitor visa covers business meetings and trade fairs.\nWe check the documents first, prepare the forms with each traveller and track the application.\nDetails on our visa page.",
         "hashtags": ["#UKVisa", "#IFELondon", "#BusinessVisa", "#BusinessTravel"], "platforms": LIFB, "path": "visa.html"})
    add({"id": "vd-06-what-we-handle", "category": "visa-documents", "layout": "svc", "format": "1080x1080", "title": "Visa paperwork, off your desk",
         "kicker": "Business visa assistance", "title_html": "Visa paperwork, off your desk",
         "lead": "Document checks, forms, appointments and tracking until passports are back.",
         "items": [("search", "Document check", "Against the embassy's list."), ("file", "Forms and filing", "Prepared with each traveller."),
                   ("calendar", "Appointments", "Booked and attended to."), ("passport", "Passport returned", "Checked against travel dates.")],
         "cta": "Visa help", "path": "visa.html",
         "caption": "Four steps we take on every business visa: document check, forms and filing, the appointment, and tracking until the passport is back.\nThe embassy decides; we make sure the file is complete.\nMore on our visa page.",
         "hashtags": ["#BusinessVisa", "#CorporateTravel", "#VisaTips", "#BusinessTravel"], "platforms": ALL3})
    add({"id": "vd-07-china-visa-carousel", "category": "visa-documents", "format": "1080x1350", "title": "Carousel: China business (M) visa documents",
         "tag": "Visa & documents", "cta": "Visa help", "path": "visa.html",
         "slides": [
             {"type": "cover", "title_html": "China business visa:<br><em>the five documents</em>", "lead": "The M visa covers trade fairs, supplier meetings and factory visits in mainland China."},
             {"type": "point", "num": "01", "title_html": "Passport and photo", "items": [("passport", "Passport valid for at least six months, with blank visa pages"), ("camera", "Recent passport photo to the required specification")]},
             {"type": "point", "num": "02", "title_html": "Online application", "lead": "Completed and approved before the visit to the visa centre.", "items": [("file", "Prepared with each traveller"), ("calendar", "Then the appointment is booked")]},
             {"type": "point", "num": "03", "title_html": "Invitation and business proof", "items": [("mail", "Invitation letter from a Chinese company or the trade fair organiser"), ("briefcase", "Proof of your business, such as DTI or SEC registration")]},
             {"type": "point", "num": "4–6", "title_html": "Weeks of lead time", "lead": "Start at least four to six weeks before departure.", "items": [("receipt", "Fees and processing times are set by the visa centre"), ("check", "We confirm the current figures when we file"), ("shield", "The embassy decides every application")]},
             {"type": "end", "title_html": "Need visas for a team?", "lead": "Tell us the destination, headcount and travel dates. We handle the paperwork. The embassy decides every application."},
         ],
         "caption": "Going to the Canton Fair or visiting factories in China? The business (M) visa needs five things, set out in this carousel.\nAllow four to six weeks.\nSave it and share it with your travel admin.",
         "hashtags": ["#ChinaVisa", "#CantonFair", "#BusinessVisa", "#Sourcing", "#BusinessTravel"], "platforms": ALL3})
    add({"id": "vd-08-story-visafree", "category": "visa-documents", "layout": "story", "kind": "stats", "format": "1080x1920", "title": "Story: visa-free business destinations",
         "tag": "Visa & documents", "kicker": "Philippine passport · short visits", "title_html": "Visa-free for business",
         "stats": [("14", "days in Hong Kong", "Shenzhen or Guangzhou still need a China visa."), ("30", "days in Macao", "Separate from mainland China rules."), ("ASEAN", "short visits", "Length of stay differs by country.")],
         "note": DISC, "cta": "Visa table", "path": "visa.html",
         "caption": "Visa-free for short business visits: Hong Kong 14 days, Macao 30 days, ASEAN short visits.\nTap through to the full table.", "hashtags": ["#BusinessVisa", "#VisaTips", "#BusinessTravel"], "platforms": IGFB})

    # ================= E. How we work =================
    add({"id": "hw-01-flights-hotels", "category": "how-we-work", "layout": "svc", "format": "1080x1080", "title": "Flights and hotels, booked to your policy",
         "kicker": "Corporate travel", "title_html": "Flights and hotels, booked to your policy",
         "lead": "For companies that send people abroad for meetings, audits, training or sales calls.",
         "items": [("plane", "Fares compared", "Baggage and change rules spelled out."), ("bed", "Business hotels", "Close to where your team works."), ("swap", "Changes handled", "Dates, names and rebooking.")],
         "caption": "Sending people abroad for audits, training or sales calls?\nWe compare fares across airlines, spell out the baggage and change rules, and book hotels near where your team works.\nChanges are handled for you.",
         "hashtags": ["#CorporateTravel", "#BusinessTravel", "#TravelManagement", "#PhilippineBusiness"], "platforms": ALL3})
    add({"id": "hw-02-trade-show-trips", "category": "how-we-work", "layout": "svc", "format": "1080x1080", "title": "Trade show trips that end in orders",
         "kicker": "Trade show trips", "title_html": "Trade show trips that end in orders",
         "lead": "For buyers and procurement teams at expos in Asia, Europe, the Middle East and the US.",
         "items": [("ticket", "Registration", "Buyer registration and invitation letters."), ("bed", "Hotels near the venue", "Booked early for fair weeks."),
                   ("map", "Hall planning", "By product category."), ("factory", "Supplier meetings", "And factory visits around fair days.")],
         "caption": "A trade show trip is more than a flight and a badge.\nWe handle buyer registration and invitation letters, hotels near the venue, hall planning by product category, and supplier meetings around fair days.\nSee the 2027 calendar on our site.",
         "hashtags": ["#TradeShow", "#Procurement", "#Sourcing", "#BusinessTravel", "#Expo2027"], "platforms": ALL3})
    add({"id": "hw-03-on-the-ground", "category": "how-we-work", "layout": "svc", "format": "1080x1080", "title": "On the ground: interpreters, transfers, factory routing",
         "kicker": "Ground logistics", "title_html": "On the ground, nothing left to chance",
         "lead": "The details that decide whether a business trip runs on time.",
         "items": [("chat", "Interpreters", "Bilingual, by the half or full day."), ("bus", "Transfers", "Airport transfers, private vans, drivers."),
                   ("factory", "Factory routing", "Visit routes and transport."), ("box", "Freight introductions", "Forwarders for samples and cargo.")],
         "caption": "The trip is decided on the ground.\nBilingual interpreters by the half or full day, airport transfers and drivers, factory visit routing, and introductions to forwarders for samples and cargo.\nAll arranged with the rest of the trip.",
         "hashtags": ["#BusinessTravel", "#Sourcing", "#FactoryVisit", "#Interpreter", "#Logistics"], "platforms": ALL3})
    add({"id": "hw-04-finance-ready", "category": "how-we-work", "layout": "li_list", "format": "1200x627", "title": "Finance-ready from the first quote",
         "tag": "How we work", "kicker": "For finance and admin teams", "title_html": "Finance-ready from the first quote",
         "lead": "Every trip is quoted and invoiced the way your accounts team needs it.",
         "items": [("list", "Itemised proposals", "Airfare, hotel, visa, registration and ground listed separately."), ("briefcase", "Corporate terms", "For repeat travellers, groups and annual programmes."), ("receipt", "Official invoices", "Invoices and receipts in your company's name.")],
         "caption": "For finance and admin teams: every proposal is itemised, so you can approve line by line.\nRepeat travellers, groups and annual programmes are quoted on corporate terms.\nInvoices and official receipts are issued in your company's name.",
         "hashtags": ["#CorporateTravel", "#Finance", "#TravelManagement", "#B2B"], "platforms": LIFB, "path": "services.html"})
    add({"id": "hw-05-nothing-booked", "category": "how-we-work", "layout": "statement", "format": "1080x1080", "title": "Nothing is booked or paid until you approve",
         "tag": "How we work", "title_html": "Nothing is booked or paid <em>until you approve.</em>",
         "lead": "You see an itemised proposal first. You approve line by line. Then we book.",
         "caption": "One rule we work by: nothing is booked or paid until you approve.\nYou get an itemised proposal first and approve it line by line.\nRequest a corporate proposal on our site.",
         "hashtags": ["#CorporateTravel", "#BusinessTravel", "#PhilippineBusiness", "#B2B"], "platforms": ALL3, "path": "proposal.html"})
    add({"id": "hw-06-one-coordinator", "category": "how-we-work", "layout": "statement", "navy": True, "format": "1080x1350", "title": "One coordinator per trip",
         "tag": "How we work", "title_html": "One trip. <em>One coordinator.</em> One set of invoices.",
         "lead": "Visas, flights, hotels, registration and ground transport handled together, by one person who knows the whole trip.",
         "caption": "Every trip gets one coordinator.\nVisas, flights, hotels, registration and ground transport are handled together, so nothing falls between suppliers.\nBased in Metro Manila.",
         "hashtags": ["#CorporateTravel", "#BusinessTravel", "#MetroManila", "#TradeShow"], "platforms": ALL3, "path": "about.html", "cta": "About us"})
    add({"id": "hw-07-process-carousel", "category": "how-we-work", "format": "1080x1350", "title": "Carousel: how a trip runs with us",
         "tag": "How we work", "cta": "Request a proposal", "path": "proposal.html",
         "slides": [
             {"type": "cover", "title_html": "How a business trip <em>runs with us</em>", "lead": "Five steps, from your first message to the official receipt."},
             {"type": "point", "num": "01", "title_html": "You send the brief", "lead": "Destination, dates and headcount. A trade fair, meetings, or both.", "items": [("mail", "One message is enough to start")]},
             {"type": "point", "num": "02", "title_html": "We send an itemised proposal", "items": [("plane", "Airfare"), ("bed", "Hotel"), ("passport", "Visa"), ("ticket", "Registration and ground services")]},
             {"type": "point", "num": "03", "title_html": "You approve, line by line", "lead": "Nothing is booked or paid until you approve.", "items": [("list", "Every cost on its own line"), ("swap", "Ask for changes before anything is booked"), ("shield", "Approve only what you need")]},
             {"type": "point", "num": "04", "title_html": "We book, file and coordinate", "lead": "Visas, flights, hotels, registration and transport handled together, with one coordinator for the trip.", "items": [("receipt", "Official invoices and receipts in your company's name")]},
             {"type": "end", "title_html": "Planning a trip?", "lead": "Send destination, dates and headcount. We reply with an itemised corporate proposal."},
         ],
         "caption": "How a business trip runs with us, in five slides: brief, itemised proposal, your approval, booking and coordination, official invoices.\nNothing is booked or paid until you approve.\nRequest a proposal on our site.",
         "hashtags": ["#CorporateTravel", "#BusinessTravel", "#TravelManagement", "#B2B", "#PhilippineBusiness"], "platforms": ALL3})
    add({"id": "hw-08-story-coordinator", "category": "how-we-work", "layout": "story", "kind": "list", "format": "1080x1920", "theme": "dark", "title": "Story: what one coordinator handles",
         "tag": "How we work", "kicker": "One coordinator per trip", "title_html": "Everything, handled together",
         "items": [("passport", "Visas", "Documents, forms, appointments, tracking."), ("plane", "Flights", "Fares compared, rules spelled out."), ("bed", "Hotels", "Near the venue or the office."),
                   ("ticket", "Registration", "Buyer badges and invitation letters."), ("bus", "Ground transport", "Transfers, vans and drivers.")],
         "cta": "Our services", "path": "services.html",
         "caption": "Visas, flights, hotels, registration and ground transport. One coordinator.", "hashtags": ["#CorporateTravel", "#BusinessTravel"], "platforms": IGFB})

    # ================= F. Planning tips =================
    add({"id": "pt-01-packing", "category": "planning-tips", "layout": "tips", "kind": "check", "format": "1080x1350", "title": "Trade fair packing checklist",
         "kicker": "Save for your next fair", "title_html": "What to pack for a trade fair",
         "items": [("Business cards, and plenty of them", "You will hand out more than you expect."), ("Your sourcing list", "Products, specs and target quantities on one page."),
                   ("Printed visa and registration", "Copies for the border and the badge counter."), ("Power adapter and power bank", "Long hall days drain phones fast."),
                   ("Comfortable shoes", "Fair days mean hours of walking."), ("A way to log contacts", "A notebook or app, filled in the same evening.")],
         "caption": "A simple packing list for trade fair trips.\nThe one most people forget: printed copies of the visa and registration.\nSave it for your next fair.",
         "hashtags": ["#TradeShowTips", "#BusinessTravel", "#Sourcing", "#Checklist"], "platforms": ALL3, "path": "expos.html", "cta": "Find a fair"})
    add({"id": "pt-02-supplier-questions", "category": "planning-tips", "layout": "tips", "kind": "qs", "format": "1080x1350", "title": "Six questions for every supplier meeting",
         "kicker": "Supplier meetings", "title_html": "Six questions for every supplier",
         "items": [("Minimum order?", "What MOQ, and does it change by model or colour?"), ("Price breaks?", "Unit price at the quantities you actually buy."),
                   ("Lead time?", "From order to shipment, in your peak season."), ("Samples?", "Cost, timing and how they ship."),
                   ("Payment terms?", "Deposit, balance and accepted methods."), ("Certifications?", "What your market and buyers require.")],
         "note": "General buying questions, not legal or financial advice.",
         "caption": "Six questions worth asking at every supplier booth or factory visit.\nWrite the answers down the same day, so you can compare quotes like for like.\nSave this for your next sourcing trip.",
         "hashtags": ["#Sourcing", "#Procurement", "#SupplierMeeting", "#TradeShowTips", "#Importers"], "platforms": ALL3, "path": "services.html"})
    add({"id": "pt-03-hall-plan", "category": "planning-tips", "layout": "tips", "kind": "timeline", "format": "1080x1350", "title": "Plan the halls before fair day",
         "kicker": "Hall planning", "title_html": "Plan the halls before you land",
         "items": [("Before you fly", "Map halls by product category", "Most large fairs group exhibitors by sector and hall."), ("Before you fly", "List must-see booths", "Group them by hall to cut walking."),
                   ("Fair day", "Visit the shortlist first", "Then walk the rest of the category."), ("Each evening", "Log contacts and photos", "Note what was quoted while it is fresh.")],
         "caption": "Large fairs are too big to walk at random.\nMap the halls by product category, list must-see booths and group them by hall.\nWe include hall planning in every trade show trip.",
         "hashtags": ["#TradeShowTips", "#CantonFair", "#Sourcing", "#BusinessTravel"], "platforms": ALL3, "path": "services.html"})
    add({"id": "pt-04-after-the-fair", "category": "planning-tips", "layout": "tips", "kind": "check", "format": "1080x1350", "title": "After the fair: follow-up checklist",
         "kicker": "After the fair", "title_html": "The fair ends. The work starts.",
         "items": [("Sort contacts the same week", "Hot, follow-up later, or not a fit."), ("Send follow-ups while you are remembered", "Reference the booth and what you discussed."),
                   ("Request samples", "Confirm cost, timing and shipping."), ("Compare quotes like for like", "Same quantity, same terms, same incoterms."),
                   ("Plan the factory visit", "For the shortlist that passes samples.")],
         "caption": "The orders come from what you do after the fair.\nSort contacts, follow up in the same week, request samples and compare quotes like for like.\nNeed a factory visit next? We route it.",
         "hashtags": ["#TradeShowTips", "#Sourcing", "#Procurement", "#FactoryVisit"], "platforms": ALL3, "path": "services.html"})
    add({"id": "pt-05-budget-lines", "category": "planning-tips", "layout": "tips", "kind": "check", "format": "1080x1350", "title": "Five lines every trip budget should show",
         "kicker": "For finance and admin", "title_html": "Five lines every trip budget should show",
         "lead": "Ask for these listed separately, so you can approve line by line.",
         "items": [("Airfare", "With baggage and change rules spelled out."), ("Hotel", "Location, nights and room type."), ("Visa", "Per traveller, with the lead time."),
                   ("Registration", "Buyer or visitor badges and letters."), ("Ground services", "Transfers, interpreters, vans.")],
         "caption": "A trip quote with one total is hard to approve.\nAsk for airfare, hotel, visa, registration and ground services as separate lines.\nThat is how every ExpoBusiness proposal is laid out.",
         "hashtags": ["#CorporateTravel", "#Finance", "#TravelBudget", "#B2B"], "platforms": LIFB, "path": "proposal.html", "cta": "Request a proposal"})
    add({"id": "pt-06-timeline-carousel", "category": "planning-tips", "format": "1080x1350", "title": "Carousel: trade show trip timeline",
         "tag": "Planning tips", "cta": "Plan a trip", "path": "expos.html",
         "slides": [
             {"type": "cover", "title_html": "Trade show trip:<br><em>a working timeline</em>", "lead": "A suggested countdown for buyers and admin teams. Adjust it to your destination's visa rules."},
             {"type": "point", "num": "12", "title_html": "Weeks out: choose and register", "items": [("calendar", "Check whether the dates are confirmed or expected"), ("ticket", "Register as a buyer or visitor"), ("users", "Agree who travels")]},
             {"type": "point", "num": "8", "title_html": "Weeks out: start visas", "items": [("mail", "Request the invitation letter"), ("passport", "Check passports: six months' validity, blank pages"), ("file", "Prepare and file applications")]},
             {"type": "point", "num": "6", "title_html": "Weeks out: hotels and flights", "items": [("bed", "Hotels near the venue fill early in fair weeks"), ("plane", "Compare fares and change rules")]},
             {"type": "point", "num": "2", "title_html": "Weeks out: meetings and ground", "items": [("factory", "Fix supplier meetings and factory visits"), ("chat", "Book interpreters and transfers"), ("map", "Plan the halls by category")]},
             {"type": "end", "title_html": "We run this timeline for you", "lead": "One coordinator, an itemised proposal, nothing booked until you approve."},
         ],
         "caption": "A working timeline for a trade show trip: 12 weeks to register, 8 to start visas, 6 for hotels and flights, 2 for meetings and ground.\nIt is a guide, not a rule; visa lead times differ by country.\nSave it for your team.",
         "hashtags": ["#TradeShowTips", "#BusinessTravel", "#Checklist", "#Expo2027", "#Procurement"], "platforms": ALL3})
    add({"id": "pt-07-story-before-you-fly", "category": "planning-tips", "layout": "story", "kind": "list", "format": "1080x1920", "title": "Story: five checks before you fly",
         "tag": "Planning tips", "kicker": "Before you fly", "title_html": "Five checks before a business trip",
         "items": [("passport", "Passport validity", "Six months is a common requirement."), ("file", "Visa matches the trip", "Dates and number of entries."), ("ticket", "Registration printed", "For the badge counter."),
                   ("bed", "Hotel address saved", "In the local language too."), ("bus", "Transfer confirmed", "Driver name and meeting point.")],
         "cta": "Plan a trip", "path": "services.html",
         "caption": "Five checks before any business trip. Save it.", "hashtags": ["#BusinessTravel", "#TravelTips"], "platforms": IGFB})

    # ================= G. Delegations & MICE =================
    add({"id": "dm-01-delegations", "category": "delegations-mice", "layout": "mice", "photo": "stage", "format": "1080x1350", "title": "Delegations that move as one programme",
         "kicker": "Delegations & MICE", "title_html": "Delegations that move as one programme",
         "lead": "For chambers of commerce, associations, LGUs and companies running group missions, conferences and incentive trips.",
         "items": [("seat", "Group airfare", "Seat blocks; charters on request."), ("bed", "Rooming and coaches", "Lists, coaches, a lead on the ground."),
                   ("passport", "Visas and briefing", "Group filing and a pre-departure brief."), ("glass", "Events", "Venues, business dinners, galas.")],
         "caption": "Trade missions, conferences and incentive trips need the whole group moving as one.\nGroup airfare, rooming lists and coaches, group visa filing and a pre-departure briefing, and the events in between.\nFor chambers, associations, LGUs and companies.",
         "hashtags": ["#MICE", "#TradeMission", "#Delegation", "#BusinessTravel", "#PhilippineBusiness"], "platforms": ALL3})
    add({"id": "dm-02-group-air", "category": "delegations-mice", "layout": "mice", "format": "1080x1350", "title": "Group airfare and seat blocks",
         "photo": "cabin", "kicker": "Group travel", "title_html": "One flight plan for the whole delegation",
         "lead": "Group airfare and seat blocks, so the delegation travels together. Charter flights on request.",
         "items": [("seat", "Seat blocks", "Held for the group."), ("users", "Name lists", "Managed as travellers confirm."), ("plane", "Charters", "On request."), ("swap", "Changes", "Handled for you.")],
         "caption": "Moving a delegation starts with the flight.\nWe arrange group airfare and seat blocks, manage the name list as people confirm, and source charter flights on request.\nTell us the headcount and dates.",
         "hashtags": ["#GroupTravel", "#MICE", "#Delegation", "#TradeMission"], "platforms": ALL3})
    add({"id": "dm-03-on-the-ground", "category": "delegations-mice", "layout": "mice", "photo": "lobby", "format": "1080x1350", "title": "Rooming lists, coaches and a delegation lead",
         "kicker": "On arrival", "title_html": "Rooms ready. Coach waiting. Lead on site.",
         "lead": "Rooming lists, coaches and a delegation lead on the ground, so the programme runs to time.",
         "items": [("bed", "Rooming lists", "Prepared and checked with the hotel."), ("bus", "Coaches", "Between hotel, venue and visits."), ("user", "Delegation lead", "On the ground with the group."), ("chat", "Interpreters", "By the half or full day.")],
         "caption": "Arrival day sets the tone for a delegation.\nRooming lists checked with the hotel, coaches between hotel, venue and visits, and a delegation lead on the ground.\nInterpreters by the half or full day.",
         "hashtags": ["#MICE", "#Delegation", "#GroupTravel", "#BusinessEvents"], "platforms": ALL3})
    add({"id": "dm-04-group-visa", "category": "delegations-mice", "layout": "mice", "photo": "passport", "format": "1080x1350", "title": "Group visa filing and pre-departure briefing",
         "kicker": "Before departure", "title_html": "Group visas, filed and tracked",
         "lead": "Group visa filing and a pre-departure briefing, so every delegate travels with the right papers and the same plan.",
         "items": [("search", "Documents checked", "For every delegate."), ("file", "Group filing", "Forms and appointments."), ("passport", "Tracking", "Until passports are back."), ("mic", "Briefing", "Programme, papers, contacts.")],
         "caption": "The hardest part of a delegation is often the paperwork.\nWe check every delegate's documents, file the group's visas and track them, then hold a pre-departure briefing.\nThe embassy decides; we make sure the files are complete.",
         "hashtags": ["#BusinessVisa", "#Delegation", "#TradeMission", "#MICE"], "platforms": ALL3})
    add({"id": "dm-05-events", "category": "delegations-mice", "layout": "mice", "photo": "meeting", "format": "1080x1350", "title": "Meeting venues, business dinners and galas",
         "kicker": "Events", "title_html": "Meetings, dinners and gala nights abroad",
         "lead": "Meeting venues, business dinners and gala events arranged around the trade programme.",
         "items": [("briefcase", "Meeting rooms", "Near the hotel or venue."), ("glass", "Business dinners", "For buyers and partners."), ("mic", "Gala events", "For incentive groups."), ("chat", "Interpreters", "Where the table needs one.")],
         "caption": "A trade mission is also its meetings and dinners.\nWe arrange meeting venues, business dinners and gala events around the trade programme, with interpreters where needed.\nTell us the group size and the city.",
         "hashtags": ["#MICE", "#BusinessEvents", "#IncentiveTravel", "#Delegation"], "platforms": ALL3})
    add({"id": "dm-06-brief", "category": "delegations-mice", "layout": "li_list", "format": "1200x627", "title": "Planning a delegation? Send us four things",
         "tag": "Delegations & MICE", "kicker": "For chambers, associations and LGUs", "title_html": "Planning a delegation? Send us four things.",
         "lead": "We reply with an itemised proposal you can approve line by line.",
         "items": [("pin", "Destination", "City, fair or programme."), ("calendar", "Dates", "Fixed or flexible."), ("users", "Headcount", "Approximate is fine to start.")],
         "cta": "Plan a delegation", "path": "proposal.html",
         "caption": "Planning a trade mission or delegation for 2027?\nSend us the destination, dates and headcount. We reply with an itemised proposal you can approve line by line.\nNothing is booked until you approve.",
         "hashtags": ["#TradeMission", "#Delegation", "#MICE", "#Chamber", "#LGU"], "platforms": LIFB})
    add({"id": "dm-07-story-delegations", "category": "delegations-mice", "layout": "story", "kind": "list", "format": "1080x1920", "theme": "dark", "photo": "stage", "title": "Story: delegations and MICE",
         "tag": "Delegations & MICE", "kicker": "Group missions", "title_html": "Your delegation, one programme",
         "items": [("seat", "Group airfare", "Seat blocks; charters on request."), ("bed", "Rooming and coaches", "With a lead on the ground."), ("passport", "Group visas", "Plus a pre-departure brief."), ("glass", "Events", "Venues, dinners, galas.")],
         "cta": "Plan a delegation", "path": "proposal.html",
         "caption": "Delegations, trade missions and incentive trips, run as one programme.", "hashtags": ["#MICE", "#Delegation"], "platforms": IGFB})

    # ================= H. Partnership & brand =================
    add({"id": "pb-01-partnership", "category": "partnership-brand", "layout": "partner", "kind": "lockup", "format": "1080x1080", "title": "In partnership with Immaculate Connections",
         "kicker": "Partnership", "title_html": "Business travel, in partnership with Immaculate Connections",
         "lead": "ExpoBusiness Travel Services plans business travel for Philippine companies, in partnership with Immaculate Connections, a Philippine travel and tour services company.",
         "caption": "ExpoBusiness Travel Services works in partnership with Immaculate Connections, a Philippine travel and tour services company.\nWe plan corporate travel, trade show trips and delegations for Philippine companies.\nMore about us on our site.",
         "hashtags": ["#ImmaculateConnections", "#BusinessTravel", "#Partnership", "#PhilippineBusiness"], "platforms": ALL3})
    add({"id": "pb-02-who-we-are", "category": "partnership-brand", "layout": "partner", "kind": "list", "format": "1080x1350", "title": "Who we are",
         "kicker": "Metro Manila, Philippines", "title_html": "Business travel for Philippine companies",
         "lead": "Based in Metro Manila. Corporate travel, trade shows and delegations worldwide.",
         "items": [("plane", "Corporate travel", "Flights and hotels to your policy."), ("ticket", "Trade show trips", "Expos in Asia, Europe, the Middle East and the US."),
                   ("users", "Delegations and MICE", "Group missions, conferences, incentives."), ("passport", "Business visas", "Documents, filing, tracking."),
                   ("chat", "Interpreters and ground", "Transfers, drivers, factory routing.")],
         "caption": "ExpoBusiness Travel Services plans business travel for Philippine companies from Metro Manila.\nCorporate travel, trade show trips, delegations and MICE, business visas, interpreters and ground logistics.\nIn partnership with Immaculate Connections.",
         "hashtags": ["#BusinessTravel", "#CorporateTravel", "#MetroManila", "#PhilippineBusiness"], "platforms": ALL3})
    add({"id": "pb-03-promise", "category": "partnership-brand", "layout": "partner", "kind": "list", "format": "1080x1350", "title": "Our promise, in five lines",
         "kicker": "How we work", "title_html": "Five things you can hold us to",
         "items": [("user", "One coordinator per trip", "One person who knows the whole trip."), ("list", "Itemised proposals", "Every cost on its own line."),
                   ("receipt", "Official invoices", "Invoices and receipts in your company's name."), ("check", "Handled together", "Visas, flights, hotels, registration, transport."),
                   ("shield", "Your approval first", "Nothing booked or paid until you approve.")],
         "cta": "Request a proposal", "path": "proposal.html",
         "caption": "Five things you can hold us to: one coordinator per trip, itemised proposals, official invoices in your company's name, everything handled together, and nothing booked until you approve.\nNo fixed packages; every trip is quoted to the brief.",
         "hashtags": ["#CorporateTravel", "#BusinessTravel", "#B2B", "#PhilippineBusiness"], "platforms": ALL3})
    add({"id": "pb-04-who-we-help", "category": "partnership-brand", "layout": "partner", "kind": "list", "format": "1080x1350", "title": "Who we work with",
         "kicker": "Who we work with", "title_html": "Built for the teams that send people abroad",
         "items": [("box", "Importers and sourcing teams", "Fairs, suppliers and factory visits."), ("briefcase", "HR, admin and finance", "Corporate travel to policy, invoiced properly."),
                   ("users", "Chambers, associations, LGUs", "Delegations, missions and MICE."), ("ticket", "Buyers and exhibitors", "Trade shows worldwide.")],
         "caption": "Who we plan for: importers and sourcing teams; HR, admin and finance teams; chambers, associations and LGUs; and buyers and exhibitors going to trade shows worldwide.\nTell us about your next trip.",
         "hashtags": ["#BusinessTravel", "#Importers", "#HR", "#TradeMission", "#PhilippineBusiness"], "platforms": ALL3, "path": "proposal.html", "cta": "Tell us your trip"})
    add({"id": "pb-05-numbers", "category": "partnership-brand", "layout": "partner", "kind": "numbers", "format": "1080x1080", "title": "102 expos, 21 countries, 1 coordinator",
         "kicker": "Our 2027 calendar", "title_html": "The year in three numbers",
         "lead": "Our 2027 expo calendar lists trade shows across Asia, Europe, the Middle East and the Americas.",
         "nums": [(str(len(EXPOS)), "trade expos on the 2027 calendar"), (str(countries), "countries"), ("1", "coordinator per trip")],
         "cta": "See the calendar", "path": "expos.html",
         "caption": f"{len(EXPOS)} trade expos. {countries} countries. One coordinator per trip.\nOur 2027 calendar marks every date as confirmed or expected, and we check before booking.\nBrowse it on our site.",
         "hashtags": ["#Expo2027", "#TradeShow", "#BusinessTravel", "#ExpoCalendar"], "platforms": ALL3})
    add({"id": "pb-06-partnership-li", "category": "partnership-brand", "layout": "li_partner", "format": "1200x627", "title": "Partnership announcement (LinkedIn)",
         "kicker": "Partnership", "title_html": "ExpoBusiness Travel Services, in partnership with Immaculate Connections",
         "lead": "Business travel for Philippine companies: corporate trips, trade shows, delegations and business visas.",
         "caption": "ExpoBusiness Travel Services plans business travel for Philippine companies, in partnership with Immaculate Connections, a Philippine travel and tour services company.\nCorporate travel, trade show trips, delegations and business visas.\nhttps://www.immaculateconnectionsph.com/",
         "hashtags": ["#Partnership", "#BusinessTravel", "#ImmaculateConnections", "#PhilippineBusiness"], "platforms": LIFB, "path": "about.html"})
    add({"id": "pb-07-story-partner", "category": "partnership-brand", "layout": "story", "kind": "partner", "format": "1080x1920", "title": "Story: partnership lockup",
         "tag": "Partnership", "kicker": "Business travel for Philippine companies", "title_html": "Better together",
         "lead": "Corporate travel, trade shows, delegations and business visas from Metro Manila.",
         "cta": "About us", "path": "about.html",
         "caption": "ExpoBusiness Travel Services, in partnership with Immaculate Connections.", "hashtags": ["#Partnership", "#BusinessTravel"], "platforms": IGFB})

    # ================= expo story =================
    jan = pick(month(1), 99)
    add({"id": "ex-07-story-january", "category": "expo-spotlight", "layout": "story", "kind": "list", "format": "1080x1920", "theme": "dark", "title": "Story: January 2027 expos",
         "tag": "Expo spotlight", "kicker": "Coming up · January 2027", "title_html": "January's trade fairs",
         "items": [("calendar", f'{x["short"]} · {x["city"]}', __import__("render").fmt_dates(x, False)) for x in jan if x["short"] in ("CES", "Heimtextil", "Intersec", "HK Toys Fair", "imm", "Ambiente")],
         "cta": "Full calendar", "path": "expos.html",
         "caption": "January 2027 trade fairs from our calendar. Dates confirmed by the organisers.", "hashtags": ["#TradeShow2027", "#ExpoCalendar"], "platforms": IGFB})

    DEF = {"how-we-work": "services.html", "delegations-mice": "proposal.html", "partnership-brand": "about.html", "visa-documents": "visa.html", "planning-tips": "services.html"}
    for p in P:
        p.setdefault("path", DEF.get(p["category"], "expos.html"))
        if p["format"] == "1080x1920":
            p.setdefault("layout", "story")
    return P

DISC = "Philippine ordinary passport, short business visits. Checked Nov 2026. Rules change; the embassy decides."
countries = len({x["country"] for x in EXPOS})

def calendar(posts):
    """Suggested 4-week plan: Mon expo, Tue how-we-work, Wed calendar/MICE, Thu destination/visa, Fri tips/partner; stories Sat."""
    by = {}
    for p in posts:
        by.setdefault(p["category"], []).append(p["id"])
    feed = {c: [i for i in ids if "story" not in i] for c, ids in by.items()}
    stories = [i for ids in by.values() for i in ids if "story" in i]
    plan = []
    for w in range(4):
        def take(c, n=w):
            lst = feed[c]
            return lst[n % len(lst)]
        plan += [
            {"week": w + 1, "day": "Mon", "post": take("expo-spotlight")},
            {"week": w + 1, "day": "Tue", "post": take("how-we-work")},
            {"week": w + 1, "day": "Wed", "post": take("trade-calendar") if w % 2 == 0 else take("delegations-mice", w // 2)},
            {"week": w + 1, "day": "Thu", "post": take("destination-guides", w // 2) if w % 2 == 0 else take("visa-documents", w // 2)},
            {"week": w + 1, "day": "Fri", "post": take("planning-tips", w // 2) if w % 2 == 0 else take("partnership-brand", w // 2)},
        ]
        if w < len(stories):
            plan.append({"week": w + 1, "day": "Sat", "post": stories[w]})
        if w + 4 < len(stories):
            plan.append({"week": w + 1, "day": "Wed (story)", "post": stories[w + 4]})
    return plan
