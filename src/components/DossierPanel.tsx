import React, { useMemo, useState } from 'react';
import {
  Flame,
  ShieldAlert,
  CloudRainWind,
  Scale,
  Play,
  Pause,
  Wind,
  Droplets,
  MapPin,
  AlertTriangle,
  ExternalLink,
  Navigation,
  Zap,
  Building2,
  Wine,
  Route,
  X,
  PanelRightClose
} from 'lucide-react';
import type { FireFeature, OsmLineGeoJSON, OsmPoiGeoJSON } from '../types/fire';
import type { LandmarkDossier } from '../data/landmarkFires';
import { generateContextualBrief } from '../utils/fireEnrichment';
import {
  computeSpatialImpact,
  getGoogleStreetViewUrl,
  getMapillaryUrl,
  getOsmUrl
} from '../utils/spatialAnalytics';

interface DossierPanelProps {
  selectedFire: FireFeature | null;
  activeDossier: LandmarkDossier | null;
  osmPois: OsmPoiGeoJSON | null;
  osmPower: OsmLineGeoJSON | null;
  osmRoads: OsmLineGeoJSON | null;
  evolutionStageIdx: number;
  isWatchingEvolution: boolean;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onSelectStage: (idx: number) => void;
  onToggleWatchEvolution: () => void;
  onFlyToPoint: (lon: number, lat: number, zoom?: number) => void;
}

type DossierTab = 'evolution' | 'cause_response' | 'policy' | 'osm_impact';

