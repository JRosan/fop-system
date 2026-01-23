import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import {
  ArrowLeft,
  FileText,
  Plane,
  Building2,
  Calendar,
  Clock,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronRight,
  Upload,
  Eye,
} from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useApplicationStore, ApplicationDetails, ApplicationStatus } from '../../stores';

const statusConfig: Record<ApplicationStatus, { color: string; bgColor: string; icon: typeof CheckCircle }> = {
  Draft: { color: '#64748b', bgColor: '#f1f5f9', icon: FileText },
  Submitted: { color: '#0066e6', bgColor: '#e0f2fe', icon: Clock },
  UnderReview: { color: '#f59e0b', bgColor: '#fef3c7', icon: Eye },
  DocumentsRequested: { color: '#f97316', bgColor: '#ffedd5', icon: AlertCircle },
  Approved: { color: '#10b981', bgColor: '#d1fae5', icon: CheckCircle },
  Rejected: { color: '#ef4444', bgColor: '#fee2e2', icon: XCircle },
  Withdrawn: { color: '#6b7280', bgColor: '#f3f4f6', icon: XCircle },
};

export default function ApplicationDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { currentApplication, isLoading, error, fetchApplication, submitApplication, withdrawApplication, uploadDocument, clearError } = useApplicationStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (id) {
      fetchApplication(id);
    }
    return () => clearError();
  }, [id]);

  const onRefresh = async () => {
    if (!id) return;
    setRefreshing(true);
    await fetchApplication(id);
    setRefreshing(false);
  };

  const handleSubmit = async () => {
    if (!id) return;
    Alert.alert(
      'Submit Application',
      'Are you sure you want to submit this application for review?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit',
          onPress: async () => {
            try {
              await submitApplication(id);
              Alert.alert('Success', 'Application submitted successfully');
            } catch {
              Alert.alert('Error', 'Failed to submit application');
            }
          },
        },
      ]
    );
  };

  const handleWithdraw = async () => {
    if (!id) return;
    Alert.alert(
      'Withdraw Application',
      'Are you sure you want to withdraw this application?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Withdraw',
          style: 'destructive',
          onPress: async () => {
            try {
              await withdrawApplication(id);
              Alert.alert('Success', 'Application withdrawn');
            } catch {
              Alert.alert('Error', 'Failed to withdraw application');
            }
          },
        },
      ]
    );
  };

  const handleUploadDocument = async (documentType: string) => {
    if (!id) return;
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.[0]) return;

      const file = result.assets[0];
      await uploadDocument(id, {
        uri: file.uri,
        name: file.name,
        type: file.mimeType || 'application/octet-stream',
        documentType,
      });

      Alert.alert('Success', 'Document uploaded successfully');
    } catch {
      Alert.alert('Error', 'Failed to upload document');
    }
  };

  if (isLoading && !currentApplication) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066e6" />
        <Text style={styles.loadingText}>Loading application...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <AlertCircle size={48} color="#ef4444" />
        <Text style={styles.errorTitle}>Error</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => id && fetchApplication(id)}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!currentApplication) {
    return (
      <View style={styles.errorContainer}>
        <FileText size={48} color="#64748b" />
        <Text style={styles.errorTitle}>Not Found</Text>
        <Text style={styles.errorText}>Application not found</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const app = currentApplication;
  const status = statusConfig[app.status] || { color: '#64748b', bgColor: '#f1f5f9', icon: FileText };
  const StatusIcon = status.icon;

  return (
    <>
      <Stack.Screen
        options={{
          title: app.referenceNumber,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
              <ArrowLeft size={24} color="#002D56" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={[styles.statusBadge, { backgroundColor: status.bgColor }]}>
            <StatusIcon size={20} color={status.color} />
            <Text style={[styles.statusText, { color: status.color }]}>{app.status}</Text>
          </View>
          <Text style={styles.referenceNumber}>{app.referenceNumber}</Text>
          <Text style={styles.permitType}>{app.permitType} Permit</Text>
        </View>

        {/* Fee Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <DollarSign size={20} color="#C5A059" />
            <Text style={styles.cardTitle}>Fee Details</Text>
          </View>
          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>Total Fee</Text>
            <Text style={styles.feeAmount}>
              {app.currency || 'USD'} {(app.totalFee ?? 0).toLocaleString()}
            </Text>
          </View>
          <View style={styles.paymentStatus}>
            <Text style={styles.paymentLabel}>Payment Status:</Text>
            <View style={[
              styles.paymentBadge,
              { backgroundColor: app.paymentStatus === 'Paid' ? '#d1fae5' : '#fef3c7' }
            ]}>
              <Text style={[
                styles.paymentStatusText,
                { color: app.paymentStatus === 'Paid' ? '#10b981' : '#f59e0b' }
              ]}>
                {app.paymentStatus || 'Pending'}
              </Text>
            </View>
          </View>
        </View>

        {/* Operator Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Building2 size={20} color="#002D56" />
            <Text style={styles.cardTitle}>Operator</Text>
          </View>
          <Text style={styles.operatorName}>{app.operatorName || app.operator?.name || 'Unknown Operator'}</Text>
          {(app.operator?.country) && (
            <Text style={styles.operatorDetail}>{app.operator.country}</Text>
          )}
          {app.operator?.aocNumber && (
            <Text style={styles.operatorDetail}>AOC: {app.operator.aocNumber}</Text>
          )}
          {app.operator?.contactEmail && (
            <Text style={styles.operatorDetail}>{app.operator.contactEmail}</Text>
          )}
        </View>

        {/* Aircraft Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Plane size={20} color="#00A3B1" />
            <Text style={styles.cardTitle}>Aircraft</Text>
          </View>
          <Text style={styles.aircraftReg}>{app.aircraftRegistration || app.aircraft?.registration || 'N/A'}</Text>
          {(app.aircraftType || (app.aircraft?.manufacturer && app.aircraft?.model)) && (
            <Text style={styles.aircraftDetail}>
              {app.aircraftType || `${app.aircraft?.manufacturer || ''} ${app.aircraft?.model || ''}`.trim()}
            </Text>
          )}
          <View style={styles.aircraftSpecs}>
            <View style={styles.specItem}>
              <Text style={styles.specLabel}>MTOW</Text>
              <Text style={styles.specValue}>{(app.aircraft?.maxTakeoffWeight ?? 0).toLocaleString()} kg</Text>
            </View>
            <View style={styles.specItem}>
              <Text style={styles.specLabel}>Seats</Text>
              <Text style={styles.specValue}>{app.aircraft?.seatCapacity ?? 'N/A'}</Text>
            </View>
          </View>
        </View>

        {/* Flight Details Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Calendar size={20} color="#002D56" />
            <Text style={styles.cardTitle}>Flight Details</Text>
          </View>
          {app.flightPurpose && <Text style={styles.purposeText}>{app.flightPurpose}</Text>}
          <View style={styles.dateRow}>
            <View style={styles.dateItem}>
              <Text style={styles.dateLabel}>Start Date</Text>
              <Text style={styles.dateValue}>
                {new Date(app.requestedStartDate).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.dateItem}>
              <Text style={styles.dateLabel}>End Date</Text>
              <Text style={styles.dateValue}>
                {new Date(app.requestedEndDate).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Documents Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <FileText size={20} color="#002D56" />
            <Text style={styles.cardTitle}>Documents</Text>
          </View>
          {!app.documents || app.documents.length === 0 ? (
            <Text style={styles.emptyText}>No documents uploaded</Text>
          ) : (
            app.documents.map((doc) => (
              <View key={doc.id} style={styles.documentRow}>
                <View style={styles.documentInfo}>
                  <Text style={styles.documentType}>{doc.type}</Text>
                  <Text style={styles.documentName}>{doc.fileName}</Text>
                </View>
                <View style={[
                  styles.documentStatus,
                  {
                    backgroundColor:
                      doc.status === 'Verified' ? '#d1fae5' :
                      doc.status === 'Rejected' ? '#fee2e2' : '#f1f5f9'
                  }
                ]}>
                  <Text style={[
                    styles.documentStatusText,
                    {
                      color:
                        doc.status === 'Verified' ? '#10b981' :
                        doc.status === 'Rejected' ? '#ef4444' : '#64748b'
                    }
                  ]}>
                    {doc.status}
                  </Text>
                </View>
              </View>
            ))
          )}

          {app.status === 'Draft' || app.status === 'DocumentsRequested' ? (
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={() => handleUploadDocument('Supporting Document')}
            >
              <Upload size={18} color="#0066e6" />
              <Text style={styles.uploadButtonText}>Upload Document</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Timeline Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Clock size={20} color="#002D56" />
            <Text style={styles.cardTitle}>Timeline</Text>
          </View>
          {!app.timeline || app.timeline.length === 0 ? (
            <Text style={styles.emptyText}>No timeline events</Text>
          ) : (
            app.timeline.map((event, index) => (
              <View key={index} style={styles.timelineItem}>
                <View style={styles.timelineDot} />
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineAction}>{event.action}</Text>
                  <Text style={styles.timelineDate}>
                    {new Date(event.date).toLocaleDateString()} {new Date(event.date).toLocaleTimeString()}
                  </Text>
                  {event.notes && <Text style={styles.timelineNotes}>{event.notes}</Text>}
                </View>
              </View>
            ))
          )}
        </View>

        {/* Review Notes */}
        {app.reviewNotes && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <AlertCircle size={20} color="#f59e0b" />
              <Text style={styles.cardTitle}>Review Notes</Text>
            </View>
            <Text style={styles.reviewNotes}>{app.reviewNotes}</Text>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actionsContainer}>
          {app.status === 'Draft' && (
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.submitButtonText}>Submit Application</Text>
              <ChevronRight size={20} color="#fff" />
            </TouchableOpacity>
          )}

          {(app.status === 'Draft' || app.status === 'Submitted') && (
            <TouchableOpacity style={styles.withdrawButton} onPress={handleWithdraw}>
              <Text style={styles.withdrawButtonText}>Withdraw Application</Text>
            </TouchableOpacity>
          )}
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
    backgroundColor: '#0066e6',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  headerButton: {
    padding: 8,
  },
  statusCard: {
    margin: 16,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  referenceNumber: {
    marginTop: 16,
    fontSize: 24,
    fontWeight: '700',
    color: '#002D56',
  },
  permitType: {
    marginTop: 4,
    fontSize: 14,
    color: '#64748b',
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#002D56',
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  feeLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  feeAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#C5A059',
  },
  paymentStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  paymentLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  paymentBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  paymentStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  operatorName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  operatorDetail: {
    marginTop: 4,
    fontSize: 14,
    color: '#64748b',
  },
  aircraftReg: {
    fontSize: 20,
    fontWeight: '700',
    color: '#00A3B1',
  },
  aircraftDetail: {
    marginTop: 4,
    fontSize: 14,
    color: '#64748b',
  },
  aircraftSpecs: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 24,
  },
  specItem: {
    flex: 1,
  },
  specLabel: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 4,
  },
  specValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  purposeText: {
    fontSize: 14,
    color: '#1e293b',
    marginBottom: 12,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 24,
  },
  dateItem: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  emptyText: {
    fontSize: 14,
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  documentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  documentInfo: {
    flex: 1,
  },
  documentType: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
  },
  documentName: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  documentStatus: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  documentStatusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#0066e6',
    borderRadius: 8,
    borderStyle: 'dashed',
  },
  uploadButtonText: {
    color: '#0066e6',
    fontWeight: '600',
  },
  timelineItem: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#00A3B1',
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
  },
  timelineAction: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
  },
  timelineDate: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  timelineNotes: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
    fontStyle: 'italic',
  },
  reviewNotes: {
    fontSize: 14,
    color: '#1e293b',
    lineHeight: 20,
  },
  actionsContainer: {
    padding: 16,
    gap: 12,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#00A3B1',
    paddingVertical: 16,
    borderRadius: 12,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  withdrawButton: {
    alignItems: 'center',
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#ef4444',
    borderRadius: 12,
  },
  withdrawButtonText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 40,
  },
});
