/**
 * LogsSkeleton - Loading skeleton for logs list
 *
 * Matches the Logs screen log card layout with shimmer animation.
 *
 * @see Logs.tsx for the actual component layout
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SkeletonBox, SkeletonCard } from './SkeletonBase';
import { LiquidGlassSpacing } from '../../ui/theme/liquidGlassSpacing';

interface LogsSkeletonProps {
  /**
   * Number of skeleton items to show
   * @default 5
   */
  count?: number;
}

function LogItemSkeleton({ delay = 0 }: { delay?: number }) {
  return (
    <SkeletonCard delay={delay} style={styles.logCard}>
      <View style={styles.logHeader}>
        <View style={styles.logHeaderLeft}>
          {/* Query text */}
          <SkeletonBox
            width="80%"
            height={16}
            delay={delay + 50}
            style={styles.queryText}
          />

          {/* Meta row: timestamp, method badge, duration */}
          <View style={styles.logMeta}>
            <SkeletonBox width={60} height={14} delay={delay + 100} />
            <SkeletonBox
              width={50}
              height={20}
              borderRadius={10}
              delay={delay + 125}
            />
            <SkeletonBox width={40} height={14} delay={delay + 150} />
          </View>
        </View>

        {/* Status indicator */}
        <SkeletonBox
          width={32}
          height={32}
          borderRadius={16}
          delay={delay + 75}
        />
      </View>
    </SkeletonCard>
  );
}

export function LogsSkeleton({ count = 5 }: LogsSkeletonProps) {
  return (
    <View style={styles.container} testID="logs-skeleton">
      {Array.from({ length: count }).map((_, index) => (
        <LogItemSkeleton key={index} delay={index * 100} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  logCard: {
    marginVertical: 4,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  logHeaderLeft: {
    flex: 1,
    marginRight: 12,
  },
  queryText: {
    marginBottom: LiquidGlassSpacing.sm,
  },
  logMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});

export default LogsSkeleton;
