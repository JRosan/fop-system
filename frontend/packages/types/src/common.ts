export type Currency = 'USD' | 'XCD';

export interface Money {
  amount: number;
  currency: Currency;
}

export type WeightUnit = 'KG' | 'LBS';

export interface Weight {
  value: number;
  unit: WeightUnit;
}

export interface Address {
  street: string;
  city: string;
  state?: string;
  postalCode?: string;
  country: string;
}

export interface ContactInfo {
  email: string;
  phone: string;
  fax?: string;
}

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface ApiError {
  status: number;
  message: string;
  errors?: Record<string, string[]>;
}

export type SortDirection = 'asc' | 'desc';

export interface SortOptions {
  field: string;
  direction: SortDirection;
}

export interface FilterOptions {
  search?: string;
  sortBy?: SortOptions;
  pageNumber?: number;
  pageSize?: number;
}
