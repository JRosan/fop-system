import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import {
  ArrowLeft,
  Bell,
  FileText,
  CreditCard,
  AlertTriangle,
  Megaphone,
  Clock,
  Plane,
  Shield,
  Smartphone,
} from 'lucide-react-native';
import { useNotificationStore } from '../stores';
import { initializePushNotifications, unregisterDeviceToken } from '../services/notifications';

// BVI Sovereign colors
const COLORS = {
  atlantic: '#002D56',
  turquoise: '#00A3B1',
  sand: '#F9FBFB',
  granite: '#4A5568',
  gold: '#C5A059',
};

interface NotificationSetting {
  id: keyof typeof initialSettings;
  icon: typeof Bell;
  title: string;
  description: string;
  color: string;
  critical?: boolean;
}

const initialSettings = {
  applicationUpdates: true,
  permitAlerts: true,
  paymentReminders: true,
  systemAnnouncements: true,
  expirationWarnings: true,
  complianceAlerts: true,
  promotionalOffers: false,
  weeklyDigest: true,
};

const notificationSettings: NotificationSetting[] = [
  {
    id: 'applicationUpdates',
    icon: FileText,
    title: 'Application Updates',
    description: 'Status changes, approvals, and rejections',
    color: COLORS.turquoise,
  },
  {
    id: 'permitAlerts',
    icon: Plane,
    title: 'Permit Alerts',
    description: 'New permits issued and permit modifications',
    color: COLORS.atlantic,
  },
  {
    id: 'expirationWarnings',
    icon: Clock,
    title: 'Expiration Warnings',
    description: 'Reminders before permits and documents expire',
    color: COLORS.gold,
    critical: true,
  },
  {
    id: 'paymentReminders',
    icon: CreditCard,
    title: 'Payment Reminders',
    description: 'Invoice due dates and payment confirmations',
    color: '#10b981',
  },
  {
    id: 'complianceAlerts',
    icon: AlertTriangle,
    title: 'Compliance Alerts',
    description: 'Insurance expiry, document updates required',
    color: '#ef4444',
    critical: true,
  },
  {
    id: 'systemAnnouncements',
    icon: Megaphone,
    title: 'System Announcements',
    description: 'Maintenance, new features, and service updates',
    color: '#8b5cf6',
  },
  {
    id: 'weeklyDigest',
    icon: Shield,
    title: 'Weekly Digest',
    description: 'Summary of your activity and upcoming items',
    color: '#64748b',
  },
  {
    id: 'promotionalOffers',
    icon: Bell,
    title: 'Promotional Offers',
    description: 'Special offers and subscription deals',
    color: '#94a3b8',
  },
];

