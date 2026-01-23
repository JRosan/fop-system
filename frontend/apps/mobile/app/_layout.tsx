import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// BVI Sovereign color tokens
const BVI_COLORS = {
  atlantic: '#002D56',
  turquoise: '#00A3B1',
  sand: '#F9FBFB',
};

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
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
    </SafeAreaProvider>
  );
}
