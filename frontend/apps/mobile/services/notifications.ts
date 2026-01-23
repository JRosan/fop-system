import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { apiClient } from './api';
import { trackNotification } from './telemetry';

// BVI Sovereign colors for notification channels
const BVI_COLORS = {
  atlantic: '#002D56',
  turquoise: '#00A3B1',
  gold: '#C5A059',
};

// Notification channel IDs
export enum NotificationChannel {
  InsuranceExpiry = 'insurance_expiry',
  EmergencyFlights = 'emergency_flights',
  FieldOps = 'field_ops',
  PermitAlerts = 'permit_alerts',
  PaymentReminders = 'payment_reminders',
  Applications = 'applications',
  SystemAnnouncements = 'system_announcements',
  Default = 'default',
}

// Channel configurations for Android
const CHANNEL_CONFIGS: Record<
  NotificationChannel,
  {
    name: string;
    description: string;
    importance: Notifications.AndroidImportance;
    sound: string | null;
    vibrationPattern: number[];
    lightColor: string;
    bypassDnd?: boolean;
  }
> = {
  [NotificationChannel.InsuranceExpiry]: {
    name: 'Insurance Expiry Alerts',
    description: 'Critical alerts about insurance policy expirations',
    importance: Notifications.AndroidImportance.HIGH,
    sound: 'default',
    vibrationPattern: [0, 250, 250, 250],
    lightColor: BVI_COLORS.gold,
  },
  [NotificationChannel.EmergencyFlights]: {
    name: 'Emergency Flight Approvals',
    description: 'Priority One alerts for emergency flight permits',
    importance: Notifications.AndroidImportance.MAX,
    sound: 'default',
    vibrationPattern: [0, 500, 250, 500],
    lightColor: BVI_COLORS.atlantic,
    bypassDnd: true,
  },
  [NotificationChannel.FieldOps]: {
    name: 'Field Operations',
    description: 'Notifications for field verification and services',
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: 'default',
    vibrationPattern: [0, 100],
    lightColor: BVI_COLORS.turquoise,
  },
  [NotificationChannel.PermitAlerts]: {
    name: 'Permit Alerts',
    description: 'Important permit notifications',
    importance: Notifications.AndroidImportance.HIGH,
    sound: 'default',
    vibrationPattern: [0, 250, 250, 250],
    lightColor: BVI_COLORS.atlantic,
  },
  [NotificationChannel.PaymentReminders]: {
    name: 'Payment Reminders',
    description: 'Reminders about pending payments and invoices',
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: 'default',
    vibrationPattern: [0, 150],
    lightColor: BVI_COLORS.gold,
  },
  [NotificationChannel.Applications]: {
    name: 'Application Updates',
    description: 'Updates about your permit applications',
    importance: Notifications.AndroidImportance.HIGH,
    sound: 'default',
    vibrationPattern: [0, 250, 250, 250],
    lightColor: BVI_COLORS.turquoise,
  },
  [NotificationChannel.SystemAnnouncements]: {
    name: 'System Announcements',
    description: 'General system updates and announcements',
    importance: Notifications.AndroidImportance.LOW,
    sound: null,
    vibrationPattern: [],
    lightColor: BVI_COLORS.atlantic,
  },
  [NotificationChannel.Default]: {
    name: 'Default',
    description: 'General notifications',
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: 'default',
    vibrationPattern: [0, 250, 250, 250],
    lightColor: BVI_COLORS.turquoise,
  },
};

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface PushNotificationToken {
  token: string;
  platform: 'ios' | 'android' | 'web';
  deviceId: string;
}

/**
 * Create Android notification channels
 */
async function createNotificationChannels(): Promise<void> {
  if (Platform.OS !== 'android') return;

  for (const [channelId, config] of Object.entries(CHANNEL_CONFIGS)) {
    await Notifications.setNotificationChannelAsync(channelId, {
      name: config.name,
      description: config.description,
      importance: config.importance,
      sound: config.sound,
      vibrationPattern: config.vibrationPattern,
      lightColor: config.lightColor,
      bypassDnd: config.bypassDnd,
      enableLights: true,
      enableVibrate: config.vibrationPattern.length > 0,
    });
  }
}

// Request permission and get push notification token
export async function registerForPushNotifications(): Promise<string | null> {
  // Create channels first (Android)
  await createNotificationChannels();

  if (!Device.isDevice) {
    console.warn('Push notifications require a physical device');
    return null;
  }

  // Check existing permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // Request permission if not granted
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('Push notification permission not granted');
    return null;
  }

  // Get Expo push token
  try {
    const projectId = Constants.expoConfig?.extra?.eas?.projectId || process.env.EXPO_PUBLIC_PROJECT_ID;
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    return tokenData.data;
  } catch (error) {
    console.error('Failed to get push token:', error);
    return null;
  }
}

