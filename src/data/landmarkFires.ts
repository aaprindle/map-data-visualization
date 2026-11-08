export interface ProgressionStage {
  day: number;
  dateLabel: string;
  title: string;
  acres: number;
  containmentPct: number;
  windMph: string;
  windDir: string;
  relHumidityPct: number;
  narrative: string;
  tacticalMilestone: string;
  center: [number, number];
  spreadRadiusKm: number;
}

export interface PolicyChange {
  code: string;
  title: string;
  yearEnacted: number;
  jurisdiction: 'California State Law' | 'CPUC Utility Mandate' | 'Napa County Ordinance' | 'CAL FIRE Operational Reform';
  summary: string;
  longTermImpact: string;
}

export interface LandmarkDossier {
  id: string;
  matchRawName: string;
  year: number;
  displayName: string;
  subtitle: string;
  subregion: string;
  avaImpacted: string[];
  ignitionDate: string;
  containedDate: string;
  durationDays: number;
  acresBurned: number;
  structuresDestroyed: number;
  structuresDamaged: number;
  fatalities: number;
  suppressionCostUSD: string;
  peakPersonnel: number;
  peakEngines: number;
  peakAircraft: number;
  ignitionOriginCoords: [number, number];
  ignitionLocationLabel: string;
  primarySpreadBearingDeg: number; // Direction wind pushed the fire (degrees clockwise from North)
  windEventType: string;
  peakWindGustMph: number;
  minHumidityPct: number;

  // The 4 deep investigative pillars requested by user:
  causeAnalysis: {
    officialCause: string;
    ignitionMechanism: string;
    investigativeFindings: string;
    environmentalPreconditions: string;
  };
  tacticalResponse: {
    leadAgency: string;
    initialAttackChallenges: string;
    airAndGroundOperations: string;
    mutualAidAndEvacuations: string;
  };
  howItWentOut: {
    containmentDate: string;
    weatherShift: string;
    decisiveContainmentLines: string;
    fuelBarriersAndVineyards: string;
  };
  publicPolicyLegacy: {
    overview: string;
    reforms: PolicyChange[];
  };
  progressionStages: ProgressionStage[];
}

