import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Button from '../components/ui/Button';
import AppProviders from '../theme/AppProviders';

describe('Button', () => {
  it('renders label and handles press', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <AppProviders>
        <Button label="Tap" onPress={onPress} testID="btn" />
      </AppProviders>,
    );

    const btn = getByTestId('btn');
    fireEvent.press(btn);
    expect(onPress).toHaveBeenCalled();
  });
});
