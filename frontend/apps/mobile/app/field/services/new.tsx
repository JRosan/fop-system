import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, MapPin, DollarSign, Check } from 'lucide-react-native';
import { useFieldOperations, FEE_RATES } from '../../../hooks';
import { AirportServiceType, BviAirport, useLocationStore, BVI_AIRPORTS } from '../../../stores';

// BVI Sovereign colors
const COLORS = {
  atlantic: '#002D56',
  turquoise: '#00A3B1',
  sand: '#F9FBFB',
  granite: '#4A5568',
  gold: '#C5A059',
};

const SERVICE_OPTIONS: { type: AirportServiceType; label: string; description: string }[] = [
  { type: AirportServiceType.SewerageDumping, label: 'Sewerage Dumping', description: '$300 flat fee' },
  { type: AirportServiceType.FireTruckStandby, label: 'Fire Truck Standby', description: '$25 per service' },
  { type: AirportServiceType.FuelFlow, label: 'Fuel Flow', description: '$0.20 per gallon' },
  { type: AirportServiceType.GroundHandling, label: 'Ground Handling', description: '$150 flat fee' },
  { type: AirportServiceType.AircraftTowing, label: 'Aircraft Towing', description: '$100 per tow' },
  { type: AirportServiceType.WaterService, label: 'Water Service', description: '$50 per service' },
  { type: AirportServiceType.GpuService, label: 'GPU Service', description: '$75 per hour' },
  { type: AirportServiceType.DeIcing, label: 'De-Icing', description: '$500 flat fee' },
  { type: AirportServiceType.BaggageHandling, label: 'Baggage Handling', description: '$35 per bag' },
  { type: AirportServiceType.PassengerStairs, label: 'Passenger Stairs', description: '$50 per use' },
  { type: AirportServiceType.LavatoryService, label: 'Lavatory Service', description: '$75 per service' },
  { type: AirportServiceType.CateringAccess, label: 'Catering Access', description: '$25 per access' },
];

const AIRPORT_OPTIONS: { code: BviAirport; name: string }[] = [
  { code: BviAirport.TUPJ, name: 'TB Lettsome (Beef Island)' },
  { code: BviAirport.TUPW, name: 'Taddy Bay (Virgin Gorda)' },
  { code: BviAirport.TUPY, name: 'Auguste George (Anegada)' },
];

