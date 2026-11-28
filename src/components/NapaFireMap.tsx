import React, { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url';
import type {
  BasemapStyle,
  FireFeature,
  FireGeoJSON,
  LayerToggles,
  OsmLineGeoJSON,
  OsmPoiGeoJSON,
  ViewMode
} from '../types/fire';
import { NAPA_LANDMARKS, type LandmarkDossier } from '../data/landmarkFires';

// Point MapLibre GL JS v6 explicitly at Vite-bundled worker asset so GeoJSON & DEM workers load cleanly
maplibregl.setWorkerUrl(new URL(maplibreWorkerUrl, window.location.href).href);

interface NapaFireMapProps {
  firesData: FireGeoJSON | null;
  countiesData: any | null;
  osmPois: OsmPoiGeoJSON | null;
  osmPower: OsmLineGeoJSON | null;
  osmRoads: OsmLineGeoJSON | null;
  selectedYear: number;
  viewMode: ViewMode;
  basemap: BasemapStyle;
  layers: LayerToggles;
  selectedCauseFilter: string;
  selectedFire: FireFeature | null;
  focusFireTs: number;
  cameraOverviewTs: number;
  activeDossier: LandmarkDossier | null;
  evolutionStageIdx: number;
  isOrbiting3D: boolean;
  onStopOrbit3D: () => void;
  leftCollapsed: boolean;
  rightCollapsed: boolean;
  flyToCoords: { lon: number; lat: number; zoom?: number; ts: number } | null;
  onSelectFire: (fire: FireFeature) => void;
}

const BASEMAP_TILES: Record<BasemapStyle, { tiles: string[]; attribution: string; maxzoom: number }> = {
  dark_terrain: {
    tiles: [
      'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}'
    ],
    attribution: '© Esri, OpenStreetMap, CAL FIRE FRAP, AWS Open Terrain',
    maxzoom: 16
  },
  osm_standard: {
    tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
    attribution: '© OpenStreetMap contributors, CAL FIRE FRAP',
    maxzoom: 18
  },
  topo_relief: {
    tiles: [
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}'
    ],
    attribution: '© Esri, USGS, OpenStreetMap, CAL FIRE FRAP',
    maxzoom: 17
  },
  satellite_hybrid: {
    tiles: [
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
    ],
    attribution: '© Esri, Maxar, Earthstar Geographics, CAL FIRE FRAP',
    maxzoom: 17
  }
};

const OVERVIEW_CENTER: [number, number] = [-122.34, 38.52];
const OVERVIEW_ZOOM = 9.5;
const OVERVIEW_PITCH_3D = 40;
const OVERVIEW_BEARING_3D = -10;

const DECADE_FILL_EXPR: any = [
  'match',
  ['get', 'decade'],
  '1960s', '#78350f',
  '1970s', '#92400e',
  '1980s', '#b45309',
  '1990s', '#d97706',
  '2000s', '#ea580c',
  '2010s', '#dc2626',
  '2020s', '#ef4444',
  '#c2410c'
];

function createCirclePolygon(center: [number, number], radiusKm: number, points = 56) {
  const coords: [number, number][] = [];
  const distanceX = radiusKm / (111.32 * Math.cos((center[1] * Math.PI) / 180));
  const distanceY = radiusKm / 110.574;

  for (let i = 0; i < points; i++) {
    const theta = (i / points) * (2 * Math.PI);
    coords.push([center[0] + distanceX * Math.cos(theta), center[1] + distanceY * Math.sin(theta)]);
  }
  coords.push(coords[0]);
  return {
    type: 'Feature' as const,
    properties: {},
    geometry: {
      type: 'Polygon' as const,
      coordinates: [coords]
    }
  };
}

