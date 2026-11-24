import type { FireFeature, OsmLineGeoJSON, OsmPoiFeature, OsmPoiGeoJSON } from '../types/fire';

export interface RankedOsmPoi {
  poi: OsmPoiFeature;
  distanceKm: number;
  distanceMiles: number;
  insidePerimeter: boolean;
}

export interface SpatialImpactReport {
  wineriesInside: RankedOsmPoi[];
  wineriesNearby: RankedOsmPoi[];
  nearestFireStations: RankedOsmPoi[];
  nearestHospital: RankedOsmPoi | null;
  intersectingPowerSegments: number;
  intersectingRoads: string[];
}

export function haversineKm(lon1: number, lat1: number, lon2: number, lat2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function pointInRing(lon: number, lat: number, ring: number[][]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0];
    const yi = ring[i][1];
    const xj = ring[j][0];
    const yj = ring[j][1];
    const intersect = yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi + 1e-12) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

export function isPointInFireGeometry(lon: number, lat: number, fire: FireFeature): boolean {
  const [minX, minY, maxX, maxY] = fire.properties.bbox;
  if (lon < minX || lon > maxX || lat < minY || lat > maxY) return false;

  const geom = fire.geometry;
  if (geom.type === 'Polygon') {
    const rings = geom.coordinates as number[][][];
    if (!rings.length || !pointInRing(lon, lat, rings[0])) return false;
    for (let i = 1; i < rings.length; i++) {
      if (pointInRing(lon, lat, rings[i])) return false;
    }
    return true;
  } else if (geom.type === 'MultiPolygon') {
    const polys = geom.coordinates as number[][][][];
    for (const rings of polys) {
      if (rings.length && pointInRing(lon, lat, rings[0])) {
        let inHole = false;
        for (let i = 1; i < rings.length; i++) {
          if (pointInRing(lon, lat, rings[i])) {
            inHole = true;
            break;
          }
        }
        if (!inHole) return true;
      }
    }
  }
  return false;
}

export function computeSpatialImpact(
  fire: FireFeature | null,
  pois: OsmPoiGeoJSON | null,
  powerLines: OsmLineGeoJSON | null,
  roads: OsmLineGeoJSON | null,
  originOverride?: [number, number]
): SpatialImpactReport {
  const empty: SpatialImpactReport = {
    wineriesInside: [],
    wineriesNearby: [],
    nearestFireStations: [],
    nearestHospital: null,
    intersectingPowerSegments: 0,
    intersectingRoads: []
  };
  if (!fire || !pois) return empty;

  const [refLon, refLat] = originOverride || fire.properties.centroid;
  const [minX, minY, maxX, maxY] = fire.properties.bbox;

  const wineriesInside: RankedOsmPoi[] = [];
  const wineriesNearby: RankedOsmPoi[] = [];
  const fireStations: RankedOsmPoi[] = [];
  const hospitals: RankedOsmPoi[] = [];

  for (const feat of pois.features) {
    const [lon, lat] = feat.geometry.coordinates;
    const distKm = haversineKm(refLon, refLat, lon, lat);
    const distMi = distKm * 0.621371;
    const inside = isPointInFireGeometry(lon, lat, fire);
    const item: RankedOsmPoi = {
      poi: feat,
      distanceKm: distKm,
      distanceMiles: distMi,
      insidePerimeter: inside
    };

    if (feat.properties.category === 'winery') {
      if (inside) {
        wineriesInside.push(item);
      } else if (
        lon >= minX - 0.035 &&
        lon <= maxX + 0.035 &&
        lat >= minY - 0.035 &&
        lat <= maxY + 0.035
      ) {
        wineriesNearby.push(item);
      }
    } else if (feat.properties.category === 'fire_station') {
      fireStations.push(item);
    } else if (feat.properties.category === 'hospital') {
      hospitals.push(item);
    }
  }

  wineriesInside.sort((a, b) => a.distanceKm - b.distanceKm);
  wineriesNearby.sort((a, b) => a.distanceKm - b.distanceKm);
  fireStations.sort((a, b) => a.distanceKm - b.distanceKm);
  hospitals.sort((a, b) => a.distanceKm - b.distanceKm);

  // Check OSM power transmission line intersection with fire bbox/perimeter
  let powerHits = 0;
  if (powerLines) {
    for (const seg of powerLines.features) {
      const coords = seg.geometry.coordinates;
      const hits = coords.some(([lon, lat]) => isPointInFireGeometry(lon, lat, fire));
      if (hits) powerHits++;
    }
  }

  // Check OSM major highways/corridors intersecting fire perimeter
  const roadNames = new Set<string>();
  if (roads) {
    for (const seg of roads.features) {
      const coords = seg.geometry.coordinates;
      const hits = coords.some(
        ([lon, lat]) =>
          lon >= minX - 0.01 &&
          lon <= maxX + 0.01 &&
          lat >= minY - 0.01 &&
          lat <= maxY + 0.01 &&
          isPointInFireGeometry(lon, lat, fire)
      );
      if (hits && seg.properties.name && seg.properties.name !== 'Corridor') {
        roadNames.add(seg.properties.ref ? `${seg.properties.name} (${seg.properties.ref})` : seg.properties.name);
      }
    }
  }

  return {
    wineriesInside,
    wineriesNearby: wineriesNearby.slice(0, 12),
    nearestFireStations: fireStations.slice(0, 4),
    nearestHospital: hospitals[0] || null,
    intersectingPowerSegments: powerHits,
    intersectingRoads: Array.from(roadNames).slice(0, 8)
  };
}

export function getOsmUrl(lon: number, lat: number, zoom = 15): string {
  return `https://www.openstreetmap.org/?mlat=${lat.toFixed(5)}&mlon=${lon.toFixed(5)}#map=${zoom}/${lat.toFixed(5)}/${lon.toFixed(5)}`;
}

export function getMapillaryUrl(lon: number, lat: number): string {
  return `https://www.mapillary.com/app/?lat=${lat.toFixed(5)}&lng=${lon.toFixed(5)}&z=15`;
}

export function getGoogleStreetViewUrl(lon: number, lat: number): string {
  return `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat.toFixed(5)},${lon.toFixed(5)}`;
}
