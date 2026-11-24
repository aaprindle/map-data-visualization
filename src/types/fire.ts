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

export interface OsmPoiProperties {
  osmId: number;
  osmType: string;
  category: 'fire_station' | 'hospital' | 'winery';
  name: string;
  operator: string | null;
  website: string | null;
  address: string | null;
  lat: number;
  lon: number;
}

export interface OsmPoiFeature {
  type: 'Feature';
  properties: OsmPoiProperties;
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
}

export interface OsmPoiGeoJSON {
  type: 'FeatureCollection';
  features: OsmPoiFeature[];
}

export interface OsmLineGeoJSON {
  type: 'FeatureCollection';
  features: Array<{
    type: 'Feature';
    properties: Record<string, any>;
    geometry: {
      type: 'LineString';
      coordinates: [number, number][];
    };
  }>;
}

export interface LayerToggles {
  terrain3D: boolean;
  osmWineries: boolean;
  osmEmergency: boolean;
  osmPowerLines: boolean;
  osmCorridors: boolean;
  windParticles: boolean;
  landmarks: boolean;
}

export type ViewMode =
  | 'cumulative'
  | 'single_year'
  | 'reburn_matrix'
  | 'evolution';

export type BasemapStyle = 'dark_terrain' | 'osm_standard' | 'topo_relief' | 'satellite_hybrid';
