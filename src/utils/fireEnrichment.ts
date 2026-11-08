import type { FireProperties } from '../types/fire';
import { LANDMARK_DOSSIERS, type LandmarkDossier } from '../data/landmarkFires';

export function findDossierForFire(props: FireProperties): LandmarkDossier | undefined {
  // Exact match by rawName and year
  const exact = LANDMARK_DOSSIERS.find(
    (d) => d.year === props.year && props.rawName.includes(d.matchRawName)
  );
  if (exact) return exact;

  // Check if part of 2015 LNU Drought Siege (Rocky, Jerusalem, Wragg -> link to 2015 Valley/Drought Siege dossier)
  if (props.year === 2015 && ['ROCKY', 'JERUSALEM', 'WRAGG'].includes(props.rawName)) {
    return LANDMARK_DOSSIERS.find((d) => d.id === '2015-VALLEY');
  }
  // Check if 1964 Nuns Canyon or Roadside -> link to 1964 Hanly & Nuns Canyon dossier
  if (props.year === 1964 && ['NUNS CANYON', 'ROADSIDE #42'].includes(props.rawName)) {
    return LANDMARK_DOSSIERS.find((d) => d.id === '1964-C._HANLY');
  }
  // Check if 1999 Sixteen Fire -> link to Rumsey/Sixteen dossier
  if (props.year === 1999 && props.rawName === 'SIXTEEN') {
    return LANDMARK_DOSSIERS.find((d) => d.id === '2004-RUMSEY');
  }
  return undefined;
}

export interface GeneratedBrief {
  causeHeadline: string;
  causeAnalysis: string;
  responseHeadline: string;
  responseAnalysis: string;
  extinguishHeadline: string;
  extinguishAnalysis: string;
  policyHeadline: string;
  policyAnalysis: string;
}

export function generateContextualBrief(props: FireProperties): GeneratedBrief {
  const acresStr = props.acres.toLocaleString('en-US', { maximumFractionDigits: 1 });
  const durationStr = props.durationDays ? `${props.durationDays} days` : 'multi-day tactical period';

  // Cause synthesis
  let causeAnalysis = `Recorded in the CAL FIRE FRAP historical archive under "${props.cause}" (${props.alarmDate ? `Alarm Date: ${props.alarmDate}` : `Year: ${props.year}`}). `;
  if (props.causeDetail) {
    causeAnalysis += `Official incident notes: ${props.causeDetail}. `;
  }
  if (props.cause.includes('Electrical')) {
    causeAnalysis += 'High winds and low fuel moisture drove rapid spotting from energized conductor contact across cured grass and chaparral.';
  } else if (props.cause === 'Arson') {
    causeAnalysis += 'Intentionally ignited along a rural road corridor during high fire-danger weather, prompting CAL FIRE law enforcement investigation.';
  } else if (props.cause === 'Lightning') {
    causeAnalysis += 'Sparked by dry thunderstorm downdrafts on remote ridge terrain in the Sonoma-Lake-Napa Unit.';
  } else if (props.cause === 'Equipment Use' || props.cause === 'Vehicle') {
    causeAnalysis += 'Mechanical spark or hot exhaust contacted cured annual grasses along the wildland-urban or agricultural interface.';
  } else {
    causeAnalysis += 'Ignited in seasonal brush and oak woodland fuels typical of the Napa County hillside interface.';
  }

  // Response synthesis
  const responseAnalysis = `Lead jurisdiction: ${props.agency} (${props.unitId} Unit). ${
    props.acres >= 5000
      ? `As a major ${acresStr}-acre wildfire, suppression required multi-county strike teams, bulldozer line construction along ridgelines, and aerial retardant drops to protect nearby valleys and agricultural estates.`
      : `Engine strike teams, hand crews, and LNU air attack contained the perimeter at ${acresStr} acres using direct hose lays and dozer scratch lines.`
  }`;

  // How it went out synthesis
  const extinguishAnalysis = `${
    props.containmentDate
      ? `Declared contained on ${props.containmentDate} after an active burn window of ${durationStr}. `
      : `Contained following ${durationStr} of perimeter control operations. `
  }Forward spread was halted by anchoring mineral-soil control lines into county roads, natural drainage breaks, and irrigated Napa vineyard blocks as coastal marine humidity recovered.`;

  // Era-specific policy context
  let policyHeadline = 'California & Napa County Fire Policy Context';
  let policyAnalysis = '';
  if (props.year < 1982) {
    policyHeadline = 'Pre-PRC § 4290 Era → Led to 1982 SRA Fire Safe Regulations';
    policyAnalysis = 'Fires of the 1964–1981 era exposed the lack of standardized rural driveway widths, water tank reserves, and brush clearance, directly driving California Public Resources Code § 4290 (1982).';
  } else if (props.year <= 2014) {
    policyHeadline = 'CDF / CAL FIRE Watershed Mapping & Local Fire Safe Council Era';
    policyAnalysis = 'Demonstrated recurring fire corridors in eastern Napa (Blue Ridge / Berryessa) and western ridges, spurring formation of the Napa Communities Firewise Foundation (NCFF) and Chapter 7A WUI building codes (2008).';
  } else if (props.year <= 2019) {
    policyHeadline = '2015–2019 Megafire Era → SB 901, SB 833 & CPUC PSPS Overhaul';
    policyAnalysis = 'Part of the historic 2015–2019 Northern California fire siege that drove Senate Bill 901 (utility Wildfire Mitigation Plans), SB 833 (Wireless Emergency Alerts), and Cal OES weather-driven engine pre-positioning.';
  } else {
    policyHeadline = 'Post-2020 Modern Era → Zonehaven Polygons, AB 38 Zone 0 & FIRIS Night Ops';
    policyAnalysis = 'Managed under modern post-2020 reforms including FIRIS real-time infrared aircraft mapping, night-flying helitankers, Zonehaven/Genasys polygon evacuations, and Napa County strategic shaded fuel breaks.';
  }

  return {
    causeHeadline: props.cause,
    causeAnalysis,
    responseHeadline: `${props.agency} (${props.unitId})`,
    responseAnalysis,
    extinguishHeadline: props.containmentDate ? `Contained ${props.containmentDate}` : `Contained (${props.year})`,
    extinguishAnalysis,
    policyHeadline,
    policyAnalysis
  };
}