export default function NotificationsScreen() {
  const router = useRouter();
  const { pushEnabled, setPushEnabled, pushToken, setPushToken } = useNotificationStore();
  const [settings, setSettings] = useState(initialSettings);
  const [isLoading, setIsLoading] = useState(false);
  const [masterToggleLoading, setMasterToggleLoading] = useState(false);

  const handleMasterToggle = async (enabled: boolean) => {
    setMasterToggleLoading(true);
    try {
      if (enabled) {
        const token = await initializePushNotifications();
        if (token) {
          setPushToken(token);
          setPushEnabled(true);
        } else {
          Alert.alert(
            'Permission Required',
            'Please enable notifications in your device settings to receive updates.',
            [{ text: 'OK' }]
          );
        }
      } else {
        if (pushToken) {
          await unregisterDeviceToken(pushToken);
        }
        setPushEnabled(false);
      }
    } catch {
      Alert.alert('Error', 'Failed to update notification settings');
    } finally {
      setMasterToggleLoading(false);
    }
  };

  const handleSettingToggle = (settingId: keyof typeof settings) => {
    const setting = notificationSettings.find((s) => s.id === settingId);

    if (setting?.critical && settings[settingId]) {
      Alert.alert(
        'Critical Notification',
        `${setting.title} notifications are important for compliance. Are you sure you want to disable them?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Disable',
            style: 'destructive',
            onPress: () => {
              setSettings((prev) => ({ ...prev, [settingId]: !prev[settingId] }));
            },
          },
        ]
      );
    } else {
      setSettings((prev) => ({ ...prev, [settingId]: !prev[settingId] }));
    }
  };

  const enabledCount = Object.values(settings).filter(Boolean).length;

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Notification Settings',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
              <ArrowLeft size={24} color="#fff" />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Bell size={32} color={COLORS.atlantic} />
          </View>
          <Text style={styles.headerTitle}>Notifications</Text>
          <Text style={styles.headerSubtitle}>
            Manage how you receive updates and alerts
          </Text>
        </View>

        {/* Master Toggle */}
        <View style={styles.masterToggle}>
          <View style={styles.masterToggleLeft}>
            <View style={styles.masterToggleIcon}>
              <Smartphone size={24} color={pushEnabled ? COLORS.turquoise : '#94a3b8'} />
            </View>
            <View style={styles.masterToggleText}>
              <Text style={styles.masterToggleTitle}>Push Notifications</Text>
              <Text style={styles.masterToggleSubtitle}>
                {pushEnabled
                  ? `${enabledCount} of ${notificationSettings.length} types enabled`
                  : 'All notifications disabled'}
              </Text>
            </View>
          </View>
          {masterToggleLoading ? (
            <ActivityIndicator size="small" color={COLORS.turquoise} />
          ) : (
            <Switch
              value={pushEnabled}
              onValueChange={handleMasterToggle}
              trackColor={{ false: '#e2e8f0', true: COLORS.turquoise }}
              thumbColor="#fff"
            />
          )}
        </View>

        {/* Notification Categories */}
        {pushEnabled && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notification Types</Text>
            <View style={styles.settingsCard}>
              {notificationSettings.map((setting, index) => {
                const Icon = setting.icon;
                const isEnabled = settings[setting.id];
                const isLast = index === notificationSettings.length - 1;

                return (
                  <View
                    key={setting.id}
                    style={[styles.settingItem, isLast && styles.settingItemLast]}
                  >
                    <View style={styles.settingLeft}>
                      <View
                        style={[
                          styles.settingIcon,
                          { backgroundColor: `${setting.color}15` },
                        ]}
                      >
                        <Icon size={20} color={isEnabled ? setting.color : '#94a3b8'} />
                      </View>
                      <View style={styles.settingText}>
                        <View style={styles.settingTitleRow}>
                          <Text
                            style={[
                              styles.settingTitle,
                              !isEnabled && styles.settingTitleDisabled,
                            ]}
                          >
                            {setting.title}
                          </Text>
                          {setting.critical && (
                            <View style={styles.criticalBadge}>
                              <Text style={styles.criticalBadgeText}>Important</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.settingDescription}>{setting.description}</Text>
                      </View>
                    </View>
                    <Switch
                      value={isEnabled}
                      onValueChange={() => handleSettingToggle(setting.id)}
                      trackColor={{ false: '#e2e8f0', true: COLORS.turquoise }}
                      thumbColor="#fff"
                    />
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Info Section */}
        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <AlertTriangle size={20} color={COLORS.gold} />
            <Text style={styles.infoText}>
              Critical compliance notifications (expiration warnings, compliance alerts) are
              recommended to stay current with BVI aviation regulations.
            </Text>
          </View>
        </View>

        {/* Quiet Hours - Future Feature */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Options</Text>
          <View style={styles.settingsCard}>
            <View style={[styles.settingItem, styles.settingItemLast]}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: '#f1f5f9' }]}>
                  <Clock size={20} color="#64748b" />
                </View>
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Quiet Hours</Text>
                  <Text style={styles.settingDescription}>
                    Pause notifications during certain hours
                  </Text>
                </View>
              </View>
              <Text style={styles.comingSoon}>Coming Soon</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Notification preferences are synced across all your devices. You can also manage
            notifications in your device's system settings.
          </Text>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.sand,
  },
  headerButton: {
    padding: 8,
  },
  header: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#e0f2fe',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.atlantic,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.granite,
    textAlign: 'center',
    marginTop: 8,
  },
  masterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  masterToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  masterToggleIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e0f7fa',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  masterToggleText: {
    flex: 1,
  },
  masterToggleTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1e293b',
  },
  masterToggleSubtitle: {
    fontSize: 13,
    color: COLORS.granite,
    marginTop: 2,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.atlantic,
    marginBottom: 12,
  },
  settingsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  settingItemLast: {
    borderBottomWidth: 0,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1e293b',
  },
  settingTitleDisabled: {
    color: '#94a3b8',
  },
  settingDescription: {
    fontSize: 13,
    color: COLORS.granite,
    marginTop: 2,
  },
  criticalBadge: {
    backgroundColor: '#fef3c7',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  criticalBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#d97706',
  },
  comingSoon: {
    fontSize: 12,
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  infoSection: {
    paddingHorizontal: 16,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fef3c7',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#92400e',
    lineHeight: 18,
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 18,
  },
});
