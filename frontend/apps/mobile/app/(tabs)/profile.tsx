import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { User, Settings, Bell, HelpCircle, LogOut, ChevronRight } from 'lucide-react-native';

const menuItems = [
  { icon: Settings, label: 'Settings', href: '/settings' },
  { icon: Bell, label: 'Notifications', href: '/notifications' },
  { icon: HelpCircle, label: 'Help & Support', href: '/help' },
];

export default function ProfileScreen() {
  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <User size={48} color="#0066e6" />
        </View>
        <Text style={styles.name}>Guest User</Text>
        <Text style={styles.email}>Sign in to access all features</Text>
        <TouchableOpacity style={styles.signInButton}>
          <Text style={styles.signInButtonText}>Sign In</Text>
        </TouchableOpacity>
      </View>

      {/* Menu */}
      <View style={styles.menu}>
        {menuItems.map((item) => (
          <TouchableOpacity key={item.label} style={styles.menuItem}>
            <item.icon size={24} color="#64748b" />
            <Text style={styles.menuItemLabel}>{item.label}</Text>
            <ChevronRight size={20} color="#94a3b8" />
          </TouchableOpacity>
        ))}
      </View>

      {/* App Info */}
      <View style={styles.appInfo}>
        <Text style={styles.appInfoText}>BVI FOP System v1.0.0</Text>
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
    backgroundColor: '#f8fafc',
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
    backgroundColor: '#e6f1ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
  },
  email: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  signInButton: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 32,
    backgroundColor: '#0066e6',
    borderRadius: 8,
  },
  signInButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  menu: {
    backgroundColor: '#fff',
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
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
  appInfo: {
    alignItems: 'center',
    padding: 32,
  },
  appInfoText: {
    fontSize: 14,
    color: '#64748b',
  },
  appInfoSubtext: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },
});
