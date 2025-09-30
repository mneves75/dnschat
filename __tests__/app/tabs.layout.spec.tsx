import React from 'react';
import type { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import type { NavigationState } from '@react-navigation/native';

import { buildGlassTabs } from '../../app/(app)/(tabs)/tabHelpers';

// Minimal TabBar descriptor shape used by React Navigation
interface Descriptor {
  options: BottomTabNavigationOptions & { href?: string | null };
}

describe('buildGlassTabs', () => {
  it('filters hidden routes and falls back to label initials when no icon is provided', () => {
    const state = {
      index: 1,
      key: 'test-key',
      routeNames: ['index', 'logs', 'dev-logs'],
      history: [],
      stale: false,
      type: 'tab',
      routes: [
        { key: 'route-0', name: 'index' },
        { key: 'route-1', name: 'logs' },
        { key: 'route-2', name: 'dev-logs' },
      ],
      preloadedRouteKeys: [],
    } as unknown as NavigationState;

    const descriptors: Record<string, Descriptor> = {
      'route-0': {
        options: {
          title: 'Chats',
          tabBarIcon: jest.fn(() => 'C'),
        },
      },
      'route-1': {
        options: {
          title: 'Logs',
        },
      },
      'route-2': {
        options: {
          title: 'Dev Logs',
          href: null, // hidden in tab bar
        },
      },
    };

    const { tabs, activeRouteKey } = buildGlassTabs(
      state as any,
      descriptors as any,
      state.index,
      '#00AACC',
      '#777777',
    );

    expect(activeRouteKey).toBe('route-1');
    expect(tabs).toHaveLength(2);

    expect(tabs[0]).toMatchObject({ id: 'route-0', title: 'Chats' });
    expect(tabs[1]).toMatchObject({ id: 'route-1', title: 'Logs', icon: 'L' });
  });
});
