#!/usr/bin/env python3
"""
Generates a self-contained interactive HTML artifact (napa_wildfire_atlas.html)
embedding the 230 real CAL FIRE FRAP Napa Valley fire perimeters (1964-2025),
Napa County boundary, AVA/peak landmarks, and the 7 deep investigative dossiers.
"""

import json

BUNDLE_PATH = "/tmp/compact_napa_bundle.json"
OUT_HTML = "/home/antigravity/.gemini/jetski/brain/v1/default/jetski_remote_agents_3p/b1ae4f7f-5509-4408-a643-9ad71be23c7d/napa_wildfire_atlas.html"

with open(BUNDLE_PATH, "r", encoding="utf-8") as f:
    bundle_json = f.read()

HTML_TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Napa Valley Wildfire Atlas (1964–2025)</title>
  <script src="https://www.gstatic.com/antigravity/web/dev/tailwindcss.min.js"></script>
  <style>
    * { box-sizing: border-box; }
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-thumb { background: rgba(160,160,160,0.3); border-radius: 3px; }
    .pulse-ring {
      animation: pulse-anim 2s infinite;
    }
    @keyframes pulse-anim {
      0% { opacity: 0.9; transform: scale(0.95); }
      50% { opacity: 0.4; transform: scale(1.12); }
      100% { opacity: 0.9; transform: scale(0.95); }
    }
  </style>
