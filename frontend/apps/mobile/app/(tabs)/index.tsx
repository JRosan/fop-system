import { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { FileText, Clock, CheckCircle, AlertTriangle, Plus, ChevronRight, Shield } from 'lucide-react-native';
import { useApplicationStore, usePermitStore, useAuthStore } from '../../stores';

// BVI Sovereign colors
const COLORS = {
  atlantic: '#002D56',
  turquoise: '#00A3B1',
  sand: '#F9FBFB',
  granite: '#4A5568',
  gold: '#C5A059',
};

export default function HomeScreen() {
  const router = useRouter();
  const { user, isAuthenticated, loadUser } = useAuthStore();
  const { applications, fetchApplications, isLoading: appsLoading } = useApplicationStore();
  const { permits, expiringSoon, fetchPermits, fetchExpiringSoon, isLoading: permitsLoading } = usePermitStore();

  const isLoading = appsLoading || permitsLoading;

  useEffect(() => {
    loadUser();
    fetchApplications();
    fetchPermits();
    fetchExpiringSoon(30); // Permits expiring within 30 days
  }, []);

  const handleRefresh = () => {
    fetchApplications();
    fetchPermits();
    fetchExpiringSoon(30);
  };

  // Calculate stats from real data
  const stats = useMemo(() => {
    const pendingStatuses = ['Draft', 'Submitted', 'UnderReview', 'DocumentsRequested'];
    const approvedStatuses = ['Approved'];

    const pendingCount = applications.filter(app => pendingStatuses.includes(app.status)).length;
    const approvedCount = applications.filter(app => approvedStatuses.includes(app.status)).length;
    const expiringCount = expiringSoon.length;

    return [
      {
        name: 'Applications',
        value: applications.length.toString(),
        icon: FileText,
        color: COLORS.atlantic,
        bgColor: '#e0f2fe',
      },
      {
        name: 'Pending',
        value: pendingCount.toString(),
        icon: Clock,
        color: '#f59e0b',
        bgColor: '#fef3c7',
      },
      {
        name: 'Active Permits',
        value: permits.filter(p => p.status.toLowerCase() === 'active').length.toString(),
        icon: CheckCircle,
        color: COLORS.turquoise,
        bgColor: '#ccfbf1',
      },
      {
        name: 'Expiring Soon',
        value: expiringCount.toString(),
        icon: AlertTriangle,
        color: COLORS.gold,
        bgColor: '#fef3c7',
      },
    ];
  }, [applications, permits, expiringSoon]);

  // Get recent activity (last 5 applications)
  const recentActivity = useMemo(() => {
    return [...applications]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [applications]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return { bg: '#dcfce7', text: '#15803d' };
      case 'Submitted':
      case 'UnderReview':
        return { bg: '#e0f2fe', text: '#0369a1' };
      case 'Draft':
        return { bg: '#f1f5f9', text: '#64748b' };
      case 'Rejected':
        return { bg: '#fee2e2', text: '#dc2626' };
      default:
        return { bg: '#f1f5f9', text: '#64748b' };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={handleRefresh}
          tintColor={COLORS.turquoise}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>
              {isAuthenticated && user ? `Welcome, ${user.firstName}` : 'Welcome'}
            </Text>
            <Text style={styles.subtitle}>BVI Foreign Operator Permit System</Text>
          </View>
          <View style={styles.logoContainer}>
            <Shield size={32} color="#fff" />
          </View>
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        {stats.map((stat) => (
          <View key={stat.name} style={styles.statCard}>
            <View style={[styles.iconContainer, { backgroundColor: stat.bgColor }]}>
              <stat.icon size={24} color={stat.color} />
            </View>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statName}>{stat.name}</Text>
          </View>
        ))}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionButtons}>
          <Link href="/application/new" asChild>
            <TouchableOpacity style={styles.actionButton}>
              <View style={[styles.actionIcon, { backgroundColor: '#e0f2fe' }]}>
                <Plus size={24} color={COLORS.atlantic} />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>New Application</Text>
                <Text style={styles.actionSubtitle}>Start a new FOP application</Text>
              </View>
              <ChevronRight size={20} color="#94a3b8" />
            </TouchableOpacity>
          </Link>

          <Link href="/(tabs)/permits" asChild>
            <TouchableOpacity style={styles.actionButton}>
              <View style={[styles.actionIcon, { backgroundColor: '#ccfbf1' }]}>
                <CheckCircle size={24} color={COLORS.turquoise} />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>View Permits</Text>
                <Text style={styles.actionSubtitle}>Manage your active permits</Text>
              </View>
              <ChevronRight size={20} color="#94a3b8" />
            </TouchableOpacity>
          </Link>
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {recentActivity.length > 0 && (
            <Link href="/(tabs)/applications" asChild>
              <TouchableOpacity>
                <Text style={styles.seeAllLink}>See All</Text>
              </TouchableOpacity>
            </Link>
          )}
        </View>

        {isLoading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator color={COLORS.turquoise} />
          </View>
        ) : recentActivity.length > 0 ? (
          <View style={styles.activityList}>
            {recentActivity.map((app) => {
              const statusStyle = getStatusColor(app.status);
              return (
                <TouchableOpacity
                  key={app.id}
                  style={styles.activityItem}
                  onPress={() => router.push(`/application/${app.id}` as never)}
                >
                  <View style={styles.activityInfo}>
                    <Text style={styles.activityTitle}>{app.referenceNumber}</Text>
                    <Text style={styles.activitySubtitle}>
                      {app.aircraftRegistration} • {formatDate(app.createdAt)}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                    <Text style={[styles.statusText, { color: statusStyle.text }]}>
                      {app.status}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <FileText size={48} color="#94a3b8" />
            <Text style={styles.emptyText}>No recent activity</Text>
            <Text style={styles.emptySubtext}>
              Your applications will appear here
            </Text>
          </View>
        )}
      </View>

      {/* Expiring Permits Warning */}
      {expiringSoon.length > 0 && (
        <View style={styles.section}>
          <View style={styles.warningCard}>
            <AlertTriangle size={24} color={COLORS.gold} />
            <View style={styles.warningContent}>
              <Text style={styles.warningTitle}>Permits Expiring Soon</Text>
              <Text style={styles.warningText}>
                {expiringSoon.length} permit{expiringSoon.length > 1 ? 's' : ''} will expire in the next 30 days
              </Text>
            </View>
            <Link href="/(tabs)/permits" asChild>
              <TouchableOpacity>
                <ChevronRight size={24} color={COLORS.gold} />
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      )}

      {/* Bottom Padding */}
      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.sand,
  },
  header: {
    padding: 20,
    paddingTop: 24,
    backgroundColor: COLORS.atlantic,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
  },
  logoContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 12,
    marginTop: -20,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.atlantic,
  },
  statName: {
    fontSize: 13,
    color: COLORS.granite,
    marginTop: 2,
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 20,
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
  seeAllLink: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.turquoise,
    marginBottom: 12,
  },
  actionButtons: {
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.atlantic,
  },
  actionSubtitle: {
    fontSize: 14,
    color: COLORS.granite,
    marginTop: 2,
  },
  loadingState: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
  },
  activityList: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.atlantic,
  },
  activitySubtitle: {
    fontSize: 13,
    color: COLORS.granite,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.atlantic,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.granite,
    marginTop: 4,
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffbeb',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#fde68a',
    gap: 12,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#92400e',
  },
  warningText: {
    fontSize: 13,
    color: '#a16207',
    marginTop: 2,
  },
});
