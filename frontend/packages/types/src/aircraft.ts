import type { Weight } from './common';

export type AircraftCategory = 'FIXED_WING' | 'ROTORCRAFT';

export interface Aircraft {
  id: string;
  registrationMark: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  category: AircraftCategory;
  mtow: Weight;
  seatCount: number;
  yearOfManufacture: number;
  noiseCategory?: string;
  operatorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AircraftSummary {
  id: string;
  registrationMark: string;
  manufacturer: string;
  model: string;
  mtow: Weight;
  seatCount: number;
}

export interface CreateAircraftRequest {
  registrationMark: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  category: AircraftCategory;
  mtow: Weight;
  seatCount: number;
  yearOfManufacture: number;
  noiseCategory?: string;
  operatorId: string;
}

export interface UpdateAircraftRequest {
  registrationMark?: string;
  mtow?: Weight;
  seatCount?: number;
  noiseCategory?: string;
}

export interface AircraftFilter {
  operatorId?: string;
  category?: AircraftCategory;
  search?: string;
  pageNumber?: number;
  pageSize?: number;
}
