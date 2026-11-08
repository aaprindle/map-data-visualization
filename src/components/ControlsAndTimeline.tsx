import React, { useMemo, useState } from 'react';
import {
  Flame,
  Search,
  Layers,
  Eye,
  Compass,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Sparkles,
  X,
  Filter,
  Award,
  Scale
} from 'lucide-react';
import type { BasemapStyle, FireFeature, FireGeoJSON, ViewMode } from '../types/fire';
import { LANDMARK_DOSSIERS, type LandmarkDossier } from '../data/landmarkFires';

interface HeaderBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  searchResults: Array<{
    type: 'fire' | 'policy' | 'landmark';
    title: string;
    subtitle: string;
    acres?: number;
    year?: number;
    fire?: FireFeature;
    dossier?: LandmarkDossier;
  }>;
  onSelectSearchResult: (item: any) => void;
  viewMode: ViewMode;
  onViewModeChange: (m: ViewMode) => void;
  basemap: BasemapStyle;
  onBasemapChange: (b: BasemapStyle) => void;
  showLandmarks: boolean;
  onToggleLandmarks: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  searchQuery,
  onSearchChange,
  searchResults,
  onSelectSearchResult,
  viewMode,
  onViewModeChange,
  basemap,
  onBasemapChange,
  showLandmarks,
  onToggleLandmarks
}) => {
  const [focused, setFocused] = useState(false);

  return (
    <header className="top-command-bar" id="top-command-header">
      <div className="brand-cluster">
        <div className="brand-emblem" aria-hidden="true">
          <Flame size={21} />
        </div>
        <div className="brand-titles">
          <h1>Napa Valley Wildfire Atlas</h1>
          <div className="brand-subtitle">
            <span>60-Year Spatiotemporal History (1964–2025)</span>
            <span>•</span>
            <span className="live-badge">CAL FIRE FRAP + CPUC ARCHIVE</span>
          </div>
        </div>
      </div>

      <div className="header-controls">
        {/* Universal Search Box */}
        <div className="search-box-wrapper">
          <Search size={14} className="search-icon" />
          <input
            id="universal-fire-search"
            type="text"
            className="search-input"
            placeholder="Search fire, year, cause (PG&E, arson), SB 901, AVA..."
            value={searchQuery}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 180)}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="search-clear-btn"
              aria-label="Clear search"
              onClick={() => onSearchChange('')}
            >
              <X size={13} />
            </button>
          )}

          {focused && searchQuery.trim().length > 0 && (
            <div className="search-dropdown" role="listbox">
              {searchResults.length === 0 ? (
                <div style={{ padding: '10px 12px', fontSize: '0.78rem', color: '#847b6e' }}>
                  No matching fires, causes, policies, or AVAs found.
                </div>
              ) : (
                searchResults.map((item, i) => (
                  <button
                    key={i}
                    type="button"
                    className="search-result-item"
                    onMouseDown={() => onSelectSearchResult(item)}
                  >
                    <div className="search-result-main">
                      <div className="search-result-title">
                        <span>{item.title}</span>
                      </div>
                      <div className="search-result-meta">{item.subtitle}</div>
                    </div>
                    {item.acres !== undefined && (
                      <div className="search-result-acres">
                        {item.acres.toLocaleString('en-US', { maximumFractionDigits: 0 })} ac
                      </div>
                    )}
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* View Mode Switcher */}
        <div className="mode-pills" role="group" aria-label="Visualization Mode">
          <button
            type="button"
            id="mode-btn-cumulative"
            className={`mode-pill ${viewMode === 'cumulative' ? 'active' : ''}`}
            onClick={() => onViewModeChange('cumulative')}
            title="Show cumulative historical scars up to selected year, highlighting active year"
          >
            <Layers size={13} />
            <span>Cumulative History</span>
          </button>
          <button
            type="button"
            id="mode-btn-single-year"
            className={`mode-pill ${viewMode === 'single_year' ? 'active' : ''}`}
            onClick={() => onViewModeChange('single_year')}
            title="Isolate and watch only fires that occurred in the selected year"
          >
            <Eye size={13} />
            <span>Single Year ("Watch Year")</span>
          </button>
          <button
            type="button"
            id="mode-btn-reburn"
            className={`mode-pill ${viewMode === 'reburn_matrix' ? 'active' : ''}`}
            onClick={() => onViewModeChange('reburn_matrix')}
            title="Highlight overlapping multi-decade reburn corridors (e.g. 1964 Hanly vs 2017 Tubbs, 1981 vs 2017 Atlas)"
          >
            <Sparkles size={13} />
            <span>Reburn Overlap</span>
          </button>
        </div>

        {/* Basemap & AVA Labels Toggle */}
        <div className="mode-pills">
          <button
            type="button"
            className={`mode-pill ${basemap === 'dark_terrain' ? 'active' : ''}`}
            onClick={() => onBasemapChange('dark_terrain')}
          >
            <span>Dark Atlas</span>
          </button>
          <button
            type="button"
            className={`mode-pill ${basemap === 'topo_relief' ? 'active' : ''}`}
            onClick={() => onBasemapChange('topo_relief')}
          >
            <span>Topo Relief</span>
          </button>
          <button
            type="button"
            className={`mode-pill ${basemap === 'satellite_hybrid' ? 'active' : ''}`}
            onClick={() => onBasemapChange('satellite_hybrid')}
          >
            <span>Satellite</span>
          </button>
          <button
            type="button"
            className={`mode-pill ${showLandmarks ? 'active' : ''}`}
            onClick={onToggleLandmarks}
            title="Toggle Napa Valley AVA & Mountain Peak Labels"
          >
            <Compass size={13} />
            <span>AVAs & Peaks</span>
          </button>
        </div>
      </div>
    </header>
  );
};

interface LeftExplorerDrawerProps {
  firesData: FireGeoJSON | null;
  selectedYear: number;
  viewMode: ViewMode;
  selectedCauseFilter: string;
  onSelectCauseFilter: (c: string) => void;
  selectedFire: FireFeature | null;
  activeDossier: LandmarkDossier | null;
  onSelectLandmarkDossier: (d: LandmarkDossier) => void;
  onSelectFire: (f: FireFeature) => void;
}

const CAUSE_FILTERS = [
  { label: 'All Causes', value: 'ALL' },
  { label: '⚡ Utility / Power', value: 'Electrical Power / Utility' },
  { label: '🌩️ Lightning', value: 'Lightning' },
  { label: '🔥 Arson', value: 'Arson' },
  { label: '🚜 Equipment / Debris', value: 'Equipment Use' },
  { label: '🚗 Vehicle', value: 'Vehicle' },
  { label: '❓ Undetermined', value: 'Unknown / Undetermined' }
];

export const LeftExplorerDrawer: React.FC<LeftExplorerDrawerProps> = ({
  firesData,
  selectedYear,
  viewMode,
  selectedCauseFilter,
  onSelectCauseFilter,
  selectedFire,
  activeDossier,
  onSelectLandmarkDossier,
  onSelectFire
}) => {
  const [activeTab, setActiveTab] = useState<'landmarks' | 'year_fires' | 'policy_timeline'>('landmarks');

  // Compute KPI metrics for current view
  const stats = useMemo(() => {
    if (!firesData) return { count: 0, totalAcres: 0, yearCount: 0, yearAcres: 0 };
    const allUpToYear = firesData.features.filter((f) => f.properties.year <= selectedYear);
    const inYear = firesData.features.filter((f) => f.properties.year === selectedYear);
    return {
      count: allUpToYear.length,
      totalAcres: allUpToYear.reduce((acc, f) => acc + f.properties.acres, 0),
      yearCount: inYear.length,
      yearAcres: inYear.reduce((acc, f) => acc + f.properties.acres, 0)
    };
  }, [firesData, selectedYear]);

  const filteredFiresList = useMemo(() => {
    if (!firesData) return [];
    let list =
      viewMode === 'single_year'
        ? firesData.features.filter((f) => f.properties.year === selectedYear)
        : firesData.features.filter((f) => f.properties.year <= selectedYear);
    if (selectedCauseFilter !== 'ALL') {
      list = list.filter((f) => f.properties.cause === selectedCauseFilter);
    }
    return [...list].sort((a, b) => b.properties.acres - a.properties.acres);
  }, [firesData, selectedYear, viewMode, selectedCauseFilter]);

  const allPolicies = useMemo(() => {
    const list: Array<{ dossier: LandmarkDossier; reform: LandmarkDossier['publicPolicyLegacy']['reforms'][0] }> = [];
    for (const d of LANDMARK_DOSSIERS) {
      for (const r of d.publicPolicyLegacy.reforms) {
        list.push({ dossier: d, reform: r });
      }
    }
    return list.sort((a, b) => b.reform.yearEnacted - a.reform.yearEnacted);
  }, []);

  return (
    <aside className="left-drawer" id="left-explorer-drawer">
      {/* KPI Summary & Cause Filter Card */}
      <div className="glass-panel">
        <div className="kpi-strip">
          <div className="kpi-cell">
            <span className="kpi-label">Selected Year</span>
            <span className="kpi-value ember">{selectedYear}</span>
          </div>
          <div className="kpi-cell">
            <span className="kpi-label">{selectedYear} Burned</span>
            <span className="kpi-value">
              {stats.yearAcres >= 1000
                ? `${(stats.yearAcres / 1000).toFixed(1)}k ac`
                : `${Math.round(stats.yearAcres)} ac`}
            </span>
          </div>
          <div className="kpi-cell">
            <span className="kpi-label">1964–{selectedYear} Total</span>
            <span className="kpi-value">{(stats.totalAcres / 1000).toFixed(0)}k ac</span>
          </div>
        </div>

        <div className="filter-section">
          <div className="section-header-row">
            <span className="section-label">
              <Filter size={12} /> Filter Ignition Cause
            </span>
            {selectedCauseFilter !== 'ALL' && (
              <button
                type="button"
                onClick={() => onSelectCauseFilter('ALL')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#fb923c',
                  fontSize: '0.7rem',
                  cursor: 'pointer'
                }}
              >
                Reset
              </button>
            )}
          </div>
          <div className="cause-chips">
            {CAUSE_FILTERS.map((cf) => (
              <button
                key={cf.value}
                type="button"
                className={`cause-chip ${selectedCauseFilter === cf.value ? 'active' : ''}`}
                onClick={() => onSelectCauseFilter(cf.value)}
              >
                <span>{cf.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tabbed Callouts & Catalog Card */}
      <div className="glass-panel landmarks-panel">
        <div className="panel-tabs">
          <button
            type="button"
            id="tab-btn-landmarks"
            className={`panel-tab ${activeTab === 'landmarks' ? 'active' : ''}`}
            onClick={() => setActiveTab('landmarks')}
          >
            <Award size={12} style={{ display: 'inline', marginRight: 4, verticalAlign: -1 }} />
            Landmark Callouts (7)
          </button>
          <button
            type="button"
            id="tab-btn-catalog"
            className={`panel-tab ${activeTab === 'year_fires' ? 'active' : ''}`}
            onClick={() => setActiveTab('year_fires')}
          >
            All Fires ({filteredFiresList.length})
          </button>
          <button
            type="button"
            id="tab-btn-policies"
            className={`panel-tab ${activeTab === 'policy_timeline' ? 'active' : ''}`}
            onClick={() => setActiveTab('policy_timeline')}
          >
            <Scale size={12} style={{ display: 'inline', marginRight: 4, verticalAlign: -1 }} />
            Policy Legacy
          </button>
        </div>

        <div className="fire-list-scroll">
          {activeTab === 'landmarks' &&
            LANDMARK_DOSSIERS.map((d) => {
              const isSelected = activeDossier?.id === d.id;
              return (
                <button
                  key={d.id}
                  type="button"
                  id={`landmark-card-${d.id}`}
                  className={`landmark-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => onSelectLandmarkDossier(d)}
                >
                  <div className="landmark-card-top">
                    <span className="landmark-year-badge">{d.year}</span>
                    <span className="landmark-acres">
                      {d.acresBurned.toLocaleString('en-US', { maximumFractionDigits: 0 })} acres
                    </span>
                  </div>
                  <div className="landmark-title">{d.displayName}</div>
                  <div className="landmark-sub">{d.subtitle}</div>
                  <div className="landmark-tags">
                    <span className="micro-tag">Cause: {d.causeAnalysis.officialCause.split('(')[0].trim()}</span>
                    <span className="micro-tag">{d.structuresDestroyed.toLocaleString()} structures</span>
                    <span className="micro-tag">{d.publicPolicyLegacy.reforms.length} policy reforms</span>
                  </div>
                </button>
              );
            })}

          {activeTab === 'year_fires' &&
            (filteredFiresList.length === 0 ? (
              <div style={{ padding: '18px 12px', textAlign: 'center', fontSize: '0.78rem', color: '#847b6e' }}>
                No recorded perimeters match the current year/cause filter. Try switching to Cumulative History or
                selecting a major fire year (e.g. 2020, 2017, 2018, 2015, 1981).
              </div>
            ) : (
              filteredFiresList.slice(0, 80).map((f) => {
                const p = f.properties;
                const isSel = selectedFire?.properties.id === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    className={`landmark-card ${isSel ? 'selected' : ''}`}
                    onClick={() => onSelectFire(f)}
                  >
                    <div className="landmark-card-top">
                      <span className="landmark-year-badge">{p.year}</span>
                      <span className="landmark-acres">
                        {p.acres.toLocaleString('en-US', { maximumFractionDigits: 1 })} ac
                      </span>
                    </div>
                    <div className="landmark-title">
                      {p.name} Fire {p.complexName ? `(${p.complexName})` : ''}
                    </div>
                    <div className="landmark-tags">
                      <span className="micro-tag">{p.cause}</span>
                      <span className="micro-tag">{p.agencyCode}</span>
                      {p.alarmDate && <span className="micro-tag">{p.alarmDate}</span>}
                    </div>
                  </button>
                );
              })
            ))}

          {activeTab === 'policy_timeline' &&
            allPolicies.map(({ dossier, reform }) => (
              <button
                key={reform.code}
                type="button"
                className="landmark-card"
                onClick={() => onSelectLandmarkDossier(dossier)}
              >
                <div className="landmark-card-top">
                  <span className="landmark-year-badge" style={{ background: 'rgba(74,222,128,0.18)', color: '#86efac' }}>
                    Enacted {reform.yearEnacted}
                  </span>
                  <span className="micro-tag">{reform.jurisdiction}</span>
                </div>
                <div className="landmark-title" style={{ color: '#86efac' }}>
                  {reform.code}
                </div>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#f6f2eb' }}>{reform.title}</div>
                <div className="landmark-sub">{reform.summary}</div>
                <div className="landmark-tags">
                  <span className="micro-tag" style={{ color: '#fdba74' }}>
                    Triggered by: {dossier.displayName} ({dossier.year}) →
                  </span>
                </div>
              </button>
            ))}
        </div>
      </div>
    </aside>
  );
};

interface BottomTimelineDockProps {
  firesData: FireGeoJSON | null;
  selectedYear: number;
  isPlayingYears: boolean;
  playbackSpeedMs: number;
  onSelectYear: (yr: number) => void;
  onTogglePlayYears: () => void;
  onStepYear: (delta: number) => void;
  onResetTimeline: () => void;
  onWatchSpecificYear: (yr: number) => void;
}

const EPOCH_PRESETS = [
  { label: '1964 Hanly Siege', year: 1964 },
  { label: '1981 Atlas Peak', year: 1981 },
  { label: '2004 Rumsey', year: 2004 },
  { label: '2015 Drought Siege', year: 2015 },
  { label: '2017 Wine Country Firestorm', year: 2017 },
  { label: '2018 County Fire', year: 2018 },
  { label: '2020 LNU & Glass Megafires', year: 2020 },
  { label: '2025 Pickett Reburn', year: 2025 }
];

export const BottomTimelineDock: React.FC<BottomTimelineDockProps> = ({
  firesData,
  selectedYear,
  isPlayingYears,
  onSelectYear,
  onTogglePlayYears,
  onStepYear,
  onResetTimeline,
  onWatchSpecificYear
}) => {
  const yearsRange = useMemo(() => {
    const arr: number[] = [];
    for (let y = 1964; y <= 2025; y++) arr.push(y);
    return arr;
  }, []);

  const annualTotals = useMemo(() => {
    const map = new Map<number, { acres: number; count: number }>();
    for (let y = 1964; y <= 2025; y++) map.set(y, { acres: 0, count: 0 });
    if (firesData) {
      for (const f of firesData.features) {
        const cur = map.get(f.properties.year);
        if (cur) {
          cur.acres += f.properties.acres;
          cur.count += 1;
        }
      }
    }
    return map;
  }, [firesData]);

  const currentYearInfo = annualTotals.get(selectedYear) || { acres: 0, count: 0 };

  return (
    <footer className="bottom-timeline-dock" id="bottom-timeline-dock">
      <div className="timeline-controls-row">
        {/* Playback Controls */}
        <div className="playback-cluster">
          <button
            type="button"
            id="btn-play-60yr-timeline"
            className="play-btn"
            onClick={onTogglePlayYears}
          >
            {isPlayingYears ? <Pause size={14} /> : <Play size={14} />}
            <span>{isPlayingYears ? 'Pause Timeline' : 'Play 60-Year History'}</span>
          </button>

          <button
            type="button"
            className="icon-btn"
            title="Previous Year"
            onClick={() => onStepYear(-1)}
          >
            <SkipBack size={14} />
          </button>
          <button
            type="button"
            className="icon-btn"
            title="Next Year"
            onClick={() => onStepYear(1)}
          >
            <SkipForward size={14} />
          </button>
          <button
            type="button"
            className="icon-btn"
            title="Reset to Full 2025 View"
            onClick={onResetTimeline}
          >
            <RotateCcw size={14} />
          </button>

          {/* Direct Year Selector & "Watch This Year" Trigger */}
          <div className="year-readout-box">
            <label htmlFor="select-specific-year" style={{ fontSize: '0.7rem', color: '#847b6e' }}>
              YEAR:
            </label>
            <select
              id="select-specific-year"
              className="year-Jump-select"
              value={selectedYear}
              onChange={(e) => onSelectYear(Number(e.target.value))}
            >
              {yearsRange.map((y) => {
                const info = annualTotals.get(y);
                const ac = info?.acres || 0;
                return (
                  <option key={y} value={y}>
                    {y} {ac > 0 ? `(${Math.round(ac).toLocaleString()} ac)` : '(Quiet)'}
                  </option>
                );
              })}
            </select>
            <span className="year-stats-inline">
              {currentYearInfo.count} fires •{' '}
              <strong style={{ color: '#fff7ed' }}>
                {Math.round(currentYearInfo.acres).toLocaleString()} ac
              </strong>
            </span>
            <button
              type="button"
              id="btn-watch-selected-year"
              className="epoch-btn active"
              style={{ marginLeft: 4 }}
              onClick={() => onWatchSpecificYear(selectedYear)}
              title="Isolate and animate the fires of this specific year"
            >
              Watch {selectedYear}
            </button>
          </div>
        </div>

        {/* Landmark Fire Year Quick-Jump Presets */}
        <div className="epoch-presets">
          {EPOCH_PRESETS.map((ep) => (
            <button
              key={ep.year}
              type="button"
              className={`epoch-btn ${selectedYear === ep.year ? 'active' : ''}`}
              onClick={() => onWatchSpecificYear(ep.year)}
            >
              {ep.label}
            </button>
          ))}
        </div>
      </div>

      {/* 1964-2025 Interactive Annual Burned Acres Bar Scrubber */}
      <div className="histogram-container" role="slider" aria-valuenow={selectedYear} aria-valuemin={1964} aria-valuemax={2025}>
        {yearsRange.map((yr) => {
          const info = annualTotals.get(yr) || { acres: 0, count: 0 };
          // Square-root scale so moderate fire years (5,000-40,000 ac) are clearly visible alongside 2020 (375,000 ac)
          const maxSqrt = Math.sqrt(376000);
          const heightPct = info.acres > 0 ? Math.max(12, Math.min(100, (Math.sqrt(info.acres) / maxSqrt) * 100)) : 5;
          const isSelected = yr === selectedYear;
          const isPast = yr < selectedYear;

          let barColor = 'rgba(132, 123, 110, 0.28)';
          if (isSelected) {
            barColor = '#fb923c';
          } else if (info.acres >= 50000) {
            barColor = isPast ? '#ef4444' : 'rgba(239, 68, 68, 0.45)';
          } else if (info.acres >= 5000) {
            barColor = isPast ? '#f59e0b' : 'rgba(245, 158, 11, 0.4)';
          } else if (info.acres > 0) {
            barColor = isPast ? '#b45309' : 'rgba(180, 83, 9, 0.35)';
          }

          const showTick = yr === 1964 || yr % 5 === 0 || yr === 2017 || yr === 2025;

          return (
            <div
              key={yr}
              className={`hist-bar-col ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelectYear(yr)}
              title={`${yr}: ${info.count} fires, ${Math.round(info.acres).toLocaleString()} acres burned`}
            >
              <div
                className="hist-bar"
                style={{
                  height: `${heightPct}%`,
                  backgroundColor: barColor,
                  boxShadow: isSelected ? '0 0 10px #f97316' : 'none'
                }}
              />
              <span className="hist-year-tick">{showTick ? yr : ''}</span>
            </div>
          );
        })}
      </div>
    </footer>
  );
};
