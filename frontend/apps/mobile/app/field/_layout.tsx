import { Stack } from 'expo-router';

// BVI Sovereign colors
const COLORS = {
  atlantic: '#002D56',
};

export default function FieldLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#F9FBFB' },
      }}
    >
      <Stack.Screen name="scan" />
      <Stack.Screen name="verify-result" />
      <Stack.Screen name="services/new" />
      <Stack.Screen name="services/history" />
    </Stack>
  );
}
