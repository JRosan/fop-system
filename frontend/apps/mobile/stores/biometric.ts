import { create } from 'zustand';
import * as LocalAuthentication from 'expo-local-authentication';
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV({ id: 'biometric-settings' });

// Protected actions that require biometric re-authentication
export enum ProtectedAction {
  FeeOverride = 'FEE_OVERRIDE',
  PermitApproval = 'PERMIT_APPROVAL',
  ServiceCancellation = 'SERVICE_CANCELLATION',
  HighValueService = 'HIGH_VALUE_SERVICE', // Over $500
  EmergencyApproval = 'EMERGENCY_APPROVAL',
  SyncOfflineData = 'SYNC_OFFLINE_DATA',
}

export type BiometricType = 'FaceID' | 'Fingerprint' | 'Iris' | null;

interface BiometricState {
  // Availability
  isHardwareAvailable: boolean;
  isEnrolled: boolean;
  biometricType: BiometricType;

  // Settings
  isBiometricEnabled: boolean;
  protectedActions: ProtectedAction[];

  // State
  isAuthenticating: boolean;
  lastAuthTime: Date | null;

  // Actions
  checkAvailability: () => Promise<void>;
  authenticate: (reason?: string) => Promise<boolean>;
  requireAuthForAction: (action: ProtectedAction) => Promise<boolean>;
  enableBiometric: () => Promise<boolean>;
  disableBiometric: () => void;
  setProtectedActions: (actions: ProtectedAction[]) => void;
  loadSettings: () => void;
}

const STORAGE_KEYS = {
  BIOMETRIC_ENABLED: 'biometric_enabled',
  PROTECTED_ACTIONS: 'protected_actions',
};

// Default protected actions
const DEFAULT_PROTECTED_ACTIONS: ProtectedAction[] = [
  ProtectedAction.FeeOverride,
  ProtectedAction.HighValueService,
  ProtectedAction.EmergencyApproval,
];

// Auth timeout in milliseconds (5 minutes)
const AUTH_TIMEOUT = 5 * 60 * 1000;

export const useBiometricStore = create<BiometricState>((set, get) => ({
  isHardwareAvailable: false,
  isEnrolled: false,
  biometricType: null,
  isBiometricEnabled: false,
  protectedActions: DEFAULT_PROTECTED_ACTIONS,
  isAuthenticating: false,
  lastAuthTime: null,

  checkAvailability: async () => {
    try {
      const isHardwareAvailable = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();

      let biometricType: BiometricType = null;
      if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        biometricType = 'FaceID';
      } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        biometricType = 'Fingerprint';
      } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.IRIS)) {
        biometricType = 'Iris';
      }

      set({
        isHardwareAvailable,
        isEnrolled,
        biometricType,
      });
    } catch (error) {
      console.error('Failed to check biometric availability:', error);
      set({
        isHardwareAvailable: false,
        isEnrolled: false,
        biometricType: null,
      });
    }
  },

  authenticate: async (reason = 'Authenticate to continue') => {
    const { isHardwareAvailable, isEnrolled, isBiometricEnabled } = get();

    if (!isHardwareAvailable || !isEnrolled || !isBiometricEnabled) {
      // If biometric not available or enabled, consider authenticated
      return true;
    }

    set({ isAuthenticating: true });

    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: reason,
        fallbackLabel: 'Use passcode',
        disableDeviceFallback: false,
        cancelLabel: 'Cancel',
      });

      if (result.success) {
        set({ lastAuthTime: new Date(), isAuthenticating: false });
        return true;
      }

      set({ isAuthenticating: false });
      return false;
    } catch (error) {
      console.error('Biometric authentication error:', error);
      set({ isAuthenticating: false });
      return false;
    }
  },

  requireAuthForAction: async (action: ProtectedAction) => {
    const { protectedActions, isBiometricEnabled, lastAuthTime, authenticate } = get();

    // If biometric not enabled or action not protected, allow
    if (!isBiometricEnabled || !protectedActions.includes(action)) {
      return true;
    }

    // If authenticated recently, allow without re-auth
    if (lastAuthTime) {
      const timeSinceAuth = Date.now() - lastAuthTime.getTime();
      if (timeSinceAuth < AUTH_TIMEOUT) {
        return true;
      }
    }

    // Require authentication
    const reason = getActionReason(action);
    return authenticate(reason);
  },

  enableBiometric: async () => {
    const { isHardwareAvailable, isEnrolled, authenticate } = get();

    if (!isHardwareAvailable || !isEnrolled) {
      return false;
    }

    // Verify user can authenticate before enabling
    const success = await authenticate('Enable biometric security');
    if (success) {
      set({ isBiometricEnabled: true });
      storage.set(STORAGE_KEYS.BIOMETRIC_ENABLED, 'true');
      return true;
    }

    return false;
  },

  disableBiometric: () => {
    set({ isBiometricEnabled: false, lastAuthTime: null });
    storage.set(STORAGE_KEYS.BIOMETRIC_ENABLED, 'false');
  },

  setProtectedActions: (actions: ProtectedAction[]) => {
    set({ protectedActions: actions });
    storage.set(STORAGE_KEYS.PROTECTED_ACTIONS, JSON.stringify(actions));
  },

  loadSettings: () => {
    try {
      const enabled = storage.getString(STORAGE_KEYS.BIOMETRIC_ENABLED);
      const actionsJson = storage.getString(STORAGE_KEYS.PROTECTED_ACTIONS);

      set({
        isBiometricEnabled: enabled === 'true',
        protectedActions: actionsJson ? JSON.parse(actionsJson) : DEFAULT_PROTECTED_ACTIONS,
      });
    } catch (error) {
      console.error('Failed to load biometric settings:', error);
    }
  },
}));

function getActionReason(action: ProtectedAction): string {
  switch (action) {
    case ProtectedAction.FeeOverride:
      return 'Authenticate to override fee amount';
    case ProtectedAction.PermitApproval:
      return 'Authenticate to approve permit';
    case ProtectedAction.ServiceCancellation:
      return 'Authenticate to cancel service';
    case ProtectedAction.HighValueService:
      return 'Authenticate for high-value service ($500+)';
    case ProtectedAction.EmergencyApproval:
      return 'Authenticate for emergency approval';
    case ProtectedAction.SyncOfflineData:
      return 'Authenticate to sync offline data';
    default:
      return 'Authentication required';
  }
}
