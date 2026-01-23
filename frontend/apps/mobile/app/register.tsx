import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, Stack, Link } from 'expo-router';
import {
  Shield,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  User,
  Phone,
  Building2,
  Check,
} from 'lucide-react-native';
import { useAuthStore, RegisterData } from '../stores';

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuthStore();

  const [formData, setFormData] = useState<RegisterData & { confirmPassword: string }>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    companyName: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = 'Password must contain an uppercase letter';
    } else if (!/[0-9]/.test(formData.password)) {
      newErrors.password = 'Password must contain a number';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!acceptedTerms) {
      newErrors.terms = 'You must accept the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    clearError();

    if (!validateForm()) {
      return;
    }

    try {
      const { confirmPassword, ...registerData } = formData;
      await register(registerData);

      Alert.alert(
        'Registration Successful',
        'Your account has been created. Please check your email to verify your account, then sign in.',
        [
          {
            text: 'Sign In',
            onPress: () => router.replace('/login'),
          },
        ]
      );
    } catch (err) {
      Alert.alert(
        'Registration Failed',
        error || 'Unable to create account. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const InputField = ({
    label,
    field,
    placeholder,
    icon: Icon,
    keyboardType = 'default',
    autoCapitalize = 'none',
    secureTextEntry = false,
    showToggle = false,
    isVisible = true,
    onToggleVisibility,
    optional = false,
  }: {
    label: string;
    field: keyof typeof formData;
    placeholder: string;
    icon: typeof Mail;
    keyboardType?: 'default' | 'email-address' | 'phone-pad';
    autoCapitalize?: 'none' | 'words';
    secureTextEntry?: boolean;
    showToggle?: boolean;
    isVisible?: boolean;
    onToggleVisibility?: () => void;
    optional?: boolean;
  }) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>
        {label}
        {optional && <Text style={styles.optionalText}> (Optional)</Text>}
      </Text>
      <View style={[styles.inputContainer, errors[field] && styles.inputError]}>
        <Icon size={20} color={errors[field] ? '#ef4444' : '#64748b'} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#94a3b8"
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          secureTextEntry={secureTextEntry && !isVisible}
          value={formData[field]}
          onChangeText={(text) => updateField(field, text)}
        />
        {showToggle && onToggleVisibility && (
          <TouchableOpacity onPress={onToggleVisibility}>
            {isVisible ? (
              <EyeOff size={20} color="#64748b" />
            ) : (
              <Eye size={20} color="#64748b" />
            )}
          </TouchableOpacity>
        )}
      </View>
      {errors[field] ? <Text style={styles.errorText}>{errors[field]}</Text> : null}
    </View>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: '',
          headerTransparent: true,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
              <ArrowLeft size={24} color="#002D56" />
            </TouchableOpacity>
          ),
        }}
      />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo */}
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Shield size={40} color="#002D56" />
            </View>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join the BVI FOP System</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Name Row */}
            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <InputField
                  label="First Name"
                  field="firstName"
                  placeholder="John"
                  icon={User}
                  autoCapitalize="words"
                />
              </View>
              <View style={styles.halfWidth}>
                <InputField
                  label="Last Name"
                  field="lastName"
                  placeholder="Smith"
                  icon={User}
                  autoCapitalize="words"
                />
              </View>
            </View>

            <InputField
              label="Email"
              field="email"
              placeholder="john@example.com"
              icon={Mail}
              keyboardType="email-address"
            />

            <InputField
              label="Phone Number"
              field="phone"
              placeholder="+1 284 555 0000"
              icon={Phone}
              keyboardType="phone-pad"
              optional
            />

            <InputField
              label="Company / Organization"
              field="companyName"
              placeholder="Aviation Company Ltd."
              icon={Building2}
              autoCapitalize="words"
              optional
            />

            <InputField
              label="Password"
              field="password"
              placeholder="Create a password"
              icon={Lock}
              secureTextEntry
              showToggle
              isVisible={showPassword}
              onToggleVisibility={() => setShowPassword(!showPassword)}
            />

            <InputField
              label="Confirm Password"
              field="confirmPassword"
              placeholder="Confirm your password"
              icon={Lock}
              secureTextEntry
              showToggle
              isVisible={showConfirmPassword}
              onToggleVisibility={() => setShowConfirmPassword(!showConfirmPassword)}
            />

            {/* Password Requirements */}
            <View style={styles.passwordRequirements}>
              <Text style={styles.requirementsTitle}>Password must contain:</Text>
              <View style={styles.requirementRow}>
                <Check
                  size={14}
                  color={formData.password.length >= 8 ? '#10b981' : '#94a3b8'}
                />
                <Text
                  style={[
                    styles.requirementText,
                    formData.password.length >= 8 && styles.requirementMet,
                  ]}
                >
                  At least 8 characters
                </Text>
              </View>
              <View style={styles.requirementRow}>
                <Check
                  size={14}
                  color={/[A-Z]/.test(formData.password) ? '#10b981' : '#94a3b8'}
                />
                <Text
                  style={[
                    styles.requirementText,
                    /[A-Z]/.test(formData.password) && styles.requirementMet,
                  ]}
                >
                  One uppercase letter
                </Text>
              </View>
              <View style={styles.requirementRow}>
                <Check
                  size={14}
                  color={/[0-9]/.test(formData.password) ? '#10b981' : '#94a3b8'}
                />
                <Text
                  style={[
                    styles.requirementText,
                    /[0-9]/.test(formData.password) && styles.requirementMet,
                  ]}
                >
                  One number
                </Text>
              </View>
            </View>

            {/* Terms Checkbox */}
            <TouchableOpacity
              style={styles.termsContainer}
              onPress={() => setAcceptedTerms(!acceptedTerms)}
            >
              <View style={[styles.checkbox, acceptedTerms && styles.checkboxChecked]}>
                {acceptedTerms && <Check size={14} color="#fff" />}
              </View>
              <Text style={styles.termsText}>
                I agree to the{' '}
                <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </TouchableOpacity>
            {errors.terms ? <Text style={styles.errorText}>{errors.terms}</Text> : null}

            {/* Register Button */}
            <TouchableOpacity
              style={[styles.registerButton, isLoading && styles.registerButtonDisabled]}
              onPress={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.registerButtonText}>Create Account</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account?</Text>
            <Link href="/login" asChild>
              <TouchableOpacity>
                <Text style={styles.loginLink}>Sign In</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FBFB',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
  },
  headerButton: {
    padding: 8,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e0f2fe',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#002D56',
  },
  subtitle: {
    fontSize: 15,
    color: '#64748b',
    marginTop: 6,
  },
  form: {
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
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
    fontSize: 15,
    color: '#1e293b',
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
  },
  passwordRequirements: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    gap: 6,
  },
  requirementsTitle: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
    marginBottom: 4,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  requirementText: {
    fontSize: 12,
    color: '#94a3b8',
  },
  requirementMet: {
    color: '#10b981',
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginTop: 8,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#00A3B1',
    borderColor: '#00A3B1',
  },
  termsText: {
    flex: 1,
    fontSize: 13,
    color: '#64748b',
    lineHeight: 20,
  },
  termsLink: {
    color: '#00A3B1',
    fontWeight: '500',
  },
  registerButton: {
    backgroundColor: '#002D56',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  registerButtonDisabled: {
    opacity: 0.7,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    gap: 8,
  },
  loginText: {
    fontSize: 14,
    color: '#64748b',
  },
  loginLink: {
    fontSize: 14,
    color: '#00A3B1',
    fontWeight: '600',
  },
});
