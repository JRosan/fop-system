export { apiClient, setTokens, getAccessToken, clearTokens, isAuthenticated } from './api';

export {
  initializePushNotifications,
  registerForPushNotifications,
  registerDeviceToken,
  unregisterDeviceToken,
  addNotificationReceivedListener,
  addNotificationResponseListener,
  scheduleLocalNotification,
  showNotification,
  showInsuranceExpiryAlert,
  showEmergencyFlightAlert,
  showFieldOpNotification,
  showSyncCompletedNotification,
  cancelNotification,
  cancelAllNotifications,
  getBadgeCount,
  setBadgeCount,
  clearBadge,
  NotificationChannel,
  Notifications,
} from './notifications';
export type { PushNotificationToken } from './notifications';

export {
  initializeTelemetry,
  shutdownTelemetry,
  flushTelemetry,
  trackEvent,
  trackVerificationScan,
  trackVerificationResult,
  trackServiceLogged,
  trackSync,
  trackBiometricAuth,
  trackNotification,
  trackError,
  TelemetryEventType,
} from './telemetry';
export type { TelemetryEvent, TelemetryPayload } from './telemetry';
