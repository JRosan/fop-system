export type DocumentType =
  | 'CERTIFICATE_OF_AIRWORTHINESS'
  | 'CERTIFICATE_OF_REGISTRATION'
  | 'AIR_OPERATOR_CERTIFICATE'
  | 'INSURANCE_CERTIFICATE'
  | 'NOISE_CERTIFICATE'
  | 'CREW_LICENSE'
  | 'FLIGHT_PLAN'
  | 'OTHER';

export type DocumentStatus =
  | 'PENDING'
  | 'VERIFIED'
  | 'REJECTED'
  | 'EXPIRED';

export interface Document {
  id: string;
  applicationId: string;
  type: DocumentType;
  fileName: string;
  fileSize: number;
  mimeType: string;
  blobUrl: string;
  status: DocumentStatus;
  expiryDate?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  rejectionReason?: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface DocumentSummary {
  id: string;
  type: DocumentType;
  fileName: string;
  status: DocumentStatus;
  expiryDate?: string;
  uploadedAt: string;
}

export interface UploadDocumentRequest {
  applicationId: string;
  type: DocumentType;
  file: File;
  expiryDate?: string;
}

export interface VerifyDocumentRequest {
  documentId: string;
  verified: boolean;
  rejectionReason?: string;
}

export interface DocumentRequirement {
  type: DocumentType;
  label: string;
  description: string;
  required: boolean;
  acceptedFormats: string[];
  maxSizeBytes: number;
}

export const DOCUMENT_REQUIREMENTS: DocumentRequirement[] = [
  {
    type: 'CERTIFICATE_OF_AIRWORTHINESS',
    label: 'Certificate of Airworthiness (C of A)',
    description: 'Valid airworthiness certificate issued by the state of registry',
    required: true,
    acceptedFormats: ['application/pdf', 'image/jpeg', 'image/png'],
    maxSizeBytes: 10 * 1024 * 1024,
  },
  {
    type: 'CERTIFICATE_OF_REGISTRATION',
    label: 'Certificate of Registration',
    description: 'Aircraft registration certificate',
    required: true,
    acceptedFormats: ['application/pdf', 'image/jpeg', 'image/png'],
    maxSizeBytes: 10 * 1024 * 1024,
  },
  {
    type: 'AIR_OPERATOR_CERTIFICATE',
    label: 'Air Operator Certificate (AOC)',
    description: 'Valid AOC from the state of the operator',
    required: true,
    acceptedFormats: ['application/pdf', 'image/jpeg', 'image/png'],
    maxSizeBytes: 10 * 1024 * 1024,
  },
  {
    type: 'INSURANCE_CERTIFICATE',
    label: 'Insurance Certificate',
    description: 'Third party liability insurance certificate',
    required: true,
    acceptedFormats: ['application/pdf', 'image/jpeg', 'image/png'],
    maxSizeBytes: 10 * 1024 * 1024,
  },
  {
    type: 'NOISE_CERTIFICATE',
    label: 'Noise Certificate',
    description: 'Aircraft noise certification document',
    required: false,
    acceptedFormats: ['application/pdf', 'image/jpeg', 'image/png'],
    maxSizeBytes: 10 * 1024 * 1024,
  },
];
