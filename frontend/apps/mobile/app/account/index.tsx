import { useCallback, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useFocusEffect, Stack } from 'expo-router';
import {
  ArrowLeft,
  Wallet,
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  ChevronRight,
  Plane,
  Calendar,
  Filter,
  DollarSign,
} from 'lucide-react-native';
import { useInvoiceStore, useAuthStore, InvoiceSummary, InvoiceStatus } from '../../stores';

const statusConfig: Record<string, { color: string; bgColor: string; icon: typeof CheckCircle; label: string }> = {
  Draft: { color: '#64748b', bgColor: '#f1f5f9', icon: FileText, label: 'Draft' },
  Pending: { color: '#0066e6', bgColor: '#e0f2fe', icon: Clock, label: 'Pending' },
  PartiallyPaid: { color: '#f59e0b', bgColor: '#fef3c7', icon: DollarSign, label: 'Partial' },
  Paid: { color: '#10b981', bgColor: '#d1fae5', icon: CheckCircle, label: 'Paid' },
  Overdue: { color: '#ef4444', bgColor: '#fee2e2', icon: AlertTriangle, label: 'Overdue' },
  Cancelled: { color: '#6b7280', bgColor: '#f3f4f6', icon: XCircle, label: 'Cancelled' },
};

type FilterType = 'all' | 'pending' | 'overdue' | 'paid';

