import React, { useEffect, useRef } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
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
  activeDossier: LandmarkDossier | null;
  evolutionStageIdx: number;
  isOrbiting3D: boolean;
  flyToCoords: { lon: number; lat: number; zoom?: number; ts: number } | null;
  onSelectFire: (fire: FireFeature) => void;
}

const BASEMAP_TILES: Record<BasemapStyle, { tiles: string[]; attribution: string }> = {
  dark_terrain: {
    tiles: [
      'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}'
    ],
    attribution: '© Esri, OpenStreetMap, CAL FIRE FRAP, AWS Open Terrain'
  },
  osm_standard: {
    tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
    attribution: '© OpenStreetMap contributors, CAL FIRE FRAP'
  },
  topo_relief: {
    tiles: [
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}'
    ],
    attribution: '© Esri, USGS, OpenStreetMap, CAL FIRE FRAP'
  },
  satellite_hybrid: {
    tiles: [
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
    ],
    attribution: '© Esri, Maxar, Earthstar Geographics, CAL FIRE FRAP'
  }
};

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
  activeDossier,
  evolutionStageIdx,
  isOrbiting3D,
  flyToCoords,
  onSelectFire
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const originMarkerRef = useRef<maplibregl.Marker | null>(null);
  const firesDataRef = useRef<FireGeoJSON | null>(null);

  firesDataRef.current = firesData;

  // Initialize MapLibre GL JS with 3D Terrain & OSM Vector Layers
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const tileCfg = BASEMAP_TILES[basemap];
    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        sources: {
          basemap: {
            type: 'raster',
            tiles: tileCfg.tiles,
            tileSize: 256,
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
      center: [-122.37, 38.51],
      zoom: 9.8,
      pitch: 46,
      bearing: -12,
      maxPitch: 78,
      maxZoom: 17,
      minZoom: 7.5
    });

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'bottom-right');
    map.addControl(new maplibregl.ScaleControl({ maxWidth: 110, unit: 'imperial' }), 'bottom-right');

    popupRef.current = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
      offset: 14
    });

    map.on('load', () => {
      // Enable 3D Terrain by default
      try {
        map.setTerrain({ source: 'terrain-dem', exaggeration: 1.65 });
      } catch {
        // Fallback safely if WebGL terrain unsupported
      }

      // 1. Counties
      map.addSource('counties', {
        type: 'geojson',
        data: countiesData || { type: 'FeatureCollection', features: [] }
      });

      map.addLayer({
        id: 'neighbor-counties-line',
        type: 'line',
        source: 'counties',
        filter: ['==', ['get', 'isNapa'], false],
        paint: {
          'line-color': 'rgba(255, 244, 229, 0.12)',
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
          'line-color': 'rgba(251, 191, 36, 0.25)',
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
        data: osmRoads || { type: 'FeatureCollection', features: [] }
      });

      map.addLayer({
        id: 'osm-roads-line',
        type: 'line',
        source: 'osm-roads',
        layout: {
          'line-cap': 'round',
          'line-join': 'round',
          visibility: layers.osmCorridors ? 'visible' : 'none'
        },
        paint: {
          'line-color': 'rgba(226, 232, 240, 0.34)',
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
        paint: {
          'fill-color': [
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
          ],
          'fill-opacity': 0.22
        }
      });

      map.addLayer({
        id: 'fires-historical-outline',
        type: 'line',
        source: 'fires',
        paint: {
          'line-color': 'rgba(251, 146, 60, 0.35)',
          'line-width': 0.9
        }
      });

      map.addLayer({
        id: 'fires-active-year-fill',
        type: 'fill',
        source: 'fires',
        filter: ['==', ['get', 'year'], selectedYear],
        paint: {
          'fill-color': [
            'match',
            ['get', 'scaleTier'],
            'megafire', '#ef4444',
            'major', '#f97316',
            'large', '#f59e0b',
            '#fbbf24'
          ],
          'fill-opacity': 0.55
        }
      });

      map.addLayer({
        id: 'fires-active-year-glow',
        type: 'line',
        source: 'fires',
        filter: ['==', ['get', 'year'], selectedYear],
        paint: {
          'line-color': '#fb923c',
          'line-width': 5.5,
          'line-blur': 3.5,
          'line-opacity': 0.8
        }
      });

      map.addLayer({
        id: 'fires-active-year-outline',
        type: 'line',
        source: 'fires',
        filter: ['==', ['get', 'year'], selectedYear],
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
        data: osmPower || { type: 'FeatureCollection', features: [] }
      });

      map.addLayer({
        id: 'osm-power-lines',
        type: 'line',
        source: 'osm-power',
        layout: {
          visibility: layers.osmPowerLines ? 'visible' : 'none'
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
        data: osmPois || { type: 'FeatureCollection', features: [] }
      });

      map.addLayer({
        id: 'osm-wineries-circle',
        type: 'circle',
        source: 'osm-pois',
        filter: ['==', ['get', 'category'], 'winery'],
        layout: {
          visibility: layers.osmWineries ? 'visible' : 'none'
        },
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 9, 2.8, 13, 5.5],
          'circle-color': '#e11d48',
          'circle-stroke-color': '#ffe4e6',
          'circle-stroke-width': 1,
          'circle-opacity': 0.88
        }
      });

      map.addLayer({
        id: 'osm-emergency-circle',
        type: 'circle',
        source: 'osm-pois',
        filter: ['in', ['get', 'category'], ['literal', ['fire_station', 'hospital']]],
        layout: {
          visibility: layers.osmEmergency ? 'visible' : 'none'
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
          'text-field': ['get', 'label'],
          'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
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

      // Unified Interactive Hover (OSM POIs take priority over Fire Perimeters)
      map.on('mousemove', (e) => {
        const poiHits = map.queryRenderedFeatures(e.point, {
          layers: ['osm-emergency-circle', 'osm-wineries-circle'].filter((id) => map.getLayer(id))
        });

        if (poiHits.length > 0) {
          map.getCanvas().style.cursor = 'pointer';
          const p = poiHits[0].properties as any;
          const catLabel =
            p.category === 'fire_station'
              ? '🚒 OSM FIRE STATION'
              : p.category === 'hospital'
              ? '🏥 OSM HOSPITAL'
              : '🍷 OSM NAPA WINERY';
          const badgeColor =
            p.category === 'winery' ? '#fb7185' : '#38bdf8';

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

        const fireHits = map.queryRenderedFeatures(e.point, {
          layers: ['fires-active-year-fill', 'fires-historical-fill']
        });

        if (!fireHits.length) {
          map.getCanvas().style.cursor = '';
          popupRef.current?.remove();
          return;
        }

        map.getCanvas().style.cursor = 'pointer';
        const p = fireHits[0].properties as any;
        const acresFmt = Number(p.acres || 0).toLocaleString('en-US', { maximumFractionDigits: 0 });
        popupRef.current
          ?.setLngLat(e.lngLat)
          .setHTML(
            `<div style="display:flex;flex-direction:column;gap:3px;min-width:180px;">
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
      });

      map.on('click', (e) => {
        const fireHits = map.queryRenderedFeatures(e.point, {
          layers: ['fires-active-year-fill', 'fires-historical-fill']
        });
        if (!fireHits.length || !firesDataRef.current) return;
        const clickedId = fireHits[0].properties?.id;
        const matched = firesDataRef.current.features.find((f) => f.properties.id === clickedId);
        if (matched) onSelectFire(matched);
      });
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Sync GeoJSON sources when async data arrives
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
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
  }, [firesData, countiesData, osmPois, osmPower, osmRoads]);

  // Update Basemap tiles
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    const src = map.getSource('basemap') as maplibregl.RasterTileSource | undefined;
    if (src && typeof (src as any).setTiles === 'function') {
      (src as any).setTiles(BASEMAP_TILES[basemap].tiles);
    }
    if (map.getLayer('terrain-hillshade')) {
      map.setPaintProperty(
        'terrain-hillshade',
        'hillshade-exaggeration',
        basemap === 'dark_terrain' ? 0.55 : basemap === 'satellite_hybrid' ? 0.25 : 0.35
      );
    }
  }, [basemap]);

  // Update 3D Terrain & Vector Layer Visibilities
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    try {
      if (layers.terrain3D) {
        map.setTerrain({ source: 'terrain-dem', exaggeration: 1.65 });
        if (map.getPitch() < 20) {
          map.easeTo({ pitch: 50, duration: 750 });
        }
      } else {
        map.setTerrain(null);
        map.easeTo({ pitch: 0, bearing: 0, duration: 650 });
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
  }, [layers]);

  // 3D Cinematic Orbit Animation Loop
  useEffect(() => {
    if (!isOrbiting3D) return;
    const map = mapRef.current;
    if (!map) return;

    let animId = 0;
    const rotate = () => {
      map.setBearing((map.getBearing() + 0.16) % 360);
      animId = requestAnimationFrame(rotate);
    };
    animId = requestAnimationFrame(rotate);
    return () => cancelAnimationFrame(animId);
  }, [isOrbiting3D]);

  // Update Wildfire Filters
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

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
      map.setPaintProperty('fires-active-year-fill', 'fill-opacity', 0.62);
    } else if (viewMode === 'reburn_matrix') {
      map.setFilter('fires-historical-fill', ['all', ['<=', ['get', 'year'], selectedYear], causeCondition]);
      map.setFilter('fires-historical-outline', ['all', ['<=', ['get', 'year'], selectedYear], causeCondition]);
      map.setPaintProperty('fires-historical-fill', 'fill-opacity', 0.34);
      map.setFilter('fires-active-year-fill', ['all', ['==', ['get', 'year'], selectedYear], causeCondition]);
      map.setFilter('fires-active-year-glow', ['all', ['==', ['get', 'year'], selectedYear], causeCondition]);
      map.setFilter('fires-active-year-outline', ['all', ['==', ['get', 'year'], selectedYear], causeCondition]);
    } else {
      map.setFilter('fires-historical-fill', ['all', ['<', ['get', 'year'], selectedYear], causeCondition]);
      map.setFilter('fires-historical-outline', ['all', ['<', ['get', 'year'], selectedYear], causeCondition]);
      map.setPaintProperty('fires-historical-fill', 'fill-opacity', 0.22);
      map.setFilter('fires-active-year-fill', ['all', ['==', ['get', 'year'], selectedYear], causeCondition]);
      map.setFilter('fires-active-year-glow', ['all', ['==', ['get', 'year'], selectedYear], causeCondition]);
      map.setFilter('fires-active-year-outline', ['all', ['==', ['get', 'year'], selectedYear], causeCondition]);
      map.setPaintProperty('fires-active-year-fill', 'fill-opacity', 0.56);
    }

    if (selectedFire) {
      map.setFilter('fires-selected-highlight', ['==', ['get', 'id'], selectedFire.properties.id]);
    } else {
      map.setFilter('fires-selected-highlight', ['==', ['get', 'id'], 'NONE']);
    }
  }, [viewMode, selectedYear, selectedCauseFilter, selectedFire]);

  // Ignition Marker & Evolution Wavefront
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

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
  }, [activeDossier, evolutionStageIdx]);

  // Fly to selected fire
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedFire) return;
    const [minX, minY, maxX, maxY] = selectedFire.properties.bbox;
    map.fitBounds(
      [
        [minX, minY],
        [maxX, maxY]
      ],
      {
        padding: { top: 85, bottom: 135, left: 330, right: 430 },
        maxZoom: 12.6,
        pitch: layers.terrain3D ? 52 : 0,
        duration: 1150
      }
    );
  }, [selectedFire?.properties.id]);

  // Fly to specific OSM POI or Street View point when clicked inside Dossier
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !flyToCoords) return;
    map.flyTo({
      center: [flyToCoords.lon, flyToCoords.lat],
      zoom: flyToCoords.zoom || 14.2,
      pitch: layers.terrain3D ? 58 : 0,
      duration: 1100
    });
  }, [flyToCoords?.ts]);

  return <div ref={mapContainerRef} className="map-viewport" id="napa-wildfire-map" />;
};
