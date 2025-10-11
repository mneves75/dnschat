/**
 * Settings Screen - Modal (Expo Router)
 *
 * Settings screen presented as a modal. This is a simplified version
 * adapted for Expo Router that imports the existing Settings component.
 *
 * CRITICAL: This is a placeholder that reuses the existing Settings component.
 * In Phase 4, this will be refactored to use new glass design system.
 *
 * @author DNSChat Team
 * @since 2.0.0 (Expo Router Migration)
 */

import React from 'react';
import { SettingsScreen } from '../../src/screens/SettingsScreen';

/**
 * Settings Modal Screen
 *
 * CRITICAL: Default export required for Expo Router.
 * This wraps the existing Settings component for now.
 *
 * TODO (Phase 4):
 * - Refactor Settings component to remove react-navigation dependencies
 * - Add glass design system components
 * - Add locale-aware text using i18n hook
 */
export default function SettingsModal() {
  return <SettingsScreen />;
}
