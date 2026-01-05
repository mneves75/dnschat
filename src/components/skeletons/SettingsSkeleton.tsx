/**
 * SettingsSkeleton - Loading skeleton for settings list
 *
 * Matches the GlassSettings section layout with shimmer animation.
 *
 * @see GlassSettings.tsx for the actual component layout
 */

import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { SkeletonBox, SkeletonCard } from './SkeletonBase';
import { LiquidGlassSpacing } from '../../ui/theme/liquidGlassSpacing';
import { useImessagePalette } from '../../ui/theme/imessagePalette';

interface SettingsSkeletonProps {
  /**
   * Number of sections to show
   * @default 3
   */
  sections?: number;

  /**
   * Items per section
   * @default 3
   */
  itemsPerSection?: number;
}

function SettingsItemSkeleton({ delay = 0 }: { delay?: number }) {
  return (
    <View style={styles.item}>
      <View style={styles.itemContent}>
        <SkeletonBox width="50%" height={17} delay={delay} />
        <SkeletonBox width="30%" height={15} delay={delay + 50} style={styles.subtitle} />
      </View>
      <SkeletonBox width={10} height={18} delay={delay + 25} />
    </View>
  );
}

function SettingsSectionSkeleton({
  itemCount = 3,
  delay = 0,
}: {
  itemCount?: number;
  delay?: number;
}) {
  const palette = useImessagePalette();

  return (
    <View style={styles.section}>
      {/* Section header */}
      <SkeletonBox
        width={120}
        height={13}
        delay={delay}
        style={styles.sectionHeader}
      />

      {/* Section items */}
      <View
        style={[
          styles.sectionContent,
          { backgroundColor: Platform.OS === 'android' ? palette.solid : palette.surface },
        ]}
      >
        {Array.from({ length: itemCount }).map((_, index) => (
          <React.Fragment key={index}>
            <SettingsItemSkeleton delay={delay + (index + 1) * 75} />
            {index < itemCount - 1 && (
              <View style={[styles.divider, { backgroundColor: palette.divider }]} />
            )}
          </React.Fragment>
        ))}
      </View>

      {/* Section footer */}
      <SkeletonBox
        width="80%"
        height={12}
        delay={delay + (itemCount + 1) * 75}
        style={styles.sectionFooter}
      />
    </View>
  );
}

export function SettingsSkeleton({
  sections = 3,
  itemsPerSection = 3,
}: SettingsSkeletonProps) {
  return (
    <View style={styles.container} testID="settings-skeleton">
      {Array.from({ length: sections }).map((_, index) => (
        <SettingsSectionSkeleton
          key={index}
          itemCount={itemsPerSection}
          delay={index * 200}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: LiquidGlassSpacing.md,
  },
  section: {
    marginBottom: LiquidGlassSpacing.xl,
  },
  sectionHeader: {
    marginHorizontal: LiquidGlassSpacing.lg,
    marginBottom: LiquidGlassSpacing.sm,
  },
  sectionContent: {
    marginHorizontal: LiquidGlassSpacing.lg,
    borderRadius: 12,
    // iOS shadows
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    // Android elevation
    elevation: 2,
  },
  sectionFooter: {
    marginHorizontal: LiquidGlassSpacing.lg,
    marginTop: LiquidGlassSpacing.sm,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: LiquidGlassSpacing.md,
    paddingVertical: LiquidGlassSpacing.sm + 4,
  },
  itemContent: {
    flex: 1,
  },
  subtitle: {
    marginTop: 4,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: LiquidGlassSpacing.md,
  },
});

export default SettingsSkeleton;