export default function AccountScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { invoices, accountStatus, isLoading, error, fetchInvoices, fetchAccountStatus } = useInvoiceStore();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const operatorId = user?.operatorId;

  const loadData = useCallback(async () => {
    if (!operatorId) return;

    let statuses: InvoiceStatus[] | undefined;
    switch (activeFilter) {
      case 'pending':
        statuses = ['Pending', 'PartiallyPaid'];
        break;
      case 'overdue':
        statuses = ['Overdue'];
        break;
      case 'paid':
        statuses = ['Paid'];
        break;
      default:
        statuses = undefined;
    }

    await Promise.all([
      fetchInvoices(operatorId, statuses),
      fetchAccountStatus(operatorId),
    ]);
  }, [operatorId, activeFilter, fetchInvoices, fetchAccountStatus]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleFilterChange = (filter: FilterType) => {
    setActiveFilter(filter);
  };

  const handleInvoicePress = (invoice: InvoiceSummary) => {
    router.push(`/account/invoice/${invoice.id}` as never);
  };

  const formatCurrency = (money: { amount: number; currency: string }) => {
    return `${money.currency} ${money.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const renderAccountSummary = () => {
    if (!accountStatus) return null;

    return (
      <View style={styles.accountSummary}>
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Wallet size={24} color="#002D56" />
            <Text style={styles.balanceLabel}>Current Balance</Text>
          </View>
          <Text style={[
            styles.balanceAmount,
            accountStatus.hasOverdueDebt && styles.balanceAmountOverdue
          ]}>
            {formatCurrency(accountStatus.currentBalance)}
          </Text>
          {accountStatus.hasOverdueDebt && (
            <View style={styles.overdueWarning}>
              <AlertTriangle size={14} color="#ef4444" />
              <Text style={styles.overdueWarningText}>
                {formatCurrency(accountStatus.totalOverdue)} overdue
              </Text>
            </View>
          )}
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{accountStatus.invoiceCount}</Text>
            <Text style={styles.statLabel}>Total Invoices</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#10b981' }]}>{accountStatus.paidInvoiceCount}</Text>
            <Text style={styles.statLabel}>Paid</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#ef4444' }]}>{accountStatus.overdueInvoiceCount}</Text>
            <Text style={styles.statLabel}>Overdue</Text>
          </View>
        </View>

        {!accountStatus.isEligibleForPermitIssuance && (
          <View style={styles.eligibilityWarning}>
            <AlertTriangle size={16} color="#dc2626" />
            <Text style={styles.eligibilityWarningText}>
              Outstanding debts must be cleared before new permits can be issued
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderInvoiceItem = ({ item }: { item: InvoiceSummary }) => {
    const status = statusConfig[item.status] || statusConfig.Pending;
    const StatusIcon = status.icon;

    return (
      <TouchableOpacity
        style={styles.invoiceCard}
        onPress={() => handleInvoicePress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.invoiceNumberContainer}>
            <Text style={styles.invoiceNumber}>{item.invoiceNumber}</Text>
            <View style={[styles.statusBadge, { backgroundColor: status.bgColor }]}>
              <StatusIcon size={12} color={status.color} />
              <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
            </View>
          </View>
          <ChevronRight size={20} color="#94a3b8" />
        </View>

        <View style={styles.cardBody}>
          {item.aircraftRegistration && (
            <View style={styles.infoRow}>
              <Plane size={14} color="#00A3B1" />
              <Text style={styles.aircraftText}>{item.aircraftRegistration}</Text>
            </View>
          )}
          <View style={styles.infoRow}>
            <Calendar size={14} color="#64748b" />
            <Text style={styles.dateText}>
              Flight: {new Date(item.flightDate).toLocaleDateString()}
            </Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.airportBadge}>
            <Text style={styles.airportText}>{item.arrivalAirport}</Text>
          </View>
          <View style={styles.amountContainer}>
            {item.balanceDue.amount > 0 ? (
              <>
                <Text style={styles.balanceDueLabel}>Balance Due</Text>
                <Text style={[styles.balanceDueAmount, item.isPastDue && styles.balanceDueOverdue]}>
                  {formatCurrency(item.balanceDue)}
                </Text>
              </>
            ) : (
              <Text style={styles.paidLabel}>Paid in Full</Text>
            )}
          </View>
        </View>

        {item.isPastDue && item.daysOverdue > 0 && (
          <View style={styles.overdueRow}>
            <AlertTriangle size={12} color="#ef4444" />
            <Text style={styles.overdueText}>{item.daysOverdue} days overdue</Text>
          </View>
        )}
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

  if (!operatorId) {
    return (
      <>
        <Stack.Screen
          options={{
            title: 'Account',
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
                <ArrowLeft size={24} color="#002D56" />
              </TouchableOpacity>
            ),
          }}
        />
        <View style={styles.emptyState}>
          <Wallet size={48} color="#64748b" />
          <Text style={styles.emptyTitle}>No Operator Account</Text>
          <Text style={styles.emptySubtitle}>
            You need to be associated with an operator to view account information
          </Text>
        </View>
      </>
    );
  }

  if (isLoading && invoices.length === 0 && !accountStatus) {
    return (
      <>
        <Stack.Screen
          options={{
            title: 'Account',
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
                <ArrowLeft size={24} color="#002D56" />
              </TouchableOpacity>
            ),
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#002D56" />
          <Text style={styles.loadingText}>Loading account...</Text>
        </View>
      </>
    );
  }

  if (error && invoices.length === 0) {
    return (
      <>
        <Stack.Screen
          options={{
            title: 'Account',
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
                <ArrowLeft size={24} color="#002D56" />
              </TouchableOpacity>
            ),
          }}
        />
        <View style={styles.errorContainer}>
          <AlertTriangle size={48} color="#ef4444" />
          <Text style={styles.errorTitle}>Error</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadData}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Account & Invoices',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
              <ArrowLeft size={24} color="#002D56" />
            </TouchableOpacity>
          ),
        }}
      />
      <View style={styles.container}>
        <FlatList
          data={invoices}
          keyExtractor={(item) => item.id}
          renderItem={renderInvoiceItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={loadData}
              colors={['#002D56']}
              tintColor="#002D56"
            />
          }
          ListHeaderComponent={
            <>
              {renderAccountSummary()}

              {/* Filter Bar */}
              <View style={styles.filterBar}>
                <Filter size={16} color="#64748b" style={styles.filterIcon} />
                <FilterButton filter="all" label="All" />
                <FilterButton filter="pending" label="Pending" />
                <FilterButton filter="overdue" label="Overdue" />
                <FilterButton filter="paid" label="Paid" />
              </View>

              <View style={styles.listHeader}>
                <Text style={styles.listHeaderText}>
                  {invoices.length} invoice{invoices.length !== 1 ? 's' : ''}
                </Text>
              </View>
            </>
          }
          ListEmptyComponent={
            <View style={styles.emptyList}>
              <FileText size={40} color="#94a3b8" />
              <Text style={styles.emptyListText}>
                {activeFilter === 'all'
                  ? 'No invoices yet'
                  : `No ${activeFilter} invoices`}
              </Text>
            </View>
          }
        />
      </View>
    </>
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
  headerButton: {
    padding: 8,
  },
  listContent: {
    paddingBottom: 32,
  },
  accountSummary: {
    padding: 16,
    gap: 12,
  },
  balanceCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#002D56',
  },
  balanceAmountOverdue: {
    color: '#dc2626',
  },
  overdueWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#fee2e2',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  overdueWarningText: {
    fontSize: 12,
    color: '#ef4444',
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#002D56',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  eligibilityWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  eligibilityWarningText: {
    flex: 1,
    fontSize: 13,
    color: '#dc2626',
    fontWeight: '500',
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
  listHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  listHeaderText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  invoiceCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
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
  invoiceNumberContainer: {
    flex: 1,
  },
  invoiceNumber: {
    fontSize: 16,
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
  aircraftText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00A3B1',
  },
  dateText: {
    fontSize: 13,
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
  airportBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: '#e0f2fe',
    borderRadius: 8,
  },
  airportText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0066e6',
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  balanceDueLabel: {
    fontSize: 11,
    color: '#64748b',
  },
  balanceDueAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#C5A059',
  },
  balanceDueOverdue: {
    color: '#ef4444',
  },
  paidLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10b981',
  },
  overdueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#fee2e2',
  },
  overdueText: {
    fontSize: 12,
    color: '#ef4444',
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#002D56',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  emptyList: {
    alignItems: 'center',
    padding: 32,
  },
  emptyListText: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 12,
  },
});
