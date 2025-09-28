import { Redirect } from 'expo-router';

export default function LegacyDevLogsRedirect() {
  const isDev = typeof __DEV__ === 'boolean' ? __DEV__ : false;
  return <Redirect href={isDev ? '/dev-logs' : '/'} />;
}
