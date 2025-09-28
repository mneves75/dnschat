import { Redirect } from 'expo-router';

import { DevLogs } from '../../../src/screens/DevLogs';

export default function DevLogsTab() {
  if (typeof __DEV__ === 'boolean' && !__DEV__) {
    return <Redirect href="/(app)" />;
  }

  return <DevLogs />;
}
