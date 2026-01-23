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
  Share,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import {
  ArrowLeft,
  FileText,
  Plane,
  Building2,
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Share2,
  Download,
  QrCode,
  Shield,
  Clock,
} from 'lucide-react-native';
import QRCode from 'react-native-qrcode-svg';
import { apiClient } from '../../services/api';

interface Permit {
  id: string;
  permitNumber: string;
  status: string;
  type?: string;
  permitType?: string;
  // Flat fields from API
  operatorName?: string;
  aircraftRegistration?: string;
  aircraftType?: string;
  // Nested fields (for backwards compatibility)
  operator?: {
    id: string;
    name: string;
    country: string;
    aocNumber?: string;
  };
  aircraft?: {
    id: string;
    registration: string;
    type: string;
    manufacturer: string;
    model: string;
  };
  validFrom: string;
  validUntil?: string;
  validTo?: string;
  issuedAt: string;
  issuedBy?: string;
  conditions?: string[];
  verificationUrl?: string;
  applicationId?: string;
}

const statusConfig: Record<string, { color: string; bgColor: string; icon: typeof CheckCircle }> = {
  Active: { color: '#10b981', bgColor: '#d1fae5', icon: CheckCircle },
  active: { color: '#10b981', bgColor: '#d1fae5', icon: CheckCircle },
  Expired: { color: '#64748b', bgColor: '#f1f5f9', icon: Clock },
  expired: { color: '#64748b', bgColor: '#f1f5f9', icon: Clock },
  Revoked: { color: '#ef4444', bgColor: '#fee2e2', icon: XCircle },
  revoked: { color: '#ef4444', bgColor: '#fee2e2', icon: XCircle },
  Suspended: { color: '#f59e0b', bgColor: '#fef3c7', icon: AlertTriangle },
  suspended: { color: '#f59e0b', bgColor: '#fef3c7', icon: AlertTriangle },
};

// Helper to get display values from flat or nested structure
const getOperatorName = (permit: Permit) => permit.operatorName || permit.operator?.name || 'Unknown Operator';
const getAircraftReg = (permit: Permit) => permit.aircraftRegistration || permit.aircraft?.registration || 'N/A';
const getAircraftType = (permit: Permit) => permit.aircraftType || permit.aircraft?.type || '';
const getAircraftDetails = (permit: Permit) => {
  if (permit.aircraft) {
    return `${permit.aircraft.manufacturer} ${permit.aircraft.model}`;
  }
  return permit.aircraftType || '';
};
const getValidTo = (permit: Permit) => permit.validUntil || permit.validTo || permit.validFrom;
const getPermitType = (permit: Permit) => permit.permitType || permit.type || 'Standard';
const getVerificationUrl = (permit: Permit) => permit.verificationUrl || `https://fop.bvi.gov/verify/${permit.permitNumber}`;
const getStatusLabel = (status: string) => status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

