import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { OfflineBanner } from '../components/OfflineBanner';
import { useOfflineStore } from '../stores/offline';
import { storage } from '../services/storage';

// BVI Sovereign color tokens
const BVI_COLORS = {
  atlantic: '#002D56',
  turquoise: '#00A3B1',
  sand: '#F9FBFB',
};

function RootLayoutContent() {
  const insets = useSafeAreaInsets();
  const { loadPersistedState, loadCachedData } = useOfflineStore();
  const [isStorageReady, setIsStorageReady] = useState(false);

  // Initialize storage and offline store on app start
  useEffect(() => {
    async function init() {
      await storage.waitForInit();
      loadPersistedState();
      loadCachedData();
      setIsStorageReady(true);
    }
    init();
  }, [loadPersistedState, loadCachedData]);

  // Show loading indicator while storage initializes
  if (!isStorageReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: BVI_COLORS.atlantic }}>
        <ActivityIndicator size="large" color={BVI_COLORS.turquoise} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, paddingTop: insets.top, backgroundColor: BVI_COLORS.atlantic }}>
      <OfflineBanner />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: BVI_COLORS.atlantic,
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      >
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="login"
          options={{
            headerShown: false,
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="register"
          options={{
            headerShown: false,
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="application/[id]"
          options={{
            title: 'Application Details',
          }}
        />
        <Stack.Screen
          name="application/new"
          options={{
            title: 'New Application',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="account/index"
          options={{
            title: 'Account & Invoices',
          }}
        />
        <Stack.Screen
          name="account/invoice/[id]"
          options={{
            title: 'Invoice Details',
          }}
        />
        <Stack.Screen
          name="aircraft/index"
          options={{
            title: 'My Aircraft',
          }}
        />
        <Stack.Screen
          name="aircraft/[id]"
          options={{
            title: 'Aircraft Details',
          }}
        />
        <Stack.Screen
          name="aircraft/new"
          options={{
            title: 'Register Aircraft',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="permit/[id]"
          options={{
            title: 'Permit Details',
          }}
        />
        <Stack.Screen
          name="help"
          options={{
            title: 'Help & Support',
          }}
        />
        <Stack.Screen
          name="privacy"
          options={{
            title: 'Privacy Policy',
          }}
        />
        <Stack.Screen
          name="subscription"
          options={{
            title: 'Subscription',
          }}
        />
        <Stack.Screen
          name="notifications"
          options={{
            title: 'Notification Settings',
          }}
        />
      </Stack>
    </View>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <RootLayoutContent />
    </SafeAreaProvider>
  );
}