</head>
<body class="bg-[var(--background)] text-[var(--foreground)] antialiased select-none overflow-hidden">
  <div class="flex flex-col h-screen w-screen overflow-hidden">
    <!-- Top Header & Search Bar -->
    <header class="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-[var(--card)] border-b border-[var(--border)] shrink-0">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center text-white font-bold text-sm shadow">
          🔥
        </div>
        <div>
          <h1 class="text-base font-bold tracking-tight text-[var(--foreground)]">
            Napa Valley Wildfire Atlas (1964–2025)
          </h1>
          <p class="text-xs text-[var(--muted-foreground)]">
            259 CAL FIRE FRAP Historical Perimeters • Multi-Day Evolution, Tactical Response & Public Policy Legacy
          </p>
        </div>
      </div>

      <!-- Search & View Mode Controls -->
      <div class="flex flex-wrap items-center gap-2">
        <div class="relative w-64">
          <input
            id="searchInput"
            type="text"
            placeholder="Search fire, year, cause (PG&E, arson), SB 901..."
            class="w-full px-3 py-1.5 text-xs rounded-lg bg-[var(--background)] text-[var(--foreground)] border border-[var(--border)] focus:outline-none focus:border-orange-500"
          />
          <div id="searchDropdown" class="hidden absolute left-0 top-full mt-1 w-80 max-h-72 overflow-y-auto rounded-lg bg-[var(--card)] border border-[var(--border)] shadow-xl z-50 p-1"></div>
        </div>

        <div class="flex items-center rounded-lg bg-[var(--background)] p-0.5 border border-[var(--border)] text-xs">
          <button id="modeCumulative" class="px-2.5 py-1 rounded-md font-medium bg-orange-600 text-white">
            Cumulative History
          </button>
          <button id="modeSingleYear" class="px-2.5 py-1 rounded-md font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
            Single Year ("Watch Year")
          </button>
          <button id="modeReburn" class="px-2.5 py-1 rounded-md font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
            Reburn Matrix
          </button>
        </div>

        <select id="causeFilter" class="px-2.5 py-1.5 text-xs rounded-lg bg-[var(--background)] text-[var(--foreground)] border border-[var(--border)]">
          <option value="ALL">All Ignition Causes</option>
          <option value="Electrical Power / Utility">⚡ Utility / Electrical Power</option>
          <option value="Lightning">🌩️ Dry Lightning</option>
          <option value="Arson">🔥 Arson</option>
          <option value="Equipment Use">🚜 Equipment Use</option>
          <option value="Debris Burning">🪵 Debris / Ash Burning</option>
          <option value="Vehicle">🚗 Vehicle</option>
          <option value="Unknown / Undetermined">❓ Undetermined</option>
        </select>
      </div>
    </header>

    <!-- Main 3-Column Interactive Workspace -->
    <div class="flex flex-1 min-h-0 overflow-hidden">
      <!-- Left Column: Landmark Callouts & Policy Legacy -->
      <aside class="w-72 bg-[var(--card)] border-r border-[var(--border)] flex flex-col min-h-0 shrink-0">
        <!-- KPI Strip -->
        <div class="grid grid-cols-3 border-b border-[var(--border)] text-center py-2 px-1 bg-[var(--background)]">
          <div>
            <div class="text-xs text-[var(--muted-foreground)]">Active Year</div>
            <div id="kpiYear" class="text-sm font-bold text-orange-500 font-mono">2020</div>
          </div>
          <div class="border-x border-[var(--border)]">
            <div class="text-xs text-[var(--muted-foreground)]">Year Burned</div>
            <div id="kpiYearAcres" class="text-sm font-bold text-[var(--foreground)] font-mono">375.3k ac</div>
          </div>
          <div>
            <div class="text-xs text-[var(--muted-foreground)]">Cumulative</div>
            <div id="kpiTotalAcres" class="text-sm font-bold text-[var(--foreground)] font-mono">1.22M ac</div>
          </div>
        </div>

        <!-- Tabs -->
        <div class="flex border-b border-[var(--border)] text-xs font-semibold">
          <button id="tabLandmarks" class="flex-1 py-2 border-b-2 border-orange-500 text-orange-500">
            Landmark Fires (7)
          </button>
          <button id="tabAllFires" class="flex-1 py-2 border-b-2 border-transparent text-[var(--muted-foreground)]">
            Catalog
          </button>
          <button id="tabPolicies" class="flex-1 py-2 border-b-2 border-transparent text-[var(--muted-foreground)]">
            Policy Legacy
          </button>
        </div>

        <div id="leftListContainer" class="flex-1 overflow-y-auto p-2 space-y-1.5"></div>
      </aside>

      <!-- Center Column: Interactive Pan/Zoom Canvas Map of Napa Valley -->
      <main class="relative flex-1 bg-[#0c0e12] flex flex-col min-h-0 overflow-hidden">
        <canvas id="mapCanvas" class="w-full h-full cursor-grab active:cursor-grabbing"></canvas>

        <!-- Map Overlay Controls (Zoom & Reset) -->
        <div class="absolute top-3 right-3 flex flex-col gap-1.5">
          <button id="btnZoomIn" class="w-8 h-8 rounded-lg bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] font-bold text-sm shadow hover:border-orange-500" title="Zoom In">+</button>
          <button id="btnZoomOut" class="w-8 h-8 rounded-lg bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] font-bold text-sm shadow hover:border-orange-500" title="Zoom Out">−</button>
          <button id="btnResetView" class="px-2 py-1 rounded-lg bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] text-xs shadow hover:border-orange-500" title="Reset Napa Valley View">Reset</button>
        </div>

        <!-- Floating Map Legend -->
        <div class="absolute bottom-3 left-3 flex flex-wrap items-center gap-3 px-3 py-1.5 rounded-lg bg-[var(--card)]/90 border border-[var(--border)] text-xs shadow">
          <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-sm bg-red-500 inline-block border border-amber-200"></span> Active Year Perimeter</span>
          <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-sm bg-amber-600/50 inline-block border border-amber-500/60"></span> Prior Burn Scar</span>
          <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-orange-500/40 inline-block border border-dashed border-yellow-300"></span> Spread Evolution Front</span>
          <span class="flex items-center gap-1.5"><span class="w-3 h-0.5 border-t-2 border-dashed border-amber-400 inline-block"></span> Napa County Line</span>
        </div>

        <!-- Hover Tooltip -->
        <div id="mapTooltip" class="hidden pointer-events-none absolute z-30 px-2.5 py-1.5 rounded-lg bg-black/90 border border-orange-500/60 text-white text-xs shadow-lg"></div>
      </main>

      <!-- Right Column: Deep Investigative Dossier (Cause, Evolution, Response, Extinguishment, Policy) -->
      <aside class="w-96 bg-[var(--card)] border-l border-[var(--border)] flex flex-col min-h-0 shrink-0">
        <div id="dossierContainer" class="flex-1 overflow-y-auto p-3 space-y-3"></div>
      </aside>
    </div>

    <!-- Bottom 60-Year Scrubber & "Watch Year" Timeline Bar -->
    <footer class="px-4 py-2 bg-[var(--card)] border-t border-[var(--border)] shrink-0 space-y-1.5">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <div class="flex items-center gap-2">
          <button id="btnPlayTimeline" class="px-3 py-1 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow">
            <span id="playIcon">▶</span> <span id="playLabel">Play 60-Year History</span>
          </button>
          <button id="btnPrevYear" class="px-2 py-1 rounded bg-[var(--background)] border border-[var(--border)] text-xs">◀</button>
          <select id="yearSelect" class="px-2 py-1 rounded bg-[var(--background)] border border-[var(--border)] text-orange-500 font-mono text-xs font-bold"></select>
          <button id="btnNextYear" class="px-2 py-1 rounded bg-[var(--background)] border border-[var(--border)] text-xs">▶</button>
          <button id="btnWatchYear" class="px-2.5 py-1 rounded bg-red-600/20 border border-red-500/50 text-red-400 hover:bg-red-600/30 text-xs font-semibold">
            Watch This Year
          </button>
        </div>

        <!-- Quick Landmark Year Presets -->
        <div class="flex flex-wrap items-center gap-1 text-xs">
          <button data-yr="1964" class="yr-preset px-2 py-0.5 rounded bg-[var(--background)] border border-[var(--border)] hover:border-orange-500">1964 Hanly</button>
          <button data-yr="1981" class="yr-preset px-2 py-0.5 rounded bg-[var(--background)] border border-[var(--border)] hover:border-orange-500">1981 Atlas Peak</button>
          <button data-yr="2004" class="yr-preset px-2 py-0.5 rounded bg-[var(--background)] border border-[var(--border)] hover:border-orange-500">2004 Rumsey</button>
          <button data-yr="2015" class="yr-preset px-2 py-0.5 rounded bg-[var(--background)] border border-[var(--border)] hover:border-orange-500">2015 Valley/Wragg</button>
          <button data-yr="2017" class="yr-preset px-2 py-0.5 rounded bg-[var(--background)] border border-[var(--border)] hover:border-orange-500">2017 Tubbs/Atlas/Nuns</button>
          <button data-yr="2018" class="yr-preset px-2 py-0.5 rounded bg-[var(--background)] border border-[var(--border)] hover:border-orange-500">2018 County</button>
          <button data-yr="2020" class="yr-preset px-2 py-0.5 rounded bg-[var(--background)] border border-[var(--border)] hover:border-orange-500">2020 LNU & Glass</button>
          <button data-yr="2025" class="yr-preset px-2 py-0.5 rounded bg-[var(--background)] border border-[var(--border)] hover:border-orange-500">2025 Pickett</button>
        </div>
      </div>

      <!-- Interactive 1964-2025 Bar Chart Scrubber -->
      <div id="histogramBar" class="h-11 flex items-end gap-0.5 pt-1 cursor-pointer"></div>
    </footer>
  </div>

  <script>
    const DATA = __BUNDLE_JSON__;

    const LANDMARKS = [
      { name: "City of Napa", cat: "town", c: [-122.2869, 38.2975] },
      { name: "Yountville", cat: "town", c: [-122.3647, 38.4016] },
      { name: "Oakville AVA", cat: "ava", c: [-122.4047, 38.4369] },
      { name: "Rutherford AVA", cat: "ava", c: [-122.4214, 38.4583] },
      { name: "St. Helena", cat: "town", c: [-122.4703, 38.5052] },
      { name: "Calistoga", cat: "town", c: [-122.5797, 38.5788] },
      { name: "Howell Mtn AVA", cat: "ava", c: [-122.4489, 38.5755] },
      { name: "Atlas Peak (2,663 ft)", cat: "peak", c: [-122.2633, 38.4419] },
      { name: "Mt. Veeder (2,677 ft)", cat: "peak", c: [-122.4472, 38.3783] },
      { name: "Spring Mtn AVA", cat: "ava", c: [-122.5361, 38.5142] },
      { name: "Mt. St. Helena (4,339 ft)", cat: "peak", c: [-122.6333, 38.6694] },
      { name: "Lake Berryessa", cat: "water", c: [-122.2156, 38.5889] },
      { name: "Pope Valley", cat: "ava", c: [-122.4264, 38.6503] }
    ];

    const DOSSIERS = [
      {
        id: "2020-HENNESSEY",
        matchRawName: "HENNESSEY",
        year: 2020,
        displayName: "LNU Lightning Complex (Hennessey Fire)",
        subtitle: "Largest Wildfire in Napa County Recorded History (305,352 Acres)",
        acres: 305351.9,
        structures: 1491,
        fatalities: 6,
        cost: "$94.6M",
        personnel: 2816,
        gusts: 45,
        origin: [-122.341, 38.502],
        originLabel: "Hennessey Ridge above Hwy 128",
        causeTitle: "Dry Lightning Siege (merged with Arson-sparked Markley Fire)",
        causeBody: "Remnant moisture from Tropical Storm Fausto generated 12,000+ dry lightning strikes during a 106°F August heat dome. Five Napa/Lake lightning fires (Hennessey, Gamble, 15-10, Spanish, Morgan) merged within 48 hours and joined the arson-sparked Markley Fire near Lake Berryessa.",
        responseBody: "CAL FIRE LNU IMT 2 coordinated 2,816 personnel, 342 engines, and 26 aircraft amidst a statewide siege of 367 simultaneous wildfires. Local vineyard bulldozers (Pina Vineyard Mgmt) cut emergency lines above Pope Valley and Aetna Springs alongside VLAT retardant drops.",
        extinguishBody: "Contained Sept 16 – Oct 2, 2020 when a deep Pacific marine layer raised humidity above 65%. Multi-mile dozer lines anchored along Hwy 128, Putah Creek, and Lake Berryessa's 15-mile water barrier stopped eastern and western spread.",
        reforms: [
          { code: "Napa CWPP & Measure L", yr: 2021, title: "100+ Mile Strategic Ridge-Top Shaded Fuel Break Network", desc: "Funded pre-cleared fuel breaks along Howell Mountain, Atlas Peak, and Pope Valley evacuation corridors." },
          { code: "Zonehaven / Genasys Protect", yr: 2021, title: "Standardized Polygon Evacuation Zone Architecture", desc: "Replaced ad-hoc road descriptions with pre-mapped tactical evacuation polygons across Napa County." },
          { code: "AB 38 / PRC § 4291 Zone 0", yr: 2021, title: "Mandatory 0–5 Foot Noncombustible Ember Zone & Defensible Space Audits", desc: "Established point-of-sale defensible space inspections and ember-resistant Zone 0 perimeters." }
        ],
        stages: [
          { day: 1, date: "Aug 17, 2020", title: "Lightning Ignition on Hennessey Ridge", acres: 12500, pct: 0, wind: "35 mph NW", rh: 14, center: [-122.341, 38.502], radKm: 6.5, note: "Dry lightning ignites Hennessey Ridge at 6:37 AM; erratic downdrafts push fire into Chiles Valley." },
          { day: 3, date: "Aug 19, 2020", title: "Confluence into 131k-Acre Mega-Complex", acres: 131000, pct: 0, wind: "45 mph WNW", rh: 11, center: [-122.255, 38.545], radKm: 19.0, note: "Hennessey, Gamble, 15-10 & Markley fires merge, jumping Hwy 128 across Lake Berryessa." },
          { day: 6, date: "Aug 22, 2020", title: "Defense of Pope Valley & Angwin Ridge", acres: 275000, pct: 15, wind: "22 mph W", rh: 22, center: [-122.275, 38.610], radKm: 26.5, note: "Vineyard and CAL FIRE dozers hold Howell Mountain crest to keep fire out of main Napa Valley." },
          { day: 31, date: "Sep 16, 2020", title: "100% Perimeter Containment", acres: 305352, pct: 100, wind: "10 mph W", rh: 55, center: [-122.282, 38.623], radKm: 30.0, note: "Full containment achieved across 305,352 acres just 11 days before the Glass Fire erupts." }
        ]
      },
      {
        id: "2020-GLASS",
        matchRawName: "GLASS",
        year: 2020,
        displayName: "Glass Fire (2020)",
        subtitle: "Upvalley Wine Country Siege Across Howell Mtn, St. Helena & Calistoga",
        acres: 67484.4,
        structures: 1555,
        fatalities: 0,
        cost: "$84.2M",
        personnel: 2773,
        gusts: 52,
        origin: [-122.478, 38.554],
        originLabel: "North Fork Crystal Springs Rd, Deer Park",
        causeTitle: "Undetermined (Investigated for Holdover / Human Activity in Deer Park)",
        causeBody: "Erupted at 3:48 AM on Sept 27, 2020 in steep timber in North Fork Crystal Springs Canyon below Angwin during a 52 mph Diablo offshore wind event with dead fuel moisture below 5%.",
        responseBody: "2,773 firefighters, 408 engines, 66 bulldozers, and 23 helicopters battled simultaneous runs up Howell Mountain and west across the Napa Valley floor into Spring Mountain. Complete evacuation of Calistoga (5,300+ residents) achieved zero fatalities.",
        extinguishBody: "Contained Oct 20, 2020 when coastal fog returned and forward spread was boxed in between the 2017 Tubbs/Nuns burn scars on the west and the fresh Aug 2020 Hennessey scar on the east.",
        reforms: [
          { code: "AB 642 & Private Crew Rules", yr: 2021, title: "Regulation of Private Contract Firefighters & Unauthorized Backfires", desc: "Enacted after CAL FIRE investigated private crews setting unauthorized backfires during the Glass Fire." },
          { code: "Napa Code § 15.32 WUI", yr: 2022, title: "Winery Cave, Barrel Storage & Hillside Estate Fire-Hardening Standards", desc: "Mandated dedicated fire water reserves and noncombustible cladding on commercial/estate hillside parcels." }
        ],
        stages: [
          { day: 1, date: "Sep 27, 2020", title: "03:48 AM Eruption in Crystal Springs", acres: 11000, pct: 0, wind: "52 mph NE", rh: 10, center: [-122.485, 38.558], radKm: 5.5, note: "Spots 1.5 miles across Silverado Trail, destroying Chateau Boswell and threatening St. Helena Hospital." },
          { day: 2, date: "Sep 28, 2020", title: "Shady & Boysen Merger Across Spring Mtn", acres: 36200, pct: 0, wind: "45 mph ENE", rh: 9, center: [-122.535, 38.552], radKm: 11.2, note: "Crosses valley floor into Spring Mountain and Diamond Mountain; entire City of Calistoga evacuated." },
          { day: 5, date: "Oct 1, 2020", title: "Defense of Calistoga & St. Helena", acres: 58800, pct: 6, wind: "30 mph NNW", rh: 18, center: [-122.547, 38.551], radKm: 14.5, note: "408 engines defend Calistoga and Sonoma Valley flank under dry northerly winds." },
          { day: 23, date: "Oct 20, 2020", title: "100% Containment Achieved", acres: 67484, pct: 100, wind: "8 mph W", rh: 60, center: [-122.547, 38.551], radKm: 16.5, note: "Contained at 67,484 acres with zero lives lost despite 1,555 structures destroyed." }
        ]
      },
      {
        id: "2017-ATLAS",
        matchRawName: "ATLAS",
        year: 2017,
        displayName: "Atlas Fire (2017 Wine Country Firestorm)",
        subtitle: "Deadly Nighttime Diablo Wind Siege on Atlas Peak & Soda Canyon",
        acres: 51624.7,
        structures: 783,
        fatalities: 6,
        cost: "$68.5M",
        personnel: 1920,
        gusts: 62,
        origin: [-122.264, 38.431],
        originLabel: "Atlas Peak Road near Foss Valley",
        causeTitle: "PG&E Electrical Power Lines (Tree & Limb Contact)",
        causeBody: "Two ignitions occurred on Oct 8, 2017 (9:52 PM) along Atlas Peak Rd and Hagen Rd when unpruned tree limbs contacted energized PG&E lines during a 62 mph Diablo windstorm (7% RH). CPUC found General Order 95 vegetation violations.",
        responseBody: "60+ mph winds grounded fixed-wing aircraft on night one while burning cellular towers knocked out 911/Nixle reception in Soda Canyon (where 134 of 163 homes burned). 1,920 personnel and 18 aircraft later dropped 11.1M gal of water.",
        extinguishBody: "Contained Oct 27, 2017 after expected Oct 12 winds arrived milder than forecast, allowing dozers to cut a decisive firebreak across Rector Plateau, Atlas Peak Rd, and irrigated Silverado Country Club vineyards.",
        reforms: [
          { code: "SB 901 (Dodd, 2018)", yr: 2018, title: "Mandatory Utility Wildfire Mitigation Plans & Grid Hardening", desc: "Authored by Napa Sen. Bill Dodd; mandated annual utility WMPs, vegetation audits, and undergrounding." },
          { code: "CPUC PSPS & Recloser Rules", yr: 2018, title: "Public Safety Power Shutoffs & Automatic Recloser Disabling", desc: "Required disabling automatic circuit reclosers on Red Flag days and deployed Alert Wildfire HD cameras." },
          { code: "SB 833 (2018)", yr: 2018, title: "Mandatory Wireless Emergency Alert (WEA) Cell Broadcasts", desc: "Standardized opt-out countywide WEA cell push evacuation alerts and cell-tower battery backup mandates." }
        ],
        stages: [
          { day: 1, date: "Oct 8–9, 2017", title: "21:52 PDT Ignition & Downslope Blowtorch", acres: 25000, pct: 0, wind: "62 mph NE", rh: 7, center: [-122.264, 38.431], radKm: 7.5, note: "Flames race down Soda Canyon into Silverado Country Club and Signorello Estate in 3 hours." },
          { day: 3, date: "Oct 10, 2017", title: "Expansion into Wooden Valley & Solano", acres: 42300, pct: 3, wind: "30 mph NNE", rh: 14, center: [-122.245, 38.395], radKm: 11.8, note: "Hagen Rd branch merges with main front; 17,000+ residents evacuated across Napa and Solano." },
          { day: 19, date: "Oct 27, 2017", title: "Full Perimeter Containment", acres: 51625, pct: 100, wind: "10 mph W", rh: 58, center: [-122.238, 38.364], radKm: 15.0, note: "Contained at 51,625 acres; CPUC & CAL FIRE launch landmark utility investigation." }
        ]
      },
      {
        id: "2017-NUNS",
        matchRawName: "NUNS",
        year: 2017,
        displayName: "Nuns Fire / Southern LNU Complex (2017)",
        subtitle: "Six-Fire Mayacamas Merger Across Mount Veeder, Oakville & Carneros",
        acres: 55798.2,
        structures: 1355,
        fatalities: 3,
        cost: "$76.0M",
        personnel: 2150,
        gusts: 64,
        origin: [-122.512, 38.392],
        originLabel: "Hwy 12 Nuns Canyon & Partrick Rd (Mt. Veeder)",
        causeTitle: "PG&E Power Lines & Equipment (6 Merged Fires: Nuns, Partrick, Adobe, Norrbom, Pressley, Oakmont)",
        causeBody: "Six separate wind-driven fires ignited on Oct 8–9, 2017 when alder and oak trees struck PG&E distribution conductors on both sides of the Mayacamas divide, merging into a 55,798-acre complex.",
        responseBody: "2,150 firefighters and DC-10 VLATs painted Oakville Grade and Dry Creek Rd with retardant to stop the Partrick and Nuns fronts from dropping onto the Oakville and Yountville valley floor.",
        extinguishBody: "Contained Oct 30, 2017 as onshore moisture returned and high-elevation terraced vineyards on Mount Veeder (Mayacamas Vineyards) and Carneros pastures anchored dozer lines.",
        reforms: [
          { code: "CPUC Decision 20-05-019", yr: 2020, title: "$1.937 Billion Utility Penalty & LiDAR Vegetation Audits", desc: "Record CPUC penalty for 2017–2018 violations (including Nuns, Partrick, Atlas) barred from ratepayer recovery." },
          { code: "Mt. Veeder Fire Safe Council", yr: 2018, title: "Napa Firewise Ridge-Top Shaded Fuel Break Expansion", desc: "Catalyzed 30+ neighborhood Fire Safe Councils across Mount Veeder, Redwood Rd, and Oakville Grade." }
        ],
        stages: [
          { day: 1, date: "Oct 8–9, 2017", title: "Dual Ignitions in Nuns Canyon & Partrick Rd", acres: 14500, pct: 0, wind: "64 mph NE", rh: 8, center: [-122.495, 38.355], radKm: 6.5, note: "Partrick Fire races upslope into Mount Veeder while Nuns Fire pushes east from Sonoma Valley." },
          { day: 4, date: "Oct 11, 2017", title: "Six-Fire Merger Across Mayacamas Crest", acres: 44300, pct: 5, wind: "35 mph N", rh: 13, center: [-122.499, 38.348], radKm: 12.5, note: "DC-10 airtankers hold Oakville Grade to protect Oakville and Rutherford vineyards." },
          { day: 22, date: "Oct 30, 2017", title: "100% Containment Across 55,798 Acres", acres: 55798, pct: 100, wind: "8 mph SW", rh: 65, center: [-122.499, 38.348], radKm: 15.5, note: "Full containment achieved after first autumn rain." }
        ]
      },
      {
        id: "2017-TUBBS",
        matchRawName: "TUBBS",
        year: 2017,
        displayName: "Tubbs Fire (2017)",
        subtitle: "Calistoga Ignition That Retraced the 1964 Hanly Corridor at 79 mph",
        acres: 36702.0,
        structures: 5636,
        fatalities: 22,
        cost: "$100M+",
        personnel: 2400,
        gusts: 79,
        origin: [-122.618, 38.609],
        originLabel: "Bennett Lane off Hwy 128, North Calistoga",
        causeTitle: "Private Customer Electrical System (1120 Bennett Lane, Calistoga)",
        causeBody: "Ignited at 9:43 PM on Oct 8, 2017 at a private ranch on Bennett Lane in northern Calistoga. Hurricane-force 79 mph Diablo mountain-wave winds funneled embers 12 miles in 3.5 hours over the Mayacamas mountains into Santa Rosa.",
        responseBody: "Advancing at 3 mph (a football field every 3 seconds), initial Calistoga engines were immediately outflanked by horizontal ember showers and pivoted to life-saving evacuations along Hwy 128 and Petrified Forest Rd.",
        extinguishBody: "Contained Oct 31, 2017. In Napa County, dozer lines along Hwy 29, Kimball Reservoir, and irrigated Tubbs Lane vineyards kept the eastern heel from backing into downtown Calistoga.",
        reforms: [
          { code: "SB 63 & 2025 WUI Code", yr: 2021, title: "Expansion of Local Responsibility Area (LRA) Fire Hazard Severity Zones", desc: "Extended Chapter 7A / WUI fire-resistant building codes to urban edges exposed to long-range wind-driven ember cast." },
          { code: "Cal OES Pre-Positioning (AB 111)", yr: 2019, title: "Predictive Weather-Driven Strike Team Pre-Positioning", desc: "Funded pre-staging out-of-county fire engines and dozers 24–48 hours before forecasted Red Flag windstorms." }
        ],
        stages: [
          { day: 1, date: "Oct 8, 2017", title: "21:43 PDT Ignition at Bennett Lane, Calistoga", acres: 8500, pct: 0, wind: "79 mph ENE", rh: 7, center: [-122.618, 38.609], radKm: 5.5, note: "70+ mph gusts hurl embers west from Calistoga up Porter Creek and Petrified Forest Rd." },
          { day: 2, date: "Oct 9, 2017", title: "12-Mile Sprint Across Mayacamas & US-101", acres: 28000, pct: 0, wind: "70 mph NE", rh: 8, center: [-122.677, 38.568], radKm: 11.5, note: "Retraces the exact 1964 Hanly Fire footprint into Santa Rosa in under 4 hours." },
          { day: 23, date: "Oct 31, 2017", title: "Full Containment at 36,702 Acres", acres: 36702, pct: 100, wind: "10 mph W", rh: 62, center: [-122.677, 38.568], radKm: 13.5, note: "Calistoga eastern flank held at Tubbs Lane and Kimball Reservoir." }
        ]
      },
      {
        id: "2018-COUNTY",
        matchRawName: "COUNTY",
        year: 2018,
        displayName: "County Fire (2018)",
        subtitle: "89,831-Acre Blue Ridge & Lake Berryessa East Shore Megafire",
        acres: 89831.1,
        structures: 20,
        fatalities: 0,
        cost: "$71.2M",
        personnel: 2667,
        gusts: 38,
        origin: [-122.142, 38.812],
        originLabel: "Blue Ridge / Guinda Corridor East of Berryessa",
        causeTitle: "Equipment Use (Improperly Installed Solar Electric Livestock Fence)",
        causeBody: "Sparked at 2:12 PM on June 30, 2018 by an ungrounded electric livestock fence unit in cured annual grass during 38 mph north winds and 104°F heat.",
        responseBody: "2,667 personnel, 54 hand crews, 38 bulldozers, and 23 helicopters widened historic ridgetop dozer lines along the 2,500-ft Blue Ridge spine and Hwy 128 to keep flames from dropping west into Lake Berryessa resorts.",
        extinguishBody: "Contained July 17, 2018 by tying the southern flank into State Route 128 (Monticello Dam) and previous 2014 Monticello / 2015 Wragg burn scars.",
        reforms: [
          { code: "CAL FIRE Blue Ridge Fuel Break", yr: 2019, title: "Permanent Blue Ridge & Berryessa East Shore Ridgetop Fuel Break", desc: "Established state-funded mastication and grazing fuel breaks along Napa's eastern ridge spine." }
        ],
        stages: [
          { day: 1, date: "Jun 30, 2018", title: "Electric Fence Spark & 30,000-ft Pyrocumulus Plume", acres: 16500, pct: 0, wind: "38 mph NNW", rh: 10, center: [-122.155, 38.765], radKm: 7.5, note: "North winds drive flames rapidly south along the roadless Blue Ridge crest into Napa County." },
          { day: 4, date: "Jul 3, 2018", title: "Holding the Berryessa East Shore Ridge", acres: 76000, pct: 15, wind: "22 mph NW", rh: 14, center: [-122.165, 38.683], radKm: 16.5, note: "38 bulldozers cut ridgetop lines above Lake Berryessa and Hwy 128." },
          { day: 17, date: "Jul 17, 2018", title: "100% Containment at 89,831 Acres", acres: 89831, pct: 100, wind: "10 mph SW", rh: 42, center: [-122.165, 38.683], radKm: 19.0, note: "Contained at Hwy 128 with zero fatalities." }
        ]
      },
      {
        id: "2025-PICKETT",
        matchRawName: "PICKETT",
        year: 2025,
        displayName: "Pickett Fire (2025)",
        subtitle: "Calistoga & Howell Mtn Reburn Contained at 6,822 Acres by Post-2020 Reforms",
        acres: 6822.3,
        structures: 1,
        fatalities: 0,
        cost: "$42.5M (+ $65M Crop Smoke Loss)",
        personnel: 2180,
        gusts: 28,
        origin: [-122.548, 38.589],
        originLabel: "2300 Block of Pickett Road, Calistoga",
        causeTitle: "Debris Burning (Improperly Disposed Smoldering Ashes in Burn Pile)",
        causeBody: "Ignited Aug 21, 2025 at a vineyard estate on Pickett Rd near Calistoga when hot ashes were dumped into a burn pile during a 105°F heatwave, reburning slopes scorched by the 2020 Glass Fire.",
        responseBody: "FIRIS infrared aircraft mapped the fire in 20 minutes; night-flying Chinook/Blackhawk helitankers and 2,180 personnel used pre-cleared Howell Mountain fuel breaks and 2020 Glass dozer lines to hold the fire to 6,822 acres (1/10th the size of the Glass Fire).",
        extinguishBody: "Contained Sept 7, 2025 along the Howell Mountain rim and Silverado Trail vineyard aprons with only 1 structure lost.",
        reforms: [
          { code: "Agricultural Ash & Smoke Liability", yr: 2025, title: "Strict Vineyard Debris-Burn Enforcement & Smoke-Taint Tort Precedent", desc: "Triggered felony reckless-fire prosecution and landmark multi-winery federal smoke-damage litigation." }
        ],
        stages: [
          { day: 1, date: "Aug 21, 2025", title: "Ignition on Pickett Rd & Simmons Canyon Run", acres: 2100, pct: 0, wind: "28 mph SW", rh: 13, center: [-122.540, 38.602], radKm: 3.2, note: "Flames race uphill through 2020 Glass Fire snags; precision Zonehaven polygon evacuations issued." },
          { day: 4, date: "Aug 24, 2025", title: "Night Helitankers & Howell Mtn Fuel Breaks Hold", acres: 6200, pct: 17, wind: "18 mph WNW", rh: 19, center: [-122.517, 38.626], radKm: 5.5, note: "Reopened 2020 dozer lines and Napa Firewise shaded fuel breaks stop progress toward Angwin." },
          { day: 17, date: "Sep 7, 2025", title: "100% Containment at 6,822 Acres", acres: 6822, pct: 100, wind: "10 mph W", rh: 54, center: [-122.517, 38.626], radKm: 6.0, note: "Demonstrates effectiveness of post-2020 fuel breaks and night aerial suppression." }
        ]
      }
    ];

    // App State
    let selectedYear = 2020;
    let viewMode = "cumulative"; // cumulative | single | reburn
    let causeFilter = "ALL";
    let leftTab = "landmarks"; // landmarks | catalog | policies
    let selectedFire = DATA.fires.find(f => f.y === 2020 && f.rn === "HENNESSEY") || DATA.fires[0];
    let activeDossier = DOSSIERS[0];
    let stageIdx = 0;
    let playTimer = null;

    // Viewport pan/zoom state (Lon/Lat center & scale)
    let camLon = -122.36;
    let camLat = 38.54;
    let camZoom = 1.0;
    let isDragging = false;
    let dragStart = [0, 0];

    const canvas = document.getElementById("mapCanvas");
    const ctx = canvas.getContext("2d");

    function lonLatToXY(lon, lat, w, h) {
      const baseScale = Math.min(w, h) * 1.32 * camZoom;
      const cosLat = Math.cos(38.52 * Math.PI / 180);
      const x = w / 2 + (lon - camLon) * baseScale * cosLat;
      const y = h / 2 - (lat - camLat) * baseScale;
      return [x, y];
    }

    function xyToLonLat(x, y, w, h) {
      const baseScale = Math.min(w, h) * 1.32 * camZoom;
      const cosLat = Math.cos(38.52 * Math.PI / 180);
      const lon = camLon + (x - w / 2) / (baseScale * cosLat);
      const lat = camLat - (y - h / 2) / baseScale;
      return [lon, lat];
    }

    function drawRing(ring, w, h) {
      if (!ring || !ring.length) return;
      ctx.beginPath();
      for (let i = 0; i < ring.length; i++) {
        const [x, y] = lonLatToXY(ring[i][0], ring[i][1], w, h);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    function renderMap() {
      const rect = canvas.parentElement.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.save();
      ctx.scale(dpr, dpr);
      const w = rect.width;
      const h = rect.height;

      // Dark Topographic Contour Background
      const grad = ctx.createRadialGradient(w * 0.48, h * 0.48, 20, w * 0.5, h * 0.5, Math.max(w, h) * 0.75);
      grad.addColorStop(0, "#171411");
      grad.addColorStop(1, "#0b0a08");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Subtle Lat/Lon Graticule
      ctx.strokeStyle = "rgba(255, 244, 229, 0.04)";
      ctx.lineWidth = 1;
      for (let lon = -122.8; lon <= -121.9; lon += 0.1) {
        const [x] = lonLatToXY(lon, 38.5, w, h);
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }
      for (let lat = 38.1; lat <= 39.0; lat += 0.1) {
        const [, y] = lonLatToXY(-122.35, lat, w, h);
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }

      // Draw Napa County Border
      ctx.fillStyle = "rgba(251, 191, 36, 0.03)";
      ctx.strokeStyle = "rgba(251, 191, 36, 0.65)";
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      drawRing(DATA.napaBorder, w, h);
      ctx.setLineDash([]);

      // Filter & Draw Fire Perimeters
      for (const f of DATA.fires) {
        if (causeFilter !== "ALL" && f.c !== causeFilter) continue;
        if (viewMode === "single" && f.y !== selectedYear) continue;
        if (viewMode !== "single" && f.y > selectedYear) continue;

        const isCurrentYr = f.y === selectedYear;
        const isSel = selectedFire && selectedFire.id === f.id;

        if (isCurrentYr) {
          ctx.fillStyle = f.a >= 50000 ? "rgba(239, 68, 68, 0.58)" : "rgba(249, 115, 22, 0.55)";
          ctx.strokeStyle = isSel ? "#fef08a" : "#fff7ed";
          ctx.lineWidth = isSel ? 2.8 : 1.4;
        } else if (viewMode === "reburn") {
          ctx.fillStyle = "rgba(234, 88, 12, 0.30)";
          ctx.strokeStyle = "rgba(251, 146, 60, 0.5)";
          ctx.lineWidth = 0.9;
        } else {
          ctx.fillStyle = "rgba(180, 83, 9, 0.22)";
          ctx.strokeStyle = isSel ? "#fef08a" : "rgba(251, 146, 60, 0.32)";
          ctx.lineWidth = isSel ? 2.5 : 0.8;
        }

        if (f.t === "Polygon") {
          drawRing(f.g[0], w, h);
        } else if (f.t === "MultiPolygon") {
          for (const poly of f.g) drawRing(poly[0], w, h);
        }
      }

      // Draw Active Evolution Spread Wavefront if Dossier active
      if (activeDossier && activeDossier.stages[stageIdx]) {
        const st = activeDossier.stages[stageIdx];
        const [cx, cy] = lonLatToXY(st.center[0], st.center[1], w, h);
        const [edgeX] = lonLatToXY(st.center[0] + st.radKm / 88.0, st.center[1], w, h);
        const radPx = Math.abs(edgeX - cx);

        ctx.beginPath();
        ctx.arc(cx, cy, radPx, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(249, 115, 22, 0.22)";
        ctx.fill();
        ctx.strokeStyle = "#fef08a";
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 3]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Origin ignition pin
        const [ox, oy] = lonLatToXY(activeDossier.origin[0], activeDossier.origin[1], w, h);
        ctx.beginPath();
        ctx.arc(ox, oy, 7, 0, Math.PI * 2);
        ctx.fillStyle = "#ef4444";
        ctx.fill();
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Draw Napa Valley AVA & Mountain Landmarks
      ctx.font = "600 10.5px sans-serif";
      for (const lm of LANDMARKS) {
        const [lx, ly] = lonLatToXY(lm.c[0], lm.c[1], w, h);
        if (lx < 10 || lx > w - 10 || ly < 10 || ly > h - 10) continue;
        ctx.beginPath();
        ctx.arc(lx, ly, 3, 0, Math.PI * 2);
        ctx.fillStyle = lm.cat === "ava" ? "#4ade80" : lm.cat === "peak" ? "#fbbf24" : lm.cat === "water" ? "#38bdf8" : "#f8fafc";
        ctx.fill();
        ctx.fillStyle = "rgba(0,0,0,0.85)";
        ctx.fillText(lm.name, lx + 6, ly + 4);
        ctx.fillStyle = lm.cat === "ava" ? "#bbf7d0" : lm.cat === "peak" ? "#fde68a" : "#f1f5f9";
        ctx.fillText(lm.name, lx + 5, ly + 3);
      }

      ctx.restore();
    }

    function updateKPIs() {
      document.getElementById("kpiYear").textContent = selectedYear;
      const yrFires = DATA.fires.filter(f => f.y === selectedYear);
      const yrAc = yrFires.reduce((s, f) => s + f.a, 0);
      document.getElementById("kpiYearAcres").textContent = yrAc >= 1000 ? (yrAc / 1000).toFixed(1) + "k ac" : Math.round(yrAc) + " ac";
      const totAc = DATA.fires.filter(f => f.y <= selectedYear).reduce((s, f) => s + f.a, 0);
      document.getElementById("kpiTotalAcres").textContent = totAc >= 1000000 ? (totAc / 1000000).toFixed(2) + "M ac" : (totAc / 1000).toFixed(0) + "k ac";
      document.getElementById("yearSelect").value = selectedYear;
    }

    function renderLeftList() {
      const container = document.getElementById("leftListContainer");
      container.innerHTML = "";

      if (leftTab === "landmarks") {
        DOSSIERS.forEach(d => {
          const btn = document.createElement("button");
          const isSel = activeDossier && activeDossier.id === d.id;
          btn.className = `w-full text-left p-2.5 rounded-lg border transition ${isSel ? "bg-orange-500/15 border-orange-500" : "bg-[var(--background)] border-[var(--border)] hover:border-orange-500/50"}`;
          btn.innerHTML = `
            <div class="flex items-center justify-between text-xs mb-1">
              <span class="px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 font-mono font-bold">${d.year}</span>
              <span class="font-mono font-semibold text-orange-400">${Math.round(d.acres).toLocaleString()} ac</span>
            </div>
            <div class="text-xs font-bold text-[var(--foreground)]">${d.displayName}</div>
            <div class="text-xs text-[var(--muted-foreground)] line-clamp-2 mt-0.5">${d.subtitle}</div>
          `;
          btn.onclick = () => selectDossier(d);
          container.appendChild(btn);
        });
      } else if (leftTab === "catalog") {
        const list = DATA.fires
          .filter(f => (viewMode === "single" ? f.y === selectedYear : f.y <= selectedYear) && (causeFilter === "ALL" || f.c === causeFilter))
          .sort((a, b) => b.a - a.a)
          .slice(0, 60);
        list.forEach(f => {
          const btn = document.createElement("button");
          const isSel = selectedFire && selectedFire.id === f.id;
          btn.className = `w-full text-left p-2 rounded-lg border transition ${isSel ? "bg-orange-500/15 border-orange-500" : "bg-[var(--background)] border-[var(--border)]"}`;
          btn.innerHTML = `
            <div class="flex justify-between text-xs">
              <span class="font-mono font-bold text-orange-400">${f.y} • ${f.n}</span>
              <span class="font-mono text-[var(--muted-foreground)]">${f.a.toLocaleString()} ac</span>
            </div>
            <div class="text-xs text-[var(--muted-foreground)] mt-0.5">Cause: ${f.c}</div>
          `;
          btn.onclick = () => selectFireFeature(f);
          container.appendChild(btn);
        });
      } else {
        DOSSIERS.forEach(d => {
          d.reforms.forEach(r => {
            const btn = document.createElement("button");
            btn.className = "w-full text-left p-2.5 rounded-lg bg-[var(--background)] border border-[var(--border)] hover:border-green-500/50 transition";
            btn.innerHTML = `
              <div class="flex justify-between text-xs mb-1">
                <span class="text-green-400 font-mono font-bold">${r.code}</span>
                <span class="text-[var(--muted-foreground)] font-mono">${r.yr}</span>
              </div>
              <div class="text-xs font-semibold text-[var(--foreground)]">${r.title}</div>
              <div class="text-xs text-[var(--muted-foreground)] mt-0.5">${r.desc}</div>
            `;
            btn.onclick = () => selectDossier(d);
            container.appendChild(btn);
          });
        });
      }
    }

    function renderDossier() {
      const box = document.getElementById("dossierContainer");
      if (activeDossier) {
        const d = activeDossier;
        const st = d.stages[stageIdx] || d.stages[0];
        box.innerHTML = `
          <div class="p-3 rounded-xl bg-[var(--background)] border border-[var(--border)] space-y-2">
            <div class="flex items-center justify-between text-xs">
              <span class="px-2 py-0.5 rounded bg-red-600 text-white font-mono font-bold">${d.year}</span>
              <span class="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">${d.cost} Cost</span>
            </div>
            <h2 class="text-base font-bold text-[var(--foreground)]">${d.displayName}</h2>
            <p class="text-xs text-[var(--muted-foreground)]">${d.subtitle}</p>
            <div class="grid grid-cols-4 gap-1.5 pt-1 text-center">
              <div class="p-1.5 rounded bg-[var(--card)] border border-[var(--border)]">
                <div class="text-xs text-[var(--muted-foreground)]">Burned</div>
                <div class="text-xs font-bold text-orange-400 font-mono">${Math.round(d.acres).toLocaleString()} ac</div>
              </div>
              <div class="p-1.5 rounded bg-[var(--card)] border border-[var(--border)]">
                <div class="text-xs text-[var(--muted-foreground)]">Structures</div>
                <div class="text-xs font-bold text-red-400 font-mono">${d.structures.toLocaleString()}</div>
              </div>
              <div class="p-1.5 rounded bg-[var(--card)] border border-[var(--border)]">
                <div class="text-xs text-[var(--muted-foreground)]">Personnel</div>
                <div class="text-xs font-bold text-[var(--foreground)] font-mono">${d.personnel.toLocaleString()}</div>
              </div>
              <div class="p-1.5 rounded bg-[var(--card)] border border-[var(--border)]">
                <div class="text-xs text-[var(--muted-foreground)]">Gusts</div>
                <div class="text-xs font-bold text-amber-300 font-mono">${d.gusts} mph</div>
              </div>
            </div>
          </div>

          <!-- Evolution Stage Switcher -->
          <div class="p-3 rounded-xl bg-orange-500/10 border border-orange-500/40 space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-orange-400">🔥 FIRE SPREAD EVOLUTION</span>
              <span class="text-xs font-mono text-amber-300">${st.date}</span>
            </div>
            <div class="flex gap-1">
              ${d.stages.map((s, idx) => `
                <button onclick="window.setStage(${idx})" class="flex-1 py-1 rounded text-xs font-mono border ${idx === stageIdx ? 'bg-orange-600 text-white border-orange-400 font-bold' : 'bg-[var(--background)] text-[var(--muted-foreground)] border-[var(--border)]'}">
                  Day ${s.day}
                </button>
              `).join("")}
            </div>
            <div class="p-2 rounded bg-[var(--background)] border border-[var(--border)] space-y-1">
              <div class="text-xs font-bold text-[var(--foreground)]">${st.title}</div>
              <div class="text-xs font-mono text-amber-400">${st.acres.toLocaleString()} ac • ${st.pct}% Contained • Wind: ${st.wind} (${st.rh}% RH)</div>
              <p class="text-xs text-[var(--muted-foreground)] leading-relaxed">${st.note}</p>
            </div>
          </div>

          <!-- 4 Pillars -->
          <div class="p-3 rounded-xl bg-[var(--background)] border border-[var(--border)] space-y-1.5">
            <div class="text-xs font-bold text-amber-400 uppercase">1. Ignition Cause & Preconditions</div>
            <div class="text-xs font-semibold text-[var(--foreground)]">${d.causeTitle}</div>
            <p class="text-xs text-[var(--muted-foreground)] leading-relaxed">${d.causeBody}</p>
          </div>

          <div class="p-3 rounded-xl bg-[var(--background)] border border-[var(--border)] space-y-1.5">
            <div class="text-xs font-bold text-orange-400 uppercase">2. Emergency Response & Deployment</div>
            <p class="text-xs text-[var(--muted-foreground)] leading-relaxed">${d.responseBody}</p>
          </div>

          <div class="p-3 rounded-xl bg-[var(--background)] border border-[var(--border)] space-y-1.5">
            <div class="text-xs font-bold text-sky-400 uppercase">3. How the Fire Went Out</div>
            <p class="text-xs text-[var(--muted-foreground)] leading-relaxed">${d.extinguishBody}</p>
          </div>

          <div class="p-3 rounded-xl bg-[var(--background)] border border-[var(--border)] space-y-2">
            <div class="text-xs font-bold text-green-400 uppercase">4. Public Policy Changes Enacted After</div>
            ${d.reforms.map(r => `
              <div class="p-2 rounded bg-[var(--card)] border border-green-500/30 space-y-0.5">
                <div class="text-xs font-mono font-bold text-green-400">${r.code} (${r.yr})</div>
                <div class="text-xs font-semibold text-[var(--foreground)]">${r.title}</div>
                <p class="text-xs text-[var(--muted-foreground)] leading-relaxed">${r.desc}</p>
              </div>
            `).join("")}
          </div>
        `;
      } else if (selectedFire) {
        const f = selectedFire;
        box.innerHTML = `
          <div class="p-3 rounded-xl bg-[var(--background)] border border-[var(--border)] space-y-2">
            <div class="flex justify-between text-xs">
              <span class="px-2 py-0.5 rounded bg-orange-600 text-white font-mono font-bold">${f.y}</span>
              <span class="font-mono text-orange-400 font-bold">${f.a.toLocaleString()} acres</span>
            </div>
            <h2 class="text-base font-bold text-[var(--foreground)]">${f.n} Fire ${f.cn ? `(${f.cn})` : ""}</h2>
            <p class="text-xs text-[var(--muted-foreground)]">CAL FIRE FRAP Historical Perimeter • Agency: ${f.ag}</p>
            <div class="p-2.5 rounded bg-[var(--card)] border border-[var(--border)] space-y-1">
              <div class="text-xs font-bold text-amber-400">Ignition Cause: ${f.c}</div>
              <p class="text-xs text-[var(--muted-foreground)]">Alarm Date: ${f.ad || f.y} • Contained: ${f.ctd || "Historical Record"}</p>
            </div>
          </div>
        `;
      }
    }

    window.setStage = function(idx) {
      stageIdx = idx;
      renderDossier();
      renderMap();
    };

    function selectDossier(d) {
      activeDossier = d;
      selectedYear = d.year;
      stageIdx = 0;
      const matched = DATA.fires.find(f => f.y === d.year && f.rn.includes(d.matchRawName));
      if (matched) selectedFire = matched;
      camLon = d.origin[0];
      camLat = d.origin[1];
      camZoom = 1.25;
      updateKPIs();
      renderLeftList();
      renderDossier();
      renderHistogram();
      renderMap();
    }

    function selectFireFeature(f) {
      selectedFire = f;
      selectedYear = f.y;
      const d = DOSSIERS.find(x => x.year === f.y && f.rn.includes(x.matchRawName));
      activeDossier = d || null;
      stageIdx = 0;
      camLon = f.ctr[0];
      camLat = f.ctr[1];
      camZoom = 1.35;
      updateKPIs();
      renderLeftList();
      renderDossier();
      renderHistogram();
      renderMap();
    }

    function renderHistogram() {
      const bar = document.getElementById("histogramBar");
      bar.innerHTML = "";
      const sel = document.getElementById("yearSelect");
      if (sel.options.length === 0) {
        for (let y = 1964; y <= 2025; y++) {
          const opt = document.createElement("option");
          opt.value = y;
          opt.textContent = y;
          sel.appendChild(opt);
        }
      }
      sel.value = selectedYear;

      for (let y = 1964; y <= 2025; y++) {
        const ac = DATA.fires.filter(f => f.y === y).reduce((s, f) => s + f.a, 0);
        const hPct = ac > 0 ? Math.max(14, Math.min(100, (Math.sqrt(ac) / Math.sqrt(376000)) * 100)) : 6;
        const col = document.createElement("div");
        col.className = "flex-1 h-full flex flex-col justify-end items-center group";
        col.title = `${y}: ${Math.round(ac).toLocaleString()} acres`;
        const fill = y === selectedYear ? "bg-orange-400" : ac > 30000 ? "bg-red-500/80" : ac > 0 ? "bg-amber-600/60" : "bg-neutral-700/40";
        col.innerHTML = `<div class="w-full rounded-t ${fill}" style="height:${hPct}%"></div>`;
        col.onclick = () => {
          selectedYear = y;
          updateKPIs();
          renderLeftList();
          renderHistogram();
          renderMap();
        };
        bar.appendChild(col);
      }
    }

    // Event Listeners
    document.getElementById("modeCumulative").onclick = (e) => {
      viewMode = "cumulative";
      e.target.className = "px-2.5 py-1 rounded-md font-medium bg-orange-600 text-white";
      document.getElementById("modeSingleYear").className = "px-2.5 py-1 rounded-md font-medium text-[var(--muted-foreground)]";
      document.getElementById("modeReburn").className = "px-2.5 py-1 rounded-md font-medium text-[var(--muted-foreground)]";
      renderLeftList(); renderMap();
    };
    document.getElementById("modeSingleYear").onclick = (e) => {
      viewMode = "single";
      e.target.className = "px-2.5 py-1 rounded-md font-medium bg-orange-600 text-white";
      document.getElementById("modeCumulative").className = "px-2.5 py-1 rounded-md font-medium text-[var(--muted-foreground)]";
      document.getElementById("modeReburn").className = "px-2.5 py-1 rounded-md font-medium text-[var(--muted-foreground)]";
      renderLeftList(); renderMap();
    };
    document.getElementById("modeReburn").onclick = (e) => {
      viewMode = "reburn";
      e.target.className = "px-2.5 py-1 rounded-md font-medium bg-orange-600 text-white";
      document.getElementById("modeCumulative").className = "px-2.5 py-1 rounded-md font-medium text-[var(--muted-foreground)]";
      document.getElementById("modeSingleYear").className = "px-2.5 py-1 rounded-md font-medium text-[var(--muted-foreground)]";
      renderLeftList(); renderMap();
    };

    document.getElementById("causeFilter").onchange = (e) => {
      causeFilter = e.target.value;
      renderLeftList(); renderMap();
    };

    document.getElementById("tabLandmarks").onclick = () => {
      leftTab = "landmarks";
      document.getElementById("tabLandmarks").className = "flex-1 py-2 border-b-2 border-orange-500 text-orange-500";
      document.getElementById("tabAllFires").className = "flex-1 py-2 border-b-2 border-transparent text-[var(--muted-foreground)]";
      document.getElementById("tabPolicies").className = "flex-1 py-2 border-b-2 border-transparent text-[var(--muted-foreground)]";
      renderLeftList();
    };
    document.getElementById("tabAllFires").onclick = () => {
      leftTab = "catalog";
      document.getElementById("tabAllFires").className = "flex-1 py-2 border-b-2 border-orange-500 text-orange-500";
      document.getElementById("tabLandmarks").className = "flex-1 py-2 border-b-2 border-transparent text-[var(--muted-foreground)]";
      document.getElementById("tabPolicies").className = "flex-1 py-2 border-b-2 border-transparent text-[var(--muted-foreground)]";
      renderLeftList();
    };
    document.getElementById("tabPolicies").onclick = () => {
      leftTab = "policies";
      document.getElementById("tabPolicies").className = "flex-1 py-2 border-b-2 border-orange-500 text-orange-500";
      document.getElementById("tabLandmarks").className = "flex-1 py-2 border-b-2 border-transparent text-[var(--muted-foreground)]";
      document.getElementById("tabAllFires").className = "flex-1 py-2 border-b-2 border-transparent text-[var(--muted-foreground)]";
      renderLeftList();
    };

    document.getElementById("yearSelect").onchange = (e) => {
      selectedYear = Number(e.target.value);
      updateKPIs(); renderLeftList(); renderHistogram(); renderMap();
    };
    document.getElementById("btnPrevYear").onclick = () => {
      selectedYear = Math.max(1964, selectedYear - 1);
      updateKPIs(); renderLeftList(); renderHistogram(); renderMap();
    };
    document.getElementById("btnNextYear").onclick = () => {
      selectedYear = Math.min(2025, selectedYear + 1);
      updateKPIs(); renderLeftList(); renderHistogram(); renderMap();
    };
    document.getElementById("btnWatchYear").onclick = () => {
      viewMode = "single";
      document.getElementById("modeSingleYear").click();
      const d = DOSSIERS.find(x => x.year === selectedYear);
      if (d) selectDossier(d);
    };

    document.querySelectorAll(".yr-preset").forEach(btn => {
      btn.onclick = () => {
        const yr = Number(btn.getAttribute("data-yr"));
        selectedYear = yr;
        const d = DOSSIERS.find(x => x.year === yr);
        if (d) selectDossier(d);
        else { updateKPIs(); renderLeftList(); renderHistogram(); renderMap(); }
      };
    });

    document.getElementById("btnPlayTimeline").onclick = () => {
      if (playTimer) {
        clearInterval(playTimer);
        playTimer = null;
        document.getElementById("playIcon").textContent = "▶";
        document.getElementById("playLabel").textContent = "Play 60-Year History";
      } else {
        if (selectedYear >= 2025) selectedYear = 1964;
        document.getElementById("playIcon").textContent = "⏸";
        document.getElementById("playLabel").textContent = "Pause Timeline";
        playTimer = setInterval(() => {
          if (selectedYear >= 2025) {
            clearInterval(playTimer);
            playTimer = null;
            document.getElementById("playIcon").textContent = "▶";
            document.getElementById("playLabel").textContent = "Play 60-Year History";
            return;
          }
          selectedYear++;
          updateKPIs(); renderLeftList(); renderHistogram(); renderMap();
        }, 500);
      }
    };

    // Search Box
    const searchInput = document.getElementById("searchInput");
    const searchDropdown = document.getElementById("searchDropdown");
    searchInput.oninput = () => {
      const q = searchInput.value.trim().toLowerCase();
      if (!q) { searchDropdown.classList.add("hidden"); return; }
      const matches = [];
      DOSSIERS.forEach(d => {
        if (d.displayName.toLowerCase().includes(q) || String(d.year).includes(q) || d.causeTitle.toLowerCase().includes(q) || d.reforms.some(r => r.code.toLowerCase().includes(q) || r.title.toLowerCase().includes(q))) {
          matches.push({ label: `★ ${d.displayName}`, sub: `${d.year} • ${Math.round(d.acres).toLocaleString()} ac`, act: () => selectDossier(d) });
        }
      });
      DATA.fires.forEach(f => {
        if (matches.length < 12 && (f.n.toLowerCase().includes(q) || String(f.y) === q || f.c.toLowerCase().includes(q))) {
          matches.push({ label: `${f.n} Fire (${f.y})`, sub: `${f.c} • ${f.a.toLocaleString()} ac`, act: () => selectFireFeature(f) });
        }
      });
      searchDropdown.innerHTML = matches.length ? "" : `<div class="p-2 text-xs text-[var(--muted-foreground)]">No matches found</div>`;
      matches.forEach(m => {
        const b = document.createElement("button");
        b.className = "w-full text-left px-2.5 py-1.5 rounded hover:bg-orange-500/20 text-xs";
        b.innerHTML = `<div class="font-bold text-[var(--foreground)]">${m.label}</div><div class="text-[var(--muted-foreground)]">${m.sub}</div>`;
        b.onmousedown = () => { m.act(); searchInput.value = ""; searchDropdown.classList.add("hidden"); };
        searchDropdown.appendChild(b);
      });
      searchDropdown.classList.remove("hidden");
    };

    // Canvas Pan & Zoom
    document.getElementById("btnZoomIn").onclick = () => { camZoom = Math.min(4.5, camZoom * 1.3); renderMap(); };
    document.getElementById("btnZoomOut").onclick = () => { camZoom = Math.max(0.6, camZoom / 1.3); renderMap(); };
    document.getElementById("btnResetView").onclick = () => { camLon = -122.36; camLat = 38.54; camZoom = 1.0; renderMap(); };

    canvas.onmousedown = (e) => { isDragging = true; dragStart = [e.clientX, e.clientY]; };
    window.onmouseup = () => { isDragging = false; };
    window.onmousemove = (e) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStart[0];
      const dy = e.clientY - dragStart[1];
      dragStart = [e.clientX, e.clientY];
      const rect = canvas.getBoundingClientRect();
      const baseScale = Math.min(rect.width, rect.height) * 1.32 * camZoom;
      camLon -= dx / (baseScale * Math.cos(38.52 * Math.PI / 180));
      camLat += dy / baseScale;
      renderMap();
    };
    canvas.onwheel = (e) => {
      e.preventDefault();
      camZoom = e.deltaY < 0 ? Math.min(4.5, camZoom * 1.15) : Math.max(0.6, camZoom / 1.15);
      renderMap();
    };

    window.addEventListener("resize", renderMap);
    updateKPIs();
    renderLeftList();
    renderDossier();
    renderHistogram();
    setTimeout(renderMap, 50);
  </script>
</body>
</html>
"""

with open(OUT_HTML, "w", encoding="utf-8") as f:
    f.write(HTML_TEMPLATE.replace("__BUNDLE_JSON__", bundle_json))

print(f"Generated self-contained HTML artifact: {OUT_HTML}")