// Register device token with backend
export async function registerDeviceToken(token: string): Promise<void> {
  try {
    const deviceId = Device.modelId || Device.deviceName || 'unknown';
    const platform = Platform.OS === 'ios' ? 'ios' : 'android';

    await apiClient.post('/notifications/register-device', {
      pushToken: token,
      platform,
      deviceId,
    });
  } catch (error) {
    console.error('Failed to register device token:', error);
    throw error;
  }
}

// Unregister device token from backend
export async function unregisterDeviceToken(token: string): Promise<void> {
  try {
    await apiClient.delete(`/devices/${encodeURIComponent(token)}`);
  } catch (error) {
    console.error('Failed to unregister device token:', error);
  }
}

// Initialize push notifications (call in app startup)
export async function initializePushNotifications(): Promise<string | null> {
  const token = await registerForPushNotifications();

  if (token) {
    await registerDeviceToken(token);
  }

  return token;
}

// Add notification listeners with telemetry
export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void
): Notifications.EventSubscription {
  return Notifications.addNotificationReceivedListener((notification) => {
    const data = notification.request.content.data;
    const channel = data?.channel as string;
    const notificationId = notification.request.identifier;

    // Track telemetry
    trackNotification(notificationId, channel || 'unknown', 'received');

    callback(notification);
  });
}

export function addNotificationResponseListener(
  callback: (response: Notifications.NotificationResponse) => void
): Notifications.EventSubscription {
  return Notifications.addNotificationResponseReceivedListener((response) => {
    const data = response.notification.request.content.data;
    const channel = data?.channel as string;
    const notificationId = response.notification.request.identifier;

    // Track telemetry
    trackNotification(notificationId, channel || 'unknown', 'opened');

    callback(response);
  });
}

// Schedule local notification with channel support
export async function scheduleLocalNotification(
  title: string,
  body: string,
  channel: NotificationChannel = NotificationChannel.Default,
  data?: Record<string, unknown>,
  trigger?: Notifications.NotificationTriggerInput
): Promise<string> {
  const config = CHANNEL_CONFIGS[channel];

  return await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: { ...data, channel },
      sound: config.sound || undefined,
      ...(Platform.OS === 'android' && {
        channelId: channel,
        color: config.lightColor,
      }),
    },
    trigger: trigger || null, // null = immediate
  });
}

/**
 * Show an immediate notification
 */
export async function showNotification(
  title: string,
  body: string,
  channel: NotificationChannel = NotificationChannel.Default,
  data?: Record<string, unknown>
): Promise<string> {
  return scheduleLocalNotification(title, body, channel, data, null);
}

/**
 * Show insurance expiry alert
 */
export async function showInsuranceExpiryAlert(
  permitNumber: string,
  daysUntilExpiry: number
): Promise<string> {
  const title = daysUntilExpiry <= 0 ? '⚠️ Insurance Expired' : '⚠️ Insurance Expiring Soon';
  const body =
    daysUntilExpiry <= 0
      ? `Insurance for permit ${permitNumber} has expired`
      : `Insurance for permit ${permitNumber} expires in ${daysUntilExpiry} days`;

  return showNotification(title, body, NotificationChannel.InsuranceExpiry, {
    permitNumber,
    daysUntilExpiry,
  });
}

/**
 * Show emergency flight alert
 */
export async function showEmergencyFlightAlert(
  applicationId: string,
  operatorName: string
): Promise<string> {
  return showNotification(
    '🚨 PRIORITY ONE - Emergency Flight',
    `Emergency flight permit request from ${operatorName} requires immediate review`,
    NotificationChannel.EmergencyFlights,
    { applicationId, priority: 'emergency' }
  );
}

/**
 * Show field operation notification
 */
export async function showFieldOpNotification(
  title: string,
  body: string,
  data?: Record<string, unknown>
): Promise<string> {
  return showNotification(title, body, NotificationChannel.FieldOps, data);
}

/**
 * Show sync completed notification
 */
export async function showSyncCompletedNotification(
  serviceLogsSynced: number,
  verificationsSynced: number
): Promise<string> {
  const total = serviceLogsSynced + verificationsSynced;
  return showNotification(
    '✅ Sync Complete',
    `Successfully synced ${total} items (${serviceLogsSynced} services, ${verificationsSynced} verifications)`,
    NotificationChannel.FieldOps,
    { serviceLogsSynced, verificationsSynced }
  );
}

// Cancel scheduled notification
export async function cancelNotification(identifier: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(identifier);
}

// Cancel all notifications
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

// Get badge count
export async function getBadgeCount(): Promise<number> {
  return await Notifications.getBadgeCountAsync();
}

// Set badge count
export async function setBadgeCount(count: number): Promise<void> {
  await Notifications.setBadgeCountAsync(count);
}

// Clear badge
export async function clearBadge(): Promise<void> {
  await Notifications.setBadgeCountAsync(0);
}

export { Notifications };
