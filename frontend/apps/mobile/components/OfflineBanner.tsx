import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { WifiOff, RefreshCw, Cloud, CheckCircle } from 'lucide-react-native';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { useOfflineStore } from '../stores/offline';

interface OfflineBannerProps {
  /** Show expanded view with sync details */
  expanded?: boolean;
  /** Custom message when offline */
  offlineMessage?: string;
  /** Custom message when syncing */
  syncingMessage?: string;
}

export function OfflineBanner({
  expanded = false,
  offlineMessage = 'You are offline',
  syncingMessage = 'Syncing data...',
}: OfflineBannerProps) {
  const { isConnected, hasPendingSync, pendingCount, refresh } = useNetworkStatus();
  const { isSyncing, syncWithServer, lastSyncAt } = useOfflineStore();

  // Don't show if online and nothing to sync
  if (isConnected && !hasPendingSync && !isSyncing) {
    return null;
  }

  const handleSync = async () => {
    if (!isConnected || isSyncing) return;
    await syncWithServer();
  };

  const handleRefreshConnection = () => {
    refresh();
  };

  // Show syncing state
  if (isSyncing) {
    return (
      <View style={[styles.banner, styles.syncingBanner]}>
        <View style={styles.iconContainer}>
          <ActivityIndicator size="small" color="#fff" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.bannerText}>{syncingMessage}</Text>
          {pendingCount > 0 && (
            <Text style={styles.bannerSubtext}>
              {pendingCount} item{pendingCount !== 1 ? 's' : ''} remaining
            </Text>
          )}
        </View>
      </View>
    );
  }

  // Show offline state
  if (!isConnected) {
    return (
      <View style={[styles.banner, styles.offlineBanner, expanded && styles.expandedBanner]}>
        <View style={styles.iconContainer}>
          <WifiOff size={18} color="#fff" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.bannerText}>{offlineMessage}</Text>
          {hasPendingSync && (
            <Text style={styles.bannerSubtext}>
              {pendingCount} item{pendingCount !== 1 ? 's' : ''} waiting to sync
            </Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleRefreshConnection}
          activeOpacity={0.7}
        >
          <RefreshCw size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  }

  // Show pending sync state (online but has data to sync)
  if (hasPendingSync) {
    return (
      <View style={[styles.banner, styles.pendingBanner, expanded && styles.expandedBanner]}>
        <View style={styles.iconContainer}>
          <Cloud size={18} color="#fff" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.bannerText}>
            {pendingCount} item{pendingCount !== 1 ? 's' : ''} to sync
          </Text>
          {lastSyncAt && (
            <Text style={styles.bannerSubtext}>
              Last sync: {formatLastSync(lastSyncAt)}
            </Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.syncButton}
          onPress={handleSync}
          activeOpacity={0.7}
        >
          <Text style={styles.syncButtonText}>Sync Now</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return null;
}

// Compact version for use in headers
export function OfflineIndicator() {
  const { isConnected, hasPendingSync, pendingCount } = useNetworkStatus();
  const { isSyncing } = useOfflineStore();

  if (isConnected && !hasPendingSync && !isSyncing) {
    return null;
  }

  if (isSyncing) {
    return (
      <View style={styles.indicator}>
        <ActivityIndicator size="small" color="#00A3B1" />
      </View>
    );
  }

  if (!isConnected) {
    return (
      <View style={[styles.indicator, styles.indicatorOffline]}>
        <WifiOff size={14} color="#ef4444" />
      </View>
    );
  }

  if (hasPendingSync) {
    return (
      <View style={[styles.indicator, styles.indicatorPending]}>
        <Cloud size={14} color="#f59e0b" />
        <Text style={styles.indicatorCount}>{pendingCount}</Text>
      </View>
    );
  }

  return null;
}

// Success toast after sync
export function SyncSuccessToast({ visible, onHide }: { visible: boolean; onHide: () => void }) {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(2000),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => onHide());
    }
  }, [visible, fadeAnim, onHide]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.toast, { opacity: fadeAnim }]}>
      <CheckCircle size={18} color="#10b981" />
      <Text style={styles.toastText}>Data synced successfully</Text>
    </Animated.View>
  );
}

function formatLastSync(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  return date.toLocaleDateString();
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 12,
  },
  expandedBanner: {
    paddingVertical: 14,
  },
  offlineBanner: {
    backgroundColor: '#ef4444',
  },
  syncingBanner: {
    backgroundColor: '#00A3B1',
  },
  pendingBanner: {
    backgroundColor: '#f59e0b',
  },
  iconContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  bannerText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  bannerSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginTop: 2,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  syncButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  syncButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  indicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  indicatorOffline: {
    backgroundColor: '#fee2e2',
  },
  indicatorPending: {
    backgroundColor: '#fef3c7',
  },
  indicatorCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#f59e0b',
  },
  toast: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  toastText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#10b981',
  },
});

export default OfflineBanner;
