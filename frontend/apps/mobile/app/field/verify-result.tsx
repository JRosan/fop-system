import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { CheckCircle, XCircle, AlertTriangle, Calendar, Plane, Building2, ArrowLeft, ClipboardList } from 'lucide-react-native';
import { VerificationResult } from '../../stores';

// BVI Sovereign colors
const COLORS = {
  atlantic: '#002D56',
  turquoise: '#00A3B1',
  sand: '#F9FBFB',
  granite: '#4A5568',
  gold: '#C5A059',
};

export default function VerifyResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    success: string;
    result: VerificationResult;
    permitNumber: string;
    operatorName: string;
    aircraftRegistration: string;
    validFrom: string;
    validUntil: string;
    failureReason: string;
  }>();

  const isSuccess = params.success === '1';
  const isWarning = params.result === VerificationResult.Expired || params.result === VerificationResult.TokenExpired;

  const getStatusConfig = () => {
    if (isSuccess) {
      return {
        icon: <CheckCircle size={64} color={COLORS.turquoise} />,
        title: 'Permit Valid',
        subtitle: 'This permit is active and authorized',
        bgColor: COLORS.turquoise + '15',
        borderColor: COLORS.turquoise,
      };
    }

    if (isWarning) {
      return {
        icon: <AlertTriangle size={64} color={COLORS.gold} />,
        title: params.result === VerificationResult.Expired ? 'Permit Expired' : 'Token Expired',
        subtitle:
          params.result === VerificationResult.Expired
            ? 'This permit has passed its validity period'
            : 'Offline verification token needs refresh',
        bgColor: COLORS.gold + '15',
        borderColor: COLORS.gold,
      };
    }

    return {
      icon: <XCircle size={64} color="#ef4444" />,
      title: getResultTitle(params.result),
      subtitle: params.failureReason || 'Verification could not be completed',
      bgColor: '#ef444415',
      borderColor: '#ef4444',
    };
  };

  const statusConfig = getStatusConfig();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={COLORS.atlantic} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verification Result</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Status Card */}
        <View
          style={[
            styles.statusCard,
            { backgroundColor: statusConfig.bgColor, borderColor: statusConfig.borderColor },
          ]}
        >
          {statusConfig.icon}
          <Text style={styles.statusTitle}>{statusConfig.title}</Text>
          <Text style={styles.statusSubtitle}>{statusConfig.subtitle}</Text>
        </View>

        {/* Permit Details (only show if we have data) */}
        {params.permitNumber && (
          <View style={styles.detailsCard}>
            <Text style={styles.detailsTitle}>Permit Details</Text>

            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Text style={styles.detailLabel}>Permit #</Text>
              </View>
              <Text style={styles.detailValue}>{params.permitNumber}</Text>
            </View>

            {params.operatorName && (
              <View style={styles.detailRow}>
                <View style={styles.detailIcon}>
                  <Building2 size={18} color={COLORS.granite} />
                </View>
                <View>
                  <Text style={styles.detailLabel}>Operator</Text>
                  <Text style={styles.detailValue}>{params.operatorName}</Text>
                </View>
              </View>
            )}

            {params.aircraftRegistration && (
              <View style={styles.detailRow}>
                <View style={styles.detailIcon}>
                  <Plane size={18} color={COLORS.granite} />
                </View>
                <View>
                  <Text style={styles.detailLabel}>Aircraft</Text>
                  <Text style={styles.detailValue}>{params.aircraftRegistration}</Text>
                </View>
              </View>
            )}

            {params.validFrom && params.validUntil && (
              <View style={styles.detailRow}>
                <View style={styles.detailIcon}>
                  <Calendar size={18} color={COLORS.granite} />
                </View>
                <View>
                  <Text style={styles.detailLabel}>Validity Period</Text>
                  <Text style={styles.detailValue}>
                    {formatDate(params.validFrom)} - {formatDate(params.validUntil)}
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          {isSuccess && (
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() =>
                router.push({
                  pathname: '/field/services/new',
                  params: { permitNumber: params.permitNumber },
                })
              }
            >
              <ClipboardList size={20} color="#fff" />
              <Text style={styles.primaryButtonText}>Log Service</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push('/field/scan')}
          >
            <Text style={styles.secondaryButtonText}>Scan Another</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.textButton}
            onPress={() => router.navigate('/(tabs)/field')}
          >
            <Text style={styles.textButtonText}>Back to Field Ops</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

function getResultTitle(result: VerificationResult): string {
  switch (result) {
    case VerificationResult.Expired:
      return 'Permit Expired';
    case VerificationResult.Revoked:
      return 'Permit Revoked';
    case VerificationResult.Suspended:
      return 'Permit Suspended';
    case VerificationResult.NotFound:
      return 'Permit Not Found';
    case VerificationResult.InvalidSignature:
      return 'Invalid Signature';
    case VerificationResult.InvalidFormat:
      return 'Invalid QR Code';
    case VerificationResult.TokenExpired:
      return 'Token Expired';
    default:
      return 'Verification Failed';
  }
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
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
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  statusCard: {
    alignItems: 'center',
    padding: 32,
    borderRadius: 16,
    borderWidth: 2,
    marginBottom: 20,
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.atlantic,
    marginTop: 16,
  },
  statusSubtitle: {
    fontSize: 15,
    color: COLORS.granite,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  detailsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.atlantic,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    gap: 12,
  },
  detailIcon: {
    width: 24,
    alignItems: 'center',
    marginTop: 2,
  },
  detailLabel: {
    fontSize: 13,
    color: COLORS.granite,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 15,
    color: COLORS.atlantic,
    fontWeight: '500',
  },
  actions: {
    gap: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.atlantic,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  secondaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.turquoise,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.turquoise,
  },
  textButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  textButtonText: {
    fontSize: 15,
    color: COLORS.granite,
  },
});
