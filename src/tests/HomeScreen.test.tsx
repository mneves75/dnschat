import React from 'react';
import { render, screen } from '@testing-library/react-native';
import AppProviders from '../theme/AppProviders';
import HomeScreen from '../../app/(tabs)/index';

describe('HomeScreen', () => {
  it('shows header and list', () => {
    render(
      <AppProviders>
        <HomeScreen />
      </AppProviders>,
    );
    expect(screen.getByText('Home')).toBeTruthy();
    expect(screen.getByText('Item 1')).toBeTruthy();
  });
});
