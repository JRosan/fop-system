import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import {
  ArrowLeft,
  HelpCircle,
  Mail,
  Phone,
  Globe,
  FileText,
  MessageCircle,
  ChevronRight,
  Clock,
  MapPin,
} from 'lucide-react-native';

// BVI Sovereign colors
const COLORS = {
  atlantic: '#002D56',
  turquoise: '#00A3B1',
  sand: '#F9FBFB',
  granite: '#4A5568',
  gold: '#C5A059',
};

const faqs = [
  {
    question: 'How long does permit approval take?',
    answer:
      'Standard permits are typically processed within 3-5 business days. Emergency permits may be expedited within 24-48 hours for urgent humanitarian or medical flights.',
  },
  {
    question: 'What documents are required for an application?',
    answer:
      'You will need: Certificate of Airworthiness, Certificate of Registration, Insurance Certificate (with BVI coverage), Air Operator Certificate, and Crew Licenses.',
  },
  {
    question: 'How do I pay for my permit?',
    answer:
      'Payments can be made via bank transfer or credit card. Invoice details are provided upon application approval. Contact our office for wire transfer instructions.',
  },
  {
    question: 'Can I modify an approved permit?',
    answer:
      'Minor modifications (dates, times) can be requested through the app. Significant changes may require a new application. Contact support for guidance.',
  },
  {
    question: 'What happens if my permit expires?',
    answer:
      'Expired permits cannot be used. You will need to submit a new application. We recommend applying for renewal at least 14 days before expiration.',
  },
];

export default function HelpScreen() {
  const router = useRouter();

  const handleContact = (type: 'email' | 'phone' | 'web') => {
    switch (type) {
      case 'email':
        Linking.openURL('mailto:fop@bviaa.vg?subject=FOP%20System%20Support');
        break;
      case 'phone':
        Linking.openURL('tel:+12844942181');
        break;
      case 'web':
        Linking.openURL('https://bviaa.vg');
        break;
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Help & Support',
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
            <HelpCircle size={32} color={COLORS.atlantic} />
          </View>
          <Text style={styles.headerTitle}>How can we help?</Text>
          <Text style={styles.headerSubtitle}>
            Find answers to common questions or contact our support team
          </Text>
        </View>

        {/* Contact Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <View style={styles.contactCard}>
            <TouchableOpacity
              style={styles.contactItem}
              onPress={() => handleContact('email')}
            >
              <View style={[styles.contactIcon, { backgroundColor: '#e0f2fe' }]}>
                <Mail size={20} color={COLORS.atlantic} />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>Email Support</Text>
                <Text style={styles.contactValue}>fop@bviaa.vg</Text>
              </View>
              <ChevronRight size={20} color="#94a3b8" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.contactItem}
              onPress={() => handleContact('phone')}
            >
              <View style={[styles.contactIcon, { backgroundColor: '#d1fae5' }]}>
                <Phone size={20} color="#059669" />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>Phone</Text>
                <Text style={styles.contactValue}>+1 (284) 494-2181</Text>
              </View>
              <ChevronRight size={20} color="#94a3b8" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.contactItem, styles.contactItemLast]}
              onPress={() => handleContact('web')}
            >
              <View style={[styles.contactIcon, { backgroundColor: '#fef3c7' }]}>
                <Globe size={20} color="#d97706" />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>Website</Text>
                <Text style={styles.contactValue}>bviaa.vg</Text>
              </View>
              <ChevronRight size={20} color="#94a3b8" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Office Hours */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Office Information</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Clock size={18} color={COLORS.granite} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Office Hours</Text>
                <Text style={styles.infoValue}>Monday - Friday: 8:00 AM - 4:30 PM</Text>
                <Text style={styles.infoSubvalue}>Atlantic Standard Time (AST)</Text>
              </View>
            </View>
            <View style={[styles.infoRow, styles.infoRowLast]}>
              <MapPin size={18} color={COLORS.granite} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Address</Text>
                <Text style={styles.infoValue}>BVI Airports Authority</Text>
                <Text style={styles.infoSubvalue}>
                  Terrance B. Lettsome International Airport{'\n'}
                  Beef Island, British Virgin Islands
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* FAQs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          <View style={styles.faqCard}>
            {faqs.map((faq, index) => (
              <View
                key={index}
                style={[styles.faqItem, index === faqs.length - 1 && styles.faqItemLast]}
              >
                <View style={styles.faqQuestion}>
                  <MessageCircle size={16} color={COLORS.turquoise} />
                  <Text style={styles.faqQuestionText}>{faq.question}</Text>
                </View>
                <Text style={styles.faqAnswer}>{faq.answer}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Resources */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resources</Text>
          <View style={styles.resourceCard}>
            <TouchableOpacity style={styles.resourceItem}>
              <FileText size={20} color={COLORS.atlantic} />
              <Text style={styles.resourceText}>FOP Regulations Guide</Text>
              <ChevronRight size={18} color="#94a3b8" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.resourceItem, styles.resourceItemLast]}>
              <FileText size={20} color={COLORS.atlantic} />
              <Text style={styles.resourceText}>Fee Schedule (2024)</Text>
              <ChevronRight size={18} color="#94a3b8" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            For urgent matters outside office hours, please contact the Airport Operations
            Center at +1 (284) 495-2181.
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
    lineHeight: 20,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.atlantic,
    marginBottom: 12,
  },
  contactCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  contactItemLast: {
    borderBottomWidth: 0,
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactInfo: {
    flex: 1,
    marginLeft: 12,
  },
  contactLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  contactValue: {
    fontSize: 13,
    color: COLORS.granite,
    marginTop: 2,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  infoRow: {
    flexDirection: 'row',
    paddingBottom: 16,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  infoRowLast: {
    borderBottomWidth: 0,
    marginBottom: 0,
    paddingBottom: 0,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  infoValue: {
    fontSize: 14,
    color: COLORS.granite,
    marginTop: 4,
  },
  infoSubvalue: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  faqCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  faqItem: {
    paddingBottom: 16,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  faqItemLast: {
    borderBottomWidth: 0,
    marginBottom: 0,
    paddingBottom: 0,
  },
  faqQuestion: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  faqQuestionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    lineHeight: 20,
  },
  faqAnswer: {
    fontSize: 14,
    color: COLORS.granite,
    lineHeight: 20,
    marginLeft: 24,
  },
  resourceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    gap: 12,
  },
  resourceItemLast: {
    borderBottomWidth: 0,
  },
  resourceText: {
    flex: 1,
    fontSize: 15,
    color: '#1e293b',
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
  },
});
