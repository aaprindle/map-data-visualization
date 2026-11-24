import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Flame,
  Search,
  Layers,
  Eye,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Sparkles,
  X,
  Filter,
  Award,
  Scale,
  Mountain,
  Wind,
  Wine,
  Building2,
  Zap,
  Route,
  Orbit,
  PanelLeftClose,
  PanelLeftOpen,
  SlidersHorizontal
} from 'lucide-react';
import type {
  BasemapStyle,
  FireFeature,
  FireGeoJSON,
  LayerToggles,
  ViewMode
} from '../types/fire';
import { LANDMARK_DOSSIERS, type LandmarkDossier } from '../data/landmarkFires';

interface HeaderBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  searchResults: Array<{
    type: 'fire' | 'policy' | 'landmark' | 'osm';
    title: string;
    subtitle: string;
    acres?: number;
    year?: number;
    fire?: FireFeature;
    dossier?: LandmarkDossier;
    coords?: [number, number];
  }>;
  onSelectSearchResult: (item: any) => void;
  viewMode: ViewMode;
  onViewModeChange: (m: ViewMode) => void;
  basemap: BasemapStyle;
  onBasemapChange: (b: BasemapStyle) => void;
  layers: LayerToggles;
  onToggleLayer: (key: keyof LayerToggles) => void;
  isOrbiting3D: boolean;
  onToggleOrbit3D: () => void;
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
  layers,
  onToggleLayer,
  isOrbiting3D,
  onToggleOrbit3D
}) => {
  const [focused, setFocused] = useState(false);
  const [layersOpen, setLayersOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const activeOsmCount = [
    layers.osmWineries,
    layers.osmEmergency,
    layers.osmPowerLines,
    layers.osmCorridors
  ].filter(Boolean).length;

  return (
    <header className="top-command-bar" id="top-command-header">
      <div className="brand-cluster">
        <div className="brand-emblem" aria-hidden="true">
          <Flame size={19} />
        </div>
        <div className="brand-titles">
          <h1>Napa Valley Wildfire Atlas</h1>
          <div className="brand-subtitle">
            <span>1964–2025</span>
            <span className="dot-sep">•</span>
            <span className="live-badge">3D TERRAIN + CAL FIRE + OSM</span>
          </div>
        </div>
      </div>

      <div className="header-controls">
        {/* Command Search */}
        <div className="search-box-wrapper">
          <Search size={14} className="search-icon" />
          <input
            ref={inputRef}
            id="universal-fire-search"
            type="text"
            className="search-input"
            placeholder="Search fire, year, winery, SB 901... (⌘K)"
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
                <div className="search-empty">
                  No matching fires, OSM wineries, causes, or policies found.
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
                      <div className="search-result-title">{item.title}</div>
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
          >
            <Layers size={13} />
            <span>Cumulative</span>
          </button>
          <button
            type="button"
            id="mode-btn-single-year"
            className={`mode-pill ${viewMode === 'single_year' ? 'active' : ''}`}
            onClick={() => onViewModeChange('single_year')}
          >
            <Eye size={13} />
            <span>Watch Year</span>
          </button>
          <button
            type="button"
            id="mode-btn-reburn"
            className={`mode-pill ${viewMode === 'reburn_matrix' ? 'active' : ''}`}
            onClick={() => onViewModeChange('reburn_matrix')}
          >
            <Sparkles size={13} />
            <span>Reburn</span>
          </button>
        </div>

        {/* 3D Terrain, Wind & Orbit Quick Controls */}
        <div className="mode-pills">
          <button
            type="button"
            className={`mode-pill ${layers.terrain3D ? 'active' : ''}`}
            onClick={() => onToggleLayer('terrain3D')}
            title="Toggle 3D Elevation Terrain & Hillshading"
          >
            <Mountain size={13} />
            <span>3D</span>
          </button>
          <button
            type="button"
            className={`mode-pill ${isOrbiting3D ? 'active' : ''}`}
            onClick={onToggleOrbit3D}
            title="Cinematic 3D Camera Orbit around Napa Valley"
          >
            <Orbit size={13} />
            <span>Orbit</span>
          </button>
          <button
            type="button"
            className={`mode-pill ${layers.windParticles ? 'active' : ''}`}
            onClick={() => onToggleLayer('windParticles')}
            title="Toggle Animated Historical Wind & Ember Flow Field"
          >
            <Wind size={13} />
            <span>Wind</span>
          </button>
        </div>

        {/* Layers & OpenStreetMap Popover Button */}
        <div className="layers-popover-anchor">
          <button
            type="button"
            id="btn-layers-popover"
            className={`layers-trigger-btn ${layersOpen ? 'active' : ''}`}
            onClick={() => setLayersOpen((v) => !v)}
          >
            <SlidersHorizontal size={13} />
            <span>Map & OSM ({activeOsmCount})</span>
          </button>

          {layersOpen && (
            <div className="layers-popover glass-panel">
              <div className="popover-section">
                <div className="popover-heading">Basemap Style</div>
                <div className="basemap-grid">
                  {(
                    [
                      ['dark_terrain', 'Dark 3D'],
                      ['osm_standard', 'OpenStreetMap'],
                      ['topo_relief', 'USGS Topo'],
                      ['satellite_hybrid', 'Satellite']
                    ] as const
                  ).map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      className={`basemap-opt ${basemap === id ? 'active' : ''}`}
                      onClick={() => onBasemapChange(id)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="popover-section">
                <div className="popover-heading">OpenStreetMap Vector Layers</div>
                <div className="layer-toggle-list">
                  <button
                    type="button"
                    className={`layer-toggle-row ${layers.osmWineries ? 'on' : ''}`}
                    onClick={() => onToggleLayer('osmWineries')}
                  >
                    <Wine size={13} color="#fb7185" />
                    <span>OSM Napa Wineries</span>
                    <span className="toggle-dot" />
                  </button>
                  <button
                    type="button"
                    className={`layer-toggle-row ${layers.osmEmergency ? 'on' : ''}`}
                    onClick={() => onToggleLayer('osmEmergency')}
                  >
                    <Building2 size={13} color="#38bdf8" />
                    <span>OSM Fire Stations & Hospitals</span>
                    <span className="toggle-dot" />
                  </button>
                  <button
                    type="button"
                    className={`layer-toggle-row ${layers.osmPowerLines ? 'on' : ''}`}
                    onClick={() => onToggleLayer('osmPowerLines')}
                  >
                    <Zap size={13} color="#facc15" />
                    <span>OSM HV Power Transmission</span>
                    <span className="toggle-dot" />
                  </button>
                  <button
                    type="button"
                    className={`layer-toggle-row ${layers.osmCorridors ? 'on' : ''}`}
                    onClick={() => onToggleLayer('osmCorridors')}
                  >
                    <Route size={13} color="#cbd5e1" />
                    <span>OSM Evacuation Highways</span>
                    <span className="toggle-dot" />
                  </button>
                  <button
                    type="button"
                    className={`layer-toggle-row ${layers.landmarks ? 'on' : ''}`}
                    onClick={() => onToggleLayer('landmarks')}
                  >
                    <Mountain size={13} color="#4ade80" />
                    <span>AVA & Peak Labels</span>
                    <span className="toggle-dot" />
                  </button>
                </div>
              </div>
            </div>
          )}
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
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onSelectLandmarkDossier: (d: LandmarkDossier) => void;
  onSelectFire: (f: FireFeature) => void;
}

const CAUSE_FILTERS = [
  { label: 'All', value: 'ALL' },
  { label: '⚡ Utility', value: 'Electrical Power / Utility' },
  { label: '🌩️ Lightning', value: 'Lightning' },
  { label: '🔥 Arson', value: 'Arson' },
  { label: '🚜 Equip', value: 'Equipment Use' },
  { label: '🚗 Vehicle', value: 'Vehicle' }
];

export const LeftExplorerDrawer: React.FC<LeftExplorerDrawerProps> = ({
  firesData,
  selectedYear,
  viewMode,
  selectedCauseFilter,
  onSelectCauseFilter,
  selectedFire,
  activeDossier,
  isCollapsed,
  onToggleCollapse,
  onSelectLandmarkDossier,
  onSelectFire
}) => {
  const [activeTab, setActiveTab] = useState<'landmarks' | 'year_fires' | 'policy_timeline'>('landmarks');

  const stats = useMemo(() => {
    if (!firesData) return { totalAcres: 0, yearAcres: 0 };
    const allUpToYear = firesData.features.filter((f) => f.properties.year <= selectedYear);
    const inYear = firesData.features.filter((f) => f.properties.year === selectedYear);
    return {
      totalAcres: allUpToYear.reduce((acc, f) => acc + f.properties.acres, 0),
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

  if (isCollapsed) {
    return (
      <button
        type="button"
        className="collapsed-rail-pill left"
        onClick={onToggleCollapse}
        title="Expand Fire Explorer & Callouts"
      >
        <PanelLeftOpen size={15} color="#fb923c" />
        <span>Explorer ({selectedYear})</span>
      </button>
    );
  }

  return (
    <aside className="left-drawer" id="left-explorer-drawer">
      <div className="glass-panel">
        <div className="drawer-top-strip">
          <span className="section-label">
            <Filter size={12} /> Napa Fire Explorer
          </span>
          <button
            type="button"
            className="subtle-icon-btn"
            onClick={onToggleCollapse}
            title="Collapse Explorer to Maximize 3D Map"
          >
            <PanelLeftClose size={14} />
          </button>
        </div>

        <div className="kpi-strip">
          <div className="kpi-cell">
            <span className="kpi-label">Year</span>
            <span className="kpi-value ember">{selectedYear}</span>
          </div>
          <div className="kpi-cell">
            <span className="kpi-label">Season</span>
            <span className="kpi-value">
              {stats.yearAcres >= 1000
                ? `${(stats.yearAcres / 1000).toFixed(1)}k ac`
                : `${Math.round(stats.yearAcres)} ac`}
            </span>
          </div>
          <div className="kpi-cell">
            <span className="kpi-label">1964–{selectedYear}</span>
            <span className="kpi-value">{(stats.totalAcres / 1000).toFixed(0)}k ac</span>
          </div>
        </div>

        <div className="filter-section">
          <div className="cause-chips">
            {CAUSE_FILTERS.map((cf) => (
              <button
                key={cf.value}
                type="button"
                className={`cause-chip ${selectedCauseFilter === cf.value ? 'active' : ''}`}
                onClick={() => onSelectCauseFilter(cf.value)}
              >
                {cf.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-panel landmarks-panel">
        <div className="panel-tabs">
          <button
            type="button"
            className={`panel-tab ${activeTab === 'landmarks' ? 'active' : ''}`}
            onClick={() => setActiveTab('landmarks')}
          >
            <Award size={12} style={{ display: 'inline', marginRight: 4, verticalAlign: -1 }} />
            Landmarks
          </button>
          <button
            type="button"
            className={`panel-tab ${activeTab === 'year_fires' ? 'active' : ''}`}
            onClick={() => setActiveTab('year_fires')}
          >
            Catalog ({filteredFiresList.length})
          </button>
          <button
            type="button"
            className={`panel-tab ${activeTab === 'policy_timeline' ? 'active' : ''}`}
            onClick={() => setActiveTab('policy_timeline')}
          >
            <Scale size={12} style={{ display: 'inline', marginRight: 4, verticalAlign: -1 }} />
            Policies
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
                  className={`landmark-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => onSelectLandmarkDossier(d)}
                >
                  <div className="landmark-card-top">
                    <span className="landmark-year-badge">{d.year}</span>
                    <span className="landmark-acres">
                      {d.acresBurned.toLocaleString('en-US', { maximumFractionDigits: 0 })} ac
                    </span>
                  </div>
                  <div className="landmark-title">{d.displayName}</div>
                  <div className="landmark-sub">{d.subtitle}</div>
                </button>
              );
            })}

          {activeTab === 'year_fires' &&
            (filteredFiresList.length === 0 ? (
              <div className="empty-list-msg">
                No perimeters match this year/cause filter. Switch to Cumulative or pick a major year.
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
                    <div className="landmark-title">{p.name} Fire</div>
                    <div className="landmark-tags">
                      <span className="micro-tag">{p.cause}</span>
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
                  <span className="landmark-year-badge policy">{reform.yearEnacted}</span>
                  <span className="micro-tag">{reform.jurisdiction}</span>
                </div>
                <div className="landmark-title policy-text">{reform.code}</div>
                <div className="landmark-sub">{reform.title}</div>
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
  onSelectYear: (yr: number) => void;
  onTogglePlayYears: () => void;
  onStepYear: (delta: number) => void;
  onResetTimeline: () => void;
  onWatchSpecificYear: (yr: number) => void;
}

const EPOCH_PRESETS = [
  { label: '1964 Hanly', year: 1964 },
  { label: '1981 Atlas Peak', year: 1981 },
  { label: '2015 Drought', year: 2015 },
  { label: '2017 Firestorm', year: 2017 },
  { label: '2018 County', year: 2018 },
  { label: '2020 LNU & Glass', year: 2020 },
  { label: '2025 Pickett', year: 2025 }
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
        <div className="playback-cluster">
          <button
            type="button"
            id="btn-play-60yr-timeline"
            className="play-btn"
            onClick={onTogglePlayYears}
          >
            {isPlayingYears ? <Pause size={13} /> : <Play size={13} />}
            <span>{isPlayingYears ? 'Pause' : 'Play 1964–2025'}</span>
          </button>

          <button type="button" className="icon-btn" title="Previous Year" onClick={() => onStepYear(-1)}>
            <SkipBack size={13} />
          </button>
          <button type="button" className="icon-btn" title="Next Year" onClick={() => onStepYear(1)}>
            <SkipForward size={13} />
          </button>
          <button type="button" className="icon-btn" title="Reset to 2025" onClick={onResetTimeline}>
            <RotateCcw size={13} />
          </button>

          <div className="year-readout-box">
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
                    {y} {ac > 0 ? `(${Math.round(ac).toLocaleString()} ac)` : ''}
                  </option>
                );
              })}
            </select>
            <span className="year-stats-inline">
              {currentYearInfo.count} fires •{' '}
              <strong>{Math.round(currentYearInfo.acres).toLocaleString()} ac</strong>
            </span>
            <button
              type="button"
              id="btn-watch-selected-year"
              className="epoch-btn active"
              onClick={() => onWatchSpecificYear(selectedYear)}
            >
              Watch {selectedYear}
            </button>
          </div>
        </div>

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

      <div className="histogram-container" role="slider" aria-valuenow={selectedYear} aria-valuemin={1964} aria-valuemax={2025}>
        {yearsRange.map((yr) => {
          const info = annualTotals.get(yr) || { acres: 0, count: 0 };
          const maxSqrt = Math.sqrt(376000);
          const heightPct =
            info.acres > 0 ? Math.max(12, Math.min(100, (Math.sqrt(info.acres) / maxSqrt) * 100)) : 5;
          const isSelected = yr === selectedYear;
          const isPast = yr < selectedYear;

          let barColor = 'rgba(132, 123, 110, 0.25)';
          if (isSelected) barColor = '#fb923c';
          else if (info.acres >= 50000) barColor = isPast ? '#ef4444' : 'rgba(239, 68, 68, 0.42)';
          else if (info.acres >= 5000) barColor = isPast ? '#f59e0b' : 'rgba(245, 158, 11, 0.36)';
          else if (info.acres > 0) barColor = isPast ? '#b45309' : 'rgba(180, 83, 9, 0.3)';

          const showTick = yr === 1964 || yr % 10 === 0 || yr === 2017 || yr === 2025;

          return (
            <div
              key={yr}
              className={`hist-bar-col ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelectYear(yr)}
              title={`${yr}: ${info.count} fires, ${Math.round(info.acres).toLocaleString()} acres`}
            >
              <div
                className="hist-bar"
                style={{
                  height: `${heightPct}%`,
                  backgroundColor: barColor,
                  boxShadow: isSelected ? '0 0 8px #f97316' : 'none'
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
