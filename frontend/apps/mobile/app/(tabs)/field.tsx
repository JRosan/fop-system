import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { ScanLine, ClipboardList, CloudOff, RefreshCw, MapPin, History } from 'lucide-react-native';
import { useEffect, useState, useCallback } from 'react';
import { useOfflineStore, useLocationStore, BVI_AIRPORTS } from '../../stores';
import { useBiometricStore } from '../../stores/biometric';

// BVI Sovereign colors
const COLORS = {
  atlantic: '#002D56',
  turquoise: '#00A3B1',
  sand: '#F9FBFB',
  granite: '#4A5568',
  gold: '#C5A059',
};

export default function FieldOperationsScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const {
    pendingServiceLogs,
    pendingVerifications,
    lastSyncAt,
    isSyncing,
    syncWithServer,
    refreshCache,
    loadPersistedState,
  } = useOfflineStore();

  const {
    nearestAirport,
    distanceToNearestAirport,
    getCurrentLocation,
    checkPermissionStatus,
  } = useLocationStore();

  const { checkAvailability, loadSettings, biometricType, isBiometricEnabled } = useBiometricStore();

  useEffect(() => {
    // Initialize stores
    loadPersistedState();
    checkPermissionStatus();
    checkAvailability();
    loadSettings();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await getCurrentLocation();
    await refreshCache();
    setRefreshing(false);
  }, [getCurrentLocation, refreshCache]);

  const handleSync = async () => {
    await syncWithServer();
  };

  const pendingCount = pendingServiceLogs.length + pendingVerifications.length;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.turquoise} />
      }
    >
      {/* Location Status */}
      {nearestAirport && (
        <View style={styles.locationBanner}>
          <MapPin size={18} color={COLORS.turquoise} />
          <Text style={styles.locationText}>
            Near {BVI_AIRPORTS[nearestAirport].name}
            {distanceToNearestAirport && ` (${Math.round(distanceToNearestAirport)}m)`}
          </Text>
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity
            style={[styles.actionCard, styles.primaryAction]}
            onPress={() => router.push('/field/scan')}
          >
            <View style={styles.actionIconContainer}>
              <ScanLine size={32} color="#fff" />
            </View>
            <Text style={styles.actionTitle}>Scan Permit</Text>
            <Text style={styles.actionSubtitle}>Verify permit QR code</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/field/services/new')}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: COLORS.gold + '20' }]}>
              <ClipboardList size={32} color={COLORS.gold} />
            </View>
            <Text style={styles.actionTitle}>Log Service</Text>
            <Text style={styles.actionSubtitle}>Record airport fee</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Sync Status */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Sync Status</Text>
          <TouchableOpacity
            style={styles.syncButton}
            onPress={handleSync}
            disabled={isSyncing || pendingCount === 0}
          >
            <RefreshCw
              size={18}
              color={isSyncing || pendingCount === 0 ? COLORS.granite : COLORS.turquoise}
            />
            <Text
              style={[
                styles.syncButtonText,
                { color: isSyncing || pendingCount === 0 ? COLORS.granite : COLORS.turquoise },
              ]}
            >
              {isSyncing ? 'Syncing...' : 'Sync Now'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statusCard}>
          {pendingCount > 0 ? (
            <View style={styles.pendingStatus}>
              <CloudOff size={24} color={COLORS.gold} />
              <View style={styles.pendingInfo}>
                <Text style={styles.pendingCount}>{pendingCount} pending</Text>
                <Text style={styles.pendingDetail}>
                  {pendingServiceLogs.length} service logs, {pendingVerifications.length} verifications
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.syncedStatus}>
              <RefreshCw size={24} color={COLORS.turquoise} />
              <Text style={styles.syncedText}>All data synced</Text>
            </View>
          )}

          {lastSyncAt && (
            <Text style={styles.lastSyncText}>
              Last sync: {formatRelativeTime(lastSyncAt)}
            </Text>
          )}
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <TouchableOpacity onPress={() => router.push('/field/services/history')}>
            <Text style={styles.viewAllLink}>View All</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.historyCard}
          onPress={() => router.push('/field/services/history')}
        >
          <History size={24} color={COLORS.granite} />
          <View style={styles.historyInfo}>
            <Text style={styles.historyTitle}>Service History</Text>
            <Text style={styles.historySubtitle}>
              View logged services and verifications
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Security Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security</Text>
        <View style={styles.securityCard}>
          <View style={styles.securityRow}>
            <Text style={styles.securityLabel}>Biometric Auth</Text>
            <Text
              style={[
                styles.securityValue,
                { color: isBiometricEnabled ? COLORS.turquoise : COLORS.granite },
              ]}
            >
              {isBiometricEnabled ? `Enabled (${biometricType})` : 'Disabled'}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.sand,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  locationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.turquoise + '15',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  locationText: {
    fontSize: 14,
    color: COLORS.atlantic,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.atlantic,
    marginBottom: 12,
  },
  viewAllLink: {
    fontSize: 14,
    color: COLORS.turquoise,
    fontWeight: '500',
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  primaryAction: {
    backgroundColor: COLORS.atlantic,
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: COLORS.turquoise + '15',
  },
  syncButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  pendingStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pendingInfo: {
    flex: 1,
  },
  pendingCount: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gold,
  },
  pendingDetail: {
    fontSize: 13,
    color: COLORS.granite,
    marginTop: 2,
  },
  syncedStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  syncedText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.turquoise,
  },
  lastSyncText: {
    fontSize: 12,
    color: COLORS.granite,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  historyInfo: {
    flex: 1,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.atlantic,
  },
  historySubtitle: {
    fontSize: 13,
    color: COLORS.granite,
    marginTop: 2,
  },
  securityCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  securityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  securityLabel: {
    fontSize: 14,
    color: COLORS.granite,
  },
  securityValue: {
    fontSize: 14,
    fontWeight: '500',
  },
});
