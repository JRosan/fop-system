import { create } from 'zustand';
import { storage } from '../services/storage';
import { apiClient } from '../services/api';

// Offline command types for field operations
export interface OfflineServiceLog {
  offlineId: string;
  permitId?: string;
  permitNumber?: string;
  operatorId: string;
  aircraftRegistration?: string;
  serviceType: AirportServiceType;
  quantity: number;
  quantityUnit?: string;
  airport: BviAirport;
  latitude?: number;
  longitude?: number;
  loggedAt: string;
  notes?: string;
}

export interface OfflineVerification {
  offlineId: string;
  qrContent: string;
  result: VerificationResult;
  failureReason?: string;
  latitude?: number;
  longitude?: number;
  verifiedAt: string;
  scanDurationMs: number;
  airport?: BviAirport;
}

export interface CachedPermit {
  permitId: string;
  permitNumber: string;
  operatorId: string;
  operatorName: string;
  aircraftRegistration: string;
  validFrom: string;
  validUntil: string;
  status: PermitStatus;
  jwtToken: string;
  tokenExpiresAt: string;
}

export interface CachedFeeRate {
  serviceType: AirportServiceType;
  rate: number;
  isPerUnit: boolean;
  unitDescription?: string;
  description: string;
}

// Enums matching backend
export enum AirportServiceType {
  SewerageDumping = 'SewerageDumping',
  FireTruckStandby = 'FireTruckStandby',
  FuelFlow = 'FuelFlow',
  GroundHandling = 'GroundHandling',
  AircraftTowing = 'AircraftTowing',
  WaterService = 'WaterService',
  GpuService = 'GpuService',
  DeIcing = 'DeIcing',
  BaggageHandling = 'BaggageHandling',
  PassengerStairs = 'PassengerStairs',
  LavatoryService = 'LavatoryService',
  CateringAccess = 'CateringAccess',
}

export enum VerificationResult {
  Valid = 'Valid',
  Expired = 'Expired',
  Revoked = 'Revoked',
  Suspended = 'Suspended',
  NotFound = 'NotFound',
  InvalidSignature = 'InvalidSignature',
  InvalidFormat = 'InvalidFormat',
  TokenExpired = 'TokenExpired',
}

export enum PermitStatus {
  Active = 'Active',
  Expired = 'Expired',
  Revoked = 'Revoked',
  Suspended = 'Suspended',
}

export enum BviAirport {
  TUPJ = 'TUPJ', // TB Lettsome (Beef Island)
  TUPW = 'TUPW', // Taddy Bay (Virgin Gorda)
  TUPY = 'TUPY', // Auguste George (Anegada)
}

interface OfflineState {
  // Pending data to sync
  pendingServiceLogs: OfflineServiceLog[];
  pendingVerifications: OfflineVerification[];

  // Cached data for offline use
  cachedPermits: CachedPermit[];
  cachedFeeRates: CachedFeeRate[];

  // Sync state
  isSyncing: boolean;
  lastSyncAt: Date | null;
  syncError: string | null;

  // Actions
  addPendingServiceLog: (log: Omit<OfflineServiceLog, 'offlineId'>) => void;
  addPendingVerification: (verification: Omit<OfflineVerification, 'offlineId'>) => void;
  syncWithServer: () => Promise<SyncResult>;
  loadCachedData: () => Promise<void>;
  refreshCache: () => Promise<void>;
  getCachedPermit: (permitNumber: string) => CachedPermit | undefined;
  getFeeRate: (serviceType: AirportServiceType) => CachedFeeRate | undefined;
  clearPendingData: () => void;
  loadPersistedState: () => void;
}

interface SyncResult {
  success: boolean;
  serviceLogsSynced: number;
  verificationsSynced: number;
  errors: string[];
}

const STORAGE_KEYS = {
  PENDING_SERVICE_LOGS: 'pending_service_logs',
  PENDING_VERIFICATIONS: 'pending_verifications',
  CACHED_PERMITS: 'cached_permits',
  CACHED_FEE_RATES: 'cached_fee_rates',
  LAST_SYNC_AT: 'last_sync_at',
};

