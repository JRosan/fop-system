import { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import {
  Award,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  ChevronRight,
  Plane,
  Calendar,
  Filter,
} from 'lucide-react-native';
import { usePermitStore, PermitSummary, PermitStatus } from '../../stores';

const statusConfig: Record<string, { color: string; bgColor: string; icon: typeof CheckCircle; label: string }> = {
  active: { color: '#10b981', bgColor: '#d1fae5', icon: CheckCircle, label: 'Active' },
  expired: { color: '#6b7280', bgColor: '#f3f4f6', icon: Clock, label: 'Expired' },
  revoked: { color: '#ef4444', bgColor: '#fee2e2', icon: XCircle, label: 'Revoked' },
  suspended: { color: '#f59e0b', bgColor: '#fef3c7', icon: AlertTriangle, label: 'Suspended' },
  // Handle capitalized versions for API compatibility
  Active: { color: '#10b981', bgColor: '#d1fae5', icon: CheckCircle, label: 'Active' },
  Expired: { color: '#6b7280', bgColor: '#f3f4f6', icon: Clock, label: 'Expired' },
  Revoked: { color: '#ef4444', bgColor: '#fee2e2', icon: XCircle, label: 'Revoked' },
  Suspended: { color: '#f59e0b', bgColor: '#fef3c7', icon: AlertTriangle, label: 'Suspended' },
};

const permitTypeColors: Record<string, { bg: string; text: string }> = {
  OneTime: { bg: '#e0f2fe', text: '#0066e6' },
  Blanket: { bg: '#ede9fe', text: '#7c3aed' },
  Emergency: { bg: '#fee2e2', text: '#dc2626' },
};

type FilterType = 'all' | 'active' | 'expiring' | 'expired';

export default function PermitsScreen() {
  const router = useRouter();
  const { permits, isLoading, error, fetchPermits, fetchExpiringSoon } = usePermitStore();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const loadPermits = useCallback(async () => {
    switch (activeFilter) {
      case 'active':
        await fetchPermits(['active']);
        break;
      case 'expiring':
        await fetchExpiringSoon(30);
        break;
      case 'expired':
        await fetchPermits(['expired']);
        break;
      default:
        await fetchPermits();
    }
  }, [activeFilter, fetchPermits, fetchExpiringSoon]);

  useFocusEffect(
    useCallback(() => {
      loadPermits();
    }, [loadPermits])
  );

  const handleFilterChange = (filter: FilterType) => {
    setActiveFilter(filter);
  };

  const handlePermitPress = (permit: PermitSummary) => {
    router.push(`/permit/${permit.id}`);
  };

  const getDaysUntilExpiry = (validUntil: string): number => {
    const today = new Date();
    const expiry = new Date(validUntil);
    const diff = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getExpiryLabel = (validUntil: string): { text: string; color: string } | null => {
    const days = getDaysUntilExpiry(validUntil);
    if (days < 0) {
      return { text: 'Expired', color: '#6b7280' };
    }
    if (days <= 7) {
      return { text: `${days}d left`, color: '#ef4444' };
    }
    if (days <= 30) {
      return { text: `${days}d left`, color: '#f59e0b' };
    }
    return null;
  };

  const renderPermitItem = ({ item }: { item: PermitSummary }) => {
    const status = statusConfig[item.status] || statusConfig.active;
    const StatusIcon = status.icon;
    const typeColor = permitTypeColors[item.type] || permitTypeColors.OneTime;
    const isActive = item.status.toLowerCase() === 'active';
    const expiryLabel = isActive ? getExpiryLabel(item.validUntil) : null;

    return (
      <TouchableOpacity
        style={styles.permitCard}
        onPress={() => handlePermitPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.permitNumberContainer}>
            <Text style={styles.permitNumber}>{item.permitNumber}</Text>
            <View style={[styles.statusBadge, { backgroundColor: status.bgColor }]}>
              <StatusIcon size={12} color={status.color} />
              <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
            </View>
          </View>
          <ChevronRight size={20} color="#94a3b8" />
        </View>

        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <Plane size={16} color="#00A3B1" />
            <Text style={styles.operatorText}>{item.operatorName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.aircraftReg}>{item.aircraftRegistration}</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View style={[styles.permitTypeBadge, { backgroundColor: typeColor.bg }]}>
            <Text style={[styles.permitTypeText, { color: typeColor.text }]}>{item.type}</Text>
          </View>
          <View style={styles.dateContainer}>
            <View style={styles.dateRow}>
              <Calendar size={12} color="#64748b" />
              <Text style={styles.dateLabel}>
                {new Date(item.validFrom).toLocaleDateString()} - {new Date(item.validUntil).toLocaleDateString()}
              </Text>
            </View>
            {expiryLabel && (
              <View style={[styles.expiryBadge, { backgroundColor: `${expiryLabel.color}15` }]}>
                <Text style={[styles.expiryText, { color: expiryLabel.color }]}>{expiryLabel.text}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const FilterButton = ({ filter, label }: { filter: FilterType; label: string }) => (
    <TouchableOpacity
      style={[styles.filterButton, activeFilter === filter && styles.filterButtonActive]}
      onPress={() => handleFilterChange(filter)}
    >
      <Text style={[styles.filterButtonText, activeFilter === filter && styles.filterButtonTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  if (isLoading && permits.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#002D56" />
        <Text style={styles.loadingText}>Loading permits...</Text>
      </View>
    );
  }

  if (error && permits.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <AlertTriangle size={48} color="#ef4444" />
        <Text style={styles.errorTitle}>Error</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadPermits}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Filter Bar */}
      <View style={styles.filterBar}>
        <Filter size={16} color="#64748b" style={styles.filterIcon} />
        <FilterButton filter="all" label="All" />
        <FilterButton filter="active" label="Active" />
        <FilterButton filter="expiring" label="Expiring" />
        <FilterButton filter="expired" label="Expired" />
      </View>

      {permits.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <Award size={48} color="#002D56" />
          </View>
          <Text style={styles.emptyTitle}>No permits found</Text>
          <Text style={styles.emptySubtitle}>
            {activeFilter === 'all'
              ? 'Approved applications will generate permits that appear here'
              : `No ${activeFilter} permits at the moment`}
          </Text>
        </View>
      ) : (
        <FlatList
          data={permits}
          keyExtractor={(item) => item.id}
          renderItem={renderPermitItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={loadPermits}
              colors={['#002D56']}
              tintColor="#002D56"
            />
          }
          ListHeaderComponent={
            <View style={styles.listHeader}>
              <Text style={styles.listHeaderText}>
                {permits.length} permit{permits.length !== 1 ? 's' : ''}
              </Text>
            </View>
          }
        />
      )}
    </View>
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
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748b',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FBFB',
    padding: 24,
  },
  errorTitle: {
    marginTop: 16,
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
  },
  errorText: {
    marginTop: 8,
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#002D56',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    gap: 8,
  },
  filterIcon: {
    marginRight: 4,
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
  },
  filterButtonActive: {
    backgroundColor: '#002D56',
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748b',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  listHeader: {
    marginBottom: 12,
  },
  listHeaderText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  permitCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  permitNumberContainer: {
    flex: 1,
  },
  permitNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#002D56',
    marginBottom: 6,
    fontFamily: 'monospace',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardBody: {
    marginBottom: 12,
    gap: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  operatorText: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '500',
  },
  aircraftReg: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00A3B1',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  permitTypeBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  permitTypeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  dateContainer: {
    alignItems: 'flex-end',
    gap: 4,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  expiryBadge: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  expiryText: {
    fontSize: 10,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#e0f2fe',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#002D56',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
});
