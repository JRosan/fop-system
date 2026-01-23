import { Platform } from 'react-native';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { storage } from './storage';
import { apiClient } from './api';
const QUEUE_KEY = 'telemetry_queue';
const DEVICE_ID_KEY = 'device_id';

// Telemetry event types matching backend TelemetryEventType enum
export enum TelemetryEventType {
  PermitVerificationScanned = 'PermitVerificationScanned',
  PermitVerificationCompleted = 'PermitVerificationCompleted',
  AirportServiceLogged = 'AirportServiceLogged',
  OfflineSyncStarted = 'OfflineSyncStarted',
  OfflineSyncCompleted = 'OfflineSyncCompleted',
  BiometricAuthAttempted = 'BiometricAuthAttempted',
  LocationCaptured = 'LocationCaptured',
  NotificationReceived = 'NotificationReceived',
  NotificationActioned = 'NotificationActioned',
  AppSessionStarted = 'AppSessionStarted',
  AppSessionEnded = 'AppSessionEnded',
  ErrorOccurred = 'ErrorOccurred',
}

export interface TelemetryPayload {
  // Verification events
  permitNumber?: string;
  verificationResult?: string;
  scanDurationMs?: number;
  wasOffline?: boolean;

  // Service events
  serviceType?: string;
  feeAmount?: number;
  airport?: string;

  // Sync events
  serviceLogsSynced?: number;
  verificationsSynced?: number;
  syncErrors?: string[];

  // Auth events
  biometricType?: string;
  authSuccess?: boolean;
  protectedAction?: string;

  // Location events
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  nearestAirport?: string;

  // Notification events
  notificationId?: string;
  notificationChannel?: string;
  actionTaken?: string;

  // Error events
  errorMessage?: string;
  errorStack?: string;
  errorContext?: string;

  // Performance
  latencyMs?: number;

  // Generic
  [key: string]: unknown;
}

export interface TelemetryEvent {
  eventId: string;
  eventType: TelemetryEventType;
  userId?: string;
  deviceId: string;
  location?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
  timestamp: string;
  payload: TelemetryPayload;
  metadata: {
    appVersion: string;
    platform: string;
    osVersion: string;
    deviceModel: string;
    networkType?: string;
  };
}

// Queue of events waiting to be sent
let eventQueue: TelemetryEvent[] = [];
let isFlushing = false;
let flushTimeout: ReturnType<typeof setTimeout> | null = null;

// Flush settings
const FLUSH_INTERVAL_MS = 30000; // 30 seconds
const MAX_QUEUE_SIZE = 50;
const MAX_BATCH_SIZE = 20;

/**
 * Get or create a unique device ID
 */