export const DossierPanel: React.FC<DossierPanelProps> = ({
  selectedFire,
  activeDossier,
  osmPois,
  osmPower,
  osmRoads,
  evolutionStageIdx,
  isWatchingEvolution,
  isCollapsed,
  onToggleCollapse,
  onSelectStage,
  onToggleWatchEvolution,
  onFlyToPoint
}) => {
  const [tab, setTab] = useState<DossierTab>('evolution');

  const spatialImpact = useMemo(
    () =>
      computeSpatialImpact(
        selectedFire,
        osmPois,
        osmPower,
        osmRoads,
        activeDossier?.ignitionOriginCoords
      ),
    [selectedFire, osmPois, osmPower, osmRoads, activeDossier]
  );

  if (isCollapsed) {
    return (
      <button
        type="button"
        className="collapsed-rail-pill right"
        onClick={onToggleCollapse}
        title="Expand Fire Investigative Dossier"
      >
        <Flame size={15} color="#fb923c" />
        <span>{activeDossier ? `${activeDossier.year} ${activeDossier.displayName.split('(')[0].trim()}` : 'Open Dossier'}</span>
      </button>
    );
  }

  if (!selectedFire && !activeDossier) {
    return (
      <aside className="right-dossier-drawer glass-panel" id="dossier-panel-empty">
        <div className="dossier-header">
          <div className="dossier-eyebrow">
            <span className="badge-pill year">NAPA VALLEY ARCHIVE</span>
            <button type="button" className="subtle-icon-btn" onClick={onToggleCollapse} title="Collapse Panel">
              <X size={15} />
            </button>
          </div>
          <h2 className="dossier-title">Select a Wildfire Perimeter</h2>
          <p className="dossier-subtitle">
            Click any of the 259 CAL FIRE perimeters on the 3D terrain map to inspect ignition cause,
            multi-day evolution, tactical response, public policy legacy, and real-time OpenStreetMap impact.
          </p>
        </div>
      </aside>
    );
  }

  const refCoords: [number, number] =
    activeDossier?.ignitionOriginCoords || selectedFire?.properties.centroid || [-122.36, 38.51];
  const refLocationLabel =
    activeDossier?.ignitionLocationLabel ||
    `${selectedFire?.properties.name} Fire Centroid (Napa Watershed)`;

  const p = selectedFire?.properties;
  const brief = !activeDossier && p ? generateContextualBrief(p) : null;
  const stage =
    activeDossier?.progressionStages[
      Math.min(evolutionStageIdx, activeDossier.progressionStages.length - 1)
    ];

  return (
    <aside className="right-dossier-drawer glass-panel" id="dossier-panel">
      {/* Compact Editorial Header */}
      <div className="dossier-header">
        <div className="dossier-eyebrow">
          <div className="dossier-badge-group">
            <span className="badge-pill year">{activeDossier?.year ?? p?.year}</span>
            <span className="badge-pill cause">
              {activeDossier
                ? activeDossier.causeAnalysis.officialCause.split('(')[0].trim()
                : p?.cause}
            </span>
          </div>
          <button
            type="button"
            className="subtle-icon-btn"
            onClick={onToggleCollapse}
            title="Collapse Dossier to Maximize 3D Map"
          >
            <PanelRightClose size={15} />
          </button>
        </div>

        <h2 className="dossier-title">
          {activeDossier ? activeDossier.displayName : `${p?.name} Fire`}
        </h2>
        <p className="dossier-subtitle">
          {activeDossier
            ? activeDossier.subtitle
            : `CAL FIRE FRAP Perimeter • ${p?.agency} (${p?.unitId})`}
        </p>

        {/* Crisp 4-Up Telemetry Strip */}
        <div className="dossier-metrics-grid">
          <div className="metric-box">
            <span className="metric-box-label">Burned</span>
            <span className="metric-box-val ember">
              {(activeDossier?.acresBurned ?? p?.acres ?? 0).toLocaleString('en-US', {
                maximumFractionDigits: 0
              })}{' '}
              ac
            </span>
          </div>
          <div className="metric-box">
            <span className="metric-box-label">
              {activeDossier ? 'Structures' : 'Duration'}
            </span>
            <span className="metric-box-val crimson">
              {activeDossier
                ? activeDossier.structuresDestroyed.toLocaleString()
                : p?.durationDays
                ? `${p.durationDays} days`
                : 'Historical'}
            </span>
          </div>
          <div className="metric-box">
            <span className="metric-box-label">
              {activeDossier ? 'Peak Gusts' : 'Alarm'}
            </span>
            <span className="metric-box-val gold">
              {activeDossier ? `${activeDossier.peakWindGustMph} mph` : p?.alarmDate || p?.year}
            </span>
          </div>
          <div className="metric-box">
            <span className="metric-box-label">OSM Wineries</span>
            <span className="metric-box-val rose">
              {spatialImpact.wineriesInside.length} in / {spatialImpact.wineriesNearby.length} near
            </span>
          </div>
        </div>
      </div>

      {/* 4-Tab Dossier Navigation */}
      <div className="dossier-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          className={`dossier-tab ${tab === 'evolution' ? 'active' : ''}`}
          onClick={() => setTab('evolution')}
        >
          Evolution
        </button>
        <button
          type="button"
          role="tab"
          className={`dossier-tab ${tab === 'cause_response' ? 'active' : ''}`}
          onClick={() => setTab('cause_response')}
        >
          Cause & Ops
        </button>
        <button
          type="button"
          role="tab"
          className={`dossier-tab ${tab === 'policy' ? 'active' : ''}`}
          onClick={() => setTab('policy')}
        >
          Out & Policy
        </button>
        <button
          type="button"
          role="tab"
          className={`dossier-tab ${tab === 'osm_impact' ? 'active' : ''}`}
          onClick={() => setTab('osm_impact')}
        >
          OSM & Street
        </button>
      </div>

      {/* Tab Body */}
      <div className="dossier-scroll-body">
        {/* TAB 1: MULTI-DAY EVOLUTION & OVERVIEW */}
        {tab === 'evolution' && (
          <>
            {activeDossier && stage ? (
              <div className="evolution-player-box">
                <div className="evolution-top-row">
                  <div className="evolution-title">
                    <Flame size={14} />
                    <span>DAY-BY-DAY PROGRESSION</span>
                  </div>
                  <button
                    type="button"
                    className="watch-btn"
                    id="btn-watch-fire-evolution"
                    onClick={onToggleWatchEvolution}
                  >
                    {isWatchingEvolution ? <Pause size={12} /> : <Play size={12} />}
                    <span>{isWatchingEvolution ? 'Pause' : 'Play Spread'}</span>
                  </button>
                </div>

                <div className="stage-track">
                  {activeDossier.progressionStages.map((st, idx) => (
                    <button
                      key={st.day}
                      type="button"
                      className={`stage-step-btn ${idx === evolutionStageIdx ? 'active' : ''}`}
                      onClick={() => onSelectStage(idx)}
                    >
                      Day {st.day}
                    </button>
                  ))}
                </div>

                <div className="stage-narrative-card">
                  <div className="stage-narrative-head">
                    <span>{stage.dateLabel}: {stage.title}</span>
                  </div>
                  <div className="stage-weather-badges">
                    <span><Flame size={11} /> {stage.acres.toLocaleString()} ac ({stage.containmentPct}%)</span>
                    <span><Wind size={11} /> {stage.windMph}</span>
                    <span><Droplets size={11} /> {stage.relHumidityPct}% RH</span>
                  </div>
                  <p className="stage-narrative-body">{stage.narrative}</p>
                  <div className="stage-milestone">↳ {stage.tacticalMilestone}</div>
                </div>
              </div>
            ) : (
              <div className="pillar-card">
                <div className="pillar-header cause">
                  <Flame size={14} />
                  <span>Incident Overview</span>
                </div>
                <p className="pillar-field-text">
                  {brief?.causeAnalysis}
                </p>
              </div>
            )}

            {/* Quick Origin & Street-Level Preview Bar */}
            <div className="pillar-card">
              <div className="pillar-header extinguish">
                <MapPin size={14} />
                <span>Ignition Origin & Street-Level Context</span>
              </div>
              <p className="pillar-field-text">
                <strong>{refLocationLabel}</strong>
                <br />
                <span className="mono-muted">
                  {refCoords[1].toFixed(5)}°N, {Math.abs(refCoords[0]).toFixed(5)}°W
                </span>
              </p>
              <div className="street-links-row">
                <button
                  type="button"
                  className="street-action-btn primary"
                  onClick={() => onFlyToPoint(refCoords[0], refCoords[1], 14.5)}
                >
                  <Navigation size={12} /> Fly 3D Here
                </button>
                <a
                  href={getOsmUrl(refCoords[0], refCoords[1], 15)}
                  target="_blank"
                  rel="noreferrer"
                  className="street-action-btn"
                >
                  OpenStreetMap <ExternalLink size={11} />
                </a>
                <a
                  href={getMapillaryUrl(refCoords[0], refCoords[1])}
                  target="_blank"
                  rel="noreferrer"
                  className="street-action-btn"
                >
                  Mapillary Street <ExternalLink size={11} />
                </a>
                <a
                  href={getGoogleStreetViewUrl(refCoords[0], refCoords[1])}
                  target="_blank"
                  rel="noreferrer"
                  className="street-action-btn"
                >
                  Street View <ExternalLink size={11} />
                </a>
              </div>
            </div>

            {activeDossier && (
              <div className="pillar-card">
                <div className="pillar-header response">
                  <Wine size={14} />
                  <span>Affected Wine Appellations (AVAs)</span>
                </div>
                <div className="ava-pill-list">
                  {activeDossier.avaImpacted.map((ava) => (
                    <span key={ava} className="ava-pill">{ava}</span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* TAB 2: CAUSE & TACTICAL RESPONSE */}
        {tab === 'cause_response' && (
          <>
            <section className="pillar-card">
              <div className="pillar-header cause">
                <AlertTriangle size={14} />
                <span>Ignition Cause & Preconditions</span>
              </div>
              {activeDossier ? (
                <>
                  <div className="pillar-field">
                    <span className="pillar-field-label">Mechanism</span>
                    <p className="pillar-field-text">{activeDossier.causeAnalysis.ignitionMechanism}</p>
                  </div>
                  <div className="pillar-field">
                    <span className="pillar-field-label">Official Investigative Findings</span>
                    <p className="pillar-field-text">{activeDossier.causeAnalysis.investigativeFindings}</p>
                  </div>
                  <div className="pillar-field">
                    <span className="pillar-field-label">Fuel & Weather Preconditions</span>
                    <p className="pillar-field-text">{activeDossier.causeAnalysis.environmentalPreconditions}</p>
                  </div>
                </>
              ) : (
                <p className="pillar-field-text">{brief?.causeAnalysis}</p>
              )}
            </section>

            <section className="pillar-card">
              <div className="pillar-header response">
                <ShieldAlert size={14} />
                <span>Emergency Response & Deployment</span>
              </div>
              {activeDossier ? (
                <>
                  <div className="pillar-field">
                    <span className="pillar-field-label">Lead Command & Peak Force</span>
                    <p className="pillar-field-text">
                      <strong>{activeDossier.tacticalResponse.leadAgency}</strong> •{' '}
                      {activeDossier.peakPersonnel.toLocaleString()} personnel, {activeDossier.peakEngines} engines,{' '}
                      {activeDossier.peakAircraft} aircraft ({activeDossier.suppressionCostUSD})
                    </p>
                  </div>
                  <div className="pillar-field">
                    <span className="pillar-field-label">Initial Attack Challenges</span>
                    <p className="pillar-field-text">{activeDossier.tacticalResponse.initialAttackChallenges}</p>
                  </div>
                  <div className="pillar-field">
                    <span className="pillar-field-label">Air, Dozer & Vineyard Operations</span>
                    <p className="pillar-field-text">{activeDossier.tacticalResponse.airAndGroundOperations}</p>
                  </div>
                  <div className="pillar-field">
                    <span className="pillar-field-label">Evacuations & Mutual Aid</span>
                    <p className="pillar-field-text">{activeDossier.tacticalResponse.mutualAidAndEvacuations}</p>
                  </div>
                </>
              ) : (
                <p className="pillar-field-text">{brief?.responseAnalysis}</p>
              )}
            </section>
          </>
        )}

        {/* TAB 3: HOW IT WENT OUT & PUBLIC POLICY LEGACY */}
        {tab === 'policy' && (
          <>
            <section className="pillar-card">
              <div className="pillar-header extinguish">
                <CloudRainWind size={14} />
                <span>How the Fire Went Out</span>
              </div>
              {activeDossier ? (
                <>
                  <div className="pillar-field">
                    <span className="pillar-field-label">Meteorological Shift</span>
                    <p className="pillar-field-text">{activeDossier.howItWentOut.weatherShift}</p>
                  </div>
                  <div className="pillar-field">
                    <span className="pillar-field-label">Decisive Containment Lines</span>
                    <p className="pillar-field-text">{activeDossier.howItWentOut.decisiveContainmentLines}</p>
                  </div>
                  <div className="pillar-field">
                    <span className="pillar-field-label">Vineyards, Lakes & Prior Burn Scars</span>
                    <p className="pillar-field-text">{activeDossier.howItWentOut.fuelBarriersAndVineyards}</p>
                  </div>
                </>
              ) : (
                <p className="pillar-field-text">{brief?.extinguishAnalysis}</p>
              )}
            </section>

            <section className="pillar-card">
              <div className="pillar-header policy">
                <Scale size={14} />
                <span>Public Policy Changes Enacted After</span>
              </div>
              {activeDossier ? (
                <>
                  <p className="pillar-field-text">{activeDossier.publicPolicyLegacy.overview}</p>
                  {activeDossier.publicPolicyLegacy.reforms.map((ref) => (
                    <div key={ref.code} className="policy-reform-item">
                      <div className="policy-reform-top">
                        <span className="policy-code">{ref.code} ({ref.yearEnacted})</span>
                        <span className="policy-jurisdiction">{ref.jurisdiction}</span>
                      </div>
                      <div className="policy-reform-title">{ref.title}</div>
                      <p className="policy-reform-desc">{ref.summary}</p>
                      <div className="policy-impact">↳ Impact: {ref.longTermImpact}</div>
                    </div>
                  ))}
                </>
              ) : (
                <p className="pillar-field-text">{brief?.policyAnalysis}</p>
              )}
            </section>
          </>
        )}

        {/* TAB 4: LIVE OPENSTREETMAP SPATIAL IMPACT & STREET VIEW */}
        {tab === 'osm_impact' && (
          <>
            {/* Grid & Corridor Exposure */}
            <section className="pillar-card">
              <div className="pillar-header cause">
                <Zap size={14} />
                <span>OSM Infrastructure & Corridor Intersection</span>
              </div>
              <div className="osm-stat-row">
                <div className="osm-stat-chip">
                  <Zap size={13} color="#facc15" />
                  <span>
                    <strong>{spatialImpact.intersectingPowerSegments}</strong> HV Power Segments in Footprint
                  </span>
                </div>
                <div className="osm-stat-chip">
                  <Route size={13} color="#e2e8f0" />
                  <span>
                    <strong>{spatialImpact.intersectingRoads.length}</strong> Major Highways Touched
                  </span>
                </div>
              </div>
              {spatialImpact.intersectingRoads.length > 0 && (
                <div className="ava-pill-list" style={{ marginTop: 4 }}>
                  {spatialImpact.intersectingRoads.map((r) => (
                    <span key={r} className="ava-pill">{r}</span>
                  ))}
                </div>
              )}
            </section>

            {/* Nearest OSM Fire Stations & Hospital */}
            <section className="pillar-card">
              <div className="pillar-header extinguish">
                <Building2 size={14} />
                <span>Nearest OSM Fire Stations & Hospital</span>
              </div>
              {spatialImpact.nearestFireStations.length === 0 ? (
                <p className="pillar-field-text">Loading OpenStreetMap emergency stations...</p>
              ) : (
                <div className="osm-poi-list">
                  {spatialImpact.nearestFireStations.map(({ poi, distanceMiles }) => (
                    <div key={poi.properties.osmId} className="osm-poi-row">
                      <div>
                        <div className="osm-poi-name">{poi.properties.name}</div>
                        <div className="osm-poi-meta">
                          {distanceMiles.toFixed(1)} mi from origin • {poi.properties.address || 'Napa County'}
                        </div>
                      </div>
                      <button
                        type="button"
                        className="osm-jump-btn"
                        onClick={() => onFlyToPoint(poi.properties.lon, poi.properties.lat, 14.5)}
                      >
                        Fly
                      </button>
                    </div>
                  ))}
                  {spatialImpact.nearestHospital && (
                    <div className="osm-poi-row hospital">
                      <div>
                        <div className="osm-poi-name">🏥 {spatialImpact.nearestHospital.poi.properties.name}</div>
                        <div className="osm-poi-meta">
                          {spatialImpact.nearestHospital.distanceMiles.toFixed(1)} mi away • Nearest Hospital
                        </div>
                      </div>
                      <button
                        type="button"
                        className="osm-jump-btn"
                        onClick={() =>
                          onFlyToPoint(
                            spatialImpact.nearestHospital!.poi.properties.lon,
                            spatialImpact.nearestHospital!.poi.properties.lat,
                            14.5
                          )
                        }
                      >
                        Fly
                      </button>
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* OSM Wineries Inside or Near Burn Footprint */}
            <section className="pillar-card">
              <div className="pillar-header response">
                <Wine size={14} />
                <span>
                  OSM Wineries in Burn Scar ({spatialImpact.wineriesInside.length}) & Smoke Zone ({spatialImpact.wineriesNearby.length})
                </span>
              </div>
              {spatialImpact.wineriesInside.length === 0 && spatialImpact.wineriesNearby.length === 0 ? (
                <p className="pillar-field-text">
                  No mapped OSM wineries lie directly inside this remote ridge perimeter.
                </p>
              ) : (
                <div className="osm-poi-list">
                  {spatialImpact.wineriesInside.slice(0, 8).map(({ poi }) => (
                    <div key={poi.properties.osmId} className="osm-poi-row inside">
                      <div>
                        <div className="osm-poi-name">
                          {poi.properties.name} <span className="inside-tag">INSIDE SCAR</span>
                        </div>
                        <div className="osm-poi-meta">{poi.properties.address || 'Napa Valley'}</div>
                      </div>
                      <div className="osm-poi-actions">
                        <button
                          type="button"
                          className="osm-jump-btn"
                          onClick={() => onFlyToPoint(poi.properties.lon, poi.properties.lat, 15)}
                        >
                          3D
                        </button>
                        <a
                          href={getMapillaryUrl(poi.properties.lon, poi.properties.lat)}
                          target="_blank"
                          rel="noreferrer"
                          className="osm-jump-btn"
                          title="Open Mapillary Street-Level Imagery"
                        >
                          Street
                        </a>
                      </div>
                    </div>
                  ))}
                  {spatialImpact.wineriesNearby.slice(0, 6).map(({ poi, distanceMiles }) => (
                    <div key={poi.properties.osmId} className="osm-poi-row">
                      <div>
                        <div className="osm-poi-name">{poi.properties.name}</div>
                        <div className="osm-poi-meta">
                          {distanceMiles.toFixed(1)} mi • Ember / Smoke Exposure Zone
                        </div>
                      </div>
                      <button
                        type="button"
                        className="osm-jump-btn"
                        onClick={() => onFlyToPoint(poi.properties.lon, poi.properties.lat, 15)}
                      >
                        3D
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </aside>
  );
};
