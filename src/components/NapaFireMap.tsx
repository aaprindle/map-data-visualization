import React, { useEffect, useRef } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { BasemapStyle, FireFeature, FireGeoJSON, ViewMode } from '../types/fire';
import { NAPA_LANDMARKS, type LandmarkDossier } from '../data/landmarkFires';

interface NapaFireMapProps {
  firesData: FireGeoJSON | null;
  countiesData: any | null;
  selectedYear: number;
  viewMode: ViewMode;
  basemap: BasemapStyle;
  selectedCauseFilter: string;
  selectedFire: FireFeature | null;
  activeDossier: LandmarkDossier | null;
  evolutionStageIdx: number;
  showLandmarks: boolean;
  onSelectFire: (fire: FireFeature) => void;
}

const BASEMAP_TILES: Record<BasemapStyle, { tiles: string[]; attribution: string }> = {
  dark_terrain: {
    tiles: [
      'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
      'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png'
    ],
    attribution: '© OpenStreetMap contributors, © CARTO, CAL FIRE FRAP'
  },
  topo_relief: {
    tiles: [
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}'
    ],
    attribution: '© Esri, USGS, NOAA, CAL FIRE FRAP'
  },
  satellite_hybrid: {
    tiles: [
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
    ],
    attribution: '© Esri, Maxar, Earthstar Geographics, USDA FSA, USGS, CAL FIRE FRAP'
  }
};