function getDeviceId(): string {
  let deviceId = storage.getString(DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId = `${Platform.OS}_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    storage.set(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
}

/**
 * Load queued events from storage
 */
function loadQueue(): void {
  try {
    const queueJson = storage.getString(QUEUE_KEY);
    if (queueJson) {
      eventQueue = JSON.parse(queueJson);
    }
  } catch (error) {
    console.error('Failed to load telemetry queue:', error);
    eventQueue = [];
  }
}

/**
 * Save event queue to storage
 */
function saveQueue(): void {
  try {
    storage.set(QUEUE_KEY, JSON.stringify(eventQueue));
  } catch (error) {
    console.error('Failed to save telemetry queue:', error);
  }
}

/**
 * Schedule a queue flush
 */
function scheduleFlush(): void {
  if (flushTimeout) return;

  flushTimeout = setTimeout(() => {
    flushTimeout = null;
    flushQueue();
  }, FLUSH_INTERVAL_MS);
}

/**
 * Flush the event queue to the server
 */
async function flushQueue(): Promise<void> {
  if (isFlushing || eventQueue.length === 0) return;

  isFlushing = true;

  try {
    // Take a batch of events
    const batch = eventQueue.slice(0, MAX_BATCH_SIZE);

    // Send to server
    await apiClient.post('/field/telemetry', { events: batch });

    // Remove sent events from queue
    eventQueue = eventQueue.slice(batch.length);
    saveQueue();

    // If more events remain, schedule another flush
    if (eventQueue.length > 0) {
      scheduleFlush();
    }
  } catch (error) {
    console.error('Failed to flush telemetry:', error);
    // Events remain in queue for retry
    scheduleFlush();
  } finally {
    isFlushing = false;
  }
}

/**
 * Track a telemetry event
 */
export function trackEvent(
  eventType: TelemetryEventType,
  payload: TelemetryPayload = {},
  options: {
    userId?: string;
    location?: { latitude: number; longitude: number; accuracy?: number };
    immediate?: boolean;
  } = {}
): void {
  const event: TelemetryEvent = {
    eventId: `${Date.now()}_${Math.random().toString(36).substring(7)}`,
    eventType,
    userId: options.userId,
    deviceId: getDeviceId(),
    location: options.location,
    timestamp: new Date().toISOString(),
    payload,
    metadata: {
      appVersion: Constants.expoConfig?.version || '1.0.0',
      platform: Platform.OS,
      osVersion: Platform.Version.toString(),
      deviceModel: Device.modelName || 'Unknown',
    },
  };

  // Add to queue
  eventQueue.push(event);

  // Trim queue if too large
  if (eventQueue.length > MAX_QUEUE_SIZE) {
    eventQueue = eventQueue.slice(-MAX_QUEUE_SIZE);
  }

  saveQueue();

  // Immediate flush for important events
  if (options.immediate) {
    flushQueue();
  } else {
    scheduleFlush();
  }
}

/**
 * Track permit verification scan
 */
export function trackVerificationScan(
  location?: { latitude: number; longitude: number }
): void {
  trackEvent(TelemetryEventType.PermitVerificationScanned, {}, { location });
}

/**
 * Track permit verification result
 */
export function trackVerificationResult(
  permitNumber: string | undefined,
  result: string,
  scanDurationMs: number,
  wasOffline: boolean,
  location?: { latitude: number; longitude: number }
): void {
  trackEvent(
    TelemetryEventType.PermitVerificationCompleted,
    {
      permitNumber,
      verificationResult: result,
      scanDurationMs,
      wasOffline,
    },
    { location }
  );
}

/**
 * Track airport service logged
 */
export function trackServiceLogged(
  serviceType: string,
  feeAmount: number,
  airport: string,
  location?: { latitude: number; longitude: number }
): void {
  trackEvent(
    TelemetryEventType.AirportServiceLogged,
    {
      serviceType,
      feeAmount,
      airport,
    },
    { location }
  );
}

/**
 * Track offline sync
 */
export function trackSync(
  success: boolean,
  serviceLogsSynced: number,
  verificationsSynced: number,
  errors: string[]
): void {
  trackEvent(
    success
      ? TelemetryEventType.OfflineSyncCompleted
      : TelemetryEventType.OfflineSyncStarted,
    {
      serviceLogsSynced,
      verificationsSynced,
      syncErrors: errors,
    },
    { immediate: true }
  );
}

/**
 * Track biometric authentication attempt
 */
export function trackBiometricAuth(
  biometricType: string,
  success: boolean,
  protectedAction?: string
): void {
  trackEvent(TelemetryEventType.BiometricAuthAttempted, {
    biometricType,
    authSuccess: success,
    protectedAction,
  });
}

/**
 * Track notification interaction
 */
export function trackNotification(
  notificationId: string,
  channel: string,
  action: 'received' | 'opened' | 'dismissed'
): void {
  const eventType =
    action === 'received'
      ? TelemetryEventType.NotificationReceived
      : TelemetryEventType.NotificationActioned;

  trackEvent(eventType, {
    notificationId,
    notificationChannel: channel,
    actionTaken: action,
  });
}

/**
 * Track error
 */
export function trackError(
  message: string,
  context?: string,
  stack?: string
): void {
  trackEvent(
    TelemetryEventType.ErrorOccurred,
    {
      errorMessage: message,
      errorContext: context,
      errorStack: stack?.substring(0, 500),
    },
    { immediate: true }
  );
}

/**
 * Initialize telemetry service
 */
export function initializeTelemetry(): void {
  loadQueue();
  trackEvent(TelemetryEventType.AppSessionStarted, {}, { immediate: true });
}

/**
 * Shutdown telemetry service
 */
export async function shutdownTelemetry(): Promise<void> {
  trackEvent(TelemetryEventType.AppSessionEnded, {});
  await flushQueue();
}

// Export for direct queue access
export { flushQueue as flushTelemetry };
