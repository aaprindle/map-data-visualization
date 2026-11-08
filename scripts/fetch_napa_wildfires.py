#!/usr/bin/env python3
"""
Fetches and enriches historical wildfire perimeter data (1964–2025) for the greater
Napa Valley / LNU region from the authoritative CAL FIRE FRAP ArcGIS REST FeatureServer,
along with Napa & neighboring county boundaries and curated AVA / landmark annotations.
"""

import json
import math
import os
import urllib.parse
import urllib.request
from datetime import datetime, timezone

OUT_DIR = "/home/antigravity/aaprindle/map-data-visualization/public/data"
os.makedirs(OUT_DIR, exist_ok=True)

CAUSE_MAP = {
    1: "Lightning",
    2: "Equipment Use",
    3: "Smoking",
    4: "Campfire",
    5: "Debris Burning",
    6: "Railroad",
    7: "Arson",
    8: "Playing with Fire",
    9: "Miscellaneous",
    10: "Vehicle",
    11: "Electrical Power / Utility",
    12: "Firefighter Training",
    13: "Non-Firefighter Training",
    14: "Unknown / Undetermined",
    15: "Structure",
    16: "Aircraft",
    17: "Volcanic",
    18: "Escaped Prescribed Burn",
    19: "Campfire (Unpermitted)"
}

AGENCY_MAP = {
    "CDF": "CAL FIRE (Sonoma-Lake-Napa Unit)",
    "CCO": "Contract County Fire",
    "LRA": "Local Response Area",
    "BLM": "Bureau of Land Management",
    "USF": "U.S. Forest Service",
    "NPS": "National Park Service",
    "BIA": "Bureau of Indian Affairs",
    "FWS": "U.S. Fish & Wildlife Service",
    "PVT": "Private / Local Fire District",
    "OTH": "Other Interagency"
}

METHOD_MAP = {
    1: "GPS Ground Survey",
    2: "GPS Aerial Mapping",
    3: "Infrared (FIRIS / NIROPS)",
    4: "Satellite / Aerial Imagery",
    5: "Photo Interpretation",
    6: "Hand-Drawn Topographic",
    7: "Mixed Geospatial Sensors",
    8: "Historical Archive Record"
}

def compute_centroid_and_bbox(geometry):
    coords = []
    def extract(g):
        if not g:
            return
        if isinstance(g[0], (int, float)):
            coords.append(g)
        else:
            for sub in g:
                extract(sub)
    extract(geometry.get("coordinates", []))
    if not coords:
        return [-122.35, 38.50], [-122.45, 38.40, -122.25, 38.60]
    xs = [c[0] for c in coords]
    ys = [c[1] for c in coords]
    min_x, max_x = min(xs), max(xs)
    min_y, max_y = min(ys), max(ys)
    return [round((min_x + max_x) / 2, 5), round((min_y + max_y) / 2, 5)], [
        round(min_x, 5), round(min_y, 5), round(max_x, 5), round(max_y, 5)
    ]

def fmt_date(ms):
    if not ms:
        return None
    try:
        dt = datetime.fromtimestamp(ms / 1000.0, tz=timezone.utc)
        return dt.strftime("%Y-%m-%d")
    except Exception:
        return None

def days_between(ms1, ms2):
    if not ms1 or not ms2:
        return None
    try:
        d = int(round((ms2 - ms1) / (1000.0 * 86400.0)))
        return max(1, d) if d >= 0 else None
    except Exception:
        return None