function createCirclePolygon(center: [number, number], radiusKm: number, points = 48) {
  const coords: [number, number][] = [];
  const distanceX = radiusKm / (111.32 * Math.cos((center[1] * Math.PI) / 180));
  const distanceY = radiusKm / 110.574;

  for (let i = 0; i < points; i++) {
    const theta = (i / points) * (2 * Math.PI);
    const x = distanceX * Math.cos(theta);
    const y = distanceY * Math.sin(theta);
    coords.push([center[0] + x, center[1] + y]);
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
  selectedYear,
  viewMode,
  basemap,
  selectedCauseFilter,
  selectedFire,
  activeDossier,
  evolutionStageIdx,
  showLandmarks,
  onSelectFire
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const originMarkerRef = useRef<maplibregl.Marker | null>(null);
  const firesDataRef = useRef<FireGeoJSON | null>(null);

  firesDataRef.current = firesData;

  // Initialize MapLibre
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
          }
        },
        layers: [
          {
            id: 'basemap-layer',
            type: 'raster',
            source: 'basemap',
            minzoom: 0,
            maxzoom: 19
          }
        ]
      },
      center: [-122.36, 38.52],
      zoom: 9.6,
      pitch: 24,
      bearing: 0,
      maxZoom: 16,
      minZoom: 7
    });

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'bottom-right');
    map.addControl(new maplibregl.ScaleControl({ maxWidth: 110, unit: 'imperial' }), 'bottom-right');

    popupRef.current = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
      offset: 12
    });

    map.on('load', () => {
      // 1. Add Counties Source & Layer
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
          'line-color': 'rgba(255, 244, 229, 0.16)',
          'line-width': 1.2,
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
          'line-width': 2.2,
          'line-dasharray': [4, 2]
        }
      });

      // 2. Add Wildfire Perimeters Source & Layers
      map.addSource('fires', {
        type: 'geojson',
        data: firesDataRef.current || { type: 'FeatureCollection', features: [] }
      });

      // Historical / Cumulative background burn scars
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
          'line-color': 'rgba(251, 146, 60, 0.38)',
          'line-width': 1
        }
      });

      // Active / Current Selected Year Fires Fill
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
          'fill-opacity': 0.56
        }
      });

      map.addLayer({
        id: 'fires-active-year-glow',
        type: 'line',
        source: 'fires',
        filter: ['==', ['get', 'year'], selectedYear],
        paint: {
          'line-color': '#fb923c',
          'line-width': 5,
          'line-blur': 3,
          'line-opacity': 0.75
        }
      });

      map.addLayer({
        id: 'fires-active-year-outline',
        type: 'line',
        source: 'fires',
        filter: ['==', ['get', 'year'], selectedYear],
        paint: {
          'line-color': '#fff7ed',
          'line-width': 1.8
        }
      });

      // Selected Individual Fire Highlight
      map.addLayer({
        id: 'fires-selected-highlight',
        type: 'line',
        source: 'fires',
        filter: ['==', ['get', 'id'], 'NONE'],
        paint: {
          'line-color': '#fef08a',
          'line-width': 3.5
        }
      });

      // 3. Evolution Stage Dynamic Wavefront Circle Source & Layer
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
          'fill-opacity': 0.28
        }
      });

      map.addLayer({
        id: 'evolution-wave-ring',
        type: 'line',
        source: 'evolution-wave',
        paint: {
          'line-color': '#fef08a',
          'line-width': 2.5,
          'line-dasharray': [3, 2]
        }
      });

      // 4. Napa Landmarks & AVAs Source & Layer
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
          'circle-radius': [
            'match',
            ['get', 'category'],
            'town', 4.5,
            'peak', 4,
            3.5
          ],
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
          'circle-stroke-width': 1.5
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
          'text-offset': [0, 1.1],
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
          'text-halo-color': 'rgba(13, 12, 10, 0.92)',
          'text-halo-width': 1.8
        }
      });

      // Hover & Click Interactions
      const interactiveLayers = ['fires-active-year-fill', 'fires-historical-fill'];

      map.on('mousemove', (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: interactiveLayers });
        if (!features.length) {
          map.getCanvas().style.cursor = '';
          popupRef.current?.remove();
          return;
        }
        map.getCanvas().style.cursor = 'pointer';
        const topFeat = features[0];
        const p = topFeat.properties as any;
        const acresFmt = Number(p.acres || 0).toLocaleString('en-US', { maximumFractionDigits: 0 });
        popupRef.current
          ?.setLngLat(e.lngLat)
          .setHTML(
            `<div style="display:flex;flex-direction:column;gap:3px;min-width:170px;">
              <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;">
                <span style="font-family:var(--font-mono);font-size:11px;font-weight:700;color:#fb923c;">${p.year}</span>
                <span style="font-family:var(--font-mono);font-size:11px;color:#fcd34d;">${acresFmt} acres</span>
              </div>
              <div style="font-size:13px;font-weight:600;color:#fff7ed;">${p.name} Fire</div>
              <div style="font-size:11px;color:#bfb6a8;">Cause: ${p.cause}</div>
              <div style="font-size:10px;color:#86efac;margin-top:2px;">Click to open full investigative dossier →</div>
            </div>`
          )
          .addTo(map);
      });

      map.on('click', (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: interactiveLayers });
        if (!features.length || !firesDataRef.current) return;
        const clickedId = features[0].properties?.id;
        const matched = firesDataRef.current.features.find((f) => f.properties.id === clickedId);
        if (matched) {
          onSelectFire(matched);
        }
      });
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update GeoJSON data sources when loaded
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    if (firesData) {
      const src = map.getSource('fires') as maplibregl.GeoJSONSource | undefined;
      if (src) src.setData(firesData as any);
    }
    if (countiesData) {
      const cSrc = map.getSource('counties') as maplibregl.GeoJSONSource | undefined;
      if (cSrc) cSrc.setData(countiesData);
    }
  }, [firesData, countiesData]);

  // Update Basemap tiles
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    const src = map.getSource('basemap') as maplibregl.RasterTileSource | undefined;
    if (src && typeof (src as any).setTiles === 'function') {
      (src as any).setTiles(BASEMAP_TILES[basemap].tiles);
    }
  }, [basemap]);

  // Update Landmark labels visibility
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    const vis = showLandmarks ? 'visible' : 'none';
    if (map.getLayer('napa-landmarks-circle')) {
      map.setLayoutProperty('napa-landmarks-circle', 'visibility', vis);
    }
    if (map.getLayer('napa-landmarks-label')) {
      map.setLayoutProperty('napa-landmarks-label', 'visibility', vis);
    }
  }, [showLandmarks]);

  // Update Filters & Styling based on ViewMode, SelectedYear, CauseFilter, SelectedFire
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const causeCondition: any =
      selectedCauseFilter === 'ALL'
        ? ['!=', ['get', 'year'], -1]
        : ['==', ['get', 'cause'], selectedCauseFilter];

    if (viewMode === 'single_year') {
      // Only show fires from selectedYear
      map.setFilter('fires-historical-fill', ['==', ['get', 'year'], -999]);
      map.setFilter('fires-historical-outline', ['==', ['get', 'year'], -999]);
      map.setFilter('fires-active-year-fill', ['all', ['==', ['get', 'year'], selectedYear], causeCondition]);
      map.setFilter('fires-active-year-glow', ['all', ['==', ['get', 'year'], selectedYear], causeCondition]);
      map.setFilter('fires-active-year-outline', ['all', ['==', ['get', 'year'], selectedYear], causeCondition]);
      map.setPaintProperty('fires-active-year-fill', 'fill-opacity', 0.62);
    } else if (viewMode === 'reburn_matrix') {
      // Show all fires up to 2025 with additive-style opacity so overlapping reburn corridors glow brightly
      map.setFilter('fires-historical-fill', ['all', ['<=', ['get', 'year'], selectedYear], causeCondition]);
      map.setFilter('fires-historical-outline', ['all', ['<=', ['get', 'year'], selectedYear], causeCondition]);
      map.setPaintProperty('fires-historical-fill', 'fill-opacity', 0.34);
      map.setFilter('fires-active-year-fill', ['all', ['==', ['get', 'year'], selectedYear], causeCondition]);
      map.setFilter('fires-active-year-glow', ['all', ['==', ['get', 'year'], selectedYear], causeCondition]);
      map.setFilter('fires-active-year-outline', ['all', ['==', ['get', 'year'], selectedYear], causeCondition]);
    } else {
      // 'cumulative' or 'evolution'
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

  // Fly to selected fire & render ignition point marker + evolution wavefront
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clean up previous marker
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
        const circleFeat = createCirclePolygon(stage.center, stage.spreadRadiusKm);
        waveSrc.setData({
          type: 'FeatureCollection',
          features: [circleFeat]
        });
      }
    } else if (waveSrc) {
      waveSrc.setData({ type: 'FeatureCollection', features: [] });
    }
  }, [activeDossier, evolutionStageIdx]);

  // FlyTo when user explicitly picks a new fire
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
        padding: { top: 90, bottom: 150, left: 390, right: 480 },
        maxZoom: 12.2,
        duration: 1100
      }
    );
  }, [selectedFire?.properties.id]);

  return <div ref={mapContainerRef} className="map-viewport" id="napa-wildfire-map" />;
};
