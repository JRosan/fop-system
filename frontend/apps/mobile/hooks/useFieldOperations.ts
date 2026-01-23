import { useState, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import { useOfflineStore, useLocationStore, AirportServiceType, BviAirport, VerificationResult } from '../stores';
import { useBiometricAuth, ProtectedAction } from './useBiometricAuth';
import { apiClient } from '../services/api';

interface VerifyPermitResult {
  success: boolean;
  result: VerificationResult;
  permitNumber?: string;
  operatorName?: string;
  aircraftRegistration?: string;
  validFrom?: string;
  validUntil?: string;
  failureReason?: string;
}

interface LogServiceParams {
  permitId?: string;
  permitNumber?: string;
  operatorId: string;
  aircraftRegistration?: string;
  serviceType: AirportServiceType;
  quantity: number;
  quantityUnit?: string;
  airport: BviAirport;
  notes?: string;
}

interface UseFieldOperationsReturn {
  // Verification
  verifyPermit: (qrContent: string) => Promise<VerifyPermitResult>;
  isVerifying: boolean;

  // Service logging
  logService: (params: LogServiceParams) => Promise<boolean>;
  isLoggingService: boolean;

  // Sync
  syncData: () => Promise<{ success: boolean; errors: string[] }>;
  isSyncing: boolean;
  pendingCount: number;

  // Cache
  refreshCache: () => Promise<void>;
  lastSyncAt: Date | null;
}

// Fee rates for offline calculation
const FEE_RATES: Record<AirportServiceType, { rate: number; isPerUnit: boolean; unitDescription?: string }> = {
  [AirportServiceType.SewerageDumping]: { rate: 300, isPerUnit: false },
  [AirportServiceType.FireTruckStandby]: { rate: 25, isPerUnit: true, unitDescription: 'per service' },
  [AirportServiceType.FuelFlow]: { rate: 0.20, isPerUnit: true, unitDescription: 'per gallon' },
  [AirportServiceType.GroundHandling]: { rate: 150, isPerUnit: false },
  [AirportServiceType.AircraftTowing]: { rate: 100, isPerUnit: true, unitDescription: 'per tow' },
  [AirportServiceType.WaterService]: { rate: 50, isPerUnit: true, unitDescription: 'per service' },
  [AirportServiceType.GpuService]: { rate: 75, isPerUnit: true, unitDescription: 'per hour' },
  [AirportServiceType.DeIcing]: { rate: 500, isPerUnit: false },
  [AirportServiceType.BaggageHandling]: { rate: 35, isPerUnit: true, unitDescription: 'per bag' },
  [AirportServiceType.PassengerStairs]: { rate: 50, isPerUnit: true, unitDescription: 'per use' },
  [AirportServiceType.LavatoryService]: { rate: 75, isPerUnit: true, unitDescription: 'per service' },
  [AirportServiceType.CateringAccess]: { rate: 25, isPerUnit: true, unitDescription: 'per access' },
};

export function useFieldOperations(): UseFieldOperationsReturn {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isLoggingService, setIsLoggingService] = useState(false);

  const { requireAuth } = useBiometricAuth();
  const { getCurrentLocation, location } = useLocationStore();
  const {
    addPendingServiceLog,
    addPendingVerification,
    syncWithServer,
    refreshCache,
    pendingServiceLogs,
    pendingVerifications,
    isSyncing,
    lastSyncAt,
    getCachedPermit,
    loadPersistedState,
  } = useOfflineStore();

  // Load persisted state on mount
  useEffect(() => {
    loadPersistedState();
  }, [loadPersistedState]);

  const verifyPermit = useCallback(
    async (qrContent: string): Promise<VerifyPermitResult> => {
      setIsVerifying(true);
      const startTime = Date.now();

      try {
        // Get current location
        const currentLocation = await getCurrentLocation();

        // Try online verification first
        try {
          const response = await apiClient.post('/field/verify', {
            qrContent,
            latitude: currentLocation?.latitude,
            longitude: currentLocation?.longitude,
          });

          const result = response.data;

          // Log verification
          addPendingVerification({
            qrContent,
            result: result.result,
            failureReason: result.failureReason,
            latitude: currentLocation?.latitude,
            longitude: currentLocation?.longitude,
            verifiedAt: new Date().toISOString(),
            scanDurationMs: Date.now() - startTime,
            airport: result.airport,
          });

          return {
            success: result.result === VerificationResult.Valid,
            result: result.result,
            permitNumber: result.permitNumber,
            operatorName: result.operatorName,
            aircraftRegistration: result.aircraftRegistration,
            validFrom: result.validFrom,
            validUntil: result.validUntil,
            failureReason: result.failureReason,
          };
        } catch (networkError) {
          // Offline - try cached verification
          return verifyOffline(qrContent, currentLocation, startTime);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Verification failed';
        return {
          success: false,
          result: VerificationResult.InvalidFormat,
          failureReason: message,
        };
      } finally {
        setIsVerifying(false);
      }
    },
    [getCurrentLocation, addPendingVerification]
  );

  const verifyOffline = useCallback(
    async (
      qrContent: string,
      location: { latitude: number; longitude: number } | null,
      startTime: number
    ): Promise<VerifyPermitResult> => {
      try {
        // Parse JWT from QR content
        const parts = qrContent.split('.');
        if (parts.length !== 3) {
          return {
            success: false,
            result: VerificationResult.InvalidFormat,
            failureReason: 'Invalid QR code format',
          };
        }

        // Decode payload (without signature verification for offline)
        const payload = JSON.parse(atob(parts[1]));
        const permitNumber = payload.permit_number;

        // Check cached permit
        const cachedPermit = getCachedPermit(permitNumber);
        if (!cachedPermit) {
          return {
            success: false,
            result: VerificationResult.NotFound,
            failureReason: 'Permit not found in offline cache',
          };
        }

        // Check expiry
        const now = new Date();
        const validUntil = new Date(cachedPermit.validUntil);
        if (validUntil < now) {
          addPendingVerification({
            qrContent,
            result: VerificationResult.Expired,
            failureReason: 'Permit expired',
            latitude: location?.latitude,
            longitude: location?.longitude,
            verifiedAt: new Date().toISOString(),
            scanDurationMs: Date.now() - startTime,
          });

          return {
            success: false,
            result: VerificationResult.Expired,
            permitNumber: cachedPermit.permitNumber,
            operatorName: cachedPermit.operatorName,
            validUntil: cachedPermit.validUntil,
            failureReason: 'Permit has expired',
          };
        }

        // Check token expiry
        const tokenExpiry = new Date(cachedPermit.tokenExpiresAt);
        if (tokenExpiry < now) {
          return {
            success: false,
            result: VerificationResult.TokenExpired,
            failureReason: 'Offline token expired - please sync',
          };
        }

        // Valid offline verification
        addPendingVerification({
          qrContent,
          result: VerificationResult.Valid,
          latitude: location?.latitude,
          longitude: location?.longitude,
          verifiedAt: new Date().toISOString(),
          scanDurationMs: Date.now() - startTime,
        });

        return {
          success: true,
          result: VerificationResult.Valid,
          permitNumber: cachedPermit.permitNumber,
          operatorName: cachedPermit.operatorName,
          aircraftRegistration: cachedPermit.aircraftRegistration,
          validFrom: cachedPermit.validFrom,
          validUntil: cachedPermit.validUntil,
        };
      } catch {
        return {
          success: false,
          result: VerificationResult.InvalidFormat,
          failureReason: 'Failed to parse QR code',
        };
      }
    },
    [getCachedPermit, addPendingVerification]
  );

  const logService = useCallback(
    async (params: LogServiceParams): Promise<boolean> => {
      setIsLoggingService(true);

      try {
        // Check if high-value service requires biometric
        const feeRate = FEE_RATES[params.serviceType];
        const estimatedFee = feeRate.isPerUnit
          ? feeRate.rate * params.quantity
          : feeRate.rate;

        if (estimatedFee > 500) {
          const authenticated = await requireAuth(ProtectedAction.HighValueService);
          if (!authenticated) {
            Alert.alert(
              'Authentication Required',
              'High-value services require biometric authentication.'
            );
            return false;
          }
        }

        // Get current location
        const currentLocation = await getCurrentLocation();

        // Add to pending logs
        addPendingServiceLog({
          permitId: params.permitId,
          permitNumber: params.permitNumber,
          operatorId: params.operatorId,
          aircraftRegistration: params.aircraftRegistration,
          serviceType: params.serviceType,
          quantity: params.quantity,
          quantityUnit: params.quantityUnit,
          airport: params.airport,
          latitude: currentLocation?.latitude,
          longitude: currentLocation?.longitude,
          loggedAt: new Date().toISOString(),
          notes: params.notes,
        });

        // Try to sync immediately
        try {
          await syncWithServer();
        } catch {
          // Queued for later sync
          console.log('Service log queued for offline sync');
        }

        return true;
      } catch (error) {
        console.error('Failed to log service:', error);
        return false;
      } finally {
        setIsLoggingService(false);
      }
    },
    [requireAuth, getCurrentLocation, addPendingServiceLog, syncWithServer]
  );

  const syncData = useCallback(async (): Promise<{ success: boolean; errors: string[] }> => {
    const result = await syncWithServer();
    return { success: result.success, errors: result.errors };
  }, [syncWithServer]);

  const pendingCount = pendingServiceLogs.length + pendingVerifications.length;

  return {
    verifyPermit,
    isVerifying,
    logService,
    isLoggingService,
    syncData,
    isSyncing,
    pendingCount,
    refreshCache,
    lastSyncAt,
  };
}

// Export fee rates for UI display
export { FEE_RATES };