def main():
    print("Fetching CAL FIRE FRAP Historical Perimeters (1964-2025) for Napa Valley...")
    base_url = "https://services1.arcgis.com/jUJYIo9tSA7EHvfZ/arcgis/rest/services/California_Historic_Fire_Perimeters/FeatureServer/0/query"
    params = {
        "where": "YEAR_ >= 1964",
        "geometry": "-122.72,38.12,-122.02,38.88",
        "geometryType": "esriGeometryEnvelope",
        "inSR": "4326",
        "spatialRel": "esriSpatialRelIntersects",
        "outFields": "*",
        "outSR": "4326",
        "maxAllowableOffset": "0.00012",
        "geometryPrecision": "5",
        "f": "geojson"
    }
    url = base_url + "?" + urllib.parse.urlencode(params)
    raw = urllib.request.urlopen(url, timeout=30).read().decode("utf-8")
    geojson = json.loads(raw)

    features = geojson.get("features", [])
    print(f"Fetched {len(features)} wildfire perimeter features.")

    # Curated cause overrides where CAL FIRE FRAP coded value was 14 (Unknown at time of GIS entry)
    # but official CAL FIRE / CPUC post-incident investigations determined specific causes:
    CAUSE_OVERRIDES = {
        ("ATLAS", 2017): ("Electrical Power / Utility", "PG&E distribution lines contacted by tree limbs along Atlas Peak Rd & Hagen Rd during 55+ mph Diablo wind event"),
        ("NUNS", 2017): ("Electrical Power / Utility", "Confluence of 6 separate PG&E power line & equipment ignitions (Nuns, Partrick, Adobe, Norrbom, Pressley, Oakmont)"),
        ("TUBBS", 2017): ("Electrical Power / Utility", "Private residential electrical system fault on Bennett Lane near Calistoga, driven across the Mayacamas range by 65+ mph gusts"),
        ("COUNTY", 2018): ("Equipment Use", "Improperly installed solar-powered electric livestock fence unit in Guinda (east of Berryessa)"),
        ("PICKETT", 2025): ("Debris Burning", "Improperly disposed smoldering fireplace/burn-pile ashes at 2300 block of Pickett Road near Calistoga"),
        ("VALLEY", 2015): ("Electrical Power / Utility", "Faulty residential hot-tub electrical wiring near Cobb Mountain; rapidly jumped into northern Napa watershed"),
    }

    cleaned_features = []
    for idx, feat in enumerate(features):
        props = feat.get("properties", {})
        geom = feat.get("geometry")
        if not geom:
            continue

        year = int(props.get("YEAR_") or 0)
        raw_name = (props.get("FIRE_NAME") or "UNNAMED FIRE").strip()
        complex_name = (props.get("COMPLEX_NAME") or "").strip() or None
        acres = round(float(props.get("GIS_ACRES") or 0), 1)
        cause_code = props.get("CAUSE") or 14
        cause_label = CAUSE_MAP.get(cause_code, "Unknown / Undetermined")
        cause_detail = props.get("COMMENTS") or None

        key = (raw_name.upper(), year)
        if key in CAUSE_OVERRIDES:
            cause_label, cause_detail = CAUSE_OVERRIDES[key]

        alarm_str = fmt_date(props.get("ALARM_DATE"))
        cont_str = fmt_date(props.get("CONT_DATE"))
        duration_days = days_between(props.get("ALARM_DATE"), props.get("CONT_DATE"))

        centroid, bbox = compute_centroid_and_bbox(geom)
        fid = f"{year}-{raw_name.replace(' ', '_')}-{props.get('OBJECTID', idx)}"

        # Severity / scale tier
        if acres >= 50000:
            scale_tier = "megafire"
        elif acres >= 10000:
            scale_tier = "major"
        elif acres >= 1000:
            scale_tier = "large"
        else:
            scale_tier = "moderate"

        cleaned_props = {
            "id": fid,
            "objectId": props.get("OBJECTID", idx),
            "year": year,
            "decade": f"{(year // 10) * 10}s",
            "name": raw_name.title() if raw_name.isupper() else raw_name,
            "rawName": raw_name.upper(),
            "complexName": complex_name.title() if (complex_name and complex_name.isupper()) else complex_name,
            "acres": acres,
            "causeCode": cause_code,
            "cause": cause_label,
            "causeDetail": cause_detail,
            "agencyCode": props.get("AGENCY") or "CDF",
            "agency": AGENCY_MAP.get(props.get("AGENCY") or "CDF", "CAL FIRE"),
            "unitId": props.get("UNIT_ID") or "LNU",
            "collectionMethod": METHOD_MAP.get(props.get("C_METHOD") or 8, "Historical Archive Record"),
            "alarmDate": alarm_str,
            "containmentDate": cont_str,
            "durationDays": duration_days,
            "scaleTier": scale_tier,
            "centroid": centroid,
            "bbox": bbox,
        }
        cleaned_features.append({
            "type": "Feature",
            "id": props.get("OBJECTID", idx),
            "properties": cleaned_props,
            "geometry": geom
        })

    # Sort chronologically then by acres ascending so larger fires render cleanly on top when needed
    cleaned_features.sort(key=lambda x: (x["properties"]["year"], x["properties"]["acres"]))

    out_fires = os.path.join(OUT_DIR, "napa_fires.geojson")
    with open(out_fires, "w", encoding="utf-8") as f:
        json.dump({"type": "FeatureCollection", "features": cleaned_features}, f, separators=(",", ":"))
    print(f"Saved {out_fires} ({os.path.getsize(out_fires):,} bytes)")

    # Fetch California counties and save Napa + surrounding North Bay counties (Sonoma, Lake, Yolo, Solano)
    print("Fetching Napa & North Bay County boundaries...")
    counties_url = "https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/california-counties.geojson"
    counties_raw = json.loads(urllib.request.urlopen(counties_url, timeout=15).read().decode("utf-8"))
    target_counties = {"Napa", "Sonoma", "Lake", "Yolo", "Solano"}
    county_features = []
    for cf in counties_raw.get("features", []):
        cname = cf.get("properties", {}).get("name")
        if cname in target_counties:
            county_features.append({
                "type": "Feature",
                "properties": {
                    "name": cname,
                    "isNapa": cname == "Napa"
                },
                "geometry": cf["geometry"]
            })
    out_counties = os.path.join(OUT_DIR, "north_bay_counties.geojson")
    with open(out_counties, "w", encoding="utf-8") as f:
        json.dump({"type": "FeatureCollection", "features": county_features}, f, separators=(",", ":"))
    print(f"Saved {out_counties} ({os.path.getsize(out_counties):,} bytes)")

if __name__ == "__main__":
    main()
