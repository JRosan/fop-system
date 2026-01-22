import type { Address, ContactInfo } from './common';

export interface Operator {
  id: string;
  name: string;
  tradingName?: string;
  registrationNumber: string;
  country: string;
  address: Address;
  contactInfo: ContactInfo;
  authorizedRepresentative: AuthorizedRepresentative;
  aocNumber: string;
  aocIssuingAuthority: string;
  aocExpiryDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthorizedRepresentative {
  name: string;
  title: string;
  email: string;
  phone: string;
}

export interface OperatorSummary {
  id: string;
  name: string;
  country: string;
  aocNumber: string;
  aocExpiryDate: string;
}

export interface CreateOperatorRequest {
  name: string;
  tradingName?: string;
  registrationNumber: string;
  country: string;
  address: Address;
  contactInfo: ContactInfo;
  authorizedRepresentative: AuthorizedRepresentative;
  aocNumber: string;
  aocIssuingAuthority: string;
  aocExpiryDate: string;
}

export interface UpdateOperatorRequest {
  name?: string;
  tradingName?: string;
  address?: Partial<Address>;
  contactInfo?: Partial<ContactInfo>;
  authorizedRepresentative?: Partial<AuthorizedRepresentative>;
  aocNumber?: string;
  aocIssuingAuthority?: string;
  aocExpiryDate?: string;
}

export interface OperatorFilter {
  country?: string;
  search?: string;
  pageNumber?: number;
  pageSize?: number;
}
