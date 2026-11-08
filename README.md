# Napa Valley Wildfire Atlas (1964–2025)

An interactive spatiotemporal data visualization and investigative policy atlas exploring **60+ years of wildfire history in California's Napa Valley (CAL FIRE Sonoma-Lake-Napa Unit / LNU)**.

Built with **React, TypeScript, Vite, and MapLibre GL JS**, backed by authoritative historical wildfire perimeter polygons from the **CAL FIRE Fire and Resource Assessment Program (FRAP)** and post-incident investigative findings from **CAL FIRE**, the **California Public Utilities Commission (CPUC)**, and **Cal OES**.

---

## Key Features

1. **Authoritative 60-Year Napa Valley Wildfire Dataset (1964–2025)**
   - Pulls and enriches **259 historical wildfire perimeters** intersecting the greater Napa Valley watershed (over **1.22 million cumulative acres** burned from the 1964 C. Hanly & Nuns Canyon fires through the 2025 Pickett Fire).
   - Includes Napa & North Bay county boundaries (`public/data/north_bay_counties.geojson`) and 15 Napa Valley American Viticultural Area (AVA) and topographic peak landmarks (Atlas Peak, Mount Veeder, Howell Mountain, Spring Mountain, Mount St. Helena, Lake Berryessa, Oakville, Rutherford, St. Helena, Calistoga).

2. **Watch Any Specific Year & 3 Spatiotemporal View Modes**
   - **Cumulative History Mode**: Step or animate through 1964–2025 watching historical burn scars accumulate while the active year's perimeters glow in high-contrast ember tones.
   - **Single Year ("Watch Year") Mode**: Isolate any specific year (e.g., `1964`, `1981`, `2015`, `2017`, `2018`, `2020`, `2025`) via the year selector, histogram bar chart, or quick-jump presets to inspect that season's fires and automatically play their day-by-day progression.
   - **Reburn Overlap Matrix**: Highlights multi-decade reburn corridors—such as the **1964 Hanly Fire → 2017 Tubbs Fire** wind corridor, the **1981 Atlas Peak Fire → 2017 Atlas Fire** corridor, and the **2020 Glass Fire → 2025 Pickett Fire** reburn.

3. **Multi-Stage Day-by-Day Fire Evolution Theatre**
   - Watch how major Napa Valley fires evolved day-by-day from their exact ignition coordinates (`⚡`), complete with expanding wavefront rings, wind speed/direction vectors (Diablo & North wind events), relative humidity drops, and tactical containment milestones.

4. **Four-Pillar Investigative Dossiers (Cause, Response, Extinguishment & Public Policy Legacy)**
   - **1. Ignition Cause & Preconditions**: Official CAL FIRE / CPUC cause determinations (PG&E conductor-tree contact, private electrical faults, dry lightning sieges, arson, electric livestock fences, smoldering burn-pile ashes) and fuel/weather preconditions.
   - **2. Emergency Response & Tactical Deployment**: Peak personnel, engines, helicopters, VLAT airtankers, private vineyard bulldozer lines, and evacuation operations.
   - **3. How the Fire Went Out**: Meteorological shifts (onshore Pacific marine layer recovery), decisive bulldozer/road containment lines, and the role of irrigated Napa Valley vineyards, Lake Berryessa, and prior burn scars as fuel barriers.
   - **4. Public Policy & Regulatory Reforms Enacted After**:
     - **SB 901 (Dodd, 2018) & AB 1054 (2019)**: Mandatory utility Wildfire Mitigation Plans (WMPs), grid hardening, and undergrounding.
     - **CPUC PSPS & Fast-Trip Recloser Rules (2018)** & **CPUC Decision 20-05-019 (\$1.937B Penalty)**.
     - **SB 833 (2018)**: Mandatory Wireless Emergency Alert (WEA) cell broadcast evacuation standards.
     - **AB 38 & PRC § 4291 Ember Zone 0 (2021)**: 0–5 ft noncombustible home-hardening mandates.
     - **Zonehaven / Genasys Protect Polygon Evacuations & Napa CWPP / Measure L Shaded Fuel Breaks (2021)**.
     - **AB 642 (2021)**: Regulation of private contract firefighting crews following unauthorized backfires during the 2020 Glass Fire.

5. **Universal Search & Ignition Cause Filtering**
   - Search instantaneously by fire name (`Atlas`, `Tubbs`, `Glass`, `Hennessey`, `Pickett`, `Valley`, `County`, `Hanly`), year (`1981`, `2017`, `2020`), ignition cause (`PG&E`, `Arson`, `Lightning`), legislation (`SB 901`, `AB 38`, `Zonehaven`), or Napa AVA (`Howell Mountain`, `Mount Veeder`, `Calistoga`).

---

## Project Structure

```text
├── public/
│   └── data/
│       ├── napa_fires.geojson          # 259 enriched CAL FIRE FRAP perimeters (1964–2025)
│       └── north_bay_counties.geojson  # Napa & neighboring North Bay county boundaries
├── scripts/
│   ├── fetch_napa_wildfires.py         # Data pipeline querying CAL FIRE ArcGIS REST API
│   └── build_artifact_html.py          # Self-contained HTML bundle generator
├── src/
│   ├── components/
│   │   ├── NapaFireMap.tsx             # MapLibre GL JS interactive canvas & layers
│   │   ├── DossierPanel.tsx            # 4-pillar investigative dossier & evolution player
│   │   └── ControlsAndTimeline.tsx     # Header search, cause filters & 60-yr histogram dock
│   ├── data/
│   │   └── landmarkFires.ts            # Curated multi-stage dossiers, policy laws & AVA landmarks
│   ├── types/
│   │   └── fire.ts                     # TypeScript interfaces
│   ├── utils/
│   │   └── fireEnrichment.ts           # Dossier matcher & historical brief synthesizer
│   ├── App.tsx                         # Main application state & timeline controllers
│   └── index.css                       # Custom dark cartographic design system
└── package.json
```

## Running Locally

```bash
# 1. Refresh data from CAL FIRE FRAP ArcGIS REST FeatureServer (optional, data is pre-bundled)
python3 scripts/fetch_napa_wildfires.py

# 2. Install dependencies
npm install

# 3. Start the Vite development server
npm run dev
```
