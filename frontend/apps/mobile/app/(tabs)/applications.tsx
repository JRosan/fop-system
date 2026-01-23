import { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Link, useRouter, useFocusEffect } from 'expo-router';
import {
  FileText,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  ChevronRight,
  Plane,
} from 'lucide-react-native';
import { useApplicationStore, Application, ApplicationStatus } from '../../stores';

const statusConfig: Record<ApplicationStatus, { color: string; bgColor: string; icon: typeof CheckCircle; label: string }> = {
  Draft: { color: '#64748b', bgColor: '#f1f5f9', icon: FileText, label: 'Draft' },
  Submitted: { color: '#0066e6', bgColor: '#e0f2fe', icon: Clock, label: 'Submitted' },
  UnderReview: { color: '#f59e0b', bgColor: '#fef3c7', icon: Eye, label: 'Under Review' },
  DocumentsRequested: { color: '#f97316', bgColor: '#ffedd5', icon: AlertCircle, label: 'Documents Requested' },
  Approved: { color: '#10b981', bgColor: '#d1fae5', icon: CheckCircle, label: 'Approved' },
  Rejected: { color: '#ef4444', bgColor: '#fee2e2', icon: XCircle, label: 'Rejected' },
  Withdrawn: { color: '#6b7280', bgColor: '#f3f4f6', icon: XCircle, label: 'Withdrawn' },
};

export default function ApplicationsScreen() {
  const router = useRouter();
  const { applications, isLoading, error, fetchApplications } = useApplicationStore();

  // Fetch applications when screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchApplications();
    }, [])
  );

  const handleApplicationPress = (application: Application) => {
    router.push(`/application/${application.id}`);
  };

  const renderApplicationItem = ({ item }: { item: Application }) => {
    const status = statusConfig[item.status];
    const StatusIcon = status.icon;

    return (
      <TouchableOpacity
        style={styles.applicationCard}
        onPress={() => handleApplicationPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.referenceContainer}>
            <Text style={styles.referenceNumber}>{item.referenceNumber}</Text>
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
            <Text style={styles.aircraftType}>{item.aircraftType}</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.permitTypeBadge}>
            <Text style={styles.permitTypeText}>{item.permitType}</Text>
          </View>
          <View style={styles.dateContainer}>
            <Text style={styles.dateLabel}>
              {new Date(item.requestedStartDate).toLocaleDateString()} - {new Date(item.requestedEndDate).toLocaleDateString()}
            </Text>
          </View>
        </View>

        <View style={styles.feeRow}>
          <Text style={styles.feeLabel}>Total Fee</Text>
          <Text style={styles.feeAmount}>
            {item.currency} {item.totalFee.toLocaleString()}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading && applications.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#002D56" />
        <Text style={styles.loadingText}>Loading applications...</Text>
      </View>
    );
  }

  if (error && applications.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <AlertCircle size={48} color="#ef4444" />
        <Text style={styles.errorTitle}>Error</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchApplications}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {applications.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <FileText size={48} color="#002D56" />
          </View>
          <Text style={styles.emptyTitle}>No applications yet</Text>
          <Text style={styles.emptySubtitle}>
            Create your first Foreign Operator Permit application to get started
          </Text>
          <Link href="/application/new" asChild>
            <TouchableOpacity style={styles.createButton}>
              <Plus size={20} color="#fff" />
              <Text style={styles.createButtonText}>New Application</Text>
            </TouchableOpacity>
          </Link>
        </View>
      ) : (
        <FlatList
          data={applications}
          keyExtractor={(item) => item.id}
          renderItem={renderApplicationItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={fetchApplications}
              colors={['#002D56']}
              tintColor="#002D56"
            />
          }
          ListHeaderComponent={
            <View style={styles.listHeader}>
              <Text style={styles.listHeaderText}>
                {applications.length} application{applications.length !== 1 ? 's' : ''}
              </Text>
            </View>
          }
        />
      )}

      {/* FAB */}
      {applications.length > 0 && (
        <Link href="/application/new" asChild>
          <TouchableOpacity style={styles.fab}>
            <Plus size={24} color="#fff" />
          </TouchableOpacity>
        </Link>
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
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  listHeader: {
    marginBottom: 12,
  },
  listHeaderText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  applicationCard: {
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
  referenceContainer: {
    flex: 1,
  },
  referenceNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#002D56',
    marginBottom: 6,
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
  aircraftType: {
    fontSize: 14,
    color: '#64748b',
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
    backgroundColor: '#e0f2fe',
    borderRadius: 8,
  },
  permitTypeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0066e6',
  },
  dateContainer: {
    alignItems: 'flex-end',
  },
  dateLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  feeLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  feeAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#C5A059',
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
    marginBottom: 24,
    lineHeight: 20,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00A3B1',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    gap: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#00A3B1',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
});
