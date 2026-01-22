import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Award } from 'lucide-react-native';

export default function PermitsScreen() {
  const permits: unknown[] = [];

  return (
    <View style={styles.container}>
      {permits.length === 0 ? (
        <View style={styles.emptyState}>
          <Award size={64} color="#94a3b8" />
          <Text style={styles.emptyTitle}>No permits yet</Text>
          <Text style={styles.emptySubtitle}>
            Approved applications will generate permits that appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={permits}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.permitItem}>
              {/* Permit item would go here */}
            </View>
          )}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  listContent: {
    padding: 16,
  },
  permitItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 24,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 8,
  },
});
