import { useEffect, useState, useCallback, useRef } from 'react';
import { AppState, AppStateStatus, Platform } from 'react-native';
import { useOfflineStore } from '../stores/offline';

export interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean;
  lastCheckedAt: Date | null;
}

interface UseNetworkStatusOptions {
  /** Interval in ms to check connectivity (default: 30000) */
  checkInterval?: number;
  /** Whether to auto-sync when connection is restored (default: true) */
  autoSyncOnReconnect?: boolean;
  /** Callback when connection is restored */
  onReconnect?: () => void;
  /** Callback when connection is lost */
  onDisconnect?: () => void;
}

const CHECK_URL = '/health'; // Lightweight health check endpoint

export function useNetworkStatus(options: UseNetworkStatusOptions = {}) {
  const {
    checkInterval = 30000,
    autoSyncOnReconnect = true,
    onReconnect,
    onDisconnect,
  } = options;

  const [status, setStatus] = useState<NetworkStatus>({
    isConnected: true,
    isInternetReachable: true,
    lastCheckedAt: null,
  });

  const previouslyConnected = useRef(true);
  const checkTimeoutRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { syncWithServer, pendingServiceLogs, pendingVerifications } = useOfflineStore();

  const checkConnectivity = useCallback(async (): Promise<boolean> => {
    try {
      // For web, use navigator.onLine as a quick check
      if (Platform.OS === 'web' && typeof navigator !== 'undefined') {
        if (!navigator.onLine) {
          return false;
        }
      }

      // Try to reach the API
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || ''}${CHECK_URL}`, {
        method: 'HEAD',
        signal: controller.signal,
      });

      clearTimeout(timeout);
      return response.ok;
    } catch {
      return false;
    }
  }, []);

  const performCheck = useCallback(async () => {
    const isReachable = await checkConnectivity();
    const wasConnected = previouslyConnected.current;

    setStatus({
      isConnected: isReachable,
      isInternetReachable: isReachable,
      lastCheckedAt: new Date(),
    });

    // Handle connection state changes
    if (!wasConnected && isReachable) {
      // Connection restored
      previouslyConnected.current = true;
      onReconnect?.();

      // Auto-sync if enabled and there's pending data
      if (autoSyncOnReconnect) {
        const hasPendingData =
          pendingServiceLogs.length > 0 || pendingVerifications.length > 0;
        if (hasPendingData) {
          console.log('[NetworkStatus] Connection restored, syncing pending data...');
          syncWithServer();
        }
      }
    } else if (wasConnected && !isReachable) {
      // Connection lost
      previouslyConnected.current = false;
      onDisconnect?.();
    }
  }, [
    checkConnectivity,
    autoSyncOnReconnect,
    pendingServiceLogs.length,
    pendingVerifications.length,
    syncWithServer,
    onReconnect,
    onDisconnect,
  ]);

  const refresh = useCallback(async () => {
    await performCheck();
  }, [performCheck]);

  // Set up periodic checking
  useEffect(() => {
    // Initial check
    performCheck();

    // Set up interval
    checkTimeoutRef.current = setInterval(performCheck, checkInterval);

    return () => {
      if (checkTimeoutRef.current) {
        clearInterval(checkTimeoutRef.current);
      }
    };
  }, [performCheck, checkInterval]);

  // Check on app state change (foreground/background)
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // App came to foreground, check connectivity
        performCheck();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [performCheck]);

  // Listen for online/offline events on web
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const handleOnline = () => {
        performCheck();
      };

      const handleOffline = () => {
        setStatus((prev) => ({
          ...prev,
          isConnected: false,
          isInternetReachable: false,
          lastCheckedAt: new Date(),
        }));
        previouslyConnected.current = false;
        onDisconnect?.();
      };

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, [performCheck, onDisconnect]);

  return {
    ...status,
    refresh,
    hasPendingSync: pendingServiceLogs.length > 0 || pendingVerifications.length > 0,
    pendingCount: pendingServiceLogs.length + pendingVerifications.length,
  };
}

export default useNetworkStatus;
