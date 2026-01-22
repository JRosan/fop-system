import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { X } from 'lucide-react-native';

const permitTypes = [
  {
    id: 'ONE_TIME',
    name: 'One-Time Permit',
    description: 'For a single flight operation',
    multiplier: '1.0x base fee',
  },
  {
    id: 'BLANKET',
    name: 'Blanket Permit',
    description: 'For multiple flights over a period',
    multiplier: '2.5x base fee',
  },
  {
    id: 'EMERGENCY',
    name: 'Emergency Permit',
    description: 'For urgent humanitarian or medical flights',
    multiplier: '0.5x base fee',
  },
];

export default function NewApplicationScreen() {
  const router = useRouter();

  const handleSelectType = (type: string) => {
    // Would navigate to next step with selected type
    console.log('Selected type:', type);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <X size={24} color="#64748b" />
        </TouchableOpacity>
        <Text style={styles.title}>New Application</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Select Permit Type</Text>
        <Text style={styles.sectionSubtitle}>
          Choose the type of permit you need
        </Text>

        <View style={styles.options}>
          {permitTypes.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={styles.option}
              onPress={() => handleSelectType(type.id)}
            >
              <View style={styles.optionContent}>
                <Text style={styles.optionName}>{type.name}</Text>
                <Text style={styles.optionDescription}>{type.description}</Text>
              </View>
              <Text style={styles.optionMultiplier}>{type.multiplier}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
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
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 8,
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
  },
});