export const LANDMARK_DOSSIERS: LandmarkDossier[] = [
  {
    id: '2020-HENNESSEY',
    matchRawName: 'HENNESSEY',
    year: 2020,
    displayName: 'LNU Lightning Complex (Hennessey Fire)',
    subtitle: 'Largest Wildfire in Napa County Recorded History',
    subregion: 'Hennessey Ridge, Chiles Valley, Pope Valley, Lake Berryessa & Vacaville Foothills',
    avaImpacted: ['Chiles Valley AVA', 'Pope Valley', 'Pritchard Hill', 'Atlas Peak AVA', 'Wooden Valley'],
    ignitionDate: 'August 17, 2020 (06:37 PDT)',
    containedDate: 'October 2, 2020',
    durationDays: 46,
    acresBurned: 305351.9,
    structuresDestroyed: 1491,
    structuresDamaged: 232,
    fatalities: 6,
    suppressionCostUSD: '$94.6 Million',
    peakPersonnel: 2816,
    peakEngines: 342,
    peakAircraft: 26,
    ignitionOriginCoords: [-122.341, 38.502],
    ignitionLocationLabel: 'Hennessey Ridge above Hwy 128 (Napa County)',
    primarySpreadBearingDeg: 75,
    windEventType: 'Remnant Tropical Storm Fausto Dry Lightning Siege + Sundowner Winds',
    peakWindGustMph: 45,
    minHumidityPct: 11,
    causeAnalysis: {
      officialCause: 'Dry Lightning Siege (merged with Arson-sparked Markley Fire)',
      ignitionMechanism: 'Subtropical moisture plume from Tropical Storm Fausto generated over 12,000 dry lightning strikes across Northern California during a record August heat dome.',
      investigativeFindings: 'Five distinct lightning fires in Napa and Lake counties (Hennessey, Gamble, 15-10, Spanish, and Morgan) merged within 48 hours into a massive front, later joining the Markley Fire near Lake Berryessa (which investigators determined was intentionally set by an arsonist attempting to conceal a homicide).',
      environmentalPreconditions: 'Forty-year chaparral and blue-oak woodland fuel accumulation along the Blue Ridge and Vaca Mountains combined with triple-digit temperatures (106°F+) and critically low live fuel moisture.'
    },
    tacticalResponse: {
      leadAgency: 'CAL FIRE Sonoma-Lake-Napa Unit (LNU) Incident Management Team 2',
      initialAttackChallenges: 'Simultaneous ignition of 367 wildfires statewide amidst the COVID-19 pandemic severely rationed engines and hand crews; LNU resources were stretched across five counties at once.',
      airAndGroundOperations: 'Private vineyard management bulldozers (including Pina Vineyard Management) cut emergency miles of cat-lines alongside CAL FIRE dozers above Pope Valley and Aetna Springs. VLATs (Very Large Air Tankers) painted retardant lines along Highway 128 and Berryessa Knoxville Road.',
      mutualAidAndEvacuations: 'Over 45,000 residents evacuated across Napa, Solano, and Lake counties. Emergency Mutual Aid Engines arrived from as far as Utah, Montana, and Texas.'
    },
    howItWentOut: {
      containmentDate: 'September 16 – October 2, 2020',
      weatherShift: 'Influx of a deep Pacific marine layer in early September raised overnight relative humidity recovery above 65% and lowered ridge-top temperatures by 20°F.',
      decisiveContainmentLines: 'Multi-mile bulldozer control lines anchored along Highway 128, Putah Creek, Lake Berryessa shoreline, and Pleasants Valley Road, supported by night-time tactical firing operations.',
      fuelBarriersAndVineyards: 'Lake Berryessa acted as an impenetrable 15-mile eastern water barrier in central Napa, while irrigated valley-floor vineyards along Silverado Trail prevented westward incursion onto the main Napa Valley floor.'
    },
    publicPolicyLegacy: {
      overview: 'The sheer scale of the 2020 LNU Complex exposed the vulnerability of remote rural communities (Berryessa Estates, Pope Valley) and triggered a massive overhaul in countywide fuel reduction and evacuation zone architecture.',
      reforms: [
        {
          code: 'Napa CWPP & Measure L Defensible Space',
          title: 'Napa County Community Wildfire Protection Plan & Fuel Break Network',
          yearEnacted: 2021,
          jurisdiction: 'Napa County Ordinance',
          summary: 'Allocated multi-million dollar county general fund and grant investments to construct 100+ miles of strategic shaded fuel breaks along ridge-top evacuation corridors (Howell Mountain, Atlas Peak, Pope Valley).',
          longTermImpact: 'Created permanent pre-cleared anchor points for bulldozers and engines prior to fire season.'
        },
        {
          code: 'Zonehaven / Genasys Protect',
          title: 'Standardized Polygon Evacuation Zone System',
          yearEnacted: 2021,
          jurisdiction: 'Napa County Ordinance',
          summary: 'Replaced ad-hoc road-by-road evacuation descriptions with pre-mapped numbered tactical zones across Napa County integrated directly with Sheriff and CAL FIRE dispatch.',
          longTermImpact: 'Reduced evacuation order broadcast latency from 45 minutes to under 3 minutes during the 2025 Pickett Fire.'
        },
        {
          code: 'AB 38 / PRC § 4291 Ember Zone 0',
          title: 'California Home Hardening & 0–5 Foot Noncombustible Ember Zone Mandate',
          yearEnacted: 2021,
          jurisdiction: 'California State Law',
          summary: 'Mandated point-of-sale defensible space inspections in High/Very High Fire Hazard Severity Zones and established the "Zone 0" ember-resistant 5-foot perimeter around structures.',
          longTermImpact: 'Addressed wind-blown ember ignitions that accounted for over 75% of structure losses in LNU and Glass fires.'
        }
      ]
    },
    progressionStages: [
      {
        day: 1,
        dateLabel: 'Aug 17, 2020',
        title: 'Dry Lightning Ignition on Hennessey Ridge',
        acres: 12500,
        containmentPct: 0,
        windMph: '25–35 mph NW',
        windDir: 'NW -> E',
        relHumidityPct: 14,
        narrative: 'At 6:37 AM, dry lightning strikes ignite timber and brush on Hennessey Ridge above Lake Hennessey. Erratic downdrafts push flames rapidly east into Chiles Valley and Sage Canyon.',
        tacticalMilestone: 'Immediate mandatory evacuations ordered for Hennessey Ridge, Chiles Pope Valley Rd, and Sage Canyon.',
        center: [-122.341, 38.502],
        spreadRadiusKm: 6.5
      },
      {
        day: 3,
        dateLabel: 'Aug 19, 2020',
        title: 'Confluence into Mega-Complex Across Berryessa',
        acres: 131000,
        containmentPct: 0,
        windMph: '35–45 mph WNW',
        windDir: 'WNW -> ENE',
        relHumidityPct: 11,
        narrative: 'Driven by sundowner winds, the Hennessey, Gamble, and 15-10 fires merge into a single 25-mile front, jumping Highway 128 and consuming Berryessa Highlands and Spanish Flat.',
        tacticalMilestone: 'Markley Fire merges on eastern flank; flames reach Interstate 80 corridor in Solano County.',
        center: [-122.255, 38.545],
        spreadRadiusKm: 19.0
      },
      {
        day: 6,
        dateLabel: 'Aug 22, 2020',
        title: 'Defense of Pope Valley & Angwin Ridge',
        acres: 275000,
        containmentPct: 15,
        windMph: '18–25 mph W',
        windDir: 'W',
        relHumidityPct: 22,
        narrative: 'Firefighters and local vineyard dozer operators cut miles of emergency containment lines along Howell Mountain and Pope Valley to stop the western backing front from entering the main Napa Valley.',
        tacticalMilestone: 'Presidential Major Disaster Declaration (DR-4558) signed; 2,400+ personnel on line.',
        center: [-122.275, 38.610],
        spreadRadiusKm: 26.5
      },
      {
        day: 14,
        dateLabel: 'Aug 30, 2020',
        title: 'Perimeter Firing & Marine Layer Relief',
        acres: 302000,
        containmentPct: 56,
        windMph: '10–15 mph SW',
        windDir: 'SW',
        relHumidityPct: 48,
        narrative: 'Onshore marine air raises relative humidity. Hand crews and helitorches complete strategic firing operations along the northern Knoxville wilderness boundary.',
        tacticalMilestone: 'Western Napa hillside communities cleared for repopulation.',
        center: [-122.282, 38.623],
        spreadRadiusKm: 29.0
      },
      {
        day: 31,
        dateLabel: 'Sep 16, 2020',
        title: 'Full Perimeter Containment',
        acres: 305352,
        containmentPct: 100,
        windMph: '8–12 mph W',
        windDir: 'W',
        relHumidityPct: 55,
        narrative: 'All 305,352 acres within the Hennessey main perimeter are ringed by mineral-soil dozer lines, roads, and Lake Berryessa shoreline.',
        tacticalMilestone: '100% containment achieved just 11 days before the Glass Fire erupts across the valley.',
        center: [-122.282, 38.623],
        spreadRadiusKm: 30.0
      }
    ]
  },
  {
    id: '2020-GLASS',
    matchRawName: 'GLASS',
    year: 2020,
    displayName: 'Glass Fire (2020)',
    subtitle: 'Upvalley Wine Country Siege across Howell Mountain, St. Helena & Calistoga',
    subregion: 'Deer Park, Angwin, St. Helena, Calistoga, Spring Mountain & Santa Rosa East',
    avaImpacted: ['Howell Mountain AVA', 'Spring Mountain District AVA', 'St. Helena AVA', 'Calistoga AVA', 'Diamond Mountain District AVA'],
    ignitionDate: 'September 27, 2020 (03:48 PDT)',
    containedDate: 'October 20, 2020',
    durationDays: 23,
    acresBurned: 67484.4,
    structuresDestroyed: 1555,
    structuresDamaged: 282,
    fatalities: 0,
    suppressionCostUSD: '$84.2 Million',
    peakPersonnel: 2773,
    peakEngines: 408,
    peakAircraft: 23,
    ignitionOriginCoords: [-122.478, 38.554],
    ignitionLocationLabel: 'North Fork Crystal Springs Rd, Deer Park (below Howell Mountain)',
    primarySpreadBearingDeg: 255,
    windEventType: 'Late-September Diablo Offshore Wind Event',
    peakWindGustMph: 52,
    minHumidityPct: 9,
    causeAnalysis: {
      officialCause: 'Undetermined (Investigated for Smoke-Chaser / Holdover & Human Activity)',
      ignitionMechanism: 'Erupted at 3:48 AM in steep timber and brush in North Fork Crystal Springs Canyon near Deer Park under Red Flag offshore Diablo winds.',
      investigativeFindings: 'CAL FIRE investigators spent over a year examining potential holdover embers from the nearby Hennessey Fire, private electrical lines, and human activity along Crystal Springs Road before classifying the exact spark as undetermined.',
      environmentalPreconditions: 'Fuel moisture in Douglas fir, knobcone pine, and chaparral stood at record-low levels (<5% dead fuel moisture) following the hottest August–September in California history.'
    },
    tacticalResponse: {
      leadAgency: 'CAL FIRE LNU / Incident Management Team 4 & Local Municipal Fire Depts',
      initialAttackChallenges: 'Nighttime eruption in steep, narrow Crystal Springs box canyon made direct ground attack impossible as 50 mph gusts spotted embers 1.5 miles ahead across the Silverado Trail.',
      airAndGroundOperations: '66 bulldozers, 408 fire engines, and 23 helicopters battled simultaneous runs up Howell Mountain (destroying Adventist Health Featherute buildings and Chateau Boswell) and west across the Napa Valley floor into Spring Mountain and Sonoma County.',
      mutualAidAndEvacuations: 'Complete evacuation of the City of Calistoga (5,300+ residents), Angwin, Deer Park, and St. Helena hillsides—achieving zero civilian or firefighter fatalities despite 1,555 destroyed structures.'
    },
    howItWentOut: {
      containmentDate: 'October 20, 2020',
      weatherShift: 'Collapse of the Great Basin high-pressure ridge on October 3 allowed cool onshore Pacific fog to penetrate the Napa River corridor.',
      decisiveContainmentLines: 'Bulldozer lines anchored along the Mayacamas crest (Sonoma-Napa county line), Highway 29 corridor, and existing burn scars from the 2017 Tubbs/Nuns fires on the western flank and 2020 Hennessey scar on the eastern flank.',
      fuelBarriersAndVineyards: 'Valley-floor vineyards between St. Helena and Calistoga slowed direct flame-front spread, though spotting jumped the narrow valley via wind-lofted eucalyptus and pine embers.'
    },
    publicPolicyLegacy: {
      overview: 'The Glass Fire devastated iconic Napa Valley wineries (Chateau Boswell, Castello di Amorosa storage, Burgess Cellars, Newton Vineyard) and sparked major policy reforms on private firefighting crews, winery building codes, and agricultural smoke-taint insurance.',
      reforms: [
        {
          code: 'AB 642 & Private Firefighter Regulation',
          title: 'Regulation of Private Contract Firefighting Crews & Illegal Backfires',
          yearEnacted: 2021,
          jurisdiction: 'CAL FIRE Operational Reform',
          summary: 'Following CAL FIRE investigations into unauthorized private firefighting crews setting illegal backfires during the Glass Fire to protect luxury estates, California enacted strict incident-command registration and operational prohibitions on uncoordinated private suppression.',
          longTermImpact: 'Prevented rogue backfires from endangering public strike teams and required private engines to operate strictly under IC authority.'
        },
        {
          code: 'Napa County Code § 15.32 WUI Revisions',
          title: 'Commercial Winery & Hillside Estate WUI Fire-Hardening Standards',
          yearEnacted: 2022,
          jurisdiction: 'Napa County Ordinance',
          summary: 'Upgraded Napa County fire-resistive construction standards for agricultural/winery caves, barrel storage buildings, emergency water tank storage (minimum 2,500–10,000 gal dedicated fire reserve), and 20-foot wide driveway turnouts.',
          longTermImpact: 'Ensured fire engines can safely ingress/egress steep Spring Mountain and Howell Mountain estates during active firestorms.'
        }
      ]
    },
    progressionStages: [
      {
        day: 1,
        dateLabel: 'Sep 27, 2020 (AM)',
        title: '03:48 AM Eruption in Crystal Springs & Run Up Howell Mtn',
        acres: 11000,
        containmentPct: 0,
        windMph: '40–52 mph NE',
        windDir: 'NE -> SW',
        relHumidityPct: 10,
        narrative: 'Igniting before dawn near Deer Park, the Glass Fire explodes upslope into Angwin and simultaneously spots west across Silverado Trail, destroying Chateau Boswell Winery along St. Helena Hwy.',
        tacticalMilestone: 'Emergency evacuation of Deer Park, Angwin, and St. Helena Hospital.',
        center: [-122.485, 38.558],
        spreadRadiusKm: 5.5
      },
      {
        day: 2,
        dateLabel: 'Sep 28, 2020',
        title: 'Boysmark & Shady Fires Merge; Run Across Spring Mountain',
        acres: 36200,
        containmentPct: 0,
        windMph: '45 mph ENE',
        windDir: 'ENE -> WSW',
        relHumidityPct: 9,
        narrative: 'Two secondary ignitions (Shady and Boysen) merge with the main Glass front. Flames cross the Napa Valley floor and race up Spring Mountain and Diamond Mountain toward eastern Santa Rosa.',
        tacticalMilestone: 'Entire City of Calistoga placed under mandatory evacuation order.',
        center: [-122.535, 38.552],
        spreadRadiusKm: 11.2
      },
      {
        day: 5,
        dateLabel: 'Oct 1, 2020',
        title: 'Defense of Calistoga & St. Helena Foothills',
        acres: 58800,
        containmentPct: 6,
        windMph: '25–30 mph NNW',
        windDir: 'NNW',
        relHumidityPct: 18,
        narrative: 'Over 2,700 personnel and 400 engines mount a desperate defense around Calistoga and down the Sonoma Valley flank as another round of dry northerly winds tests dozer lines.',
        tacticalMilestone: 'Governor Newsom tours burned Napa vineyards and pledges accelerated state WUI funding.',
        center: [-122.547, 38.551],
        spreadRadiusKm: 14.5
      },
      {
        day: 10,
        dateLabel: 'Oct 6, 2020',
        title: 'Boxed Between Historic Burn Scars',
        acres: 66800,
        containmentPct: 58,
        windMph: '10–14 mph SW',
        windDir: 'SW',
        relHumidityPct: 52,
        narrative: 'Cool coastal fog arrives. Forward spread is boxed in on the west by the 2017 Tubbs/Nuns burn scars and on the east by the fresh August 2020 Hennessey Fire scar.',
        tacticalMilestone: 'Calistoga and St. Helena evacuation orders downgraded to warnings.',
        center: [-122.547, 38.551],
        spreadRadiusKm: 16.0
      },
      {
        day: 23,
        dateLabel: 'Oct 20, 2020',
        title: '100% Containment Achieved',
        acres: 67484,
        containmentPct: 100,
        windMph: '8 mph W',
        windDir: 'W',
        relHumidityPct: 60,
        narrative: 'After 23 days of intense mop-up in heavy timber on Spring Mountain and Mt. St. Helena, the Glass Fire is declared 100% contained with zero lives lost.',
        tacticalMilestone: 'Watershed Emergency Response Team (WERT) deployed to protect Napa River tributaries from winter debris flows.',
        center: [-122.547, 38.551],
        spreadRadiusKm: 16.5
      }
    ]
  },
  {
    id: '2017-ATLAS',
    matchRawName: 'ATLAS',
    year: 2017,
    displayName: 'Atlas Fire (2017 Wine Country Firestorm)',
    subtitle: 'Deadly Nighttime Diablo Wind Siege on Atlas Peak & Soda Canyon',
    subregion: 'Atlas Peak, Soda Canyon, Silverado Country Club, Wooden Valley & Green Valley',
    avaImpacted: ['Atlas Peak AVA', 'Coombsville AVA', 'Oak Knoll District AVA', 'Wild Horse Valley AVA'],
    ignitionDate: 'October 8, 2017 (21:52 PDT)',
    containedDate: 'October 27, 2017',
    durationDays: 19,
    acresBurned: 51624.7,
    structuresDestroyed: 783,
    structuresDamaged: 120,
    fatalities: 6,
    suppressionCostUSD: '$68.5 Million',
    peakPersonnel: 1920,
    peakEngines: 215,
    peakAircraft: 18,
    ignitionOriginCoords: [-122.264, 38.431],
    ignitionLocationLabel: 'Atlas Peak Road near Foss Valley (Napa County)',
    primarySpreadBearingDeg: 205,
    windEventType: 'Historic October 8–9 Diablo Windstorm (99th Percentile Fosberg Index)',
    peakWindGustMph: 62,
    minHumidityPct: 7,
    causeAnalysis: {
      officialCause: 'PG&E Electrical Power Lines (Tree & Limb Contact)',
      ignitionMechanism: 'Two separate ignitions occurred within minutes of each other along Atlas Peak Road and Hagen Road when unpruned tree branches struck energized PG&E distribution conductors.',
      investigativeFindings: 'CAL FIRE and CPUC Safety and Enforcement Division (SED) investigations concluded PG&E violated state vegetation management standards (General Order 95) and failed to disable automatic circuit reclosers during extreme Red Flag conditions.',
      environmentalPreconditions: 'An atmospheric river winter (2016–17) produced a massive grass crop followed by the hottest summer in California history, topped by a 99th-percentile Diablo wind event (gusts over 60 mph, RH down to 7%).'
    },
    tacticalResponse: {
      leadAgency: 'CAL FIRE LNU & Napa County Fire Department',
      initialAttackChallenges: 'Extreme 60+ mph downslope winds grounded all fixed-wing aircraft on the first night; downed live power lines, exploding propane tanks, and burning trees trapped residents along single-egress Soda Canyon Road and Atlas Peak Road.',
      airAndGroundOperations: 'First responders conducted heroic overnight life-safety rescues under zero-visibility smoke. Once winds eased on October 10, helicopters dropped 11.1M gallons of water and air tankers deployed 3.4M gallons of retardant across the North Bay complex.',
      mutualAidAndEvacuations: 'Over 20,000 residents evacuated from Silverado Country Club, Soda Canyon, Coombsville, and Green Valley. Cell towers burned on Atlas Peak, knocking out 911 and Nixle cell reception in key canyons.'
    },
    howItWentOut: {
      containmentDate: 'October 27, 2017',
      weatherShift: 'Forecasted 40 mph winds on October 12 arrived milder than expected, allowing hand crews and bulldozers to hold the southern perimeter above the City of Napa.',
      decisiveContainmentLines: 'Multi-mile bulldozer firebreaks cut across the Rector Plateau, Milliken Canyon, and Green Valley hillsides, reinforced by irrigated vineyards bordering the Silverado Trail.',
      fuelBarriersAndVineyards: 'Vineyard blocks along Silverado Country Club and Oak Knoll served as crucial defensible buffers where engine strike teams made successful structure-protection stands.'
    },
    publicPolicyLegacy: {
      overview: 'Together with the concurrent Tubbs and Nuns fires, the 2017 Atlas Fire fundamentally transformed California utility law, emergency cell-alert protocols, and wildfire liability.',
      reforms: [
        {
          code: 'SB 901 (Dodd, 2018) & AB 1054 (2019)',
          title: 'Mandatory Utility Wildfire Mitigation Plans & Office of Energy Infrastructure Safety',
          yearEnacted: 2018,
          jurisdiction: 'California State Law',
          summary: 'Authored by Napa State Senator Bill Dodd, SB 901 mandated annual utility Wildfire Mitigation Plans (WMPs), aggressive vegetation clearance, grid hardening, and tied utility executive compensation to safety performance.',
          longTermImpact: 'Triggered PG&E Chapter 11 bankruptcy restructuring ($30B liability) and systemic undergrounding of high-risk Napa distribution lines.'
        },
        {
          code: 'CPUC PSPS & Fast-Trip Recloser Rules',
          title: 'Public Safety Power Shutoffs (PSPS) & Automatic Recloser Disabling',
          yearEnacted: 2018,
          jurisdiction: 'CPUC Utility Mandate',
          summary: 'Ordered utilities to disable automatic circuit reclosers in High Fire-Threat Districts during Red Flag warnings and formalized proactive de-energization (PSPS) protocols plus HD Alert Wildfire cameras on Napa peaks.',
          longTermImpact: 'Prevented re-energization arcs on faulted lines during subsequent wind events.'
        },
        {
          code: 'SB 833 (McGuire/Dodd, 2018)',
          title: 'Mandatory Wireless Emergency Alert (WEA) Evacuation Protocols',
          yearEnacted: 2018,
          jurisdiction: 'California State Law',
          summary: 'After Napa and Sonoma counties hesitated to trigger countywide federal WEA cell broadcasts on the night of Oct 8 for fear of causing traffic gridlock, SB 833 established mandatory statewide opt-out emergency alert standards and backup battery requirements for cell towers.',
          longTermImpact: 'Standardized immediate push-to-cell evacuation alerts without requiring residents to pre-register for Nixle.'
        }
      ]
    },
    progressionStages: [
      {
        day: 1,
        dateLabel: 'Oct 8–9, 2017',
        title: '21:52 PDT Ignition & Catastrophic Downslope Run',
        acres: 25000,
        containmentPct: 0,
        windMph: '45–62 mph NE',
        windDir: 'NE -> SW',
        relHumidityPct: 7,
        narrative: 'At 9:52 PM, tree limbs strike PG&E lines on Atlas Peak Road. Within 3 hours, 60 mph Diablo gusts drive a blowtorch of flame down Soda Canyon and into Silverado Country Club and Signorello Estate.',
        tacticalMilestone: '134 of 163 homes on Soda Canyon & Loma Vista destroyed on night one; Governor declares State of Emergency.',
        center: [-122.264, 38.431],
        spreadRadiusKm: 7.5
      },
      {
        day: 3,
        dateLabel: 'Oct 10, 2017',
        title: 'Expansion into Wooden Valley & Solano County',
        acres: 42300,
        containmentPct: 3,
        windMph: '20–30 mph NNE',
        windDir: 'NNE',
        relHumidityPct: 14,
        narrative: 'A second ignition near Hagen Road merges with the main Atlas Peak front, pushing east across the Vaca Mountains toward Wooden Valley and Green Valley in Solano County.',
        tacticalMilestone: 'Over 17,000 residents under mandatory evacuation across Napa and Solano counties.',
        center: [-122.245, 38.395],
        spreadRadiusKm: 11.8
      },
      {
        day: 5,
        dateLabel: 'Oct 12, 2017',
        title: 'Holding the Rector Plateau & Coombsville Line',
        acres: 51057,
        containmentPct: 27,
        windMph: '15–22 mph NW',
        windDir: 'NW',
        relHumidityPct: 24,
        narrative: 'Anticipated 40 mph winds arrive weaker than feared. Bulldozers and air tankers establish a decisive firebreak across Atlas Peak Road and Rector Canyon, saving eastern Napa neighborhoods.',
        tacticalMilestone: 'Forward progress toward City of Napa and Fairfield halted.',
        center: [-122.238, 38.364],
        spreadRadiusKm: 14.5
      },
      {
        day: 19,
        dateLabel: 'Oct 27, 2017',
        title: 'Full Perimeter Containment',
        acres: 51625,
        containmentPct: 100,
        windMph: '10 mph W',
        windDir: 'W',
        relHumidityPct: 58,
        narrative: 'Autumn marine moisture and relentless ground mop-up secure all 51,625 acres across the Atlas Peak and Vaca Mountain ridges.',
        tacticalMilestone: 'CPUC and CAL FIRE preserve utility pole evidence for landmark regulatory investigation.',
        center: [-122.238, 38.364],
        spreadRadiusKm: 15.0
      }
    ]
  },
  {
    id: '2017-NUNS',
    matchRawName: 'NUNS',
    year: 2017,
    displayName: 'Nuns Fire / Southern LNU Complex (2017)',
    subtitle: 'Six-Fire Mayacamas Merger Across Mount Veeder, Oakville & Sonoma Valley',
    subregion: 'Mount Veeder, Dry Creek Rd, Redwood Rd, Oakville Grade & Sonoma Valley',
    avaImpacted: ['Mount Veeder AVA', 'Oakville AVA', 'Yountville AVA', 'Los Carneros AVA'],
    ignitionDate: 'October 8, 2017 (22:00 PDT)',
    containedDate: 'October 30, 2017',
    durationDays: 22,
    acresBurned: 55798.2,
    structuresDestroyed: 1355,
    structuresDamaged: 172,
    fatalities: 3,
    suppressionCostUSD: '$76.0 Million',
    peakPersonnel: 2150,
    peakEngines: 280,
    peakAircraft: 20,
    ignitionOriginCoords: [-122.512, 38.392],
    ignitionLocationLabel: 'Hwy 12 near Nuns Canyon & Partrick Road (Mount Veeder)',
    primarySpreadBearingDeg: 145,
    windEventType: 'October 2017 Diablo Wind Siege (Multi-Ignition Complex)',
    peakWindGustMph: 64,
    minHumidityPct: 8,
    causeAnalysis: {
      officialCause: 'PG&E Electrical Equipment & Tree-Conductor Contact (6 Merged Fires)',
      ignitionMechanism: 'Six separate wind-driven fires (Nuns, Partrick, Adobe, Norrbom, Pressley, and Oakmont) ignited during the night of October 8–9 and merged across the Mayacamas range.',
      investigativeFindings: 'CAL FIRE determined that PG&E power lines and electrical equipment sparked the Nuns, Norrbom, Adobe, Partrick, and Oakmont fires when alder and oak trees fell onto distribution lines in Sonoma and western Napa counties.',
      environmentalPreconditions: 'Dense Douglas fir, redwood-tanoak stands, and chaparral along the steep Mount Veeder ridge had not burned since the 1964 Nuns Canyon Fire (53-year fuel buildup).'
    },
    tacticalResponse: {
      leadAgency: 'CAL FIRE LNU (Southern LNU Complex Incident Command)',
      initialAttackChallenges: 'The Partrick Fire ignited west of Napa along Partrick Road and raced upslope into Mount Veeder while the Nuns and Norrbom fires pushed east from Sonoma Valley—squeezing Mount Veeder communities from both sides.',
      airAndGroundOperations: 'Strike teams fought house-to-house along Dry Creek Road, Mt. Veeder Road, and Redwood Road while DC-10 VLATs dropped retardant along the Oakville Grade crest to prevent the fire from dropping into the Oakville and Rutherford valley floor.',
      mutualAidAndEvacuations: 'Mandatory evacuations across Mount Veeder, Browns Valley edge, Oakville Grade, and Carneros.'
    },
    howItWentOut: {
      containmentDate: 'October 30, 2017',
      weatherShift: 'Shift to light onshore winds and higher humidity by October 15 allowed burnout operations along the Mayacamas ridgeline.',
      decisiveContainmentLines: 'Dozer lines cut along Oakville Grade, Trinity Road, and Duhig Road in Carneros, reinforced by aerial retardant drops.',
      fuelBarriersAndVineyards: 'High-elevation terraced vineyards on Mount Veeder (such as Mayacamas Vineyards) and valley-floor vineyards in Oakville and Carneros acted as critical fuel breaks that stopped the eastern perimeter.'
    },
    publicPolicyLegacy: {
      overview: 'The Nuns/Partrick Fire spurred the rapid growth of community-led Fire Safe Councils across Napa’s western mountains and directly shaped state utility settlement mandates.',
      reforms: [
        {
          code: 'Mt. Veeder Fire Safe Council & Napa Firewise',
          title: 'Countywide Firewise USA Community & Shaded Fuel Break Network',
          yearEnacted: 2018,
          jurisdiction: 'Napa County Ordinance',
          summary: 'Catalyzed the expansion of Napa Communities Firewise Foundation (NCFF) into 30+ neighborhood Fire Safe Councils executing ridge-top shaded fuel breaks along Mt. Veeder Rd, Dry Creek Rd, and Oakville Grade.',
          longTermImpact: 'Treated thousands of acres of Douglas fir and chaparral prior to the 2020 Glass Fire.'
        },
        {
          code: 'CPUC Decision 20-05-019 ($1.937B Penalty)',
          title: 'CPUC Record Administrative Penalty & Systemic Vegetation Audit',
          yearEnacted: 2020,
          jurisdiction: 'CPUC Utility Mandate',
          summary: 'Imposed a record $1.937 billion penalty on PG&E for violations found across 15 of the 2017–2018 wildfires (including Nuns, Partrick, and Atlas) and barred cost recovery from ratepayers.',
          longTermImpact: 'Forced enhanced LiDAR tree-strike hazard inspections along all rural Mayacamas distribution feeders.'
        }
      ]
    },
    progressionStages: [
      {
        day: 1,
        dateLabel: 'Oct 8–9, 2017',
        title: 'Simultaneous Ignitions in Nuns Canyon & Partrick Rd',
        acres: 14500,
        containmentPct: 0,
        windMph: '50–64 mph NE',
        windDir: 'NE -> SW',
        relHumidityPct: 8,
        narrative: 'Around 10:00 PM, trees fall into power lines in Nuns Canyon (Hwy 12) and along Partrick Road west of Napa. Fierce gusts drive flames across the Mayacamas divide.',
        tacticalMilestone: 'Mount Veeder, Partrick Rd, and Redwood Rd evacuated overnight.',
        center: [-122.495, 38.355],
        spreadRadiusKm: 6.5
      },
      {
        day: 4,
        dateLabel: 'Oct 11, 2017',
        title: 'Merger of Nuns, Partrick, Adobe & Norrbom Fires',
        acres: 44300,
        containmentPct: 5,
        windMph: '25–35 mph N',
        windDir: 'N',
        relHumidityPct: 13,
        narrative: 'Four separate fires merge into the massive Southern LNU Complex spanning from Oakville Grade in the north to Carneros in the south, burning historic structures at Mayacamas Vineyards.',
        tacticalMilestone: 'DC-10 Air Tankers paint Oakville Grade to protect Oakville and Yountville valley floor.',
        center: [-122.499, 38.348],
        spreadRadiusKm: 12.5
      },
      {
        day: 9,
        dateLabel: 'Oct 16, 2017',
        title: 'Oakmont Merger & Containment of Napa Flank',
        acres: 54500,
        containmentPct: 68,
        windMph: '12 mph WSW',
        windDir: 'WSW',
        relHumidityPct: 45,
        narrative: 'Cooler coastal air enables hand crews and dozers to button up the eastern Mount Veeder perimeter along Dry Creek Road.',
        tacticalMilestone: 'Repopulation begins for lower Browns Valley and Carneros.',
        center: [-122.499, 38.348],
        spreadRadiusKm: 15.0
      },
      {
        day: 22,
        dateLabel: 'Oct 30, 2017',
        title: '100% Containment After First Autumn Rain',
        acres: 55798,
        containmentPct: 100,
        windMph: '8 mph SW',
        windDir: 'SW',
        relHumidityPct: 65,
        narrative: 'All six merged fires within the 55,798-acre Nuns perimeter are fully contained across the Mayacamas range.',
        tacticalMilestone: 'Post-fire BAER soil stabilization deployed across Redwood Creek and Napa River watersheds.',
        center: [-122.499, 38.348],
        spreadRadiusKm: 15.5
      }
    ]
  },
  {
    id: '2017-TUBBS',
    matchRawName: 'TUBBS',
    year: 2017,
    displayName: 'Tubbs Fire (2017)',
    subtitle: 'Calistoga Ignition That Became (At the Time) California’s Most Destructive Wildfire',
    subregion: 'Bennett Lane (Calistoga), Petrified Forest, Franz Valley & Mark West / Santa Rosa',
    avaImpacted: ['Calistoga AVA', 'Diamond Mountain District AVA'],
    ignitionDate: 'October 8, 2017 (21:43 PDT)',
    containedDate: 'October 31, 2017',
    durationDays: 23,
    acresBurned: 36702.0,
    structuresDestroyed: 5636,
    structuresDamaged: 317,
    fatalities: 22,
    suppressionCostUSD: '$100.0+ Million',
    peakPersonnel: 2400,
    peakEngines: 310,
    peakAircraft: 22,
    ignitionOriginCoords: [-122.618, 38.609],
    ignitionLocationLabel: 'Bennett Lane off Hwy 128, North of Calistoga (Napa County)',
    primarySpreadBearingDeg: 242,
    windEventType: 'Hurricane-Force Diablo Offshore Wind Tunnel (65–79 mph Gusts)',
    peakWindGustMph: 79,
    minHumidityPct: 7,
    causeAnalysis: {
      officialCause: 'Private Customer Electrical System (Bennett Lane, Calistoga)',
      ignitionMechanism: 'Ignited at 9:43 PM on private property at 1120 Bennett Lane just north of Calistoga in Napa County.',
      investigativeFindings: 'After a 15-month investigation, CAL FIRE determined the Tubbs Fire was caused by a private electrical system adjacent to a residential structure in Calistoga—not PG&E equipment—though driven by the exact same hurricane-force Diablo windstorm.',
      environmentalPreconditions: 'Followed the exact historic wind corridor of the September 1964 Hanly Fire: 65–79 mph gusts funneled through the Mark West Creek and Porter Creek canyons.'
    },
    tacticalResponse: {
      leadAgency: 'CAL FIRE LNU (Central LNU Complex)',
      initialAttackChallenges: 'Advancing at an unprecedented rate of nearly 3 miles per hour (over a football field every 3 seconds), the fire spotted half a mile ahead of itself, leaping from Calistoga over the Mayacamas mountains and across the 6-lane US-101 freeway into urban Santa Rosa (Coffey Park) by 1:30 AM.',
      airAndGroundOperations: 'Initial Napa County engines responding to Bennett Lane in Calistoga were immediately outflanked by 70 mph ember showers; crews pivoted to mass life-saving evacuations along Petrified Forest Road and Highway 128.',
      mutualAidAndEvacuations: 'Over 40,000 evacuated across Calistoga and Santa Rosa; 5,636 structures destroyed.'
    },
    howItWentOut: {
      containmentDate: 'October 31, 2017',
      weatherShift: 'Dissipation of offshore Diablo pressure gradients after October 13 allowed aircraft to box in the northern Mount St. Helena and Franz Valley flanks.',
      decisiveContainmentLines: 'Dozer lines along Highway 29 north of Calistoga, Kimball Reservoir, and Knights Valley prevented the eastern heel of the fire from backing down into downtown Calistoga.',
      fuelBarriersAndVineyards: 'Irrigated valley-floor vineyards along Tubbs Lane and Bennett Lane in northern Calistoga held the eastern heel of the perimeter.'
    },
    publicPolicyLegacy: {
      overview: 'The Tubbs Fire shocked wildfire scientists worldwide by proving that a wildland ignition in rural Napa County could cross a mountain range and consume thousands of suburban homes in 4 hours—retracing the 1964 Hanly Fire footprint.',
      reforms: [
        {
          code: '2025 California WUI Code & FHSZ Map Expansion',
          title: 'Redrawing Local Responsibility Area (LRA) Fire Hazard Severity Zones (SB 63)',
          yearEnacted: 2021,
          jurisdiction: 'California State Law',
          summary: 'Required the State Fire Marshal to update and expand Very High and High Fire Hazard Severity Zones into Local Responsibility Areas (cities/suburbs) susceptible to long-range wind-driven ember cast.',
          longTermImpact: 'Extended Chapter 7A / WUI fire-resistant building codes to urban edges previously considered immune to wildland fire.'
        },
        {
          code: 'Cal OES Pre-Positioning Program (AB 111)',
          title: 'Predictive Weather-Driven Strike Team Pre-Positioning',
          yearEnacted: 2019,
          jurisdiction: 'CAL FIRE Operational Reform',
          summary: 'Created permanent state funding through Cal OES to pre-stage out-of-county fire engines, dozers, and dispatchers in Napa and Sonoma counties 24–48 hours before forecasted Red Flag wind events.',
          longTermImpact: 'Eliminated the 6-to-12 hour mutual aid travel delay experienced on the night of October 8, 2017.'
        }
      ]
    },
    progressionStages: [
      {
        day: 1,
        dateLabel: 'Oct 8, 2017 (21:43)',
        title: 'Ignition at Bennett Lane in Northern Calistoga',
        acres: 8500,
        containmentPct: 0,
        windMph: '60–79 mph ENE',
        windDir: 'ENE -> WSW',
        relHumidityPct: 7,
        narrative: 'Sparked at 9:43 PM near Bennett Lane and Hwy 128 in Calistoga, hurricane-force mountain-wave winds hurl embers west up Porter Creek Rd and Petrified Forest Rd.',
        tacticalMilestone: 'Calistoga engines arrive within minutes but face 70 mph horizontal flame sheets.',
        center: [-122.618, 38.609],
        spreadRadiusKm: 5.5
      },
      {
        day: 2,
        dateLabel: 'Oct 9, 2017 (02:00)',
        title: '12-Mile Sprint Across Mayacamas & US-101',
        acres: 28000,
        containmentPct: 0,
        windMph: '55–70 mph NE',
        windDir: 'NE -> SW',
        relHumidityPct: 8,
        narrative: 'Retracing the exact 1964 Hanly Fire corridor, the fire races 12 miles in under 4 hours from Calistoga into FountainGrove and jumps US-101 into Coffey Park.',
        tacticalMilestone: 'Deadliest and most destructive night in North Bay wildfire history.',
        center: [-122.677, 38.568],
        spreadRadiusKm: 11.5
      },
      {
        day: 6,
        dateLabel: 'Oct 14, 2017',
        title: 'Holding the Calistoga & Mount St. Helena Flank',
        acres: 35800,
        containmentPct: 50,
        windMph: '15 mph NW',
        windDir: 'NW',
        relHumidityPct: 32,
        narrative: 'In Napa County, firefighters cut containment lines along Highway 29, Tubbs Lane, and Kimball Canyon to keep the eastern heel from backing into downtown Calistoga.',
        tacticalMilestone: 'Calistoga residents permitted to return as eastern perimeter holds.',
        center: [-122.677, 38.568],
        spreadRadiusKm: 13.0
      },
      {
        day: 23,
        dateLabel: 'Oct 31, 2017',
        title: 'Full Perimeter Containment',
        acres: 36702,
        containmentPct: 100,
        windMph: '10 mph W',
        windDir: 'W',
        relHumidityPct: 62,
        narrative: 'Full containment reached at 36,702 acres across Napa and Sonoma counties.',
        tacticalMilestone: 'Largest US Army Corps of Engineers hazardous debris removal operation in state history begins.',
        center: [-122.677, 38.568],
        spreadRadiusKm: 13.5
      }
    ]
  },
  {
    id: '2018-COUNTY',
    matchRawName: 'COUNTY',
    year: 2018,
    displayName: 'County Fire (2018)',
    subtitle: '90,000-Acre Blue Ridge & Berryessa East Shore Megafire',
    subregion: 'Lake Berryessa East Shore, Blue Ridge, Knoxville & Guinda',
    avaImpacted: ['Napa Valley Eastern Watershed', 'Capay Valley Border'],
    ignitionDate: 'June 30, 2018 (14:12 PDT)',
    containedDate: 'July 17, 2018',
    durationDays: 17,
    acresBurned: 89831.1,
    structuresDestroyed: 20,
    structuresDamaged: 3,
    fatalities: 0,
    suppressionCostUSD: '$71.2 Million',
    peakPersonnel: 2667,
    peakEngines: 153,
    peakAircraft: 23,
    ignitionOriginCoords: [-122.142, 38.812],
    ignitionLocationLabel: 'County Road 63, Guinda (Yolo/Napa Blue Ridge Border)',
    primarySpreadBearingDeg: 170,
    windEventType: 'North Wind Event in Extreme Early-Summer Heat (104°F)',
    peakWindGustMph: 38,
    minHumidityPct: 10,
    causeAnalysis: {
      officialCause: 'Equipment Use (Improperly Installed Electric Livestock Fence)',
      ignitionMechanism: 'Sparked at 2:12 PM on June 30, 2018, when an ungrounded, improperly installed solar-powered electric livestock fence controller ignited cured annual grass.',
      investigativeFindings: 'CAL FIRE investigators traced the origin to a private ranch parcel near Guinda and referred findings to the District Attorney, highlighting how agricultural equipment in cured June grass can trigger a 90,000-acre fire.',
      environmentalPreconditions: '30 mph north winds aligned with the steep, roadless Blue Ridge crest dividing Napa County (Lake Berryessa) from Yolo County.'
    },
    tacticalResponse: {
      leadAgency: 'CAL FIRE LNU Unified Command with Yocha Dehe Fire & BLM',
      initialAttackChallenges: 'Vertical, roadless terrain along the Blue Ridge spine (2,500 ft elevation) prevented direct engine access; flames ran 14 miles south along the ridge overlooking Lake Berryessa.',
      airAndGroundOperations: '2,667 firefighters, 54 hand crews, 38 bulldozers, and 23 helicopters widened historic dozer lines along the Blue Ridge crest and Highway 128 (Monticello Dam) to stop the fire from dropping west into Lake Berryessa resorts.',
      mutualAidAndEvacuations: 'Evacuations ordered along the entire eastern shore of Lake Berryessa and Highway 128 canyon.'
    },
    howItWentOut: {
      containmentDate: 'July 17, 2018',
      weatherShift: 'Moderation of north winds allowed night-flying helicopters and hand crews to complete firing operations along the Blue Ridge spine.',
      decisiveContainmentLines: 'State Route 128 (Putah Creek Canyon) on the south and the Blue Ridge bulldozer line on the west.',
      fuelBarriersAndVineyards: 'Previous 2014 Monticello and 2015 Wragg/Rocky burn scars on the north and south ends reduced fuel loading.'
    },
    publicPolicyLegacy: {
      overview: 'The 2018 County Fire demonstrated the critical importance of maintaining permanent ridgetop ridge-breaks along Napa’s eastern border and spurred agricultural equipment safety enforcement.',
      reforms: [
        {
          code: 'CAL FIRE Ridge-Top Strategic Fuel Break Program',
          title: 'Blue Ridge & Berryessa East Shore Permanent Fuel Break Maintenance',
          yearEnacted: 2019,
          jurisdiction: 'CAL FIRE Operational Reform',
          summary: 'Designated the Blue Ridge crest and Berryessa Knoxville corridor as priority state-funded fuel breaks maintained via prescribed herbivory (grazing) and mastication.',
          longTermImpact: 'Provided vital containment lines when the 2020 LNU Complex swept through the same corridor two years later.'
        }
      ]
    },
    progressionStages: [
      {
        day: 1,
        dateLabel: 'Jun 30, 2018',
        title: 'Electric Fence Spark & Rapid Ridge Run',
        acres: 16500,
        containmentPct: 0,
        windMph: '30–38 mph NNW',
        windDir: 'NNW -> SSE',
        relHumidityPct: 10,
        narrative: 'Sparked at 2:12 PM by an improperly installed electric fence, 35 mph north winds drive flames rapidly south along the Blue Ridge spine into northeastern Napa County.',
        tacticalMilestone: 'Pyrocumulus plume rises to 30,000 feet, visible across the entire Bay Area and Sacramento Valley.',
        center: [-122.155, 38.765],
        spreadRadiusKm: 7.5
      },
      {
        day: 4,
        dateLabel: 'Jul 3, 2018',
        title: 'Pushing Down Toward Lake Berryessa & Hwy 128',
        acres: 76000,
        containmentPct: 15,
        windMph: '22 mph NW',
        windDir: 'NW',
        relHumidityPct: 14,
        narrative: '38 bulldozers and 54 hand crews battle to hold the western ridge line above Lake Berryessa and prevent the fire from crossing Highway 128 at Monticello Dam.',
        tacticalMilestone: '2,667 personnel deployed; Berryessa East Shore evacuated.',
        center: [-122.165, 38.683],
        spreadRadiusKm: 16.5
      },
      {
        day: 17,
        dateLabel: 'Jul 17, 2018',
        title: '100% Containment Along Hwy 128 & Blue Ridge',
        acres: 89831,
        containmentPct: 100,
        windMph: '10 mph SW',
        windDir: 'SW',
        relHumidityPct: 42,
        narrative: 'Firing operations tie the southern perimeter into Highway 128 and previous 2014 Monticello / 2016 Cold Fire scars.',
        tacticalMilestone: 'Full containment at 89,831 acres with zero fatalities.',
        center: [-122.165, 38.683],
        spreadRadiusKm: 19.0
      }
    ]
  },
  {
    id: '2015-VALLEY',
    matchRawName: 'VALLEY',
    year: 2015,
    displayName: 'Valley Fire & 2015 Drought Siege (Valley / Rocky / Jerusalem / Wragg)',
    subtitle: '178,000+ Acres Burned Across Northern Napa & Lake Border in a Single Summer',
    subregion: 'Butts Canyon, Pope Valley North, Knoxville, Putah Creek & Cobb / Middletown',
    avaImpacted: ['Northern Napa County Watershed', 'Guenoc / Langtry Farms'],
    ignitionDate: 'September 12, 2015 (13:24 PDT)',
    containedDate: 'October 6, 2015',
    durationDays: 24,
    acresBurned: 76084.8,
    structuresDestroyed: 1955,
    structuresDamaged: 93,
    fatalities: 4,
    suppressionCostUSD: '$59.0 Million (Valley) / $151.8M Combined 2015 LNU',
    peakPersonnel: 3600,
    peakEngines: 385,
    peakAircraft: 19,
    ignitionOriginCoords: [-122.705, 38.805],
    ignitionLocationLabel: 'High Valley Rd near Cobb Mountain (sweeping SE into Northern Napa County)',
    primarySpreadBearingDeg: 125,
    windEventType: 'Plume-Dominated Megafire in 4th Year of Historic California Drought',
    peakWindGustMph: 45,
    minHumidityPct: 12,
    causeAnalysis: {
      officialCause: 'Faulty Outdoor Hot-Tub Electrical Wiring (Valley) / Vehicle Exhaust (Wragg)',
      ignitionMechanism: 'The 2015 LNU siege consisted of four sequential major fires intersecting Napa County: Wragg (July 22, 8,049 ac, idling car exhaust on Hwy 128), Rocky (July 29, 69,438 ac, water heater), Jerusalem (Aug 9, 25,118 ac), and Valley (Sept 12, 76,085 ac, faulty hot-tub wiring).',
      investigativeFindings: 'CAL FIRE determined an improperly wired outdoor hot tub sparked the Valley Fire at 1:24 PM on Sept 12; within 5 hours it burned 40,000 acres and crossed into northern Napa County near Butts Canyon and Aetna Springs.',
      environmentalPreconditions: 'Fourth consecutive year of extreme California drought (2012–2015) killed millions of conifers and reduced chaparral moisture to levels never previously measured in the LNU unit.'
    },
    tacticalResponse: {
      leadAgency: 'CAL FIRE LNU Incident Management Team',
      initialAttackChallenges: 'Four helicopter crew members were severely burned on initial attack during extreme erratic plume downdrafts. Radio frequency interoperability gaps and overwhelmed local EOCs hampered early evacuation alerts.',
      airAndGroundOperations: 'Napa County opened the Calistoga Fairgrounds as the primary regional evacuation shelter while bulldozers fought along Butts Canyon Road and Snell Valley to keep the Valley Fire from entering Pope Valley.',
      mutualAidAndEvacuations: 'Over 20,000 residents fled down Highway 29 directly into Calistoga and Napa Valley.'
    },
    howItWentOut: {
      containmentDate: 'October 6, 2015',
      weatherShift: 'Arrival of mid-September rain showers (0.3 inches) on September 16 cooled the active timber crown runs.',
      decisiveContainmentLines: 'Dozer lines along Butts Canyon Road in northern Napa County and the fresh August 2015 Jerusalem Fire burn scar on the eastern flank.',
      fuelBarriersAndVineyards: 'Guenoc Valley vineyards and the fresh Jerusalem/Rocky burn scars completely starved the eastern head of fuel.'
    },
    publicPolicyLegacy: {
      overview: 'The 2015 LNU Fire Season (Wragg, Rocky, Jerusalem, Valley) served as the wake-up call that ended the "quiet decades" of the 1990s–2000s and prompted major state after-action reforms.',
      reforms: [
        {
          code: 'Cal OES 2015 After-Action EOC & Radio Reforms',
          title: 'Interoperable Mutual-Aid Radio Channels & 24/7 County Alert Staffing',
          yearEnacted: 2016,
          jurisdiction: 'CAL FIRE Operational Reform',
          summary: 'Following the Cal OES 2015 Fire Season After-Action Report, Northern California counties standardized mutual-aid tactical radio frequencies and upgraded 24/7 emergency alert staffing.',
          longTermImpact: 'Improved cross-county dispatch coordination between Lake, Napa, and Sonoma units.'
        },
        {
          code: 'AB 1680 / SB 168 Firefighter Drone No-Fly Law',
          title: 'Criminalization of Private Drone Interference Over Active Wildfires',
          yearEnacted: 2016,
          jurisdiction: 'California State Law',
          summary: 'Enacted after private hobbyist drones grounded CAL FIRE air tankers during the 2015 fire season, authorizing penalties and drone neutralization over active fire perimeters.',
          longTermImpact: 'Protected low-altitude air tanker drops over Napa canyons.'
        }
      ]
    },
    progressionStages: [
      {
        day: 1,
        dateLabel: 'Sep 12, 2015',
        title: 'Explosive 40,000-Acre Plume Run into Northern Napa Border',
        acres: 40000,
        containmentPct: 0,
        windMph: '35–45 mph WNW',
        windDir: 'WNW -> ESE',
        relHumidityPct: 12,
        narrative: 'Igniting at 1:24 PM, the Valley Fire explodes to 40,000 acres in 6 hours, consuming Middletown and pushing southeast across the Napa County line into Butts Canyon and Pope Valley north.',
        tacticalMilestone: 'Calistoga Fairgrounds activated for thousands of evacuees streaming down Hwy 29.',
        center: [-122.617, 38.787],
        spreadRadiusKm: 13.5
      },
      {
        day: 4,
        dateLabel: 'Sep 15, 2015',
        title: 'Defense of Pope Valley & Collision with Jerusalem Scar',
        acres: 70000,
        containmentPct: 30,
        windMph: '18 mph NW',
        windDir: 'NW',
        relHumidityPct: 28,
        narrative: 'Dozer strike teams hold Butts Canyon Road in northern Napa County while the eastern head runs directly into the fresh August 2015 Jerusalem Fire burn scar.',
        tacticalMilestone: '3,600 personnel stop southward advance toward Calistoga and Angwin.',
        center: [-122.617, 38.787],
        spreadRadiusKm: 17.5
      },
      {
        day: 24,
        dateLabel: 'Oct 6, 2015',
        title: 'Full Containment Across 76,085 Acres',
        acres: 76085,
        containmentPct: 100,
        windMph: '10 mph W',
        windDir: 'W',
        relHumidityPct: 58,
        narrative: 'Combined with the July Wragg (8,049 ac), Rocky (69,438 ac), and August Jerusalem (25,118 ac) fires, the 2015 season scorches 178,743 acres in the northern Napa/Lake watershed.',
        tacticalMilestone: 'Cal OES initiates comprehensive statewide After-Action Review.',
        center: [-122.617, 38.787],
        spreadRadiusKm: 18.5
      }
    ]
  },
  {
    id: '2025-PICKETT',
    matchRawName: 'PICKETT',
    year: 2025,
    displayName: 'Pickett Fire (2025)',
    subtitle: 'Upvalley Calistoga & Howell Mountain Reburn Tested Post-2020 Reforms',
    subregion: 'Pickett Road, Simmons Canyon, Dutch Henry Canyon, Calistoga & Aetna Springs',
    avaImpacted: ['Calistoga AVA', 'Howell Mountain AVA'],
    ignitionDate: 'August 21, 2025 (15:02 PDT)',
    containedDate: 'September 7, 2025',
    durationDays: 17,
    acresBurned: 6822.3,
    structuresDestroyed: 1,
    structuresDamaged: 2,
    fatalities: 0,
    suppressionCostUSD: '$42.5 Million (+ $65M Agricultural Smoke Losses)',
    peakPersonnel: 2180,
    peakEngines: 195,
    peakAircraft: 21,
    ignitionOriginCoords: [-122.548, 38.589],
    ignitionLocationLabel: '2300 Block of Pickett Road, East of Calistoga (Napa County)',
    primarySpreadBearingDeg: 45,
    windEventType: 'Late-August Record Heatwave (105°F) & Up-Canyon Afternoon Winds',
    peakWindGustMph: 28,
    minHumidityPct: 13,
    causeAnalysis: {
      officialCause: 'Debris Burning (Improperly Disposed Hot Ashes in Burn Pile)',
      ignitionMechanism: 'Ignited on August 21, 2025, at a vineyard estate in the 2300 block of Pickett Road near Calistoga when hot ashes were dumped into an unextinguished outdoor burn pile during a record heatwave.',
      investigativeFindings: 'CAL FIRE law enforcement investigators traced the origin to smoldering ashes disposed of by a property worker at an estate owned by Hundred Acre Wine Group; felony charges for recklessly causing a forest fire were filed in Napa County Superior Court in Sept 2026.',
      environmentalPreconditions: 'Burned predominantly across slopes previously scorched five years earlier by the 2020 Glass Fire, where standing dead snags and dense resprouting chaparral fueled rapid uphill runs.'
    },
    tacticalResponse: {
      leadAgency: 'CAL FIRE Sonoma-Lake-Napa Unit (LNU) & Napa County Fire',
      initialAttackChallenges: 'Triple-digit heat and steep box canyons (Simmons Canyon and Dutch Henry Canyon) above Silverado Trail challenged ground crews, while heavy smoke settled over the prime 2025 Cabernet harvest.',
      airAndGroundOperations: 'Real-time FIRIS infrared intelligence aircraft mapped the perimeter within 20 minutes of dispatch. Night-vision Chinook and Blackhawk helitankers dropped water around the clock, holding the fire to 6,822 acres and saving hundreds of homes—a dramatic contrast to the 67,484-acre 2020 Glass Fire on the same terrain.',
      mutualAidAndEvacuations: 'Precision Zonehaven/Genasys polygon evacuations (Zones NPA-E114, E115, E120) evacuated only threatened canyons without shutting down the entire City of Calistoga.'
    },
    howItWentOut: {
      containmentDate: 'September 7, 2025',
      weatherShift: 'Transition from record heat to a cooler coastal trough in late August raised overnight humidity recovery above 55%.',
      decisiveContainmentLines: 'Pre-constructed Napa Firewise shaded fuel breaks along the Howell Mountain rim and reopened 2020 Glass Fire dozer lines stopped the fire from crossing into Angwin or Pope Valley.',
      fuelBarriersAndVineyards: 'Pickett Road and Silverado Trail vineyard aprons anchored the western heel, limiting structure loss to a single outbuilding/residence.'
    },
    publicPolicyLegacy: {
      overview: 'The 2025 Pickett Fire proved that post-2020 investments—night-flying helicopters, FIRIS infrared mapping, Zonehaven polygon alerts, and Howell Mountain shaded fuel breaks—could contain an upvalley fire at one-tenth the size of the 2020 Glass Fire, while igniting a landmark legal battle over agricultural smoke-taint liability.',
      reforms: [
        {
          code: 'Criminal & Civil Agricultural Smoke-Taint Accountability',
          title: 'Strict Enforcement of Vineyard Debris Burning & Smoke-Damage Litigation',
          yearEnacted: 2025,
          jurisdiction: 'Napa County Ordinance',
          summary: 'Following $65M+ in estimated winegrape smoke losses from the Pickett Fire right before the 2025 harvest, Napa County tightened year-round agricultural ash/debris disposal bans and saw landmark multi-winery federal tort litigation over negligent ignition smoke taint.',
          longTermImpact: 'Established strict operational fire-safety compliance audits for vineyard contractors and estate maintenance crews.'
        }
      ]
    },
    progressionStages: [
      {
        day: 1,
        dateLabel: 'Aug 21, 2025',
        title: 'Ignition on Pickett Rd & Run Up Simmons Canyon',
        acres: 2100,
        containmentPct: 0,
        windMph: '20–28 mph SW',
        windDir: 'SW -> NE',
        relHumidityPct: 13,
        narrative: 'Sparked at 3:02 PM by hot ashes dumped into a burn pile on Pickett Road, flames race uphill through 2020 Glass Fire snags and brush into Simmons and Dutch Henry canyons.',
        tacticalMilestone: 'FIRIS aircraft maps perimeter in real time; precision Zonehaven evacuations issued east of Calistoga.',
        center: [-122.540, 38.602],
        spreadRadiusKm: 3.2
      },
      {
        day: 4,
        dateLabel: 'Aug 24, 2025',
        title: 'Holding the Howell Mountain Rim & Reopened 2020 Dozer Lines',
        acres: 6200,
        containmentPct: 17,
        windMph: '18 mph WNW',
        windDir: 'WNW',
        relHumidityPct: 19,
        narrative: 'Over 2,100 firefighters, night-flying helitankers, and bulldozers utilize pre-cleared Howell Mountain fuel breaks and 2020 Glass Fire contingency lines to box in the northern head.',
        tacticalMilestone: 'Forward progress toward Pope Valley and Angwin halted with only 1 structure lost.',
        center: [-122.517, 38.626],
        spreadRadiusKm: 5.5
      },
      {
        day: 17,
        dateLabel: 'Sep 7, 2025',
        title: '100% Containment & Criminal Investigation',
        acres: 6822,
        containmentPct: 100,
        windMph: '10 mph W',
        windDir: 'W',
        relHumidityPct: 54,
        narrative: 'Cooler marine air and aggressive mop-up achieve 100% containment at 6,822 acres—90% smaller than the 2020 Glass Fire on the same slopes.',
        tacticalMilestone: 'CAL FIRE investigators trace ignition to improperly disposed ashes; WERT team assesses low-to-moderate soil burn severity.',
        center: [-122.517, 38.626],
        spreadRadiusKm: 6.0
      }
    ]
  },
  {
    id: '1981-ATLAS_PEAK',
    matchRawName: 'ATLAS PEAK',
    year: 1981,
    displayName: 'Atlas Peak Fire (1981)',
    subtitle: 'The Historic Precursor That Foreshadowed the 2017 Atlas Firestorm',
    subregion: 'Atlas Peak, Foss Valley, Soda Canyon, Milliken Reservoir & Silverado',
    avaImpacted: ['Atlas Peak AVA', 'Oak Knoll District AVA'],
    ignitionDate: 'June 22, 1981 (13:30 PDT)',
    containedDate: 'June 28, 1981',
    durationDays: 6,
    acresBurned: 33606.4,
    structuresDestroyed: 65,
    structuresDamaged: 28,
    fatalities: 0,
    suppressionCostUSD: '$14.0 Million (1981 USD)',
    peakPersonnel: 1600,
    peakEngines: 145,
    peakAircraft: 14,
    ignitionOriginCoords: [-122.275, 38.415],
    ignitionLocationLabel: 'Atlas Peak Road Corridor above Napa Country Club',
    primarySpreadBearingDeg: 195,
    windEventType: 'Early-Summer North Wind & 103°F Heat Event',
    peakWindGustMph: 48,
    minHumidityPct: 11,
    causeAnalysis: {
      officialCause: 'Arson (Serial Roadside Ignition along Atlas Peak)',
      ignitionMechanism: 'Intentionally set in dry roadside grass and chaparral along the Atlas Peak corridor during a 103°F June north-wind heatwave.',
      investigativeFindings: 'California Department of Forestry (CDF) investigators determined the fire was deliberate arson—part of a wave of 1981 Napa arson ignitions that also included the 14,448-acre Langes Peak Fire in August 1981.',
      environmentalPreconditions: 'Dense, decadent chaparral on the western slopes of Atlas Peak and Rector Canyon pushed downslope by 45+ mph dry northerly gusts.'
    },
    tacticalResponse: {
      leadAgency: 'California Department of Forestry (CDF — precursor to CAL FIRE)',
      initialAttackChallenges: 'Flames raced down Milliken and Sarco canyons straight toward the Silverado Country Club and eastern suburbs of the City of Napa.',
      airAndGroundOperations: '1,600 firefighters, WWII/Korean-era airtankers dropping borate/Phos-Chek retardant, and bulldozer crews fought along Westgate Drive and Monticello Road (Hwy 121).',
      mutualAidAndEvacuations: 'Evacuation of Silverado Country Club, Soda Canyon, and eastern Napa foothills; 18 homes and 47 barns/outbuildings destroyed, plus $14M in livestock and timber losses.'
    },
    howItWentOut: {
      containmentDate: 'June 28, 1981',
      weatherShift: 'Return of the San Pablo Bay onshore breeze on June 25 cooled the southern heel.',
      decisiveContainmentLines: 'Bulldozer firebreaks along Highway 121 (Monticello Road), Milliken Canyon, and Capell Valley.',
      fuelBarriersAndVineyards: 'Newly planted Napa Valley vineyards along the Silverado Trail helped stop the western edge from crossing into the valley floor.'
    },
    publicPolicyLegacy: {
      overview: 'The 1981 Atlas Peak Fire was the defining Napa wildfire of the late 20th century—until its 36-year-old burn scar regrew into dense chaparral and burned again with lethal intensity in the October 2017 Atlas Fire.',
      reforms: [
        {
          code: 'PRC § 4290 SRA Fire Safe Regulations',
          title: 'California State Responsibility Area (SRA) Minimum Road & Water Standards',
          yearEnacted: 1982,
          jurisdiction: 'California State Law',
          summary: 'Spurred state and county adoption of minimum rural driveway widths, street signage, and 30-to-100 foot brush clearance standards around hillside homes built after 1981.',
          longTermImpact: 'Homes built after 1981 on Soda Canyon Road with compliant clearance had higher survival rates in 2017, though pre-1981 non-conforming roads remained fatal bottlenecks.'
        }
      ]
    },
    progressionStages: [
      {
        day: 1,
        dateLabel: 'Jun 22, 1981',
        title: 'Arson Ignition & Run Into Silverado Foothills',
        acres: 18000,
        containmentPct: 0,
        windMph: '38–48 mph N',
        windDir: 'N -> S',
        relHumidityPct: 11,
        narrative: 'Set by an arsonist in 103°F heat, flames race down Atlas Peak and Milliken Canyon toward Silverado Country Club and Highway 121.',
        tacticalMilestone: '65 structures (including 18 residences) destroyed in the first 24 hours.',
        center: [-122.299, 38.414],
        spreadRadiusKm: 8.5
      },
      {
        day: 3,
        dateLabel: 'Jun 24, 1981',
        title: 'Holding Monticello Rd & Capell Valley',
        acres: 31500,
        containmentPct: 45,
        windMph: '20 mph NW',
        windDir: 'NW',
        relHumidityPct: 24,
        narrative: '1,600 CDF and mutual-aid firefighters anchor bulldozer lines along Highway 121 and Rector Reservoir.',
        tacticalMilestone: 'Eastern suburbs of the City of Napa saved.',
        center: [-122.299, 38.414],
        spreadRadiusKm: 11.5
      },
      {
        day: 6,
        dateLabel: 'Jun 28, 1981',
        title: 'Full Containment at 33,606 Acres',
        acres: 33606,
        containmentPct: 100,
        windMph: '12 mph SW',
        windDir: 'SW',
        relHumidityPct: 50,
        narrative: 'Contained at 33,606 acres—leaving a footprint that would remain quiet for 36 years until the nearly identical 2017 Atlas Fire.',
        tacticalMilestone: 'Establishes the historical benchmark for eastern Napa hillside fire hazard.',
        center: [-122.299, 38.414],
        spreadRadiusKm: 12.0
      }
    ]
  },
  {
    id: '1964-C._HANLY',
    matchRawName: 'C. HANLY',
    year: 1964,
    displayName: 'C. Hanly Fire & Nuns Canyon Fire (1964)',
    subtitle: 'The 1964 Diablo Wind Siege That Foreshadowed the 2017 Tubbs & Nuns Fires',
    subregion: 'Mount St. Helena, Calistoga, Tubbs Lane, Petrified Forest & Franz Valley',
    avaImpacted: ['Calistoga AVA', 'Diamond Mountain District AVA'],
    ignitionDate: 'September 19, 1964 (12:15 PDT)',
    containedDate: 'September 27, 1964',
    durationDays: 8,
    acresBurned: 55960.7,
    structuresDestroyed: 184,
    structuresDamaged: 45,
    fatalities: 0,
    suppressionCostUSD: '$6.5 Million (1964 USD)',
    peakPersonnel: 2000,
    peakEngines: 125,
    peakAircraft: 12,
    ignitionOriginCoords: [-122.595, 38.645],
    ignitionLocationLabel: 'Hanly Ranch on Hwy 29 at Base of Mount St. Helena (North of Calistoga)',
    primarySpreadBearingDeg: 235,
    windEventType: 'September 1964 Offshore Foehn / Diablo Wind Siege',
    peakWindGustMph: 60,
    minHumidityPct: 9,
    causeAnalysis: {
      officialCause: 'Human Ignition (Hunter / Roadside Spark on Hanly Ranch)',
      ignitionMechanism: 'Erupted shortly after noon on September 19, 1964, on the Hanly Ranch along State Route 29 just north of Calistoga at the base of Mount St. Helena—the same day the 9,808-acre Nuns Canyon Fire and 8,957-acre Roadside #42 Fire ignited further south.',
      investigativeFindings: 'Driven by 60 mph northeast Diablo winds, the Hanly Fire burned down Tubbs Lane, surrounded Calistoga on three sides, and raced across the Mayacamas mountains to the edge of Santa Rosa.',
      environmentalPreconditions: 'Extreme autumn offshore wind event prior to modern WUI subdivision development in Mark West and Coffey Park.'
    },
    tacticalResponse: {
      leadAgency: 'California Division of Forestry (CDF) & Local Volunteer Fire Companies',
      initialAttackChallenges: 'Simultaneous major fires across Napa and Sonoma (Hanly, Nuns Canyon, Roadside #42) overwhelmed 1960s radio communications and local volunteer fire departments.',
      airAndGroundOperations: 'Over 2,000 personnel, military manpower, and early borate air tankers fought for eight days to save downtown Calistoga and the Petrified Forest.',
      mutualAidAndEvacuations: 'Thousands evacuated from Calistoga, Franz Valley, and Rincon Valley; 84 homes and 100 summer cabins/barns destroyed.'
    },
    howItWentOut: {
      containmentDate: 'September 27, 1964',
      weatherShift: 'Collapse of the offshore pressure gradient on September 24 brought humid Pacific air back into the Russian and Napa river valleys.',
      decisiveContainmentLines: 'Bulldozer lines cut along the Napa River valley floor in Calistoga and across the Mark West watershed.',
      fuelBarriersAndVineyards: 'Calistoga orchards, vineyards, and cleared pastureland protected the town core.'
    },
    publicPolicyLegacy: {
      overview: 'Fifty-three years later, on October 8, 2017, the Tubbs Fire retraced the exact geographic footprint of the 1964 Hanly Fire—proving that topographic wind tunnels repeat over half-century cycles, with 30x higher structure losses due to suburban WUI sprawl.',
      reforms: [
        {
          code: 'CDF Statewide Mutual Aid & Fire Hazard Mapping',
          title: 'Foundations of California Mutual Aid & Watershed Fire Mapping',
          yearEnacted: 1965,
          jurisdiction: 'California State Law',
          summary: 'The 1964 North Bay fire siege prompted the California Legislature and Division of Forestry to modernize multi-county mutual aid dispatch and initiate systematic historical perimeter mapping.',
          longTermImpact: 'Preserved the exact 1964 Hanly perimeter in the FRAP database—later used by fire scientists to demonstrate the 1964-vs-2017 Tubbs corridor match.'
        }
      ]
    },
    progressionStages: [
      {
        day: 1,
        dateLabel: 'Sep 19, 1964',
        title: 'Ignition at Mount St. Helena & Encircling of Calistoga',
        acres: 24000,
        containmentPct: 0,
        windMph: '50–60 mph NE',
        windDir: 'NE -> SW',
        relHumidityPct: 9,
        narrative: 'Igniting at Hanly Ranch on Hwy 29 north of Calistoga, 60 mph Diablo winds drive flames down Tubbs Lane and across the Mayacamas divide.',
        tacticalMilestone: 'Calistoga surrounded by flames on three sides; Nuns Canyon Fire erupts simultaneously to the south.',
        center: [-122.605, 38.615],
        spreadRadiusKm: 8.5
      },
      {
        day: 3,
        dateLabel: 'Sep 21, 1964',
        title: 'Push Across Franz Valley & Mark West',
        acres: 48000,
        containmentPct: 20,
        windMph: '35 mph ENE',
        windDir: 'ENE',
        relHumidityPct: 14,
        narrative: 'Flames advance 12 miles west-southwest toward Santa Rosa—carving the exact footprint the 2017 Tubbs Fire would repeat 53 years later.',
        tacticalMilestone: '2,000 firefighters and military personnel mobilized across Napa and Sonoma.',
        center: [-122.622, 38.572],
        spreadRadiusKm: 13.5
      },
      {
        day: 8,
        dateLabel: 'Sep 27, 1964',
        title: 'Containment at 55,961 Acres',
        acres: 55961,
        containmentPct: 100,
        windMph: '10 mph W',
        windDir: 'W',
        relHumidityPct: 55,
        narrative: 'Onshore winds allow crews to tie in the perimeter after 55,961 acres burned and 184 structures destroyed.',
        tacticalMilestone: 'Becomes the benchmark historical fire of the 20th century in the northern Napa/Sonoma corridor.',
        center: [-122.622, 38.572],
        spreadRadiusKm: 15.0
      }
    ]
  },
  {
    id: '2004-RUMSEY',
    matchRawName: 'RUMSEY',
    year: 2004,
    displayName: 'Rumsey Fire (2004) & Sixteen Fire (1999)',
    subtitle: 'Arson-Driven North Wind Sieges in the Blue Ridge & Berryessa Corridor',
    subregion: 'Blue Ridge, Knoxville, Berryessa Estates & Putah Creek',
    avaImpacted: ['Napa Valley Eastern Watershed'],
    ignitionDate: 'October 10, 2004 (13:38 PDT)',
    containedDate: 'October 16, 2004',
    durationDays: 6,
    acresBurned: 38763.0,
    structuresDestroyed: 29,
    structuresDamaged: 6,
    fatalities: 0,
    suppressionCostUSD: '$11.8 Million',
    peakPersonnel: 2110,
    peakEngines: 190,
    peakAircraft: 16,
    ignitionOriginCoords: [-122.245, 38.855],
    ignitionLocationLabel: 'Highway 16 Canyon / Blue Ridge North of Lake Berryessa',
    primarySpreadBearingDeg: 185,
    windEventType: 'October North Wind Event (40+ mph Gusts)',
    peakWindGustMph: 42,
    minHumidityPct: 12,
    causeAnalysis: {
      officialCause: 'Arson (Roadside Ignition along Hwy 16 / Blue Ridge Corridor)',
      ignitionMechanism: 'Intentionally ignited on October 10, 2004 during a fierce autumn north-wind event, five years after the October 1999 Sixteen Fire (37,893 acres, also arson) burned the adjacent ridge.',
      investigativeFindings: 'CDF investigators confirmed arson along the Highway 16 canyon; north winds pushed the fire 12 miles south across the Blue Ridge into northeastern Napa County toward Berryessa Estates.',
      environmentalPreconditions: 'Steep chaparral and blue-oak grasslands cured by dry north winds.'
    },
    tacticalResponse: {
      leadAgency: 'CAL FIRE (CDF) LNU Unified Command',
      initialAttackChallenges: 'Steep canyon winds pushed flames rapidly up the Blue Ridge and south toward the remote Napa County community of Berryessa Estates.',
      airAndGroundOperations: '2,110 personnel and 35 bulldozers reopened the 1999 Sixteen Fire dozer lines along the Blue Ridge crest and executed firing operations above Berryessa Estates.',
      mutualAidAndEvacuations: 'Mandatory evacuation of Berryessa Estates and Knoxville recreation areas.'
    },
    howItWentOut: {
      containmentDate: 'October 16, 2004',
      weatherShift: 'Early autumn Pacific storm system brought 0.5 inches of rain and high humidity on October 16.',
      decisiveContainmentLines: 'Blue Ridge bulldozer break and Berryessa Knoxville Road.',
      fuelBarriersAndVineyards: 'Overlap with the 1999 Sixteen Fire scar slowed southern progression.'
    },
    publicPolicyLegacy: {
      overview: 'The back-to-back 1999 Sixteen Fire (37,893 ac) and 2004 Rumsey Fire (38,763 ac) prompted the creation of the Berryessa Estates Fire Safe Council and BLM Knoxville fuel breaks.',
      reforms: [
        {
          code: 'Berryessa Estates Fire Safe Infrastructure',
          title: 'Remote Community Defensible Perimeter & BLM Knoxville Fuel Breaks',
          yearEnacted: 2005,
          jurisdiction: 'Napa County Ordinance',
          summary: 'Established permanent cleared buffer zones around Berryessa Estates and coordinated BLM/CAL FIRE ridgetop fuel breaks in northeastern Napa County.',
          longTermImpact: 'Helped firefighters save the core of Berryessa Estates during the 2018 County Fire before the 2020 LNU Complex.'
        }
      ]
    },
    progressionStages: [
      {
        day: 1,
        dateLabel: 'Oct 10, 2004',
        title: 'Arson Ignition & 20,000-Acre Southward Surge',
        acres: 20500,
        containmentPct: 0,
        windMph: '35–42 mph N',
        windDir: 'N -> S',
        relHumidityPct: 12,
        narrative: 'Sparked by arson during a 40 mph north wind event, flames surge up the Blue Ridge and south into northeastern Napa County.',
        tacticalMilestone: 'Berryessa Estates placed under evacuation warning.',
        center: [-122.255, 38.815],
        spreadRadiusKm: 8.5
      },
      {
        day: 3,
        dateLabel: 'Oct 12, 2004',
        title: 'Firing Operations Along Blue Ridge Spine',
        acres: 36500,
        containmentPct: 50,
        windMph: '18 mph NW',
        windDir: 'NW',
        relHumidityPct: 26,
        narrative: '2,110 firefighters and 35 dozers reopen the 1999 Sixteen Fire control lines above Berryessa Estates.',
        tacticalMilestone: 'Forward progress into central Lake Berryessa watershed halted.',
        center: [-122.259, 38.774],
        spreadRadiusKm: 12.0
      },
      {
        day: 6,
        dateLabel: 'Oct 16, 2004',
        title: '100% Containment Aided by Autumn Rain',
        acres: 38763,
        containmentPct: 100,
        windMph: '12 mph SSW',
        windDir: 'SSW',
        relHumidityPct: 70,
        narrative: 'An early Pacific storm drops wetting rain across the 38,763-acre perimeter.',
        tacticalMilestone: 'Full containment achieved.',
        center: [-122.259, 38.774],
        spreadRadiusKm: 13.0
      }
    ]
  }
];

