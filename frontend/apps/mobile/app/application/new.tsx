import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Check,
  Building2,
  Plane,
  FileText,
  MapPin,
  Calendar,
  Upload,
  CreditCard,
} from 'lucide-react-native';
import type {
  ApplicationType,
  FlightPurpose,
} from '@fop/types';
import { useApplicationStore, useAuthStore, useAircraftStore } from '../../stores';

// Wizard Steps
const TOTAL_STEPS = 7;

const permitTypes = [
  {
    id: 'OneTime' as ApplicationType,
    name: 'One-Time Permit',
    description: 'For a single flight operation',
    multiplier: '1.0x base fee',
  },
  {
    id: 'Blanket' as ApplicationType,
    name: 'Blanket Permit',
    description: 'For multiple flights over a period',
    multiplier: '2.5x base fee',
  },
  {
    id: 'Emergency' as ApplicationType,
    name: 'Emergency Permit',
    description: 'For urgent humanitarian or medical flights',
    multiplier: '0.5x base fee',
  },
];

const flightPurposes: { id: FlightPurpose; name: string }[] = [
  { id: 'charter', name: 'Charter Flight' },
  { id: 'cargo', name: 'Cargo Transport' },
  { id: 'technicalLanding', name: 'Technical Landing' },
  { id: 'medevac', name: 'Medical Evacuation' },
  { id: 'private', name: 'Private Flight' },
  { id: 'other', name: 'Other' },
];

const requiredDocuments = [
  { type: 'CERTIFICATE_OF_AIRWORTHINESS', name: 'Certificate of Airworthiness' },
  { type: 'CERTIFICATE_OF_REGISTRATION', name: 'Certificate of Registration' },
  { type: 'AIR_OPERATOR_CERTIFICATE', name: 'Air Operator Certificate' },
  { type: 'INSURANCE_CERTIFICATE', name: 'Insurance Certificate' },
];

interface WizardState {
  // Step 1
  applicationType: ApplicationType | null;
  // Step 2 - Operator
  operatorName: string;
  operatorCountry: string;
  operatorEmail: string;
  operatorPhone: string;
  // Step 3 - Aircraft
  aircraftRegistration: string;
  aircraftType: string;
  aircraftManufacturer: string;
  seatCount: string;
  mtowKg: string;
  // Step 4 - Flight Details
  flightPurpose: FlightPurpose | null;
  purposeDescription: string;
  departureAirport: string;
  arrivalAirport: string;
  estimatedFlightDate: string;
  passengers: string;
  cargoDescription: string;
  // Step 5 - Period
  startDate: string;
  endDate: string;
  // Step 6 - Documents
  uploadedDocuments: string[];
}

