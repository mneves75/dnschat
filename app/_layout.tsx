import { Stack } from 'expo-router';
import AppProviders from '../src/theme/AppProviders';

export default function RootLayout() {
  return (
    <AppProviders>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
        }}
      />
    </AppProviders>
  );
}
