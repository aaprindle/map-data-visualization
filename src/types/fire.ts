export interface FireProperties {
  id: string;
  objectId: number;
  year: number;
  decade: string;
  name: string;
  rawName: string;
  complexName: string | null;
  acres: number;
  causeCode: number;
  cause: string;
  causeDetail: string | null;
  agencyCode: string;
  agency: string;
  unitId: string;
  collectionMethod: string;
  alarmDate: string | null;
  containmentDate: string | null;
  durationDays: number | null;
  scaleTier: 'megafire' | 'major' | 'large' | 'moderate';
  centroid: [number, number];
  bbox: [number, number, number, number];
}

export interface FireFeature {
  type: 'Feature';
  id: number;
  properties: FireProperties;
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: any;
  };
}

export interface FireGeoJSON {
  type: 'FeatureCollection';
  features: FireFeature[];
}

export type ViewMode =
  | 'cumulative'     // Cumulative 60-year history up to selectedYear (with current year highlighted)
  | 'single_year'    // Only fires in selectedYear ("Watch Year" mode)
  | 'reburn_matrix'  // Overlapping burn frequency highlights across decades
  | 'evolution';     // Day-by-day animated fire evolution for a selected Landmark Fire

export type BasemapStyle = 'dark_terrain' | 'topo_relief' | 'satellite_hybrid';
