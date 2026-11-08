import React from 'react';
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
  Calendar,
  AlertTriangle
} from 'lucide-react';
import type { FireFeature } from '../types/fire';
import type { LandmarkDossier } from '../data/landmarkFires';
import { generateContextualBrief } from '../utils/fireEnrichment';

interface DossierPanelProps {
  selectedFire: FireFeature | null;
  activeDossier: LandmarkDossier | null;
  evolutionStageIdx: number;
  isWatchingEvolution: boolean;
  onSelectStage: (idx: number) => void;
  onToggleWatchEvolution: () => void;
}

export const DossierPanel: React.FC<DossierPanelProps> = ({
  selectedFire,
  activeDossier,
  evolutionStageIdx,
  isWatchingEvolution,
  onSelectStage,
  onToggleWatchEvolution
}) => {
  if (!selectedFire && !activeDossier) {
    return (
      <aside className="right-dossier-drawer glass-panel" id="dossier-panel-empty">
        <div className="dossier-header">
          <div className="dossier-eyebrow">
            <span className="badge-pill year">NAPA VALLEY FIRE ARCHIVE</span>
          </div>
          <h2 className="dossier-title">Select a Wildfire Perimeter or Landmark Event</h2>
          <p className="dossier-subtitle">
            Click any fire polygon on the map or choose a Landmark Callout on the left to inspect its ignition cause,
            day-by-day evolution, tactical response, how it was extinguished, and resulting California public policy reforms.
          </p>
        </div>
      </aside>
    );
  }

  // Render full curated Landmark Dossier when available
  if (activeDossier) {
    const stage =
      activeDossier.progressionStages[
        Math.min(evolutionStageIdx, activeDossier.progressionStages.length - 1)
      ];

    return (
      <aside className="right-dossier-drawer glass-panel" id="dossier-panel-landmark">
        {/* Header */}
        <div className="dossier-header">
          <div className="dossier-eyebrow">
            <div className="dossier-badge-group">
              <span className="badge-pill year">{activeDossier.year}</span>
              <span className="badge-pill cause">{activeDossier.causeAnalysis.officialCause.split('(')[0]}</span>
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#bfb6a8' }}>
              {activeDossier.durationDays} Days Active
            </span>
          </div>

          <h2 className="dossier-title">{activeDossier.displayName}</h2>
          <p className="dossier-subtitle">{activeDossier.subtitle}</p>

          <div className="dossier-metrics-grid">
            <div className="metric-box">
              <span className="metric-box-label">GIS Burned</span>
              <span className="metric-box-val" style={{ color: '#fb923c' }}>
                {activeDossier.acresBurned.toLocaleString('en-US', { maximumFractionDigits: 0 })} ac
              </span>
            </div>
            <div className="metric-box">
              <span className="metric-box-label">Structures Lost</span>
              <span className="metric-box-val" style={{ color: '#fca5a5' }}>
                {activeDossier.structuresDestroyed.toLocaleString()}
              </span>
            </div>
            <div className="metric-box">
              <span className="metric-box-label">Peak Forces</span>
              <span className="metric-box-val">{activeDossier.peakPersonnel.toLocaleString()} crew</span>
            </div>
            <div className="metric-box">
              <span className="metric-box-label">Peak Gusts</span>
              <span className="metric-box-val" style={{ color: '#fcd34d' }}>
                {activeDossier.peakWindGustMph} mph
              </span>
            </div>
          </div>
        </div>

        {/* Multi-Day Evolution Theatre Player */}
        <div className="evolution-player-box">
          <div className="evolution-top-row">
            <div className="evolution-title">
              <Flame size={15} />
              <span>HOW THE FIRE EVOLVED ({activeDossier.progressionStages.length} STAGES)</span>
            </div>
            <button
              type="button"
              className="watch-btn"
              id="btn-watch-fire-evolution"
              onClick={onToggleWatchEvolution}
            >
              {isWatchingEvolution ? <Pause size={13} /> : <Play size={13} />}
              <span>{isWatchingEvolution ? 'Pause Evolution' : 'Watch Fire Spread'}</span>
            </button>
          </div>

          <div className="stage-Track">
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

          {stage && (
            <div className="stage-narrative-card">
              <div className="stage-narrative-head">
                <span>
                  {stage.dateLabel}: {stage.title}
                </span>
              </div>
              <div className="stage-weather-badges">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                  <Flame size={11} /> {stage.acres.toLocaleString()} ac ({stage.containmentPct}% Contained)
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                  <Wind size={11} /> {stage.windMph}
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                  <Droplets size={11} /> {stage.relHumidityPct}% RH
                </span>
              </div>
              <p className="stage-narrative-body">{stage.narrative}</p>
              <div className="stage-milestone">↳ Tactical Milestone: {stage.tacticalMilestone}</div>
            </div>
          )}
        </div>

        {/* Scrollable 4 Investigative Pillars */}
        <div className="dossier-scroll-body">
          {/* Pillar 1: Cause & Preconditions */}
          <section className="pillar-card">
            <div className="pillar-header cause">
              <AlertTriangle size={15} />
              <span>1. Ignition Cause & Environmental Preconditions</span>
            </div>
            <div className="pillar-field">
              <span className="pillar-field-label">Origin Point & Weather Event</span>
              <p className="pillar-field-text">
                <strong>{activeDossier.ignitionLocationLabel}</strong> • {activeDossier.windEventType} (Min RH:{' '}
                {activeDossier.minHumidityPct}%)
              </p>
            </div>
            <div className="pillar-field">
              <span className="pillar-field-label">Ignition Mechanism</span>
              <p className="pillar-field-text">{activeDossier.causeAnalysis.ignitionMechanism}</p>
            </div>
            <div className="pillar-field">
              <span className="pillar-field-label">CAL FIRE / CPUC Investigative Findings</span>
              <p className="pillar-field-text">{activeDossier.causeAnalysis.investigativeFindings}</p>
            </div>
            <div className="pillar-field">
              <span className="pillar-field-label">Topography & Fuel Preconditions</span>
              <p className="pillar-field-text">{activeDossier.causeAnalysis.environmentalPreconditions}</p>
            </div>
          </section>

          {/* Pillar 2: How the Fire Was Responded To */}
          <section className="pillar-card">
            <div className="pillar-header response">
              <ShieldAlert size={15} />
              <span>2. Emergency Response & Tactical Deployment</span>
            </div>
            <div className="pillar-field">
              <span className="pillar-field-label">Incident Command & Peak Force</span>
              <p className="pillar-field-text">
                <strong>{activeDossier.tacticalResponse.leadAgency}</strong> •{' '}
                {activeDossier.peakPersonnel.toLocaleString()} personnel, {activeDossier.peakEngines} engines,{' '}
                {activeDossier.peakAircraft} helicopters/airtankers ({activeDossier.suppressionCostUSD} suppression cost)
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
          </section>

          {/* Pillar 3: How the Fire Went Out */}
          <section className="pillar-card">
            <div className="pillar-header extinguish">
              <CloudRainWind size={15} />
              <span>3. How the Fire Went Out & Containment Lines</span>
            </div>
            <div className="pillar-field">
              <span className="pillar-field-label">Meteorological Shift</span>
              <p className="pillar-field-text">{activeDossier.howItWentOut.weatherShift}</p>
            </div>
            <div className="pillar-field">
              <span className="pillar-field-label">Decisive Control Lines</span>
              <p className="pillar-field-text">{activeDossier.howItWentOut.decisiveContainmentLines}</p>
            </div>
            <div className="pillar-field">
              <span className="pillar-field-label">Role of Vineyards, Lakes & Prior Burn Scars</span>
              <p className="pillar-field-text">{activeDossier.howItWentOut.fuelBarriersAndVineyards}</p>
            </div>
          </section>

          {/* Pillar 4: Public Policy Changes Enacted After */}
          <section className="pillar-card">
            <div className="pillar-header policy">
              <Scale size={15} />
              <span>4. Public Policy & Regulatory Reforms Enacted After</span>
            </div>
            <p className="pillar-field-text">{activeDossier.publicPolicyLegacy.overview}</p>
            {activeDossier.publicPolicyLegacy.reforms.map((ref) => (
              <div key={ref.code} className="policy-reform-item">
                <div className="policy-reform-top">
                  <span className="policy-code">
                    {ref.code} ({ref.yearEnacted})
                  </span>
                  <span className="policy-jurisdiction">{ref.jurisdiction}</span>
                </div>
                <div className="policy-reform-title">{ref.title}</div>
                <p className="policy-reform-desc">{ref.summary}</p>
                <div className="policy-impact">↳ Impact: {ref.longTermImpact}</div>
              </div>
            ))}
          </section>
        </div>
      </aside>
    );
  }

  // Render synthesized investigative dossier for any of the other 250+ historical CAL FIRE perimeters
  const p = selectedFire!.properties;
  const brief = generateContextualBrief(p);

  return (
    <aside className="right-dossier-drawer glass-panel" id="dossier-panel-standard">
      <div className="dossier-header">
        <div className="dossier-eyebrow">
          <div className="dossier-badge-group">
            <span className="badge-pill year">{p.year}</span>
            <span className="badge-pill cause">{p.cause}</span>
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#bfb6a8' }}>
            OBJECTID #{p.objectId}
          </span>
        </div>

        <h2 className="dossier-title">
          {p.name} Fire {p.complexName ? `(${p.complexName})` : ''}
        </h2>
        <p className="dossier-subtitle">
          CAL FIRE FRAP Historical Perimeter • {p.agency} ({p.unitId} Unit) • Mapped via {p.collectionMethod}
        </p>

        <div className="dossier-metrics-grid">
          <div className="metric-box">
            <span className="metric-box-label">GIS Acres</span>
            <span className="metric-box-val" style={{ color: '#fb923c' }}>
              {p.acres.toLocaleString('en-US', { maximumFractionDigits: 1 })} ac
            </span>
          </div>
          <div className="metric-box">
            <span className="metric-box-label">Alarm Date</span>
            <span className="metric-box-val">{p.alarmDate || `${p.year}`}</span>
          </div>
          <div className="metric-box">
            <span className="metric-box-label">Contained</span>
            <span className="metric-box-val">{p.containmentDate || 'Historical'}</span>
          </div>
          <div className="metric-box">
            <span className="metric-box-label">Scale Tier</span>
            <span className="metric-box-val" style={{ textTransform: 'capitalize' }}>
              {p.scaleTier}
            </span>
          </div>
        </div>
      </div>

      <div className="dossier-scroll-body">
        <section className="pillar-card">
          <div className="pillar-header cause">
            <AlertTriangle size={15} />
            <span>1. Ignition Cause: {brief.causeHeadline}</span>
          </div>
          <p className="pillar-field-text">{brief.causeAnalysis}</p>
        </section>

        <section className="pillar-card">
          <div className="pillar-header response">
            <ShieldAlert size={15} />
            <span>2. Agency Response: {brief.responseHeadline}</span>
          </div>
          <p className="pillar-field-text">{brief.responseAnalysis}</p>
        </section>

        <section className="pillar-card">
          <div className="pillar-header extinguish">
            <CloudRainWind size={15} />
            <span>3. Containment & Extinguishment: {brief.extinguishHeadline}</span>
          </div>
          <p className="pillar-field-text">{brief.extinguishAnalysis}</p>
        </section>

        <section className="pillar-card">
          <div className="pillar-header policy">
            <Scale size={15} />
            <span>4. Policy Era: {brief.policyHeadline}</span>
          </div>
          <p className="pillar-field-text">{brief.policyAnalysis}</p>
        </section>

        <div
          style={{
            padding: '10px 12px',
            borderRadius: 8,
            background: 'rgba(249, 115, 22, 0.08)',
            border: '1px solid rgba(249, 115, 22, 0.25)',
            fontSize: '0.75rem',
            color: '#bfb6a8',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          <MapPin size={14} color="#fb923c" />
          <span>
            Perimeter Centroid: {p.centroid[1].toFixed(4)}°N, {Math.abs(p.centroid[0]).toFixed(4)}°W
          </span>
          <Calendar size={14} color="#fb923c" style={{ marginLeft: 'auto' }} />
          <span>Decade: {p.decade}</span>
        </div>
      </div>
    </aside>
  );
};
