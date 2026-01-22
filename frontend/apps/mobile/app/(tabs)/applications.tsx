import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { FileText, Plus } from 'lucide-react-native';

export default function ApplicationsScreen() {
  const applications: unknown[] = [];

  return (
    <View style={styles.container}>
      {applications.length === 0 ? (
        <View style={styles.emptyState}>
          <FileText size={64} color="#94a3b8" />
          <Text style={styles.emptyTitle}>No applications yet</Text>
          <Text style={styles.emptySubtitle}>
            Create your first FOP application to get started
          </Text>
          <Link href="/application/new" asChild>
            <TouchableOpacity style={styles.createButton}>
              <Plus size={20} color="#fff" />
              <Text style={styles.createButtonText}>New Application</Text>
            </TouchableOpacity>
          </Link>
        </View>
      ) : (
        <FlatList
          data={applications}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.applicationItem}>
              {/* Application item would go here */}
            </View>
          )}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* FAB */}
      {applications.length > 0 && (
        <Link href="/application/new" asChild>
          <TouchableOpacity style={styles.fab}>
            <Plus size={24} color="#fff" />
          </TouchableOpacity>
        </Link>
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
  applicationItem: {
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
    marginBottom: 24,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0066e6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    gap: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0066e6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
});
