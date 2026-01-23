import { Stack } from 'expo-router';

export default function ServicesLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#F9FBFB' },
      }}
    >
      <Stack.Screen name="new" />
      <Stack.Screen name="history" />
    </Stack>
  );
}
