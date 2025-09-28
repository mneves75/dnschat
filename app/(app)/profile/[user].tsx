import { Stack } from 'expo-router';

import { Profile } from '../../../src/screens/Profile';

export default function ProfileScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Profile' }} />
      <Profile />
    </>
  );
}
