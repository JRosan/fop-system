import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Share,
  Linking,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import {
  ArrowLeft,
  FileText,
  Plane,
  Calendar,
  MapPin,
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  DollarSign,
  Share2,
  Download,
  CreditCard,
  ExternalLink,
  Banknote,
} from 'lucide-react-native';
import { useInvoiceStore, Invoice, InvoiceLineItem, Payment } from '../../../stores';
import { paymentService } from '../../../services';

const statusConfig: Record<string, { color: string; bgColor: string; icon: typeof CheckCircle; label: string }> = {
  Draft: { color: '#64748b', bgColor: '#f1f5f9', icon: FileText, label: 'Draft' },
  Pending: { color: '#0066e6', bgColor: '#e0f2fe', icon: Clock, label: 'Pending Payment' },
  PartiallyPaid: { color: '#f59e0b', bgColor: '#fef3c7', icon: DollarSign, label: 'Partially Paid' },
  Paid: { color: '#10b981', bgColor: '#d1fae5', icon: CheckCircle, label: 'Paid in Full' },
  Overdue: { color: '#ef4444', bgColor: '#fee2e2', icon: AlertTriangle, label: 'Overdue' },
  Cancelled: { color: '#6b7280', bgColor: '#f3f4f6', icon: XCircle, label: 'Cancelled' },
};

