import { useCallback } from 'react';
import { Alert } from 'react-native';
import { useBiometricStore, ProtectedAction } from '../stores';

interface UseBiometricAuthReturn {
  // Check if biometric is available and enabled
  isAvailable: boolean;
  isEnabled: boolean;
  biometricType: 'FaceID' | 'Fingerprint' | 'Iris' | null;

  // Authentication methods
  authenticate: (reason?: string) => Promise<boolean>;
  requireAuth: (action: ProtectedAction) => Promise<boolean>;
  requireAuthWithConfirm: (action: ProtectedAction, onConfirm: () => void) => Promise<void>;

  // Settings
  enable: () => Promise<boolean>;
  disable: () => void;
  isProtected: (action: ProtectedAction) => boolean;
}

export function useBiometricAuth(): UseBiometricAuthReturn {
  const {
    isHardwareAvailable,
    isEnrolled,
    biometricType,
    isBiometricEnabled,
    protectedActions,
    authenticate,
    requireAuthForAction,
    enableBiometric,
    disableBiometric,
  } = useBiometricStore();

  const isAvailable = isHardwareAvailable && isEnrolled;
  const isEnabled = isAvailable && isBiometricEnabled;

  const isProtected = useCallback(
    (action: ProtectedAction): boolean => {
      return isBiometricEnabled && protectedActions.includes(action);
    },
    [isBiometricEnabled, protectedActions]
  );

  const requireAuth = useCallback(
    async (action: ProtectedAction): Promise<boolean> => {
      return requireAuthForAction(action);
    },
    [requireAuthForAction]
  );

  const requireAuthWithConfirm = useCallback(
    async (action: ProtectedAction, onConfirm: () => void): Promise<void> => {
      const authenticated = await requireAuthForAction(action);

      if (authenticated) {
        onConfirm();
      } else if (isProtected(action)) {
        Alert.alert(
          'Authentication Required',
          'This action requires biometric authentication. Please try again.',
          [{ text: 'OK' }]
        );
      }
    },
    [requireAuthForAction, isProtected]
  );

  const enable = useCallback(async (): Promise<boolean> => {
    if (!isAvailable) {
      Alert.alert(
        'Biometric Not Available',
        biometricType
          ? 'Please ensure you have biometric authentication set up in your device settings.'
          : 'Your device does not support biometric authentication.',
        [{ text: 'OK' }]
      );
      return false;
    }

    return enableBiometric();
  }, [isAvailable, biometricType, enableBiometric]);

  const disable = useCallback(() => {
    disableBiometric();
  }, [disableBiometric]);

  return {
    isAvailable,
    isEnabled,
    biometricType,
    authenticate,
    requireAuth,
    requireAuthWithConfirm,
    enable,
    disable,
    isProtected,
  };
}

// Re-export ProtectedAction for convenience
export { ProtectedAction };
