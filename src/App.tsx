import { useEffect, useMemo, useState } from 'react';
import { Wind } from 'lucide-react';
import type {
  BasemapStyle,
  FireFeature,
  FireGeoJSON,
  LayerToggles,
  OsmLineGeoJSON,
  OsmPoiGeoJSON,
  ViewMode
} from './types/fire';
import { LANDMARK_DOSSIERS, NAPA_LANDMARKS, type LandmarkDossier } from './data/landmarkFires';
import { findDossierForFire } from './utils/fireEnrichment';
import { NapaFireMap } from './components/NapaFireMap';
import { WindFieldCanvas } from './components/WindFieldCanvas';
import { DossierPanel } from './components/DossierPanel';
import {
  HeaderBar,
  LeftExplorerDrawer,
  BottomTimelineDock
} from './components/ControlsAndTimeline';

export function App() {
  const [firesData, setFiresData] = useState<FireGeoJSON | null>(null);
  const [countiesData, setCountiesData] = useState<any | null>(null);
  const [osmPois, setOsmPois] = useState<OsmPoiGeoJSON | null>(null);
  const [osmPower, setOsmPower] = useState<OsmLineGeoJSON | null>(null);
  const [osmRoads, setOsmRoads] = useState<OsmLineGeoJSON | null>(null);

  const [selectedYear, setSelectedYear] = useState<number>(2020);
  const [viewMode, setViewMode] = useState<ViewMode>('cumulative');
  const [basemap, setBasemap] = useState<BasemapStyle>('dark_terrain');
  const [selectedCauseFilter, setSelectedCauseFilter] = useState<string>('ALL');

  const [layers, setLayers] = useState<LayerToggles>({
    terrain3D: true,
    osmWineries: true,
    osmEmergency: true,
    osmPowerLines: true,
    osmCorridors: true,
    windParticles: true,
    landmarks: true
  });

  const [isOrbiting3D, setIsOrbiting3D] = useState<boolean>(false);
  const [leftCollapsed, setLeftCollapsed] = useState<boolean>(false);
  const [rightCollapsed, setRightCollapsed] = useState<boolean>(false);

  const [selectedFire, setSelectedFire] = useState<FireFeature | null>(null);
  const [activeDossier, setActiveDossier] = useState<LandmarkDossier | null>(LANDMARK_DOSSIERS[0]);
  const [flyToCoords, setFlyToCoords] = useState<{ lon: number; lat: number; zoom?: number; ts: number } | null>(null);

  const [evolutionStageIdx, setEvolutionStageIdx] = useState<number>(0);
  const [isWatchingEvolution, setIsWatchingEvolution] = useState<boolean>(false);
  const [isPlayingYears, setIsPlayingYears] = useState<boolean>(false);

  const [searchQuery, setSearchQuery] = useState<string>('');

  // Load CAL FIRE FRAP & OpenStreetMap GeoJSON datasets
  useEffect(() => {
    const safeJson = (url: string) =>
      fetch(url)
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null);

    Promise.all([
      safeJson('/data/napa_fires.geojson'),
      safeJson('/data/north_bay_counties.geojson'),
      safeJson('/data/napa_osm_pois.geojson'),
      safeJson('/data/napa_osm_power.geojson'),
      safeJson('/data/napa_osm_roads.geojson')
    ]).then(([fires, counties, pois, power, roads]) => {
      if (fires) {
        setFiresData(fires);
        const initial = fires.features.find(
          (f: FireFeature) => f.properties.year === 2020 && f.properties.rawName === 'HENNESSEY'
        );
        if (initial) setSelectedFire(initial);
      }
      if (counties) setCountiesData(counties);
      if (pois) setOsmPois(pois);
      if (power) setOsmPower(power);
      if (roads) setOsmRoads(roads);
    });
  }, []);

  // 60-year timeline playback loop
  useEffect(() => {
    if (!isPlayingYears) return;
    const timer = setInterval(() => {
      setSelectedYear((prev) => {
        if (prev >= 2025) {
          setIsPlayingYears(false);
          return 2025;
        }
        return prev + 1;
      });
    }, 620);
    return () => clearInterval(timer);
  }, [isPlayingYears]);

  // Day-by-day fire evolution playback loop
  useEffect(() => {
    if (!isWatchingEvolution || !activeDossier) return;
    const maxStage = activeDossier.progressionStages.length - 1;
    const timer = setInterval(() => {
      setEvolutionStageIdx((prev) => {
        if (prev >= maxStage) {
          setIsWatchingEvolution(false);
          return maxStage;
        }
        return prev + 1;
      });
    }, 1800);
    return () => clearInterval(timer);
  }, [isWatchingEvolution, activeDossier]);

  const handleToggleLayer = (key: keyof LayerToggles) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSelectFire = (fire: FireFeature) => {
    setSelectedFire(fire);
    setSelectedYear(fire.properties.year);
    const matchedDossier = findDossierForFire(fire.properties);
    setActiveDossier(matchedDossier || null);
    setEvolutionStageIdx(0);
    setIsWatchingEvolution(false);
    setRightCollapsed(false);
  };

  const handleSelectLandmarkDossier = (dossier: LandmarkDossier) => {
    setActiveDossier(dossier);
    setSelectedYear(dossier.year);
    setEvolutionStageIdx(0);
    setIsWatchingEvolution(false);
    setRightCollapsed(false);
    if (firesData) {
      const matchedFeat = firesData.features.find(
        (f) => f.properties.year === dossier.year && f.properties.rawName.includes(dossier.matchRawName)
      );
      if (matchedFeat) setSelectedFire(matchedFeat);
    }
  };

  const handleWatchSpecificYear = (yr: number) => {
    setIsPlayingYears(false);
    setSelectedYear(yr);
    setViewMode('single_year');

    if (firesData) {
      const firesInYr = firesData.features
        .filter((f) => f.properties.year === yr)
        .sort((a, b) => b.properties.acres - a.properties.acres);
      if (firesInYr.length > 0) {
        const biggest = firesInYr[0];
        setSelectedFire(biggest);
        const d = findDossierForFire(biggest.properties);
        setActiveDossier(d || null);
        setEvolutionStageIdx(0);
        setRightCollapsed(false);
        if (d) setIsWatchingEvolution(true);
      }
    }
  };

  // Universal Search across Fires, Policy Reforms, AVAs, AND OpenStreetMap Wineries & Fire Stations
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    const results: Array<{
      type: 'fire' | 'policy' | 'landmark' | 'osm';
      title: string;
      subtitle: string;
      acres?: number;
      year?: number;
      fire?: FireFeature;
      dossier?: LandmarkDossier;
      coords?: [number, number];
    }> = [];

    for (const d of LANDMARK_DOSSIERS) {
      if (
        d.displayName.toLowerCase().includes(q) ||
        d.subregion.toLowerCase().includes(q) ||
        String(d.year).includes(q) ||
        d.causeAnalysis.officialCause.toLowerCase().includes(q) ||
        d.avaImpacted.some((ava) => ava.toLowerCase().includes(q))
      ) {
        results.push({
          type: 'landmark',
          title: `★ ${d.displayName}`,
          subtitle: `${d.year} Landmark • ${d.causeAnalysis.officialCause.split('(')[0]}`,
          acres: d.acresBurned,
          year: d.year,
          dossier: d
        });
      }
      for (const ref of d.publicPolicyLegacy.reforms) {
        if (
          ref.code.toLowerCase().includes(q) ||
          ref.title.toLowerCase().includes(q) ||
          ref.summary.toLowerCase().includes(q)
        ) {
          results.push({
            type: 'policy',
            title: `⚖️ ${ref.code}: ${ref.title}`,
            subtitle: `Enacted ${ref.yearEnacted} after ${d.displayName}`,
            year: d.year,
            dossier: d
          });
        }
      }
    }

    if (osmPois) {
      for (const poi of osmPois.features) {
        if (
          results.length < 14 &&
          (poi.properties.name.toLowerCase().includes(q) ||
            (poi.properties.address && poi.properties.address.toLowerCase().includes(q)))
        ) {
          const icon =
            poi.properties.category === 'fire_station'
              ? '🚒'
              : poi.properties.category === 'hospital'
              ? '🏥'
              : '🍷';
          results.push({
            type: 'osm',
            title: `${icon} ${poi.properties.name}`,
            subtitle: `OpenStreetMap ${poi.properties.category.replace('_', ' ')} • ${poi.properties.address || 'Napa Valley'}`,
            coords: poi.geometry.coordinates
          });
        }
      }
    }

    if (firesData) {
      for (const f of firesData.features) {
        const p = f.properties;
        if (
          results.length < 18 &&
          (p.name.toLowerCase().includes(q) ||
            String(p.year) === q ||
            p.cause.toLowerCase().includes(q))
        ) {
          results.push({
            type: 'fire',
            title: `${p.name} Fire (${p.year})`,
            subtitle: `Cause: ${p.cause} • ${p.agencyCode}`,
            acres: p.acres,
            year: p.year,
            fire: f
          });
        }
      }
    }

    for (const lm of NAPA_LANDMARKS) {
      if (results.length < 18 && lm.name.toLowerCase().includes(q)) {
        results.push({
          type: 'osm',
          title: `📍 ${lm.name}`,
          subtitle: lm.note || 'Napa Valley Landmark',
          coords: lm.coords
        });
      }
    }

    return results.slice(0, 14);
  }, [searchQuery, firesData, osmPois]);

  const handleSelectSearchResult = (item: any) => {
    setSearchQuery('');
    if (item.dossier) {
      handleSelectLandmarkDossier(item.dossier);
    } else if (item.fire) {
      handleSelectFire(item.fire);
    } else if (item.coords) {
      setFlyToCoords({ lon: item.coords[0], lat: item.coords[1], zoom: 14.5, ts: Date.now() });
    }
  };

  const activeWindBearing = activeDossier?.primarySpreadBearingDeg ?? 225;
  const activeWindSpeed = activeDossier?.peakWindGustMph ?? 28;

  return (
    <div className="atlas-shell">
      {/* 3D Terrain + OpenStreetMap + CAL FIRE Interactive Map */}
      <NapaFireMap
        firesData={firesData}
        countiesData={countiesData}
        osmPois={osmPois}
        osmPower={osmPower}
        osmRoads={osmRoads}
        selectedYear={selectedYear}
        viewMode={viewMode}
        basemap={basemap}
        layers={layers}
        selectedCauseFilter={selectedCauseFilter}
        selectedFire={selectedFire}
        activeDossier={activeDossier}
        evolutionStageIdx={evolutionStageIdx}
        isOrbiting3D={isOrbiting3D}
        flyToCoords={flyToCoords}
        onSelectFire={handleSelectFire}
      />

      {/* Animated Historical Diablo/North Wind & Ember Flow Field */}
      <WindFieldCanvas
        enabled={layers.windParticles}
        bearingDeg={activeWindBearing}
        windSpeedMph={activeWindSpeed}
      />

      {/* Top Command & Layer Header */}
      <HeaderBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchResults={searchResults}
        onSelectSearchResult={handleSelectSearchResult}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        basemap={basemap}
        onBasemapChange={setBasemap}
        layers={layers}
        onToggleLayer={handleToggleLayer}
        isOrbiting3D={isOrbiting3D}
        onToggleOrbit3D={() => setIsOrbiting3D((v) => !v)}
      />

      {/* Floating Wind Telemetry Pill */}
      {layers.windParticles && activeDossier && (
        <div className="wind-telemetry-pill" aria-label="Historical Wind Telemetry">
          <Wind size={13} color="#fb923c" />
          <span>
            <strong>{activeDossier.peakWindGustMph} mph</strong> gusts ({activeDossier.primarySpreadBearingDeg}° vector) •{' '}
            {activeDossier.minHumidityPct}% min RH
          </span>
        </div>
      )}

      {/* Main Collapsible Side Drawers */}
      <main className="workspace-overlay">
        <LeftExplorerDrawer
          firesData={firesData}
          selectedYear={selectedYear}
          viewMode={viewMode}
          selectedCauseFilter={selectedCauseFilter}
          onSelectCauseFilter={setSelectedCauseFilter}
          selectedFire={selectedFire}
          activeDossier={activeDossier}
          isCollapsed={leftCollapsed}
          onToggleCollapse={() => setLeftCollapsed((v) => !v)}
          onSelectLandmarkDossier={handleSelectLandmarkDossier}
          onSelectFire={handleSelectFire}
        />

        <DossierPanel
          selectedFire={selectedFire}
          activeDossier={activeDossier}
          osmPois={osmPois}
          osmPower={osmPower}
          osmRoads={osmRoads}
          evolutionStageIdx={evolutionStageIdx}
          isWatchingEvolution={isWatchingEvolution}
          isCollapsed={rightCollapsed}
          onToggleCollapse={() => setRightCollapsed((v) => !v)}
          onSelectStage={(idx) => {
            setIsWatchingEvolution(false);
            setEvolutionStageIdx(idx);
          }}
          onToggleWatchEvolution={() => {
            if (
              !isWatchingEvolution &&
              activeDossier &&
              evolutionStageIdx >= activeDossier.progressionStages.length - 1
            ) {
              setEvolutionStageIdx(0);
            }
            setIsWatchingEvolution((v) => !v);
          }}
          onFlyToPoint={(lon, lat, zoom) => setFlyToCoords({ lon, lat, zoom, ts: Date.now() })}
        />
      </main>

      {/* Compact Floating Legend */}
      <div className="map-legend-floating" aria-label="Map Legend">
        <div className="legend-item">
          <span className="legend-swatch" style={{ background: '#ef4444', border: '1px solid #fff7ed' }} />
          <span>{selectedYear} Active</span>
        </div>
        <div className="legend-item">
          <span className="legend-swatch" style={{ background: 'rgba(217, 119, 6, 0.45)', border: '1px solid #fb923c' }} />
          <span>Prior Scars</span>
        </div>
        {layers.osmWineries && (
          <div className="legend-item">
            <span className="legend-dot" style={{ background: '#e11d48' }} />
            <span>OSM Wineries</span>
          </div>
        )}
        {layers.osmEmergency && (
          <div className="legend-item">
            <span className="legend-dot" style={{ background: '#38bdf8' }} />
            <span>OSM Fire/Hosp</span>
          </div>
        )}
        {layers.osmPowerLines && (
          <div className="legend-item">
            <span className="legend-line" style={{ borderColor: '#facc15' }} />
            <span>HV Power</span>
          </div>
        )}
      </div>

      {/* Bottom 60-Year Histogram Scrubber */}
      <BottomTimelineDock
        firesData={firesData}
        selectedYear={selectedYear}
        isPlayingYears={isPlayingYears}
        onSelectYear={(yr) => {
          setIsPlayingYears(false);
          setSelectedYear(yr);
        }}
        onTogglePlayYears={() => {
          if (!isPlayingYears && selectedYear >= 2025) setSelectedYear(1964);
          setIsPlayingYears((v) => !v);
        }}
        onStepYear={(delta) => {
          setIsPlayingYears(false);
          setSelectedYear((prev) => Math.max(1964, Math.min(2025, prev + delta)));
        }}
        onResetTimeline={() => {
          setIsPlayingYears(false);
          setSelectedYear(2025);
          setViewMode('cumulative');
        }}
        onWatchSpecificYear={handleWatchSpecificYear}
      />
    </div>
  );
}

export default App;