export default function NewServiceScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ permitNumber?: string }>();

  const { logService, isLoggingService } = useFieldOperations();
  const { nearestAirport, getCurrentLocation } = useLocationStore();

  const [selectedService, setSelectedService] = useState<AirportServiceType | null>(null);
  const [selectedAirport, setSelectedAirport] = useState<BviAirport | null>(nearestAirport);
  const [quantity, setQuantity] = useState('1');
  const [permitNumber, setPermitNumber] = useState(params.permitNumber || '');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    // Get location and set nearest airport
    getCurrentLocation();
  }, []);

  useEffect(() => {
    if (nearestAirport && !selectedAirport) {
      setSelectedAirport(nearestAirport);
    }
  }, [nearestAirport]);

  const calculateFee = (): number => {
    if (!selectedService) return 0;
    const feeRate = FEE_RATES[selectedService];
    const qty = parseFloat(quantity) || 1;
    return feeRate.isPerUnit ? feeRate.rate * qty : feeRate.rate;
  };

  const handleSubmit = async () => {
    if (!selectedService) {
      Alert.alert('Select Service', 'Please select a service type');
      return;
    }

    if (!selectedAirport) {
      Alert.alert('Select Airport', 'Please select an airport');
      return;
    }

    const qty = parseFloat(quantity) || 1;
    if (qty <= 0) {
      Alert.alert('Invalid Quantity', 'Please enter a valid quantity');
      return;
    }

    const success = await logService({
      permitNumber: permitNumber || undefined,
      operatorId: 'pending', // Will be resolved during sync
      serviceType: selectedService,
      quantity: qty,
      quantityUnit: FEE_RATES[selectedService].unitDescription,
      airport: selectedAirport,
      notes: notes || undefined,
    });

    if (success) {
      Alert.alert(
        'Service Logged',
        `Successfully logged ${SERVICE_OPTIONS.find((s) => s.type === selectedService)?.label}`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } else {
      Alert.alert('Error', 'Failed to log service. Please try again.');
    }
  };

  const feeRate = selectedService ? FEE_RATES[selectedService] : null;
  const estimatedFee = calculateFee();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={COLORS.atlantic} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Log Service</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          {/* Permit Number (Optional) */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Permit Number (Optional)</Text>
            <TextInput
              style={styles.textInput}
              value={permitNumber}
              onChangeText={setPermitNumber}
              placeholder="e.g., FOP-2026-0001"
              placeholderTextColor={COLORS.granite}
            />
          </View>

          {/* Airport Selection */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Airport</Text>
              {nearestAirport && (
                <View style={styles.nearbyBadge}>
                  <MapPin size={12} color={COLORS.turquoise} />
                  <Text style={styles.nearbyText}>Nearby</Text>
                </View>
              )}
            </View>
            <View style={styles.optionGrid}>
              {AIRPORT_OPTIONS.map((airport) => (
                <TouchableOpacity
                  key={airport.code}
                  style={[
                    styles.optionCard,
                    selectedAirport === airport.code && styles.optionCardSelected,
                  ]}
                  onPress={() => setSelectedAirport(airport.code)}
                >
                  <Text
                    style={[
                      styles.optionLabel,
                      selectedAirport === airport.code && styles.optionLabelSelected,
                    ]}
                  >
                    {airport.code}
                  </Text>
                  <Text
                    style={[
                      styles.optionDescription,
                      selectedAirport === airport.code && styles.optionDescriptionSelected,
                    ]}
                  >
                    {airport.name}
                  </Text>
                  {selectedAirport === airport.code && (
                    <View style={styles.checkMark}>
                      <Check size={16} color="#fff" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Service Type */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Service Type</Text>
            <View style={styles.serviceList}>
              {SERVICE_OPTIONS.map((service) => (
                <TouchableOpacity
                  key={service.type}
                  style={[
                    styles.serviceCard,
                    selectedService === service.type && styles.serviceCardSelected,
                  ]}
                  onPress={() => setSelectedService(service.type)}
                >
                  <View style={styles.serviceInfo}>
                    <Text
                      style={[
                        styles.serviceLabel,
                        selectedService === service.type && styles.serviceLabelSelected,
                      ]}
                    >
                      {service.label}
                    </Text>
                    <Text style={styles.serviceRate}>{service.description}</Text>
                  </View>
                  {selectedService === service.type && (
                    <View style={styles.checkMarkSmall}>
                      <Check size={14} color="#fff" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Quantity (for per-unit services) */}
          {selectedService && feeRate?.isPerUnit && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Quantity {feeRate.unitDescription ? `(${feeRate.unitDescription})` : ''}
              </Text>
              <TextInput
                style={styles.textInput}
                value={quantity}
                onChangeText={setQuantity}
                placeholder="1"
                placeholderTextColor={COLORS.granite}
                keyboardType="numeric"
              />
            </View>
          )}

          {/* Notes */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes (Optional)</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Add any additional notes..."
              placeholderTextColor={COLORS.granite}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Fee Summary */}
          {selectedService && (
            <View style={styles.feeSummary}>
              <View style={styles.feeIcon}>
                <DollarSign size={20} color={COLORS.gold} />
              </View>
              <View style={styles.feeInfo}>
                <Text style={styles.feeLabel}>Estimated Fee</Text>
                <Text style={styles.feeAmount}>${estimatedFee.toFixed(2)}</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Submit Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.submitButton, !selectedService && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={!selectedService || isLoggingService}
          >
            <Text style={styles.submitButtonText}>
              {isLoggingService ? 'Logging...' : 'Log Service'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
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
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.atlantic,
    marginBottom: 12,
  },
  nearbyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.turquoise + '15',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  nearbyText: {
    fontSize: 12,
    color: COLORS.turquoise,
    fontWeight: '500',
  },
  textInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.atlantic,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionCard: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 12,
    position: 'relative',
  },
  optionCardSelected: {
    backgroundColor: COLORS.atlantic,
    borderColor: COLORS.atlantic,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.atlantic,
    marginBottom: 4,
  },
  optionLabelSelected: {
    color: '#fff',
  },
  optionDescription: {
    fontSize: 11,
    color: COLORS.granite,
  },
  optionDescriptionSelected: {
    color: 'rgba(255,255,255,0.7)',
  },
  checkMark: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.turquoise,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceList: {
    gap: 8,
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
  },
  serviceCardSelected: {
    backgroundColor: COLORS.atlantic + '08',
    borderColor: COLORS.atlantic,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.atlantic,
    marginBottom: 2,
  },
  serviceLabelSelected: {
    fontWeight: '600',
  },
  serviceRate: {
    fontSize: 13,
    color: COLORS.gold,
    fontWeight: '500',
  },
  checkMarkSmall: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.turquoise,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feeSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gold + '15',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  feeIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  feeInfo: {
    flex: 1,
  },
  feeLabel: {
    fontSize: 13,
    color: COLORS.granite,
    marginBottom: 2,
  },
  feeAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.atlantic,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  submitButton: {
    backgroundColor: COLORS.atlantic,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.granite,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