export default function InvoiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { currentInvoice, isLoading, error, fetchInvoice, clearCurrentInvoice } = useInvoiceStore();
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  useEffect(() => {
    if (id) {
      fetchInvoice(id);
    }
    return () => clearCurrentInvoice();
  }, [id]);

  const handleRefresh = () => {
    if (id) {
      fetchInvoice(id);
    }
  };

  const formatCurrency = (money: { amount: number; currency: string }) => {
    return `${money.currency} ${money.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleShare = async () => {
    if (!currentInvoice) return;
    try {
      await Share.share({
        title: `Invoice ${currentInvoice.invoiceNumber}`,
        message: `BVI Aviation Authority Invoice\n\nInvoice: ${currentInvoice.invoiceNumber}\nAmount Due: ${formatCurrency(currentInvoice.balanceDue)}\nDue Date: ${new Date(currentInvoice.dueDate).toLocaleDateString()}`,
      });
    } catch (err) {
      console.error('Share failed:', err);
    }
  };

  const handleDownload = () => {
    Alert.alert(
      'Download Invoice',
      'The invoice PDF will be downloaded to your device.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Download',
          onPress: () => {
            Alert.alert('Success', 'Invoice downloaded to your device');
          },
        },
      ]
    );
  };

  const handlePayNow = () => {
    if (!currentInvoice) return;

    Alert.alert(
      'Payment Options',
      `Pay ${formatCurrency(currentInvoice.balanceDue)} for invoice ${currentInvoice.invoiceNumber}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Pay Online',
          onPress: handleOnlinePayment,
        },
        {
          text: 'Other Methods',
          onPress: showAlternativePaymentOptions,
        },
      ]
    );
  };

  const handleOnlinePayment = async () => {
    if (!currentInvoice || isProcessingPayment) return;

    setIsProcessingPayment(true);
    try {
      await paymentService.openCheckout(currentInvoice.id);
    } catch (err) {
      Alert.alert(
        'Payment Error',
        'Unable to open payment page. Please try again or contact support.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const showAlternativePaymentOptions = () => {
    Alert.alert(
      'Alternative Payment Methods',
      'You can pay by:\n\n' +
        '• Bank Transfer\n' +
        '  Account: BVI Aviation Authority\n' +
        '  Bank: First Caribbean International\n\n' +
        '• Check payable to:\n' +
        '  "BVI Civil Aviation Department"\n\n' +
        '• In-person at:\n' +
        '  Road Town, Tortola\n\n' +
        `Reference: ${currentInvoice?.invoiceNumber}`,
      [
        { text: 'Close' },
        {
          text: 'Contact Us',
          onPress: () => Linking.openURL('tel:+12844943701'),
        },
      ]
    );
  };

  if (isLoading && !currentInvoice) {
    return (
      <>
        <Stack.Screen
          options={{
            title: 'Invoice',
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
                <ArrowLeft size={24} color="#002D56" />
              </TouchableOpacity>
            ),
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#002D56" />
          <Text style={styles.loadingText}>Loading invoice...</Text>
        </View>
      </>
    );
  }

  if (error || !currentInvoice) {
    return (
      <>
        <Stack.Screen
          options={{
            title: 'Invoice',
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
                <ArrowLeft size={24} color="#002D56" />
              </TouchableOpacity>
            ),
          }}
        />
        <View style={styles.errorContainer}>
          <FileText size={48} color="#64748b" />
          <Text style={styles.errorTitle}>Error</Text>
          <Text style={styles.errorText}>{error || 'Invoice not found'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  }

  const status = statusConfig[currentInvoice.status] || statusConfig.Pending;
  const StatusIcon = status.icon;

  return (
    <>
      <Stack.Screen
        options={{
          title: currentInvoice.invoiceNumber,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
              <ArrowLeft size={24} color="#002D56" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={handleShare} style={styles.headerButton}>
              <Share2 size={24} color="#002D56" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
        }
      >
        {/* Invoice Header */}
        <View style={styles.invoiceHeader}>
          <View style={styles.invoiceHeaderTop}>
            <View>
              <Text style={styles.invoiceNumberLabel}>Invoice Number</Text>
              <Text style={styles.invoiceNumber}>{currentInvoice.invoiceNumber}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: status.bgColor }]}>
              <StatusIcon size={16} color={status.color} />
              <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
            </View>
          </View>

          {currentInvoice.isPastDue && currentInvoice.daysOverdue > 0 && (
            <View style={styles.overdueAlert}>
              <AlertTriangle size={16} color="#dc2626" />
              <Text style={styles.overdueAlertText}>
                This invoice is {currentInvoice.daysOverdue} days overdue
              </Text>
            </View>
          )}
        </View>

        {/* Amount Summary */}
        <View style={styles.amountCard}>
          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>Subtotal</Text>
            <Text style={styles.amountValue}>{formatCurrency(currentInvoice.subtotal)}</Text>
          </View>
          {currentInvoice.totalInterest.amount > 0 && (
            <View style={styles.amountRow}>
              <Text style={styles.amountLabel}>Interest</Text>
              <Text style={[styles.amountValue, { color: '#ef4444' }]}>
                {formatCurrency(currentInvoice.totalInterest)}
              </Text>
            </View>
          )}
          <View style={[styles.amountRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatCurrency(currentInvoice.totalAmount)}</Text>
          </View>
          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>Paid</Text>
            <Text style={[styles.amountValue, { color: '#10b981' }]}>
              -{formatCurrency(currentInvoice.amountPaid)}
            </Text>
          </View>
          <View style={[styles.amountRow, styles.balanceRow]}>
            <Text style={styles.balanceLabel}>Balance Due</Text>
            <Text style={[
              styles.balanceValue,
              currentInvoice.isPastDue && styles.balanceValueOverdue
            ]}>
              {formatCurrency(currentInvoice.balanceDue)}
            </Text>
          </View>
        </View>

        {/* Flight Details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Flight Details</Text>
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <MapPin size={16} color="#64748b" />
              <View>
                <Text style={styles.detailLabel}>Airport</Text>
                <Text style={styles.detailValue}>{currentInvoice.arrivalAirport}</Text>
              </View>
            </View>
            <View style={styles.detailItem}>
              <Calendar size={16} color="#64748b" />
              <View>
                <Text style={styles.detailLabel}>Flight Date</Text>
                <Text style={styles.detailValue}>
                  {new Date(currentInvoice.flightDate).toLocaleDateString()}
                </Text>
              </View>
            </View>
            {currentInvoice.aircraftRegistration && (
              <View style={styles.detailItem}>
                <Plane size={16} color="#00A3B1" />
                <View>
                  <Text style={styles.detailLabel}>Aircraft</Text>
                  <Text style={styles.detailValue}>{currentInvoice.aircraftRegistration}</Text>
                </View>
              </View>
            )}
            <View style={styles.detailItem}>
              <FileText size={16} color="#64748b" />
              <View>
                <Text style={styles.detailLabel}>Operation</Text>
                <Text style={styles.detailValue}>{currentInvoice.operationType}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Dates */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Important Dates</Text>
          <View style={styles.dateRow}>
            <Text style={styles.dateLabel}>Invoice Date</Text>
            <Text style={styles.dateValue}>
              {new Date(currentInvoice.invoiceDate).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.dateRow}>
            <Text style={styles.dateLabel}>Due Date</Text>
            <Text style={[styles.dateValue, currentInvoice.isPastDue && styles.dateValueOverdue]}>
              {new Date(currentInvoice.dueDate).toLocaleDateString()}
            </Text>
          </View>
        </View>

        {/* Line Items */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Fee Breakdown</Text>
          {currentInvoice.lineItems.map((item: InvoiceLineItem) => (
            <View key={item.id} style={styles.lineItem}>
              <View style={styles.lineItemHeader}>
                <Text style={[
                  styles.lineItemDescription,
                  item.isInterestCharge && styles.lineItemInterest
                ]}>
                  {item.description}
                </Text>
                <Text style={[
                  styles.lineItemAmount,
                  item.isInterestCharge && styles.lineItemInterest
                ]}>
                  {formatCurrency(item.amount)}
                </Text>
              </View>
              {item.quantity !== 1 && (
                <Text style={styles.lineItemDetail}>
                  {item.quantity} {item.quantityUnit || 'units'} × {formatCurrency(item.unitRate)}
                </Text>
              )}
            </View>
          ))}
        </View>

        {/* Payments */}
        {currentInvoice.payments.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Payment History</Text>
            {currentInvoice.payments.map((payment: Payment) => (
              <View key={payment.id} style={styles.paymentItem}>
                <View style={styles.paymentHeader}>
                  <CreditCard size={16} color="#10b981" />
                  <Text style={styles.paymentAmount}>{formatCurrency(payment.amount)}</Text>
                </View>
                <Text style={styles.paymentMethod}>{payment.method}</Text>
                {payment.paymentDate && (
                  <Text style={styles.paymentDate}>
                    {new Date(payment.paymentDate).toLocaleDateString()}
                  </Text>
                )}
                {payment.receiptNumber && (
                  <Text style={styles.paymentReceipt}>Receipt: {payment.receiptNumber}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Actions */}
        <View style={styles.actionsContainer}>
          {currentInvoice.balanceDue.amount > 0 && (
            <TouchableOpacity
              style={[styles.payButton, isProcessingPayment && styles.payButtonDisabled]}
              onPress={handlePayNow}
              disabled={isProcessingPayment}
            >
              {isProcessingPayment ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <CreditCard size={20} color="#fff" />
              )}
              <Text style={styles.payButtonText}>
                {isProcessingPayment ? 'Processing...' : 'Pay Now'}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.downloadButton} onPress={handleDownload}>
            <Download size={20} color="#002D56" />
            <Text style={styles.downloadButtonText}>Download PDF</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
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
  invoiceHeader: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  invoiceHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  invoiceNumberLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  invoiceNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#002D56',
    fontFamily: 'monospace',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    gap: 6,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  overdueAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    padding: 12,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  overdueAlertText: {
    fontSize: 13,
    color: '#dc2626',
    fontWeight: '500',
  },
  amountCard: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  amountLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  amountValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    marginTop: 8,
    paddingTop: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#002D56',
  },
  balanceRow: {
    borderTopWidth: 2,
    borderTopColor: '#002D56',
    marginTop: 8,
    paddingTop: 12,
  },
  balanceLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#002D56',
  },
  balanceValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#C5A059',
  },
  balanceValueOverdue: {
    color: '#ef4444',
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#002D56',
    marginBottom: 16,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    width: '45%',
  },
  detailLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  dateLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
  },
  dateValueOverdue: {
    color: '#ef4444',
    fontWeight: '600',
  },
  lineItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  lineItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  lineItemDescription: {
    flex: 1,
    fontSize: 14,
    color: '#1e293b',
    marginRight: 16,
  },
  lineItemAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  lineItemInterest: {
    color: '#ef4444',
  },
  lineItemDetail: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  paymentItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  paymentAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10b981',
  },
  paymentMethod: {
    fontSize: 14,
    color: '#1e293b',
  },
  paymentDate: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  paymentReceipt: {
    fontSize: 12,
    color: '#64748b',
    fontFamily: 'monospace',
  },
  actionsContainer: {
    padding: 16,
    gap: 12,
  },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#00A3B1',
    paddingVertical: 16,
    borderRadius: 12,
  },
  payButtonDisabled: {
    backgroundColor: '#94a3b8',
  },
  payButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#002D56',
  },
  downloadButtonText: {
    color: '#002D56',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 40,
  },
});