export interface NapaLandmarkPoint {
  name: string;
  category: 'town' | 'ava' | 'peak' | 'water';
  coords: [number, number];
  elevationFt?: number;
  note?: string;
}

export const NAPA_LANDMARKS: NapaLandmarkPoint[] = [
  { name: 'City of Napa', category: 'town', coords: [-122.2869, 38.2975], note: 'County Seat • Valley Floor' },
  { name: 'Yountville', category: 'town', coords: [-122.3647, 38.4016], note: 'Yountville AVA' },
  { name: 'Oakville', category: 'ava', coords: [-122.4047, 38.4369], note: 'Oakville AVA • Irrigated Vineyard Buffer' },
  { name: 'Rutherford', category: 'ava', coords: [-122.4214, 38.4583], note: 'Rutherford AVA' },
  { name: 'St. Helena', category: 'town', coords: [-122.4703, 38.5052], note: 'Upvalley Hub' },
  { name: 'Calistoga', category: 'town', coords: [-122.5797, 38.5788], note: 'Northern Napa Valley Gateway' },
  { name: 'Angwin / Howell Mtn', category: 'ava', coords: [-122.4489, 38.5755], elevationFt: 1850, note: 'Howell Mountain AVA • 2020 Glass & LNU Interface' },
  { name: 'Atlas Peak', category: 'peak', coords: [-122.2633, 38.4419], elevationFt: 2663, note: 'Atlas Peak AVA • Burned 1981 & 2017' },
  { name: 'Mount Veeder', category: 'peak', coords: [-122.4472, 38.3783], elevationFt: 2677, note: 'Mount Veeder AVA • Burned 1964 & 2017' },
  { name: 'Spring Mountain', category: 'ava', coords: [-122.5361, 38.5142], elevationFt: 2100, note: 'Spring Mountain District AVA • Burned 2020 Glass Fire' },
  { name: 'Mount St. Helena', category: 'peak', coords: [-122.6333, 38.6694], elevationFt: 4339, note: 'Highest Peak in Napa • 1964 Hanly & 2017 Tubbs Corridor' },
  { name: 'Lake Berryessa', category: 'water', coords: [-122.2156, 38.5889], elevationFt: 440, note: '15-Mile Water Barrier • Surrounded by 2018 & 2020 Megafires' },
  { name: 'Pope Valley', category: 'ava', coords: [-122.4264, 38.6503], elevationFt: 680, note: 'Pope Valley Watershed' },
  { name: 'Stags Leap District', category: 'ava', coords: [-122.3264, 38.3989], note: 'Stags Leap Palisades' },
  { name: 'Coombsville', category: 'ava', coords: [-122.2261, 38.2889], note: 'Coombsville AVA' }
];