export const NapaFireMap: React.FC<NapaFireMapProps> = ({
  firesData,
  countiesData,
  osmPois,
  osmPower,
  osmRoads,
  selectedYear,
  viewMode,
  basemap,
  layers,
  selectedCauseFilter,
  selectedFire,
  focusFireTs,
  cameraOverviewTs,
  activeDossier,
  evolutionStageIdx,
  isOrbiting3D,
  onStopOrbit3D,
  leftCollapsed,
  rightCollapsed,
  flyToCoords,
  onSelectFire
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const originMarkerRef = useRef<maplibregl.Marker | null>(null);
  const [mapReady, setMapReady] = useState(false);

  // Keep latest values in refs so map.on('load') and event listeners never read stale closures
  const firesDataRef = useRef(firesData);
  const countiesDataRef = useRef(countiesData);
  const osmPoisRef = useRef(osmPois);
  const osmPowerRef = useRef(osmPower);
  const osmRoadsRef = useRef(osmRoads);
  const layersRef = useRef(layers);
  const basemapRef = useRef(basemap);
  const selectedYearRef = useRef(selectedYear);
  const onSelectFireRef = useRef(onSelectFire);
  const onStopOrbit3DRef = useRef(onStopOrbit3D);
  const leftCollapsedRef = useRef(leftCollapsed);
  const rightCollapsedRef = useRef(rightCollapsed);

  const selectedFireRef = useRef(selectedFire);
  const flyToRef = useRef(flyToCoords);

  useEffect(() => {
    firesDataRef.current = firesData;
    countiesDataRef.current = countiesData;
    osmPoisRef.current = osmPois;
    osmPowerRef.current = osmPower;
    osmRoadsRef.current = osmRoads;
    layersRef.current = layers;
    basemapRef.current = basemap;
    selectedYearRef.current = selectedYear;
    onSelectFireRef.current = onSelectFire;
    onStopOrbit3DRef.current = onStopOrbit3D;
    leftCollapsedRef.current = leftCollapsed;
    rightCollapsedRef.current = rightCollapsed;
    selectedFireRef.current = selectedFire;
    flyToRef.current = flyToCoords;
  });

  // Initialize MapLibre GL JS with 3D Terrain, Atmospheric Sky, & OSM/CAL FIRE Vector Layers
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const tileCfg = BASEMAP_TILES[basemapRef.current];
    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      attributionControl: false,
      style: {
        version: 8,
        glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
        sky: {
          'sky-color': '#0b0a09',
          'horizon-color': '#1f1a16',
          'sky-horizon-blend': 0.55
        },
        sources: {
          basemap: {
            type: 'raster',
            tiles: tileCfg.tiles,
            tileSize: 256,
            maxzoom: tileCfg.maxzoom,
            attribution: tileCfg.attribution
          },
          'terrain-dem': {
            type: 'raster-dem',
            tiles: ['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'],
            encoding: 'terrarium',
            tileSize: 256,
            maxzoom: 14
          }
        },
        layers: [
          {
            id: 'basemap-layer',
            type: 'raster',
            source: 'basemap',
            minzoom: 0,
            maxzoom: 19
          },
          {
            id: 'terrain-hillshade',
            type: 'hillshade',
            source: 'terrain-dem',
            paint: {
              'hillshade-shadow-color': '#050403',
              'hillshade-highlight-color': '#ffe8c2',
              'hillshade-accent-color': '#2b1e16',
              'hillshade-exaggeration': 0.52,
              'hillshade-illumination-direction': 315
            }
          }
        ]
      },
      center: OVERVIEW_CENTER,
      zoom: OVERVIEW_ZOOM,
      pitch: OVERVIEW_PITCH_3D,
      bearing: OVERVIEW_BEARING_3D,
      maxPitch: 72,
      maxZoom: 17,
      minZoom: 7.5
    });

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'bottom-right');
    map.addControl(new maplibregl.ScaleControl({ maxWidth: 100, unit: 'imperial' }), 'bottom-right');
    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');

    popupRef.current = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
      offset: 14
    });

    map.on('dragstart', () => {
      onStopOrbit3DRef.current();
    });

    map.once('style.load', () => {
      const initLayers = layersRef.current;

      // Enable 3D Terrain if toggled on
      try {
        if (initLayers.terrain3D) {
          map.setTerrain({ source: 'terrain-dem', exaggeration: 1.55 });
        }
      } catch {
        // Fallback safely if WebGL terrain unsupported
      }

      // 1. Counties
      map.addSource('counties', {
        type: 'geojson',
        data: countiesDataRef.current || { type: 'FeatureCollection', features: [] }
      });

      map.addLayer({
        id: 'neighbor-counties-line',
        type: 'line',
        source: 'counties',
        filter: ['==', ['get', 'isNapa'], false],
        paint: {
          'line-color': 'rgba(255, 244, 229, 0.14)',
          'line-width': 1,
          'line-dasharray': [3, 3]
        }
      });

      map.addLayer({
        id: 'napa-county-glow',
        type: 'line',
        source: 'counties',
        filter: ['==', ['get', 'isNapa'], true],
        paint: {
          'line-color': 'rgba(251, 191, 36, 0.28)',
          'line-width': 6,
          'line-blur': 3
        }
      });

      map.addLayer({
        id: 'napa-county-border',
        type: 'line',
        source: 'counties',
        filter: ['==', ['get', 'isNapa'], true],
        paint: {
          'line-color': '#fbbf24',
          'line-width': 2,
          'line-dasharray': [4, 2]
        }
      });

      // 2. OSM Evacuation Corridors (Highways)
      map.addSource('osm-roads', {
        type: 'geojson',
        data: osmRoadsRef.current || { type: 'FeatureCollection', features: [] }
      });

      map.addLayer({
        id: 'osm-roads-line',
        type: 'line',
        source: 'osm-roads',
        layout: {
          'line-cap': 'round',
          'line-join': 'round',
          visibility: initLayers.osmCorridors ? 'visible' : 'none'
        },
        paint: {
          'line-color': 'rgba(226, 232, 240, 0.36)',
          'line-width': ['interpolate', ['linear'], ['zoom'], 8, 1, 13, 2.8]
        }
      });

      // 3. Wildfire Perimeters
      map.addSource('fires', {
        type: 'geojson',
        data: firesDataRef.current || { type: 'FeatureCollection', features: [] }
      });

      map.addLayer({
        id: 'fires-historical-fill',
        type: 'fill',
        source: 'fires',
        filter: ['<', ['get', 'year'], selectedYearRef.current],
        paint: {
          'fill-color': DECADE_FILL_EXPR,
          'fill-opacity': 0.28
        }
      });

      map.addLayer({
        id: 'fires-historical-outline',
        type: 'line',
        source: 'fires',
        filter: ['<', ['get', 'year'], selectedYearRef.current],
        paint: {
          'line-color': 'rgba(251, 146, 60, 0.4)',
          'line-width': 0.9
        }
      });

      map.addLayer({
        id: 'fires-active-year-fill',
        type: 'fill',
        source: 'fires',
        filter: ['==', ['get', 'year'], selectedYearRef.current],
        paint: {
          'fill-color': [
            'match',
            ['get', 'scaleTier'],
            'megafire', '#ef4444',
            'major', '#f97316',
            'large', '#f59e0b',
            '#fbbf24'
          ],
          'fill-opacity': 0.6
        }
      });

      map.addLayer({
        id: 'fires-active-year-glow',
        type: 'line',
        source: 'fires',
        filter: ['==', ['get', 'year'], selectedYearRef.current],
        paint: {
          'line-color': '#fb923c',
          'line-width': 5.5,
          'line-blur': 3.5,
          'line-opacity': 0.85
        }
      });

      map.addLayer({
        id: 'fires-active-year-outline',
        type: 'line',
        source: 'fires',
        filter: ['==', ['get', 'year'], selectedYearRef.current],
        paint: {
          'line-color': '#fff7ed',
          'line-width': 1.7
        }
      });

      map.addLayer({
        id: 'fires-selected-highlight',
        type: 'line',
        source: 'fires',
        filter: ['==', ['get', 'id'], 'NONE'],
        paint: {
          'line-color': '#fef08a',
          'line-width': 3.2
        }
      });

      // 4. Evolution Spread Wavefront
      map.addSource('evolution-wave', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });

      map.addLayer({
        id: 'evolution-wave-fill',
        type: 'fill',
        source: 'evolution-wave',
        paint: {
          'fill-color': '#f97316',
          'fill-opacity': 0.24
        }
      });

      map.addLayer({
        id: 'evolution-wave-ring',
        type: 'line',
        source: 'evolution-wave',
        paint: {
          'line-color': '#fef08a',
          'line-width': 2.2,
          'line-dasharray': [3, 2]
        }
      });

      // 5. OSM High-Voltage Power Transmission Lines
      map.addSource('osm-power', {
        type: 'geojson',
        data: osmPowerRef.current || { type: 'FeatureCollection', features: [] }
      });

      map.addLayer({
        id: 'osm-power-lines',
        type: 'line',
        source: 'osm-power',
        layout: {
          visibility: initLayers.osmPowerLines ? 'visible' : 'none'
        },
        paint: {
          'line-color': '#facc15',
          'line-width': ['interpolate', ['linear'], ['zoom'], 8, 1.2, 13, 2.4],
          'line-dasharray': [2, 2],
          'line-opacity': 0.85
        }
      });

      // 6. OSM Points of Interest (Wineries, Fire Stations, Hospitals)
      map.addSource('osm-pois', {
        type: 'geojson',
        data: osmPoisRef.current || { type: 'FeatureCollection', features: [] }
      });

      map.addLayer({
        id: 'osm-wineries-circle',
        type: 'circle',
        source: 'osm-pois',
        filter: ['==', ['get', 'category'], 'winery'],
        layout: {
          visibility: initLayers.osmWineries ? 'visible' : 'none'
        },
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 9, 3, 13, 5.5],
          'circle-color': '#e11d48',
          'circle-stroke-color': '#ffe4e6',
          'circle-stroke-width': 1,
          'circle-opacity': 0.9
        }
      });

      map.addLayer({
        id: 'osm-emergency-circle',
        type: 'circle',
        source: 'osm-pois',
        filter: ['in', ['get', 'category'], ['literal', ['fire_station', 'hospital']]],
        layout: {
          visibility: initLayers.osmEmergency ? 'visible' : 'none'
        },
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 9, 4.5, 13, 7.5],
          'circle-color': [
            'match',
            ['get', 'category'],
            'hospital', '#22d3ee',
            '#38bdf8'
          ],
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 1.8
        }
      });

      // 7. Napa Landmarks & AVAs
      const landmarkGeoJSON = {
        type: 'FeatureCollection' as const,
        features: NAPA_LANDMARKS.map((lm) => ({
          type: 'Feature' as const,
          properties: {
            name: lm.name,
            category: lm.category,
            note: lm.note || '',
            label: lm.elevationFt ? `${lm.name} (${lm.elevationFt} ft)` : lm.name
          },
          geometry: {
            type: 'Point' as const,
            coordinates: lm.coords
          }
        }))
      };

      map.addSource('napa-landmarks', {
        type: 'geojson',
        data: landmarkGeoJSON
      });

      map.addLayer({
        id: 'napa-landmarks-circle',
        type: 'circle',
        source: 'napa-landmarks',
        layout: {
          visibility: initLayers.landmarks ? 'visible' : 'none'
        },
        paint: {
          'circle-radius': ['match', ['get', 'category'], 'town', 4, 'peak', 3.5, 3],
          'circle-color': [
            'match',
            ['get', 'category'],
            'town', '#f8fafc',
            'ava', '#4ade80',
            'peak', '#fbbf24',
            'water', '#38bdf8',
            '#e2e8f0'
          ],
          'circle-stroke-color': '#0d0c0a',
          'circle-stroke-width': 1.4
        }
      });

      map.addLayer({
        id: 'napa-landmarks-label',
        type: 'symbol',
        source: 'napa-landmarks',
        layout: {
          visibility: initLayers.landmarks ? 'visible' : 'none',
          'text-field': ['get', 'label'],
          'text-font': ['Open Sans Semibold'],
          'text-size': 11,
          'text-offset': [0, 1.05],
          'text-anchor': 'top',
          'text-optional': true
        },
        paint: {
          'text-color': [
            'match',
            ['get', 'category'],
            'town', '#f8fafc',
            'ava', '#bbf7d0',
            'peak', '#fde68a',
            'water', '#bae6fd',
            '#e2e8f0'
          ],
          'text-halo-color': 'rgba(13, 12, 10, 0.94)',
          'text-halo-width': 1.8
        }
      });

      // Unified Interactive Hover (OSM POIs > Napa Landmarks > Fire Perimeters)
      map.on('mousemove', (e) => {
        const poiLayers = ['osm-emergency-circle', 'osm-wineries-circle'].filter((id) =>
          Boolean(map.getLayer(id))
        );
        const poiHits = poiLayers.length ? map.queryRenderedFeatures(e.point, { layers: poiLayers }) : [];

        if (poiHits.length > 0) {
          map.getCanvas().style.cursor = 'pointer';
          const p = poiHits[0].properties as any;
          const catLabel =
            p.category === 'fire_station'
              ? '🚒 OSM FIRE STATION'
              : p.category === 'hospital'
              ? '🏥 OSM HOSPITAL'
              : '🍷 OSM NAPA WINERY';
          const badgeColor = p.category === 'winery' ? '#fb7185' : '#38bdf8';

          popupRef.current
            ?.setLngLat(e.lngLat)
            .setHTML(
              `<div style="display:flex;flex-direction:column;gap:3px;min-width:185px;">
                <span style="font-family:var(--font-mono);font-size:10px;font-weight:700;color:${badgeColor};">${catLabel}</span>
                <div style="font-size:13px;font-weight:600;color:#fff7ed;">${p.name}</div>
                ${p.address ? `<div style="font-size:11px;color:#bfb6a8;">${p.address}</div>` : ''}
                ${p.operator ? `<div style="font-size:11px;color:#86efac;">Operator: ${p.operator}</div>` : ''}
                <div style="font-family:var(--font-mono);font-size:10px;color:#847b6e;margin-top:2px;">
                  OSM #${p.osmId} • ${Number(p.lat).toFixed(4)}°N, ${Math.abs(Number(p.lon)).toFixed(4)}°W
                </div>
              </div>`
            )
            .addTo(map);
          return;
        }

        const fireLayers = ['fires-active-year-fill', 'fires-historical-fill'].filter((id) =>
          Boolean(map.getLayer(id))
        );
        const fireHits = fireLayers.length ? map.queryRenderedFeatures(e.point, { layers: fireLayers }) : [];

        if (fireHits.length > 0) {
          map.getCanvas().style.cursor = 'pointer';
          const p = fireHits[0].properties as any;
          const acresFmt = Number(p.acres || 0).toLocaleString('en-US', { maximumFractionDigits: 0 });
          popupRef.current
            ?.setLngLat(e.lngLat)
            .setHTML(
              `<div style="display:flex;flex-direction:column;gap:3px;min-width:185px;">
                <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;">
                  <span style="font-family:var(--font-mono);font-size:11px;font-weight:700;color:#fb923c;">${p.year}</span>
                  <span style="font-family:var(--font-mono);font-size:11px;color:#fcd34d;">${acresFmt} acres</span>
                </div>
                <div style="font-size:13px;font-weight:600;color:#fff7ed;">${p.name} Fire</div>
                <div style="font-size:11px;color:#bfb6a8;">Cause: ${p.cause}</div>
                <div style="font-size:10px;color:#86efac;margin-top:2px;">Click for dossier & OSM spatial impact →</div>
              </div>`
            )
            .addTo(map);
          return;
        }

        const lmLayers = ['napa-landmarks-circle'].filter((id) => Boolean(map.getLayer(id)));
        const lmHits = lmLayers.length ? map.queryRenderedFeatures(e.point, { layers: lmLayers }) : [];
        if (lmHits.length > 0) {
          map.getCanvas().style.cursor = 'pointer';
          const p = lmHits[0].properties as any;
          popupRef.current
            ?.setLngLat(e.lngLat)
            .setHTML(
              `<div style="display:flex;flex-direction:column;gap:2px;min-width:160px;">
                <span style="font-family:var(--font-mono);font-size:10px;font-weight:700;color:#4ade80;text-transform:uppercase;">${p.category}</span>
                <div style="font-size:13px;font-weight:600;color:#fff7ed;">${p.label}</div>
                ${p.note ? `<div style="font-size:11px;color:#bfb6a8;">${p.note}</div>` : ''}
              </div>`
            )
            .addTo(map);
          return;
        }

        map.getCanvas().style.cursor = '';
        popupRef.current?.remove();
      });

      map.getCanvas().addEventListener('mouseleave', () => {
        popupRef.current?.remove();
      });

      map.on('click', (e) => {
        const fireLayers = ['fires-active-year-fill', 'fires-historical-fill'].filter((id) =>
          Boolean(map.getLayer(id))
        );
        if (!fireLayers.length || !firesDataRef.current) return;
        const fireHits = map.queryRenderedFeatures(e.point, { layers: fireLayers });
        if (!fireHits.length) return;
        const clickedId = fireHits[0].properties?.id;
        const matched = firesDataRef.current.features.find((f) => f.properties.id === clickedId);
        if (matched) onSelectFireRef.current(matched);
      });

      setMapReady(true);
    });

    mapRef.current = map;

    return () => {
      setMapReady(false);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Sync GeoJSON sources whenever async data arrives OR map becomes ready
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    const setData = (id: string, data: any) => {
      if (!data) return;
      const src = map.getSource(id) as maplibregl.GeoJSONSource | undefined;
      if (src) src.setData(data);
    };
    setData('fires', firesData);
    setData('counties', countiesData);
    setData('osm-pois', osmPois);
    setData('osm-power', osmPower);
    setData('osm-roads', osmRoads);
  }, [mapReady, firesData, countiesData, osmPois, osmPower, osmRoads]);

  // Update Basemap tiles & attribution reliably
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    const cfg = BASEMAP_TILES[basemap];
    const src = map.getSource('basemap') as maplibregl.RasterTileSource | undefined;
    if (src) {
      (src as any).attribution = cfg.attribution;
      (src as any).maxzoom = cfg.maxzoom;
      if (typeof src.setTiles === 'function') {
        src.setTiles(cfg.tiles);
      }
    }
    if (map.getLayer('terrain-hillshade')) {
      map.setPaintProperty(
        'terrain-hillshade',
        'hillshade-exaggeration',
        basemap === 'dark_terrain' ? 0.52 : basemap === 'satellite_hybrid' ? 0.22 : 0.34
      );
    }
  }, [mapReady, basemap]);

  // Update 3D Terrain & Vector Layer Visibilities
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    try {
      if (layers.terrain3D) {
        map.setTerrain({ source: 'terrain-dem', exaggeration: 1.55 });
        if (map.getPitch() < 20) {
          map.easeTo({ pitch: OVERVIEW_PITCH_3D, duration: 700 });
        }
      } else {
        map.setTerrain(null);
        map.easeTo({ pitch: 0, bearing: 0, duration: 600 });
      }
    } catch {
      // ignore if terrain not ready
    }

    const setVis = (id: string, on: boolean) => {
      if (map.getLayer(id)) {
        map.setLayoutProperty(id, 'visibility', on ? 'visible' : 'none');
      }
    };
    setVis('osm-wineries-circle', layers.osmWineries);
    setVis('osm-emergency-circle', layers.osmEmergency);
    setVis('osm-power-lines', layers.osmPowerLines);
    setVis('osm-roads-line', layers.osmCorridors);
    setVis('napa-landmarks-circle', layers.landmarks);
    setVis('napa-landmarks-label', layers.landmarks);
    setVis('terrain-hillshade', layers.terrain3D);
  }, [mapReady, layers]);

  // 3D Cinematic Orbit Animation Loop
  useEffect(() => {
    if (!isOrbiting3D || !mapReady) return;
    const map = mapRef.current;
    if (!map) return;

    let animId = 0;
    const rotate = () => {
      map.setBearing((map.getBearing() + 0.16) % 360);
      animId = requestAnimationFrame(rotate);
    };
    animId = requestAnimationFrame(rotate);
    return () => cancelAnimationFrame(animId);
  }, [mapReady, isOrbiting3D]);

  // Update Wildfire Filters & Mode Styling (never blocked by tile fetches)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    if (!map.getLayer('fires-historical-fill') || !map.getLayer('fires-active-year-fill')) return;

    const causeCondition: any =
      selectedCauseFilter === 'ALL'
        ? ['!=', ['get', 'year'], -1]
        : ['==', ['get', 'cause'], selectedCauseFilter];

    if (viewMode === 'single_year') {
      map.setFilter('fires-historical-fill', ['==', ['get', 'year'], -999]);
      map.setFilter('fires-historical-outline', ['==', ['get', 'year'], -999]);
      map.setFilter('fires-active-year-fill', ['all', ['==', ['get', 'year'], selectedYear], causeCondition]);
      map.setFilter('fires-active-year-glow', ['all', ['==', ['get', 'year'], selectedYear], causeCondition]);
      map.setFilter('fires-active-year-outline', ['all', ['==', ['get', 'year'], selectedYear], causeCondition]);
      map.setPaintProperty('fires-active-year-fill', 'fill-opacity', 0.66);
    } else if (viewMode === 'reburn_matrix') {
      // Reburn Matrix: all historical scars up to selectedYear rendered in vivid overlapping orange-red
      // so areas burned 2x/3x/4x stack visually brighter
      map.setFilter('fires-historical-fill', ['all', ['<=', ['get', 'year'], selectedYear], causeCondition]);
      map.setFilter('fires-historical-outline', ['all', ['<=', ['get', 'year'], selectedYear], causeCondition]);
      map.setPaintProperty('fires-historical-fill', 'fill-color', '#f97316');
      map.setPaintProperty('fires-historical-fill', 'fill-opacity', 0.28);
      map.setPaintProperty('fires-historical-outline', 'line-color', 'rgba(254, 240, 138, 0.55)');
      map.setFilter('fires-active-year-fill', ['all', ['==', ['get', 'year'], selectedYear], causeCondition]);
      map.setFilter('fires-active-year-glow', ['all', ['==', ['get', 'year'], selectedYear], causeCondition]);
      map.setFilter('fires-active-year-outline', ['all', ['==', ['get', 'year'], selectedYear], causeCondition]);
      map.setPaintProperty('fires-active-year-fill', 'fill-opacity', 0.5);
    } else {
      map.setFilter('fires-historical-fill', ['all', ['<', ['get', 'year'], selectedYear], causeCondition]);
      map.setFilter('fires-historical-outline', ['all', ['<', ['get', 'year'], selectedYear], causeCondition]);
      map.setPaintProperty('fires-historical-fill', 'fill-color', DECADE_FILL_EXPR);
      map.setPaintProperty('fires-historical-fill', 'fill-opacity', 0.28);
      map.setPaintProperty('fires-historical-outline', 'line-color', 'rgba(251, 146, 60, 0.4)');
      map.setFilter('fires-active-year-fill', ['all', ['==', ['get', 'year'], selectedYear], causeCondition]);
      map.setFilter('fires-active-year-glow', ['all', ['==', ['get', 'year'], selectedYear], causeCondition]);
      map.setFilter('fires-active-year-outline', ['all', ['==', ['get', 'year'], selectedYear], causeCondition]);
      map.setPaintProperty('fires-active-year-fill', 'fill-opacity', 0.6);
    }

    if (selectedFire) {
      map.setFilter('fires-selected-highlight', ['==', ['get', 'id'], selectedFire.properties.id]);
    } else {
      map.setFilter('fires-selected-highlight', ['==', ['get', 'id'], 'NONE']);
    }
  }, [mapReady, viewMode, selectedYear, selectedCauseFilter, selectedFire]);

  // Ignition Marker & Evolution Wavefront
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    if (originMarkerRef.current) {
      originMarkerRef.current.remove();
      originMarkerRef.current = null;
    }

    const waveSrc = map.getSource('evolution-wave') as maplibregl.GeoJSONSource | undefined;

    if (activeDossier) {
      const el = document.createElement('div');
      el.className = 'ignition-marker';
      el.title = `Ignition Origin: ${activeDossier.ignitionLocationLabel}`;
      el.innerHTML = '⚡';

      originMarkerRef.current = new maplibregl.Marker({ element: el })
        .setLngLat(activeDossier.ignitionOriginCoords)
        .addTo(map);

      const stage =
        activeDossier.progressionStages[
          Math.min(evolutionStageIdx, activeDossier.progressionStages.length - 1)
        ];
      if (stage && waveSrc) {
        waveSrc.setData({
          type: 'FeatureCollection',
          features: [createCirclePolygon(stage.center, stage.spreadRadiusKm)]
        });
      }
    } else if (waveSrc) {
      waveSrc.setData({ type: 'FeatureCollection', features: [] });
    }
  }, [mapReady, activeDossier, evolutionStageIdx]);

  // Fly to explicitly selected fire (with viewport-safe dynamic padding)
  useEffect(() => {
    const map = mapRef.current;
    const fire = selectedFireRef.current;
    if (!map || !mapReady || !fire || focusFireTs === 0) return;

    const [minX, minY, maxX, maxY] = fire.properties.bbox;
    const container = map.getContainer();
    const w = container.clientWidth || 1200;
    const h = container.clientHeight || 800;

    const rawLeft = leftCollapsedRef.current ? 48 : 330;
    const rawRight = rightCollapsedRef.current ? 48 : 434;
    const safeLeft = Math.min(rawLeft, Math.floor(w * 0.34));
    const safeRight = Math.min(rawRight, Math.floor(w * 0.38));

    map.fitBounds(
      [
        [minX, minY],
        [maxX, maxY]
      ],
      {
        padding: {
          top: Math.min(100, Math.floor(h * 0.14)),
          bottom: Math.min(148, Math.floor(h * 0.2)),
          left: safeLeft,
          right: safeRight
        },
        maxZoom: 12.6,
        pitch: layersRef.current.terrain3D ? 48 : 0,
        duration: 1050
      }
    );
  }, [mapReady, focusFireTs]);

  // Smoothly return to full Napa Valley overview (e.g. when starting 60-year Play or Reset)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady || cameraOverviewTs === 0) return;
    map.easeTo({
      center: OVERVIEW_CENTER,
      zoom: OVERVIEW_ZOOM,
      pitch: layersRef.current.terrain3D ? OVERVIEW_PITCH_3D : 0,
      bearing: layersRef.current.terrain3D ? OVERVIEW_BEARING_3D : 0,
      duration: 950
    });
  }, [mapReady, cameraOverviewTs]);

  // Fly to specific OSM POI or Street View point when clicked inside Dossier or Search
  useEffect(() => {
    const map = mapRef.current;
    const target = flyToRef.current;
    if (!map || !mapReady || !target) return;
    map.flyTo({
      center: [target.lon, target.lat],
      zoom: target.zoom || 14.2,
      pitch: layersRef.current.terrain3D ? 55 : 0,
      duration: 1050
    });
  }, [mapReady, flyToCoords?.ts]);

  return <div ref={mapContainerRef} className="map-viewport" id="napa-wildfire-map" />;
};
