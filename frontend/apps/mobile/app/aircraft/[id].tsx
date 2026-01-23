import { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import {
  ArrowLeft,
  Plane,
  Scale,
  Users,
  Calendar,
  Hash,
  Building2,
  Volume2,
  Edit3,
  Trash2,
} from 'lucide-react-native';
import { useAircraftStore } from '../../stores';

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

export default function AircraftDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { currentAircraft, isLoading, error, fetchAircraftById, clearCurrentAircraft } = useAircraftStore();

  useEffect(() => {
    if (id) {
      fetchAircraftById(id);
    }
    return () => clearCurrentAircraft();
  }, [id]);

  const handleRefresh = () => {
    if (id) {
      fetchAircraftById(id);
    }
  };

  const handleEdit = () => {
    Alert.alert(
      'Edit Aircraft',
      'Aircraft editing coming soon. Contact support for changes.',
      [{ text: 'OK' }]
    );
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Aircraft',
      'Are you sure you want to remove this aircraft? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Info', 'Please contact support to remove aircraft from your fleet.');
          },
        },
      ]
    );
  };

  const formatWeight = (mtow: { value: number; unit: string }) => {
    const formatted = mtow.value.toLocaleString();
    const unit = mtow.unit === 'Kilograms' ? 'kg' : 'lbs';
    return `${formatted} ${unit}`;
  };

  if (isLoading && !currentAircraft) {
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

  if (error || !currentAircraft) {
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
          <Plane size={48} color="#64748b" />
          <Text style={styles.errorTitle}>Error</Text>
          <Text style={styles.errorText}>{error || 'Aircraft not found'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  }

  const categoryColor = categoryColors[currentAircraft.category] || categoryColors.FixedWing;

  return (
    <>
      <Stack.Screen
        options={{
          title: currentAircraft.registrationMark,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
              <ArrowLeft size={24} color="#002D56" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={handleEdit} style={styles.headerButton}>
              <Edit3 size={24} color="#002D56" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
        }
      >
        {/* Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.planeIconContainer}>
            <Plane size={40} color="#00A3B1" />
          </View>
          <Text style={styles.registration}>{currentAircraft.registrationMark}</Text>
          <Text style={styles.aircraftModel}>
            {currentAircraft.manufacturer} {currentAircraft.model}
          </Text>
          <View style={[styles.categoryBadge, { backgroundColor: categoryColor.bg }]}>
            <Text style={[styles.categoryText, { color: categoryColor.text }]}>
              {categoryLabels[currentAircraft.category] || currentAircraft.category}
            </Text>
          </View>
        </View>

        {/* Specifications */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Specifications</Text>

          <View style={styles.specRow}>
            <View style={styles.specItem}>
              <Scale size={20} color="#002D56" />
              <View style={styles.specContent}>
                <Text style={styles.specLabel}>MTOW</Text>
                <Text style={styles.specValue}>{formatWeight(currentAircraft.mtow)}</Text>
              </View>
            </View>
            <View style={styles.specItem}>
              <Users size={20} color="#002D56" />
              <View style={styles.specContent}>
                <Text style={styles.specLabel}>Seat Capacity</Text>
                <Text style={styles.specValue}>{currentAircraft.seatCount} seats</Text>
              </View>
            </View>
          </View>

          <View style={styles.specRow}>
            <View style={styles.specItem}>
              <Calendar size={20} color="#002D56" />
              <View style={styles.specContent}>
                <Text style={styles.specLabel}>Year of Manufacture</Text>
                <Text style={styles.specValue}>{currentAircraft.yearOfManufacture}</Text>
              </View>
            </View>
            <View style={styles.specItem}>
              <Hash size={20} color="#002D56" />
              <View style={styles.specContent}>
                <Text style={styles.specLabel}>Serial Number</Text>
                <Text style={[styles.specValue, styles.monoText]}>{currentAircraft.serialNumber}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Manufacturer Details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Manufacturer Details</Text>

          <View style={styles.detailRow}>
            <Building2 size={18} color="#64748b" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Manufacturer</Text>
              <Text style={styles.detailValue}>{currentAircraft.manufacturer}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Plane size={18} color="#64748b" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Model</Text>
              <Text style={styles.detailValue}>{currentAircraft.model}</Text>
            </View>
          </View>

          {currentAircraft.noiseCategory && (
            <View style={styles.detailRow}>
              <Volume2 size={18} color="#64748b" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Noise Category</Text>
                <Text style={styles.detailValue}>{currentAircraft.noiseCategory}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Timestamps */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Record Information</Text>

          <View style={styles.timestampRow}>
            <Text style={styles.timestampLabel}>Added</Text>
            <Text style={styles.timestampValue}>
              {new Date(currentAircraft.createdAt).toLocaleDateString()}
            </Text>
          </View>

          <View style={styles.timestampRow}>
            <Text style={styles.timestampLabel}>Last Updated</Text>
            <Text style={styles.timestampValue}>
              {new Date(currentAircraft.updatedAt).toLocaleDateString()}
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
            <Edit3 size={20} color="#002D56" />
            <Text style={styles.editButtonText}>Edit Aircraft</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Trash2 size={20} color="#ef4444" />
            <Text style={styles.deleteButtonText}>Remove Aircraft</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
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
  heroCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 2,
    borderColor: '#00A3B1',
  },
  planeIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e0f7fa',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  registration: {
    fontSize: 28,
    fontWeight: '700',
    color: '#00A3B1',
    letterSpacing: 2,
  },
  aircraftModel: {
    fontSize: 18,
    fontWeight: '500',
    color: '#1e293b',
    marginTop: 8,
  },
  categoryBadge: {
    marginTop: 12,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#002D56',
    marginBottom: 16,
  },
  specRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  specItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  specContent: {
    flex: 1,
  },
  specLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 2,
  },
  specValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  monoText: {
    fontFamily: 'monospace',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1e293b',
  },
  timestampRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  timestampLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  timestampValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
  },
  actionsContainer: {
    padding: 16,
    gap: 12,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#002D56',
  },
  editButtonText: {
    color: '#002D56',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fee2e2',
  },
  deleteButtonText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 40,
  },
});