export const useOfflineStore = create<OfflineState>((set, get) => ({
  pendingServiceLogs: [],
  pendingVerifications: [],
  cachedPermits: [],
  cachedFeeRates: [],
  isSyncing: false,
  lastSyncAt: null,
  syncError: null,

  addPendingServiceLog: (log) => {
    const newLog: OfflineServiceLog = {
      ...log,
      offlineId: `svc_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    };

    set((state) => {
      const updated = [...state.pendingServiceLogs, newLog];
      storage.set(STORAGE_KEYS.PENDING_SERVICE_LOGS, JSON.stringify(updated));
      return { pendingServiceLogs: updated };
    });
  },

  addPendingVerification: (verification) => {
    const newVerification: OfflineVerification = {
      ...verification,
      offlineId: `ver_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    };

    set((state) => {
      const updated = [...state.pendingVerifications, newVerification];
      storage.set(STORAGE_KEYS.PENDING_VERIFICATIONS, JSON.stringify(updated));
      return { pendingVerifications: updated };
    });
  },

  syncWithServer: async () => {
    const { pendingServiceLogs, pendingVerifications } = get();

    if (pendingServiceLogs.length === 0 && pendingVerifications.length === 0) {
      return { success: true, serviceLogsSynced: 0, verificationsSynced: 0, errors: [] };
    }

    set({ isSyncing: true, syncError: null });

    try {
      const response = await apiClient.post('/field/sync', {
        serviceLogs: pendingServiceLogs,
        verifications: pendingVerifications,
        deviceId: await getDeviceId(),
      });

      const result = response.data;

      // Clear synced data
      set({
        pendingServiceLogs: [],
        pendingVerifications: [],
        lastSyncAt: new Date(),
        isSyncing: false,
      });

      storage.delete(STORAGE_KEYS.PENDING_SERVICE_LOGS);
      storage.delete(STORAGE_KEYS.PENDING_VERIFICATIONS);
      storage.set(STORAGE_KEYS.LAST_SYNC_AT, new Date().toISOString());

      return {
        success: true,
        serviceLogsSynced: result.serviceLogsSynced,
        verificationsSynced: result.verificationsSynced,
        errors: result.errors || [],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sync failed';
      set({ isSyncing: false, syncError: errorMessage });
      return {
        success: false,
        serviceLogsSynced: 0,
        verificationsSynced: 0,
        errors: [errorMessage],
      };
    }
  },

  loadCachedData: async () => {
    try {
      // Load from MMKV
      const permitsJson = storage.getString(STORAGE_KEYS.CACHED_PERMITS);
      const ratesJson = storage.getString(STORAGE_KEYS.CACHED_FEE_RATES);

      set({
        cachedPermits: permitsJson ? JSON.parse(permitsJson) : [],
        cachedFeeRates: ratesJson ? JSON.parse(ratesJson) : [],
      });
    } catch (error) {
      console.error('Failed to load cached data:', error);
    }
  },

  refreshCache: async () => {
    try {
      // Fetch permits for offline caching
      const [permitsResponse, ratesResponse] = await Promise.all([
        apiClient.get('/field/cache/permits'),
        apiClient.get('/field/cache/fee-rates'),
      ]);

      const cachedPermits = permitsResponse.data;
      const cachedFeeRates = ratesResponse.data;

      // Store in MMKV
      storage.set(STORAGE_KEYS.CACHED_PERMITS, JSON.stringify(cachedPermits));
      storage.set(STORAGE_KEYS.CACHED_FEE_RATES, JSON.stringify(cachedFeeRates));

      set({ cachedPermits, cachedFeeRates });
    } catch (error) {
      console.error('Failed to refresh cache:', error);
    }
  },

  getCachedPermit: (permitNumber) => {
    return get().cachedPermits.find((p) => p.permitNumber === permitNumber);
  },

  getFeeRate: (serviceType) => {
    return get().cachedFeeRates.find((r) => r.serviceType === serviceType);
  },

  clearPendingData: () => {
    set({
      pendingServiceLogs: [],
      pendingVerifications: [],
    });
    storage.delete(STORAGE_KEYS.PENDING_SERVICE_LOGS);
    storage.delete(STORAGE_KEYS.PENDING_VERIFICATIONS);
  },

  loadPersistedState: () => {
    try {
      const pendingLogsJson = storage.getString(STORAGE_KEYS.PENDING_SERVICE_LOGS);
      const pendingVerificationsJson = storage.getString(STORAGE_KEYS.PENDING_VERIFICATIONS);
      const lastSyncAtJson = storage.getString(STORAGE_KEYS.LAST_SYNC_AT);

      set({
        pendingServiceLogs: pendingLogsJson ? JSON.parse(pendingLogsJson) : [],
        pendingVerifications: pendingVerificationsJson ? JSON.parse(pendingVerificationsJson) : [],
        lastSyncAt: lastSyncAtJson ? new Date(lastSyncAtJson) : null,
      });
    } catch (error) {
      console.error('Failed to load persisted state:', error);
    }
  },
}));

// Helper function to get device ID
async function getDeviceId(): Promise<string> {
  const Device = require('expo-device');
  return Device.modelId || Device.deviceName || 'unknown-device';
}
