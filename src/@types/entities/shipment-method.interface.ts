import { Activity, Application, Article } from '@types';

export interface ShipmentMethod extends Activity {
  name: string;
  applications: Application[];
  requireAddress: boolean; // default: true
  requireTable: boolean; // default: false
  article: Article;
  zones: {
    name: string;
    type: ZoneType;
    cost: number;
    points: {
      lat: number;
      lng: number;
    }[];
    area: number;
  }[];
  wooId: string;
}

export enum ZoneType {
  IN = <any>'in',
  OUT = <any>'out',
}

export interface Zone {
  name: string;
  type: ZoneType;
  cost: number;
  points: {
    lat: number;
    lng: number;
  }[];
  area: number;
}
