#!/usr/bin/env python3
"""
Fetches real OpenStreetMap (OSM) infrastructure and wine-country context for Napa Valley
via fast targeted Overpass API queries:
  - Fire Stations & Hospitals (emergency response network)
  - Napa Valley Wineries (agricultural & economic interface)
  - High-voltage Power Transmission Lines (utility ignition risk corridors)
  - Key Evacuation Highways (Hwy 29, Silverado Trail, Hwy 128, Hwy 121)
"""

import json
import os
import time
import urllib.parse
import urllib.request

OUT_DIR = "/home/antigravity/aaprindle/map-data-visualization/public/data"
os.makedirs(OUT_DIR, exist_ok=True)

ENDPOINTS = [
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass-api.de/api/interpreter",
    "https://overpass.openstreetmap.fr/api/interpreter",
]
BBOX = "38.20,-122.66,38.82,-122.08"


def overpass_query(ql: str) -> dict:
    last_err = None
    for ep in ENDPOINTS:
        try:
            req = urllib.request.Request(
                ep,
                data=urllib.parse.urlencode({"data": ql}).encode("utf-8"),
                headers={"User-Agent": "NapaWildfireAtlas/2.0"},
            )
            with urllib.request.urlopen(req, timeout=25) as resp:
                return json.loads(resp.read().decode("utf-8"))
        except Exception as e:
            last_err = e
            print(f"   [{ep}] failed: {e}, trying next mirror...")
            time.sleep(1)
    raise RuntimeError(f"All Overpass mirrors failed: {last_err}")


def simplify_coords(coords, max_pts=22):
    if len(coords) <= max_pts:
        return [[round(c[0], 5), round(c[1], 5)] for c in coords]
    step = max(1, len(coords) // max_pts)
    out = [[round(coords[i][0], 5), round(coords[i][1], 5)] for i in range(0, len(coords), step)]
    last = [round(coords[-1][0], 5), round(coords[-1][1], 5)]
    if out[-1] != last:
        out.append(last)
    return out


def parse_pois(elements, forced_cat, seen):
    out = []
    for el in elements:
        tags = el.get("tags", {})
        lat = el.get("lat") or el.get("center", {}).get("lat")
        lon = el.get("lon") or el.get("center", {}).get("lon")
        if lat is None or lon is None:
            continue
        name = tags.get("name")
        if not name:
            continue
        key = (forced_cat, name.lower().strip())
        if key in seen:
            continue
        seen.add(key)
        addr_parts = [
            tags.get("addr:housenumber", ""),
            tags.get("addr:street", ""),
            tags.get("addr:city", ""),
        ]
        address = " ".join(p for p in addr_parts if p).strip() or None
        out.append(
            {
                "type": "Feature",
                "properties": {
                    "osmId": el.get("id"),
                    "osmType": el.get("type", "node"),
                    "category": forced_cat,
                    "name": name,
                    "operator": tags.get("operator") or None,
                    "website": tags.get("website") or tags.get("contact:website") or None,
                    "address": address,
                    "lat": round(lat, 5),
                    "lon": round(lon, 5),
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [round(lon, 5), round(lat, 5)],
                },
            }
        )
    return out


def main():
    pois = []
    seen = set()

    print("1/4 Fetching OSM Fire Stations & Hospitals...", flush=True)
    d1 = overpass_query(
        f'[out:json][timeout:15];(node["amenity"="fire_station"]({BBOX});node["amenity"="hospital"]({BBOX}););out qt;'
    )
    fs_els = [e for e in d1.get("elements", []) if e.get("tags", {}).get("amenity") == "fire_station"]
    hp_els = [e for e in d1.get("elements", []) if e.get("tags", {}).get("amenity") == "hospital"]
    pois.extend(parse_pois(fs_els, "fire_station", seen))
    pois.extend(parse_pois(hp_els, "hospital", seen))
    print(f"   Found {len(pois)} fire stations & hospitals.", flush=True)

    time.sleep(0.5)
    print("2/4 Fetching OSM Wineries in Napa Valley...", flush=True)
    d2 = overpass_query(
        '[out:json][timeout:15];(node["craft"="winery"](38.22,-122.62,38.65,-122.18););out qt;'
    )
    w_pois = parse_pois(d2.get("elements", []), "winery", seen)
    pois.extend(w_pois)
    print(f"   Found {len(w_pois)} Napa wineries.", flush=True)

    out_pois = os.path.join(OUT_DIR, "napa_osm_pois.geojson")
    with open(out_pois, "w", encoding="utf-8") as f:
        json.dump({"type": "FeatureCollection", "features": pois}, f, separators=(",", ":"))
    print(f"   Saved {len(pois)} total OSM POIs -> {out_pois} ({os.path.getsize(out_pois):,} bytes)")

    time.sleep(1)
    print("3/4 Fetching OSM High-Voltage Power Lines...")
    d3 = overpass_query(f'[out:json][timeout:20];way["power"="line"]({BBOX});out geom qt;')
    power_features = []
    for el in d3.get("elements", []):
        geom = el.get("geometry", [])
        if len(geom) < 2:
            continue
        coords = simplify_coords([[pt["lon"], pt["lat"]] for pt in geom], max_pts=20)
        tags = el.get("tags", {})
        power_features.append(
            {
                "type": "Feature",
                "properties": {
                    "osmId": el.get("id"),
                    "name": tags.get("name") or "Transmission Line",
                    "voltage": tags.get("voltage") or "High Voltage",
                    "operator": tags.get("operator") or "PG&E",
                },
                "geometry": {"type": "LineString", "coordinates": coords},
            }
        )
    out_power = os.path.join(OUT_DIR, "napa_osm_power.geojson")
    with open(out_power, "w", encoding="utf-8") as f:
        json.dump({"type": "FeatureCollection", "features": power_features}, f, separators=(",", ":"))
    print(f"   Saved {len(power_features)} OSM Power Line segments -> {out_power} ({os.path.getsize(out_power):,} bytes)")

    time.sleep(1)
    print("4/4 Fetching OSM Primary Evacuation Highways...")
    d4 = overpass_query(
        '[out:json][timeout:20];way["highway"~"^(trunk|primary)$"](38.20,-122.64,38.75,-122.10);out geom qt;'
    )
    road_features = []
    for el in d4.get("elements", []):
        geom = el.get("geometry", [])
        if len(geom) < 2:
            continue
        tags = el.get("tags", {})
        coords = simplify_coords([[pt["lon"], pt["lat"]] for pt in geom], max_pts=14)
        road_features.append(
            {
                "type": "Feature",
                "properties": {
                    "osmId": el.get("id"),
                    "name": tags.get("name") or tags.get("ref") or "Highway Corridor",
                    "ref": tags.get("ref") or None,
                    "highway": tags.get("highway"),
                },
                "geometry": {"type": "LineString", "coordinates": coords},
            }
        )
    out_roads = os.path.join(OUT_DIR, "napa_osm_roads.geojson")
    with open(out_roads, "w", encoding="utf-8") as f:
        json.dump({"type": "FeatureCollection", "features": road_features}, f, separators=(",", ":"))
    print(f"   Saved {len(road_features)} OSM Highway segments -> {out_roads} ({os.path.getsize(out_roads):,} bytes)")


if __name__ == "__main__":
    main()
