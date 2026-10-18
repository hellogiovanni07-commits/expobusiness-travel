// CATEGORIES USED ACROSS THE SITE: industries, Canton Fair phases, article regions.
// Keep valid JSON after "window.TAXONOMY =" (the build reads it). Edit here, then run `python build.py`.
window.TAXONOMY = {
  "industries": {
    "electronics":  { "name": "Electronics & appliances", "short": "Electronics",        "page": true,  "phases": [1],    "photo": "1515940175183-6798529cb860" },
    "machinery":    { "name": "Machinery & industrial",   "short": "Machinery",          "page": true,  "phases": [1],    "photo": "1716191300020-b52dec5b70a8" },
    "lighting":     { "name": "Lighting & electrical",    "short": "Lighting",           "page": true,  "phases": [1],    "photo": "1561794919-75618574e915" },
    "construction": { "name": "Construction & hardware",  "short": "Construction",       "page": true,  "phases": [1, 2], "photo": "1581783898377-1c85bf937427" },
    "furniture":    { "name": "Furniture & home living",  "short": "Furniture",          "page": true,  "phases": [2],    "photo": "1687180498602-5a1046defaa4" },
    "horeca":       { "name": "Hotel, restaurant & café", "short": "Hotel & restaurant", "page": true,  "phases": [2, 3], "photo": "1785068540682-6917367db28e" },
    "fashion":      { "name": "Fashion & textiles",       "short": "Fashion",            "page": true,  "phases": [3],    "photo": "1532453288672-3a27e9be9efd" },
    "retail":       { "name": "Retail, toys & gifts",     "short": "Retail & gifts",     "page": true,  "phases": [2, 3], "photo": "1779684998897-ce5de594a5ac" },
    "food":         { "name": "Food & beverage",          "short": "Food & beverage",    "page": false, "phases": [3],    "photo": "1555396273-367ea4eb4db5" },
    "auto":         { "name": "Automotive",               "short": "Automotive",         "page": false, "phases": [1],    "photo": "1717386255773-1e3037c81788" },
    "beauty":       { "name": "Beauty & personal care",   "short": "Beauty",             "page": false, "phases": [3],    "photo": "1779684998897-ce5de594a5ac" },
    "medical":      { "name": "Medical & health",         "short": "Medical",            "page": false, "phases": [3],    "photo": "1717386255767-52643970d483" }
  },
  "phases": [
    { "n": 1, "name": "Advanced manufacturing", "sectors": "Electronics and appliances, machinery, vehicles, lighting and electrical, hardware and tools, new energy", "short": "Electronics, machinery, lighting, hardware, vehicles, new energy", "tone": "#c9460b" },
    { "n": 2, "name": "Quality home living",    "sectors": "Housewares, kitchenware and tableware, gifts and decorations, furniture, building materials, ceramics",     "short": "Consumer goods, kitchenware, gifts, home decor, building materials, furniture", "tone": "#d7261e" },
    { "n": 3, "name": "Better life",            "sectors": "Fashion and garments, textiles, shoes and bags, toys and baby products, stationery, food, health and personal care, pet products", "short": "Garments, textiles, toys, shoes and bags, stationery, health, food", "tone": "#a8380a" }
  ],
  "regions": ["China", "Hong Kong", "East Asia", "Southeast Asia", "South Asia", "Middle East", "Europe", "North America"],
  "photos": { "canton": "1768396855393-42624b5f0be5", "expo": "1711390811937-1b061eaf28ea" }
};
