export { useAuthStore } from './auth';
export type { User, AuthState, RegisterData } from './auth';

export { useApplicationStore } from './application';
export type {
  Application,
  ApplicationDetails,
  ApplicationState,
  ApplicationStatus,
  PermitType,
  CreateApplicationData,
  DocumentUpload,
} from './application';

export { useNotificationStore } from './notification';
export type {
  AppNotification,
  NotificationPreferences,
  NotificationState,
} from './notification';

export { useOfflineStore } from './offline';
export type {
  OfflineServiceLog,
  OfflineVerification,
  CachedPermit,
  CachedFeeRate,
  AirportServiceType,
  VerificationResult,
  PermitStatus,
  BviAirport,
} from './offline';

export { useBiometricStore, ProtectedAction } from './biometric';
export type { BiometricType } from './biometric';

export { useLocationStore, BVI_AIRPORTS } from './location';
export type { GeoCoordinate } from './location';
