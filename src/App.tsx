import { useEffect, useMemo, useState } from 'react';
import type { BasemapStyle, FireFeature, FireGeoJSON, ViewMode } from './types/fire';
import { LANDMARK_DOSSIERS, NAPA_LANDMARKS, type LandmarkDossier } from './data/landmarkFires';
import { findDossierForFire } from './utils/fireEnrichment';
import { NapaFireMap } from './components/NapaFireMap';
import { DossierPanel } from './components/DossierPanel';
import {
  HeaderBar,
  LeftExplorerDrawer,
  BottomTimelineDock
} from './components/ControlsAndTimeline';

export function App() {
  const [firesData, setFiresData] = useState<FireGeoJSON | null>(null);
  const [countiesData, setCountiesData] = useState<any | null>(null);

  const [selectedYear, setSelectedYear] = useState<number>(2020);
  const [viewMode, setViewMode] = useState<ViewMode>('cumulative');
  const [basemap, setBasemap] = useState<BasemapStyle>('dark_terrain');
  const [showLandmarks, setShowLandmarks] = useState<boolean>(true);
  const [selectedCauseFilter, setSelectedCauseFilter] = useState<string>('ALL');

  const [selectedFire, setSelectedFire] = useState<FireFeature | null>(null);
  const [activeDossier, setActiveDossier] = useState<LandmarkDossier | null>(LANDMARK_DOSSIERS[0]);

  const [evolutionStageIdx, setEvolutionStageIdx] = useState<number>(0);
  const [isWatchingEvolution, setIsWatchingEvolution] = useState<boolean>(false);
  const [isPlayingYears, setIsPlayingYears] = useState<boolean>(false);

  const [searchQuery, setSearchQuery] = useState<string>('');

  // Load GeoJSON datasets
  useEffect(() => {
    Promise.all([
      fetch('/data/napa_fires.geojson').then((r) => r.json()),
      fetch('/data/north_bay_counties.geojson').then((r) => r.json())
    ])
      .then(([fires, counties]) => {
        setFiresData(fires);
        setCountiesData(counties);
        // Select the 2020 Hennessey / LNU Complex feature initially to match default dossier
        const initial = fires.features.find(
          (f: FireFeature) => f.properties.year === 2020 && f.properties.rawName === 'HENNESSEY'
        );
        if (initial) {
          setSelectedFire(initial);
        }
      })
      .catch((err) => console.error('Failed to load Napa wildfire datasets:', err));
  }, []);

  // Multi-year 60-year timeline playback loop
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
    }, 650);
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

  // Handle selecting an individual fire polygon on the map or list
  const handleSelectFire = (fire: FireFeature) => {
    setSelectedFire(fire);
    setSelectedYear(fire.properties.year);
    const matchedDossier = findDossierForFire(fire.properties);
    setActiveDossier(matchedDossier || null);
    setEvolutionStageIdx(0);
    setIsWatchingEvolution(false);
  };

  // Handle selecting one of the 7 curated Landmark Dossiers
  const handleSelectLandmarkDossier = (dossier: LandmarkDossier) => {
    setActiveDossier(dossier);
    setSelectedYear(dossier.year);
    setEvolutionStageIdx(0);
    setIsWatchingEvolution(false);
    if (firesData) {
      const matchedFeat = firesData.features.find(
        (f) => f.properties.year === dossier.year && f.properties.rawName.includes(dossier.matchRawName)
      );
      if (matchedFeat) {
        setSelectedFire(matchedFeat);
      }
    }
  };

  // Handle "Watch Specific Year" action
  const handleWatchSpecificYear = (yr: number) => {
    setIsPlayingYears(false);
    setSelectedYear(yr);
    setViewMode('single_year');

    // Automatically select the largest fire of that year & start its evolution if it has a dossier
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
        if (d) {
          setIsWatchingEvolution(true);
        }
      }
    }
  };

  // Universal Search across Fires, Years, Causes, Policy Bills (SB 901, AB 38, etc.), and AVAs
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    const results: Array<{
      type: 'fire' | 'policy' | 'landmark';
      title: string;
      subtitle: string;
      acres?: number;
      year?: number;
      fire?: FireFeature;
      dossier?: LandmarkDossier;
    }> = [];

    // 1. Search Landmark Dossiers & Policy Reforms
    for (const d of LANDMARK_DOSSIERS) {
      const matchDossier =
        d.displayName.toLowerCase().includes(q) ||
        d.subtitle.toLowerCase().includes(q) ||
        d.subregion.toLowerCase().includes(q) ||
        String(d.year).includes(q) ||
        d.causeAnalysis.officialCause.toLowerCase().includes(q) ||
        d.avaImpacted.some((ava) => ava.toLowerCase().includes(q));

      if (matchDossier) {
        results.push({
          type: 'landmark',
          title: `★ ${d.displayName}`,
          subtitle: `${d.year} Landmark Dossier • ${d.causeAnalysis.officialCause.split('(')[0]}`,
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

    // 2. Search All 259 CAL FIRE Perimeters
    if (firesData) {
      for (const f of firesData.features) {
        const p = f.properties;
        if (
          p.name.toLowerCase().includes(q) ||
          (p.complexName && p.complexName.toLowerCase().includes(q)) ||
          String(p.year) === q ||
          p.cause.toLowerCase().includes(q) ||
          (p.causeDetail && p.causeDetail.toLowerCase().includes(q))
        ) {
          // Avoid duplicating top landmark if already at top
          if (results.length < 18) {
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
    }

    // 3. Search Napa AVAs / Peaks
    for (const lm of NAPA_LANDMARKS) {
      if (lm.name.toLowerCase().includes(q) || (lm.note && lm.note.toLowerCase().includes(q))) {
        const relatedDossier = LANDMARK_DOSSIERS.find(
          (d) =>
            d.subregion.toLowerCase().includes(lm.name.toLowerCase()) ||
            d.avaImpacted.some((a) => a.toLowerCase().includes(lm.name.toLowerCase()))
        );
        if (relatedDossier) {
          results.push({
            type: 'landmark',
            title: `📍 ${lm.name} (${lm.note || lm.category})`,
            subtitle: `View major wildfire impact: ${relatedDossier.displayName}`,
            acres: relatedDossier.acresBurned,
            year: relatedDossier.year,
            dossier: relatedDossier
          });
        }
      }
    }

    return results.slice(0, 14);
  }, [searchQuery, firesData]);

  const handleSelectSearchResult = (item: any) => {
    setSearchQuery('');
    if (item.dossier) {
      handleSelectLandmarkDossier(item.dossier);
    } else if (item.fire) {
      handleSelectFire(item.fire);
    }
  };

  return (
    <div className="atlas-shell">
      {/* Full-Viewport Interactive MapLibre GL Canvas */}
      <NapaFireMap
        firesData={firesData}
        countiesData={countiesData}
        selectedYear={selectedYear}
        viewMode={viewMode}
        basemap={basemap}
        selectedCauseFilter={selectedCauseFilter}
        selectedFire={selectedFire}
        activeDossier={activeDossier}
        evolutionStageIdx={evolutionStageIdx}
        showLandmarks={showLandmarks}
        onSelectFire={handleSelectFire}
      />

      {/* Top Command & Search Bar */}
      <HeaderBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchResults={searchResults}
        onSelectSearchResult={handleSelectSearchResult}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        basemap={basemap}
        onBasemapChange={setBasemap}
        showLandmarks={showLandmarks}
        onToggleLandmarks={() => setShowLandmarks((v) => !v)}
      />

      {/* Left Explorer & Right Investigative Dossier Drawers */}
      <main className="workspace-overlay">
        <LeftExplorerDrawer
          firesData={firesData}
          selectedYear={selectedYear}
          viewMode={viewMode}
          selectedCauseFilter={selectedCauseFilter}
          onSelectCauseFilter={setSelectedCauseFilter}
          selectedFire={selectedFire}
          activeDossier={activeDossier}
          onSelectLandmarkDossier={handleSelectLandmarkDossier}
          onSelectFire={handleSelectFire}
        />

        <DossierPanel
          selectedFire={selectedFire}
          activeDossier={activeDossier}
          evolutionStageIdx={evolutionStageIdx}
          isWatchingEvolution={isWatchingEvolution}
          onSelectStage={(idx) => {
            setIsWatchingEvolution(false);
            setEvolutionStageIdx(idx);
          }}
          onToggleWatchEvolution={() => {
            if (!isWatchingEvolution && activeDossier && evolutionStageIdx >= activeDossier.progressionStages.length - 1) {
              setEvolutionStageIdx(0);
            }
            setIsWatchingEvolution((v) => !v);
          }}
        />
      </main>

      {/* Floating Cartographic Legend */}
      <div className="map-legend-floating" aria-label="Map Legend">
        <div className="legend-item">
          <span className="legend-swatch" style={{ background: '#ef4444', border: '1px solid #fff7ed' }} />
          <span>Selected Year ({selectedYear})</span>
        </div>
        <div className="legend-item">
          <span className="legend-swatch" style={{ background: 'rgba(217, 119, 6, 0.45)', border: '1px solid #fb923c' }} />
          <span>Prior Burn Scars (1964–{selectedYear - 1})</span>
        </div>
        <div className="legend-item">
          <span
            className="legend-swatch"
            style={{ background: 'rgba(249, 115, 22, 0.35)', border: '1px dashed #fef08a' }}
          />
          <span>Day-by-Day Spread Front</span>
        </div>
        <div className="legend-item">
          <span className="legend-swatch" style={{ background: 'transparent', border: '2px dashed #fbbf24' }} />
          <span>Napa County Boundary</span>
        </div>
      </div>

      {/* Bottom 60-Year Histogram Scrubber & Playback Controls */}
      <BottomTimelineDock
        firesData={firesData}
        selectedYear={selectedYear}
        isPlayingYears={isPlayingYears}
        playbackSpeedMs={650}
        onSelectYear={(yr) => {
          setIsPlayingYears(false);
          setSelectedYear(yr);
        }}
        onTogglePlayYears={() => {
          if (!isPlayingYears && selectedYear >= 2025) {
            setSelectedYear(1964);
          }
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
