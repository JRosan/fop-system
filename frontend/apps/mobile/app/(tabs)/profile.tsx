import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  User,
  Settings,
  Bell,
  HelpCircle,
  LogOut,
  ChevronRight,
  Shield,
  CreditCard,
  Mail,
  Phone,
  Building2,
  Wallet,
  Plane,
} from 'lucide-react-native';
import { useAuthStore } from '../../stores';
import { useNotificationStore } from '../../stores';
import { initializePushNotifications, unregisterDeviceToken } from '../../services/notifications';

const menuItems = [
  { icon: Wallet, label: 'Account & Invoices', href: '/account', requiresOperator: true },
  { icon: Plane, label: 'My Aircraft', href: '/aircraft', requiresOperator: true },
  { icon: Bell, label: 'Notification Settings', key: 'notifications' },
  { icon: CreditCard, label: 'Subscription', href: '/subscription' },
  { icon: HelpCircle, label: 'Help & Support', href: '/help' },
  { icon: Shield, label: 'Privacy Policy', href: '/privacy' },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout, loadUser } = useAuthStore();
  const { pushEnabled, setPushEnabled, pushToken, setPushToken } = useNotificationStore();
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const handleSignIn = () => {
    router.push('/login');
  };

  const handleLogout = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              // Unregister push notifications
              if (pushToken) {
                await unregisterDeviceToken(pushToken);
                setPushToken(null);
              }
              await logout();
              router.replace('/');
            } catch {
              Alert.alert('Error', 'Failed to sign out');
            }
          },
        },
      ]
    );
  };

  const handleToggleNotifications = async (enabled: boolean) => {
    setNotificationsLoading(true);
    try {
      if (enabled) {
        const token = await initializePushNotifications();
        if (token) {
          setPushToken(token);
          setPushEnabled(true);
        } else {
          Alert.alert(
            'Permission Required',
            'Please enable notifications in your device settings to receive updates.'
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
      setNotificationsLoading(false);
    }
  };

  const handleMenuPress = (item: typeof menuItems[0]) => {
    if (item.key === 'notifications') {
      // Show notification settings in an alert for now
      Alert.alert(
        'Notification Settings',
        'Manage which notifications you receive',
        [{ text: 'OK' }]
      );
    } else if (item.href) {
      router.push(item.href as never);
    }
  };

  if (isLoading && !user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#002D56" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        {isAuthenticated && user ? (
          <>
            <View style={styles.avatarAuthenticated}>
              <Text style={styles.avatarInitials}>
                {user.firstName[0]}{user.lastName[0]}
              </Text>
            </View>
            <Text style={styles.name}>{user.firstName} {user.lastName}</Text>
            <Text style={styles.email}>{user.email}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{user.role}</Text>
            </View>

            {/* Contact Info */}
            <View style={styles.contactInfo}>
              {user.phone && (
                <View style={styles.contactRow}>
                  <Phone size={14} color="#64748b" />
                  <Text style={styles.contactText}>{user.phone}</Text>
                </View>
              )}
              {user.companyName && (
                <View style={styles.contactRow}>
                  <Building2 size={14} color="#64748b" />
                  <Text style={styles.contactText}>{user.companyName}</Text>
                </View>
              )}
            </View>
          </>
        ) : (
          <>
            <View style={styles.avatar}>
              <User size={48} color="#002D56" />
            </View>
            <Text style={styles.name}>Guest User</Text>
            <Text style={styles.email}>Sign in to access all features</Text>
            <TouchableOpacity style={styles.signInButton} onPress={handleSignIn}>
              <Text style={styles.signInButtonText}>Sign In</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Push Notifications Toggle */}
      {isAuthenticated && (
        <View style={styles.notificationToggle}>
          <View style={styles.notificationToggleLeft}>
            <Bell size={24} color="#002D56" />
            <View style={styles.notificationToggleText}>
              <Text style={styles.notificationToggleLabel}>Push Notifications</Text>
              <Text style={styles.notificationToggleSubtext}>
                Receive updates about your applications
              </Text>
            </View>
          </View>
          {notificationsLoading ? (
            <ActivityIndicator size="small" color="#00A3B1" />
          ) : (
            <Switch
              value={pushEnabled}
              onValueChange={handleToggleNotifications}
              trackColor={{ false: '#e2e8f0', true: '#00A3B1' }}
              thumbColor="#fff"
            />
          )}
        </View>
      )}

      {/* Menu */}
      <View style={styles.menu}>
        {menuItems
          .filter((item) => !item.requiresOperator || (isAuthenticated && user?.operatorId))
          .map((item) => (
            <TouchableOpacity
              key={item.label}
              style={styles.menuItem}
              onPress={() => handleMenuPress(item)}
            >
              <item.icon size={24} color={item.requiresOperator ? '#C5A059' : '#64748b'} />
              <Text style={styles.menuItemLabel}>{item.label}</Text>
              <ChevronRight size={20} color="#94a3b8" />
            </TouchableOpacity>
          ))}
      </View>

      {/* Sign Out Button */}
      {isAuthenticated && (
        <TouchableOpacity style={styles.signOutButton} onPress={handleLogout}>
          <LogOut size={20} color="#ef4444" />
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      )}

      {/* App Info */}
      <View style={styles.appInfo}>
        <Shield size={32} color="#002D56" />
        <Text style={styles.appInfoTitle}>BVI FOP System</Text>
        <Text style={styles.appInfoVersion}>Version 1.0.0</Text>
        <Text style={styles.appInfoSubtext}>
          British Virgin Islands Civil Aviation Department
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FBFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FBFB',
  },
  header: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#e0f2fe',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarAuthenticated: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#002D56',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarInitials: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#002D56',
  },
  email: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  roleBadge: {
    marginTop: 12,
    paddingVertical: 4,
    paddingHorizontal: 12,
    backgroundColor: '#e0f2fe',
    borderRadius: 12,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0066e6',
  },
  contactInfo: {
    marginTop: 16,
    gap: 8,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#64748b',
  },
  signInButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 32,
    backgroundColor: '#002D56',
    borderRadius: 12,
  },
  signInButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  notificationToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    marginTop: 16,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  notificationToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  notificationToggleText: {
    flex: 1,
  },
  notificationToggleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  notificationToggleSubtext: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  menu: {
    backgroundColor: '#fff',
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  menuItemLabel: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
    marginLeft: 16,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fff',
    marginTop: 16,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fee2e2',
  },
  signOutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
  },
  appInfo: {
    alignItems: 'center',
    padding: 32,
  },
  appInfoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#002D56',
    marginTop: 12,
  },
  appInfoVersion: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  appInfoSubtext: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
    textAlign: 'center',
  },
});
