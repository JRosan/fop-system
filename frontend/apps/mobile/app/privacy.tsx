import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { ArrowLeft, Shield, Lock, Eye, Server, UserCheck, Bell, Trash2 } from 'lucide-react-native';

// BVI Sovereign colors
const COLORS = {
  atlantic: '#002D56',
  turquoise: '#00A3B1',
  sand: '#F9FBFB',
  granite: '#4A5568',
  gold: '#C5A059',
};

const sections = [
  {
    icon: Eye,
    title: 'Information We Collect',
    content: `We collect information you provide directly, including:

• Personal identification (name, email, phone number)
• Company/operator information
• Aircraft registration and specifications
• Flight operation details
• Payment and billing information
• Device information for app functionality

We also automatically collect usage data, device identifiers, and location data (with your permission) to improve our services.`,
  },
  {
    icon: Server,
    title: 'How We Use Your Information',
    content: `Your information is used to:

• Process and manage Foreign Operator Permit applications
• Verify aircraft and operator compliance
• Communicate about your applications and permits
• Process payments and issue invoices
• Send important notifications and alerts
• Improve our services and user experience
• Comply with aviation regulations and legal requirements`,
  },
  {
    icon: Lock,
    title: 'Data Security',
    content: `We implement industry-standard security measures:

• Encryption of data in transit and at rest (AES-256)
• Secure authentication with biometric support
• Regular security audits and penetration testing
• Access controls and audit logging
• Compliance with international data protection standards

Your permit QR codes are cryptographically signed to prevent tampering.`,
  },
  {
    icon: UserCheck,
    title: 'Data Sharing',
    content: `We may share your information with:

• BVI Civil Aviation Department (regulatory compliance)
• Airport authorities for permit verification
• Payment processors for transaction handling
• Law enforcement when required by law

We do NOT sell your personal information to third parties for marketing purposes.`,
  },
  {
    icon: Bell,
    title: 'Communications',
    content: `We may send you:

• Permit status updates and approvals
• Expiration reminders and renewal notices
• Important regulatory changes
• Service announcements

You can manage notification preferences in the app settings. Critical compliance notifications cannot be disabled.`,
  },
  {
    icon: Trash2,
    title: 'Data Retention & Deletion',
    content: `• Active permit data is retained for the permit validity period plus 7 years for regulatory compliance
• Account data is retained while your account is active
• You may request data deletion by contacting our office
• Some data may be retained for legal/regulatory requirements

To request data export or deletion, email: privacy@bviaa.vg`,
  },
];

export default function PrivacyScreen() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Privacy Policy',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
              <ArrowLeft size={24} color="#fff" />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Shield size={32} color={COLORS.atlantic} />
          </View>
          <Text style={styles.headerTitle}>Privacy Policy</Text>
          <Text style={styles.headerSubtitle}>
            How we collect, use, and protect your information
          </Text>
          <Text style={styles.lastUpdated}>Last updated: January 2024</Text>
        </View>

        {/* Introduction */}
        <View style={styles.introSection}>
          <Text style={styles.introText}>
            The British Virgin Islands Airports Authority ("BVIAA", "we", "our") operates the
            Foreign Operator Permit (FOP) System. This Privacy Policy explains how we handle
            your personal information when you use our mobile application and services.
          </Text>
        </View>

        {/* Sections */}
        {sections.map((section, index) => (
          <View key={index} style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <section.icon size={20} color={COLORS.turquoise} />
              </View>
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>
            <Text style={styles.sectionContent}>{section.content}</Text>
          </View>
        ))}

        {/* Your Rights */}
        <View style={styles.rightsSection}>
          <Text style={styles.rightsSectionTitle}>Your Rights</Text>
          <Text style={styles.rightsText}>
            You have the right to:
          </Text>
          <View style={styles.rightsList}>
            <Text style={styles.rightsItem}>• Access your personal data</Text>
            <Text style={styles.rightsItem}>• Correct inaccurate information</Text>
            <Text style={styles.rightsItem}>• Request data deletion (subject to legal requirements)</Text>
            <Text style={styles.rightsItem}>• Object to certain data processing</Text>
            <Text style={styles.rightsItem}>• Data portability</Text>
          </View>
        </View>

        {/* Contact */}
        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>Questions or Concerns?</Text>
          <Text style={styles.contactText}>
            If you have questions about this Privacy Policy or our data practices, please
            contact us:
          </Text>
          <View style={styles.contactInfo}>
            <Text style={styles.contactDetail}>Email: privacy@bviaa.vg</Text>
            <Text style={styles.contactDetail}>Phone: +1 (284) 494-2181</Text>
            <Text style={styles.contactDetail}>
              Address: BVI Airports Authority{'\n'}
              Beef Island, British Virgin Islands
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By using the BVI FOP System, you acknowledge that you have read and understood
            this Privacy Policy.
          </Text>
          <Text style={styles.copyrightText}>
            © 2024 British Virgin Islands Airports Authority. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.sand,
  },
  headerButton: {
    padding: 8,
  },
  header: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#e0f2fe',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.atlantic,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.granite,
    textAlign: 'center',
    marginTop: 8,
  },
  lastUpdated: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 8,
  },
  introSection: {
    padding: 16,
    backgroundColor: '#fff',
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  introText: {
    fontSize: 14,
    color: COLORS.granite,
    lineHeight: 22,
  },
  section: {
    padding: 16,
    backgroundColor: '#fff',
    marginTop: 12,
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e0f7fa',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.atlantic,
    flex: 1,
  },
  sectionContent: {
    fontSize: 14,
    color: COLORS.granite,
    lineHeight: 22,
  },
  rightsSection: {
    padding: 16,
    backgroundColor: '#e0f2fe',
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  rightsSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.atlantic,
    marginBottom: 8,
  },
  rightsText: {
    fontSize: 14,
    color: COLORS.granite,
    marginBottom: 8,
  },
  rightsList: {
    gap: 4,
  },
  rightsItem: {
    fontSize: 14,
    color: COLORS.granite,
    lineHeight: 20,
  },
  contactSection: {
    padding: 16,
    backgroundColor: '#fff',
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.atlantic,
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    color: COLORS.granite,
    marginBottom: 12,
  },
  contactInfo: {
    backgroundColor: COLORS.sand,
    padding: 12,
    borderRadius: 8,
    gap: 4,
  },
  contactDetail: {
    fontSize: 14,
    color: COLORS.granite,
    lineHeight: 20,
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  copyrightText: {
    fontSize: 11,
    color: '#cbd5e1',
    textAlign: 'center',
  },
});