export default function NewApplicationScreen() {
  const router = useRouter();
  const { createApplication, isLoading: isCreating, error: createError } = useApplicationStore();
  const { user } = useAuthStore();
  const { aircraft } = useAircraftStore();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAircraftId, setSelectedAircraftId] = useState<string | null>(null);
  const [state, setState] = useState<WizardState>({
    applicationType: null,
    operatorName: '',
    operatorCountry: '',
    operatorEmail: '',
    operatorPhone: '',
    aircraftRegistration: '',
    aircraftType: '',
    aircraftManufacturer: '',
    seatCount: '',
    mtowKg: '',
    flightPurpose: null,
    purposeDescription: '',
    departureAirport: '',
    arrivalAirport: '',
    estimatedFlightDate: '',
    passengers: '',
    cargoDescription: '',
    startDate: '',
    endDate: '',
    uploadedDocuments: [],
  });

  const updateState = useCallback((updates: Partial<WizardState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  const canProceed = useCallback((): boolean => {
    switch (currentStep) {
      case 1:
        return state.applicationType !== null;
      case 2:
        return (
          state.operatorName.length >= 2 &&
          state.operatorCountry.length >= 2 &&
          state.operatorEmail.includes('@')
        );
      case 3:
        return (
          state.aircraftRegistration.length >= 3 &&
          state.aircraftType.length >= 2 &&
          parseInt(state.seatCount) > 0 &&
          parseFloat(state.mtowKg) > 0
        );
      case 4:
        return (
          state.flightPurpose !== null &&
          state.departureAirport.length >= 3 &&
          state.arrivalAirport.length >= 3 &&
          state.estimatedFlightDate.length > 0
        );
      case 5:
        return state.startDate.length > 0 && state.endDate.length > 0;
      case 6:
        return state.uploadedDocuments.length === 4;
      case 7:
        return true;
      default:
        return false;
    }
  }, [currentStep, state]);

  const handleNext = useCallback(() => {
    if (currentStep < TOTAL_STEPS && canProceed()) {
      setCurrentStep((s) => s + 1);
    }
  }, [currentStep, canProceed]);

  const handleBack = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((s) => s - 1);
    }
  }, [currentStep]);

  const handleSubmit = useCallback(async () => {
    if (!state.applicationType) {
      Alert.alert('Error', 'Please select a permit type.');
      return;
    }

    if (!user?.operatorId) {
      Alert.alert(
        'Operator Required',
        'You must be associated with an operator to submit applications. Please contact support.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Use selected aircraft or require selection
    const aircraftId = selectedAircraftId || aircraft[0]?.id;
    if (!aircraftId) {
      Alert.alert(
        'Aircraft Required',
        'Please register an aircraft before submitting an application.',
        [{ text: 'OK', onPress: () => router.push('/aircraft' as never) }]
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const applicationId = await createApplication({
        permitType: state.applicationType,
        operatorId: user.operatorId,
        aircraftId: aircraftId,
        flightPurpose: state.flightPurpose || 'other',
        requestedStartDate: state.startDate,
        requestedEndDate: state.endDate,
        flightDetails: {
          departureAirport: state.departureAirport,
          arrivalAirport: state.arrivalAirport,
          estimatedFlights: 1,
        },
      });

      Alert.alert(
        'Application Submitted',
        'Your Foreign Operator Permit application has been submitted successfully.',
        [{ text: 'View Application', onPress: () => router.replace(`/application/${applicationId}` as never) }]
      );
    } catch (error) {
      const message = createError || 'Failed to submit application. Please try again.';
      Alert.alert('Error', message);
    } finally {
      setIsSubmitting(false);
    }
  }, [state, router, user, selectedAircraftId, aircraft, createApplication, createError]);

  const handleDocumentUpload = useCallback((docType: string) => {
    // TODO: Implement document picker
    // For now, simulate upload
    if (!state.uploadedDocuments.includes(docType)) {
      updateState({
        uploadedDocuments: [...state.uploadedDocuments, docType],
      });
    }
  }, [state.uploadedDocuments, updateState]);

  const calculateFee = useCallback(() => {
    const baseFee = 150;
    const seatFee = (parseInt(state.seatCount) || 0) * 10;
    const weightFee = (parseFloat(state.mtowKg) || 0) * 0.02;
    const multiplier =
      state.applicationType === 'Blanket'
        ? 2.5
        : state.applicationType === 'Emergency'
        ? 0.5
        : 1.0;

    return ((baseFee + seatFee + weightFee) * multiplier).toFixed(2);
  }, [state.applicationType, state.seatCount, state.mtowKg]);

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return 'Select Permit Type';
      case 2:
        return 'Operator Information';
      case 3:
        return 'Aircraft Details';
      case 4:
        return 'Flight Details';
      case 5:
        return 'Permit Period';
      case 6:
        return 'Upload Documents';
      case 7:
        return 'Review & Submit';
      default:
        return '';
    }
  };

  const getStepIcon = (step: number) => {
    const icons = [FileText, Building2, Plane, MapPin, Calendar, Upload, CreditCard];
    const Icon = icons[step - 1] || FileText;
    return <Icon size={20} color={currentStep >= step ? '#0066e6' : '#94a3b8'} />;
  };

  // Step 1: Permit Type Selection
  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepDescription}>Choose the type of permit you need</Text>
      <View style={styles.options}>
        {permitTypes.map((type) => (
          <TouchableOpacity
            key={type.id}
            style={[
              styles.option,
              state.applicationType === type.id && styles.optionSelected,
            ]}
            onPress={() => updateState({ applicationType: type.id })}
          >
            <View style={styles.optionContent}>
              <Text style={styles.optionName}>{type.name}</Text>
              <Text style={styles.optionDescription}>{type.description}</Text>
            </View>
            <Text style={styles.optionMultiplier}>{type.multiplier}</Text>
            {state.applicationType === type.id && (
              <Check size={24} color="#0066e6" style={styles.checkIcon} />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  // Step 2: Operator Information
  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepDescription}>Enter operator company details</Text>
      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Company Name *</Text>
          <TextInput
            style={styles.input}
            value={state.operatorName}
            onChangeText={(v) => updateState({ operatorName: v })}
            placeholder="Enter company name"
            placeholderTextColor="#94a3b8"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Country of Registration *</Text>
          <TextInput
            style={styles.input}
            value={state.operatorCountry}
            onChangeText={(v) => updateState({ operatorCountry: v })}
            placeholder="e.g., United States"
            placeholderTextColor="#94a3b8"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Contact Email *</Text>
          <TextInput
            style={styles.input}
            value={state.operatorEmail}
            onChangeText={(v) => updateState({ operatorEmail: v })}
            placeholder="email@company.com"
            placeholderTextColor="#94a3b8"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Contact Phone</Text>
          <TextInput
            style={styles.input}
            value={state.operatorPhone}
            onChangeText={(v) => updateState({ operatorPhone: v })}
            placeholder="+1 234 567 8900"
            placeholderTextColor="#94a3b8"
            keyboardType="phone-pad"
          />
        </View>
      </View>
    </View>
  );

  // Step 3: Aircraft Details
  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepDescription}>Enter aircraft information</Text>
      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Registration Mark *</Text>
          <TextInput
            style={styles.input}
            value={state.aircraftRegistration}
            onChangeText={(v) => updateState({ aircraftRegistration: v.toUpperCase() })}
            placeholder="e.g., N12345"
            placeholderTextColor="#94a3b8"
            autoCapitalize="characters"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Aircraft Type *</Text>
          <TextInput
            style={styles.input}
            value={state.aircraftType}
            onChangeText={(v) => updateState({ aircraftType: v })}
            placeholder="e.g., Boeing 737-800"
            placeholderTextColor="#94a3b8"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Manufacturer</Text>
          <TextInput
            style={styles.input}
            value={state.aircraftManufacturer}
            onChangeText={(v) => updateState({ aircraftManufacturer: v })}
            placeholder="e.g., Boeing"
            placeholderTextColor="#94a3b8"
          />
        </View>
        <View style={styles.row}>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>Seat Count *</Text>
            <TextInput
              style={styles.input}
              value={state.seatCount}
              onChangeText={(v) => updateState({ seatCount: v.replace(/[^0-9]/g, '') })}
              placeholder="e.g., 180"
              placeholderTextColor="#94a3b8"
              keyboardType="numeric"
            />
          </View>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>MTOW (kg) *</Text>
            <TextInput
              style={styles.input}
              value={state.mtowKg}
              onChangeText={(v) => updateState({ mtowKg: v.replace(/[^0-9.]/g, '') })}
              placeholder="e.g., 79000"
              placeholderTextColor="#94a3b8"
              keyboardType="numeric"
            />
          </View>
        </View>
      </View>
    </View>
  );

  // Step 4: Flight Details
  const renderStep4 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepDescription}>Provide flight operation details</Text>
      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Flight Purpose *</Text>
          <View style={styles.purposeGrid}>
            {flightPurposes.map((purpose) => (
              <TouchableOpacity
                key={purpose.id}
                style={[
                  styles.purposeButton,
                  state.flightPurpose === purpose.id && styles.purposeButtonSelected,
                ]}
                onPress={() => updateState({ flightPurpose: purpose.id })}
              >
                <Text
                  style={[
                    styles.purposeButtonText,
                    state.flightPurpose === purpose.id && styles.purposeButtonTextSelected,
                  ]}
                >
                  {purpose.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        {state.flightPurpose === 'other' && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Purpose Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={state.purposeDescription}
              onChangeText={(v) => updateState({ purposeDescription: v })}
              placeholder="Describe the purpose of the flight"
              placeholderTextColor="#94a3b8"
              multiline
              numberOfLines={3}
            />
          </View>
        )}
        <View style={styles.row}>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>Departure Airport *</Text>
            <TextInput
              style={styles.input}
              value={state.departureAirport}
              onChangeText={(v) => updateState({ departureAirport: v.toUpperCase() })}
              placeholder="ICAO code"
              placeholderTextColor="#94a3b8"
              autoCapitalize="characters"
              maxLength={4}
            />
          </View>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>Arrival Airport *</Text>
            <TextInput
              style={styles.input}
              value={state.arrivalAirport}
              onChangeText={(v) => updateState({ arrivalAirport: v.toUpperCase() })}
              placeholder="ICAO code"
              placeholderTextColor="#94a3b8"
              autoCapitalize="characters"
              maxLength={4}
            />
          </View>
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Estimated Flight Date *</Text>
          <TextInput
            style={styles.input}
            value={state.estimatedFlightDate}
            onChangeText={(v) => updateState({ estimatedFlightDate: v })}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#94a3b8"
          />
        </View>
        <View style={styles.row}>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>Passengers</Text>
            <TextInput
              style={styles.input}
              value={state.passengers}
              onChangeText={(v) => updateState({ passengers: v.replace(/[^0-9]/g, '') })}
              placeholder="Number"
              placeholderTextColor="#94a3b8"
              keyboardType="numeric"
            />
          </View>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>Cargo</Text>
            <TextInput
              style={styles.input}
              value={state.cargoDescription}
              onChangeText={(v) => updateState({ cargoDescription: v })}
              placeholder="Description"
              placeholderTextColor="#94a3b8"
            />
          </View>
        </View>
      </View>
    </View>
  );

  // Step 5: Permit Period
  const renderStep5 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepDescription}>Select the validity period for your permit</Text>
      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Start Date *</Text>
          <TextInput
            style={styles.input}
            value={state.startDate}
            onChangeText={(v) => updateState({ startDate: v })}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#94a3b8"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>End Date *</Text>
          <TextInput
            style={styles.input}
            value={state.endDate}
            onChangeText={(v) => updateState({ endDate: v })}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#94a3b8"
          />
        </View>
        <View style={styles.periodNote}>
          <Text style={styles.periodNoteText}>
            {state.applicationType === 'Blanket'
              ? 'Blanket permits are valid for up to 12 months.'
              : state.applicationType === 'Emergency'
              ? 'Emergency permits are typically valid for the duration of the emergency operation.'
              : 'One-time permits are valid for the specific flight date(s) indicated.'}
          </Text>
        </View>
      </View>
    </View>
  );

  // Step 6: Document Upload
  const renderStep6 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepDescription}>Upload required documents</Text>
      <View style={styles.documentList}>
        {requiredDocuments.map((doc) => {
          const isUploaded = state.uploadedDocuments.includes(doc.type);
          return (
            <TouchableOpacity
              key={doc.type}
              style={[styles.documentItem, isUploaded && styles.documentItemUploaded]}
              onPress={() => handleDocumentUpload(doc.type)}
            >
              <View style={styles.documentInfo}>
                {isUploaded ? (
                  <Check size={24} color="#10b981" />
                ) : (
                  <Upload size={24} color="#64748b" />
                )}
                <View style={styles.documentText}>
                  <Text style={styles.documentName}>{doc.name}</Text>
                  <Text style={styles.documentStatus}>
                    {isUploaded ? 'Uploaded' : 'Tap to upload'}
                  </Text>
                </View>
              </View>
              <Text style={[styles.requiredBadge, isUploaded && styles.uploadedBadge]}>
                {isUploaded ? 'Done' : 'Required'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <Text style={styles.uploadNote}>
        All documents must be valid and clearly legible. Supported formats: PDF, JPG, PNG
      </Text>
    </View>
  );

  // Step 7: Review & Submit
  const renderStep7 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepDescription}>Review your application before submitting</Text>

      <View style={styles.reviewSection}>
        <Text style={styles.reviewSectionTitle}>Permit Type</Text>
        <Text style={styles.reviewValue}>
          {permitTypes.find((t) => t.id === state.applicationType)?.name}
        </Text>
      </View>

      <View style={styles.reviewSection}>
        <Text style={styles.reviewSectionTitle}>Operator</Text>
        <Text style={styles.reviewValue}>{state.operatorName}</Text>
        <Text style={styles.reviewSubValue}>{state.operatorCountry}</Text>
      </View>

      <View style={styles.reviewSection}>
        <Text style={styles.reviewSectionTitle}>Aircraft</Text>
        <Text style={styles.reviewValue}>{state.aircraftRegistration}</Text>
        <Text style={styles.reviewSubValue}>{state.aircraftType}</Text>
      </View>

      <View style={styles.reviewSection}>
        <Text style={styles.reviewSectionTitle}>Flight</Text>
        <Text style={styles.reviewValue}>
          {state.departureAirport} → {state.arrivalAirport}
        </Text>
        <Text style={styles.reviewSubValue}>
          {flightPurposes.find((p) => p.id === state.flightPurpose)?.name}
        </Text>
      </View>

      <View style={styles.reviewSection}>
        <Text style={styles.reviewSectionTitle}>Permit Period</Text>
        <Text style={styles.reviewValue}>
          {state.startDate} to {state.endDate}
        </Text>
      </View>

      <View style={styles.reviewSection}>
        <Text style={styles.reviewSectionTitle}>Documents</Text>
        <Text style={styles.reviewValue}>
          {state.uploadedDocuments.length} of {requiredDocuments.length} uploaded
        </Text>
      </View>

      <View style={styles.feeCard}>
        <Text style={styles.feeLabel}>Estimated Fee</Text>
        <Text style={styles.feeAmount}>${calculateFee()} USD</Text>
        <Text style={styles.feeNote}>Final fee calculated upon review</Text>
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      case 5:
        return renderStep5();
      case 6:
        return renderStep6();
      case 7:
        return renderStep7();
      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <X size={24} color="#64748b" />
        </TouchableOpacity>
        <Text style={styles.title}>New Application</Text>
        <View style={styles.stepIndicator}>
          <Text style={styles.stepText}>
            {currentStep}/{TOTAL_STEPS}
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[styles.progressFill, { width: `${(currentStep / TOTAL_STEPS) * 100}%` }]}
          />
        </View>
      </View>

      {/* Step Title */}
      <View style={styles.stepHeader}>
        {getStepIcon(currentStep)}
        <Text style={styles.stepTitle}>{getStepTitle()}</Text>
      </View>

      {/* Step Content */}
      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {renderCurrentStep()}
      </ScrollView>

      {/* Navigation */}
      <View style={styles.navigation}>
        {currentStep > 1 && (
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <ChevronLeft size={20} color="#64748b" />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}
        {currentStep < TOTAL_STEPS ? (
          <TouchableOpacity
            style={[styles.nextButton, !canProceed() && styles.nextButtonDisabled]}
            onPress={handleNext}
            disabled={!canProceed()}
          >
            <Text style={styles.nextButtonText}>Next</Text>
            <ChevronRight size={20} color="#fff" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Text style={styles.submitButtonText}>Submit Application</Text>
                <Check size={20} color="#fff" />
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  stepIndicator: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  stepText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  progressContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e2e8f0',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0066e6',
    borderRadius: 2,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: 24,
  },
  stepContent: {
    paddingHorizontal: 20,
  },
  stepDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 24,
  },
  options: {
    gap: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  optionSelected: {
    borderColor: '#0066e6',
    backgroundColor: '#eff6ff',
  },
  optionContent: {
    flex: 1,
  },
  optionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  optionDescription: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  optionMultiplier: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0066e6',
    marginRight: 8,
  },
  checkIcon: {
    marginLeft: 8,
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1e293b',
    backgroundColor: '#fff',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  purposeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  purposeButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  purposeButtonSelected: {
    backgroundColor: '#0066e6',
    borderColor: '#0066e6',
  },
  purposeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  purposeButtonTextSelected: {
    color: '#fff',
  },
  periodNote: {
    backgroundColor: '#f0f9ff',
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  periodNoteText: {
    fontSize: 14,
    color: '#0369a1',
    lineHeight: 20,
  },
  documentList: {
    gap: 12,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  documentItemUploaded: {
    backgroundColor: '#f0fdf4',
    borderColor: '#86efac',
  },
  documentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  documentText: {
    flex: 1,
  },
  documentName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
  },
  documentStatus: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  requiredBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: '#dc2626',
    backgroundColor: '#fef2f2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  uploadedBadge: {
    color: '#15803d',
    backgroundColor: '#dcfce7',
  },
  uploadNote: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 16,
    textAlign: 'center',
  },
  reviewSection: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  reviewSectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  reviewValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  reviewSubValue: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  feeCard: {
    backgroundColor: '#0066e6',
    padding: 20,
    borderRadius: 16,
    marginTop: 24,
    alignItems: 'center',
  },
  feeLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  feeAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 4,
  },
  feeNote: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 8,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    backgroundColor: '#fff',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#64748b',
    marginLeft: 4,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0066e6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginLeft: 'auto',
  },
  nextButtonDisabled: {
    backgroundColor: '#94a3b8',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginRight: 4,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b981',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginLeft: 'auto',
  },
  submitButtonDisabled: {
    backgroundColor: '#94a3b8',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginRight: 8,
  },
});
