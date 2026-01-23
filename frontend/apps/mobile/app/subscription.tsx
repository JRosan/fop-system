import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import {
  ArrowLeft,
  CreditCard,
  Check,
  Crown,
  Building2,
  Plane,
  Users,
  Star,
  Zap,
  Shield,
  Mail,
} from 'lucide-react-native';
import { useAuthStore } from '../stores';

// BVI Sovereign colors
const COLORS = {
  atlantic: '#002D56',
  turquoise: '#00A3B1',
  sand: '#F9FBFB',
  granite: '#4A5568',
  gold: '#C5A059',
};

const plans = [
  {
    id: 'basic',
    name: 'Basic',
    price: 'Free',
    period: '',
    description: 'For individual operators with occasional flights',
    features: [
      'Up to 2 aircraft',
      'One-time permit applications',
      'Email support',
      'Mobile app access',
      'Basic reporting',
    ],
    icon: Plane,
    color: '#64748b',
    bgColor: '#f1f5f9',
    recommended: false,
  },
  {
    id: 'professional',
    name: 'Professional',
    price: '$99',
    period: '/month',
    description: 'For growing operators with regular operations',
    features: [
      'Up to 10 aircraft',
      'All permit types',
      'Priority processing',
      'Phone & email support',
      'Advanced analytics',
      'Bulk applications',
      'API access',
    ],
    icon: Building2,
    color: COLORS.turquoise,
    bgColor: '#e0f7fa',
    recommended: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For large fleet operators and airlines',
    features: [
      'Unlimited aircraft',
      'Dedicated account manager',
      '24/7 priority support',
      'Custom integrations',
      'SLA guarantees',
      'Multi-user access',
      'White-label options',
      'Compliance automation',
    ],
    icon: Crown,
    color: COLORS.gold,
    bgColor: '#fef3c7',
    recommended: false,
  },
];

