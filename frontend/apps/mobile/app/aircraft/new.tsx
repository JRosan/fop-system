import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import {
  ArrowLeft,
  Plane,
  Hash,
  Building2,
  FileText,
  Scale,
  Users,
  Calendar,
  Volume2,
  ChevronDown,
  Check,
} from 'lucide-react-native';
import { useAircraftStore, useAuthStore, AircraftCategory } from '../../stores';

// BVI Sovereign colors
const COLORS = {
  atlantic: '#002D56',
  turquoise: '#00A3B1',
  sand: '#F9FBFB',
  granite: '#4A5568',
  gold: '#C5A059',
};

const categories: { id: AircraftCategory; label: string }[] = [
  { id: 'FixedWing', label: 'Fixed Wing' },
  { id: 'Rotorcraft', label: 'Rotorcraft' },
  { id: 'Balloon', label: 'Balloon' },
  { id: 'Glider', label: 'Glider' },
  { id: 'Airship', label: 'Airship' },
];

const weightUnits: { id: 'Kilograms' | 'Pounds'; label: string }[] = [
  { id: 'Kilograms', label: 'Kilograms (kg)' },
  { id: 'Pounds', label: 'Pounds (lbs)' },
];

interface FormData {
  registrationMark: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  category: AircraftCategory;
  mtowValue: string;
  mtowUnit: 'Kilograms' | 'Pounds';
  seatCount: string;
  yearOfManufacture: string;
  noiseCategory: string;
}

interface FormErrors {
  registrationMark?: string;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  category?: string;
  mtowValue?: string;
  seatCount?: string;
  yearOfManufacture?: string;
}

