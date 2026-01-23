import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, ClipboardList, CheckCircle, CloudOff, MapPin } from 'lucide-react-native';
import { useOfflineStore, OfflineServiceLog, OfflineVerification, AirportServiceType } from '../../../stores';

// BVI Sovereign colors
const COLORS = {
  atlantic: '#002D56',
  turquoise: '#00A3B1',
  sand: '#F9FBFB',
  granite: '#4A5568',
  gold: '#C5A059',
};

type HistoryItem = {
  id: string;
  type: 'service' | 'verification';
  timestamp: string;
  data: OfflineServiceLog | OfflineVerification;
  isPending: boolean;
};

const SERVICE_LABELS: Record<AirportServiceType, string> = {
  [AirportServiceType.SewerageDumping]: 'Sewerage Dumping',
  [AirportServiceType.FireTruckStandby]: 'Fire Truck Standby',
  [AirportServiceType.FuelFlow]: 'Fuel Flow',
  [AirportServiceType.GroundHandling]: 'Ground Handling',
  [AirportServiceType.AircraftTowing]: 'Aircraft Towing',
  [AirportServiceType.WaterService]: 'Water Service',
  [AirportServiceType.GpuService]: 'GPU Service',
  [AirportServiceType.DeIcing]: 'De-Icing',
  [AirportServiceType.BaggageHandling]: 'Baggage Handling',
  [AirportServiceType.PassengerStairs]: 'Passenger Stairs',
  [AirportServiceType.LavatoryService]: 'Lavatory Service',
  [AirportServiceType.CateringAccess]: 'Catering Access',
};

export default function ServiceHistoryScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'services' | 'verifications'>('all');

  const {
    pendingServiceLogs,
    pendingVerifications,
    loadPersistedState,
  } = useOfflineStore();

  useEffect(() => {
    loadPersistedState();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    loadPersistedState();
    setRefreshing(false);
  }, [loadPersistedState]);

  // Combine and sort history items
  const historyItems: HistoryItem[] = [
    ...pendingServiceLogs.map((log) => ({
      id: log.offlineId,
      type: 'service' as const,
      timestamp: log.loggedAt,
      data: log,
      isPending: true,
    })),
    ...pendingVerifications.map((ver) => ({
      id: ver.offlineId,
      type: 'verification' as const,
      timestamp: ver.verifiedAt,
      data: ver,
      isPending: true,
    })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const filteredItems = historyItems.filter((item) => {
    if (filter === 'all') return true;
    if (filter === 'services') return item.type === 'service';
    if (filter === 'verifications') return item.type === 'verification';
    return true;
  });

  const renderItem = ({ item }: { item: HistoryItem }) => {
    if (item.type === 'service') {
      const log = item.data as OfflineServiceLog;
      return (
        <View style={styles.itemCard}>
          <View style={styles.itemHeader}>
            <View style={[styles.itemIcon, { backgroundColor: COLORS.gold + '20' }]}>
              <ClipboardList size={18} color={COLORS.gold} />
            </View>
            <View style={styles.itemInfo}>
              <Text style={styles.itemTitle}>{SERVICE_LABELS[log.serviceType]}</Text>
              <Text style={styles.itemSubtitle}>
                {log.airport} • Qty: {log.quantity}
              </Text>
            </View>
            {item.isPending && (
              <View style={styles.pendingBadge}>
                <CloudOff size={12} color={COLORS.gold} />
                <Text style={styles.pendingText}>Pending</Text>
              </View>
            )}
          </View>
          {log.permitNumber && (
            <Text style={styles.permitNumber}>Permit: {log.permitNumber}</Text>
          )}
          <Text style={styles.timestamp}>{formatTimestamp(log.loggedAt)}</Text>
        </View>
      );
    }

    const ver = item.data as OfflineVerification;
    const isValid = ver.result === 'Valid';
    return (
      <View style={styles.itemCard}>
        <View style={styles.itemHeader}>
          <View
            style={[
              styles.itemIcon,
              { backgroundColor: isValid ? COLORS.turquoise + '20' : '#ef444420' },
            ]}
          >
            <CheckCircle size={18} color={isValid ? COLORS.turquoise : '#ef4444'} />
          </View>
          <View style={styles.itemInfo}>
            <Text style={styles.itemTitle}>Permit Verification</Text>
            <Text style={styles.itemSubtitle}>
              Result: {ver.result}
              {ver.airport && ` • ${ver.airport}`}
            </Text>
          </View>
          {item.isPending && (
            <View style={styles.pendingBadge}>
              <CloudOff size={12} color={COLORS.gold} />
              <Text style={styles.pendingText}>Pending</Text>
            </View>
          )}
        </View>
        {ver.latitude && ver.longitude && (
          <View style={styles.locationRow}>
            <MapPin size={12} color={COLORS.granite} />
            <Text style={styles.locationText}>
              {ver.latitude.toFixed(4)}, {ver.longitude.toFixed(4)}
            </Text>
          </View>
        )}
        <Text style={styles.timestamp}>{formatTimestamp(ver.verifiedAt)}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={COLORS.atlantic} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Activity History</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabs}>
        {(['all', 'services', 'verifications'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.filterTab, filter === tab && styles.filterTabActive]}
            onPress={() => setFilter(tab)}
          >
            <Text
              style={[styles.filterTabText, filter === tab && styles.filterTabTextActive]}
            >
              {tab === 'all' ? 'All' : tab === 'services' ? 'Services' : 'Verifications'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.turquoise}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <ClipboardList size={48} color={COLORS.granite} />
            <Text style={styles.emptyTitle}>No Activity Yet</Text>
            <Text style={styles.emptySubtitle}>
              Service logs and verifications will appear here
            </Text>
          </View>
        }
      />
    </View>
  );
}

function formatTimestamp(timestamp: string): string {
  try {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return timestamp;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.sand,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.atlantic,
  },
  filterTabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
  },
  filterTabActive: {
    backgroundColor: COLORS.atlantic,
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.granite,
  },
  filterTabTextActive: {
    color: '#fff',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  itemCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.atlantic,
  },
  itemSubtitle: {
    fontSize: 13,
    color: COLORS.granite,
    marginTop: 2,
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gold + '15',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  pendingText: {
    fontSize: 11,
    color: COLORS.gold,
    fontWeight: '600',
  },
  permitNumber: {
    fontSize: 13,
    color: COLORS.turquoise,
    marginTop: 8,
    fontWeight: '500',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  locationText: {
    fontSize: 12,
    color: COLORS.granite,
    fontFamily: 'monospace',
  },
  timestamp: {
    fontSize: 12,
    color: COLORS.granite,
    marginTop: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.atlantic,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.granite,
    marginTop: 8,
    textAlign: 'center',
  },
});