export default function SubscriptionScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  const currentPlan = 'basic'; // This would come from user data in a real implementation

  const handleSelectPlan = (planId: string) => {
    if (planId === 'enterprise') {
      Linking.openURL('mailto:sales@bviaa.vg?subject=Enterprise%20Plan%20Inquiry');
    } else if (planId !== currentPlan) {
      Linking.openURL('mailto:billing@bviaa.vg?subject=Subscription%20Change%20Request');
    }
  };

  const handleContactSales = () => {
    Linking.openURL('mailto:sales@bviaa.vg?subject=BVI%20FOP%20Subscription%20Inquiry');
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Subscription',
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
            <CreditCard size={32} color={COLORS.atlantic} />
          </View>
          <Text style={styles.headerTitle}>Choose Your Plan</Text>
          <Text style={styles.headerSubtitle}>
            Select the plan that best fits your operation needs
          </Text>
        </View>

        {/* Current Plan Banner */}
        {isAuthenticated && (
          <View style={styles.currentPlanBanner}>
            <View style={styles.currentPlanLeft}>
              <Star size={20} color={COLORS.gold} />
              <View>
                <Text style={styles.currentPlanLabel}>Current Plan</Text>
                <Text style={styles.currentPlanName}>
                  {plans.find((p) => p.id === currentPlan)?.name || 'Basic'}
                </Text>
              </View>
            </View>
            <View style={styles.currentPlanBadge}>
              <Text style={styles.currentPlanBadgeText}>Active</Text>
            </View>
          </View>
        )}

        {/* Plans */}
        <View style={styles.plansContainer}>
          {plans.map((plan) => {
            const isCurrentPlan = plan.id === currentPlan;
            const Icon = plan.icon;

            return (
              <View
                key={plan.id}
                style={[
                  styles.planCard,
                  plan.recommended && styles.planCardRecommended,
                  isCurrentPlan && styles.planCardCurrent,
                ]}
              >
                {plan.recommended && (
                  <View style={styles.recommendedBadge}>
                    <Zap size={12} color="#fff" />
                    <Text style={styles.recommendedText}>Recommended</Text>
                  </View>
                )}

                <View style={styles.planHeader}>
                  <View style={[styles.planIcon, { backgroundColor: plan.bgColor }]}>
                    <Icon size={24} color={plan.color} />
                  </View>
                  <View style={styles.planTitleContainer}>
                    <Text style={styles.planName}>{plan.name}</Text>
                    <View style={styles.priceContainer}>
                      <Text style={styles.planPrice}>{plan.price}</Text>
                      {plan.period && <Text style={styles.planPeriod}>{plan.period}</Text>}
                    </View>
                  </View>
                </View>

                <Text style={styles.planDescription}>{plan.description}</Text>

                <View style={styles.featuresContainer}>
                  {plan.features.map((feature, index) => (
                    <View key={index} style={styles.featureRow}>
                      <Check size={16} color={COLORS.turquoise} />
                      <Text style={styles.featureText}>{feature}</Text>
                    </View>
                  ))}
                </View>

                <TouchableOpacity
                  style={[
                    styles.selectButton,
                    isCurrentPlan && styles.selectButtonCurrent,
                    plan.recommended && !isCurrentPlan && styles.selectButtonRecommended,
                  ]}
                  onPress={() => handleSelectPlan(plan.id)}
                  disabled={isCurrentPlan}
                >
                  <Text
                    style={[
                      styles.selectButtonText,
                      isCurrentPlan && styles.selectButtonTextCurrent,
                      plan.recommended && !isCurrentPlan && styles.selectButtonTextRecommended,
                    ]}
                  >
                    {isCurrentPlan
                      ? 'Current Plan'
                      : plan.id === 'enterprise'
                      ? 'Contact Sales'
                      : 'Select Plan'}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        {/* Benefits Section */}
        <View style={styles.benefitsSection}>
          <Text style={styles.benefitsTitle}>All Plans Include</Text>
          <View style={styles.benefitsGrid}>
            <View style={styles.benefitItem}>
              <Shield size={20} color={COLORS.atlantic} />
              <Text style={styles.benefitText}>Secure Data</Text>
            </View>
            <View style={styles.benefitItem}>
              <Users size={20} color={COLORS.atlantic} />
              <Text style={styles.benefitText}>Compliance</Text>
            </View>
            <View style={styles.benefitItem}>
              <Plane size={20} color={COLORS.atlantic} />
              <Text style={styles.benefitText}>QR Permits</Text>
            </View>
            <View style={styles.benefitItem}>
              <Zap size={20} color={COLORS.atlantic} />
              <Text style={styles.benefitText}>Fast Processing</Text>
            </View>
          </View>
        </View>

        {/* Contact Section */}
        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>Need Help Choosing?</Text>
          <Text style={styles.contactText}>
            Our team can help you find the right plan for your operation.
          </Text>
          <TouchableOpacity style={styles.contactButton} onPress={handleContactSales}>
            <Mail size={18} color="#fff" />
            <Text style={styles.contactButtonText}>Contact Sales Team</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Prices shown in USD. Plans can be changed or cancelled at any time. Enterprise
            pricing is customized based on your requirements.
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
  currentPlanBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fef3c7',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  currentPlanLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  currentPlanLabel: {
    fontSize: 12,
    color: COLORS.granite,
  },
  currentPlanName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.atlantic,
  },
  currentPlanBadge: {
    backgroundColor: COLORS.turquoise,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  currentPlanBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  plansContainer: {
    padding: 16,
    gap: 16,
  },
  planCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 2,
    borderColor: '#f1f5f9',
  },
  planCardRecommended: {
    borderColor: COLORS.turquoise,
  },
  planCardCurrent: {
    borderColor: COLORS.gold,
    backgroundColor: '#fffbeb',
  },
  recommendedBadge: {
    position: 'absolute',
    top: -12,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.turquoise,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  recommendedText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  planIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  planTitleContainer: {
    flex: 1,
  },
  planName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.atlantic,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 2,
  },
  planPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.atlantic,
  },
  planPeriod: {
    fontSize: 14,
    color: COLORS.granite,
    marginLeft: 2,
  },
  planDescription: {
    fontSize: 14,
    color: COLORS.granite,
    marginBottom: 16,
    lineHeight: 20,
  },
  featuresContainer: {
    gap: 10,
    marginBottom: 20,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureText: {
    fontSize: 14,
    color: '#1e293b',
    flex: 1,
  },
  selectButton: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  selectButtonCurrent: {
    backgroundColor: '#fef3c7',
  },
  selectButtonRecommended: {
    backgroundColor: COLORS.turquoise,
  },
  selectButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.atlantic,
  },
  selectButtonTextCurrent: {
    color: COLORS.gold,
  },
  selectButtonTextRecommended: {
    color: '#fff',
  },
  benefitsSection: {
    padding: 16,
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.atlantic,
    marginBottom: 16,
    textAlign: 'center',
  },
  benefitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  benefitItem: {
    alignItems: 'center',
    width: '45%',
    paddingVertical: 12,
    gap: 8,
  },
  benefitText: {
    fontSize: 13,
    color: COLORS.granite,
    fontWeight: '500',
  },
  contactSection: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#e0f2fe',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.atlantic,
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    color: COLORS.granite,
    textAlign: 'center',
    marginBottom: 16,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.atlantic,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  contactButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
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