export default function NewAircraftScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { createAircraft, isLoading, error, clearError } = useAircraftStore();

  const [formData, setFormData] = useState<FormData>({
    registrationMark: '',
    manufacturer: '',
    model: '',
    serialNumber: '',
    category: 'FixedWing',
    mtowValue: '',
    mtowUnit: 'Kilograms',
    seatCount: '',
    yearOfManufacture: new Date().getFullYear().toString(),
    noiseCategory: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showUnitPicker, setShowUnitPicker] = useState(false);

  const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    clearError();
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Registration Mark validation
    if (!formData.registrationMark.trim()) {
      newErrors.registrationMark = 'Registration mark is required';
    } else if (!/^[A-Z0-9-]+$/i.test(formData.registrationMark)) {
      newErrors.registrationMark = 'Invalid format (letters, numbers, hyphens only)';
    }

    // Manufacturer validation
    if (!formData.manufacturer.trim()) {
      newErrors.manufacturer = 'Manufacturer is required';
    }

    // Model validation
    if (!formData.model.trim()) {
      newErrors.model = 'Model is required';
    }

    // Serial Number validation
    if (!formData.serialNumber.trim()) {
      newErrors.serialNumber = 'Serial number is required';
    }

    // MTOW validation
    const mtowValue = parseFloat(formData.mtowValue);
    if (!formData.mtowValue.trim()) {
      newErrors.mtowValue = 'MTOW is required';
    } else if (isNaN(mtowValue) || mtowValue <= 0) {
      newErrors.mtowValue = 'Enter a valid weight';
    } else if (mtowValue > 1000000) {
      newErrors.mtowValue = 'Weight seems too high';
    }

    // Seat Count validation
    const seatCount = parseInt(formData.seatCount, 10);
    if (!formData.seatCount.trim()) {
      newErrors.seatCount = 'Seat count is required';
    } else if (isNaN(seatCount) || seatCount < 1) {
      newErrors.seatCount = 'Enter a valid number';
    } else if (seatCount > 1000) {
      newErrors.seatCount = 'Seat count seems too high';
    }

    // Year of Manufacture validation
    const year = parseInt(formData.yearOfManufacture, 10);
    const currentYear = new Date().getFullYear();
    if (!formData.yearOfManufacture.trim()) {
      newErrors.yearOfManufacture = 'Year is required';
    } else if (isNaN(year) || year < 1900 || year > currentYear + 1) {
      newErrors.yearOfManufacture = `Enter a year between 1900 and ${currentYear + 1}`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    if (!user?.operatorId) {
      Alert.alert('Error', 'You must be associated with an operator to register aircraft.');
      return;
    }

    try {
      await createAircraft({
        registrationMark: formData.registrationMark.toUpperCase().trim(),
        manufacturer: formData.manufacturer.trim(),
        model: formData.model.trim(),
        serialNumber: formData.serialNumber.trim(),
        category: formData.category,
        mtowValue: parseFloat(formData.mtowValue),
        mtowUnit: formData.mtowUnit,
        seatCount: parseInt(formData.seatCount, 10),
        yearOfManufacture: parseInt(formData.yearOfManufacture, 10),
        operatorId: user.operatorId,
        noiseCategory: formData.noiseCategory.trim() || undefined,
      });

      Alert.alert(
        'Aircraft Registered',
        `${formData.registrationMark.toUpperCase()} has been added to your fleet.`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch {
      Alert.alert('Error', error || 'Failed to register aircraft. Please try again.');
    }
  };

  const renderInput = ({
    label,
    field,
    placeholder,
    icon: Icon,
    keyboardType = 'default',
    autoCapitalize = 'none',
    maxLength,
    optional = false,
  }: {
    label: string;
    field: keyof FormData;
    placeholder: string;
    icon: typeof Plane;
    keyboardType?: 'default' | 'numeric' | 'number-pad';
    autoCapitalize?: 'none' | 'characters' | 'words';
    maxLength?: number;
    optional?: boolean;
  }) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>
        {label}
        {optional && <Text style={styles.optionalText}> (Optional)</Text>}
      </Text>
      <View style={[styles.inputContainer, errors[field as keyof FormErrors] && styles.inputError]}>
        <Icon size={20} color={errors[field as keyof FormErrors] ? '#ef4444' : '#64748b'} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#94a3b8"
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          maxLength={maxLength}
          value={formData[field]}
          onChangeText={(text) => updateField(field, text as never)}
        />
      </View>
      {errors[field as keyof FormErrors] && (
        <Text style={styles.errorText}>{errors[field as keyof FormErrors]}</Text>
      )}
    </View>
  );

  const renderPicker = ({
    label,
    value,
    displayValue,
    onPress,
  }: {
    label: string;
    value: string;
    displayValue: string;
    onPress: () => void;
  }) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.pickerButton} onPress={onPress}>
        <Text style={styles.pickerText}>{displayValue}</Text>
        <ChevronDown size={20} color="#64748b" />
      </TouchableOpacity>
    </View>
  );

  const renderPickerModal = ({
    visible,
    title,
    options,
    selectedValue,
    onSelect,
    onClose,
  }: {
    visible: boolean;
    title: string;
    options: { id: string; label: string }[];
    selectedValue: string;
    onSelect: (value: string) => void;
    onClose: () => void;
  }) => {
    if (!visible) return null;

    return (
      <View style={styles.pickerOverlay}>
        <TouchableOpacity style={styles.pickerBackdrop} onPress={onClose} />
        <View style={styles.pickerModal}>
          <View style={styles.pickerHeader}>
            <Text style={styles.pickerTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.pickerDone}>Done</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.pickerOptions}>
            {options.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.pickerOption,
                  selectedValue === option.id && styles.pickerOptionSelected,
                ]}
                onPress={() => {
                  onSelect(option.id);
                  onClose();
                }}
              >
                <Text
                  style={[
                    styles.pickerOptionText,
                    selectedValue === option.id && styles.pickerOptionTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
                {selectedValue === option.id && <Check size={20} color={COLORS.turquoise} />}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Register Aircraft',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
              <ArrowLeft size={24} color={COLORS.atlantic} />
            </TouchableOpacity>
          ),
        }}
      />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Plane size={32} color={COLORS.atlantic} />
            </View>
            <Text style={styles.title}>Add New Aircraft</Text>
            <Text style={styles.subtitle}>
              Register an aircraft to your operator fleet
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Registration Mark */}
            {renderInput({
              label: 'Registration Mark',
              field: 'registrationMark',
              placeholder: 'VP-AAA',
              icon: Hash,
              autoCapitalize: 'characters',
              maxLength: 10,
            })}

            {/* Manufacturer */}
            {renderInput({
              label: 'Manufacturer',
              field: 'manufacturer',
              placeholder: 'Cessna',
              icon: Building2,
              autoCapitalize: 'words',
            })}

            {/* Model */}
            {renderInput({
              label: 'Model',
              field: 'model',
              placeholder: '172 Skyhawk',
              icon: FileText,
              autoCapitalize: 'words',
            })}

            {/* Serial Number */}
            {renderInput({
              label: 'Serial Number',
              field: 'serialNumber',
              placeholder: '17265432',
              icon: Hash,
              autoCapitalize: 'characters',
            })}

            {/* Category Picker */}
            {renderPicker({
              label: 'Aircraft Category',
              value: formData.category,
              displayValue: categories.find((c) => c.id === formData.category)?.label || '',
              onPress: () => setShowCategoryPicker(true),
            })}

            {/* MTOW Row */}
            <View style={styles.row}>
              <View style={styles.flexGrow}>
                {renderInput({
                  label: 'Max Takeoff Weight',
                  field: 'mtowValue',
                  placeholder: '1111',
                  icon: Scale,
                  keyboardType: 'numeric',
                })}
              </View>
              <View style={styles.unitPicker}>
                {renderPicker({
                  label: 'Unit',
                  value: formData.mtowUnit,
                  displayValue: formData.mtowUnit === 'Kilograms' ? 'kg' : 'lbs',
                  onPress: () => setShowUnitPicker(true),
                })}
              </View>
            </View>

            {/* Seat Count */}
            {renderInput({
              label: 'Seat Count',
              field: 'seatCount',
              placeholder: '4',
              icon: Users,
              keyboardType: 'number-pad',
            })}

            {/* Year of Manufacture */}
            {renderInput({
              label: 'Year of Manufacture',
              field: 'yearOfManufacture',
              placeholder: '2020',
              icon: Calendar,
              keyboardType: 'number-pad',
              maxLength: 4,
            })}

            {/* Noise Category (Optional) */}
            {renderInput({
              label: 'Noise Category',
              field: 'noiseCategory',
              placeholder: 'Chapter 3',
              icon: Volume2,
              optional: true,
            })}

            {/* Error Message */}
            {error && (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerText}>{error}</Text>
              </View>
            )}

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Plane size={20} color="#fff" />
                  <Text style={styles.submitButtonText}>Register Aircraft</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Pickers */}
        {renderPickerModal({
          visible: showCategoryPicker,
          title: 'Select Category',
          options: categories,
          selectedValue: formData.category,
          onSelect: (value) => updateField('category', value as AircraftCategory),
          onClose: () => setShowCategoryPicker(false),
        })}

        {renderPickerModal({
          visible: showUnitPicker,
          title: 'Select Unit',
          options: weightUnits,
          selectedValue: formData.mtowUnit,
          onSelect: (value) => updateField('mtowUnit', value as 'Kilograms' | 'Pounds'),
          onClose: () => setShowUnitPicker(false),
        })}
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.sand,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  headerButton: {
    padding: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#e0f2fe',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.atlantic,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.granite,
    marginTop: 4,
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  optionalText: {
    fontWeight: '400',
    color: '#94a3b8',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  inputError: {
    borderColor: '#ef4444',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  pickerText: {
    fontSize: 16,
    color: '#1e293b',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  flexGrow: {
    flex: 2,
  },
  unitPicker: {
    flex: 1,
  },
  errorBanner: {
    backgroundColor: '#fee2e2',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorBannerText: {
    color: '#dc2626',
    fontSize: 14,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.turquoise,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  pickerOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  pickerBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  pickerModal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '50%',
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.atlantic,
  },
  pickerDone: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.turquoise,
  },
  pickerOptions: {
    padding: 8,
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 8,
  },
  pickerOptionSelected: {
    backgroundColor: '#f0fdfa',
  },
  pickerOptionText: {
    fontSize: 16,
    color: '#1e293b',
  },
  pickerOptionTextSelected: {
    color: COLORS.turquoise,
    fontWeight: '600',
  },
});
