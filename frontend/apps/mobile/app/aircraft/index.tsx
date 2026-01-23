import { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useFocusEffect, Stack } from 'expo-router';
import {
  ArrowLeft,
  Plane,
  Plus,
  ChevronRight,
  AlertTriangle,
  Scale,
  Users,
  Calendar,
} from 'lucide-react-native';
import { useAircraftStore, useAuthStore, Aircraft } from '../../stores';

const categoryLabels: Record<string, string> = {
  FixedWing: 'Fixed Wing',
  Rotorcraft: 'Rotorcraft',
  Balloon: 'Balloon',
  Glider: 'Glider',
  Airship: 'Airship',
};

const categoryColors: Record<string, { bg: string; text: string }> = {
  FixedWing: { bg: '#e0f2fe', text: '#0066e6' },
  Rotorcraft: { bg: '#fef3c7', text: '#d97706' },
  Balloon: { bg: '#ede9fe', text: '#7c3aed' },
  Glider: { bg: '#d1fae5', text: '#059669' },
  Airship: { bg: '#fee2e2', text: '#dc2626' },
};

export default function AircraftListScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { aircraft, isLoading, error, fetchAircraft } = useAircraftStore();

  const operatorId = user?.operatorId;

  const loadAircraft = useCallback(async () => {
    if (operatorId) {
      await fetchAircraft(operatorId);
    }
  }, [operatorId, fetchAircraft]);

  useFocusEffect(
    useCallback(() => {
      loadAircraft();
    }, [loadAircraft])
  );

  const handleAircraftPress = (item: Aircraft) => {
    router.push(`/aircraft/${item.id}` as never);
  };

  const formatWeight = (mtow?: { value: number; unit: string }) => {
    if (!mtow) return 'N/A';
    const formatted = (mtow.value ?? 0).toLocaleString();
    const unit = mtow.unit === 'Kilograms' ? 'kg' : 'lbs';
    return `${formatted} ${unit}`;
  };

  const renderAircraftItem = ({ item }: { item: Aircraft }) => {
    const categoryColor = categoryColors[item.category] || categoryColors.FixedWing;

    return (
      <TouchableOpacity
        style={styles.aircraftCard}
        onPress={() => handleAircraftPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.registrationContainer}>
            <Text style={styles.registration}>{item.registrationMark}</Text>
            <View style={[styles.categoryBadge, { backgroundColor: categoryColor.bg }]}>
              <Text style={[styles.categoryText, { color: categoryColor.text }]}>
                {categoryLabels[item.category] || item.category}
              </Text>
            </View>
          </View>
          <ChevronRight size={20} color="#94a3b8" />
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.aircraftModel}>
            {item.manufacturer} {item.model}
          </Text>
          <Text style={styles.serialNumber}>S/N: {item.serialNumber}</Text>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.statItem}>
            <Scale size={14} color="#64748b" />
            <Text style={styles.statText}>{formatWeight(item.mtow)}</Text>
          </View>
          <View style={styles.statItem}>
            <Users size={14} color="#64748b" />
            <Text style={styles.statText}>{item.seatCount} seats</Text>
          </View>
          <View style={styles.statItem}>
            <Calendar size={14} color="#64748b" />
            <Text style={styles.statText}>{item.yearOfManufacture}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (!operatorId) {
    return (
      <>
        <Stack.Screen
          options={{
            title: 'Aircraft',
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
                <ArrowLeft size={24} color="#002D56" />
              </TouchableOpacity>
            ),
          }}
        />
        <View style={styles.emptyState}>
          <Plane size={48} color="#64748b" />
          <Text style={styles.emptyTitle}>No Operator Account</Text>
          <Text style={styles.emptySubtitle}>
            You need to be associated with an operator to manage aircraft
          </Text>
        </View>
      </>
    );
  }

  if (isLoading && aircraft.length === 0) {
    return (
      <>
        <Stack.Screen
          options={{
            title: 'Aircraft',
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
                <ArrowLeft size={24} color="#002D56" />
              </TouchableOpacity>
            ),
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#002D56" />
          <Text style={styles.loadingText}>Loading aircraft...</Text>
        </View>
      </>
    );
  }

  if (error && aircraft.length === 0) {
    return (
      <>
        <Stack.Screen
          options={{
            title: 'Aircraft',
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
                <ArrowLeft size={24} color="#002D56" />
              </TouchableOpacity>
            ),
          }}
        />
        <View style={styles.errorContainer}>
          <AlertTriangle size={48} color="#ef4444" />
          <Text style={styles.errorTitle}>Error</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadAircraft}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'My Aircraft',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
              <ArrowLeft size={24} color="#002D56" />
            </TouchableOpacity>
          ),
        }}
      />
      <View style={styles.container}>
        {aircraft.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Plane size={48} color="#002D56" />
            </View>
            <Text style={styles.emptyTitle}>No aircraft registered</Text>
            <Text style={styles.emptySubtitle}>
              Add your first aircraft to start applying for permits
            </Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push('/aircraft/new')}
            >
              <Plus size={20} color="#fff" />
              <Text style={styles.addButtonText}>Add Aircraft</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={aircraft}
            keyExtractor={(item) => item.id}
            renderItem={renderAircraftItem}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={isLoading}
                onRefresh={loadAircraft}
                colors={['#002D56']}
                tintColor="#002D56"
              />
            }
            ListHeaderComponent={
              <View style={styles.listHeader}>
                <Text style={styles.listHeaderText}>
                  {aircraft.length} aircraft registered
                </Text>
              </View>
            }
          />
        )}

        {/* FAB */}
        {aircraft.length > 0 && (
          <TouchableOpacity
            style={styles.fab}
            onPress={() => router.push('/aircraft/new')}
          >
            <Plus size={24} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FBFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FBFB',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748b',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FBFB',
    padding: 24,
  },
  errorTitle: {
    marginTop: 16,
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
  },
  errorText: {
    marginTop: 8,
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#002D56',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  headerButton: {
    padding: 8,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  listHeader: {
    marginBottom: 12,
  },
  listHeaderText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  aircraftCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  registrationContainer: {
    flex: 1,
  },
  registration: {
    fontSize: 20,
    fontWeight: '700',
    color: '#00A3B1',
    marginBottom: 6,
    letterSpacing: 1,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardBody: {
    marginBottom: 12,
  },
  aircraftModel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  serialNumber: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
    fontFamily: 'monospace',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    gap: 20,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 13,
    color: '#64748b',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#e0f2fe',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#002D56',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
    lineHeight: 20,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00A3B1',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    gap: 8,
  },
  addButtonText: {
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
    backgroundColor: '#00A3B1',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
});
