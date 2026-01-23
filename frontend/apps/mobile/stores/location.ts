import { create } from 'zustand';
import * as Location from 'expo-location';
import { storage } from '../services/storage';

export interface GeoCoordinate {
  latitude: number;
  longitude: number;
  altitude?: number | null;
  accuracy?: number | null;
  timestamp: number;
}

// BVI Airport coordinates for proximity detection
export const BVI_AIRPORTS = {
  TUPJ: { latitude: 18.4446, longitude: -64.5433, name: 'TB Lettsome International (Beef Island)' },
  TUPW: { latitude: 18.4504, longitude: -64.4267, name: 'Taddy Bay (Virgin Gorda)' },
  TUPY: { latitude: 18.7279, longitude: -64.3297, name: 'Auguste George (Anegada)' },
} as const;

interface LocationState {
  // Current location
  location: GeoCoordinate | null;
  isTracking: boolean;

  // Permissions
  permissionStatus: 'undetermined' | 'granted' | 'denied';

  // Nearest airport detection
  nearestAirport: keyof typeof BVI_AIRPORTS | null;
  distanceToNearestAirport: number | null;

  // Error state
  error: string | null;

  // Actions
  requestPermission: () => Promise<boolean>;
  getCurrentLocation: () => Promise<GeoCoordinate | null>;
  startTracking: () => Promise<() => void>;
  stopTracking: () => void;
  detectNearestAirport: (location: GeoCoordinate) => void;
  checkPermissionStatus: () => Promise<void>;
}

// Radius in meters for airport proximity detection
const AIRPORT_PROXIMITY_RADIUS = 5000; // 5km

export const useLocationStore = create<LocationState>((set, get) => ({
  location: null,
  isTracking: false,
  permissionStatus: 'undetermined',
  nearestAirport: null,
  distanceToNearestAirport: null,
  error: null,

  requestPermission: async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      const granted = status === 'granted';
      set({ permissionStatus: granted ? 'granted' : 'denied', error: null });
      return granted;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to request permission';
      set({ permissionStatus: 'denied', error: message });
      return false;
    }
  },

  getCurrentLocation: async () => {
    const { permissionStatus, requestPermission, detectNearestAirport } = get();

    // Request permission if needed
    if (permissionStatus !== 'granted') {
      const granted = await requestPermission();
      if (!granted) {
        set({ error: 'Location permission denied' });
        return null;
      }
    }

    try {
      set({ error: null });
      const result = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const location: GeoCoordinate = {
        latitude: result.coords.latitude,
        longitude: result.coords.longitude,
        altitude: result.coords.altitude,
        accuracy: result.coords.accuracy,
        timestamp: result.timestamp,
      };

      set({ location });
      detectNearestAirport(location);
      return location;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get location';
      set({ error: message });
      return null;
    }
  },

  startTracking: async () => {
    const { permissionStatus, requestPermission, detectNearestAirport } = get();

    // Request permission if needed
    if (permissionStatus !== 'granted') {
      const granted = await requestPermission();
      if (!granted) {
        set({ error: 'Location permission denied' });
        return () => {};
      }
    }

    try {
      set({ isTracking: true, error: null });

      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 10000, // Update every 10 seconds
          distanceInterval: 50, // Or when moved 50 meters
        },
        (result) => {
          const location: GeoCoordinate = {
            latitude: result.coords.latitude,
            longitude: result.coords.longitude,
            altitude: result.coords.altitude,
            accuracy: result.coords.accuracy,
            timestamp: result.timestamp,
          };

          set({ location });
          detectNearestAirport(location);
        }
      );

      // Return cleanup function
      return () => {
        subscription.remove();
        set({ isTracking: false });
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to start tracking';
      set({ error: message, isTracking: false });
      return () => {};
    }
  },

  stopTracking: () => {
    set({ isTracking: false });
  },

  detectNearestAirport: (location: GeoCoordinate) => {
    let nearest: keyof typeof BVI_AIRPORTS | null = null;
    let minDistance = Infinity;

    for (const [code, airport] of Object.entries(BVI_AIRPORTS) as [keyof typeof BVI_AIRPORTS, typeof BVI_AIRPORTS[keyof typeof BVI_AIRPORTS]][]) {
      const distance = calculateDistance(
        location.latitude,
        location.longitude,
        airport.latitude,
        airport.longitude
      );

      if (distance < minDistance) {
        minDistance = distance;
        nearest = code;
      }
    }

    // Only set as nearest if within proximity radius
    if (minDistance <= AIRPORT_PROXIMITY_RADIUS) {
      set({ nearestAirport: nearest, distanceToNearestAirport: minDistance });
    } else {
      set({ nearestAirport: null, distanceToNearestAirport: minDistance });
    }
  },

  checkPermissionStatus: async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      set({
        permissionStatus: status === 'granted' ? 'granted' : status === 'denied' ? 'denied' : 'undetermined',
      });
    } catch (error) {
      console.error('Failed to check permission status:', error);
    }
  },
}));

// Haversine formula to calculate distance between two coordinates in meters
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}