export default function PermitDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [permit, setPermit] = useState<Permit | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPermit = async () => {
    if (!id) return;
    try {
      const response = await apiClient.get<Permit>(`/permits/${id}`);
      setPermit(response.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load permit');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPermit();
  }, [id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPermit();
    setRefreshing(false);
  };

  const handleShare = async () => {
    if (!permit) return;
    const verifyUrl = getVerificationUrl(permit);
    try {
      await Share.share({
        title: `BVI Foreign Operator Permit - ${permit.permitNumber}`,
        message: `BVI Foreign Operator Permit\n\nPermit Number: ${permit.permitNumber}\nOperator: ${getOperatorName(permit)}\nAircraft: ${getAircraftReg(permit)}\nValid: ${new Date(permit.validFrom).toLocaleDateString()} - ${new Date(getValidTo(permit)).toLocaleDateString()}\n\nVerify at: ${verifyUrl}`,
        url: verifyUrl,
      });
    } catch (err) {
      console.error('Share failed:', err);
    }
  };

  const handleDownload = () => {
    Alert.alert(
      'Download Permit',
      'The permit PDF will be downloaded to your device.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Download',
          onPress: () => {
            // In a real app, this would trigger a download
            Alert.alert('Success', 'Permit downloaded to your device');
          },
        },
      ]
    );
  };

  const getDaysRemaining = () => {
    if (!permit) return 0;
    const now = new Date();
    const validToDate = new Date(getValidTo(permit));
    const diffTime = validToDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#002D56" />
        <Text style={styles.loadingText}>Loading permit...</Text>
      </View>
    );
  }

  if (error || !permit) {
    return (
      <View style={styles.errorContainer}>
        <FileText size={48} color="#64748b" />
        <Text style={styles.errorTitle}>Error</Text>
        <Text style={styles.errorText}>{error || 'Permit not found'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => fetchPermit()}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const status = statusConfig[permit.status] || { color: '#64748b', bgColor: '#f1f5f9', icon: Clock };
  const StatusIcon = status.icon;
  const daysRemaining = getDaysRemaining();

  return (
    <>
      <Stack.Screen
        options={{
          title: permit.permitNumber,
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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Permit Card with QR Code */}
        <View style={styles.permitCard}>
          <View style={styles.permitHeader}>
            <View style={styles.bviLogo}>
              <Shield size={32} color="#002D56" />
            </View>
            <View style={styles.permitTitleContainer}>
              <Text style={styles.permitTitle}>BRITISH VIRGIN ISLANDS</Text>
              <Text style={styles.permitSubtitle}>FOREIGN OPERATOR PERMIT</Text>
            </View>
          </View>

          <View style={styles.qrContainer}>
            <QRCode
              value={getVerificationUrl(permit)}
              size={160}
              backgroundColor="#fff"
              color="#002D56"
            />
            <Text style={styles.qrHint}>Scan to verify</Text>
          </View>

          <View style={styles.permitNumber}>
            <Text style={styles.permitNumberLabel}>Permit Number</Text>
            <Text style={styles.permitNumberValue}>{permit.permitNumber}</Text>
          </View>

          <View style={[styles.statusBadge, { backgroundColor: status.bgColor }]}>
            <StatusIcon size={18} color={status.color} />
            <Text style={[styles.statusText, { color: status.color }]}>{getStatusLabel(permit.status)}</Text>
          </View>

          {permit.status.toLowerCase() === 'active' && daysRemaining <= 30 && (
            <View style={styles.expiryWarning}>
              <AlertTriangle size={16} color="#f59e0b" />
              <Text style={styles.expiryWarningText}>
                Expires in {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}
              </Text>
            </View>
          )}
        </View>

        {/* Validity Period */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Calendar size={20} color="#002D56" />
            <Text style={styles.cardTitle}>Validity Period</Text>
          </View>
          <View style={styles.validityRow}>
            <View style={styles.validityItem}>
              <Text style={styles.validityLabel}>Valid From</Text>
              <Text style={styles.validityValue}>
                {new Date(permit.validFrom).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.validityDivider} />
            <View style={styles.validityItem}>
              <Text style={styles.validityLabel}>Valid To</Text>
              <Text style={styles.validityValue}>
                {new Date(getValidTo(permit)).toLocaleDateString()}
              </Text>
            </View>
          </View>
          <View style={styles.permitTypeRow}>
            <Text style={styles.permitTypeLabel}>Permit Type</Text>
            <View style={styles.permitTypeBadge}>
              <Text style={styles.permitTypeText}>{getPermitType(permit)}</Text>
            </View>
          </View>
        </View>

        {/* Operator Information */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Building2 size={20} color="#002D56" />
            <Text style={styles.cardTitle}>Operator</Text>
          </View>
          <Text style={styles.operatorName}>{getOperatorName(permit)}</Text>
          {permit.operator?.country && (
            <Text style={styles.operatorDetail}>{permit.operator.country}</Text>
          )}
          {permit.operator?.aocNumber && (
            <Text style={styles.operatorDetail}>AOC: {permit.operator.aocNumber}</Text>
          )}
        </View>

        {/* Aircraft Information */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Plane size={20} color="#00A3B1" />
            <Text style={styles.cardTitle}>Aircraft</Text>
          </View>
          <Text style={styles.aircraftReg}>{getAircraftReg(permit)}</Text>
          {getAircraftDetails(permit) && (
            <Text style={styles.aircraftDetail}>{getAircraftDetails(permit)}</Text>
          )}
          {getAircraftType(permit) && (
            <Text style={styles.aircraftDetail}>Type: {getAircraftType(permit)}</Text>
          )}
        </View>

        {/* Conditions */}
        {permit.conditions && permit.conditions.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <FileText size={20} color="#002D56" />
              <Text style={styles.cardTitle}>Conditions</Text>
            </View>
            {permit.conditions.map((condition, index) => (
              <View key={index} style={styles.conditionRow}>
                <Text style={styles.conditionNumber}>{index + 1}.</Text>
                <Text style={styles.conditionText}>{condition}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Issued Information */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <CheckCircle size={20} color="#10b981" />
            <Text style={styles.cardTitle}>Issued</Text>
          </View>
          <View style={styles.issuedRow}>
            <Text style={styles.issuedLabel}>Issued On</Text>
            <Text style={styles.issuedValue}>
              {new Date(permit.issuedAt).toLocaleDateString()}
            </Text>
          </View>
          {permit.issuedBy && (
            <View style={styles.issuedRow}>
              <Text style={styles.issuedLabel}>Issued By</Text>
              <Text style={styles.issuedValue}>{permit.issuedBy}</Text>
            </View>
          )}
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.downloadButton} onPress={handleDownload}>
            <Download size={20} color="#fff" />
            <Text style={styles.downloadButtonText}>Download PDF</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Share2 size={20} color="#002D56" />
            <Text style={styles.shareButtonText}>Share Permit</Text>
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
  permitCard: {
    margin: 16,
    padding: 24,
    backgroundColor: '#fff',
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 2,
    borderColor: '#002D56',
  },
  permitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  bviLogo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f9ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  permitTitleContainer: {
    alignItems: 'flex-start',
  },
  permitTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#002D56',
    letterSpacing: 1,
  },
  permitSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#00A3B1',
    letterSpacing: 0.5,
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  qrHint: {
    marginTop: 8,
    fontSize: 12,
    color: '#94a3b8',
  },
  permitNumber: {
    alignItems: 'center',
    marginBottom: 16,
  },
  permitNumberLabel: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 4,
  },
  permitNumberValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#002D56',
    letterSpacing: 2,
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
  expiryWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#fef3c7',
    borderRadius: 8,
  },
  expiryWarningText: {
    fontSize: 12,
    color: '#f59e0b',
    fontWeight: '500',
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
  validityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  validityItem: {
    flex: 1,
    alignItems: 'center',
  },
  validityDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e2e8f0',
  },
  validityLabel: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 4,
  },
  validityValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  permitTypeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  permitTypeLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  permitTypeBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    backgroundColor: '#e0f2fe',
    borderRadius: 8,
  },
  permitTypeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0066e6',
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
  conditionRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  conditionNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#002D56',
    width: 24,
  },
  conditionText: {
    flex: 1,
    fontSize: 14,
    color: '#1e293b',
    lineHeight: 20,
  },
  issuedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  issuedLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  issuedValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
  },
  actionsContainer: {
    padding: 16,
    gap: 12,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#002D56',
    paddingVertical: 16,
    borderRadius: 12,
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  shareButton: {
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
  shareButtonText: {
    color: '#002D56',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 40,
  },
});
